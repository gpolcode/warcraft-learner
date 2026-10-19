import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NgHttpCachingService } from 'ng-http-caching';
import { ContrastIngestService } from './contrast-ingest-service';
import { LEAD_BENCH } from './bench-registry';
import { DATA_FILE_TRANSPORT, type DataFileTransport } from '../data/data-files/data-file-transport';
import { WclApiService, type WclPointsBudget } from '../data/wcl/wcl-api-service';
import { type Result, Results } from '../../shared/util-http/result';
import { BurstTransformService } from '../data/burst-windows/burst-transform-service';
import { RotationTransformService } from '../data/rotation/rotation-transform-service';
import { DefensiveTransformService } from '../data/defensive/defensive-transform-service';
import { GearTransformService } from '../data/gear/gear-transform-service';
import { MapTransformService } from '../data/map/map-transform-service';
import { NorthernSkyTransformService } from '../data/northern-sky/northern-sky-transform-service';
import { INGEST_POINTS_MARGIN } from '../data/ingest/ingest-points-margin';
import { SpecPlanLoaderService } from '../data/simc/spec-plan-loader-service';
import type { TopParseSelection } from '../data/wcl/wcl.models';
import type { IngestEncounter } from '../data/ingest/ingest.models';
import { ContrastBench } from '../data/verdict/calibration/calibration.models';
import { CONTRAST_DIR } from '../data/verdict/calibration/calibration-run-service';
import { ContrastCohortService } from '../data/verdict/calibration/contrast-cohort-service';
import { PLAN_KEY, planLoader, specPlan } from '../../../../testing/builders/spec-plan';
import { abilityLookup, rankingRow, reportsByCode } from '../../../../testing/builders/wcl-fixtures';
import { cast } from '../../../../testing/builders/events';
import { benchSources } from '../../../../testing/builders/bench-sources';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';
import { bench } from '../data/rotation/rotation-harness';
import { rotationLog } from '../data/verdict/calibration/calibration-harness';
import { EncounterCalibrationService } from '../data/verdict/calibration/encounter-calibration-service';
import { READY_TIME_FAMILY } from '../data/rotation/ready-time-judge-service';

const SPEC = 'SubtletyRogue';
const HEALER = 'HolyPaladin';
const HOUR_LIMIT = 18_000;
/** One pair at the paper's estimate: five logs of about 14 points each plus the rankings read. */
const PAIR_COST = 75;
const POINTS_CAP = 300;
/** Exactly one pair's estimate above the margin. */
const SPENT_ONE_PAIR_ABOVE_MARGIN = HOUR_LIMIT - INGEST_POINTS_MARGIN - PAIR_COST;
const NOW_S = 1_800_000_000;
const WEEK_S = 7 * 24 * 60 * 60;
const BOSSES = [1, 2, 3, 4, 5];
const PAGE_ROWS = 100;
/** The middle row of each fifth of a full tenth page, ranked after the 900 rows of the pages before it. */
const COHORT_RANKS = [911, 931, 951, 971, 991];

const SIGNATURE = TestBed.inject(ContrastCohortService).signature(PLAN_KEY);
TestBed.resetTestingModule();

const encounter = (id: number): IngestEncounter => ({ id, name: `Boss ${id}`, zone: 'Raid', zoneId: 1, partitionIds: [] });
const leadBench = (spec: string, id: number) => ({ [`${spec}/${LEAD_BENCH}/${id}.json`]: { encounter_id: id } });
const rankedRow = (index: number) => ({ name: `Raider${index}`, server: { name: 'Ravencrest' }, report: { code: `code${index}`, fightID: index } });

interface FakeDisk extends DataFileTransport {
  readonly files: Map<string, unknown>;
}

function fakeDisk(seed: Record<string, unknown>): FakeDisk {
  const files = new Map<string, unknown>(Object.entries(seed));
  return {
    files,
    readJson: async <T>(path: string): Promise<Result<T>> => (files.has(path) ? Results.ok(files.get(path) as T) : Results.missing(`${path} is not ingested`)),
    writeJson: async (path: string, data: unknown) => { files.set(path, data); },
    remove: async (path: string) => { files.delete(path); },
    list: async (dir: string) => {
      const prefix = dir ? `${dir}/` : '';
      return [...new Set([...files.keys()].filter(path => path.startsWith(prefix)).map(path => path.slice(prefix.length).split('/')[0] ?? ''))];
    },
  };
}

