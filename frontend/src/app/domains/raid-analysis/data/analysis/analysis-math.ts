import { deviation, least, mean, median, pairs } from 'd3-array';
import { AnalysisFinding } from './analysis.models';
import { CadenceBenchmark } from '../encounter/encounter.models';

/** d3-array has no rounding helper. */
export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function avgOr<T>(values: number[], fallback: T, decimals = 1): number | T {
  return values.length ? round(mean(values) ?? 0, decimals) : fallback;
}

export function stddevOr<T>(values: number[], fallback: T, decimals = 1): number | T {
  return values.length ? round(deviation(values) ?? 0, decimals) : fallback;
}

export function medianOr<T>(values: number[], fallback: T): number | T {
  return values.length ? round(median(values) ?? 0) : fallback;
}

/** Gaps between successive casts, per entry: an entry's first cast opens no gap, and gaps never span two entries. */
export function castGaps(entries: { cast_times_s: number[] }[]): number[] {
  return entries.flatMap(entry => pairs(entry.cast_times_s, (prev, next) => next - prev));
}

/** Inserts `makeDefault()` first when `key` is absent, so a caller can group-and-append in one call instead of a has/set guard plus a non-null get. */
export function getOrInsert<K, V>(map: Map<K, V>, key: K, makeDefault: () => V): V {
  let value = map.get(key);
  if (value === undefined) {
    value = makeDefault();
    map.set(key, value);
  }
  return value;
}

export function groupByTime<T extends { time_s: number }>(windows: T[], mergeS: number): T[][] {
  const sorted = [...windows].sort((a, b) => a.time_s - b.time_s);
  const clusters: T[][] = [];
  let open: { members: T[]; times: number[] } | null = null;
  for (const window of sorted) {
    if (open && Math.abs(window.time_s - (median(open.times) ?? 0)) <= mergeS) {
      open.members.push(window);
      open.times.push(window.time_s);
    } else {
      open = { members: [window], times: [window.time_s] };
      clusters.push(open.members);
    }
  }
  return clusters;
}

export const OUTLIER_SIGMAS = 2;

/** Floor on a timing band's half-width, so top logs that agree to the second do not flag a cast a second off theirs. */
export const TIMING_BAND_MIN_S = 2;

export function isOutlierAbove(value: number, mean: number, stddev: number, sigmas = OUTLIER_SIGMAS, minBand = 0): boolean {
  return value > mean + Math.max(sigmas * stddev, minBand);
}

export function isOutlierBeyond(value: number, mean: number, stddev: number, sigmas = OUTLIER_SIGMAS, minBand = 0): boolean {
  return Math.abs(value - mean) > Math.max(sigmas * stddev, minBand);
}

export function isOutlierBelow(value: number, mean: number, stddev: number, sigmas = 2): boolean {
  return value < mean - sigmas * stddev;
}

/** A talent-gated button counts as taken only when the pull's talents show one of its entries; with no entries or no talents to read, the pull cannot tell, so an unpressed one stays unjudged. */
export function buttonTaken(
  button: { talent_gated?: boolean; talent_entries?: number[] }, talents: ReadonlyMap<number, number> | null,
): boolean {
  if (!button.talent_gated) return true;
  if (!talents || !button.talent_entries?.length) return false;
  return button.talent_entries.some(entry => (talents.get(entry) ?? 0) > 0);
}

export function castEfficiencyPct(totalDowntimeS: number, fightDurS: number): number {
  return Math.max(0, (1 - totalDowntimeS / fightDurS) * 100);
}

export function closestToZero(values: number[]): number {
  return least(values, value => Math.abs(value)) ?? 0;
}

/** Absorbs float error in a quotient that is whole in exact arithmetic, so a cast landing on the pull's last second still counts. */
const WHOLE_CAST_TOLERANCE = 1e-9;

/** Paced by the top first cast and average gap, not the cooldown, since top raiders hold some buttons past it. */
function castsCadenceFits(fightDurS: number, avgFirstCastS: number, avgGapS: number | null): number {
  if (fightDurS < avgFirstCastS) return 0;
  if (!avgGapS) return Infinity;
  return 1 + Math.floor((fightDurS - avgFirstCastS) / avgGapS + WHOLE_CAST_TOLERANCE);
}

export function benchExpectedUses(
  fightDurS: number, bench: Pick<CadenceBenchmark, 'uses_per_min' | 'avg_first_cast_s' | 'avg_gap_s'>,
): { expected: number; floor: number } {
  const fightMin = fightDurS / 60;
  const upm = bench.uses_per_min;
  // The rate alone rounds 12.6 up to a 13th cast that would land after the pull ends.
  const expected = Math.min(
    Math.round(upm.avg * fightMin), castsCadenceFits(fightDurS, bench.avg_first_cast_s, bench.avg_gap_s));
  const floor = Math.max(0, Math.round(expected - upm.stddev * fightMin));
  return { expected, floor };
}

export function fmtClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

const SEVERITY_ORDER: Record<AnalysisFinding['severity'], number> = {
  critical: 0, warning: 1, info: 2, hold_suggestion: 2, success: 3,
};
export function sortBySeverity(findings: AnalysisFinding[]): void {
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
