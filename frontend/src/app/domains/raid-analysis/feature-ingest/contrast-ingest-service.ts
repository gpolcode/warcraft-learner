// Orchestration only; the cohort pick and the measures live in the data layer.
import { Injectable, inject } from '@angular/core';
import { NgHttpCachingService } from 'ng-http-caching';
import { WclApiService, type WclPointsBudget } from '../data/wcl/wcl-api-service';
import { DataFileApiService } from '../data/data-files/data-file-api-service';
import { WclProjectionsService } from '../data/analysis/wcl-projections-service';
import { SpecRoleService } from '../data/analysis/spec-role-service';
import { IngestStateService } from '../data/ingest/ingest-state-service';
import { INGEST_POINTS_MARGIN } from '../data/ingest/ingest-points-margin';
import type { IngestEncounter } from '../data/ingest/ingest.models';
import { SpecPlanLoaderService } from '../data/simc/spec-plan-loader-service';
import { LoggerService } from '../../shared/util-logging/logger-service';
import type { ParseRanking } from '../data/wcl/wcl.models';
import { VERDICT_CHOICES } from '../data/verdict/verdict-choices';
import { ContrastBench, ContrastCard } from '../data/verdict/calibration/calibration.models';
import { CONTRAST_DIR } from '../data/verdict/calibration/calibration-run-service';
import { ContrastCohortService, type ContrastPair } from '../data/verdict/calibration/contrast-cohort-service';
import { BenchRegistryService, LEAD_BENCH } from './bench-registry';

/** The contrast cohort is the lowest-priority spender, so it never takes more than this from one hourly run. */
const POINTS_CAP = 300;
/** Five logs at about 14 points each plus the rankings read, until a pair this run measures its own cost. */
const PAIR_POINTS_ESTIMATE = 75;
const RANKINGS_PAGE_ROWS = 100;
const CARDS = ['rotation', 'defensive', 'gear', 'burst'] as const;

type Card = (typeof CARDS)[number];

/** What one run fetched, for the log and the job summary. */
export interface ContrastRun {
  due: number;
  fetched: number;
  spent: number;
  summary: string;
}

type PairOutcome = 'measured' | 'thin' | 'failed';

/** Fetches the weaker ranked logs of the spec and boss pairs whose cohort is due, inside the points cap and above the ingest margin. */
@Injectable({ providedIn: 'root' })
export class ContrastIngestService {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFile = inject(DataFileApiService);
  private readonly projections = inject(WclProjectionsService);
  private readonly specRoles = inject(SpecRoleService);
  private readonly ingestState = inject(IngestStateService);
  private readonly specPlans = inject(SpecPlanLoaderService);
  private readonly cohorts = inject(ContrastCohortService);
  private readonly logger = inject(LoggerService);
  private readonly wclCache = inject(NgHttpCachingService);
  private readonly benches = inject(BenchRegistryService).benches;

  /** Never rejects: a failed contrast fetch must not cost the run its calibration. */
  async run(encounters: readonly IngestEncounter[], reading: WclPointsBudget | null, nowS: number): Promise<ContrastRun> {
    try {
      return await this.fetchDue(encounters, reading, nowS);
    } catch (err) {
      this.logger.logWarn('ingest: contrast cohort aborted', err);
      return { due: 0, fetched: 0, spent: 0, summary: 'Contrast cohort: aborted on an error, retried next run.' };
    }
  }

  private async fetchDue(encounters: readonly IngestEncounter[], reading: WclPointsBudget | null, nowS: number): Promise<ContrastRun> {
    // An unknown budget cannot be held to the cap.
    if (!reading) return this.nothing('WCL served no points reading');
    if (!this.affords(reading, PAIR_POINTS_ESTIMATE)) return this.nothing(`under ${INGEST_POINTS_MARGIN} points would be left after one pair`);
    const due = await this.duePairs(encounters, nowS);
    const byId = new Map(encounters.map(encounter => [encounter.id, encounter]));
    let budget = reading;
    let spent = 0;
    let estimate = PAIR_POINTS_ESTIMATE;
    let fetched = 0;
    let stop = 'every due pair fetched';
    for (const pair of due) {
      const limit = this.limitReached(spent, estimate, budget);
      if (limit) { stop = limit; break; }
      const outcome = await this.fetchPair(pair, byId.get(pair.encounterId)?.partitionIds ?? [], nowS);
      const after = await this.wclApi.getPointsBudget();
      const cost = this.cost(budget, after, estimate);
      spent += cost;
      estimate = Math.max(estimate, cost);
      budget = after ?? budget;
      if (outcome !== 'failed') fetched += 1;
      console.log(`  [contrast ${pair.spec} ${pair.encounterId}] ${outcome}, ${cost} points`);
    }
    return {
      due: due.length, fetched, spent,
      summary: `Contrast cohort: ${fetched} of ${due.length} due spec and boss pairs fetched for ${spent} WCL points; ${stop}.`,
    };
  }

