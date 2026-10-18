import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EVISCERATE } from '../../../../../../testing/spell-ids';
import { ButtonJudgeService } from './button-judge-service';
import type { CastCheck, LogReading } from './list-check-service';
import type { RotationParseMeasures } from '../rotation-data-source';

const judges = TestBed.inject(ButtonJudgeService);

const press = (atS: number, verdict: CastCheck['verdict']): CastCheck => ({ atS, verdict, line: 0, lines: [] });
const reading: LogReading = {
  casts: new Map([['eviscerate', [press(10, 'on'), press(20, 'off'), press(30, 'unjudged')]]]),
  order: [{ atS: 40, expected: 'eviscerate', pressed: 'backstab', line: 0, terms: [] }],
  ids: new Map([['eviscerate', EVISCERATE]]),
};
const topLog = (buttons: RotationParseMeasures['buttons']): RotationParseMeasures =>
  ({ efficiency_pct: null, lust_s: null, phase_starts: [], cd_casts_s: {}, buttons });
/** 10 top logs missing 1 in 20 of their moments. */
const MISS_ONE_IN_TWENTY = Array.from({ length: 10 }, () => ({ right: 19, moments: 20 }));

describe('ButtonJudgeService.measure', () => {
  it('counts judged presses and skips when due as moments, leaving unjudged presses out', () => {
    expect(judges.measure(reading, 'eviscerate', Number.POSITIVE_INFINITY)).toEqual({ right: 1, moments: 3 });
  });

  it('keeps a moment exactly at the end and drops the one after it', () => {
    expect(judges.measure(reading, 'eviscerate', 20)).toEqual({ right: 1, moments: 2 });
    expect(judges.measure(reading, 'eviscerate', 19)).toEqual({ right: 1, moments: 1 });
  });

  it('measures nothing for a button with no moment before the end', () => {
    expect(judges.measure(reading, 'eviscerate', 5)).toBeNull();
  });
});

describe('ButtonJudgeService.reference', () => {
  it('takes the top logs that had the button\'s moments', () => {
    const counts = { right: 9, moments: 10 };
    expect(judges.reference([topLog({ eviscerate: counts }), topLog({})], 'eviscerate')).toEqual([counts]);
  });
});

describe('ButtonJudgeService.judge', () => {
  it('reaches red-level evidence at 5 misses of 20 against a 1 in 20 miss rate, as P(X >= 5) is 0.26%', () => {
    expect(judges.judge({ right: 15, moments: 20 }, MISS_ONE_IN_TWENTY).level).toBe('red');
  });

  it('stops at amber-level evidence at 4 misses, as P(X >= 4) is 1.6%', () => {
    expect(judges.judge({ right: 16, moments: 20 }, MISS_ONE_IN_TWENTY).level).toBe('amber');
  });

  it('judges nothing against fewer than 5 top logs', () => {
    expect(judges.judge({ right: 0, moments: 20 }, MISS_ONE_IN_TWENTY.slice(0, 4)).level).toBe('neutral');
  });
});
