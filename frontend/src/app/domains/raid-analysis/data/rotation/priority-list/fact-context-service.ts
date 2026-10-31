import { Injectable, inject } from '@angular/core';
import { greatest, rollup } from 'd3-array';
import { getOrInsert } from '../../analysis/analysis-math';
import type { PlanLine, PriorityList } from '../../plan/plan.models';
import { TRINKET_SLOTS } from '../../gear/gear-extract-service';
import { DowntimeJudgeService } from '../downtime-judge-service';
import type { WclAbility, WclEvent } from '../../wcl/wcl.models';
import { SpellDumpService } from '../../simc/spell-dump-service';
import { WclProjectionsService, TimedEvent } from '../../analysis/wcl-projections-service';
import { AuraWindowsService } from '../../analysis/aura-windows-service';
import { BLOODLUST_IDS } from '../rotation-bloodlust-service';
import type { AddSpan, DamageRow, EnemyTimeline, FactContext, GearPiece, HealthRow, ResourceChange, ResourceRow } from './priority-list.models';

/** SimC's trinket lines, which `SimcAplService` keeps with the item they name and the fact context resolves to the trinket the player wore. */
export const USE_ITEM = 'use_item';
export const USE_ITEMS = 'use_items';
const TRINKET_NAMES = ['trinket1', 'trinket2'];

/** WCL flattens one actor's pools onto the event; 1 means they belong to the caster, 2 to whoever was hit. */
const RESOURCE_ACTOR_SOURCE = 1;
const RESOURCE_ACTOR_TARGET = 2;
const MANA = 0;
/** The combat log keeps some pools in tenths (rage 1300 for 130); a list names them in the game's units, which never pass these caps. */
const SMALL_POOL_CAP = 10;
const LARGE_POOL_CAP = 200;
const SMALL_POOLS = new Set([4, 5, 7, 9, 12, 19]);
/** An enemy with at least this share of the toughest one's health is a boss, so a council's members are not each other's adds. */
const BOSS_HEALTH_SHARE = 0.5;
/** Latency only ever lengthens a logged cast, so a factor past these reads as noise rather than haste. */
const HASTE_FACTOR_MIN = 0.4;
const HASTE_FACTOR_MAX = 1;

export interface FactInputs {
  list: PriorityList;
  /** The report's own ability names, which stand in for a name the spell data lacks. */
  abilities: WclAbility[];
  casts: TimedEvent[];
  buffs: TimedEvent[];
  /** Only the player's own: every fact reads each row as the player's. */
  debuffs: TimedEvent[];
  damage: TimedEvent[];
  resources: TimedEvent[];
  talents: ReadonlyMap<number, number> | null;
  gear: GearPiece[];
  fightDurationS: number;
  kill: boolean;
  enemyTimeline?: EnemyTimeline | null;
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
  private readonly dumps = inject(SpellDumpService);
  private readonly downtime = inject(DowntimeJudgeService);

  build(input: FactInputs): FactContext {
    const { buffs, debuffs, damage } = input;
    const list = this.withTrinkets(input.list, input.gear);
    const casts = input.casts.filter(event => event.type === 'cast').sort((a, b) => a.atS - b.atS);
    const logged = this.lazy(() => rollup(input.abilities, same => same.map(ability => ability.gameID), ability => this.dumps.tokenize(ability.name)));
    const ids = (token: string): number[] => list.spells[token]?.ids ?? logged().get(token) ?? [];
    const idsOf = this.perKey((token: string) => new Set(ids(token)));
    const health = this.lazy(() => this.healthIndex(damage));
    const damageIndex = this.lazy(() => damage.map((event): DamageRow => [event.atS, this.projections.targetKey(event)]).sort((a, b) => a[0] - b[0]));
    const adds = this.lazy(() => ({ spans: this.addSpans(damage, damageIndex()) }));
    const auraIds = this.perKey((key: string) => this.shownMost(ids, key, key.startsWith('self:') ? buffs : debuffs));
    const gcds = this.lazy(() => new Map(Object.values(list.spells).flatMap(spell => spell.ids.map(id => [id, spell.gcd] as const))));
    return {
      list, fightDurationS: input.fightDurationS, kill: input.kill, casts,
      begincasts: input.casts.filter(event => event.type === 'begincast'),
      talents: input.talents,
      gear: input.gear,
      castIds: idsOf,
      castTimes: this.perKey((token: string) => casts.filter(event => idsOf(token).has(event.abilityGameID)).map(event => event.atS)),
      landings: this.perKey((token: string) => damage.filter(event => !event.tick && idsOf(token).has(event.abilityGameID)).map(event => event.atS).sort((a, b) => a - b)),
      auraId: (token, on) => auraIds(`${on}:${token}`),
      selfSpans: this.perKey((id: number) => [...this.auraWindows.buildAuraSpansByTarget(buffs, id).values()].flat().sort((a, b) => a.startS - b.startS)),
      selfStacks: this.perKey((id: number) => this.auraWindows.buildStackTimeline(buffs, id)),
      targetSpans: this.perKey((id: number) => this.auraWindows.buildAuraSpansByTarget(debuffs, id)),
      targetStacks: (id, target) => this.auraWindows.buildStackTimeline(debuffs.filter(event => this.projections.targetKey(event) === target), id),
      damageIndex,
      targetHealth: target => health().get(target) ?? [],
      addSpans: () => adds().spans,
      resourcePool: this.perKey((type: number) => this.resourceIndex(casts, type)),
      resourceChanges: this.perKey((type: number) => this.changeIndex(input.resources, type)),
      gcd: id => gcds().get(id) ?? null,
      castStartsS: this.lazy(() => this.castStartsS(input.casts, casts, id => gcds().get(id))),
      hasteFactors: this.lazy(() => this.hasteFactors(list, input.casts)),
      idleSpans: this.lazy(() => this.downtime.idleStretches(input.casts, list.spells) ?? []),
      enemyTimeline: input.enemyTimeline ?? null,
    };
  }

