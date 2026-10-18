import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Results, type Result } from '../../../shared/util-http/result';
import { ValidityFeatureService } from './validity-feature-service';
import { CALIBRATION_SOURCE } from '../verdict/calibration/calibration-source';
import { RegistryHashService } from '../verdict/calibration/registry-hash-service';
import { NOT_GRADED } from '../verdict/calibration/arming-service';
import { CalibrationIndex, FamilyCalibration } from '../verdict/calibration/calibration.models';
import { DOWNTIME_FAMILY } from '../rotation/downtime-judge-service';
import { ENCHANT_MISSING_FAMILY } from '../gear/gear-judge-service';

const hash = TestBed.inject(RegistryHashService).registryHash();
TestBed.resetTestingModule();

/** Sixty held-out DPS pulls drawing 3 amber rows between them. */
const DPS_LOAD = { pulls: 60, amber: 3, red: 0 };
const OPENER: FamilyCalibration = {
  tier: 'amber', pooled: { tests: 200, amber: 10, red: 0 }, upper: { red: 0.02, amber: 0.08 },
  detection: { trials: 20, detected: 7 }, verdict: { status: 'comparison', cap: 'neutral', reason: NOT_GRADED.tooFew },
};
const ENCHANTS: FamilyCalibration = {
  tier: 'amber', pooled: { tests: 1000, amber: 10, red: 0 }, upper: { red: 0.003, amber: 0.018 },
  detection: { trials: 100, detected: 95 }, verdict: { status: 'graded', cap: 'amber', reason: 'Graded amber.' },
};

const index = (over: Partial<CalibrationIndex> = {}): CalibrationIndex => ({
  registry_hash: hash, encounters: 6, pulls: 60,
  families: { [DOWNTIME_FAMILY.id]: OPENER, [ENCHANT_MISSING_FAMILY.id]: ENCHANTS },
  specs: {}, demoted: {}, invariants: [], unfoldable: {},
  page: {
    measured: { dps: DPS_LOAD, tank: { pulls: 0, amber: 0, red: 0 }, healer: { pulls: 0, amber: 0, red: 0 } },
    armed: { dps: DPS_LOAD, tank: { pulls: 0, amber: 0, red: 0 }, healer: { pulls: 0, amber: 0, red: 0 } },
  },
  ...over,
});

function serviceReading(result: Result<unknown>): ValidityFeatureService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: CALIBRATION_SOURCE, useValue: { load: () => Promise.resolve(result) } }] });
  return TestBed.inject(ValidityFeatureService);
}

async function measurementOf(result: Result<unknown>) {
  const view = await serviceReading(result).loadView();
  return view.ok ? view.value.measurement : undefined;
}

describe('ValidityFeatureService.loadView', () => {
  it('lists each measured check in registry order with its tests, rates and verdict', async () => {
    const measurement = await measurementOf(Results.ok(index()));

    expect(measurement?.families).toEqual([
      {
        label: DOWNTIME_FAMILY.label, tag: 'Not graded', graded: false, tests: 200, redRate: 0, amberRate: 10 / 200,
        detection: OPENER.detection, reason: NOT_GRADED.tooFew,
      },
      {
        label: ENCHANT_MISSING_FAMILY.label, tag: 'Amber', graded: true, tests: 1000, redRate: 0, amberRate: 10 / 1000,
        detection: ENCHANTS.detection, reason: 'Graded amber.',
      },
    ]);
  });

  it('gives a check no top log was judged on no rate', async () => {
    const untested = { ...OPENER, pooled: { tests: 0, amber: 0, red: 0 } };
    const measurement = await measurementOf(Results.ok(index({ families: { [DOWNTIME_FAMILY.id]: untested } })));

    expect(measurement?.families[0]).toMatchObject({ redRate: null, amberRate: null });
  });

  it('reports the rows per pull each role with judged pulls draws under the armed caps', async () => {
    const measurement = await measurementOf(Results.ok(index()));

    expect(measurement?.roles).toEqual([{ label: 'DPS', pulls: 60, redPerPull: 0, amberPerPull: 3 / 60 }]);
  });

  it('marks a measurement of another version of the checks as not current', async () => {
    expect((await measurementOf(Results.ok(index({ registry_hash: 'older' }))))?.current).toBe(false);
  });

  it('marks a measurement of this version of the checks as current', async () => {
    expect((await measurementOf(Results.ok(index())))?.current).toBe(true);
  });

  it('has no measurement when none is published', async () => {
    expect(await measurementOf(Results.missing('calibration.json is not ingested'))).toBeNull();
  });

  it('has no measurement on a file that is not an index', async () => {
    expect(await measurementOf(Results.ok({ unrelated: true }))).toBeNull();
  });

  it('passes a failed read through as the card\'s error', async () => {
    const view = await serviceReading(Results.transient('Network down.')).loadView();

    expect(view.ok).toBe(false);
  });
});
