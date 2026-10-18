import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CountInput, DecisionRuleService, ExcessRateInput, IntervalInput } from './decision-rule-service';
import { Evidence } from './tone.models';

const rules = TestBed.inject(DecisionRuleService);

const TOP_N = 10;
const NUDGE = 0.01;

/** Five top logs that agree to the second: s = 0. */
const AGREEING = [10, 10, 10, 10, 10];
const FLOOR_S = 2;
/** With s = 0 the edge is the mean plus the floor alone. */
const AGREEING_EDGE = 10 + FLOOR_S;
/** Mean 10, sample sd sqrt(2.5). */
const SPREAD = [8, 9, 10, 11, 12];
const SPREAD_SD = Math.sqrt(2.5);
/** t(4, 0.95) * sd * sqrt(1 + 1/5) below the mean, from the standard table. */
const SPREAD_AMBER_EDGE = 10 - 2.131847 * SPREAD_SD * Math.sqrt(1.2);
const SPREAD_RED_EDGE = 10 - 3.746947 * SPREAD_SD * Math.sqrt(1.2);
const FOUR_PLACES = 4;

const late = (observed: number, reference = AGREEING): IntervalInput => ({ observed, reference, side: 'above', floor: FLOOR_S });
const lowShare = (observed: number): IntervalInput => ({ observed, reference: SPREAD, side: 'below', floor: 0 });

describe('DecisionRuleService.interval', () => {
  it('keeps the floor as tolerance when every top log agrees', () => {
    expect(rules.interval(late(AGREEING_EDGE)).level).toBe('neutral');
  });

  it('flags a value just past the floor when every top log agrees', () => {
    expect(rules.interval(late(AGREEING_EDGE + NUDGE)).level).toBe('red');
  });

  it('places the amber and red edges on the t prediction interval', () => {
    expect(rules.interval(lowShare(0)).target).toBeCloseTo(SPREAD_AMBER_EDGE, FOUR_PLACES);
    expect(rules.interval(lowShare(SPREAD_RED_EDGE - NUDGE)).level).toBe('red');
  });

  it('does not flag a value exactly at the amber edge', () => {
    const edge = rules.interval(lowShare(0)).target ?? 0;

    expect(rules.interval(lowShare(edge)).level).toBe('neutral');
  });

  it('flags amber just past the amber edge', () => {
    const edge = rules.interval(lowShare(0)).target ?? 0;

    expect(rules.interval(lowShare(edge - NUDGE)).level).toBe('amber');
  });

  it('does not flag a value just past the lowest top log', () => {
    expect(rules.interval(lowShare(Math.min(...SPREAD) - NUDGE)).level).toBe('neutral');
  });

  it('reports how far past the amber edge the value lies', () => {
    const edge = rules.interval(lowShare(0)).target ?? 0;

    expect(rules.interval(lowShare(edge - 1)).excess).toBeCloseTo(1, FOUR_PLACES);
  });

  it('keeps a bench one log short of the minimum as context', () => {
    expect(rules.interval(late(100, AGREEING.slice(1))).level).toBe('neutral');
  });
});

/** A bench of 200 moments with no miss: the succession floor puts its rate at 1 in 202. */
const perfectBench = (misses: number): ExcessRateInput => ({
  misses, moments: 20, referenceMisses: 0, referenceMoments: 200, n: TOP_N,
});
/** A bench that misses 1 in 10: 2 misses are expected in 20 moments. */
const loosenessBench = (misses: number): ExcessRateInput => ({
  misses, moments: 20, referenceMisses: 20, referenceMoments: 200, n: TOP_N,
});

describe('DecisionRuleService.excessRate', () => {
  it('tolerates one miss when no top log ever missed', () => {
    expect(rules.excessRate(perfectBench(1)).level).toBe('neutral');
  });

  it('does not flag 2 misses on a perfect bench, short of 2 excess misses over the expected 0.1', () => {
    expect(rules.excessRate(perfectBench(2)).level).toBe('neutral');
  });

  it('flags amber at 3 misses on a perfect bench', () => {
    expect(rules.excessRate(perfectBench(3)).level).toBe('amber');
  });

  it('flags red only from 4 misses on a perfect bench, at 3 excess misses', () => {
    expect(rules.excessRate(perfectBench(4)).level).toBe('red');
  });

  it('does not flag 4 misses where 2 are expected, as P(X >= 4) is 13%', () => {
    expect(rules.excessRate(loosenessBench(4)).level).toBe('neutral');
  });

  it('flags amber at 5 misses where 2 are expected, as P(X >= 5) is 4.3%', () => {
    expect(rules.excessRate(loosenessBench(5)).level).toBe('amber');
  });

  it('does not flag red at 6 misses where 2 are expected, as P(X >= 6) is 1.13%', () => {
    expect(rules.excessRate(loosenessBench(6)).level).toBe('amber');
  });

  it('flags red at 7 misses where 2 are expected, as P(X >= 7) is 0.24%', () => {
    expect(rules.excessRate(loosenessBench(7)).level).toBe('red');
  });

  it('names the most misses the bench tolerates as the target', () => {
    expect(rules.excessRate(loosenessBench(0)).target).toBe(4);
  });
});

