import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ArmingService, NOT_GRADED } from './arming-service';
import { FindingFamily } from '../finding-family.models';
import { READY_TIME_FAMILY } from '../../rotation/ready-time-judge-service';
import { COOLDOWN_HOLD_FAMILY } from '../../rotation/cadence-judge-service';
import { DOWNTIME_FAMILY } from '../../rotation/downtime-judge-service';
import { Discrimination, FamilyVerdict, FlagTally } from './calibration.models';

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

/** Exactly at every discrimination gate: lift 2, its lower bound 1.3, AUC 0.6. */
const AT_GATES: Discrimination = { topPulls: 100, contrastPulls: 20, topRate: 0.05, contrastRate: 0.1, lift: 2, liftLower: 1.3, auc: 0.6 };
/** Just under each gate in turn. */
const UNDER_LIFT = { ...AT_GATES, lift: 1.99 };
const UNDER_LOWER = { ...AT_GATES, liftLower: 1.29 };
const UNDER_AUC = { ...AT_GATES, auc: 0.59 };

const tally = (tests: number, amber: number, red = 0): FlagTally => ({ tests, amber, red });
const graded = (cap: 'red' | 'amber'): FamilyVerdict => ({ status: 'graded', cap, reason: '' });

describe('ArmingService verdict', () => {
  it('arms red on a pool of the red minimum at the red design rate', () => {
    expect(arming.verdict(READY_TIME_FAMILY, [tally(RED_POOL, AT_RED_DESIGN, AT_RED_DESIGN)], POWERED, AT_GATES).cap).toBe('red');
  });

  it('arms only amber once the red rate is past its bound', () => {
    expect(arming.verdict(READY_TIME_FAMILY, [tally(RED_POOL, PAST_RED_BOUND, PAST_RED_BOUND)], POWERED, AT_GATES).cap).toBe('amber');
  });

  it('never arms red on an amber-tier family', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, [tally(RED_POOL, AT_RED_DESIGN, AT_RED_DESIGN)], POWERED, AT_GATES).cap).toBe('amber');
  });

  it('leaves a family a comparison under the amber pool\'s minimum', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, [tally(UNDER_AMBER_POOL, 0)], POWERED, AT_GATES)).toEqual({ status: 'comparison', cap: 'neutral', reason: NOT_GRADED.tooFew });
  });

  it('decides on the first pool with enough tests, from the most specific', () => {
    const smallSpecPool = tally(UNDER_AMBER_POOL, UNDER_AMBER_POOL);

    expect(arming.verdict(DOWNTIME_FAMILY, [smallSpecPool, tally(RED_POOL, 0)], POWERED, AT_GATES).cap).toBe('amber');
  });

  it('withholds a grade from a family that misses the mistakes it claims', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, [tally(RED_POOL, 0)], WEAK, AT_GATES).reason).toBe(NOT_GRADED.weak);
  });

  it('withholds a grade from a family that names mistakes and was never tried on one', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, [tally(RED_POOL, 0)], NO_TRIAL, AT_GATES).status).toBe('comparison');
  });

  it('grades a blue family at its tier with no test and no contrast at all', () => {
    expect(arming.verdict(COOLDOWN_HOLD_FAMILY, [], NO_TRIAL, null)).toEqual({ status: 'graded', cap: 'blue', reason: expect.any(String) as string });
  });

  it('arms a family that names no mistake on its rate alone', () => {
    const quiet: FindingFamily = { ...DOWNTIME_FAMILY, injectedMistakes: [] };

    expect(arming.verdict(quiet, [tally(RED_POOL, 0)], NO_TRIAL, AT_GATES).cap).toBe('amber');
  });
});

describe('ArmingService discrimination gate', () => {
  const ARMED = [tally(RED_POOL, 0)];

  it('grades a family exactly at every discrimination gate', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, ARMED, POWERED, AT_GATES).cap).toBe('amber');
  });

  it('withholds the grade just under the lift, its lower bound or the AUC', () => {
    for (const under of [UNDER_LIFT, UNDER_LOWER, UNDER_AUC]) {
      expect(arming.verdict(DOWNTIME_FAMILY, ARMED, POWERED, under)).toEqual({ status: 'comparison', cap: 'neutral', reason: NOT_GRADED.separates });
    }
  });

  it('keeps an armed family a comparison until its contrast is measured', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, ARMED, POWERED, null)).toEqual({ status: 'comparison', cap: 'neutral', reason: NOT_GRADED.contrastPending });
  });

  it('gives a family that does not arm its own reason before the contrast is asked', () => {
    expect(arming.verdict(DOWNTIME_FAMILY, [tally(UNDER_AMBER_POOL, 0)], POWERED, null).reason).toBe(NOT_GRADED.tooFew);
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
