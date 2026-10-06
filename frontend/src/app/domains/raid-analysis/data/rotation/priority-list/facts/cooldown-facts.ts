import { Injectable } from '@angular/core';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, Range } from '../priority-list.models';

interface Charges {
  charges: number;
  /** Seconds until one charge is back; 0 while one is up. */
  remains: number;
  full: number;
}

/** `slow` is the rebuild at the spell data's recharge, `fast` at the fastest the log shows. */
const FIELDS: Record<string, ((slow: Charges, fast: Charges) => Range) | undefined> = {
  remains: (slow, fast) => [fast.remains, slow.remains],
  charges: (slow, fast) => [Math.floor(slow.charges), Math.floor(fast.charges)],
  charges_fractional: (slow, fast) => [slow.charges, fast.charges],
  full_recharge_time: (slow, fast) => [fast.full, slow.full],
};

@Injectable({ providedIn: 'root' })
export class CooldownFacts implements FactReader {
  readonly kind = 'cooldown';

  streams(): FactStream[] {
    return [];
  }

  answers({ field }: FactPath): boolean {
    return field in FIELDS || field === 'max_charges' || field === 'duration';
  }

  read(path: FactPath, { atS }: CastMoment, ctx: FactContext): Range {
    const spell = ctx.list.spells[path.subject];
    if (!spell) return UNKNOWN;
    const casts = ctx.castTimes(path.subject);
    const fastest = this.fastest(casts, spell.charges, spell.cooldown);
    if (path.field === 'max_charges') return [spell.charges, spell.charges];
    if (path.field === 'duration') return [fastest, spell.cooldown];
    return FIELDS[path.field]?.(this.rebuild(casts, spell.charges, spell.cooldown, atS), this.rebuild(casts, spell.charges, fastest, atS)) ?? UNKNOWN;
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
