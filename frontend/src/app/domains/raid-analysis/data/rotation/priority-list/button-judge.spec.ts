import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EVISCERATE } from '../../../../../../testing/spell-ids';
import { ButtonJudgeService } from './button-judge-service';
import type { ButtonCounts, CastCheck, LogReading } from './list-check-service';
import type { RotationParseMeasures } from '../rotation-data-source';

const judges = TestBed.inject(ButtonJudgeService);

const press = (atS: number, verdict: CastCheck['verdict']): CastCheck => ({ atS, verdict, line: 0, lines: [] });
const reading: LogReading = {
  casts: new Map([['eviscerate', [press(10, 'on'), press(20, 'off'), press(30, 'unjudged')]]]),
  missed: [{ atS: 40, action: 'eviscerate', kind: 'idle', line: 0, terms: [] }, { atS: 60, action: 'eviscerate', kind: 'idle', line: 0, terms: [] }],
  ids: new Map([['eviscerate', EVISCERATE]]),
};
const topLog = (buttons: RotationParseMeasures['buttons']): RotationParseMeasures =>
  ({ idle_s: null, lust_s: null, phase_starts: [], cd_casts_s: {}, buttons });
/** 10 top logs missing 1 in 20 of their moments. */
const MISS_ONE_IN_TWENTY = Array.from({ length: 10 }, () => ({ right: 19, moments: 20 }));

describe('ButtonJudgeService.measure', () => {
  it('counts judged presses and decisions missed while due as moments, counting unjudged presses apart', () => {
    expect(judges.measure(reading, 'eviscerate', Number.POSITIVE_INFINITY)).toEqual({ right: 1, moments: 4, unjudged: 1 });
  });

  it('keeps a moment exactly at the end and drops the one after it', () => {
    expect(judges.measure(reading, 'eviscerate', 20)).toEqual({ right: 1, moments: 2, unjudged: 0 });
    expect(judges.measure(reading, 'eviscerate', 19)).toEqual({ right: 1, moments: 1, unjudged: 0 });
  });

  it('drops a miss that came while dead, and keeps one exactly at the end of an alive span', () => {
    const ALIVE_TO_40: [number, number][] = [[0, 40]];
    expect(judges.measure(reading, 'eviscerate', Number.POSITIVE_INFINITY, ALIVE_TO_40)).toEqual({ right: 1, moments: 3, unjudged: 1 });
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

  it('holds the player to the top logs\' miss rate in each enemy-count stratum, weighted by the player\'s own moments there', () => {
    // Top logs miss 1 in 20 on one enemy and 1 in 4 on add waves, 1 in 15 pooled; 5 misses of 20 on add waves is their own rate there, and red-level evidence against the pooled one.
    const single = { right: 190, moments: 200, unjudged: 0 };
    const multi = { right: 15, moments: 20, unjudged: 0 };
    const top = Array.from({ length: 10 }, (): ButtonCounts => ({ right: 205, moments: 220, strata: { single, multi } }));
    const pooledTop = top.map(({ right, moments }) => ({ right, moments }));
    const onWaves: ButtonCounts = { right: 15, moments: 20, strata: { multi } };
    const ADD_WAVE_RATE = 0.25;
    expect(judges.expectedRate(onWaves, top)).toBe(ADD_WAVE_RATE);
    expect(judges.judge(onWaves, top).level).toBe('neutral');
    expect(judges.judge(onWaves, pooledTop).level).toBe('red');
  });

  it('takes the pooled rate when a top log carries no strata', () => {
    const POOLED_RATE = 0.05;
    const onWaves: ButtonCounts = { right: 15, moments: 20, strata: { multi: { right: 15, moments: 20, unjudged: 0 } } };
    expect(judges.expectedRate(onWaves, MISS_ONE_IN_TWENTY)).toBeCloseTo(POOLED_RATE);
  });

  it('judges nothing against fewer than 5 top logs', () => {
    expect(judges.judge({ right: 0, moments: 20 }, MISS_ONE_IN_TWENTY.slice(0, 4)).level).toBe('neutral');
  });
});
