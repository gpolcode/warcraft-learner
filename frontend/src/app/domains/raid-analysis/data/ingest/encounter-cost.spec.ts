import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EncounterCostService } from './encounter-cost-service';

const encounterCost = TestBed.inject(EncounterCostService);

const NOTE = 'done';
const LIMIT_PER_HOUR = 3600;
const SPENT_BEFORE = 1200;
const QUOTA = 50;
const HITS = 7;
const MISSES = 8;
const READS = HITS + MISSES;

const spentSoFar = (pointsSpentThisHour: number) => ({ limitPerHour: LIMIT_PER_HOUR, pointsSpentThisHour });
const tally = (hits: number, misses: number) => ({ hits, misses });
const NO_READS = tally(0, 0);

describe('formatOutcome', () => {
  it('appends the points spent and how many store reads were cached', () => {
    expect(encounterCost.formatOutcome(NOTE, spentSoFar(SPENT_BEFORE), spentSoFar(SPENT_BEFORE + QUOTA), tally(HITS, MISSES)))
      .toBe(`done (${QUOTA} quota, ${HITS}/${READS} cached)`);
  });

  it('keeps the hundredths WCL reports, so the logged lines sum to the budget', () => {
    /** Readings as WCL served them in one ingest run, whose difference carries floating-point noise past the hundredths. */
    const READ_BEFORE = 3100.94;
    const READ_AFTER = 3140.72;
    const SPENT_BETWEEN = '39.78';

    expect(encounterCost.formatOutcome(NOTE, spentSoFar(READ_BEFORE), spentSoFar(READ_AFTER), NO_READS))
      .toBe(`done (${SPENT_BETWEEN} quota)`);
  });

  it('reports only a lower bound once the spend reads lower than before, since the hourly window reset in between', () => {
    /** The smallest drop below the earlier reading: the boundary partner of the equal-reading case. */
    const SPENT_SINCE_RESET = SPENT_BEFORE - 1;

    expect(encounterCost.formatOutcome(NOTE, spentSoFar(SPENT_BEFORE), spentSoFar(SPENT_SINCE_RESET), NO_READS))
      .toBe(`done (at least ${SPENT_SINCE_RESET} quota)`);
  });

  it('reports zero quota, not a reset, when the spend reads the same as before', () => {
    expect(encounterCost.formatOutcome(NOTE, spentSoFar(SPENT_BEFORE), spentSoFar(SPENT_BEFORE), NO_READS))
      .toBe('done (0 quota)');
  });

  it('leaves the quota out when either reading is unknown', () => {
    expect(encounterCost.formatOutcome(NOTE, null, spentSoFar(SPENT_BEFORE), tally(HITS, MISSES)))
      .toBe(`done (${HITS}/${READS} cached)`);
    expect(encounterCost.formatOutcome(NOTE, spentSoFar(SPENT_BEFORE), null, tally(HITS, MISSES)))
      .toBe(`done (${HITS}/${READS} cached)`);
  });

  it('reports a single read the store missed as none of one cached', () => {
    expect(encounterCost.formatOutcome(NOTE, null, null, tally(0, 1))).toBe('done (0/1 cached)');
  });

  it('leaves the note bare when nothing reached the store and the quota is unknown', () => {
    expect(encounterCost.formatOutcome(NOTE, null, null, NO_READS)).toBe(NOTE);
  });
});
