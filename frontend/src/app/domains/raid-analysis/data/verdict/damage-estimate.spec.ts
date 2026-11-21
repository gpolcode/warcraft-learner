import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DamageEstimateService, DamageSample } from './damage-estimate-service';
import { parseRanking } from '../../../../../testing/builders/bench-sources';
import { VERDICT_CHOICES } from './verdict-choices';

const estimates = TestBed.inject(DamageEstimateService);

const ALIVE_S = 100;
/** Top logs idle 10%, 20% and 30% of the same alive time: an average of 20%. */
const TOP_IDLE_PCT = [10, 20, 30];
/** 30s idle against 20s average, 30s at most and 10s at least. */
const IDLE_S = 30;

/** A top log dealing 100 a second for 10 seconds, then 300 a second for 10: an average of 200. */
const RAMPING = [...Array<number>(10).fill(100), ...Array<number>(10).fill(300)];
/** One dealing 200 every second of the same 20. */
const FLAT = Array<number>(20).fill(200);
/** Dead from 10 to 15: the ramping log dealt 1,500 there, 7.5s of its average; the flat log 1,000, 5s of its. */
const DIED_S = 10;
const BACK_S = 15;

const MIN_LOGS = VERDICT_CHOICES.damage.minLogs;

describe('DamageEstimateService.idle', () => {
  it('prices idle time past the top logs\' average share, between their most and least idle', () => {
    expect(estimates.idle({ idleS: IDLE_S, aliveS: ALIVE_S }, TOP_IDLE_PCT)).toEqual({ aboutS: 10, lowS: 0, highS: 20 });
  });

  it('prices nothing at exactly the top logs\' average', () => {
    expect(estimates.idle({ idleS: 20, aliveS: ALIVE_S }, TOP_IDLE_PCT)).toBeNull();
  });

  it('prices nothing without a reference', () => {
    expect(estimates.idle({ idleS: IDLE_S, aliveS: ALIVE_S }, [])).toBeNull();
  });
});

describe('DamageEstimateService.dead', () => {
  it('reads a dead span on each top log\'s own damage, as a share of its average', () => {
    expect(estimates.dead(DIED_S, BACK_S, [RAMPING, FLAT])).toEqual({ aboutS: 6.25, lowS: 5, highS: 7.5 });
  });

  it('counts the part of a second the span covers', () => {
    const HALF_SECOND_S = 0.5;

    expect(estimates.dead(DIED_S, DIED_S + HALF_SECOND_S, [FLAT]).aboutS).toBe(HALF_SECOND_S);
  });

  it('leaves out a top log killed before the span ends', () => {
    const shortKill = FLAT.slice(0, BACK_S - 1);

    expect(estimates.dead(DIED_S, BACK_S, [RAMPING, shortKill])).toEqual({ aboutS: 7.5, lowS: 7.5, highS: 7.5 });
  });

  it('reads the span\'s length without any top log\'s damage', () => {
    expect(estimates.dead(DIED_S, BACK_S, [])).toEqual({ aboutS: 5, lowS: 5, highS: 5 });
  });

  it('prices only deaths before the judged end, cut at it', () => {
    const JUDGED_END_S = 12;

    expect(estimates.deaths([[DIED_S, BACK_S], [JUDGED_END_S, BACK_S]], JUDGED_END_S, [])).toEqual([{ aboutS: 2, lowS: 2, highS: 2 }]);
  });
});

describe('DamageEstimateService.gapS', () => {
  const top = [parseRanking({ amount: 1000 }), parseRanking({ amount: 1200 }), parseRanking({ amount: 1100 })];

  it('reads the shortfall to the top logs\' median in seconds of the log\'s own average over its pull', () => {
    // (1,100 - 1,000) / 1,000 of a 300s pull.
    expect(estimates.gapS(parseRanking({ amount: 1000, duration_s: 300 }), top)).toBe(30);
  });

  it('reads nothing for a log without its ranked figure', () => {
    expect(estimates.gapS(parseRanking({ amount: null, duration_s: 300 }), top)).toBeNull();
  });
});

describe('DamageEstimateService.gate', () => {
  /** Estimates that track the gap and stay under it. */
  const tracking = (count: number): DamageSample[] => Array.from({ length: count }, (_, i) => [i, i + 1]);
  /** Two of 20 logs priced above their gap: exactly the 10% allowed. */
  const twoOver = (): DamageSample[] => [...tracking(MIN_LOGS - 2), [100, 99], [101, 100]];

  it('opens over enough logs whose estimates stay under their gap and rank them alike', () => {
    expect(estimates.gate(tracking(MIN_LOGS)).open).toBe(true);
  });

  it('stays closed one log short of the minimum', () => {
    expect(estimates.gate(tracking(MIN_LOGS - 1)).open).toBe(false);
  });

  it('opens with exactly the allowed share of logs priced above their gap', () => {
    expect(estimates.gate(twoOver())).toMatchObject({ exceedShare: 0.1, open: true });
  });

  it('stays closed with one more log priced above its gap', () => {
    const threeOver: DamageSample[] = [...twoOver().slice(1), [102, 101]];

    expect(estimates.gate(threeOver)).toMatchObject({ exceedShare: 0.15, open: false });
  });

  it('never counts a log it prices at nothing as exceeding, whatever its gap', () => {
    expect(estimates.gate([[0, -5]]).exceedShare).toBe(0);
  });

  it('stays closed when the estimates do not rank the logs as their gaps do', () => {
    const unrelated: DamageSample[] = tracking(MIN_LOGS).map(([estimateS], i) => [estimateS, MIN_LOGS * 2 - i]);

    expect(estimates.gate(unrelated).open).toBe(false);
  });

  it('stays closed with no contrast log', () => {
    expect(estimates.gate([])).toEqual({ logs: 0, exceedShare: 0, spearman: 0, open: false });
  });
});
