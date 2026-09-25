import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, resourceChange } from '../../../../../../../testing/builders/events';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { ResourceFacts } from './resource-facts';

const RAGE = 1;
const COMBO_POINTS = 4;
/** The combat log keeps rage in tenths: 1300 is 130 rage. */
const RAGE_TENTHS = 10;
const MAX_CP = 7;
const PROBE = 999;
const resources = TestBed.inject(ResourceFacts);

const read = (name: string, events: { casts: WclEvent[]; changes?: WclEvent[] }, atS: number) => {
  const ctx = factContext(priorityList(), { casts: events.casts, resources: events.changes ?? [] });
  return resources.read(name, castAt(ctx, atS), 'x', ctx);
};
const spend = (atS: number, cp: number, cost: number) => cast(1, atS, { resources: [{ type: COMBO_POINTS, amount: cp, max: MAX_CP, cost }] });

describe('ResourceFacts', () => {
  it('reads the pool a cast reports before its cost, in the game\'s units', () => {
    const rage = cast(1, 5, { resources: [{ type: RAGE, amount: 800, max: 1300 }] });
    expect(read('rage', { casts: [rage] }, 5)).toEqual([800 / RAGE_TENTHS, 800 / RAGE_TENTHS]);
    expect(read('rage.deficit', { casts: [rage] }, 5)).toEqual([50, 50]);
  });

  it('rebuilds a pool the cast does not report from what the last cast left and the gains since', () => {
    const casts = [spend(1, 5, 5), cast(PROBE, 4), spend(9, 2, 2)];
    const changes = [resourceChange(COMBO_POINTS, 2, 1, { max: MAX_CP }), resourceChange(COMBO_POINTS, 3, 1, { max: MAX_CP })];
    expect(read('combo_points', { casts, changes }, 4)).toEqual([2, 2]);
  });

  it('counts a gain only up to the cap', () => {
    const casts = [spend(1, MAX_CP, 0), cast(PROBE, 4), spend(9, MAX_CP, MAX_CP)];
    const changes = [resourceChange(COMBO_POINTS, 2, 2, { max: MAX_CP, waste: 2 })];
    expect(read('combo_points', { casts, changes }, 4)).toEqual([MAX_CP, MAX_CP]);
  });

  it('reads cp_max_spend as the combo point cap', () => {
    expect(read('cp_max_spend', { casts: [spend(1, 5, 5)] }, 1)).toEqual([MAX_CP, MAX_CP]);
  });

  it('reads a pool no cast reports as unknown', () => {
    expect(read('energy', { casts: [cast(PROBE, 4)] }, 4)).toEqual(UNKNOWN);
  });
});
