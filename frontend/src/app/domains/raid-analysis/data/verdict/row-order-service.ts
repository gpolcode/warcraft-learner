import { Injectable } from '@angular/core';
import type { FoldCounts } from '../analysis/pull-model-service';
import { CostClass, DamageEstimate, RowRank, Tone, TONE_LEVELS } from './tone.models';

/** One judged row as the page-wide strip and the damage card read it, whatever card drew it. */
export interface RankedRow {
  /** The card's heading. */
  card: string;
  /** The family's label. */
  check: string;
  /** What the row is about, such as a cooldown or a slot; empty where the check names nothing. */
  subject: string;
  tone: Tone;
  rank: RowRank;
  damage: DamageEstimate | null;
  message: string;
}

/** What a card hands the page: its ranked rows and the checks it folded under a root cause. */
export interface CardRanking {
  rows: RankedRow[];
  folded: FoldCounts;
}

/** What a row sorts on, whatever its own shape. */
export interface OrderKey {
  tone: Tone;
  rank?: RowRank | null;
  damage?: DamageEstimate | null;
}

const COST_ORDER: readonly CostClass[] = ['low', 'medium', 'high'];
const FIX_FIRST = 3;

/** Muted ranks below neutral: it was not judged at all. */
const toneRank = (tone: Tone): number => tone === 'muted' ? -1 : TONE_LEVELS.findIndex(level => level === tone);

/** Each larger value sorts first; a row without a damage estimate sorts below one with any. */
const SORT_KEYS: readonly ((key: OrderKey) => number)[] = [
  key => toneRank(key.tone),
  key => COST_ORDER.indexOf(key.rank?.costClass ?? 'low'),
  key => TONE_LEVELS.indexOf(key.rank?.evidence ?? 'neutral'),
  key => key.damage?.aboutS ?? -1,
  key => key.rank?.shortfall ?? 0,
];

/** Orders rows across cards: tone, then cost class, evidence, damage and shortfall. */
@Injectable({ providedIn: 'root' })
export class RowOrderService {
  /** A colored row before an uncolored one, then the costlier class, the stronger evidence, a quantified damage over none and the larger, and the larger shortfall. */
  compare(a: OrderKey, b: OrderKey): number {
    for (const key of SORT_KEYS) {
      const difference = key(b) - key(a);
      if (difference) return difference;
    }
    return 0;
  }

  /** Stable, so rows that tie keep the card's own order. */
  order<T>(rows: readonly T[], key: (row: T) => OrderKey): T[] {
    return [...rows].sort((a, b) => this.compare(key(a), key(b)));
  }

  /** The three costliest colored rows across the cards; empty when none is colored. */
  fixFirst(rows: readonly RankedRow[]): RankedRow[] {
    return this.order(rows.filter(row => row.tone === 'amber' || row.tone === 'red'), row => row).slice(0, FIX_FIRST);
  }
}
