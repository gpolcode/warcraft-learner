import { Injectable } from '@angular/core';
import { UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords, Range } from '../priority-list.models';
import { Words } from '../list-words';

interface Charges {
  charges: number;
  /** Seconds until one charge is back; 0 while one is up. */
  remains: number;
  full: number;
}

/** A charged button's state: `slow` is the rebuild at the spell data's recharge, `fast` at the fastest the log shows. */
export interface CooldownState {
  slow: Charges;
  fast: Charges;
  fastest: number;
  recharge: number;
  maxCharges: number;
}

/** What the data says of a button's cooldown: the spell data's, or an item's own. */
export interface Recharge {
  cooldown: number;
  charges: number;
}

const ready = ({ slow, fast }: CooldownState): Range => (slow.remains === 0 ? [1, 1] : fast.remains > 0 ? [0, 0] : [0, 1]);
const remains = ({ slow, fast }: CooldownState): Range => [fast.remains, slow.remains];
const charges = ({ slow, fast }: CooldownState): Range => [Math.floor(slow.charges), Math.floor(fast.charges)];
const duration = ({ fastest, recharge }: CooldownState): Range => [fastest, recharge];
const READY: FieldWords = { frame: 'flag', states: ['Ready', 'On cooldown'], flag: (noun, holds) => (holds ? `when ${noun} is ready` : `while ${noun} is on cooldown`) };
const AWAY: FieldWords = { frame: 'away', label: 'cooldown' };
const CHARGES: FieldWords = { frame: 'count', unit: 'charges' };
const LENGTH: FieldWords = { frame: 'seconds', label: 'cooldown' };

export const COOLDOWN_FIELDS: Record<string, FieldRow<CooldownState> | undefined> = {
  remains: { value: remains, words: AWAY },
  remains_expected: { value: remains, words: AWAY },
  remains_guess: { value: remains, words: AWAY },
  usable_in: { value: remains, words: AWAY },
  ready: { value: ready, words: READY },
  up: { value: ready, words: READY },
  usable: { value: ready, words: READY },
  cooldown_react: { value: ready, words: READY },
  charges: { value: charges, words: CHARGES },
  charges_fractional: { value: ({ slow, fast }) => [slow.charges, fast.charges], words: CHARGES },
  full_recharge_time: {
    value: ({ slow, fast }) => [fast.full, slow.full],
    words: { frame: 'away', unit: 's to full', at: (noun, op, n) => `with full ${noun} charges ${Words.lessMore(op)} ${Words.secs(n)} away` },
  },
  duration: { value: duration, words: LENGTH },
  cooldown: { value: duration, words: LENGTH },
  recharge_time: { value: duration, words: LENGTH },
  max_charges: { value: ({ maxCharges }) => [maxCharges, maxCharges], words: { frame: 'amount', label: 'charge cap', unit: 'charges' } },
};

@Injectable({ providedIn: 'root' })
export class CooldownFacts implements FactReader {
  readonly kinds: FactKind[] = ['cooldown'];
  readonly fields = COOLDOWN_FIELDS;

  streams(): FactStream[] {
    return [];
  }

  read(path: FactPath, { atS }: CastMoment, ctx: FactContext): Range {
    const spell = ctx.list.spells[path.subject];
    return spell ? this.readCasts(path.field, ctx.castTimes(path.subject), spell, atS) : UNKNOWN;
  }

  /** The field over a button's own casts, so an item's use reads the same way as a spell's. */
  readCasts(field: string, casts: readonly number[], recharge: Recharge, atS: number): Range {
    const row = COOLDOWN_FIELDS[field];
    if (!row?.value) return UNKNOWN;
    const fastest = this.fastest(casts, recharge.charges, recharge.cooldown);
    return row.value(this.state(casts, recharge, fastest, atS), { kind: 'cooldown', subject: '', spell: true, field, arg: '', target: false, n: 0 });
  }

  private state(casts: readonly number[], { charges, cooldown }: Recharge, fastest: number, atS: number): CooldownState {
    return { slow: this.rebuild(casts, charges, cooldown, atS), fast: this.rebuild(casts, charges, fastest, atS), fastest, recharge: cooldown, maxCharges: charges };
  }

  /** Casts `charges` apart can be no closer than one recharge, however haste and reductions bent it. */
  private fastest(casts: readonly number[], charges: number, recharge: number): number {
    let fastest = recharge;
    for (let i = 0; i + charges < casts.length; i++) fastest = Math.min(fastest, (casts[i + charges] ?? Infinity) - (casts[i] ?? 0));
    return fastest;
  }

  /** Full at the pull; a cast the rebuild finds no charge for restarts the recharge, since the log shows the button came back. */
  private rebuild(casts: readonly number[], maxCharges: number, recharge: number, atS: number): Charges {
    if (!recharge) return { charges: maxCharges, remains: 0, full: 0 };
    let charges = maxCharges;
    let start: number | null = null;
    const advance = (toS: number): void => {
      while (start !== null && start + recharge <= toS) {
        charges++;
        start = charges < maxCharges ? start + recharge : null;
      }
    };
    for (const castS of casts) {
      if (castS >= atS) break;
      advance(castS);
      if (charges === 0) start = castS;
      else charges--;
      start ??= castS;
    }
    advance(atS);
    const partial = start === null ? 0 : (atS - start) / recharge;
    const next = start === null ? 0 : start + recharge - atS;
    return { charges: charges + partial, remains: charges >= 1 ? 0 : next, full: charges >= maxCharges ? 0 : next + (maxCharges - charges - 1) * recharge };
  }
}
