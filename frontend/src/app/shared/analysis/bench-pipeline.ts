/** The one top-parse benching pipeline every slice benches through: rank, resolve each candidate's report/fight/actor, backfill past unfetchable parses, and hand the slice its own per-parse work and payload assembly. */
import { WclApiService } from '../../core/services/wcl-api';
import { ParseRanking, WclFight, WclReport } from '../../core/models/wcl.models';
import { logWarn } from '../../core/log';
import { Result, ok, missing } from '../../core/result';
import { toLoadError } from '../../core/http-load-error';
import { ReportActor, findParseActor, toParseRankings, unwrapRankings } from './wcl-projections';

export const TOP_PARSE_COUNT = 10;
// Over-fetch so a private/unfetchable top parse can be backfilled by the next-best one; the sample target caps actual fetches at TOP_PARSE_COUNT.
export const CANDIDATE_POOL_COUNT = TOP_PARSE_COUNT * 2;

/** One candidate parse, resolved before the slice's own fetches. */
export interface BenchParse {
  ranking: ParseRanking;
  report: WclReport;
  fight: WclFight;
  player: ReportActor;
}

/** The accepted parses, in acceptance order, plus the encounter name the first of them named. */
export interface BenchPayload<TParse> {
  encounterName: string;
  parses: TParse[];
}

export interface BenchSlice<TParse, TBench> {
  /** logWarn source prefix: the slice's service class name. */
  logSource: string;
  /** Repro id a permanent bench failure carries, e.g. `burst.bench`. */
  errorId: string;
  candidatePoolCount: number;
  /** Accepted parses to stop sampling at. */
  sampleTarget: number;
  /** Fewest accepted parses that still bench. */
  minSamples: number;
  noRankingsMessage: string;
  tooFewParsesMessage: (accepted: number) => string;
  /** logWarn source of a bench-level failure; defaults to `<logSource>.getBench`. */
  benchLogSource?: string;
  /** The slice's per-parse fetch and pure aggregation; null drops the parse so the next candidate backfills it. */
  parse: (parse: BenchParse) => Promise<TParse | null>;
  bench: (payload: BenchPayload<TParse>) => Promise<TBench> | TBench;
}

export async function benchFromTopParses<TParse, TBench>(
  wclApi: WclApiService,
  query: { spec: string; encounterId: number; partition?: number | null },
  slice: BenchSlice<TParse, TBench>,
): Promise<Result<TBench>> {
  const { spec, encounterId, partition } = query;
  try {
    const rankings = toParseRankings(unwrapRankings(await wclApi.getRankings(spec, encounterId, partition)), slice.candidatePoolCount);
    if (!rankings.length) return missing(slice.noRankingsMessage);

    const parses: TParse[] = [];
    let encounterName = '';
    for (const ranking of rankings) {
      const accepted = await parseCandidate(wclApi, slice, ranking);
      if (!accepted) continue;
      parses.push(accepted.parse);
      encounterName ||= accepted.encounterName;
      if (parses.length >= slice.sampleTarget) break;
    }
    if (parses.length < slice.minSamples) return missing(slice.tooFewParsesMessage(parses.length));

    return ok(await slice.bench({ encounterName, parses }));
  } catch (cause) {
    logWarn(slice.benchLogSource ?? `${slice.logSource}.getBench`, cause);
    return toLoadError(cause, slice.errorId);
  }
}

// A parse the report cannot serve (private, expired) or cannot bind to its ranked actor is dropped, never fatal: the pool backfills it.
async function parseCandidate<TParse, TBench>(
  wclApi: WclApiService, slice: BenchSlice<TParse, TBench>, ranking: ParseRanking,
): Promise<{ parse: TParse; encounterName: string } | null> {
  try {
    const report = await wclApi.getReport(ranking.report_code);
    const fight = report.fights.find(entry => entry.id === ranking.fight_id);
    const player = findParseActor(report.masterData?.actors, ranking);
    if (!fight || !player) return null;

    const parse = await slice.parse({ ranking, report, fight, player });
    return parse === null ? null : { parse, encounterName: fight.name };
  } catch (cause) {
    logWarn(`${slice.logSource} parse ${ranking.report_code}:${ranking.fight_id}`, cause);
    return null;
  }
}