/** Each reading spends one more pair than the last. */
function spendingPerPair(startSpent: number, perPair = PAIR_COST): () => Promise<WclPointsBudget> {
  let spent = startSpent;
  return async () => { spent += perPair; return { limitPerHour: HOUR_LIMIT, pointsSpentThisHour: spent }; };
}

const budgetAt = (spent: number): WclPointsBudget => ({ limitPerHour: HOUR_LIMIT, pointsSpentThisHour: spent });

interface FakeWcl {
  api: WclApiService;
  pages: (number | undefined)[];
}

function fakeWcl(rows = PAGE_ROWS, getPointsBudget = spendingPerPair(0)): FakeWcl {
  const pages: (number | undefined)[] = [];
  const api = {
    getPointsBudget,
    getRankings: async (_spec: string, _encId: number, _partition: number | null, _metric: string, page?: number) => {
      pages.push(page);
      return { rankings: Array.from({ length: rows }, (_unused, index) => rankedRow(index)) };
    },
  } as unknown as WclApiService;
  return { api, pages };
}

/** A transform that reads every log it is handed, so its per-log measures line up with the cohort. */
const echoing = { getBench: async (_spec: string, _encId: number, selection: TopParseSelection) => Results.ok({ sources: selection, per_parse: selection.map(source => ({ rank: source.rank })) }) };
const failing = { getBench: async () => Results.transient('WCL timed out.') };

const TRANSFORMS = [BurstTransformService, RotationTransformService, DefensiveTransformService, GearTransformService, MapTransformService, NorthernSkyTransformService];

function contrastRun(
  disk: FakeDisk, wcl: FakeWcl,
  opts: { reading?: WclPointsBudget | null; bosses?: number[]; burst?: object; plan?: ReturnType<typeof specPlan>; real?: (typeof TRANSFORMS)[number][] } = {},
) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: DATA_FILE_TRANSPORT, useValue: disk },
      { provide: WclApiService, useValue: wcl.api },
      { provide: NgHttpCachingService, useValue: { clearCache: () => undefined } },
      { provide: SpecPlanLoaderService, useValue: planLoader(opts.plan ?? specPlan()) },
      ...TRANSFORMS.filter(transform => !opts.real?.includes(transform))
        .map(transform => ({ provide: transform, useValue: transform === BurstTransformService ? opts.burst ?? echoing : echoing })),
    ],
  });
  const reading = opts.reading === undefined ? budgetAt(0) : opts.reading;
  return TestBed.inject(ContrastIngestService).run((opts.bosses ?? [1]).map(encounter), reading, NOW_S);
}

const contrastOf = (disk: FakeDisk, id: number, spec = SPEC) => disk.files.get(`${spec}/${CONTRAST_DIR}/${id}.json`) as ContrastBench | undefined;

