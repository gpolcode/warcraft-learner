import { Injectable, inject } from '@angular/core';
import { max, mean, min, mode } from 'd3-array';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import type { ButtonBench } from '../rotation-data-source';
import { ButtonCounts, ListCheckService, LogReading } from './list-check-service';
import { ButtonJudgeService } from './button-judge-service';

/** Below this many top logs a share is one log's habit rather than the field's. */
export const MIN_MEASURED_PARSES = 5;
/** At or under this the field gets a button wrong three times in ten or more, so the list does not describe how it is played. */
const MIN_FIELD_SHARE = 0.7;
const SHARE_DIGITS = 3;

@Injectable({ providedIn: 'root' })
export class ListBenchService {
  private readonly checks = inject(ListCheckService);
  private readonly judge = inject(ButtonJudgeService);

  bench(list: PriorityList, readings: LogReading[]): ButtonBench[] {
    return [...this.checks.buttons(list).keys()].flatMap(action => {
      const shares = readings.flatMap(reading => this.checks.rightShare(reading, action) ?? []);
      const avg = mean(shares) ?? 0;
      const ids = readings.flatMap(reading => reading.ids.get(action) ?? []);
      if (shares.length < MIN_MEASURED_PARSES || avg <= MIN_FIELD_SHARE || !ids.length) return [];
      return [{
        action, spell_id: mode(ids),
        right: { lo: round(min(shares) ?? 0, SHARE_DIGITS), avg: round(avg, SHARE_DIGITS), hi: round(max(shares) ?? 0, SHARE_DIGITS) },
      }];
    });
  }

  /** Per log, every list button it had moments for, so a bench can be rebuilt without any one log; a top log is judged over its whole pull. */
  counts(list: PriorityList, readings: LogReading[]): Record<string, ButtonCounts>[] {
    const actions = [...this.checks.buttons(list).keys()];
    return readings.map(reading => Object.fromEntries(actions.flatMap(action => {
      const counts = this.judge.measure(reading, action, Number.POSITIVE_INFINITY);
      return counts ? [[action, counts]] : [];
    })));
  }
}
