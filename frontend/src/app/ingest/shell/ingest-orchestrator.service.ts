// Orchestration only; no transformation lives here.
import { Injectable, inject } from '@angular/core';
import pLimit from 'p-limit';
import { NgHttpCachingService } from 'ng-http-caching';
import { WclApiService } from '../../core/services/wcl-api';
import { DataFileApiService } from '../../core/services/data-file-api';
import { WCL_TRANSPORT } from '../../core/services/wcl-transport';
import { SpecMetaService } from '../../core/services/spec-meta';
import { logWarn } from '../../core/log';
import { type LoadError } from '../../core/result';
import { resolveTopParses } from '../../shared/analysis/top-parse-selection';
import type { TopParseSelection } from '../../core/models/wcl.models';
import { sliceRegistry, type SliceDescriptor } from './slice-registry';
import {
  assertPointsBudget, BudgetExceededError, discoverCurrentRaids, discoverSpecMetas, parseRaidNames,
} from '../current-raids';
import { INGEST_VERSION } from '../ingest-version';
import { specsForRun, orderEncountersByMissingFirst, parsePrioritySpecs } from '../ordering';
import { signatureAfterFetch, stampSignature, stampBurstFile, type IngestStamp } from '../signature';
import { type SpecIngestState } from '../ingest-state';
import {
  benchSkipDecision, pruneRetiredEncounters, readSpecDataset, readSpecFreshness, rebuildIndices, recordSpecPass,
} from '../spec-dataset';
import { formatSpecReport, SELECTED_MARKER, type SpecReportRow } from '../spec-report';
import type { IngestEncounter } from '../models/wcl.models';

const TOP_N = 10;
const POINTS_MARGIN = 500;
const SLICE_CONCURRENCY = 3;

type EncounterOutcome = 'benched' | 'empty' | 'failed';

const ENCOUNTER_OUTCOME_NOTE: Record<EncounterOutcome, string> = {
  benched: 'done',
  empty: 'no parses to bench',
  failed: 'bench load failed, retried next run',
};

/** Published on `globalThis.__INGEST_DONE__` - the headless harness's exit signal. */
export interface IngestRunSummary {
  succeeded: string[];
  failed: { spec: string; message: string }[];
  budgetStopped: boolean;
  fatal?: string;
}

function nowS(): number {
  return Math.floor(Date.now() / 1000);
}

function publishSummary(summary: IngestRunSummary): void {
  (globalThis as { __INGEST_DONE__?: IngestRunSummary }).__INGEST_DONE__ = summary;
}

@Injectable({ providedIn: 'root' })
export class IngestOrchestratorService {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFile = inject(DataFileApiService);
  private readonly specMeta = inject(SpecMetaService);
  private readonly wclTransport = inject(WCL_TRANSPORT);
  private readonly wclCache = inject(NgHttpCachingService);
  private readonly slices = sliceRegistry();

  /** Never rejects: the fire-and-forget app initializer must not see an unhandled rejection. */
  async run(): Promise<void> {
    try {
      await this.ingestAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('\nFatal error:', message);
      publishSummary({ succeeded: [], failed: [], budgetStopped: false, fatal: message });
    }
  }

  private async ingestAll(): Promise<void> {
    console.log('warcraft-learner - Parse Ingestion');
    const version = String(INGEST_VERSION);
    console.log(`Ingest version: ${version}`);

    await this.resolveSpecMetas();

    const raidNames = parseRaidNames(new URLSearchParams(globalThis.location.search).get('currentRaids'));
    console.log(raidNames.length
      ? `Current raids (CURRENT_RAIDS): ${raidNames.join(', ')}`
      : 'CURRENT_RAIDS is unset - nothing to ingest, nothing pruned.');
    const { encounters, protectedIds } = await discoverCurrentRaids(this.wclApi, raidNames);
    console.log(`${encounters.length} encounters`);
    await this.pruneRetiredRaids(protectedIds);
    await rebuildIndices(this.dataFile, encounters);

    const specs = await this.orderedSpecsFromDisk();
    if (!specs.length) {
      console.log('No known specs (no rulebook.json found). Nothing to do.');
      publishSummary({ succeeded: [], failed: [], budgetStopped: false });
      return;
    }

    const summary = await this.ingestEachSpec(specs, encounters, version);
    this.printRunSummary(summary, specs.length);
    publishSummary(summary);
  }

