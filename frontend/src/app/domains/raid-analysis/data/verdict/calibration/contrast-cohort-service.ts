import { Injectable } from '@angular/core';
import type { ParseRanking } from '../../wcl/wcl.models';
import { INGEST_VERSION } from '../../ingest/ingest-version';
import { VERDICT_CHOICES } from '../verdict-choices';
import { ContrastBench } from './calibration.models';

const CHOICES = VERDICT_CHOICES.discrimination;
/** A cohort older than a week is fetched again, so the weaker logs follow the field as it gears up. */
const REFRESH_AFTER_S = 7 * 24 * 60 * 60;

export interface ContrastPair {
  spec: string;
  encounterId: number;
  stored: ContrastBench | null;
  /** What a cohort fetched now would be signed with. */
  signature: string;
}

@Injectable({ providedIn: 'root' })
export class ContrastCohortService {
  /** The middle row of each of `cohortSize` equal slices of the page's readable rows; a page with fewer rows gives no cohort. */
  pick(rows: readonly ParseRanking[]): ParseRanking[] {
    const size = CHOICES.cohortSize;
    if (rows.length < size) return [];
    return Array.from({ length: size }, (_unused, slice) => rows[Math.floor((slice + 0.5) * rows.length / size)])
      .filter((row): row is ParseRanking => row !== undefined);
  }

  /** The measures depend on what ingest bakes and on the spec's plan, which names the cooldowns and buttons they are keyed by. */
  signature(planKey: string): string {
    return `${INGEST_VERSION}:${planKey}`;
  }

  due({ stored, signature }: ContrastPair, nowS: number): boolean {
    return stored?.signature !== signature || nowS - stored.fetched_at_s >= REFRESH_AFTER_S;
  }

  /** Pairs with no cohort first, then the oldest. */
  order(pairs: readonly ContrastPair[]): ContrastPair[] {
    return [...pairs].sort((a, b) => (a.stored?.fetched_at_s ?? -1) - (b.stored?.fetched_at_s ?? -1));
  }
}
