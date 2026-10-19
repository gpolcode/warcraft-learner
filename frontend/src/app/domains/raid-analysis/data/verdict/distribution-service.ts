import { Injectable } from '@angular/core';

const LANCZOS_G = 7;
const LANCZOS_HEAD = 0.99999999999980993;
const LANCZOS_TAIL = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];
const CF_MAX_ITERATIONS = 300;
const CF_EPSILON = 3e-14;
const CF_TINY = 1e-300;
const BISECTION_STEPS = 100;
const T_SEARCH_MAX = 1e4;
const HASH_SEED = 2166136261;
const HASH_PRIME = 16777619;
const UINT32 = 2 ** 32;

/** The few tail probabilities the decision rules need; d3-array has none. */
@Injectable({ providedIn: 'root' })
export class DistributionService {
  /** The t value with probability `p` below it on `df` degrees of freedom. */
  tQuantile(df: number, p: number): number {
    if (p === 0.5) return 0;
    if (p < 0.5) return -this.tQuantile(df, 1 - p);
    let lo = 0;
    let hi = T_SEARCH_MAX;
    for (let step = 0; step < BISECTION_STEPS; step++) {
      const mid = (lo + hi) / 2;
      if (this.tCdf(mid, df) < p) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  tCdf(t: number, df: number): number {
    const tail = 0.5 * this.regularizedBeta(df / (df + t * t), df / 2, 0.5);
    return t >= 0 ? 1 - tail : tail;
  }

  /** P(X >= x) for X ~ Binomial(m, p). */
  binomialUpperTail(x: number, m: number, p: number): number {
    if (x <= 0) return 1;
    if (x > m) return 0;
    let sum = 0;
    for (let i = x; i <= m; i++) sum += Math.exp(this.logBinomialPmf(i, m, p));
    return Math.min(1, sum);
  }

  /** The one-sided Clopper-Pearson upper bound on a binomial rate after `k` events in `n` trials, at `confidence`. */
  clopperPearsonUpper(k: number, n: number, confidence: number): number {
    if (n <= 0 || k >= n) return 1;
    let lo = 0;
    let hi = 1;
    for (let step = 0; step < BISECTION_STEPS; step++) {
      const mid = (lo + hi) / 2;
      // I_p(k + 1, n - k) is P(X >= k + 1) at rate p, so the bound is where k or fewer events fall to 1 - confidence.
      if (this.regularizedBeta(mid, k + 1, n - k) < confidence) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /** P(X <= k) for X ~ Poisson(lambda). */
  poissonCdf(k: number, lambda: number): number {
    if (k < 0) return 0;
    if (lambda <= 0) return 1;
    let sum = 0;
    for (let i = 0; i <= Math.floor(k); i++) sum += Math.exp(i * Math.log(lambda) - lambda - this.logGamma(i + 1));
    return Math.min(1, sum);
  }

  private logBinomialPmf(i: number, m: number, p: number): number {
    if (p <= 0) return i === 0 ? 0 : -Infinity;
    if (p >= 1) return i === m ? 0 : -Infinity;
    const logChoose = this.logGamma(m + 1) - this.logGamma(i + 1) - this.logGamma(m - i + 1);
    return logChoose + i * Math.log(p) + (m - i) * Math.log(1 - p);
  }

  private logGamma(z: number): number {
    if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - this.logGamma(1 - z);
    const shifted = z - 1;
    const series = LANCZOS_TAIL.reduce((sum, coefficient, i) => sum + coefficient / (shifted + i + 1), LANCZOS_HEAD);
    const t = shifted + LANCZOS_G + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(series);
  }

  /** I_x(a, b), by the continued fraction on whichever side converges. */
  private regularizedBeta(x: number, a: number, b: number): number {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const front = Math.exp(this.logGamma(a + b) - this.logGamma(a) - this.logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return front * this.betaFraction(x, a, b) / a;
    return 1 - front * this.betaFraction(1 - x, b, a) / b;
  }

  private betaFraction(x: number, a: number, b: number): number {
    let c = 1;
    let d = this.nonZero(1 - (a + b) * x / (a + 1));
    d = 1 / d;
    let result = d;
    for (let m = 1; m <= CF_MAX_ITERATIONS; m++) {
      const even = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
      d = 1 / this.nonZero(1 + even * d);
      c = this.nonZero(1 + even / c);
      result *= d * c;
      const odd = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
      d = 1 / this.nonZero(1 + odd * d);
      c = this.nonZero(1 + odd / c);
      const delta = d * c;
      result *= delta;
      if (Math.abs(delta - 1) < CF_EPSILON) break;
    }
    return result;
  }

  private nonZero(value: number): number {
    return Math.abs(value) < CF_TINY ? CF_TINY : value;
  }

  /** Uniform draws in [0, 1) from a mulberry32 stream seeded by FNV-1a over the key, so a recompute draws the same values. */
  seededStream(key: string): () => number {
    let state = HASH_SEED;
    for (const char of key) state = Math.imul(state ^ char.charCodeAt(0), HASH_PRIME) >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / UINT32;
    };
  }
}
