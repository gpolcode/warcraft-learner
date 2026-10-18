import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CdHoldTargets } from '../encounter/encounter.models';
import { CadenceJudgeService } from './cadence-judge-service';

const judges = TestBed.inject(CadenceJudgeService);

const NAME = 'Shadow Blades';
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
