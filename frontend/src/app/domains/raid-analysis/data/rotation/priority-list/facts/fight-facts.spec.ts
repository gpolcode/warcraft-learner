import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, damage } from '../../../../../../../testing/builders/events';
import type { WclEvent } from '../../../wcl/wcl.models';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';

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
const NEVER: Range = [Infinity, Infinity];
const evaluator = TestBed.inject(ConditionEvalService);

interface Log {
  casts?: WclEvent[];
  damage?: WclEvent[];
  kill?: boolean;
}

interface Read {
  reads: string;
  name: string;
  log: Log;
  expected: Range;
  atS?: number;
  target?: string | null;
}

const read = ({ name, log, atS = CAST_S, target = null }: Read): Range => {
  const ctx = factContext(priorityList(), { casts: log.casts ?? [cast(1, atS)], damage: log.damage ?? [], fightDurationS: FIGHT_S, kill: log.kill ?? true });
  return evaluator.read(name, castAt(ctx, atS, target), 'x', ctx);
};
const hit = (target: number, atS: number, maxHp: number): WclEvent => damage(1, atS, 1, { target, targetHealthPct: 50, targetMaxHp: maxHp });

describe('FightFacts clock', () => {
  const addHits = (dies: boolean) => [damage(1, 110, 1, { target: ADD, targetHealthPct: 50 }), damage(1, ADD_DIES_S, 1, { target: ADD, targetHealthPct: dies ? 0 : 10 })];
  const standing = { damage: addHits(false) };
  const dying = { damage: addHits(true) };
  const wipe = { damage: addHits(false), kill: false };

  it.each<Read>([
    { reads: 'the time since the pull', name: 'time', log: standing, expected: [CAST_S, CAST_S] },
    { reads: 'every cast of the pull as in combat', name: 'in_combat', log: standing, expected: [1, 1] },
    { reads: 'the fight\'s end exactly on a kill', name: 'fight_remains', log: standing, expected: [FIGHT_S - CAST_S, FIGHT_S - CAST_S] },
    { reads: 'the fight\'s end only from below on a wipe', name: 'fight_remains', log: wipe, expected: [FIGHT_S - CAST_S, Infinity] },
    { reads: 'the fight\'s length only from below on a wipe', name: 'expected_combat_length', log: wipe, expected: [FIGHT_S, Infinity] },
    { reads: 'an enemy\'s death where its health hit zero', name: 'target.time_to_die', log: dying, target: ADD_KEY, expected: [ADD_DIES_S - CAST_S, ADD_DIES_S - CAST_S] },
    { reads: 'an enemy still standing as living at least to its last reading', name: 'target.time_to_die', log: standing, target: ADD_KEY, expected: [ADD_DIES_S - CAST_S, Infinity] },
    { reads: 'a cast at no known enemy against the fight\'s end', name: 'target.time_to_die', log: standing, expected: [FIGHT_S - CAST_S, FIGHT_S - CAST_S] },
    { reads: 'the time to die under its bare name', name: 'time_to_die', log: dying, target: ADD_KEY, expected: [ADD_DIES_S - CAST_S, ADD_DIES_S - CAST_S] },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});

describe('FightFacts enemies', () => {
  const hits = (targets: [number, number][]) => ({ damage: targets.map(([target, atS]) => damage(1, atS, 1, { target })) });
  const health = {
    casts: [cast(1, CAST_S, { healthPct: OWN_PCT })],
    damage: [damage(1, CAST_S - 1, 1, { target: BOSS, targetHealthPct: HEALTH_PCT }), damage(1, CAST_S + 1, 1, { target: BOSS, targetHealthPct: 5 })],
  };

  it.each<Read>([
    { reads: 'every enemy damaged in the window after the cast', name: 'active_enemies', log: hits([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S]]), expected: [2, 2] },
    { reads: 'the same count under a spell\'s target count', name: 'spell_targets.shuriken_storm', log: hits([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S]]), expected: [2, 2] },
    { reads: 'an enemy first damaged just past the window as not counting', name: 'active_enemies', log: hits([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S + 0.1]]), expected: [1, 1] },
    { reads: 'at least one enemy when the window shows no damage', name: 'active_enemies', log: hits([]), expected: [1, Infinity] },
    { reads: 'the target\'s health at its last reading before the cast', name: 'target.health.pct', log: health, target: BOSS_KEY, expected: [HEALTH_PCT, HEALTH_PCT] },
    { reads: 'the player\'s own health off the cast', name: 'health.pct', log: health, expected: [OWN_PCT, OWN_PCT] },
    { reads: 'a target\'s health as unknown when the cast aims at no known enemy', name: 'target.health.pct', log: health, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});

describe('FightFacts raid events', () => {
  /** A two-add wave hit first at 20 and 21 s and last at 30 and 31 s, then a lone add from 60 to 70 s. */
  const ADDS: [number, number, number][] = [[2, 20, 30], [3, 21, 31], [4, 60, 70]];
  const CASTS_S = [10, 25, 45, 80];
  const log = (adds = ADDS, addHp = ADD_HP): Log => ({
    casts: CASTS_S.map(atS => cast(1, atS)),
    damage: [hit(BOSS, 1, BOSS_HP), ...adds.flatMap(([target, firstS, lastS]) => [hit(target, firstS, addHp), hit(target, lastS, addHp)])],
  });
  const adds = log();

  it.each<Read>([
    { reads: 'adds as existing where the player hit enemies other than the boss', name: 'raid_event.adds.exists', log: adds, atS: 10, expected: [1, 1] },
    { reads: 'no adds where every hit was on the boss', name: 'raid_event.adds.exists', log: log([]), atS: 10, expected: [0, 0] },
    { reads: 'adds as up from the first hit on them', name: 'raid_event.adds.up', log: adds, atS: 25, expected: [1, 1] },
    { reads: 'adds as down after the last hit on them', name: 'raid_event.adds.up', log: adds, atS: 45, expected: [0, 0] },
    { reads: 'the time until the longest-lived add up is last hit', name: 'raid_event.adds.remains', log: adds, atS: 25, expected: [6, 6] },
    { reads: 'no time left with no adds up', name: 'raid_event.adds.remains', log: adds, atS: 45, expected: [0, 0] },
    { reads: 'the time until the first adds come', name: 'raid_event.adds.in', log: adds, atS: 10, expected: [10, 10] },
    { reads: 'the time until the next adds come', name: 'raid_event.adds.in', log: adds, atS: 45, expected: [15, 15] },
    { reads: 'adds as never coming once none are left', name: 'raid_event.adds.in', log: adds, atS: 80, expected: NEVER },
    { reads: 'the next wave\'s size, adds first hit within a few seconds counting as one wave', name: 'raid_event.adds.count', log: adds, atS: 10, expected: [2, 2] },
    { reads: 'the next wave\'s length', name: 'raid_event.adds.duration', log: adds, atS: 10, expected: [10, 10] },
    { reads: 'a lone add as a wave of one', name: 'raid_event.adds.count', log: adds, atS: 45, expected: [1, 1] },
    { reads: 'an enemy with half the boss\'s health as a boss rather than an add', name: 'raid_event.adds.exists', log: log(ADDS, HALF_BOSS_HP), atS: 10, expected: [0, 0] },
    { reads: 'an enemy just under that as an add', name: 'raid_event.adds.exists', log: log(ADDS, HALF_BOSS_HP - 1), atS: 10, expected: [1, 1] },
    { reads: 'adds as unknown when the log shows no enemy health to tell them from the boss', name: 'raid_event.adds.exists', log: { casts: [cast(1, 10)], damage: [damage(1, 1, 1, { target: BOSS })] }, atS: 10, expected: UNKNOWN },
    { reads: 'a dungeon pull as never coming on a raid boss', name: 'raid_event.pull.exists', log: adds, atS: 10, expected: [0, 0] },
    { reads: 'no pull to come', name: 'raid_event.pull.in', log: adds, atS: 10, expected: NEVER },
    { reads: 'a move SimC scripts as unknown', name: 'raid_event.movement.in', log: adds, atS: 10, expected: UNKNOWN },
    { reads: 'Patchwerk, which stands for a raid boss, as the style played', name: 'fight_style.patchwerk', log: adds, atS: 10, expected: [1, 1] },
    { reads: 'a dungeon style as never the one played', name: 'fight_style.dungeonroute', log: adds, atS: 10, expected: [0, 0] },
    { reads: 'any other style as unknown', name: 'fight_style.helterskelter', log: adds, atS: 10, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
