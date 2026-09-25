import { Injectable } from '@angular/core';
import type { TimedEvent } from '../../../analysis/wcl-projections-service';
import type { CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const PRIOR = /^(?:prev_gcd\.(\d+)|prev|prev_off_gcd)\.(\w+)$/;
const LAST_USED = /^action\.(\w+)\.last_used$/;

/** The player's cast order. A cast the list never names is a utility press, not part of the rotation SimC counts. */
@Injectable({ providedIn: 'root' })
export class PriorCastFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return PRIOR.test(name) || LAST_USED.test(name) || name === 'combo_strike';
  }

  read(name: string, moment: CastMoment, action: string, ctx: FactContext): Range {
    const before = ctx.casts.slice(0, moment.index).filter(event => ctx.gcd(event.abilityGameID) !== null).reverse();
    const used = LAST_USED.exec(name)?.[1];
    if (used) return this.lastUsed(before.find(event => ctx.castIds(used).has(event.abilityGameID)), moment.atS);
    const onGcd = before.filter(event => ctx.gcd(event.abilityGameID));
    if (name === 'combo_strike') return this.flag(!this.cast(onGcd[0], ctx.castIds(action)));
    const [, back, token = ''] = PRIOR.exec(name) ?? [];
    const ids = ctx.castIds(token);
    if (back) return this.flag(this.cast(onGcd[Number(back) - 1], ids));
    if (name.startsWith('prev.')) return this.flag(this.cast(before[0], ids));
    const lastGcd = before.findIndex(event => ctx.gcd(event.abilityGameID));
    return this.flag((lastGcd === -1 ? before : before.slice(0, lastGcd)).some(event => ids.has(event.abilityGameID)));
  }

  private cast(event: TimedEvent | undefined, ids: ReadonlySet<number>): boolean {
    return !!event && ids.has(event.abilityGameID);
  }

  private lastUsed(last: TimedEvent | undefined, atS: number): Range {
    return last ? [atS - last.atS, atS - last.atS] : [Infinity, Infinity];
  }

  private flag(holds: boolean): Range {
    return holds ? [1, 1] : [0, 0];
  }
}
