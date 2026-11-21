import { Injectable } from '@angular/core';
import { deviation, median, rollup } from 'd3-array';
import { round } from './analysis-math';
import { CdHoldTargets } from '../encounter/encounter.models';

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
