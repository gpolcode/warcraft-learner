import { inject, Injectable } from '@angular/core';
import { CadenceBenchmark } from '../encounter/encounter.models';
import { avgOr, stddevOr, medianOr, castGaps, round } from './analysis-math';
import { HoldWindow, HOLD_CONSENSUS_FRAC } from './hold-targets-service';
import { HoldTargetsService } from './hold-targets-service';

@Injectable({ providedIn: 'root' })
export class CastCadenceService {
  private readonly holdTargets = inject(HoldTargetsService);

  /** One log's uses of one cooldown as the cadence bench reads them; ingest and the leave-one-out fold both build entries here. */
  entry(castTimesS: readonly number[], fightDurationS: number, cooldownS: number): CadenceEntry {
    const holdWindows = this.holdTargets.detectHoldWindows([...castTimesS], cooldownS);
    const firstS = castTimesS[0];
    return {
      cast_times_s: castTimesS.map(timeS => round(timeS, 2)),
      first_cast_s: firstS == null ? null : round(firstS),
      fight_duration_s: fightDurationS,
      hold_windows: holdWindows,
      cast_pattern: holdWindows.length ? 'hold' : 'on_cooldown',
    };
  }

  buildCadenceBenchmark(users: CadenceEntry[], effectiveCd: number, totalParses: number): CadenceBenchmark {
    const firstCasts = users.map(user => user.first_cast_s).filter((value): value is number => value != null);
    const gaps = castGaps(users);
    const perMin = users
      .filter(user => user.fight_duration_s > 0 && user.cast_times_s.length > 0)
      .map(user => round(user.cast_times_s.length / user.fight_duration_s * 60, 3));

    return {
      sample_count: totalParses,
      used_sample_count: users.length,
      avg_first_cast_s: avgOr(firstCasts, 0),
      stddev_first_cast_s: stddevOr(firstCasts, 0),
      avg_gap_s: avgOr(gaps, null),
      stddev_gap_s: stddevOr(gaps, null),
      hold_targets: this.holdTargets.buildHoldTargets(users, effectiveCd, totalParses),
      median_uses: medianOr(users.map(user => user.cast_times_s.length), 0),
      uses_per_min: { avg: avgOr(perMin, 0, 3), stddev: stddevOr(perMin, 0, 3) },
      majority_hold: users.length > 0
        && users.filter(user => user.cast_pattern === 'hold').length >= users.length * HOLD_CONSENSUS_FRAC,
    };
  }

  usedByMajority(bench: CadenceBenchmark): boolean {
    return bench.used_sample_count / bench.sample_count >= MIN_USE_SHARE_FRAC;
  }

  holdsOf(bench: CadenceBenchmark | undefined): { castIndex: number; targetS: number }[] {
    if (!bench?.majority_hold) return [];
    return Object.entries(bench.hold_targets)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([idx, target]) => ({ castIndex: Number(idx), targetS: target.target_s }));
  }

  cadencePlanUsage(bench: CadenceBenchmark | undefined): CadencePlanUsage {
    if (!bench) return { typicalUses: null, usedSampleCount: 0, sampleCount: 0, firstCastS: null };
    return {
      // Any adoption yields a number here, unlike the use-share gate on firstCastS.
      typicalUses: bench.used_sample_count > 0 ? bench.median_uses : null,
      usedSampleCount: bench.used_sample_count,
      sampleCount: bench.sample_count,
      firstCastS: this.usedByMajority(bench) ? bench.avg_first_cast_s : null,
    };
  }
}

/** Rows are users-only; `totalParses` carries the non-users. */
export interface CadenceEntry {
  cast_times_s: number[];
  first_cast_s: number | null;
  fight_duration_s: number;
  hold_windows: HoldWindow[];
  cast_pattern: 'hold' | 'on_cooldown';
}

/** A situational ability most top parses skip has a noisy expected count, so flagging against it would be a false positive. */
const MIN_USE_SHARE_FRAC = 0.5;

export interface CadencePlanUsage {
  typicalUses: number | null;
  usedSampleCount: number;
  sampleCount: number;
  firstCastS: number | null;
}
