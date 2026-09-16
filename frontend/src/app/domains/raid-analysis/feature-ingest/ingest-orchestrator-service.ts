// Orchestration only; no transformation lives here.
import { Injectable, inject } from '@angular/core';
import pLimit from 'p-limit';
import { NgHttpCachingService } from 'ng-http-caching';
import { WclApiService } from '../data/wcl/wcl-api-service';
import { DataFileApiService } from '../data/data-files/data-file-api-service';
import { WCL_TRANSPORT } from '../data/wcl/wcl-transport';
import { SpecMetaService } from '../data/data-files/spec-meta-service';
import type { SpecMeta } from '../data/data-files/spec-meta.models';
import { LoggerService } from '../../shared/util-logging/logger-service';
import { type LoadError, type Result, Results } from '../../shared/util-http/result';
import { TopParseSelectionService } from '../data/analysis/top-parse-selection-service';
import { TOP_PARSE_COUNT } from '../data/analysis/bench-pipeline-service';
import { getOrInsert } from '../data/analysis/analysis-math';
import type { EncounterEntry, SpecEntry } from '../data/encounter/encounter.models';
import type { TopParseSelection } from '../data/wcl/wcl.models';
import type { Rulebook } from '../data/rulebook/rulebook.models';
import type { SpecTalents } from '../data/gear/talent.models';
import type { SimcTier } from '../data/simc/simc.models';
import { SimcDataService } from '../data/http/simc-data-service';
import { TalentDataService } from '../data/http/talent-data-service';
import { EncounterRulebookService } from '../data/rulebook-build/encounter-rulebook-service';
import { RulebookBuildService } from '../data/rulebook-build/rulebook-build-service';
import type { RulebookGap, RulebookSources } from '../data/rulebook-build/rulebook-build.models';
import { BenchRegistryService, LEAD_BENCH, type BenchDescriptor } from './bench-registry';
import { CurrentRaidsService, BudgetExceededError } from '../data/ingest/current-raids-service';
import { INGEST_VERSION } from '../data/ingest/ingest-version';
import { IngestOrderingService, type SpecOrderEntry } from '../data/ingest/ingest-ordering-service';
import { IngestSignatureService } from '../data/ingest/ingest-signature-service';
import { IngestStampService, type IngestStamp } from '../data/ingest/ingest-stamp-service';
import { IngestStateService, type SpecIngestState } from '../data/ingest/ingest-state-service';
import { SpecReportService, SELECTED_MARKER, type SpecReportRow } from '../data/ingest/spec-report-service';
import type { IngestEncounter } from '../data/ingest/ingest.models';
import { IngestRunSummaryService, type IngestRunSummary, type PublishedRunSummary } from '../data/ingest/ingest-run-summary-service';

const POINTS_MARGIN = 500;
const BENCH_CONCURRENCY = 3;

type EncounterOutcome = 'benched' | 'empty' | 'failed';

const ENCOUNTER_OUTCOME_NOTE: Record<EncounterOutcome, string> = {
  benched: 'done',
  empty: 'no parses to bench',
  failed: 'bench load failed, retried next run',
};

/** The SimulationCraft inputs of one run, read up front for every spec: null where SimulationCraft ships no profile, an error where a source failed to load. */
interface RunSources {
  sources: Map<string, Result<RulebookSources | null>>;
  /** Specs whose first derivation was logged, so the rebuild per encounter stays quiet. */
  reported: Set<string>;
}

type ClassDumps = Map<string, Promise<Result<string>>>;

function nowS(): number {
  return Math.floor(Date.now() / 1000);
}

/** Published on `globalThis.__INGEST_DONE__`, the headless harness's exit signal. */
function publishSummary(summary: PublishedRunSummary): void {
  (globalThis as { __INGEST_DONE__?: PublishedRunSummary }).__INGEST_DONE__ = summary;
}

