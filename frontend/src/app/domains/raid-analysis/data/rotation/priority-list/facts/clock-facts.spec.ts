import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, damage } from '../../../../../../../testing/builders/events';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { ClockFacts } from './clock-facts';

const FIGHT_S = 300;
const CAST_S = 100;
const ADD = 2;
const ADD_KEY = `${ADD}:0`;
const ADD_DIES_S = 130;
const clock = TestBed.inject(ClockFacts);

const read = (name: string, opts: { kill?: boolean; target?: string | null; addDies?: boolean } = {}) => {
  const hits = [damage(1, 110, 1, { target: ADD, targetHealthPct: 50 }), damage(1, ADD_DIES_S, 1, { target: ADD, targetHealthPct: opts.addDies ? 0 : 10 })];
  const ctx = factContext(priorityList(), { casts: [cast(1, CAST_S)], damage: hits, fightDurationS: FIGHT_S, kill: opts.kill ?? true });
  return clock.read(name, castAt(ctx, CAST_S, opts.target ?? null), 'x', ctx);
};

describe('ClockFacts', () => {
  it('reads the time since the pull', () => {
    expect(read('time')).toEqual([CAST_S, CAST_S]);
  });

  it('reads every cast of the pull as in combat', () => {
    expect(read('in_combat')).toEqual([1, 1]);
  });

  it('reads the fight\'s end exactly on a kill and only from below on a wipe', () => {
    expect(read('fight_remains')).toEqual([FIGHT_S - CAST_S, FIGHT_S - CAST_S]);
    expect(read('fight_remains', { kill: false })).toEqual([FIGHT_S - CAST_S, Infinity]);
  });

  it('reads an enemy\'s death where its health hit zero', () => {
    expect(read('target.time_to_die', { target: ADD_KEY, addDies: true })).toEqual([ADD_DIES_S - CAST_S, ADD_DIES_S - CAST_S]);
  });

  it('reads an enemy still standing at its last reading as living at least that long', () => {
    expect(read('target.time_to_die', { target: ADD_KEY })).toEqual([ADD_DIES_S - CAST_S, Infinity]);
  });

  it('reads a cast at no known enemy against the fight\'s end', () => {
    expect(read('target.time_to_die')).toEqual([FIGHT_S - CAST_S, FIGHT_S - CAST_S]);
  });
});
