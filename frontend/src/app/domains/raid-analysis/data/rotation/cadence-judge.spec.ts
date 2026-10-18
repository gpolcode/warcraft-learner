import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CdHoldTargets } from '../encounter/encounter.models';
import { CadenceJudgeService } from './cadence-judge-service';
import type { RotationParseMeasures } from './rotation-data-source';

const judges = TestBed.inject(CadenceJudgeService);

const NAME = 'Shadow Blades';
const TOP_N = 5;
const topLog = (castsS: number[]): RotationParseMeasures =>
  ({ efficiency_pct: null, lust_s: null, phase_starts: [], cd_casts_s: { [NAME]: castsS }, buttons: {} });
/** Five top logs that open at 5s and press again at 95s. */
const TOP_OPEN_S = 5;
const TOP_GAP_S = 90;
const TOP_LOGS = Array.from({ length: TOP_N }, () => topLog([TOP_OPEN_S, TOP_OPEN_S + TOP_GAP_S]));
/** Identical top logs leave no spread, so the edge is the average plus the 2s opener floor. */
const OPENER_EDGE_S = TOP_OPEN_S + 2;
/** The same with the 5s timing floor on the gap. */
const GAP_EDGE_S = TOP_GAP_S + 5;
const WHOLE_PULL: [number, number][] = [[0, 300]];

describe('CadenceJudgeService opener', () => {
  it('reads each top log\'s first use in source order, skipping a log that never used it', () => {
    expect(judges.referenceOpeners([topLog([0, 90]), topLog([]), topLog([12])].map(parse => parse.cd_casts_s), NAME)).toEqual([0, 12]);
  });

  it('flags an opener past the edge as amber, naming the top logs and the target', () => {
    const LATE_S = OPENER_EDGE_S + 1;

    const finding = judges.openerFinding(NAME, [LATE_S], TOP_LOGS);

    expect(finding).toMatchObject({
      family: 'rotation.late_opener', severity: 'amber', category: 'cooldown_delay', span: { fromS: 0, toS: LATE_S },
      measured: { value: '+3s', unit: 'top 00:05, 5 top logs' },
      message: 'You opened with Shadow Blades at 00:08. 5 top logs open with it by 00:07.',
    });
  });

  it('does not flag an opener exactly at the edge', () => {
    expect(judges.openerFinding(NAME, [OPENER_EDGE_S], TOP_LOGS)).toBeNull();
  });

  it('prints the opener and the target apart when they share a clock second', () => {
    const JUST_PAST_S = OPENER_EDGE_S + 0.4;

    expect(judges.openerFinding(NAME, [JUST_PAST_S], TOP_LOGS)?.message).toBe('You opened with Shadow Blades at 7.4s. 5 top logs open with it by 7.0s.');
  });

  it('flags nothing against fewer top logs than the minimum', () => {
    expect(judges.openerFinding(NAME, [60], TOP_LOGS.slice(1))).toBeNull();
  });
});

describe('CadenceJudgeService gap', () => {
  it('measures the longest wait between uses', () => {
    expect(judges.measureGap([0, 90, 200, 260], WHOLE_PULL, {})).toEqual({ gapS: 110, fromS: 90, toS: 200 });
  });

  it('leaves out a wait the player spent partly dead', () => {
    const diedFrom20To90: [number, number][] = [[0, 20], [90, 300]];

    expect(judges.measureGap([5, 150, 200], diedFrom20To90, {})).toEqual({ gapS: 50, fromS: 150, toS: 200 });
  });

  it('leaves out a wait that ends on a use a hold target explains', () => {
    const heldTo150: CdHoldTargets = { '2': { target_s: 150, delay_s: 50, band_s: 5, effective_cd_s: 90, count: 4, total_samples: 5 } };

    expect(judges.measureGap([5, 150], WHOLE_PULL, heldTo150)).toBeNull();
  });

  it('flags one row on the longest wait past the edge, with the top logs counted', () => {
    const LONG_S = GAP_EDGE_S + 1;

    const finding = judges.gapFinding(NAME, [TOP_OPEN_S, TOP_OPEN_S + LONG_S], WHOLE_PULL, TOP_LOGS, {});

    expect(finding).toMatchObject({
      family: 'rotation.cooldown_gap', severity: 'amber', span: { fromS: TOP_OPEN_S, toS: TOP_OPEN_S + LONG_S },
      measured: { value: '96s', unit: 'top 90s, 5 top logs' },
      message: 'Shadow Blades sat 96s before your cast at 01:41, your longest wait. The longest wait of 5 top logs averages 90s. Aim for 95s or less.',
    });
  });

  it('does not flag a wait exactly at the edge', () => {
    expect(judges.gapFinding(NAME, [TOP_OPEN_S, TOP_OPEN_S + GAP_EDGE_S], WHOLE_PULL, TOP_LOGS, {})).toBeNull();
  });
});

describe('CadenceJudgeService hold', () => {
  const TARGET_S = 130;
  const BAND_S = 5;
  const COOLDOWN_S = 90;
  const holds = (count = 4, total = 5): CdHoldTargets =>
    ({ '2': { target_s: TARGET_S, delay_s: 30, band_s: BAND_S, effective_cd_s: COOLDOWN_S, count, total_samples: total } });

  it('names the early use that left the cooldown running at the target, as a count of top raiders', () => {
    const EARLY_S = 100;

    expect(judges.holdFindings(NAME, [0, EARLY_S], holds())).toEqual([expect.objectContaining({
      family: 'rotation.hold', severity: 'blue', category: 'cooldown_hold', span: { fromS: EARLY_S, toS: TARGET_S },
      measured: { value: '01:40', unit: 'hold to 02:10' },
      message: '4 of 5 top raiders hold Shadow Blades for 02:10. You pressed it at 01:40, so it was not ready then.',
      details: { cd_name: NAME },
    })]);
  });

  it('says nothing of a use at the edge of the band', () => {
    expect(judges.holdFindings(NAME, [0, TARGET_S - BAND_S], holds())).toEqual([]);
  });

  it('says nothing of an early use whose cooldown is back exactly at the target, and names one a second later', () => {
    const BACK_AT_TARGET_S = TARGET_S - COOLDOWN_S;

    expect(judges.holdFindings(NAME, [BACK_AT_TARGET_S], holds())).toEqual([]);
    expect(judges.holdFindings(NAME, [BACK_AT_TARGET_S + 1], holds())).toHaveLength(1);
  });

  it('matches by the pull clock, so a missing earlier use does not shift the target', () => {
    expect(judges.holdFindings(NAME, [100], holds())).toHaveLength(1);
  });

  it('stays blue when every top log holds, and is a comparison under the minimum', () => {
    expect(judges.holdFindings(NAME, [100], holds(5, 5))[0]?.severity).toBe('blue');
    expect(judges.holdFindings(NAME, [100], holds(4, 4))[0]?.severity).toBe('neutral');
  });
});
