import { Injectable, inject } from '@angular/core';
import { max, mean, min, mode } from 'd3-array';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import type { ButtonBench } from '../rotation-data-source';
import { ListCheckService, LogReading } from './list-check-service';

/** Below this many top logs a share is one log's habit rather than the field's. */
export const MIN_MEASURED_PARSES = 5;
/** At or under this the field gets a button wrong at least half the time, so the list does not describe how it is played. */
const MIN_FIELD_SHARE = 0.5;
const SHARE_DIGITS = 3;

@Injectable({ providedIn: 'root' })
export class ListBenchService {
  private readonly checks = inject(ListCheckService);

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
}
