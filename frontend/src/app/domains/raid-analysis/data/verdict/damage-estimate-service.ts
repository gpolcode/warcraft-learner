import { inject, Injectable } from '@angular/core';
import { max, mean, median, min, sum } from 'd3-array';
import type { ParseRanking } from '../wcl/wcl.models';
import { DistributionService } from './distribution-service';
import { DamageEstimate } from './tone.models';
import { VERDICT_CHOICES } from './verdict-choices';

/** One contrast log: the estimates the page would print for it, summed, and the gap its ranked figure shows to the top logs, both in seconds of its own average damage. */
export type DamageSample = [estimateS: number, gapS: number];

export interface DamageGate {
  logs: number;
  /** Share of the logs whose estimate is above the gap they show. */
  exceedShare: number;
  spearman: number;
  open: boolean;
}

export const CLOSED_GATE: DamageGate = { logs: 0, exceedShare: 0, spearman: 0, open: false };

const CHOICES = VERDICT_CHOICES.damage;

/** Damage a finding cost, in seconds of the player's own average damage, where one pull identifies it; the same measure runs on contrast logs for the gate. */
@Injectable({ providedIn: 'root' })
export class DamageEstimateService {
  private readonly distribution = inject(DistributionService);

  /** Idle seconds past the top logs' share over the same alive time, about their average and between their most and least idle; null when none is past the average. */
  idle(casting: { idleS: number; aliveS: number }, referencePct: readonly number[]): DamageEstimate | null {
    const excessS = (pct: number | undefined): number => Math.max(0, casting.idleS - (pct ?? 0) / 100 * casting.aliveS);
    const aboutS = excessS(mean(referencePct));
    if (!referencePct.length || aboutS <= 0) return null;
    return { aboutS, lowS: excessS(max(referencePct)), highS: excessS(min(referencePct)) };
  }

  /** A dead span read on each top log's own damage per second as a share of its average, since a pull deals more in some seconds than in others; without one, the span's length. */
  dead(fromS: number, toS: number, topDamagePerS: readonly (readonly number[])[]): DamageEstimate {
    const reads = topDamagePerS.flatMap(perS => {
      const average = sum(perS) / perS.length;
      // A top log killed before the span ends never fought that part of the pull.
      if (!perS.length || average <= 0 || perS.length < toS) return [];
      let dealt = 0;
      for (let second = Math.floor(fromS); second < toS; second++) {
        dealt += (perS[second] ?? 0) * (Math.min(toS, second + 1) - Math.max(fromS, second));
      }
      return [dealt / average];
    });
    const lengthS = toS - fromS;
    return { aboutS: median(reads) ?? lengthS, lowS: min(reads) ?? lengthS, highS: max(reads) ?? lengthS };
  }

  deaths(deadSpans: readonly (readonly [number, number])[], judgedEndS: number, topDamagePerS: readonly (readonly number[])[]): DamageEstimate[] {
    return deadSpans.filter(([diedS]) => diedS < judgedEndS).map(([diedS, backS]) => this.dead(diedS, Math.min(backS, judgedEndS), topDamagePerS));
  }

  /** How far the log's ranked figure falls short of the top logs' median, in seconds of its own average over its own pull; null without the figures. */
  gapS(log: ParseRanking, top: readonly ParseRanking[]): number | null {
    const amounts = top.flatMap(source => source.amount !== null && source.amount > 0 ? [source.amount] : []);
    const reference = median(amounts);
    if (reference === undefined || log.amount === null || log.amount <= 0 || !log.duration_s) return null;
    return (reference - log.amount) / log.amount * log.duration_s;
  }

  totalS(estimates: readonly (DamageEstimate | null)[]): number {
    return estimates.reduce((total, estimate) => total + (estimate?.aboutS ?? 0), 0);
  }

  /** Open once enough logs are measured, few of their estimates claim more than the gap they show, and the estimates rank the logs as the gaps do. */
  gate(samples: readonly DamageSample[]): DamageGate {
    const logs = samples.length;
    if (!logs) return CLOSED_GATE;
    const exceedShare = samples.filter(([estimateS, gapS]) => estimateS > 0 && estimateS > gapS).length / logs;
    const spearman = this.distribution.spearman(samples.map(([estimateS]) => estimateS), samples.map(([, gapS]) => gapS));
    return { logs, exceedShare, spearman, open: logs >= CHOICES.minLogs && exceedShare <= CHOICES.maxExceedShare && spearman >= CHOICES.minSpearman };
  }
}