/** Zero-sample encounters stay listed, or a new raid's bosses are not selectable until its first parses land. */
function encounterIndexEntries(current: IngestEncounter[], onDisk: EncounterEntry[]): EncounterEntry[] {
  if (!current.length) return onDisk;
  const samplesById = new Map(onDisk.map(entry => [entry.id, entry.sample_count]));
  return current.map(encounter => ({ id: encounter.id, name: encounter.name, sample_count: samplesById.get(encounter.id) ?? 0 }));
}

@Injectable({ providedIn: 'root' })
export class IngestOrchestratorService {
  private readonly currentRaids = inject(CurrentRaidsService);
  private readonly ingestState = inject(IngestStateService);
  private readonly logger = inject(LoggerService);
  private readonly ordering = inject(IngestOrderingService);
  private readonly signature = inject(IngestSignatureService);
  private readonly specReport = inject(SpecReportService);
  private readonly stamp = inject(IngestStampService);
  private readonly topParseSelection = inject(TopParseSelectionService);
  private readonly wclApi = inject(WclApiService);
  private readonly dataFile = inject(DataFileApiService);
  private readonly specMeta = inject(SpecMetaService);
  private readonly wclTransport = inject(WCL_TRANSPORT);
  private readonly wclCache = inject(NgHttpCachingService);
  private readonly benches = inject(BenchRegistryService).benches;
  private readonly summary = inject(IngestRunSummaryService);
  private readonly simc = inject(SimcDataService);
  private readonly talents = inject(TalentDataService);
  private readonly rulebooks = inject(EncounterRulebookService);
  private readonly builder = inject(RulebookBuildService);

  /** Never rejects: the fire-and-forget app initializer must not see an unhandled rejection. */
  async run(): Promise<void> {
    try {
      await this.ingestAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('\nFatal error:', message);
      publishSummary(await this.summary.published({ succeeded: [], failed: [], budgetStopped: false, fatal: message }));
    }
  }

  private async ingestAll(): Promise<void> {
    console.log('warcraft-learner - Parse Ingestion');
    const version = String(INGEST_VERSION);
    const search = new URLSearchParams(globalThis.location.search);
    const tier = this.builder.parseTier(search.get('simcTier'));
    if (!tier) throw new Error('SIMC_TIER must read <branch>/<dir>, e.g. midnight/MID2.');
    console.log(`Ingest version: ${version}; SimulationCraft tier: ${tier.branch}/${tier.dir}`);

    const metas = await this.resolveSpecMetas();

    const raidNames = this.currentRaids.parseRaidNames(search.get('currentRaids'));
    console.log(raidNames.length
      ? `Current raids (CURRENT_RAIDS): ${raidNames.join(', ')}`
      : 'CURRENT_RAIDS is unset - nothing to ingest, nothing pruned.');
    const { encounters, protectedIds } = await this.currentRaids.discoverCurrentRaids(this.wclApi, raidNames);
    console.log(`${encounters.length} encounters`);
    await this.pruneRetiredRaids(protectedIds);
    await this.refreshIndices(encounters);

    const run: RunSources = { sources: await this.prepareSources(tier, metas), reported: new Set() };
    const gaps = this.summary.gaps(this.gapsBySpec(run));
    const specs = await this.orderedSpecs(metas.map(meta => meta.spec));
    const summary: IngestRunSummary = { ...await this.ingestEachSpec(specs, encounters, version, run), gaps };
    console.log(this.summary.formatRunSummary(summary, specs.length));
    publishSummary(await this.summary.published(summary));
  }

  private async resolveSpecMetas(): Promise<SpecMeta[]> {
    const metas = await this.currentRaids.discoverSpecMetas(this.wclApi);
    this.specMeta.hydrate(metas);
    await this.dataFile.writeSpecMeta(metas);
    console.log(`Resolved ${metas.length} specs from WCL`);
    return metas;
  }

