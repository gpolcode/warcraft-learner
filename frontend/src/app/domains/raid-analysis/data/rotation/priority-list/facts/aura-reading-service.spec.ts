import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { AuraReadingService, CAST_EFFECTS_LEAD_S } from './aura-reading-service';

const DURATION_S = 10;
const FIGHT_END_S = 300;
const CAST_S = 5;
const LOG_TICK_S = 0.001;
/** Bladestorm fired 18 ms after the Recklessness it was macroed with. */
const MACRO_S = CAST_S - 0.018;
const EARLIER_S = CAST_S - CAST_EFFECTS_LEAD_S - LOG_TICK_S;
const auras = TestBed.inject(AuraReadingService);

describe('AuraReadingService', () => {
  const refreshed = [{ startS: 0, endS: 5, endedByRefresh: true }, { startS: 5, endS: 15, endedByRefresh: false }];

  it('reads an aura up going into a moment, from its last refresh to its final drop', () => {
    expect(auras.auraAt(refreshed, 6)).toEqual({ appliedS: 5, endS: 15 });
    expect(auras.auraAt(refreshed, 15)).toEqual({ appliedS: 5, endS: 15 });
  });

  it('reads an aura applied at the moment itself as not yet up', () => {
    expect(auras.auraAt(refreshed, 0)).toBeNull();
  });

  it('reads a cast\'s auras from before its own effects, which the log stamps up to the lead ahead of it', () => {
    const ctx = factContext(priorityList(), { casts: [cast(1, 1), cast(2, CAST_S)] });
    expect(auras.readS(castAt(ctx, CAST_S), ctx)).toBe(CAST_S - CAST_EFFECTS_LEAD_S);
  });

  it('reads them from just after an earlier press inside that lead, whose effects are that press\'s own', () => {
    const ctx = factContext(priorityList(), { casts: [cast(1, MACRO_S), cast(2, CAST_S)] });
    expect(auras.readS(castAt(ctx, CAST_S), ctx)).toBe(MACRO_S + LOG_TICK_S);
  });

  it('keeps the whole lead when the earlier press sits just outside it', () => {
    const ctx = factContext(priorityList(), { casts: [cast(1, EARLIER_S), cast(2, CAST_S)] });
    expect(auras.readS(castAt(ctx, CAST_S), ctx)).toBe(CAST_S - CAST_EFFECTS_LEAD_S);
  });

  it('looks past a second event the log stamps for the same press at the same instant', () => {
    const ctx = factContext(priorityList(), { casts: [cast(1, 1), cast(2, CAST_S), cast(3, CAST_S)] });
    const second = { ...castAt(ctx, CAST_S), index: 2 };
    expect(auras.readS(second, ctx)).toBe(CAST_S - CAST_EFFECTS_LEAD_S);
  });

  it('reads the time left between the drop the log shows and the end the spell data gives', () => {
    const consumed = { appliedS: 0, endS: 4 };
    expect(auras.remains(consumed, DURATION_S, 1, FIGHT_END_S)).toEqual([3, DURATION_S - 1]);
  });

  it('reads an aura up since before the pull as lasting no longer than its drop, since its start is unknown', () => {
    const REMOVE_S = 8;
    expect(auras.remains({ appliedS: -Infinity, endS: REMOVE_S }, DURATION_S, 1, FIGHT_END_S)).toEqual([-Infinity, REMOVE_S - 1]);
  });

  it('reads an aura that outlived the log as lasting at least to the fight\'s end', () => {
    expect(auras.remains({ appliedS: 290, endS: null }, 0, 295, FIGHT_END_S)).toEqual([5, Infinity]);
  });

  it('reads an up aura whose timeline starts mid-aura as holding one stack up to its cap', () => {
    const unknownStart = { groundedFromStart: false, entries: [[20, 2]] as [number, number][] };
    expect(auras.stacks(unknownStart, true, 5, 10)).toEqual([1, 5]);
    expect(auras.stacks(unknownStart, false, 5, 10)).toEqual([0, 0]);
  });
});
