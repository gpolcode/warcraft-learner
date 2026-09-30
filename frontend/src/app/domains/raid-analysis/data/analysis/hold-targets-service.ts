import { Injectable } from '@angular/core';
import { deviation, median, rollup } from 'd3-array';
import { round, fmtClock } from './analysis-math';
import { CdHoldTargets } from '../encounter/encounter.models';
import { AnalysisFinding } from './analysis.models';

@Injectable({ providedIn: 'root' })
export class HoldTargetsService {

  // Prior-relative: each cast is measured against the prior ACTUAL cast + the cooldown, not a cumulative ideal schedule, so a single hold does not cascade into later casts.
  detectHoldWindows(castTimesS: number[], effectiveCd: number): HoldWindow[] {
    const holdWindows: HoldWindow[] = [];
    let prevS: number | undefined;
    castTimesS.forEach((actual, castIndex) => {
      if (prevS != null) {
        const delay = actual - (prevS + effectiveCd);
        if (delay > HOLD_THRESHOLD_S) {
          holdWindows.push({ cast_index: castIndex + 1, actual_s: round(actual), delay_s: round(delay) });
        }
      }
      prevS = actual;
    });
    return holdWindows;
  }

  // `target_s` is the absolute clock median the plan shows; `delay_s`/`band_s`/`effective_cd_s` are the prior-relative band the runtime compares the player's own gap against.
  buildHoldTargets(
    entries: HoldWindowSource[], effectiveCd: number, totalSamples = entries.length,
  ): CdHoldTargets {
    const byIndex = rollup(
      entries.flatMap(entry => entry.hold_windows),
      holds => ({ actuals: holds.map(hold => hold.actual_s), delays: holds.map(hold => hold.delay_s) }),
      hold => hold.cast_index,
    );
    const targets: CdHoldTargets = {};
    for (const [castIndex, { actuals, delays }] of byIndex.entries()) {
      if (actuals.length >= Math.max(2, totalSamples * HOLD_CONSENSUS_FRAC)) {
        const delayStddev = round(deviation(delays) ?? 0);
        targets[String(castIndex)] = {
          target_s: round(median(actuals) ?? 0),
          delay_s: round(median(delays) ?? 0),
          band_s: round(Math.max(delayStddev, HOLD_BAND_MIN_S)),
          effective_cd_s: round(effectiveCd),
          count: actuals.length,
          total_samples: totalSamples,
        };
      }
    }
    return targets;
  }

  /** Prior-relative (cascade-free): compares the player's own gap from their previous cast against the band; flags only a clear under-hold whose press is still on cooldown at the recommended slot, tolerates over-holding. */
  holdSuggestionFindings(
    name: string, castTimesS: number[], holdTargets: CdHoldTargets, fightDurationS: number,
  ): AnalysisFinding[] {
    const findings: AnalysisFinding[] = [];
    if (!castTimesS.length) return findings;
    // The player's casts as (prior, cast) pairs keyed by 1-based cast number; cast 1 has no prior, so no pair.
    const priorPairs = new Map<number, { castS: number; prevCastS: number }>();
    let prev: number | undefined;
    castTimesS.forEach((castS, index) => {
      if (prev != null) priorPairs.set(index + 1, { castS, prevCastS: prev });
      prev = castS;
    });
    for (const [idxStr, target] of Object.entries(holdTargets)) {
      // A hold target past the player's own cast count has no pair to judge.
      const pair = priorPairs.get(parseInt(idxStr, 10));
      if (!pair) continue;
      const { castS, prevCastS } = pair;
      const readyS = prevCastS + target.effective_cd_s;
      // From the player's own cooldown, never the top logs' clock, since the band judges the gap from the prior cast.
      const holdToS = readyS + target.delay_s;
      const underHeld = castS - readyS < target.delay_s - target.band_s;
      // An early press already back by the slot costs nothing there, as with a short cooldown pressed on cooldown.
      const blocksSlot = castS + target.effective_cd_s > holdToS;
      // A hold past the pull's end would mean not pressing it at all.
      if (underHeld && blocksSlot && holdToS < fightDurationS) {
        findings.push({
          severity: 'info',
          category: 'hold_suggestion',
          timestamp_s: castS,
          measured: { value: fmtClock(castS), unit: `hold to ${fmtClock(holdToS)}` },
          message: `${name} cast ${idxStr} at ${fmtClock(castS)}. ${target.count} of ${target.total_samples} top raiders wait ${Math.round(target.delay_s)}s after it is ready.`,
          details: { remedy: `Hold ${name} to ${fmtClock(holdToS)}.`, cd_name: name },
          occurrences: [],
        });
      }
    }
    return findings;
  }
}

const HOLD_THRESHOLD_S = 8.0;
export const HOLD_CONSENSUS_FRAC = 0.5;
/** Floor on the runtime tolerance band half-width, so a tight cluster still tolerates jitter. */
export const HOLD_BAND_MIN_S = 5.0;

export interface HoldWindow {
  cast_index: number;
  actual_s: number;
  delay_s: number;
}

export interface HoldWindowSource {
  hold_windows: HoldWindow[];
}
