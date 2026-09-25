import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, cast, removeBuff } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { EVISCERATE, SHADOW_DANCE } from '../../../../../../testing/spell-ids';
import type { PlanVariable } from '../../plan/plan.models';
import { castAt, factContext, priorityList } from './priority-list-harness';
import type { Range } from './priority-list.models';
import { VariableReplayService } from './variable-replay-service';

/** Shadow Dance is up from 5 to 10 s; casts land before, inside and after it. */
const DANCE_START_S = 5;
const DANCE_END_S = 10;
const CASTS_S = [2, 7, 12];
const replay = TestBed.inject(VariableReplayService);

const valuesOf = (variables: PlanVariable[]): (Range | undefined)[] => {
  const list = priorityList({ variables, spells: { shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE]) } });
  const ctx = factContext(list, {
    casts: CASTS_S.map(atS => cast(EVISCERATE, atS)),
    buffs: [applyBuff(SHADOW_DANCE, DANCE_START_S), removeBuff(SHADOW_DANCE, DANCE_END_S)],
  });
  const moments = replay.withVariables(list, CASTS_S.map(atS => castAt(ctx, atS)), ctx);
  return moments.map(moment => moment.variables?.get(variables[0]?.name ?? ''));
};
const set = (over: Partial<PlanVariable>): PlanVariable => ({ name: 'x', op: 'set', terms: [], ...over });

describe('VariableReplayService', () => {
  it('sets a variable at each cast from what the log shows then', () => {
    expect(valuesOf([set({ value: 'buff.shadow_dance.up' })])).toEqual([[0, 0], [1, 1], [0, 0]]);
  });

  it('runs an action only while its condition holds, the value carried from cast to cast', () => {
    expect(valuesOf([set({ value: 'time', terms: ['buff.shadow_dance.up'] })])).toEqual([[0, 0], [7, 7], [7, 7]]);
  });

  it('reads a variable whose condition the log cannot settle as either value', () => {
    expect(valuesOf([set({ value: '1', terms: ['raid_event.movement.in>5'] })])[0]).toEqual([0, 1]);
  });

  it('sets a setif to its value while the condition holds and to its other value otherwise', () => {
    expect(valuesOf([set({ op: 'setif', condition: 'buff.shadow_dance.up', value: '3', value_else: '4' })])).toEqual([[4, 4], [3, 3], [4, 4]]);
  });

  it('applies an arithmetic op to the current value', () => {
    expect(valuesOf([set({ op: 'add', value: '1' })])).toEqual([[1, 1], [2, 2], [3, 3]]);
    expect(valuesOf([set({ op: 'max', value: 'time' })])).toEqual([[2, 2], [7, 7], [12, 12]]);
  });

  it('starts a variable at its default and resets it there', () => {
    expect(valuesOf([set({ op: 'reset', default: 3 })])).toEqual([[3, 3], [3, 3], [3, 3]]);
  });

  it('runs a variable set before the pull once, ahead of the first cast', () => {
    expect(valuesOf([set({ value: '5', precombat: true }), set({ op: 'add', value: '1' })])).toEqual([[6, 6], [7, 7], [8, 8]]);
  });

  it('reads an op it does not know as unknown', () => {
    expect(valuesOf([set({ op: 'pow', value: '2' })])[0]).toEqual([-Infinity, Infinity]);
  });
});
