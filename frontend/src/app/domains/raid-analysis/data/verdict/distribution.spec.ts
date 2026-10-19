import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DistributionService } from './distribution-service';

const distribution = TestBed.inject(DistributionService);

/** Student t quantiles from the standard tables, to six places. */
const T_4_AT_95 = 2.131847;
const T_4_AT_99 = 3.746947;
const T_9_AT_95 = 1.833113;
const T_9_AT_99 = 2.821438;
/** One degree of freedom is the Cauchy distribution, whose 97.5% point is tan(0.475 pi). */
const T_1_AT_975 = Math.tan(0.475 * Math.PI);
const SIX_PLACES = 6;

/** P(X >= 5) for X ~ Binomial(20, 0.1), summed term by term. */
const BINOMIAL_20_TENTH_AT_LEAST_5 = 0.043174495;
/** P(X <= 3) for X ~ Poisson(10), summed term by term. */
const POISSON_10_AT_MOST_3 = 0.010336051;
const NINE_PLACES = 9;

/** One-sided 95% Clopper-Pearson bounds, by bisection on the exact binomial CDF: the red design rate at the red pool size, the amber design rate at the amber pool size. */
const CP_15_OF_1500 = 0.0153565;
const CP_25_OF_500 = 0.0691361;
/** With no event the bound has the closed form 1 - 0.05^(1/n). */
const CP_0_OF_1500 = 1 - 0.05 ** (1 / 1500);
const ARMING_CONFIDENCE = 0.95;

describe('DistributionService', () => {
  it('reads the t quantiles of the standard tables', () => {
    expect(distribution.tQuantile(4, 0.95)).toBeCloseTo(T_4_AT_95, SIX_PLACES);
    expect(distribution.tQuantile(4, 0.99)).toBeCloseTo(T_4_AT_99, SIX_PLACES);
    expect(distribution.tQuantile(9, 0.95)).toBeCloseTo(T_9_AT_95, SIX_PLACES);
    expect(distribution.tQuantile(9, 0.99)).toBeCloseTo(T_9_AT_99, SIX_PLACES);
    expect(distribution.tQuantile(1, 0.975)).toBeCloseTo(T_1_AT_975, SIX_PLACES);
  });

  it('puts half of the t distribution on each side of zero', () => {
    expect(distribution.tCdf(0, 4)).toBeCloseTo(0.5, SIX_PLACES);
    expect(distribution.tQuantile(4, 0.05)).toBeCloseTo(-T_4_AT_95, SIX_PLACES);
  });

  it('sums the binomial upper tail', () => {
    expect(distribution.binomialUpperTail(5, 20, 0.1)).toBeCloseTo(BINOMIAL_20_TENTH_AT_LEAST_5, NINE_PLACES);
  });

  it('gives a binomial tail of 1 from zero and of 0 past every trial', () => {
    expect(distribution.binomialUpperTail(0, 20, 0.1)).toBe(1);
    expect(distribution.binomialUpperTail(21, 20, 0.1)).toBe(0);
  });

  it('sums the Poisson lower tail', () => {
    expect(distribution.poissonCdf(3, 10)).toBeCloseTo(POISSON_10_AT_MOST_3, NINE_PLACES);
  });

  it('bounds a binomial rate from above the Clopper-Pearson way', () => {
    expect(distribution.clopperPearsonUpper(15, 1500, ARMING_CONFIDENCE)).toBeCloseTo(CP_15_OF_1500, SIX_PLACES);
    expect(distribution.clopperPearsonUpper(25, 500, ARMING_CONFIDENCE)).toBeCloseTo(CP_25_OF_500, SIX_PLACES);
    expect(distribution.clopperPearsonUpper(0, 1500, ARMING_CONFIDENCE)).toBeCloseTo(CP_0_OF_1500, SIX_PLACES);
  });

  it('bounds a rate at 1 with no trial or with every trial an event', () => {
    expect(distribution.clopperPearsonUpper(0, 0, ARMING_CONFIDENCE)).toBe(1);
    expect(distribution.clopperPearsonUpper(10, 10, ARMING_CONFIDENCE)).toBe(1);
  });

  it('reads a rank correlation of 1 for values that rise together, however unevenly', () => {
    expect(distribution.spearman([1, 2, 3, 4], [10, 11, 50, 900])).toBe(1);
  });

  it('reads a rank correlation of -1 for values that move apart', () => {
    expect(distribution.spearman([1, 2, 3, 4], [4, 3, 2, 1])).toBe(-1);
  });

  it('ranks ties at their average rank', () => {
    // Ranks [1.5, 1.5, 3] against [1, 2, 3]: covariance 1.5 over the square root of 1.5 times 2.
    const TIED = 1.5 / Math.sqrt(1.5 * 2);

    expect(distribution.spearman([0, 0, 5], [1, 2, 3])).toBeCloseTo(TIED, SIX_PLACES);
  });

  it('reads no correlation when one side has no spread', () => {
    expect(distribution.spearman([0, 0, 0], [1, 2, 3])).toBe(0);
  });
});
