import { Injectable, inject } from '@angular/core';
import { mode, quantile } from 'd3-array';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import type { ButtonBench } from '../rotation-data-source';
import { CastCheck, ListCheckService, LogReading, OrderCheck } from './list-check-service';

/** Below this many top logs a share is one log's habit rather than the field's. */
export const MIN_MEASURED_PARSES = 5;
/** All but the sloppiest top log stays at or under the tolerance. */
const TOLERANCE_Q = 0.9;
/** Past this the field strays from a button's lines more often than not, so the list does not describe how it is played. */
const MAX_TOLERANCE = 0.5;
const SHARE_DIGITS = 3;

@Injectable({ providedIn: 'root' })
export class ListBenchService {
  private readonly checks = inject(ListCheckService);

  bench(list: PriorityList, readings: LogReading[]): ButtonBench[] {
    return [...this.checks.buttons(list)].flatMap(([action, lines]) => {
      const offTolerance = this.offTolerance(readings.map(reading => reading.casts.get(action) ?? []));
      const skipTolerance = this.skipTolerance(readings.map(reading => reading.order.filter(check => check.expected === action)), action);
      const ids = readings.flatMap(reading => reading.ids.get(action) ?? []);
      if ((offTolerance === null && skipTolerance === null) || !ids.length) return [];
      return [{
        action, spell_id: mode(ids), off_tolerance: offTolerance, skip_tolerance: skipTolerance,
        allowed: lines.map((_, index) => this.allowed(readings, action, index)),
      }];
    });
  }

  private offTolerance(perLog: CastCheck[][]): number | null {
    const judged = perLog.map(checks => checks.filter(check => check.verdict !== 'unjudged')).filter(checks => checks.length);
    return this.tolerance(judged.map(checks => checks.filter(check => check.verdict === 'off').length / checks.length));
  }

  private skipTolerance(perLog: OrderCheck[][], action: string): number | null {
    const decided = perLog.filter(checks => checks.length);
    return this.tolerance(decided.map(checks => checks.filter(check => check.pressed !== action).length / checks.length));
  }

  private tolerance(shares: number[]): number | null {
    if (shares.length < MIN_MEASURED_PARSES) return null;
    const tolerance = quantile([...shares].sort((a, b) => a - b), TOLERANCE_Q) ?? 0;
    return tolerance >= MAX_TOLERANCE ? null : round(tolerance, SHARE_DIGITS);
  }

  private allowed(readings: LogReading[], action: string, index: number): number {
    const on = readings.flatMap(reading => reading.casts.get(action) ?? []).filter(check => check.verdict === 'on');
    return on.length ? round(on.filter(check => check.line === index).length / on.length, SHARE_DIGITS) : 0;
  }
}
