import { Injectable, inject } from '@angular/core';
import { greatest } from 'd3-array';
import { getOrInsert } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import type { WclEvent } from '../../wcl/wcl.models';
import { WclProjectionsService, TimedEvent } from '../../analysis/wcl-projections-service';
import { AuraWindowsService } from '../../analysis/aura-windows-service';
import { BLOODLUST_IDS } from '../rotation-bloodlust-service';
import type { DamageRow, FactContext, HealthRow, ResourceChange, ResourceRow } from './priority-list.models';

/** WCL flattens one actor's pools onto the event; 1 means they belong to the caster, 2 to whoever was hit. */
const RESOURCE_ACTOR_SOURCE = 1;
const RESOURCE_ACTOR_TARGET = 2;
const MANA = 0;
/** The combat log keeps some pools in tenths (rage 1300 for 130); a list names them in the game's units, which never pass these caps. */
const SMALL_POOL_CAP = 10;
const LARGE_POOL_CAP = 200;
const SMALL_POOLS = new Set([4, 5, 7, 9, 12, 19]);
/** Latency only ever lengthens a logged cast, so a factor past these reads as noise rather than haste. */
const HASTE_FACTOR_MIN = 0.4;
const HASTE_FACTOR_MAX = 1;

export interface FactInputs {
  list: PriorityList;
  casts: TimedEvent[];
  buffs: TimedEvent[];
  /** Only the player's own, out of the raid-wide stream. */
  debuffs: TimedEvent[];
  damage: TimedEvent[];
  resources: TimedEvent[];
  talents: ReadonlyMap<number, number> | null;
  fightDurationS: number;
  kill: boolean;
}

export interface Pool {
  before: number;
  left: number;
  max: number;
}

@Injectable({ providedIn: 'root' })
export class FactContextService {
  private readonly auraWindows = inject(AuraWindowsService);
  private readonly projections = inject(WclProjectionsService);

  build(input: FactInputs): FactContext {
    const { list, buffs, debuffs, damage } = input;
    const casts = input.casts.filter(event => event.type === 'cast').sort((a, b) => a.atS - b.atS);
    const idsOf = this.perKey((token: string) => new Set(list.spells[token]?.ids ?? []));
    const health = this.lazy(() => this.healthIndex(damage));
    const auraIds = this.perKey((key: string) => this.shownMost(list, key, key.startsWith('self:') ? buffs : debuffs));
    const gcds = this.lazy(() => new Map(Object.values(list.spells).flatMap(spell => spell.ids.map(id => [id, spell.gcd] as const))));
    return {
      list, fightDurationS: input.fightDurationS, kill: input.kill, casts,
      begincasts: input.casts.filter(event => event.type === 'begincast'),
      talents: input.talents,
      castIds: idsOf,
      castTimes: this.perKey((token: string) => casts.filter(event => idsOf(token).has(event.abilityGameID)).map(event => event.atS)),
      auraId: (token, on) => auraIds(`${on}:${token}`),
      selfSpans: this.perKey((id: number) => [...this.auraWindows.buildAuraSpansByTarget(buffs, id).values()].flat().sort((a, b) => a.startS - b.startS)),
      selfStacks: this.perKey((id: number) => this.auraWindows.buildStackTimeline(buffs, id)),
      targetSpans: this.perKey((id: number) => this.auraWindows.buildAuraSpansByTarget(debuffs, id)),
      targetStacks: (id, target) => this.auraWindows.buildStackTimeline(debuffs.filter(event => this.projections.targetKey(event) === target), id),
      damageIndex: this.lazy(() => damage.map((event): DamageRow => [event.atS, this.projections.targetKey(event)]).sort((a, b) => a[0] - b[0])),
      targetHealth: target => health().get(target) ?? [],
      resourcePool: this.perKey((type: number) => this.resourceIndex(casts, type)),
      resourceChanges: this.perKey((type: number) => this.changeIndex(input.resources, type)),
      gcd: id => gcds().get(id) ?? null,
      hasteFactors: this.lazy(() => this.hasteFactors(list, input.casts)),
    };
  }

