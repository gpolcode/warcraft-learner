import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, damage } from '../../../../../../../testing/builders/events';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import type { Range } from '../priority-list.models';
import { RaidEventFacts } from './raid-event-facts';

const BOSS = 1;
const BOSS_HP = 10_000_000;
const ADD_HP = 1_000_000;
/** Half the boss's health: an enemy this tough counts as a boss too. */
const HALF_BOSS_HP = BOSS_HP / 2;
/** A two-add wave hit first at 20 and 21 s and last at 30 and 31 s, then a lone add from 60 to 70 s. */
const ADDS: [number, number, number][] = [[2, 20, 30], [3, 21, 31], [4, 60, 70]];
const CASTS_S = [10, 25, 45, 80];
const events = TestBed.inject(RaidEventFacts);

const hit = (target: number, atS: number, maxHp: number): WclEvent => damage(1, atS, 1, { target, targetHealthPct: 50, targetMaxHp: maxHp });
const log = (adds = ADDS, addHp = ADD_HP) => factContext(priorityList(), {
  casts: CASTS_S.map(atS => cast(1, atS)),
  damage: [hit(BOSS, 1, BOSS_HP), ...adds.flatMap(([target, firstS, lastS]) => [hit(target, firstS, addHp), hit(target, lastS, addHp)])],
});
const read = (name: string, atS: number, ctx = log()): Range => events.read(name, castAt(ctx, atS), 'x', ctx);

describe('RaidEventFacts adds', () => {
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
    const ctx = factContext(priorityList(), { casts: [cast(1, 10)], damage: [damage(1, 1, 1, { target: BOSS })] });
    expect(read('raid_event.adds.exists', 10, ctx)).toEqual([-Infinity, Infinity]);
  });
});

describe('RaidEventFacts pulls', () => {
  it('reads a dungeon pull as an event that never comes on a raid boss', () => {
    expect(read('raid_event.pull.exists', 10)).toEqual([0, 0]);
    expect(read('raid_event.pull.remains', 10)).toEqual([0, 0]);
    expect(read('raid_event.pull.in', 10)).toEqual([Infinity, Infinity]);
  });
});
