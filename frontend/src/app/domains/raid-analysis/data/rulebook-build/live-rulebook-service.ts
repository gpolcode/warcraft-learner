import { Injectable, inject } from '@angular/core';
import type { LoadError } from '../../../shared/util-http/result';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { Rulebook } from '../rulebook/rulebook.models';
import type { SimcTier } from '../simc/simc.models';
import { SimcDataService } from '../http/simc-data-service';
import { TalentDataService } from '../http/talent-data-service';
import { CurrentRaidsService } from '../ingest/current-raids-service';
import { TopParseSelectionService } from '../analysis/top-parse-selection-service';
import { getOrInsert } from '../analysis/analysis-math';
import { EncounterRulebookService } from './encounter-rulebook-service';
import { RulebookBuildService } from './rulebook-build-service';
import type { RulebookSources } from './rulebook-build.models';

/** The rulebook an analysis derives for itself, from the same sources and top parses an ingest run reads, for a browser with no ingested data. */
@Injectable({ providedIn: 'root' })
export class LiveRulebookService {
  private readonly logger = inject(LoggerService);
  private readonly simc = inject(SimcDataService);
  private readonly talents = inject(TalentDataService);
  private readonly currentRaids = inject(CurrentRaidsService);
  private readonly topParses = inject(TopParseSelectionService);
  private readonly builder = inject(RulebookBuildService);
  private readonly rulebooks = inject(EncounterRulebookService);
  // Every bench of one analysis asks for the same rulebook, so the promises are kept: one set of SimulationCraft fetches per spec and one derivation per encounter.
  private readonly prepared = new Map<string, Promise<RulebookSources | null>>();
  private readonly derived = new Map<string, Promise<Rulebook | null>>();

  /** Null where SimulationCraft writes no action list for the spec, a source cannot be read, or the encounter has no ranked parses. */
  rulebookFor(wclApi: WclApiService, spec: string, encounterId: number, tier: SimcTier): Promise<Rulebook | null> {
    return getOrInsert(this.derived, `${spec}:${encounterId}`, () => this.derive(wclApi, spec, encounterId, tier));
  }

  private async derive(wclApi: WclApiService, spec: string, encounterId: number, tier: SimcTier): Promise<Rulebook | null> {
    const sources = await getOrInsert(this.prepared, spec, () => this.prepare(wclApi, spec, tier));
    if (!sources) return null;
    // The same call the benches make, so both read one parse set and the cache serves the sampling twice over.
    const selection = await this.topParses.resolveTopParses(wclApi, spec, encounterId);
    if (!selection.length) return null;
    return (await this.rulebooks.derive(wclApi, { sources, encounterId, selection })).rulebook;
  }

  private async prepare(wclApi: WclApiService, spec: string, tier: SimcTier): Promise<RulebookSources | null> {
    const meta = (await this.currentRaids.discoverSpecMetas(wclApi)).find(entry => entry.spec === spec);
    if (!meta) return null;
    const apl = await this.simc.getApl(tier, meta.className, meta.specLabel);
    if (!apl.ok) return this.unread(spec, apl.error);
    const spellData = await this.simc.getSpellDataDump(tier, meta.className);
    if (!spellData.ok) return this.unread(spec, spellData.error);
    const talents = await this.talents.getTalents(spec);
    return this.builder.prepare({ spec: meta, tier, apl: apl.value, spellData: spellData.value, talents: talents.ok ? talents.value : {} });
  }

  /** A list SimulationCraft does not write is a spec with no rules; anything else is worth a line in the console. */
  private unread(spec: string, error: LoadError): null {
    if (error.kind !== 'missing') this.logger.logWarn(`LiveRulebookService ${spec}`, error);
    return null;
  }
}
