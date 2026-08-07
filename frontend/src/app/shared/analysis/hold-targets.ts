import { deviation, median } from 'd3-array';
import { fmtClock } from './analysis-math';
import { CdHoldTargets } from '../../core/models/encounter.models';
import { AnalysisFinding } from '../../core/models/analysis.models';

/** A gap beyond this past the expected on-cooldown time counts as a deliberate hold. */
export const HOLD_THRESHOLD_MS = 8000;
/** A hold target surfaces only when a MAJORITY of sampled parses hold at that index. */
export const HOLD_CONSENSUS_FRAC = 0.5;
/** Floor on the runtime tolerance band half-width, so a tight cluster still tolerates jitter. */
export const HOLD_BAND_MIN_MS = 5000;

export interface HoldWindow {
  cast_index: number;
  actual_ms: number;
  delay_ms: number;
}

/** Anything carrying the per-parse hold windows a bench aggregates over. */
export interface HoldWindowSource {
  hold_windows: HoldWindow[];
}

// Prior-relative: each cast is measured against the prior ACTUAL cast + the cooldown, not a
// cumulative ideal schedule, so a single hold does not cascade into every later cast looking held.
export function detectHoldWindows(castTimesMs: number[], effectiveCdMs: number): HoldWindow[] {
  const holdWindows: HoldWindow[] = [];
  for (let castIndex = 1; castIndex < castTimesMs.length; castIndex++) {
    const expected = castTimesMs[castIndex - 1] + effectiveCdMs;
    const actual = castTimesMs[castIndex];
    const delay = actual - expected;
    if (delay > HOLD_THRESHOLD_MS) {
      holdWindows.push({ cast_index: castIndex + 1, actual_ms: Math.round(actual), delay_ms: Math.round(delay) });
    }
  }
  return holdWindows;
}

// `target_ms` is the absolute clock median (display); `delay_ms`/`band_ms`/`effective_cd_ms` are the
// prior-relative band the runtime compares the player's own gap against.
export function buildHoldTargets(
  entries: HoldWindowSource[], effectiveCdMs: number, totalSamples = entries.length,
): CdHoldTargets {
  const byIndex = new Map<number, { actuals: number[]; delays: number[] }>();
  for (const entry of entries) {
    for (const hold of entry.hold_windows) {
      const bucket = byIndex.get(hold.cast_index) ?? { actuals: [], delays: [] };
      bucket.actuals.push(hold.actual_ms);
      bucket.delays.push(hold.delay_ms);
      byIndex.set(hold.cast_index, bucket);
    }
  }
  const targets: CdHoldTargets = {};
  for (const [castIndex, { actuals, delays }] of byIndex.entries()) {
    if (actuals.length >= Math.max(2, totalSamples * HOLD_CONSENSUS_FRAC)) {
      const delayStddev = Math.round(deviation(delays) ?? 0);
      targets[String(castIndex)] = {
        target_ms: Math.round(median(actuals) ?? 0),
        stddev_ms: Math.round(deviation(actuals) ?? 0),
        delay_ms: Math.round(median(delays) ?? 0),
        delay_stddev_ms: delayStddev,
        band_ms: Math.round(Math.max(delayStddev, HOLD_BAND_MIN_MS)),
        effective_cd_ms: Math.round(effectiveCdMs),
        count: actuals.length,
        total_samples: totalSamples,
      };
    }
  }
  return targets;
}

/**
 * Prior-relative (cascade-free): compares the player's own gap from their previous cast against
 * the band. Flags only an under-hold clearly below it; over-holding is tolerated.
 */
export function holdSuggestionFindings(
  name: string, castTimesMs: number[], holdTargets: CdHoldTargets,
): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  if (!castTimesMs.length) return findings;
  for (const [idxStr, target] of Object.entries(holdTargets)) {
    const index = parseInt(idxStr, 10) - 1;
    // Need a prior cast to measure a prior-relative gap; index 0 has none.
    if (index < 1 || index >= castTimesMs.length) continue;
    const playerDelayMs = castTimesMs[index] - castTimesMs[index - 1] - target.effective_cd_ms;
    if (playerDelayMs < target.delay_ms - target.band_ms) {
      const castMs = castTimesMs[index];
      const targetMs = target.target_ms;
      findings.push({
        severity: 'info',
        category: 'hold_suggestion',
        timestamp_ms: Math.round(castTimesMs[index]),
        measured: { value: fmtClock(castMs), unit: `top ${fmtClock(targetMs)}` },
        message: `${name} cast ${idxStr} at ${fmtClock(castMs)}. ${target.count}/${target.total_samples} top parses hold to ${fmtClock(targetMs)}.`,
        details: { remedy: `Hold ${name} to ${fmtClock(targetMs)}.`, cd_name: name },
        occurrences: [],
      });
    }
  }
  return findings;
}