describe('ContrastIngestService.run', () => {
  beforeEach(() => { vi.spyOn(console, 'log').mockImplementation(() => undefined); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('measures five logs at evenly spaced ranks of the tenth rankings page on every card', async () => {
    const disk = fakeDisk(leadBench(SPEC, 1));
    const wcl = fakeWcl();

    await contrastRun(disk, wcl);

    const stored = contrastOf(disk, 1);
    expect(wcl.pages).toEqual([10]);
    expect(stored?.sources.map(source => source.rank)).toEqual(COHORT_RANKS);
    expect(stored?.signature).toBe(SIGNATURE);
    for (const card of [stored?.rotation, stored?.defensive, stored?.gear, stored?.burst]) expect(card?.per_parse).toHaveLength(COHORT_RANKS.length);
  });

  it('fetches with exactly one pair\'s estimate left above the margin, and nothing one point under it', async () => {
    const enough = fakeDisk(leadBench(SPEC, 1));
    const short = fakeDisk(leadBench(SPEC, 1));

    await contrastRun(enough, fakeWcl(), { reading: budgetAt(SPENT_ONE_PAIR_ABOVE_MARGIN) });
    await contrastRun(short, fakeWcl(), { reading: budgetAt(SPENT_ONE_PAIR_ABOVE_MARGIN + 1) });

    expect(contrastOf(enough, 1)).toBeDefined();
    expect(contrastOf(short, 1)).toBeUndefined();
  });

  it('fetches nothing when WCL serves no points reading, as the cap cannot be held', async () => {
    const disk = fakeDisk(leadBench(SPEC, 1));

    const run = await contrastRun(disk, fakeWcl(), { reading: null });

    expect(run.fetched).toBe(0);
    expect(contrastOf(disk, 1)).toBeUndefined();
  });

  it('stops at the 300-point cap, four pairs at 75 points each', async () => {
    const disk = fakeDisk(Object.fromEntries(BOSSES.flatMap(id => Object.entries(leadBench(SPEC, id)))));

    const run = await contrastRun(disk, fakeWcl(), { bosses: BOSSES });

    expect(run.spent).toBe(POINTS_CAP);
    expect(run.fetched).toBe(POINTS_CAP / PAIR_COST);
    expect(run.due).toBe(BOSSES.length);
  });

  it('leaves a pair whose cohort is fresh and signed for this version alone', async () => {
    const fresh: Partial<ContrastBench> = { signature: SIGNATURE, fetched_at_s: NOW_S - WEEK_S + 1, sources: [] };
    const disk = fakeDisk({ ...leadBench(SPEC, 1), [`${SPEC}/${CONTRAST_DIR}/1.json`]: fresh });
    const wcl = fakeWcl();

    const run = await contrastRun(disk, wcl);

    expect(run.due).toBe(0);
    expect(wcl.pages).toEqual([]);
  });

  it('writes nothing for a pair whose card failed to read, so it stays due', async () => {
    const disk = fakeDisk(leadBench(SPEC, 1));

    const run = await contrastRun(disk, fakeWcl(), { burst: failing });

    expect(run.fetched).toBe(0);
    expect(contrastOf(disk, 1)).toBeUndefined();
  });

  it('fetches no damage for a healer, whose top logs are ranked on healing', async () => {
    const disk = fakeDisk(leadBench(HEALER, 1));

    await contrastRun(disk, fakeWcl());

    expect(contrastOf(disk, 1, HEALER)?.burst).toBeNull();
    expect(contrastOf(disk, 1, HEALER)?.rotation?.per_parse).toHaveLength(COHORT_RANKS.length);
  });

  it('stores a page too thin for a cohort with no logs, so the pair waits its week', async () => {
    const disk = fakeDisk(leadBench(SPEC, 1));

    await contrastRun(disk, fakeWcl(COHORT_RANKS.length - 1));

    expect(contrastOf(disk, 1)).toMatchObject({ sources: [], rotation: null, burst: null });
  });

  it('skips a benched encounter the current raids no longer list', async () => {
    const disk = fakeDisk(leadBench(SPEC, 2));

    expect((await contrastRun(disk, fakeWcl(), { bosses: [1] })).due).toBe(0);
  });
});

describe('ContrastIngestService with the production rotation transform', () => {
  const SB = 'Shadow Blades';
  const FIGHT_MS = 300_000;
  const TOP_N = 6;
  /** Each weaker log presses Shadow Blades once, at 5s, and leaves it ready for the rest of the kill. */
  const ONCE_AT_S = 5;

  beforeEach(() => { vi.spyOn(console, 'log').mockImplementation(() => undefined); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('bakes each weaker log through the same transform as a top log, so calibration flags the cooldown it left ready', async () => {
    const disk = fakeDisk(leadBench(SPEC, 1));
    const wcl = {
      getPointsBudget: spendingPerPair(0),
      getRankings: async () => ({ rankings: Array.from({ length: PAGE_ROWS }, (_unused, index) => rankingRow(901 + index)) }),
      getReport: reportsByCode({ endTimeMs: FIGHT_MS, abilities: [{ gameID: SHADOW_BLADES, name: SB, icon: 'sb' }] }),
      getAllEvents: async (_code: string, _fightId: number, dataType: string) => (dataType === 'Casts' ? [cast(SHADOW_BLADES, ONCE_AT_S)] : []),
      getAbilities: abilityLookup(),
      getCombatantInfo: async () => [],
    } as unknown as WclApiService;
    const plan = specPlan({ cooldowns: [{ name: SB, spell_id: SHADOW_BLADES, cooldown: 90 }] });

    await contrastRun(disk, { api: wcl, pages: [] }, { plan, real: [RotationTransformService] });

    const weaker = contrastOf(disk, 1);
    expect(weaker?.rotation?.per_parse.map(parse => parse.cd_casts_s[SB])).toEqual(COHORT_RANKS.map(() => [ONCE_AT_S]));
    const topBench = bench({ sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: Array.from({ length: TOP_N }, () => rotationLog()) });
    const calibrated = TestBed.inject(EncounterCalibrationService).calibrate(SPEC, 1, { rotation: topBench, defensive: null, gear: null, burst: null }, '', weaker ?? null);
    expect(calibrated.discrimination[READY_TIME_FAMILY.id]?.contrast).toEqual(COHORT_RANKS.map(() => [1, 1]));
  });
});