  /** Every spec's sources up front: the gap report reads them all, and a missing profile marks its spec as gear, positions and burst windows only. */
  private async prepareSources(tier: SimcTier, metas: SpecMeta[]): Promise<Map<string, Result<RulebookSources | null>>> {
    const index = await this.talents.getTalentIndex();
    if (!index.ok) this.logger.logWarn('ingest: no talent data, rules stay ungated', index.error);
    const talents = index.ok ? index.value : new Map<string, SpecTalents>();
    const dumps: ClassDumps = new Map();
    const sources = new Map<string, Result<RulebookSources | null>>();
    for (const meta of metas) sources.set(meta.spec, await this.prepareSpec(meta, tier, dumps, talents));
    const shipped = [...sources.values()].filter(prepared => prepared.ok && prepared.value !== null).length;
    console.log(`SimulationCraft ships ${shipped} of ${metas.length} spec profiles in ${tier.dir}`);
    return sources;
  }

  private async prepareSpec(meta: SpecMeta, tier: SimcTier, dumps: ClassDumps, talents: Map<string, SpecTalents>): Promise<Result<RulebookSources | null>> {
    const profile = await this.simc.getProfile(tier, meta.classLabel, meta.specLabel);
    if (!profile.ok) return profile.error.kind === 'missing' ? Results.ok(null) : profile;
    const spellData = await getOrInsert(dumps, meta.className, () => this.simc.getSpellDataDump(tier, meta.className));
    if (!spellData.ok) return spellData;
    return Results.ok(await this.builder.prepare({ spec: meta, tier, profile: profile.value, spellData: spellData.value, talents: talents.get(meta.spec) ?? {} }));
  }

  private gapsBySpec(run: RunSources): Map<string, RulebookGap[]> {
    const gaps = new Map<string, RulebookGap[]>();
    for (const [spec, prepared] of run.sources) {
      if (prepared.ok && prepared.value) gaps.set(spec, prepared.value.gaps);
    }
    return gaps;
  }

  /** Pruning only the selected specs would leave them at zero data and permanently re-selected. */
  private async pruneRetiredRaids(protectedIds: Set<number>): Promise<void> {
    // An unset CURRENT_RAIDS names no raid, which must not read as "prune everything".
    if (protectedIds.size === 0) return;
    for (const spec of await this.dataFile.listSpecs()) {
      const pruned = await this.pruneStaleEncounters(spec, protectedIds);
      if (pruned.length) console.log(`  [${spec}] pruned ${pruned.length} stale encounter(s): ${pruned.join(', ')}`);
      await this.pruneIngestState(spec, protectedIds);
    }
  }

  /** Every run, so samples ingested for a spec that is not selected again still surface in its index. */
  private async refreshIndices(encounters: IngestEncounter[]): Promise<void> {
    for (const spec of await this.dataFile.listSpecs()) {
      await this.pruneStrayFiles(spec);
      await this.rebuildEncountersIndex(spec, encounters);
    }
    await this.rebuildSpecIndex();
  }

  /** The publish mirrors this tree, so a file no step writes would otherwise be carried forward forever. */
  private async pruneStrayFiles(spec: string): Promise<void> {
    for (const file of await this.dataFile.listStraySpecFiles(spec)) await this.dataFile.removeSpecFile(spec, file);
  }

  private async ingestEachSpec(
    specs: string[], encounters: IngestEncounter[], version: string, run: RunSources,
  ): Promise<IngestRunSummary> {
    // Isolate each spec so one throw drops only that spec, not the whole run.
    const succeeded: string[] = [];
    const failed: { spec: string; message: string }[] = [];
    let budgetStopped = false;
    for (const spec of specs) {
      try {
        const budgetExhausted = await this.ingestSpec(spec, encounters, version, run);
        succeeded.push(spec);
        if (budgetExhausted) { budgetStopped = true; break; }
      } catch (err) {
        this.logger.logWarn(`ingest: spec ${spec} aborted, continuing with the remaining specs`, err);
        failed.push({ spec, message: err instanceof Error ? err.message : String(err) });
      }
    }
    return { succeeded, failed, budgetStopped };
  }

