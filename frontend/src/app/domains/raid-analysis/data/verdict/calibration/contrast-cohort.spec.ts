import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ContrastCohortService, type ContrastPair } from './contrast-cohort-service';
import { ContrastBench } from './calibration.models';
import { INGEST_VERSION } from '../../ingest/ingest-version';
import { parseRanking } from '../../../../../../testing/builders/bench-sources';

const cohorts = TestBed.inject(ContrastCohortService);

const PLAN_KEY = 'plan';
const SIGNATURE = `${INGEST_VERSION}:${PLAN_KEY}`;
const NOW_S = 1_800_000_000;
const WEEK_S = 7 * 24 * 60 * 60;
/** A full rankings page of 100 readable rows. */
const PAGE = Array.from({ length: 100 }, (_unused, index) => parseRanking({ rank: 901 + index }));
/** The middle row of each fifth: rows 10, 30, 50, 70 and 90. */
const EVENLY_SPACED = [911, 931, 951, 971, 991];

const stored = (over: Partial<ContrastBench> = {}): ContrastBench => ({
  spec: 'SubtletyRogue', encounter_id: 1, signature: SIGNATURE, fetched_at_s: NOW_S, sources: [],
  rotation: null, defensive: null, gear: null, burst: null, ...over,
});
const pair = (bench: ContrastBench | null): ContrastPair => ({ spec: 'SubtletyRogue', encounterId: 1, stored: bench, signature: SIGNATURE });

describe('ContrastCohortService.pick', () => {
  it('takes five logs at evenly spaced ranks of the page', () => {
    expect(cohorts.pick(PAGE).map(row => row.rank)).toEqual(EVENLY_SPACED);
  });

  it('takes every row of a page with exactly five, and none of a page with four', () => {
    expect(cohorts.pick(PAGE.slice(0, 5))).toHaveLength(5);
    expect(cohorts.pick(PAGE.slice(0, 4))).toEqual([]);
  });
});

describe('ContrastCohortService.due', () => {
  it('fetches a pair with no cohort', () => {
    expect(cohorts.due(pair(null), NOW_S)).toBe(true);
  });

  it('fetches a cohort baked under another ingest version or plan', () => {
    expect(cohorts.due(pair(stored({ signature: `${INGEST_VERSION - 1}:${PLAN_KEY}` })), NOW_S)).toBe(true);
  });

  it('fetches a cohort a week old, and keeps one a second younger', () => {
    expect(cohorts.due(pair(stored({ fetched_at_s: NOW_S - WEEK_S })), NOW_S)).toBe(true);
    expect(cohorts.due(pair(stored({ fetched_at_s: NOW_S - WEEK_S + 1 })), NOW_S)).toBe(false);
  });

  it('signs a cohort with the ingest version and the plan key', () => {
    expect(cohorts.signature(PLAN_KEY)).toBe(SIGNATURE);
  });
});

describe('ContrastCohortService.order', () => {
  it('puts pairs with no cohort first, then the oldest', () => {
    const older = pair(stored({ fetched_at_s: NOW_S - 2 * WEEK_S }));
    const newer = pair(stored({ fetched_at_s: NOW_S - WEEK_S }));
    const missing = pair(null);

    expect(cohorts.order([newer, older, missing])).toEqual([missing, older, newer]);
  });
});
