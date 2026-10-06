import { Injectable, inject } from '@angular/core';
import { POOL_TYPES } from '../../../simc/spell-dump-service';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, Range } from '../priority-list.models';
import { FactContextService } from '../fact-context-service';

@Injectable({ providedIn: 'root' })
export class PoolFacts implements FactReader {
  private readonly contexts = inject(FactContextService);
  readonly kind = 'pool';

  streams(): FactStream[] {
    return ['resources'];
  }

  /** `cost` and `energize_amount` read a button's spell data; every other field reads the pool the subject names. */
  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (path.field === 'cost' || path.field === 'energize_amount') return this.listed(path, ctx);
    const type = POOL_TYPES[path.subject];
    const at = type === undefined ? null : this.poolAt(moment, type, ctx);
    if (!at || type === undefined) return UNKNOWN;
    if (path.field === 'amount') return at.amount;
    if (path.field === 'max') return [at.max, at.max];
    return path.field === 'regen' ? this.regen(moment, type, ctx) : UNKNOWN;
  }

  /** The spell data's own number, which talents and buffs may bend. */
  private listed(path: FactPath, ctx: FactContext): Range {
    const spell = ctx.list.spells[path.subject];
    const amount = path.field === 'cost' ? spell?.costs[0]?.amount : spell?.energize?.amount;
    return amount === undefined ? UNKNOWN : [amount, amount];
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
