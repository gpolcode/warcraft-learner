import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, cast, damage } from '../../../../../../../testing/builders/events';
import { BLOODLUST } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { FactCatalogService } from '../fact-catalog-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';
import { FightFacts } from './fight-facts';

const FIGHT_S = 300;
const CAST_S = 100;
const BOSS = 1;
const ADD = 2;
const BOSS_KEY = `${BOSS}:0`;
const ADD_KEY = `${ADD}:0`;
const ADD_DIES_S = 130;
const BOSS_HP = 10_000_000;
const ADD_HP = 1_000_000;
/** Half the boss's health: an enemy this tough counts as a boss too. */
const HALF_BOSS_HP = BOSS_HP / 2;
/** The enemy-count reader's own window: enemies damaged this long after the cast count. */
const WINDOW_S = 3;
const HEALTH_PCT = 18;
const OWN_PCT = 60;
const fight = TestBed.inject(FightFacts);
const catalog = TestBed.inject(FactCatalogService);

const readAt = (name: string, log: { casts?: WclEvent[]; damage?: WclEvent[]; buffs?: WclEvent[]; kill?: boolean }, atS: number, target: string | null = null): Range => {
  const ctx = factContext(priorityList(), { casts: log.casts ?? [cast(1, atS)], damage: log.damage ?? [], buffs: log.buffs ?? [], fightDurationS: FIGHT_S, kill: log.kill ?? true });
  return fight.read(catalog.path(name, 'x'), castAt(ctx, atS, target), ctx);
};

describe('FightFacts clock', () => {
  const addHits = (dies: boolean) => [damage(1, 110, 1, { target: ADD, targetHealthPct: 50 }), damage(1, ADD_DIES_S, 1, { target: ADD, targetHealthPct: dies ? 0 : 10 })];
  const read = (name: string, opts: { kill?: boolean; target?: string | null; addDies?: boolean } = {}) =>
    readAt(name, { damage: addHits(opts.addDies ?? false), kill: opts.kill }, CAST_S, opts.target ?? null);

  it('reads the time since the pull, and every cast of the pull as in combat', () => {
    expect(read('time')).toEqual([CAST_S, CAST_S]);
    expect(read('in_combat')).toEqual([1, 1]);
    expect(read('in_boss_encounter')).toEqual([1, 1]);
  });

  it('reads the fight\'s end exactly on a kill and only from below on a wipe', () => {
    expect(read('fight_remains')).toEqual([FIGHT_S - CAST_S, FIGHT_S - CAST_S]);
    expect(read('fight_remains', { kill: false })).toEqual([FIGHT_S - CAST_S, Infinity]);
    expect(read('expected_combat_length', { kill: false })).toEqual([FIGHT_S, Infinity]);
  });

  it('reads an enemy\'s death where its health hit zero, and one still standing as living at least to its last reading', () => {
    expect(read('target.time_to_die', { target: ADD_KEY, addDies: true })).toEqual([ADD_DIES_S - CAST_S, ADD_DIES_S - CAST_S]);
    expect(read('target.time_to_die', { target: ADD_KEY })).toEqual([ADD_DIES_S - CAST_S, Infinity]);
  });

  it('reads a cast at no known enemy against the fight\'s end', () => {
    expect(read('target.time_to_die')).toEqual([FIGHT_S - CAST_S, FIGHT_S - CAST_S]);
  });

  it('reads the time until the target reaches a health mark, and only from below while it never did', () => {
    expect(read('time_to_pct_10', { target: ADD_KEY })).toEqual([ADD_DIES_S - CAST_S, ADD_DIES_S - CAST_S]);
    expect(read('time_to_pct_5', { target: ADD_KEY })).toEqual([FIGHT_S - CAST_S, Infinity]);
    expect(read('time_to_pct_5', { target: ADD_KEY, addDies: true })).toEqual([ADD_DIES_S - CAST_S, ADD_DIES_S - CAST_S]);
  });

  it('reads the time until Bloodlust from when the log shows it came, and never when it never did on a kill', () => {
    expect(readAt('time_to_bloodlust', { buffs: [applyBuff(BLOODLUST, CAST_S + 20)] }, CAST_S)).toEqual([20, 20]);
    expect(readAt('time_to_bloodlust', {}, CAST_S)).toEqual([Infinity, Infinity]);
    expect(readAt('time_to_bloodlust', { kill: false }, CAST_S)).toEqual(UNKNOWN);
  });
});