  private async resolveSpecMetas(): Promise<void> {
    // The spec icon is not on WCL, so enrich each meta from that spec's rulebook (its spec_icon stem).
    const metas = await discoverSpecMetas(this.wclApi);
    for (const meta of metas) {
      const rulebook = await this.dataFile.getRulebook(meta.spec);
      if (rulebook.ok) {
        meta.specIcon = rulebook.value.spec_icon;
      } else {
        // Only a corrupt file (permanent) is worth logging; a missing rulebook is an un-authored spec.
        if (rulebook.error.kind === 'permanent') {
          logWarn(`ingest ${meta.spec}: corrupt rulebook.json, shipping blank spec icon`, rulebook.error);
        }
        meta.specIcon = '';
      }
    }
    this.specMeta.hydrate(metas);
    await this.dataFile.writeSpecMeta(metas);
    console.log(`Resolved ${metas.length} specs from WCL`);
  }

  private async pruneRetiredRaids(protectedIds: Set<number>): Promise<void> {
    const sliceFiles = this.slices.map(slice => slice.file);
    for (const { spec, encounterIds } of await pruneRetiredEncounters(this.dataFile, sliceFiles, protectedIds)) {
      console.log(`  [${spec}] pruned ${encounterIds.length} stale encounter(s): ${encounterIds.join(', ')}`);
    }
  }

  private async ingestEachSpec(
    specs: string[], encounters: IngestEncounter[], version: string,
  ): Promise<IngestRunSummary> {
    // Isolate each spec so one throw drops only that spec, not the whole run.
    const succeeded: string[] = [];
    const failed: { spec: string; message: string }[] = [];
    let budgetStopped = false;
    for (const spec of specs) {
      try {
        const budgetExhausted = await this.ingestSpec(spec, encounters, version);
        succeeded.push(spec);
        if (budgetExhausted) { budgetStopped = true; break; }
      } catch (err) {
        logWarn(`ingest: spec ${spec} aborted, continuing with the remaining specs`, err);
        failed.push({ spec, message: err instanceof Error ? err.message : String(err) });
      }
    }
    return { succeeded, failed, budgetStopped };
  }

  private printRunSummary({ succeeded, failed, budgetStopped }: IngestRunSummary, specCount: number): void {
    console.log('\n=== Ingestion summary ===');
    console.log(`Specs processed: ${succeeded.length} of ${specCount}`);
    if (budgetStopped) {
      console.log('Stopped early: WCL point budget exhausted; the remaining specs resume next run.');
    }
    if (failed.length) {
      console.log(`Specs failed (${failed.length}): ${failed.map(entry => entry.spec).join(', ')}`);
      for (const entry of failed) {
        console.log(`  ${entry.spec}: ${entry.message}`);
      }
    } else {
      console.log('No spec-level failures.');
    }
  }

  private async orderedSpecsFromDisk(): Promise<string[]> {
    const onDisk = await this.dataFile.listSpecs();
    const withRulebook: string[] = [];
    for (const spec of onDisk) {
      const rulebook = await this.dataFile.getRulebook(spec);
      if (rulebook.ok) {
        withRulebook.push(spec);
      } else if (rulebook.error.kind === 'permanent') {
        // A corrupt rulebook silently freezes the spec on stale data; log so it is diagnosable.
        logWarn(`ingest ${spec}: corrupt rulebook.json, excluded from this run`, rulebook.error);
      }
    }
    if (!withRulebook.length) return [];

    const freshness = new Map(await Promise.all(withRulebook.map(async spec =>
      [spec, await readSpecFreshness(this.dataFile, spec)] as const)));
    const prioritySpecs = parsePrioritySpecs(new URLSearchParams(globalThis.location.search).get('prioritySpecs'));
    const { ordered, selected } = specsForRun(
      [...freshness].map(([spec, fresh]) => ({ spec, checkedCount: fresh.checkedCount, onCurrentVersion: fresh.onCurrentVersion })),
      prioritySpecs,
    );
    const selectedSpecs = new Set(selected);
    const rows: SpecReportRow[] = ordered.map(spec => ({
      spec,
      version: freshness.get(spec)?.version ?? null,
      ingestedAtS: freshness.get(spec)?.ingestedAtS ?? null,
      checkedCount: freshness.get(spec)?.checkedCount ?? 0,
      emptyCount: freshness.get(spec)?.emptyCount ?? 0,
      selected: selectedSpecs.has(spec),
    }));
    console.log(
      `Specs (never checked first, then oldest version, ${SELECTED_MARKER} = ingested this run):\n${formatSpecReport(rows, nowS())}`,
    );
    return selected;
  }

