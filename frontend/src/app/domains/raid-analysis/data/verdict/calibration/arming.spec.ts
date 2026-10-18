import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ArmingService, NOT_GRADED } from './arming-service';
import { FindingFamily } from '../finding-family.models';
import { LOST_CAST_FAMILY } from '../../rotation/cooldown-use-judge-service';
import { COOLDOWN_HOLD_FAMILY, LATE_OPENER_FAMILY } from '../../rotation/cadence-judge-service';
import { FamilyVerdict, FlagTally } from './calibration.models';

const arming = TestBed.inject(ArmingService);

/** The red pool's minimum, flagged at the red design rate of 1%: its 95% bound is 1.54%, inside the 2% arming bound. */
const RED_POOL = 1500;
const AT_RED_DESIGN = 15;
/** Twice the design rate: its bound is past 2%. */
const PAST_RED_BOUND = 30;
/** One short of the amber pool's minimum. */
const UNDER_AMBER_POOL = 499;
const POWERED = { trials: 10, detected: 10 };
/** Six of ten caught is under the 70% amber floor. */
const WEAK = { trials: 10, detected: 6 };
const NO_TRIAL = { trials: 0, detected: 0 };

const tally = (tests: number, amber: number, red = 0): FlagTally => ({ tests, amber, red });
const graded = (cap: 'red' | 'amber'): FamilyVerdict => ({ status: 'graded', cap, reason: '' });

describe('ArmingService verdict', () => {
  it('arms red on a pool of the red minimum at the red design rate', () => {
    expect(arming.verdict(LOST_CAST_FAMILY, [tally(RED_POOL, AT_RED_DESIGN, AT_RED_DESIGN)], POWERED).cap).toBe('red');
  });

  it('arms only amber once the red rate is past its bound', () => {
    expect(arming.verdict(LOST_CAST_FAMILY, [tally(RED_POOL, PAST_RED_BOUND, PAST_RED_BOUND)], POWERED).cap).toBe('amber');
  });

  it('never arms red on an amber-tier family', () => {
    expect(arming.verdict(LATE_OPENER_FAMILY, [tally(RED_POOL, AT_RED_DESIGN, AT_RED_DESIGN)], POWERED).cap).toBe('amber');
  });

  it('leaves a family a comparison under the amber pool\'s minimum', () => {
    expect(arming.verdict(LATE_OPENER_FAMILY, [tally(UNDER_AMBER_POOL, 0)], POWERED)).toEqual({ status: 'comparison', cap: 'neutral', reason: NOT_GRADED.tooFew });
  });

  it('decides on the first pool with enough tests, from the most specific', () => {
    const smallSpecPool = tally(UNDER_AMBER_POOL, UNDER_AMBER_POOL);

    expect(arming.verdict(LATE_OPENER_FAMILY, [smallSpecPool, tally(RED_POOL, 0)], POWERED).cap).toBe('amber');
  });

  it('withholds a grade from a family that misses the mistakes it claims', () => {
    expect(arming.verdict(LATE_OPENER_FAMILY, [tally(RED_POOL, 0)], WEAK).reason).toBe(NOT_GRADED.weak);
  });

  it('withholds a grade from a family that names mistakes and was never tried on one', () => {
    expect(arming.verdict(LATE_OPENER_FAMILY, [tally(RED_POOL, 0)], NO_TRIAL).status).toBe('comparison');
  });

  it('grades a blue family at its tier with no test at all', () => {
    expect(arming.verdict(COOLDOWN_HOLD_FAMILY, [], NO_TRIAL)).toEqual({ status: 'graded', cap: 'blue', reason: expect.any(String) as string });
  });

  it('arms a family that names no mistake on its rate alone', () => {
    const quiet: FindingFamily = { ...LATE_OPENER_FAMILY, injectedMistakes: [] };

    expect(arming.verdict(quiet, [tally(RED_POOL, 0)], NO_TRIAL).cap).toBe('amber');
  });
});

describe('ArmingService page budget', () => {
  const PULLS = 100;

  it('shows a red-capped family\'s red rows as red and an amber-capped one\'s as amber', () => {
    const load = arming.armedLoad({ a: tally(PULLS, 3, 1), b: tally(PULLS, 2, 2) }, { a: 'red', b: 'amber' }, PULLS);

    expect(load).toEqual({ pulls: PULLS, red: 1, amber: 4 });
  });

  it('demotes the family adding the most amber until the page fits one amber row a pull', () => {
    const tallies = { a: tally(PULLS, 60), b: tally(PULLS, 50) };

    const fitted = arming.fitPage(tallies, { a: graded('amber'), b: graded('amber') }, PULLS);

    expect(fitted['a']?.status).toBe('comparison');
    expect(fitted['b']?.cap).toBe('amber');
  });

  it('keeps a page exactly at the amber budget', () => {
    expect(arming.breach({ pulls: PULLS, amber: PULLS, red: 0 })).toBeNull();
    expect(arming.breach({ pulls: PULLS, amber: PULLS + 1, red: 0 })).toBe('amber');
  });

  it('breaks the red budget past a tenth of a red row a pull', () => {
    expect(arming.breach({ pulls: PULLS, amber: 0, red: PULLS / 10 })).toBeNull();
    expect(arming.breach({ pulls: PULLS, amber: 0, red: PULLS / 10 + 1 })).toBe('red');
  });
});

describe('ArmingService anomaly', () => {
  /** P(X >= 3) for X ~ Binomial(10, 0.01) is about 1e-4, under the 0.01 anomaly p; P(X >= 1) is about 0.096. */
  const POOLED = tally(100, 1);

  it('demotes a bench whose own rate the pooled rate would rarely give', () => {
    expect(arming.anomalous(tally(10, 3), POOLED)).toBe(true);
  });

  it('keeps a bench whose rate the pooled rate gives often enough', () => {
    expect(arming.anomalous(tally(10, 1), POOLED)).toBe(false);
  });
});