const uses = (count: number, expected: number, users = TOP_N): CountInput => ({ uses: count, expected, n: TOP_N, users });
/** 8 of 10 is the paired consensus share. */
const AGREEING_USERS = 8;

describe('DecisionRuleService.count', () => {
  it('does not flag 5 of 10 expected uses, as P(X <= 4) is 2.9% but P(X <= 5) is 6.7%', () => {
    expect(rules.count(uses(5, 10)).level).toBe('neutral');
  });

  it('flags amber at 4 of 10 expected uses', () => {
    expect(rules.count(uses(4, 10)).level).toBe('amber');
  });

  it('does not flag red at 3 of 10 expected uses, as P(X <= 3) is 1.03%', () => {
    expect(rules.count(uses(3, 10)).level).toBe('amber');
  });

  it('flags red at 2 of 10 expected uses', () => {
    expect(rules.count(uses(2, 10)).level).toBe('red');
  });

  it('keeps red when 8 of 10 top logs used the cooldown', () => {
    expect(rules.count(uses(2, 10, AGREEING_USERS)).level).toBe('red');
  });

  it('holds red to amber when only 7 of 10 top logs used the cooldown', () => {
    expect(rules.count(uses(2, 10, AGREEING_USERS - 1)).level).toBe('amber');
  });

  it('never flags one missing use', () => {
    expect(rules.count(uses(0, 1)).level).toBe('neutral');
  });

  it('never sets the bound above one under the expected uses', () => {
    const targets = Array.from({ length: 30 }, (_, i) => ({ expected: i + 1, target: rules.count(uses(0, i + 1)).target ?? 0 }));

    expect(targets.every(({ expected, target }) => target <= expected - 1)).toBe(true);
  });
});

describe('DecisionRuleService.mechanistic', () => {
  const GAME_AMOUNT_S = 30;
  const unused = (observed: number, reference = AGREEING) => ({ observed, reference, floor: FLOOR_S, gameAmount: GAME_AMOUNT_S });

  it('flags ready time that crosses the game amount and the top logs agree it should not', () => {
    expect(rules.mechanistic(unused(GAME_AMOUNT_S)).level).toBe('red');
  });

  it('does not flag ready time just short of the game amount', () => {
    expect(rules.mechanistic(unused(GAME_AMOUNT_S - NUDGE)).level).toBe('neutral');
  });

  it('does not flag ready time inside the top logs own spread', () => {
    expect(rules.mechanistic(unused(40, [0, 10, 20, 30, 40])).level).toBe('neutral');
  });
});

describe('DecisionRuleService.consensus', () => {
  const differ = (k: number, n = TOP_N, paired = false) => rules.consensus({ differs: true, k, n, paired });

  it('flags amber when all 10 top logs agree', () => {
    expect(differ(10).level).toBe('amber');
  });

  it('keeps 9 of 10 as a blue count when alone', () => {
    expect(differ(9).level).toBe('blue');
  });

  it('flags red alone only once the Laplace rate 1 / (n + 2) reaches 1%', () => {
    expect(differ(98, 98).level).toBe('red');
    expect(differ(97, 97).level).toBe('amber');
  });

  it('flags amber at 8 of 10 with an independent second condition', () => {
    expect(differ(8, TOP_N, true).level).toBe('amber');
  });

  it('keeps 7 of 10 blue even with a second condition', () => {
    expect(differ(7, TOP_N, true).level).toBe('blue');
  });

  it('keeps all 10 of 10 a blue count when the claim needs a second condition that does not hold', () => {
    expect(rules.consensus({ differs: true, k: TOP_N, n: TOP_N, paired: false, pairedOnly: true }).level).toBe('blue');
  });

  it('flags amber at 8 of 10 when the claim needs a second condition and it holds', () => {
    expect(rules.consensus({ differs: true, k: AGREEING_USERS, n: TOP_N, paired: true, pairedOnly: true }).level).toBe('amber');
  });

  it('stays neutral where the player does what the top logs do', () => {
    expect(rules.consensus({ differs: false, k: TOP_N, n: TOP_N, paired: true }).level).toBe('neutral');
  });

  it('keeps a bench of 4 as context', () => {
    expect(differ(4, 4).level).toBe('neutral');
  });
});

describe('DecisionRuleService.fact', () => {
  const amberConsensus: Evidence = { level: 'amber', n: TOP_N, observed: TOP_N, target: TOP_N, excess: 0 };

  it('colors a fact a game rule backs', () => {
    expect(rules.fact({ holds: true, backing: 'game-rule' }).level).toBe('red');
  });

  it('colors a fact as its consensus', () => {
    expect(rules.fact({ holds: true, backing: amberConsensus }).level).toBe('amber');
  });

  it('leaves a bare fact neutral', () => {
    expect(rules.fact({ holds: true, backing: null }).level).toBe('neutral');
  });

  it('leaves a fact that does not hold neutral', () => {
    expect(rules.fact({ holds: false, backing: 'game-rule' }).level).toBe('neutral');
  });
});