  /** Each trinket line becomes a line of the use spell of the trinket worn there, so it reads as a button; a trinket the list has no use spell for is not the player's to press. */
  withTrinkets(list: PriorityList, gear: readonly GearPiece[]): PriorityList {
    if (!list.lines.some(line => line.action === USE_ITEM || line.action === USE_ITEMS)) return list;
    const worn = TRINKET_SLOTS.map(slot => gear.find(piece => piece.slot === slot));
    const items = Object.entries(list.items ?? {});
    const useOf = (piece: GearPiece | undefined): string[] => {
      const use = piece && items.find(([, item]) => item.id === piece.id)?.[1].use;
      return use && list.spells[use] ? [use] : [];
    };
    const pieceOf = (item: string | undefined): GearPiece | undefined => {
      const slot = TRINKET_NAMES.indexOf(item ?? '');
      return slot >= 0 ? worn[slot] : worn.find(piece => piece && list.items?.[item ?? '']?.id === piece.id);
    };
    const lines = list.lines.flatMap((line): PlanLine[] => {
      if (line.action !== USE_ITEM && line.action !== USE_ITEMS) return [line];
      const { item, ...rest } = line;
      const uses = line.action === USE_ITEMS ? worn.flatMap(useOf) : useOf(pieceOf(item));
      return uses.map(action => ({ ...rest, action }));
    });
    return { ...list, lines };
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
  private shownMost(ids: (token: string) => number[], key: string, events: TimedEvent[]): number | null {
    const token = key.slice(key.indexOf(':') + 1);
    const named = token === 'bloodlust' ? [...BLOODLUST_IDS] : ids(token);
    const seen = (id: number): number => events.filter(event => event.abilityGameID === id).length;
    const id = greatest(named, seen);
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

  private addSpans(damage: TimedEvent[], rows: readonly DamageRow[]): AddSpan[] | null {
    const toughest = new Map<string, number>();
    for (const event of damage) {
      if (event.resourceActor !== RESOURCE_ACTOR_TARGET || !event.maxHitPoints) continue;
      const key = this.projections.targetKey(event);
      toughest.set(key, Math.max(toughest.get(key) ?? 0, event.maxHitPoints));
    }
    const boss = Math.max(0, ...toughest.values());
    if (!boss) return null;
    const spans = new Map<string, [number, number]>();
    for (const [atS, target] of rows) {
      if ((toughest.get(target) ?? 0) >= boss * BOSS_HEALTH_SHARE) continue;
      const span = getOrInsert(spans, target, (): [number, number] => [atS, atS]);
      span[1] = atS;
    }
    return [...spans.values()];
  }

  private castStartsS(events: readonly TimedEvent[], casts: readonly TimedEvent[], gcdOf: (id: number) => number | undefined): number[] {
    const starts = new Map(this.projections.castStarts([...events].sort((a, b) => a.atS - b.atS), gcdOf).map(({ cast, startS }) => [cast, startS]));
    return casts.map(event => starts.get(event) ?? event.atS);
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
