import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { TalentFacts } from './talent-facts';

const DEATHSTALKERS_MARK_ENTRY = 117101;
const POTENT_POWDER_ENTRY = 117102;
const TWO_RANKS = 2;
const list = priorityList({
  talents: {
    'talent.deathstalkers_mark': { name: "Deathstalker's Mark", entries: [DEATHSTALKERS_MARK_ENTRY] },
    'talent.potent_powder': { name: 'Potent Powder', entries: [POTENT_POWDER_ENTRY] },
  },
});
const talents = TestBed.inject(TalentFacts);

const read = (name: string, picked: [number, number][] | null) => {
  const ctx = factContext(list, { casts: [cast(1, 1)], ...(picked ? { talents: picked } : {}) });
  return talents.read(name, castAt(ctx, 1), 'x', ctx);
};

describe('TalentFacts', () => {
  it('reads a picked talent as enabled and an unpicked one as not', () => {
    expect(read('talent.deathstalkers_mark', [[DEATHSTALKERS_MARK_ENTRY, 1]])).toEqual([1, 1]);
    expect(read('talent.deathstalkers_mark', [[POTENT_POWDER_ENTRY, 1]])).toEqual([0, 0]);
  });

  it('reads a talent\'s rank, and a ranked talent as enabled', () => {
    expect(read('talent.potent_powder.rank', [[POTENT_POWDER_ENTRY, TWO_RANKS]])).toEqual([TWO_RANKS, TWO_RANKS]);
    expect(read('talent.potent_powder.enabled', [[POTENT_POWDER_ENTRY, TWO_RANKS]])).toEqual([1, 1]);
  });

  it('reads a talent as unknown for a log without a talent tree, or one the tree does not name', () => {
    expect(read('talent.deathstalkers_mark', null)).toEqual(UNKNOWN);
    expect(read('talent.shadowcraft', [[DEATHSTALKERS_MARK_ENTRY, 1]])).toEqual(UNKNOWN);
  });
});
