import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuraReadingService } from './aura-reading-service';

const DURATION_S = 10;
const FIGHT_END_S = 300;
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

  it('reads the time left between the drop the log shows and the end the spell data gives', () => {
    const consumed = { appliedS: 0, endS: 4 };
    expect(auras.remains(consumed, DURATION_S, 1, FIGHT_END_S)).toEqual([3, DURATION_S - 1]);
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