  private async orderedSpecs(specs: string[]): Promise<string[]> {
    if (!specs.length) return [];
    const orderInputs = await Promise.all(specs.map(async spec => {
      const benched = await this.benchedIds(spec);
      const state = await this.loadIngestState(spec);
      const emptyIds = state?.empty_encounter_ids ?? [];
      const stamps = await Promise.all(benched.map(async id => {
        const bench = await this.dataFile.getBench(spec, id, LEAD_BENCH);
        return this.stamp.readFileStamp(bench.ok ? bench.value : null);
      }));
      const versions = stamps.map(stamp => stamp.version);
      if (state) versions.push(state.ingest_version);
      const storedVersions = versions.filter((stored): stored is number => stored !== null);
      const storedTimes = stamps
        .map(stamp => stamp.ingestedAtS)
        .filter((stored): stored is number => stored !== null);
      if (state) storedTimes.push(state.ingested_at_s);
      const entry: SpecOrderEntry = {
        spec,
        checkedCount: new Set([...benched, ...emptyIds]).size,
        onCurrentVersion: versions.length > 0 && versions.every(stored => stored === INGEST_VERSION),
      };
      // Worst version but most recent write: "still on v23", "last ingested 3h ago".
      const displayVersion = storedVersions.length ? Math.min(...storedVersions) : null;
      const displayIngestedAtS = storedTimes.length ? Math.max(...storedTimes) : null;
      return { entry, displayVersion, displayIngestedAtS, emptyCount: emptyIds.length };
    }));
    const prioritySpecs = this.ordering.parsePrioritySpecs(new URLSearchParams(globalThis.location.search).get('prioritySpecs'));
    const { ordered, selected } = this.ordering.specsForRun(orderInputs.map(input => input.entry), prioritySpecs);
    const displayBySpec = new Map(orderInputs.map(input => [input.entry.spec, input] as const));
    const selectedSpecs = new Set(selected);
    const rows: SpecReportRow[] = ordered.map(spec => ({
      spec,
      version: displayBySpec.get(spec)?.displayVersion ?? null,
      ingestedAtS: displayBySpec.get(spec)?.displayIngestedAtS ?? null,
      checkedCount: displayBySpec.get(spec)?.entry.checkedCount ?? 0,
      emptyCount: displayBySpec.get(spec)?.emptyCount ?? 0,
      selected: selectedSpecs.has(spec),
    }));
    console.log(
      `Specs (never checked first, then oldest version, ${SELECTED_MARKER} = ingested this run):\n${this.specReport.formatSpecReport(rows, nowS())}`,
    );
    return selected;
  }

  private async ingestSpec(
    spec: string, encounters: IngestEncounter[], version: string, run: RunSources,
  ): Promise<boolean> {
    console.log(`\nIngesting ${spec} - ${encounters.length} encounters (top ${TOP_PARSE_COUNT})`);
    const sources = this.preparedSources(spec, run);
    // The stamp keys on what the rules read, so a SimulationCraft change they can see re-benches an encounter like a changed top parse does.
    const sourceKey = sources ? `${version}:${sources.key}` : version;

    // Feeds the never-checked-first order - a file-server-only signal, zero WCL budget.
    const previousState = await this.loadIngestState(spec);
    const checkedIds = new Set([...await this.benchedIds(spec), ...previousState?.empty_encounter_ids ?? []]);
    const emptyThisPass: number[] = [];

    try {
      for (const encounter of this.ordering.orderEncountersByMissingFirst(encounters, checkedIds)) {
        await this.currentRaids.assertPointsBudget(this.wclApi, POINTS_MARGIN);
        const outcome = await this.ingestOneEncounter(spec, encounter, sourceKey, sources, run);
        if (outcome === 'empty') emptyThisPass.push(encounter.id);
      }
    } catch (err) {
      if (err instanceof BudgetExceededError) {
        console.log(`\n[budget] Stopping cleanly: ${err.message}`);
        await this.finishSpec(spec, encounters, previousState, emptyThisPass);
        return true;
      }
      throw err;
    }

    await this.finishSpec(spec, encounters, previousState, emptyThisPass);
    console.log(`Ingestion complete for ${spec}.`);
    return false;
  }

  /** The spec's prepared sources, null where SimulationCraft ships no profile; a source that failed to load fails the spec instead. */
  private preparedSources(spec: string, run: RunSources): RulebookSources | null {
    const prepared = run.sources.get(spec) ?? Results.ok(null);
    if (!prepared.ok) throw new Error(prepared.error.message);
    if (!prepared.value) console.log('  no SimulationCraft profile: gear, positions and burst windows only');
    return prepared.value;
  }