describe('FightFacts enemies', () => {
  const count = (hits: [number, number][], name = 'active_enemies') =>
    readAt(name, { damage: hits.map(([target, atS]) => damage(1, atS, 1, { target })) }, CAST_S);

  it('counts every enemy damaged in the window after the cast, under any of SimC\'s names for the count', () => {
    expect(count([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S]])).toEqual([2, 2]);
    expect(count([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S]], 'spell_targets.shuriken_storm')).toEqual([2, 2]);
  });

  it('leaves out an enemy first damaged just past the window', () => {
    expect(count([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S + 0.1]])).toEqual([1, 1]);
  });

  it('reads at least one enemy when the window shows no damage', () => {
    expect(count([])).toEqual([1, Infinity]);
  });

  it('reads the target\'s health at its last reading before the cast, and the player\'s own off the cast', () => {
    const log = {
      casts: [cast(1, CAST_S, { healthPct: OWN_PCT })],
      damage: [damage(1, CAST_S - 1, 1, { target: BOSS, targetHealthPct: HEALTH_PCT }), damage(1, CAST_S + 1, 1, { target: BOSS, targetHealthPct: 5 })],
    };
    expect(readAt('target.health.pct', log, CAST_S, BOSS_KEY)).toEqual([HEALTH_PCT, HEALTH_PCT]);
    expect(readAt('health.pct', log, CAST_S)).toEqual([OWN_PCT, OWN_PCT]);
    expect(readAt('target.health.pct', log, CAST_S)).toEqual(UNKNOWN);
  });

  it('tells the boss from an add by their health, and neither when the log shows no enemy health', () => {
    const hits = [damage(1, 1, 1, { target: BOSS, targetHealthPct: 50, targetMaxHp: BOSS_HP }), damage(1, 2, 1, { target: ADD, targetHealthPct: 50, targetMaxHp: ADD_HP })];
    expect(readAt('target.is_boss', { damage: hits }, CAST_S, BOSS_KEY)).toEqual([1, 1]);
    expect(readAt('target.is_boss', { damage: hits }, CAST_S, ADD_KEY)).toEqual([0, 0]);
    expect(readAt('target.is_boss', { damage: [damage(1, 1, 1, { target: BOSS })] }, CAST_S, BOSS_KEY)).toEqual(UNKNOWN);
  });
});

describe('FightFacts raid events', () => {
  /** A two-add wave hit first at 20 and 21 s and last at 30 and 31 s, then a lone add from 60 to 70 s. */
  const ADDS: [number, number, number][] = [[2, 20, 30], [3, 21, 31], [4, 60, 70]];
  const CASTS_S = [10, 25, 45, 80];
  const hit = (target: number, atS: number, maxHp: number): WclEvent => damage(1, atS, 1, { target, targetHealthPct: 50, targetMaxHp: maxHp });
  const log = (adds = ADDS, addHp = ADD_HP) => ({
    casts: CASTS_S.map(atS => cast(1, atS)),
    damage: [hit(BOSS, 1, BOSS_HP), ...adds.flatMap(([target, firstS, lastS]) => [hit(target, firstS, addHp), hit(target, lastS, addHp)])],
  });
  const read = (name: string, atS: number, events = log()): Range => readAt(name, events, atS);

  it('reads adds as existing in a fight where the player hit enemies other than the boss', () => {
    expect(read('raid_event.adds.exists', 10)).toEqual([1, 1]);
    expect(read('raid_event.adds.exists', 10, log([]))).toEqual([0, 0]);
  });

  it('reads adds as up from the first hit on them to the last', () => {
    expect(read('raid_event.adds.up', 25)).toEqual([1, 1]);
    expect(read('raid_event.adds.up', 45)).toEqual([0, 0]);
  });

  it('reads the time until the longest-lived add up is last hit, and 0 with none up', () => {
    expect(read('raid_event.adds.remains', 25)).toEqual([6, 6]);
    expect(read('raid_event.adds.remains', 45)).toEqual([0, 0]);
  });

  it('reads the time until the next adds come, and never once none are left to come', () => {
    expect(read('raid_event.adds.in', 10)).toEqual([10, 10]);
    expect(read('raid_event.adds.in', 45)).toEqual([15, 15]);
    expect(read('raid_event.adds.in', 80)).toEqual([Infinity, Infinity]);
  });

  it('reads the next wave\'s size and length, adds first hit within a few seconds of each other counting as one wave', () => {
    expect(read('raid_event.adds.count', 10)).toEqual([2, 2]);
    expect(read('raid_event.adds.duration', 10)).toEqual([10, 10]);
    expect(read('raid_event.adds.count', 45)).toEqual([1, 1]);
  });

  it('reads an enemy with half the boss\'s health as a boss rather than an add', () => {
    expect(read('raid_event.adds.exists', 10, log(ADDS, HALF_BOSS_HP))).toEqual([0, 0]);
    expect(read('raid_event.adds.exists', 10, log(ADDS, HALF_BOSS_HP - 1))).toEqual([1, 1]);
  });

  it('reads adds as unknown when the log shows no enemy health to tell them from the boss', () => {
    expect(read('raid_event.adds.exists', 10, { casts: [cast(1, 10)], damage: [damage(1, 1, 1, { target: BOSS })] })).toEqual(UNKNOWN);
  });

  it('reads a dungeon pull as an event that never comes on a raid boss, and a move SimC scripts as unknown', () => {
    expect(read('raid_event.pull.exists', 10)).toEqual([0, 0]);
    expect(read('raid_event.pull.remains', 10)).toEqual([0, 0]);
    expect(read('raid_event.pull.in', 10)).toEqual([Infinity, Infinity]);
    expect(read('raid_event.movement.in', 10)).toEqual(UNKNOWN);
  });
});

describe('FightFacts fight style', () => {
  it('reads the Patchwerk styles, which stand for a raid boss, as the one played and the dungeon styles as never', () => {
    expect(readAt('fight_style.patchwerk', {}, CAST_S)).toEqual([1, 1]);
    expect(readAt('fight_style.castingpatchwerk', {}, CAST_S)).toEqual([1, 1]);
    expect(readAt('fight_style.dungeonroute', {}, CAST_S)).toEqual([0, 0]);
  });

  it('leaves every other fight style unknown', () => {
    expect(readAt('fight_style.helterskelter', {}, CAST_S)).toEqual(UNKNOWN);
  });
});
