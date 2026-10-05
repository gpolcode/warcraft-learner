import { Injectable } from '@angular/core';
import type { WclPointsBudget } from '../wcl/wcl-api-service';
import type { StoreTally } from '../wcl/wcl-transport';

// WCL reports points to the hundredth; rounding each line to whole points would let the lines drift from the budget they sum to.
const POINT_DECIMALS = 2;

@Injectable({ providedIn: 'root' })
export class EncounterCostService {
  /** The points delta covers every spender on the client pair, not just this run. */
  formatOutcome(
    note: string, before: WclPointsBudget | null, after: WclPointsBudget | null, store: Readonly<StoreTally>,
  ): string {
    const costs = [this.quotaCost(before, after), this.storeCost(store)].filter(cost => cost !== null);
    return costs.length ? `${note} (${costs.join(', ')})` : note;
  }

  private quotaCost(before: WclPointsBudget | null, after: WclPointsBudget | null): string | null {
    if (!before || !after) return null;
    const spent = after.pointsSpentThisHour - before.pointsSpentThisHour;
    // The hourly window reset in between, so only the spend since the reset is known.
    if (spent < 0) return `at least ${this.points(after.pointsSpentThisHour)} quota`;
    return `${this.points(spent)} quota`;
  }

  // Through Number, so a whole spend prints without trailing zeros.
  private points(value: number): number {
    return Number(value.toFixed(POINT_DECIMALS));
  }

  private storeCost({ hits, misses }: Readonly<StoreTally>): string | null {
    const reads = hits + misses;
    return reads > 0 ? `${hits}/${reads} cached` : null;
  }
}
