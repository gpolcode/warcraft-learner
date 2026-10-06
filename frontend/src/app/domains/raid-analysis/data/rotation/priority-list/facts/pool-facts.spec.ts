import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, resourceChange } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import type { WclEvent } from '../../../wcl/wcl.models';
import { FactCatalogService } from '../fact-catalog-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { PoolFacts } from './pool-facts';

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
const pools = TestBed.inject(PoolFacts);
const catalog = TestBed.inject(FactCatalogService);
const spells = priorityList({
  spells: {
    soul_cleave: planSpell('Soul Cleave', [228477], { costs: [{ type: FURY, amount: SOUL_CLEAVE_FURY }] }),
    new_moon: planSpell('New Moon', [274281], { energize: { type: ASTRAL_POWER, amount: NEW_MOON_ASTRAL } }),
  },
});

const read = (name: string, events: { casts: WclEvent[]; changes?: WclEvent[] }, atS: number) => {
  const ctx = factContext(priorityList(), { casts: events.casts, resources: events.changes ?? [] });
  return pools.read(catalog.path(name, 'x'), castAt(ctx, atS), ctx);
};
const stated = (name: string, action: string) => {
  const ctx = factContext(spells, { casts: [cast(PROBE, 4)] });
  return pools.read(catalog.path(name, action), castAt(ctx, 4), ctx);
};
const spend = (atS: number, cp: number, cost: number) => cast(1, atS, { resources: [{ type: COMBO_POINTS, amount: cp, max: MAX_CP, cost }] });
const energy = (atS: number, amount: number) => cast(1, atS, { resources: [{ type: ENERGY, amount, max: 100 }] });

describe('PoolFacts', () => {
  it('reads the pool a cast reports before its cost, in the game\'s units, and what it lacks of the cap', () => {
    const rage = cast(1, 5, { resources: [{ type: RAGE, amount: 800, max: 1300 }] });
    expect(read('rage', { casts: [rage] }, 5)).toEqual([800 / RAGE_TENTHS, 800 / RAGE_TENTHS]);
    expect(read('rage.deficit', { casts: [rage] }, 5)).toEqual([50, 50]);
    expect(read('rage.pct', { casts: [rage] }, 5)).toEqual([800 / 13, 800 / 13]);
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

  it('reads the regen since the last cast that reported the pool, and the time to full at that rate', () => {
    const casts = [energy(0, 50), energy(10, 70)];
    expect(read('energy.regen', { casts }, 10)).toEqual([2, 2]);
    expect(read('energy.time_to_max', { casts }, 10)).toEqual([15, 15]);
    expect(read('energy.regen', { casts }, 0)).toEqual(UNKNOWN);
  });

  it('reads a button\'s listed cost, the line\'s own or a named one\'s, and unknown for a button without spell data', () => {
    expect(stated('cost', 'soul_cleave')).toEqual([SOUL_CLEAVE_FURY, SOUL_CLEAVE_FURY]);
    expect(stated('action.soul_cleave.cost', 'x')).toEqual([SOUL_CLEAVE_FURY, SOUL_CLEAVE_FURY]);
    expect(stated('cost', 'x')).toEqual(UNKNOWN);
  });

  it('reads what the line\'s button gives back from its spell data', () => {
    expect(stated('energize_amount', 'new_moon')).toEqual([NEW_MOON_ASTRAL, NEW_MOON_ASTRAL]);
    expect(stated('energize_amount', 'soul_cleave')).toEqual(UNKNOWN);
  });

  it('reads a pool no cast reports as unknown', () => {
    expect(read('energy', { casts: [cast(PROBE, 4)] }, 4)).toEqual(UNKNOWN);
  });
});