  /** Returns true when the run stopped on the WCL budget (remaining specs resume next run). */
  private async ingestSpec(
    spec: string, encounters: IngestEncounter[], version: string,
  ): Promise<boolean> {
    console.log(`\nIngesting ${spec} - ${encounters.length} encounters (top ${TOP_N})`);

    // Feeds the never-checked-first order - a file-server-only signal, zero WCL budget.
    const { state: previousState, checkedIds } = await readSpecDataset(this.dataFile, spec);
    const emptyThisPass: number[] = [];

    try {
      for (const encounter of orderEncountersByMissingFirst(encounters, checkedIds)) {
        await assertPointsBudget(this.wclApi, POINTS_MARGIN);

        const selection = await resolveTopParses(this.wclApi, spec, encounter.id, encounter.partitionIds);
        if (!selection.rows.length) {
          console.log(`  [${encounter.name}] no rankings, skipped`);
          emptyThisPass.push(encounter.id);
          continue;
        }

        const { skip, signature } = await benchSkipDecision(
          this.dataFile, spec, encounter.id, { rows: selection.rows, version, topN: TOP_N });
        if (skip) {
          console.log(`  [${encounter.name}] unchanged (signature ${signature}), skipped`);
          continue;
        }

        console.log(`  [${encounter.name}] computing slices (signature ${signature})...`);
        let outcome: EncounterOutcome;
        try {
          outcome = await this.ingestEncounter(spec, encounter, version, selection);
        } finally {
          // Drop this encounter's cached reports/events before the next one to bound memory.
          this.wclCache.clearCache();
        }
        if (outcome === 'empty') emptyThisPass.push(encounter.id);
        console.log(`  [${encounter.name}] ${ENCOUNTER_OUTCOME_NOTE[outcome]}`);
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

  private finishSpec(
    spec: string, encounters: IngestEncounter[],
    previous: SpecIngestState | null, emptyThisPass: readonly number[],
  ): Promise<void> {
    const stamp: IngestStamp = { version: INGEST_VERSION, ingestedAtS: nowS() };
    return recordSpecPass(this.dataFile, spec, { previous, emptyIds: emptyThisPass, encounters, stamp });
  }

  /** Compute every slice first, THEN stamp + write: the signature is known only after every transform has fetched. */
  private async ingestEncounter(
    spec: string, encounter: IngestEncounter, version: string, selection: TopParseSelection,
  ): Promise<EncounterOutcome> {
    const encId = encounter.id;
    const limit = pLimit(SLICE_CONCURRENCY);
    const [burstSlice, ...siblings] = this.slices;
    const bench = (slice: SliceDescriptor) => limit(() => slice.transform.getBench(spec, encId, selection));
    const { result: [burst, rest], outcomes } = await this.wclTransport.withFetchOutcomes(() => Promise.all([
      bench(burstSlice),
      Promise.all(siblings.map(async slice => ({ slice, result: await bench(slice) }))),
    ]));

    const { signature, inaccessibleParses } = signatureAfterFetch(
      selection.rows, outcomes.inaccessibleCodes, outcomes.failedCodes, version, TOP_N);
    const stamp: IngestStamp = { version: INGEST_VERSION, ingestedAtS: nowS() };

    // Skip on any failure so a slice is never overwritten with partial data.
    const skipNote = (slice: string, error: LoadError): string =>
      error.kind === 'missing'
        ? `    [${encounter.name}] ${slice}: no data, skipped`
        : `    [${encounter.name}] ${slice}: ${error.kind} (${error.message}), skipped`;

    const writes: Promise<void>[] = [];
    if (burst.ok) {
      const all = [burst, ...rest.map(entry => entry.result)];
      writes.push(burstSlice.write(spec, encId, stampBurstFile(burst.value, signature, stamp, inaccessibleParses, all)));
    } else { console.log(skipNote(burstSlice.file, burst.error)); }
    for (const { slice, result } of rest) {
      if (result.ok) {
        writes.push(slice.write(spec, encId, stampSignature(result.value, signature, stamp)));
      } else { console.log(skipNote(slice.file, result.error)); }
    }

    await Promise.all(writes);
    if (burst.ok) return 'benched';
    // Marking a transient or permanent failure empty would defeat the retry `stampBurstFile` leaves open.
    return burst.error.kind === 'missing' ? 'empty' : 'failed';
  }
}