  /** A reading from the next hour spent less than this one; the cost is then unknown, so the estimate stands in. */
  private cost(before: WclPointsBudget, after: WclPointsBudget | null, estimate: number): number {
    return after && after.pointsSpentThisHour >= before.pointsSpentThisHour ? after.pointsSpentThisHour - before.pointsSpentThisHour : estimate;
  }

  private nothing(why: string): ContrastRun {
    return { due: 0, fetched: 0, spent: 0, summary: `Contrast cohort: nothing fetched, ${why}.` };
  }

  /** The next pair is held to the cap on what this run spent and to the margin on what the hour has left, both at the costliest pair so far. */
  private limitReached(spent: number, estimate: number, budget: WclPointsBudget): string | null {
    if (spent + estimate > POINTS_CAP) return `stopped at the ${POINTS_CAP}-point cap`;
    return this.affords(budget, estimate) ? null : `stopped at the ${INGEST_POINTS_MARGIN}-point margin`;
  }

  private affords(budget: WclPointsBudget, estimate: number): boolean {
    return budget.limitPerHour - budget.pointsSpentThisHour - estimate >= INGEST_POINTS_MARGIN;
  }

  /** Every benched pair of a current encounter whose stored cohort is missing, older than a week, or baked under another version or plan. */
  private async duePairs(encounters: readonly IngestEncounter[], nowS: number): Promise<ContrastPair[]> {
    const current = new Set(encounters.map(encounter => encounter.id));
    const pairs: ContrastPair[] = [];
    for (const spec of await this.dataFile.listSpecs()) {
      const ids = this.ingestState.encounterIdsFromFiles(await this.dataFile.listBenchFiles(spec, LEAD_BENCH)).filter(id => current.has(id));
      if (!ids.length) continue;
      const plan = await this.specPlans.planFor(spec);
      if (!plan.ok) continue;
      const signature = this.cohorts.signature(plan.value.key);
      for (const encounterId of ids) {
        const stored = await this.dataFile.getBench<ContrastBench>(spec, encounterId, CONTRAST_DIR);
        const pair = { spec, encounterId, stored: stored.ok ? stored.value : null, signature };
        if (this.cohorts.due(pair, nowS)) pairs.push(pair);
      }
    }
    return this.cohorts.order(pairs);
  }

  /** A transient failure writes nothing, so the pair stays due; a page too thin for a cohort is stored empty and waits its week. */
  private async fetchPair({ spec, encounterId, signature }: ContrastPair, partitionIds: readonly number[], nowS: number): Promise<PairOutcome> {
    try {
      const cohort = await this.cohort(spec, encounterId, partitionIds);
      const cards: Record<Card, ContrastCard<unknown> | null> = { rotation: null, defensive: null, gear: null, burst: null };
      for (const card of cohort.length ? this.cards(spec) : []) {
        const measured = await this.measure(card, spec, encounterId, cohort);
        if (measured === 'failed') return 'failed';
        cards[card] = measured;
      }
      // Each card holds what its own transform baked, which is that card's measures type.
      const bench = { spec, encounter_id: encounterId, signature, fetched_at_s: nowS, sources: cohort, ...cards } as ContrastBench;
      await this.dataFile.writeBench(spec, encounterId, CONTRAST_DIR, bench);
      return cohort.length ? 'measured' : 'thin';
    } catch (err) {
      this.logger.logWarn(`ingest: contrast ${spec}:${encounterId}`, err);
      return 'failed';
    } finally {
      this.wclCache.clearCache();
    }
  }

  /** Newest partition first, as the top logs are picked; the first one whose page carries a full cohort is used. */
  private async cohort(spec: string, encounterId: number, partitionIds: readonly number[]): Promise<ParseRanking[]> {
    const page = VERDICT_CHOICES.discrimination.rankingsPage;
    const metric = this.specRoles.rankingMetric(spec);
    for (const partition of partitionIds.length ? partitionIds : [null]) {
      const raw = await this.wclApi.getRankings(spec, encounterId, partition, metric, page);
      const rows = this.projections.toParseRankings(this.projections.unwrapRankings(raw), RANKINGS_PAGE_ROWS, (page - 1) * RANKINGS_PAGE_ROWS);
      const cohort = this.cohorts.pick(rows);
      if (cohort.length) return cohort;
    }
    return [];
  }

  /** A healer's top logs are ranked on healing, so no damage of theirs is compared and none is fetched. */
  private cards(spec: string): Card[] {
    return this.specRoles.isHealer(spec) ? CARDS.filter(card => card !== 'burst') : [...CARDS];
  }

  /** The card's own transform measures the cohort, so its logs carry exactly the measures a top log does; too few readable logs leave the card null. */
  private async measure(card: Card, spec: string, encounterId: number, cohort: ParseRanking[]): Promise<ContrastCard<unknown> | null | 'failed'> {
    const bench = this.benches.find(entry => entry.file === card);
    if (!bench) return null;
    const result = await bench.transform.getBench(spec, encounterId, cohort);
    if (!result.ok) return result.error.kind === 'missing' ? null : 'failed';
    const { sources, per_parse: perParse } = result.value as { sources?: ParseRanking[]; per_parse?: unknown[] };
    return sources && perParse ? { sources, per_parse: perParse } : null;
  }
}
