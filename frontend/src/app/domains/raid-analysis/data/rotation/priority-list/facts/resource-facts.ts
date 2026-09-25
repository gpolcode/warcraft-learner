import { Injectable, inject } from '@angular/core';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';
import { FactContextService } from '../fact-context-service';

/** WCL's `classResources` type for each pool a SimC list names. */
const POOLS: Record<string, number | undefined> = {
  mana: 0, rage: 1, focus: 2, energy: 3, combo_points: 4, rune: 5, runic_power: 6, soul_shard: 7,
  astral_power: 8, holy_power: 9, maelstrom: 11, chi: 12, insanity: 13, fury: 17, essence: 19,
};
const RESOURCE = /^([a-z_]+?)(?:\.(deficit|pct|max|regen|regen_combined|time_to_max))?$/;
const COMBO_POINTS = 4;

const POOL_FIELDS: Record<string, ((amount: Range, max: number) => Range) | undefined> = {
  '': amount => amount,
  deficit: ([lo, hi], max) => [max - hi, max - lo],
  pct: ([lo, hi], max) => [(lo / max) * 100, (hi / max) * 100],
  max: (_, max) => [max, max],
};

/** The player's pools: exact on a cast that touches the pool, else rebuilt from the casts either side and the gains and drains between them. */
@Injectable({ providedIn: 'root' })
export class ResourceFacts implements FactReader {
  private readonly contexts = inject(FactContextService);
  readonly streams: FactStream[] = ['resources'];

  matches(name: string): boolean {
    return name === 'cp_max_spend' || POOLS[RESOURCE.exec(name)?.[1] ?? ''] !== undefined;
  }

  read(name: string, moment: CastMoment, _action: string, ctx: FactContext): Range {
    const [, pool = '', field = ''] = RESOURCE.exec(name) ?? [];
    const type = name === 'cp_max_spend' ? COMBO_POINTS : POOLS[pool] ?? -1;
    const at = this.poolAt(moment, type, ctx);
    if (!at) return UNKNOWN;
    const read = POOL_FIELDS[name === 'cp_max_spend' ? 'max' : field];
    return read ? read(at.amount, at.max) : this.regen(field, moment, type, ctx, at.max - at.amount[1]);
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
  private regen(field: string, moment: CastMoment, type: number, ctx: FactContext, deficit: number): Range {
    const own = this.contexts.pool(moment.event, type);
    const previous = ctx.resourcePool(type).filter(row => row[4] < moment.index).pop();
    if (!own || !previous) return UNKNOWN;
    const perS = (own.before - previous[2]) / (moment.atS - previous[0]);
    if (field !== 'time_to_max') return [perS, perS];
    return perS > 0 ? [deficit / perS, deficit / perS] : UNKNOWN;
  }
}
