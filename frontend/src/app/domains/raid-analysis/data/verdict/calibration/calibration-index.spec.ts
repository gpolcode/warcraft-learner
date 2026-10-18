import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CalibrationIndexService } from './calibration-index-service';
import { CalibrationCapsService } from './calibration-caps-service';
import { CALIBRATION_SOURCE } from './calibration-source';
import { RegistryHashService } from './registry-hash-service';
import { EncounterCalibrationService } from './encounter-calibration-service';
import { CalibrationIndex, EncounterCalibration, FlagTally, OUTSIDE_BAND } from './calibration.models';
import { Results } from '../../../../shared/util-http/result';
import { bench } from '../../rotation/rotation-harness';
import { benchSources } from '../../../../../../testing/builders/bench-sources';
import { rotationLog, SB } from './calibration-harness';
import { NOT_GRADED } from './arming-service';
import { READY_TIME_FAMILY } from '../../rotation/ready-time-judge-service';
import { DOWNTIME_FAMILY } from '../../rotation/downtime-judge-service';

const indices = TestBed.inject(CalibrationIndexService);
const encounters = TestBed.inject(EncounterCalibrationService);
const hashes = TestBed.inject(RegistryHashService);

const SPEC = 'SubtletyRogue';
const ENCOUNTER = 7;
const FAMILY = 'rotation.ready_time';
const PAGE = { spec: SPEC, encounterId: ENCOUNTER };
const TOP_N = 6;
/** The shared cadence with its 95s use skipped: Shadow Blades sits ready from 95s to 185s, one whole cooldown. */
const SKIPPED = [5, 185, 275];

/** The real caps service over a fixed source; every other spec runs on the providers file's uncapped stand-in. */
const capsWith = (load: () => Promise<unknown>) => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [CalibrationCapsService, { provide: CALIBRATION_SOURCE, useValue: { load } }] });
  return TestBed.inject(CalibrationCapsService);
};

const index = (over: Partial<CalibrationIndex> = {}): CalibrationIndex => ({
  registry_hash: hashes.registryHash(), encounters: 1, pulls: 1, families: {},
  specs: { [SPEC]: { [FAMILY]: { status: 'graded', cap: 'amber', reason: '' } } },
  demoted: {}, page: { measured: {} as CalibrationIndex['page']['measured'], armed: {} as CalibrationIndex['page']['armed'] }, invariants: [], unfoldable: {},
  ...over,
});
const encounterOf = (families: Record<string, FlagTally>, over: Partial<EncounterCalibration> = {}): EncounterCalibration => ({
  spec: SPEC, encounter_id: ENCOUNTER, role: 'dps', signature: '', pulls: 10, families,
  page: { pulls: 10, amber: 0, red: 0 }, detection: {}, invariants: {}, unfoldable: [], ...over,
});

describe('CalibrationCapsService capOf', () => {
  const capsService = capsWith(() => Promise.resolve(Results.missing('Not yet ingested.')));

  it('lets a family reach the tone its spec\'s calibration armed', () => {
    expect(capsService.capOf(index(), PAGE, FAMILY)).toBe('amber');
  });

  it('fails closed to comparison without an index', () => {
    expect(capsService.capOf(null, PAGE, FAMILY)).toBe('neutral');
  });

  it('fails closed to comparison on an index another registry wrote', () => {
    expect(capsService.capOf(index({ registry_hash: 'older' }), PAGE, FAMILY)).toBe('neutral');
  });

  it('fails closed to comparison for a family or spec the index does not name', () => {
    expect(capsService.capOf(index(), PAGE, 'rotation.unknown')).toBe('neutral');
    expect(capsService.capOf(index(), { ...PAGE, spec: 'AssassinationRogue' }, FAMILY)).toBe('neutral');
  });

  it('demotes a family to comparison on the one bench its own rate demoted', () => {
    const demoted = index({ demoted: { [SPEC]: { [String(ENCOUNTER)]: [FAMILY] } } });

    expect(capsService.capOf(demoted, PAGE, FAMILY)).toBe('neutral');
    expect(capsService.capOf(demoted, { ...PAGE, encounterId: ENCOUNTER + 1 }, FAMILY)).toBe('amber');
  });
});

