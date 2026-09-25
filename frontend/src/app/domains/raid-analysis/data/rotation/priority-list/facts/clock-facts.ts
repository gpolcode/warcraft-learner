import { Injectable } from '@angular/core';
import type { CastMoment, FactContext, FactReader, FactStream, HealthRow, Range } from '../priority-list.models';

const CLOCK = /^(time|fight_remains|expected_combat_length|(?:target\.)?time_to_die(?:\.remains)?)$/;

/** A wipe never shows when the boss would have died, so its end bounds the clock only from below. */
@Injectable({ providedIn: 'root' })
export class ClockFacts implements FactReader {
  readonly streams: FactStream[] = ['targetHealth'];

  matches(name: string): boolean {
    return CLOCK.test(name);
  }

  read(name: string, moment: CastMoment, _action: string, ctx: FactContext): Range {
    const { atS } = moment;
    const end = ctx.fightDurationS;
    if (name === 'time') return [atS, atS];
    if (name === 'expected_combat_length') return ctx.kill ? [end, end] : [end, Infinity];
    const fightLeft: Range = ctx.kill ? [end - atS, end - atS] : [end - atS, Infinity];
    if (name === 'fight_remains' || !moment.target) return fightLeft;
    return this.targetLeft(ctx.targetHealth(moment.target), atS, fightLeft);
  }

  /** An enemy whose last health reading is zero died then; one still standing lived at least that long. */
  private targetLeft(rows: readonly HealthRow[], atS: number, fightLeft: Range): Range {
    const last = rows[rows.length - 1];
    if (!last) return fightLeft;
    const [seenS, share] = last;
    return share === 0 ? [seenS - atS, seenS - atS] : [Math.max(0, seenS - atS), Infinity];
  }
}
