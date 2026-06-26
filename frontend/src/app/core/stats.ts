/**
 * Shared, total-function statistics helpers wrapping `d3-array`.
 *
 * These were previously hand-rolled and duplicated identically across the
 * rotation / defensive / burst transform services. d3-array's `mean` / `median` /
 * `deviation` / `quantile` return `undefined` for empty (or, for `deviation`,
 * single-element) inputs; the wrappers below restore the project contract that
 * a stat helper is total - it never throws and returns `0` for empty input.
 *
 * Importing this generic primitive module (and `d3-array`) is an explicit
 * exception to the per-slice self-containment rule, the same way `Math` is: it
 * carries no domain logic, only pure arithmetic.
 */
import { mean as d3Mean, median as d3Median, deviation as d3Deviation, quantile as d3Quantile } from 'd3-array';

/** Arithmetic mean; `0` for an empty list. */
export function mean(values: number[]): number {
  return values.length ? d3Mean(values)! : 0;
}

/** Median; `0` for an empty list. */
export function median(values: number[]): number {
  return values.length ? d3Median(values)! : 0;
}

/** Sample standard deviation (n-1); `0` for fewer than two values. */
export function sampleStdev(values: number[]): number {
  return values.length >= 2 ? d3Deviation(values)! : 0;
}

/** The `p` quantile (0..1), e.g. `percentile(values, 0.9)` for p90; `0` for an empty list. */
export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return d3Quantile(sorted, p)!;
}

/** Round to `decimals` places (default 1). d3-array has no equivalent. */
export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
