import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DiscriminationService } from './discrimination-service';
import { DiscriminationSample, PullFlags } from './calibration.models';

const discrimination = TestBed.inject(DiscriminationService);

const FAMILY = 'rotation.ready_time';
const OTHER = 'rotation.downtime';
const MIN_CONTRAST_PULLS = 20;
const SEED = 'all';

const pulls = (count: number, flags: PullFlags): PullFlags[] => Array.from({ length: count }, () => flags);

/** 100 top pulls of 10 tests flag 4 between them; 20 contrast pulls of 10 tests flag 10. */
const SEPARATED: DiscriminationSample = { top: [...pulls(96, [10, 0]), ...pulls(4, [10, 1])], contrast: [...pulls(10, [10, 0]), ...pulls(10, [10, 1])] };
/** Smoothed: (4 + 1) / (1000 + 2) on top logs, (10 + 1) / (200 + 2) on contrast logs. */
const TOP_RATE = 5 / 1002;
const CONTRAST_RATE = 11 / 202;
/** A flagging contrast pull is above the 96 quiet top pulls and ties the 4 flagging ones; a quiet one ties the 96: 0.5 * (0.96 + 0.04 / 2) + 0.5 * 0.96 / 2. */
const AUC = 0.73;

describe('DiscriminationService.flagsByPull', () => {
  it('counts each pull\'s tests and amber or red flags per family, leaving out families it has no test of', () => {
    const pull = [
      { family: FAMILY, level: 'amber' as const }, { family: FAMILY, level: 'red' as const }, { family: FAMILY, level: 'neutral' as const },
    ];
    const other = [{ family: OTHER, level: 'blue' as const }];

    expect(discrimination.flagsByPull([pull, other])).toEqual({ [FAMILY]: [[3, 2]], [OTHER]: [[1, 0]] });
  });
});

describe('DiscriminationService.measure', () => {
  it('measures the lift of the smoothed flag rates and the AUC over pulls', () => {
    const measured = discrimination.measure(SEPARATED, SEED);

    expect(measured).toMatchObject({ topPulls: 100, contrastPulls: MIN_CONTRAST_PULLS, topRate: TOP_RATE, contrastRate: CONTRAST_RATE });
    expect(measured?.lift).toBeCloseTo(CONTRAST_RATE / TOP_RATE, 10);
    expect(measured?.auc).toBeCloseTo(AUC, 10);
  });

  it('bounds the lift from below and draws the same bound again on the same seed', () => {
    const measured = discrimination.measure(SEPARATED, SEED);

    expect(measured?.liftLower).toBeLessThan(measured?.lift ?? 0);
    expect(discrimination.measure(SEPARATED, SEED)?.liftLower).toBe(measured?.liftLower);
  });

  it('gives an AUC of a half when contrast pulls flag exactly as top pulls do', () => {
    expect(discrimination.measure({ top: pulls(40, [10, 1]), contrast: pulls(MIN_CONTRAST_PULLS, [10, 1]) }, SEED)?.auc).toBe(0.5);
  });

  it('measures nothing one contrast pull short of the minimum', () => {
    expect(discrimination.measure({ ...SEPARATED, contrast: SEPARATED.contrast.slice(1) }, SEED)).toBeNull();
  });

  it('measures nothing without a top pull to compare with', () => {
    expect(discrimination.measure({ top: [], contrast: SEPARATED.contrast }, SEED)).toBeNull();
  });
});
