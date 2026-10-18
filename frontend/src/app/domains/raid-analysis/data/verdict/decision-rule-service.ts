import { inject, Injectable } from '@angular/core';
import { deviation, mean } from 'd3-array';
import { DistributionService } from './distribution-service';
import { Evidence, ToneLevel } from './tone.models';
import { VERDICT_CHOICES } from './verdict-choices';

type GradedLevel = Extract<ToneLevel, 'red' | 'amber'>;

export interface IntervalInput {
  observed: number;
  /** One value per top log, never their aggregate. */
  reference: readonly number[];
  /** The side a mistake lies on: a low share is `below`, a late cast `above`. */
  side: 'below' | 'above';
  /** Absolute tolerance in the construct's unit, so identical top logs still leave room. */
  floor: number;
}

export interface ExcessRateInput {
  misses: number;
  moments: number;
  referenceMisses: number;
  referenceMoments: number;
  n: number;
}

export interface CountInput {
  uses: number;
  /** Expected uses over the available time, already capped by the cadence fit. */
  expected: number;
  n: number;
  /** Top logs that used it at all; red needs the paired consensus share of them, so a cooldown many skip is never a red loss. */
  users: number;
}

export interface MechanisticInput extends Omit<IntervalInput, 'side'> {
  /** The amount the game itself defines as lost, such as one cooldown's worth of ready time. */
  gameAmount: number;
}

export interface ConsensusInput {
  differs: boolean;
  /** Top logs that do what the player did not. */
  k: number;
  n: number;
  /** An independent second condition holds, such as the talent taken with at least 2 expected uses. */
  paired: boolean;
}

export interface FactInput {
  holds: boolean;
  /** What may color the fact: a consensus or a game rule; a bare fact stays neutral. */
  backing: Evidence | 'game-rule' | null;
}

const GRADED: readonly GradedLevel[] = ['red', 'amber'];

/** The closed set of rules that turn a measurement into evidence; families pick one, they never write their own. */
@Injectable({ providedIn: 'root' })
export class DecisionRuleService {
  private readonly distribution = inject(DistributionService);

  /** A t prediction interval for one new top log, widened by the floor, so neither the reference's extreme nor s = 0 is an edge. */
  interval(input: IntervalInput): Evidence {
    const n = input.reference.length;
    if (n < VERDICT_CHOICES.minReferenceN) return this.none(n, input.observed);
    const edgeOf = (level: GradedLevel): number => this.intervalEdge(input, level);
    const outside = (edge: number): boolean => input.side === 'below' ? input.observed < edge : input.observed > edge;
    const target = edgeOf('amber');
    return {
      level: GRADED.find(level => outside(edgeOf(level))) ?? 'neutral',
      n, observed: input.observed, target,
      excess: outside(target) ? Math.abs(input.observed - target) : 0,
    };
  }

  /** A one-sided binomial test of the player's misses against the reference miss rate, floored by the rule of succession so a perfect bench still tolerates a miss. */
  excessRate(input: ExcessRateInput): Evidence {
    if (input.n < VERDICT_CHOICES.minReferenceN || input.moments <= 0) return this.none(input.n, input.misses);
    const rate = Math.max(input.referenceMisses / Math.max(1, input.referenceMoments), 1 / (input.referenceMoments + 2));
    const flagged = (misses: number, level: GradedLevel): boolean =>
      misses - input.moments * rate >= VERDICT_CHOICES.effectFloors.excessMisses[level]
      && this.distribution.binomialUpperTail(misses, input.moments, rate) <= VERDICT_CHOICES.perTestBudget[level];
    let tolerated = 0;
    while (tolerated < input.moments && !flagged(tolerated + 1, 'amber')) tolerated++;
    return {
      level: GRADED.find(level => flagged(input.misses, level)) ?? 'neutral',
      n: input.n, observed: input.misses, target: tolerated,
      excess: Math.max(0, input.misses - tolerated),
    };
  }

  /** A Poisson lower bound on uses, never above `expected - 1`, so one missing use is always inside. */
  count(input: CountInput): Evidence {
    if (input.n < VERDICT_CHOICES.minReferenceN) return this.none(input.n, input.uses);
    const floors = VERDICT_CHOICES.effectFloors;
    const shortfall = input.expected - input.uses;
    const bigEnough = shortfall >= Math.max(floors.lostUses, floors.lostUsesShare * input.expected);
    const boundOf = (level: GradedLevel): number => Math.min(this.poissonLowerBound(input.expected, level), input.expected - 1);
    const target = boundOf('amber');
    const agreed = input.users / input.n >= VERDICT_CHOICES.pairedConsensusShare;
    const levels = agreed ? GRADED : GRADED.filter(level => level !== 'red');
    return {
      level: bigEnough ? levels.find(level => input.uses < boundOf(level)) ?? 'neutral' : 'neutral',
      n: input.n, observed: input.uses, target,
      excess: Math.max(0, target - input.uses),
    };
  }

  /** A game-defined loss that also lies beyond the top logs' own spread. */
  mechanistic(input: MechanisticInput): Evidence {
    const beyond = this.interval({ ...input, side: 'above' });
    return input.observed >= input.gameAmount ? beyond : { ...beyond, level: 'neutral', excess: 0 };
  }

  /** Alone, "you differ from k of n" flags a top log (n - k) / n of the time, so it colors only when every top log agrees. */
  consensus(input: ConsensusInput): Evidence {
    const base = { n: input.n, observed: input.k, target: input.k, excess: 0 };
    if (!input.differs || input.n < VERDICT_CHOICES.minReferenceN) return { ...base, level: 'neutral' };
    if (input.paired) return { ...base, level: input.k / input.n >= VERDICT_CHOICES.pairedConsensusShare ? 'amber' : 'blue' };
    if (input.k < input.n) return { ...base, level: 'blue' };
    const laplaceRate = 1 / (input.n + 2);
    return { ...base, level: laplaceRate <= VERDICT_CHOICES.perTestBudget.red ? 'red' : 'amber' };
  }

  /** A plain fact colors only through what backs it. */
  fact(input: FactInput): Evidence {
    const observed = input.holds ? 1 : 0;
    if (!input.holds || input.backing === null) return this.none(0, observed);
    if (input.backing === 'game-rule') return { level: 'red', n: 0, observed, target: null, excess: 0 };
    return { ...input.backing, observed };
  }

  private intervalEdge(input: IntervalInput, level: GradedLevel): number {
    const n = input.reference.length;
    const spread = deviation(input.reference) ?? 0;
    const t = this.distribution.tQuantile(n - 1, 1 - VERDICT_CHOICES.perTestBudget[level]);
    const halfWidth = t * spread * Math.sqrt(1 + 1 / n) + input.floor;
    const centre = mean(input.reference) ?? 0;
    return input.side === 'below' ? centre - halfWidth : centre + halfWidth;
  }

  /** The fewest uses a Poisson count around `expected` reaches with probability above the level's budget. */
  private poissonLowerBound(expected: number, level: GradedLevel): number {
    let bound = 0;
    while (this.distribution.poissonCdf(bound, expected) <= VERDICT_CHOICES.perTestBudget[level]) bound++;
    return bound;
  }

  private none(n: number, observed: number): Evidence {
    return { level: 'neutral', n, observed, target: null, excess: 0 };
  }
}