  /** 'skipped' when the stored stamp already covers the current top parses and sources. */
  private async ingestOneEncounter(
    spec: string, encounter: IngestEncounter, sourceKey: string, sources: RulebookSources | null, run: RunSources,
  ): Promise<EncounterOutcome | 'skipped'> {
    const selection = await this.topParseSelection.resolveTopParses(this.wclApi, spec, encounter.id, encounter.partitionIds);
    if (!selection.length) {
      console.log(`  [${encounter.name}] no rankings, skipped`);
      return 'empty';
    }

    const existing = await this.dataFile.getBench(spec, encounter.id, LEAD_BENCH);
    const { skip, signature: skipKey } = await this.stamp.skipDecision(existing.ok ? existing.value : null, selection, sourceKey, TOP_PARSE_COUNT);
    if (skip) {
      console.log(`  [${encounter.name}] unchanged (signature ${skipKey}), skipped`);
      return 'skipped';
    }

    console.log(`  [${encounter.name}] computing benches (signature ${skipKey})...`);
    try {
      const outcome = await this.ingestEncounter(spec, encounter, sourceKey, selection, sources, run);
      console.log(`  [${encounter.name}] ${ENCOUNTER_OUTCOME_NOTE[outcome]}`);
      return outcome;
    } finally {
      // Drop this encounter's cached reports/events before the next one to bound memory.
      this.wclCache.clearCache();
    }
  }

  private benchedIds(spec: string): Promise<number[]> {
    return this.dataFile.listBenchFiles(spec, LEAD_BENCH).then(files => this.ingestState.encounterIdsFromFiles(files));
  }

  private async loadIngestState(spec: string): Promise<SpecIngestState | null> {
    const stored = await this.dataFile.getIngestState(spec);
    return stored.ok ? this.ingestState.readIngestState(stored.value) : null;
  }

  private async pruneIngestState(spec: string, protectedIds: Set<number>): Promise<void> {
    const pruned = this.ingestState.prunedIngestState(await this.loadIngestState(spec), protectedIds);
    if (pruned) await this.dataFile.writeIngestState(spec, pruned);
  }

  /** Re-lists the benched ids rather than tracking this pass's writes, so a mark still clears after a run that died between writing a bench and updating the marker. */
  private async finishSpec(
    spec: string, encounters: IngestEncounter[],
    previous: SpecIngestState | null, emptyThisPass: readonly number[],
  ): Promise<void> {
    const stamp: IngestStamp = { version: INGEST_VERSION, ingestedAtS: nowS() };
    const benched = new Set(await this.benchedIds(spec));
    await this.dataFile.writeIngestState(spec, this.ingestState.nextIngestState(previous, emptyThisPass, benched, stamp));
    await this.rebuildEncountersIndex(spec, encounters);
    await this.rebuildSpecIndex();
  }

