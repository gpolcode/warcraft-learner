import { Injectable, inject } from '@angular/core';
import { POOL_TYPES } from '../../../simc/spell-dump-service';
import { UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords, Range } from '../priority-list.models';
import { Words } from '../list-words';
import { FactContextService } from '../fact-context-service';

interface PoolState {
  amount: Range;
  max: number;
  /** Gain a second since the last cast that reported the pool; unknown on a cast that does not. */
  regen: () => Range;
}

const stated = (amount: number | undefined): Range => (amount === undefined ? UNKNOWN : [amount, amount]);
const timeToMax = (state: PoolState): Range => {
  const [perS] = state.regen();
  const deficit = state.max - state.amount[1];
  return perS > 0 && perS !== Infinity ? [deficit / perS, deficit / perS] : UNKNOWN;
};
const DEFICIT: FieldWords = {
  frame: 'amount', unit: pool => `${pool} missing`,
  at: (noun, op, n) => (n === '0' && (op === '<=' || op === '=') ? `at full ${noun}` : `with ${Words.bound(op, n)} ${noun} missing`),
};
const REGEN: FieldWords = { frame: 'amount', unit: 'a second', at: (noun, op, n) => `with ${noun} regen ${Words.lessMore(op)} ${n} a second` };
const TIME_TO_MAX: FieldWords = { frame: 'away', unit: 's to full', at: (noun, op, n) => `when ${noun} is ${Words.lessMore(op)} ${Words.secs(n)} from full` };
const deficit = ({ amount: [lo, hi], max }: PoolState): Range => [max - hi, max - lo];

const FIELDS: Record<string, FieldRow<PoolState> | undefined> = {
  amount: {
    value: state => state.amount,
    words: { frame: 'amount', unit: pool => pool, at: (noun, op, n) => (n === 'full' && !Words.below(op) ? `at full ${noun}` : `at ${Words.bound(op, n)} ${noun}`) },
  },
  deficit: { value: deficit, words: DEFICIT },
  base_deficit: { value: deficit, words: DEFICIT },
  pct: { value: ({ amount: [lo, hi], max }) => [(lo / max) * 100, (hi / max) * 100], words: { frame: 'percent', unit: pool => `% ${pool}` } },
  max: { value: ({ max }) => [max, max], words: { frame: 'amount', label: 'cap', unit: pool => pool } },
  regen: { value: state => state.regen(), words: REGEN },
  regen_combined: { value: state => state.regen(), words: REGEN },
  time_to_max: { value: timeToMax, words: TIME_TO_MAX },
  base_time_to_max: { value: timeToMax, words: TIME_TO_MAX },
  cost: { words: { frame: 'amount', unit: '', at: (noun, op, n) => `when ${noun} costs ${Words.bound(op, n)}` } },
  energize_amount: { words: { frame: 'amount', unit: '', at: (noun, op, n) => `when ${noun} gives ${Words.bound(op, n)}` } },
};

/** A resource pool in the game's own units, or what a button costs and gives by its spell data. */
@Injectable({ providedIn: 'root' })
export class PoolFacts implements FactReader {
  private readonly contexts = inject(FactContextService);
  readonly kinds: FactKind[] = ['pool'];
  readonly fields = FIELDS;

  streams(path: FactPath): FactStream[] {
    return path.spell ? [] : ['resources'];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (path.spell) return this.stated(path, ctx);
    const row = FIELDS[path.field];
    const type = POOL_TYPES[path.subject];
    if (!row?.value || type === undefined) return UNKNOWN;
    const at = this.poolAt(moment, type, ctx);
    return at ? row.value({ ...at, regen: () => this.regen(moment, type, ctx) }, path) : UNKNOWN;
  }

  /** The spell data's own number, which talents and buffs may bend. */
  private stated(path: FactPath, ctx: FactContext): Range {
    const spell = ctx.list.spells[path.subject];
    if (path.field === 'cost') return stated(spell?.costs[0]?.amount);
    return path.field === 'energize_amount' ? stated(spell?.energize?.amount) : UNKNOWN;
  }

  /** Only a cast that touches a pool spends it, so between two such casts the logged changes are all it does, bar passive regen, which only ever adds. */
  private poolAt(moment: CastMoment, type: number, ctx: FactContext): { amount: Range; max: number } | null {
    const own = this.contexts.pool(moment.event, type);
    if (own) return { amount: [own.before, own.before], max: own.max };
    const rows = ctx.resourcePool(type);
    const last = rows.filter(row => row[4] < moment.index).pop();
    const next = rows.find(row => row[4] > moment.index);
    const max = (last ?? next)?.[3];
    if (max === undefined) return null;
    const changed = (fromS: number, toS: number): number => ctx.resourceChanges(type)
      .filter(([atS]) => atS >= fromS && atS < toS).reduce((sum, [, amount]) => sum + amount, 0);
    const lo = last ? last[2] + changed(last[0], moment.atS) : 0;
    const hi = next ? next[1] - changed(moment.atS, next[0]) : max;
    return { amount: [Math.max(0, Math.min(lo, hi)), Math.min(max, Math.max(lo, hi))], max };
  }

  /** The rise from what the last cast left to what this one found, procs included; readable only on a cast that reports the pool. */
  private regen(moment: CastMoment, type: number, ctx: FactContext): Range {
    const own = this.contexts.pool(moment.event, type);
    const previous = ctx.resourcePool(type).filter(row => row[4] < moment.index).pop();
    if (!own || !previous) return UNKNOWN;
    const perS = (own.before - previous[2]) / (moment.atS - previous[0]);
    return [perS, perS];
  }
}