  /** A cast's own pool in the game's units; null when the cast does not touch it. */
  pool(event: WclEvent, type: number): Pool | null {
    if (event.resourceActor != null && event.resourceActor !== RESOURCE_ACTOR_SOURCE) return null;
    const pool = event.classResources?.find(resource => resource.type === type);
    if (!pool?.max) return null;
    const scale = this.scale(type, pool.max);
    return { before: pool.amount / scale, left: Math.max(0, pool.amount - (pool.cost ?? 0)) / scale, max: pool.max / scale };
  }

  private scale(type: number, max: number): number {
    if (type === MANA) return 1;
    const cap = SMALL_POOLS.has(type) ? SMALL_POOL_CAP : LARGE_POOL_CAP;
    let scale = 1;
    while (max / scale > cap) scale *= 10;
    return scale;
  }

  /** `key` reads `self:token` or `target:token`, so one cache serves both streams; SimC's `bloodlust` is any raider's haste buff. */
  private shownMost(list: PriorityList, key: string, events: TimedEvent[]): number | null {
    const token = key.slice(key.indexOf(':') + 1);
    const ids = token === 'bloodlust' ? [...BLOODLUST_IDS] : list.spells[token]?.ids ?? [];
    const seen = (id: number): number => events.filter(event => event.abilityGameID === id).length;
    const id = greatest(ids, seen);
    return id !== undefined && seen(id) > 0 ? id : null;
  }

  /** So an index no fact reads costs nothing. */
  private lazy<T extends object>(build: () => T): () => T {
    let value: T | undefined;
    return () => (value ??= build());
  }

  private perKey<K, T>(build: (key: K) => T): (key: K) => T {
    const cache = new Map<K, T>();
    return key => getOrInsert(cache, key, () => build(key));
  }

  private resourceIndex(casts: TimedEvent[], type: number): ResourceRow[] {
    return casts.flatMap((event, index) => {
      const pool = this.pool(event, type);
      return pool ? [[event.atS, pool.before, pool.left, pool.max, index] as const] : [];
    });
  }

  private changeIndex(events: TimedEvent[], type: number): ResourceChange[] {
    return events
      .filter(event => event.resourceChangeType === type && event.maxResourceAmount)
      .map((event): ResourceChange => [event.atS, ((event.resourceChange ?? 0) - (event.waste ?? 0)) / this.scale(type, event.maxResourceAmount ?? 0)])
      .sort((a, b) => a[0] - b[0]);
  }

  /** Only the resource-bearing rows carry health, and only for whoever was hit. */
  private healthIndex(damage: TimedEvent[]): Map<string, HealthRow[]> {
    const index = new Map<string, HealthRow[]>();
    for (const event of damage) {
      if (event.resourceActor !== RESOURCE_ACTOR_TARGET || event.hitPoints == null || !event.maxHitPoints) continue;
      getOrInsert(index, this.projections.targetKey(event), (): HealthRow[] => []).push([event.atS, event.hitPoints / event.maxHitPoints]);
    }
    for (const rows of index.values()) rows.sort((a, b) => a[0] - b[0]);
    return index;
  }

  private hasteFactors(list: PriorityList, events: TimedEvent[]): [number, number][] {
    const castTime = new Map(Object.values(list.spells).flatMap(spell => spell.ids.map(id => [id, spell.cast_time] as const)));
    const factors: [number, number][] = [];
    events.forEach((begin, index) => {
      const base = castTime.get(begin.abilityGameID) ?? 0;
      if (begin.type !== 'begincast' || !base) return;
      const done = events.slice(index + 1).find(event => event.abilityGameID === begin.abilityGameID);
      if (done?.type !== 'cast') return;
      factors.push([done.atS, Math.min(HASTE_FACTOR_MAX, Math.max(HASTE_FACTOR_MIN, (done.atS - begin.atS) / base))]);
    });
    return factors;
  }
}
