/**
 * Generic, cross-slice analysis math + formatting helpers: pure, non-domain primitives (rounding,
 * time clustering, outlier predicates, expected-use arithmetic, clock formatting, severity
 * ordering) that several slices need, so each imports one implementation instead of re-declaring it.
 */
import { median } from 'd3-array';
import { AnalysisFinding } from '../../core/models/analysis.models';

/** Round to `decimals` places (default 1). d3-array has no rounding helper. */
export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

/**
 * Return `map`'s value for `key`, inserting `makeDefault()` first when absent - so a caller can
 * group-and-append in one call instead of a `has`/`set` guard plus a non-null `get`.
 */
export function getOrInsert<K, V>(map: Map<K, V>, key: K, makeDefault: () => V): V {
  let value = map.get(key);
  if (value === undefined) {
    value = makeDefault();
    map.set(key, value);
  }
  return value;
}

/** Group windows whose time is within `mergeMs` of the running cluster median. */
export function groupByTime<T extends { time_ms: number }>(windows: T[], mergeMs: number): T[][] {
  const sorted = [...windows].sort((a, b) => a.time_ms - b.time_ms);
  const clusters: T[][] = [];
  let openTimes: number[] = [];
  for (const window of sorted) {
    if (clusters.length && Math.abs(window.time_ms - (median(openTimes) ?? 0)) <= mergeMs) {
      clusters[clusters.length - 1].push(window);
      openTimes.push(window.time_ms);
    } else {
      clusters.push([window]);
      openTimes = [window.time_ms];
    }
  }
  return clusters;
}

/** True when `value` sits more than `sigmas` stddev ABOVE the mean (strict). */
export function isOutlierAbove(value: number, mean: number, stddev: number, sigmas = 2): boolean {
  return value > mean + sigmas * stddev;
}

/** True when `|value - mean|` exceeds `sigmas` stddev (two-tailed, strict). */
export function isOutlierBeyond(value: number, mean: number, stddev: number, sigmas = 2): boolean {
  return Math.abs(value - mean) > sigmas * stddev;
}

/** True when `value` sits more than `sigmas` stddev BELOW the mean (strict). Mirror of `isOutlierAbove`. */
export function isOutlierBelow(value: number, mean: number, stddev: number, sigmas = 2): boolean {
  return value < mean - sigmas * stddev;
}

/** Cast efficiency percentage given total downtime in gaps (clamped to >= 0). */
export function castEfficiencyPct(totalDowntimeMs: number, fightDurationMs: number): number {
  return Math.max(0, (1 - totalDowntimeMs / fightDurationMs) * 100);
}

/** The value closest to zero (smallest absolute value) - the primary BL offset. */
export function closestToZero(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((best, value) => (Math.abs(value) < Math.abs(best) ? value : best));
}

const MS_PER_MIN = 60_000;

/** Data-driven expected + floor uses for a fight from the top-parse uses/min. */
export function benchExpectedUses(
  fightDurationMs: number, upm: { avg: number; stddev: number },
): { expected: number; floor: number } {
  const fightMin = fightDurationMs / MS_PER_MIN;
  const expected = Math.round(upm.avg * fightMin);
  const floor = Math.max(0, Math.round(expected - upm.stddev * fightMin));
  return { expected, floor };
}

/** Format an ms duration as `mm:ss` (zero-padded). */
export function fmtClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}

/** Format an ms duration as a bare seconds number (e.g. "12" or "4.5", no trailing zero) for "Xs" finding text. */
export function secondsLabel(ms: number, decimals = 0): string {
  return String(round(ms / 1000, decimals));
}

const SEVERITY_ORDER: Record<AnalysisFinding['severity'], number> = {
  critical: 0, warning: 1, info: 2, hold_suggestion: 2, success: 3,
};
/** Sort findings in place: critical first, success last (stable for equal ranks). */
export function sortBySeverity(findings: AnalysisFinding[]): void {
  findings.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4));
}
