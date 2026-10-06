import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';

const DEATHSTALKERS_MARK_ENTRY = 117101;
const POTENT_POWDER_ENTRY = 117102;
const TWO_RANKS = 2;
const [FIRST_TIER, SECOND_TIER, THIRD_TIER] = [137064, 137063, 137062];
const THIRD_POINT = 3;
const CAST_S = 10;
const list = priorityList({
  talents: {
    'talent.deathstalkers_mark': { name: "Deathstalker's Mark", entries: [DEATHSTALKERS_MARK_ENTRY] },
    'talent.potent_powder': { name: 'Potent Powder', entries: [POTENT_POWDER_ENTRY] },
    'talent.ancient_arts_3': { name: 'Ancient Arts', entries: [FIRST_TIER, SECOND_TIER, THIRD_TIER], points: THIRD_POINT },
  },
});
const evaluator = TestBed.inject(ConditionEvalService);

interface Read {
  reads: string;
  name: string;
  expected: Range;
  /** Null for a log without a talent tree. */
  picked: [number, number][] | null;
  variables?: [string, Range][];
}

const read = ({ name, picked, variables }: Read): Range => {
  const ctx = factContext(list, { casts: [cast(1, CAST_S)], ...(picked ? { talents: picked } : {}) });
  const moment = { ...castAt(ctx, CAST_S), ...(variables ? { variables: new Map(variables) } : {}) };
  return evaluator.read(name, moment, 'x', ctx);
};

describe('BuildFacts', () => {
  it.each<Read>([
    { reads: 'a picked talent as enabled', name: 'talent.deathstalkers_mark', picked: [[DEATHSTALKERS_MARK_ENTRY, 1]], expected: [1, 1] },
    { reads: 'an unpicked talent as not enabled', name: 'talent.deathstalkers_mark', picked: [[POTENT_POWDER_ENTRY, 1]], expected: [0, 0] },
    { reads: 'a talent\'s rank', name: 'talent.potent_powder.rank', picked: [[POTENT_POWDER_ENTRY, TWO_RANKS]], expected: [TWO_RANKS, TWO_RANKS] },
    { reads: 'a ranked talent as enabled', name: 'talent.potent_powder.enabled', picked: [[POTENT_POWDER_ENTRY, TWO_RANKS]], expected: [1, 1] },
    { reads: 'a tiered node\'s ranks over its tiers as reaching the point its numbered name asks for', name: 'talent.ancient_arts_3', picked: [[FIRST_TIER, 1], [SECOND_TIER, TWO_RANKS]], expected: [1, 1] },
    { reads: 'one rank short of that point as not reaching it', name: 'talent.ancient_arts_3', picked: [[FIRST_TIER, 1], [SECOND_TIER, 1]], expected: [0, 0] },
    { reads: 'the tiered node\'s rank over its tiers', name: 'talent.ancient_arts_3.rank', picked: [[FIRST_TIER, 1], [SECOND_TIER, TWO_RANKS]], expected: [THIRD_POINT, THIRD_POINT] },
    { reads: 'a talent as unknown for a log without a talent tree', name: 'talent.deathstalkers_mark', picked: null, expected: UNKNOWN },
    { reads: 'a talent the tree does not name as unknown', name: 'talent.shadowcraft', picked: [[DEATHSTALKERS_MARK_ENTRY, 1]], expected: UNKNOWN },
    { reads: 'a variable as the replay left it at the cast', name: 'variable.pool', picked: [], variables: [['pool', [1, 1]]], expected: [1, 1] },
    { reads: 'a variable the replay never set as unknown', name: 'variable.pool', picked: [], expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
