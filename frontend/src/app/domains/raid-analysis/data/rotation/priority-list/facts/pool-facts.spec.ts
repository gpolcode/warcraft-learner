import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, resourceChange } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import type { WclEvent } from '../../../wcl/wcl.models';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';

const RAGE = 1;
const ENERGY = 3;
const COMBO_POINTS = 4;
/** The combat log keeps rage in tenths: 1300 is 130 rage. */
const RAGE_TENTHS = 10;
const MAX_CP = 7;
const PROBE = 999;
const FURY = 17;
const ASTRAL_POWER = 8;
const SOUL_CLEAVE_FURY = 30;
const NEW_MOON_ASTRAL = 10;
const evaluator = TestBed.inject(ConditionEvalService);
const list = priorityList({
  spells: {
    soul_cleave: planSpell('Soul Cleave', [228477], { costs: [{ type: FURY, amount: SOUL_CLEAVE_FURY }] }),
    new_moon: planSpell('New Moon', [274281], { energize: { type: ASTRAL_POWER, amount: NEW_MOON_ASTRAL } }),
  },
});

interface Read {
  reads: string;
  name: string;
  casts: WclEvent[];
  atS: number;
  expected: Range;
  changes?: WclEvent[];
  action?: string;
}

const read = ({ name, casts, changes = [], atS, action = 'x' }: Read): Range => {
  const ctx = factContext(list, { casts, resources: changes });
  return evaluator.read(name, castAt(ctx, atS), action, ctx);
};
const spend = (atS: number, cp: number, cost: number): WclEvent => cast(1, atS, { resources: [{ type: COMBO_POINTS, amount: cp, max: MAX_CP, cost }] });
const energy = (atS: number, amount: number): WclEvent => cast(1, atS, { resources: [{ type: ENERGY, amount, max: 100 }] });

describe('PoolFacts', () => {
  const rage = [cast(1, 5, { resources: [{ type: RAGE, amount: 800, max: 1300 }] })];
  const between = [spend(1, 5, 5), cast(PROBE, 4), spend(9, 2, 2)];
  const gains = [resourceChange(COMBO_POINTS, 2, 1, { max: MAX_CP }), resourceChange(COMBO_POINTS, 3, 1, { max: MAX_CP })];
  const capped = [spend(1, MAX_CP, 0), cast(PROBE, 4), spend(9, MAX_CP, MAX_CP)];
  const regen = [energy(0, 50), energy(10, 70)];
  const probe = [cast(PROBE, 4)];

  it.each<Read>([
    { reads: 'the pool a cast reports before its cost, in the game\'s units', name: 'rage', casts: rage, atS: 5, expected: [800 / RAGE_TENTHS, 800 / RAGE_TENTHS] },
    { reads: 'what the pool lacks of its cap', name: 'rage.deficit', casts: rage, atS: 5, expected: [50, 50] },
    { reads: 'the pool as a share of its cap', name: 'rage.pct', casts: rage, atS: 5, expected: [800 / 13, 800 / 13] },
    { reads: 'a pool the cast does not report from what the last cast left and the gains since', name: 'combo_points', casts: between, changes: gains, atS: 4, expected: [2, 2] },
    { reads: 'a gain only up to the cap', name: 'combo_points', casts: capped, changes: [resourceChange(COMBO_POINTS, 2, 2, { max: MAX_CP, waste: 2 })], atS: 4, expected: [MAX_CP, MAX_CP] },
    { reads: 'cp_max_spend as the combo point cap', name: 'cp_max_spend', casts: [spend(1, 5, 5)], atS: 1, expected: [MAX_CP, MAX_CP] },
    { reads: 'the regen since the last cast that reported the pool', name: 'energy.regen', casts: regen, atS: 10, expected: [2, 2] },
    { reads: 'the time to full at that rate', name: 'energy.time_to_max', casts: regen, atS: 10, expected: [15, 15] },
    { reads: 'regen as unknown on the first cast to report the pool', name: 'energy.regen', casts: regen, atS: 0, expected: UNKNOWN },
    { reads: 'the line\'s own button\'s listed cost', name: 'cost', casts: probe, atS: 4, action: 'soul_cleave', expected: [SOUL_CLEAVE_FURY, SOUL_CLEAVE_FURY] },
    { reads: 'a named button\'s listed cost', name: 'action.soul_cleave.cost', casts: probe, atS: 4, expected: [SOUL_CLEAVE_FURY, SOUL_CLEAVE_FURY] },
    { reads: 'the cost of a button without spell data as unknown', name: 'cost', casts: probe, atS: 4, expected: UNKNOWN },
    { reads: 'what the line\'s button gives back from its spell data', name: 'energize_amount', casts: probe, atS: 4, action: 'new_moon', expected: [NEW_MOON_ASTRAL, NEW_MOON_ASTRAL] },
    { reads: 'nothing given back as unknown', name: 'energize_amount', casts: probe, atS: 4, action: 'soul_cleave', expected: UNKNOWN },
    { reads: 'a pool no cast reports as unknown', name: 'energy', casts: probe, atS: 4, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
