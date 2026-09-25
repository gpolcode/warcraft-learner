import { Injectable, inject } from '@angular/core';
import { mode, quantile } from 'd3-array';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import type { ButtonBench, LineBench } from '../rotation-data-source';
import { CastCheck, ListCheckService, LogReading, OrderCheck, ReadLine } from './list-check-service';

/** Below this many top logs a share is one log's habit rather than the field's. */
export const MIN_MEASURED_PARSES = 5;
/** All but the sloppiest top log stays at or under the tolerance. */
const TOLERANCE_Q = 0.9;
/** Past this the field strays from a button's lines more often than not, so the list does not describe how it is played. */
const MAX_TOLERANCE = 0.5;
const SPREAD_LOW_Q = 0.1;
const SPREAD_HIGH_Q = 0.9;
const SHARE_DIGITS = 3;
const VALUE_DIGITS = 1;

/** What the top logs do with each button of the list: how often they stray from its lines and skip it in the order, how their casts split over its lines, and what each term measures at their casts. */
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
        lines: lines.map((line, index) => this.lineBench(readings, action, line, index)),
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

  private lineBench(readings: LogReading[], action: string, line: ReadLine, index: number): LineBench {
    const casts = readings.flatMap(reading => reading.casts.get(action) ?? []);
    const on = casts.filter(check => check.verdict === 'on');
    return {
      allowed: on.length ? round(on.filter(check => check.line === index).length / on.length, SHARE_DIGITS) : 0,
      spreads: (line.terms ?? []).map((term, at) => (term.type === 'BinaryExpression' ? this.spread(casts.map(check => check.lines[index]?.terms[at]?.value)) : null)),
    };
  }

  private spread(ranges: (readonly [number, number] | null | undefined)[]): readonly [number, number] | null {
    const points = ranges.flatMap(range => (range && range[0] === range[1] && Number.isFinite(range[0]) ? [range[0]] : [])).sort((a, b) => a - b);
    if (!points.length) return null;
    return [round(quantile(points, SPREAD_LOW_Q) ?? 0, VALUE_DIGITS), round(quantile(points, SPREAD_HIGH_Q) ?? 0, VALUE_DIGITS)];
  }
}