  /** Compute every bench first, THEN stamp + write: the signature is known only after every transform has fetched. */
  private async ingestEncounter(
    spec: string, encounter: IngestEncounter, sourceKey: string, selection: TopParseSelection,
    sources: RulebookSources | null, run: RunSources,
  ): Promise<EncounterOutcome> {
    const encId = encounter.id;
    const limit = pLimit(BENCH_CONCURRENCY);
    const [burstBench, ...siblings] = this.benches;
    const { result: [burst, rest], outcomes } = await this.wclTransport.withFetchOutcomes(async () => {
      const rulebook = sources ? await this.deriveRulebook(spec, encId, sources, selection, run) : null;
      const compute = (bench: BenchDescriptor) => limit(() => bench.transform.getBench(spec, encId, selection, rulebook));
      return Promise.all([
        compute(burstBench),
        Promise.all(siblings.map(async bench => ({ bench, result: await compute(bench) }))),
      ]);
    });

    const { signature, inaccessibleParses } = await this.signature.signatureAfterFetch(
      selection, outcomes.inaccessibleCodes, outcomes.failedCodes, sourceKey, TOP_PARSE_COUNT);
    const stamp: IngestStamp = { version: INGEST_VERSION, ingestedAtS: nowS() };

    // Skip on any failure so a bench is never overwritten with partial data.
    const skipNote = (bench: string, error: LoadError): string =>
      error.kind === 'missing'
        ? `    [${encounter.name}] ${bench}: no data, skipped`
        : `    [${encounter.name}] ${bench}: ${error.kind} (${error.message}), skipped`;

    const writes: Promise<void>[] = [];
    if (burst.ok) {
      const all = [burst, ...rest.map(entry => entry.result)];
      writes.push(burstBench.write(spec, encId, this.stamp.stampBurstFile(burst.value, signature, stamp, inaccessibleParses, all)));
    } else { console.log(skipNote(burstBench.file, burst.error)); }
    for (const { bench, result } of rest) {
      if (result.ok) {
        writes.push(bench.write(spec, encId, this.stamp.stampSignature(result.value, signature, stamp)));
      } else { console.log(skipNote(bench.file, result.error)); }
    }

    await Promise.all(writes);
    if (burst.ok) return 'benched';
    // Marking a transient or permanent failure empty would defeat the retry `stampBurstFile` leaves open.
    return burst.error.kind === 'missing' ? 'empty' : 'failed';
  }

  /** Derived from the encounter's own top parses, the ones its benches measure, so the stamp's parse set and sources fix the rules. */
  private async deriveRulebook(spec: string, encounterId: number, sources: RulebookSources, selection: TopParseSelection, run: RunSources): Promise<Rulebook> {
    const { rulebook, gaps } = await this.rulebooks.derive(this.wclApi, { sources, encounterId, selection });
    if (run.reported.has(spec)) return rulebook;
    run.reported.add(spec);
    const names = (entries: { name: string }[]): string => (entries.length ? entries.map(entry => entry.name).join(', ') : 'none');
    console.log(`  cooldowns: ${names(rulebook.major_cooldowns)}`);
    console.log(`  defensives: ${names(rulebook.defensives)}`);
    console.log(`  rules: ${rulebook.rules.length}`);
    if (gaps.length) console.log(`  gaps: ${gaps.map(gap => `${gap.kind} ${gap.token}`).join(', ')}`);
    return rulebook;
  }

  private async rebuildEncountersIndex(spec: string, current: IngestEncounter[]): Promise<void> {
    const onDisk: EncounterEntry[] = [];
    for (const encId of await this.benchedIds(spec)) {
      const bench = await this.dataFile.getBench<{ encounter_id?: number; encounter_name?: string; sample_count?: number }>(spec, encId, LEAD_BENCH);
      if (!bench.ok) continue;
      onDisk.push({
        id: bench.value.encounter_id ?? encId,
        name: bench.value.encounter_name ?? String(encId),
        sample_count: bench.value.sample_count ?? 0,
      });
    }
    await this.dataFile.writeEncounters(spec, encounterIndexEntries(current, onDisk));
  }

  private async rebuildSpecIndex(): Promise<void> {
    const specs = await this.dataFile.listSpecs();
    const entries: SpecEntry[] = [];
    for (const spec of specs.sort()) {
      const encounters = await this.dataFile.getEncounters(spec);
      // Zero-sample encounters count: gating on benched data would hide every spec while a new raid waits for its first Mythic parses.
      const count = encounters.ok ? encounters.value.length : 0;
      if (count > 0) entries.push({ spec, encounter_count: count });
    }
    await this.dataFile.writeSpecs(entries);
  }

  private async pruneStaleEncounters(spec: string, protectedIds: Set<number>): Promise<number[]> {
    const removed: number[] = [];
    for (const encId of await this.benchedIds(spec)) {
      if (protectedIds.has(encId)) continue;
      for (const { file: bench } of this.benches) {
        try {
          await this.dataFile.removeBench(spec, encId, bench);
        } catch (err) {
          this.logger.logWarn(`pruneStaleEncounters ${spec}/${encId}/${bench}`, err);
        }
      }
      removed.push(encId);
    }
    return removed;
  }
}
