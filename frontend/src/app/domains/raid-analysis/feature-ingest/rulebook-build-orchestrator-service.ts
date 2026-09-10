// Orchestration only; every derivation lives in data/rulebook-build.
import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../data/wcl/wcl-api-service';
import { DataFileApiService } from '../data/data-files/data-file-api-service';
import { SpecMetaService } from '../data/data-files/spec-meta-service';
import type { SpecMeta } from '../data/data-files/spec-meta.models';
import { CurrentRaidsService } from '../data/ingest/current-raids-service';
import { IngestRunSummaryService, type IngestRunSummary } from '../data/ingest/ingest-run-summary-service';
import type { IngestEncounter } from '../data/ingest/ingest.models';
import { SimcDataService, type SimcTier } from '../data/http/simc-data-service';
import { TalentDataService } from '../data/http/talent-data-service';
import { ParseSampleService } from '../data/rulebook-build/parse-sample-service';
import { RulebookBuildService } from '../data/rulebook-build/rulebook-build-service';
import { LoggerService } from '../../shared/util-logging/logger-service';

const POINTS_MARGIN = 500;

interface RulebookRunParams {
  specs: string[];
  tier: SimcTier;
  raidNames: string[];
}

@Injectable({ providedIn: 'root' })
export class RulebookBuildOrchestratorService {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFile = inject(DataFileApiService);
  private readonly specMeta = inject(SpecMetaService);
  private readonly currentRaids = inject(CurrentRaidsService);
  private readonly summary = inject(IngestRunSummaryService);
  private readonly simc = inject(SimcDataService);
  private readonly talents = inject(TalentDataService);
  private readonly samples = inject(ParseSampleService);
  private readonly builder = inject(RulebookBuildService);
  private readonly logger = inject(LoggerService);

  /** Never rejects: the fire-and-forget app initializer must not see an unhandled rejection. */
  async run(): Promise<void> {
    try {
      await this.buildAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('\nFatal error:', message);
      this.summary.publish({ succeeded: [], failed: [], budgetStopped: false, fatal: message });
    }
  }

  private params(): RulebookRunParams {
    const search = new URLSearchParams(globalThis.location.search);
    const specs = (search.get('specs') ?? '').split(',').map(spec => spec.trim()).filter(spec => spec.length > 0);
    const tier = this.simc.parseTier(search.get('simcTier'));
    if (!specs.length) throw new Error('No specs requested: pass specs=SpecKey,SpecKey.');
    if (!tier) throw new Error('SIMC_TIER must read <branch>/<dir>, e.g. midnight/MID2.');
    return { specs, tier, raidNames: this.currentRaids.parseRaidNames(search.get('currentRaids')) };
  }

  private async buildAll(): Promise<void> {
    console.log('warcraft-learner - Rulebook build');
    const { specs, tier, raidNames } = this.params();
    console.log(`SimC tier: ${tier.branch}/${tier.dir}; specs: ${specs.join(', ')}`);
    const metas = await this.resolveSpecMetas();
    const { encounters } = await this.currentRaids.discoverCurrentRaids(this.wclApi, raidNames);
    console.log(`${encounters.length} encounters to sample parses from`);

    const summary: IngestRunSummary = { succeeded: [], failed: [], budgetStopped: false };
    for (const spec of specs) {
      try {
        await this.currentRaids.assertPointsBudget(this.wclApi, POINTS_MARGIN);
        await this.buildSpec(spec, metas, tier, encounters);
        summary.succeeded.push(spec);
      } catch (err) {
        this.logger.logWarn(`rulebook build: spec ${spec} aborted, continuing with the remaining specs`, err);
        summary.failed.push({ spec, message: err instanceof Error ? err.message : String(err) });
      }
    }
    this.summary.print(summary, specs.length);
    this.summary.publish(summary);
  }

  /** The spec icon is not on WCL; until the icon lookup lands, the published rulebook's stem carries forward. */
  private async resolveSpecMetas(): Promise<SpecMeta[]> {
    const metas = await this.currentRaids.discoverSpecMetas(this.wclApi);
    for (const meta of metas) {
      const rulebook = await this.dataFile.getRulebook(meta.spec);
      meta.specIcon = rulebook.ok ? rulebook.value.spec_icon : '';
    }
    this.specMeta.hydrate(metas);
    return metas;
  }

  private async buildSpec(spec: string, metas: SpecMeta[], tier: SimcTier, encounters: IngestEncounter[]): Promise<void> {
    const meta = metas.find(entry => entry.spec === spec);
    if (!meta) throw new Error(`${spec} is not a spec WCL knows.`);
    console.log(`\nBuilding ${spec}`);
    const profile = await this.simc.getProfile(tier, meta.classLabel, meta.specLabel);
    if (!profile.ok) throw new Error(profile.error.kind === 'missing' ? 'SimulationCraft ships no profile for this spec in this tier.' : profile.error.message);
    const spellData = await this.simc.getSpellDataDump(tier, meta.className);
    if (!spellData.ok) throw new Error(spellData.error.message);
    const talents = await this.talents.getTalents(spec);
    if (!talents.ok) this.logger.logWarn(`rulebook build ${spec}: no talent data, rules stay ungated`, talents.error);
    const samples = await this.samples.sample(this.wclApi, spec, encounters);
    console.log(`  ${samples.length} parses sampled`);
    const { rulebook, report } = this.builder.build({
      spec: meta, tier, profile: profile.value, spellData: spellData.value, samples,
      talents: talents.ok ? talents.value : {}, nowS: Math.floor(Date.now() / 1000),
    });
    await this.dataFile.writeRulebook(spec, rulebook);
    console.log(`  ${rulebook.major_cooldowns.length} cooldowns, ${rulebook.defensives.length} defensives, ${rulebook.rules.length} rules`);
    const gaps: [string, string[]][] = [
      ['unresolved actions', report.unresolvedActions], ['unresolved auras', report.unresolvedAuras],
      ['unresolved talents', report.unresolvedTalents], ['unresolved variables', report.unresolvedVariables],
    ];
    for (const [label, names] of gaps) if (names.length) console.log(`  ${label}: ${names.join(', ')}`);
  }
}