describe('CalibrationIndexService build', () => {
  it('grades an amber family whose pooled rate and power arm it', () => {
    const built = indices.build([encounterOf({ [FAMILY]: { tests: 1000, amber: 10, red: 0 } }, { detection: { [FAMILY]: { trials: 10, detected: 10 } } })]);

    expect(built.specs[SPEC]?.[FAMILY]?.cap).toBe('amber');
  });

  it('drops a family whose invariant fails to comparison', () => {
    const failing = { truncate: { [FAMILY]: { base: { tests: 1000, amber: 0, red: 0 }, perturbed: { tests: 1000, amber: 100, red: 0 } } } };
    const built = indices.build([encounterOf({ [FAMILY]: { tests: 1000, amber: 10, red: 0 } }, { detection: { [FAMILY]: { trials: 10, detected: 10 } }, invariants: failing })]);

    expect(built.specs[SPEC]?.[FAMILY]?.status).toBe('comparison');
    expect(built.invariants.find(result => result.family === FAMILY)?.passed).toBe(false);
  });

  it('keeps a family whose perturbation leaves it no test, as a truncated pull leaves downtime', () => {
    const untested = { truncate: { [FAMILY]: { base: { tests: 1000, amber: 70, red: 0 }, perturbed: { tests: 0, amber: 0, red: 0 } } } };

    expect(indices.build([encounterOf({}, { invariants: untested })]).invariants[0]?.passed).toBe(true);
  });

  it('keeps a family whose perturbation flags nothing on few tests, and fails it on one flag there', () => {
    const tally = (amber: number) => ({ truncate: { [FAMILY]: { base: { tests: 7, amber: 0, red: 0 }, perturbed: { tests: 1, amber, red: 0 } } } });

    expect(indices.build([encounterOf({}, { invariants: tally(0) })]).invariants[0]?.passed).toBe(true);
    expect(indices.build([encounterOf({}, { invariants: tally(1) })]).invariants[0]?.passed).toBe(false);
  });

  it('fails the lust invariant on any Bloodlust row outside the band', () => {
    const outside = { 'lust-120': { [OUTSIDE_BAND]: { base: { tests: 0, amber: 0, red: 0 }, perturbed: { tests: 1, amber: 1, red: 0 } } } };

    expect(indices.build([encounterOf({}, { invariants: outside })]).invariants).toEqual([
      { name: 'lust-120', family: OUTSIDE_BAND, baseRate: 0, perturbedRate: 1, passed: false },
    ]);
  });

  it('demotes on its bench a family whose bench rate the pooled rate would rarely give', () => {
    const noisy = encounterOf({ [FAMILY]: { tests: 20, amber: 10, red: 0 } });
    const quiet = encounterOf({ [FAMILY]: { tests: 1000, amber: 0, red: 0 } }, { encounter_id: ENCOUNTER + 1 });
    const built = indices.build([noisy, quiet].map(entry => ({ ...entry, detection: { [FAMILY]: { trials: 10, detected: 10 } } })));

    expect(built.demoted[SPEC]?.[String(ENCOUNTER)]).toEqual([FAMILY]);
  });
});

describe('CalibrationIndexService breaches', () => {
  it('fails a recompute in which a graded family loses its grade', () => {
    const lost = index({ specs: { [SPEC]: { [FAMILY]: { status: 'comparison', cap: 'neutral', reason: 'Not graded.' } } } });

    expect(indices.breaches(index(), lost)).toEqual([`${FAMILY} on ${SPEC} lost its amber grade: Not graded.`]);
  });

  it('fails a recompute whose armed page breaks the budget', () => {
    const over = index({ page: { measured: {} as CalibrationIndex['page']['measured'], armed: { dps: { pulls: 10, amber: 20, red: 0 } } as CalibrationIndex['page']['armed'] } });

    expect(indices.breaches(null, over)).toEqual(['Page budget: dps shows 0.00 red and 2.00 amber per held-out top pull.']);
  });

  it('passes a recompute that keeps every grade inside the budget', () => {
    expect(indices.breaches(index(), index())).toEqual([]);
  });
});

