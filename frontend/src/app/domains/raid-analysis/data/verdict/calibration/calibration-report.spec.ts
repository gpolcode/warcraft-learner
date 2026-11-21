import { CLOSED_GATE } from '../damage-estimate-service';
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CalibrationReportService } from './calibration-report-service';
import { CalibrationIndex, FamilyCalibration } from './calibration.models';
import { NOT_GRADED } from './arming-service';

const reports = TestBed.inject(CalibrationReportService);

const NO_LOAD = { pulls: 0, amber: 0, red: 0 };
const family = (over: Partial<FamilyCalibration> = {}): FamilyCalibration => ({
  tier: 'amber', pooled: { tests: 600, amber: 6, red: 0 }, upper: { red: 0.005, amber: 0.02 }, detection: { trials: 10, detected: 9 },
  discrimination: null, verdict: { status: 'comparison', cap: 'neutral', reason: NOT_GRADED.contrastPending }, ...over,
});
const index = (families: Record<string, FamilyCalibration>): CalibrationIndex => ({
  registry_hash: '', encounters: 4, pulls: 40, contrast_pulls: 20, families, specs: {}, demoted: {}, invariants: [], unfoldable: {}, damage: CLOSED_GATE,
  page: { measured: { dps: NO_LOAD, tank: NO_LOAD, healer: NO_LOAD }, armed: { dps: NO_LOAD, tank: NO_LOAD, healer: NO_LOAD } },
});

describe('CalibrationReportService.report', () => {
  it('counts the contrast pulls beside the held-out top pulls', () => {
    expect(reports.report(index({}))).toContain('4 encounters, 40 held-out top pulls, 20 contrast pulls.');
  });

  it('prints a family\'s lift with its lower bound and its AUC', () => {
    const separated = family({ discrimination: { topPulls: 40, contrastPulls: 20, topRate: 0.01, contrastRate: 0.05, lift: 5, liftLower: 2.25, auc: 0.7 } });

    expect(reports.report(index({ 'rotation.downtime': separated }))).toContain('| 5.00 (2.25) over 20 pulls | 0.70 |');
  });

  it('prints the damage gate over the contrast logs it measured', () => {
    const measured = { ...index({}), damage: { logs: 30, exceedShare: 0.1, spearman: 0.42, open: true } };

    expect(reports.report(measured)).toContain('Damage estimates: shown, over 30 contrast logs, above the gap on 0.100, Spearman 0.42.');
  });

  it('prints the damage gate hidden with no contrast log measured', () => {
    expect(reports.report(index({}))).toContain('Damage estimates: hidden, no contrast log measured.');
  });

  it('prints none for a family with no contrast measured, with its pending reason', () => {
    expect(reports.report(index({ 'rotation.downtime': family() }))).toContain(`| none | none | comparison, neutral: ${NOT_GRADED.contrastPending} |`);
  });
});