describe('EncounterCalibrationService', () => {
  const logs = [rotationLog({ cd_casts_s: { [SB]: SKIPPED } }), ...Array.from({ length: TOP_N - 1 }, () => rotationLog())];
  const benches = { rotation: bench({ sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: logs }), defensive: null, gear: null, burst: null };
  const calibrated = encounters.calibrate(SPEC, ENCOUNTER, benches, 'signed');

  it('counts each held-out top log once', () => {
    expect(calibrated.pulls).toBe(TOP_N);
    expect(calibrated.page.pulls).toBe(TOP_N);
  });

  it('flags the one top log that left its cooldown ready for a whole cooldown and none of the others', () => {
    expect(calibrated.families[FAMILY]).toEqual({ tests: TOP_N, amber: 1, red: 1 });
  });

  it('tries the injected mistakes on every log that can take them', () => {
    expect(calibrated.detection[FAMILY]?.trials).toBeGreaterThan(0);
  });

  it('records every perturbation, with the lust band check on the lust shifts', () => {
    expect(Object.keys(calibrated.invariants).sort()).toEqual(['damage-scale', 'death', 'death-rez', 'jitter', 'lust-120', 'lust-180', 'truncate']);
    expect(calibrated.invariants['lust-120']?.[OUTSIDE_BAND]).toBeDefined();
  });

  it('names the burst bench as one it cannot fold', () => {
    expect(encounters.calibrate(SPEC, ENCOUNTER, { ...benches, burst: {} as never }, '').unfoldable).toEqual(['burst']);
  });
});

describe('CalibrationCapsService', () => {

  it('caps a family at the tone the published index armed', async () => {
    const caps = await capsWith(() => Promise.resolve(Results.ok(index()))).load(SPEC, ENCOUNTER);

    expect(caps.capOf(FAMILY)).toBe('amber');
  });

  it('fails closed when no index is published', async () => {
    const caps = await capsWith(() => Promise.resolve(Results.missing('Not yet ingested.'))).load(SPEC, ENCOUNTER);

    expect(caps.capOf(FAMILY)).toBe('neutral');
  });

  it('fails closed on a file that is not an index', async () => {
    const caps = await capsWith(() => Promise.resolve(Results.ok({ unrelated: true }))).load(SPEC, ENCOUNTER);

    expect(caps.capOf(FAMILY)).toBe('neutral');
  });

  it('lists a family the index leaves a comparison as not graded, with its reason', async () => {
    const tooFew = index({ specs: { [SPEC]: { [FAMILY]: { status: 'comparison', cap: 'neutral', reason: NOT_GRADED.tooFew } } } });
    const service = capsWith(() => Promise.resolve(Results.ok(tooFew)));

    expect(service.notGraded(await service.load(SPEC, ENCOUNTER), [READY_TIME_FAMILY]))
      .toEqual([{ label: READY_TIME_FAMILY.label, reason: NOT_GRADED.tooFew }]);
  });

  it('leaves a graded family off the not-graded list', async () => {
    const service = capsWith(() => Promise.resolve(Results.ok(index())));

    expect(service.notGraded(await service.load(SPEC, ENCOUNTER), [READY_TIME_FAMILY])).toEqual([]);
  });

  it('names the boss as the reason on a bench whose own rate demoted the family', async () => {
    const demoted = index({ demoted: { [SPEC]: { [String(ENCOUNTER)]: [FAMILY] } } });
    const service = capsWith(() => Promise.resolve(Results.ok(demoted)));

    expect(service.notGraded(await service.load(SPEC, ENCOUNTER), [READY_TIME_FAMILY]))
      .toEqual([{ label: READY_TIME_FAMILY.label, reason: NOT_GRADED.bench }]);
  });

  it('lists every family as not graded when no index is published', async () => {
    const service = capsWith(() => Promise.resolve(Results.missing('Not yet ingested.')));

    expect(service.notGraded(await service.load(SPEC, ENCOUNTER), [READY_TIME_FAMILY, DOWNTIME_FAMILY]).map(note => note.label))
      .toEqual([READY_TIME_FAMILY.label, DOWNTIME_FAMILY.label]);
  });
});
