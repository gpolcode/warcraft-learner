import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NgHttpCachingService } from 'ng-http-caching';
import { IngestOrchestratorService } from './ingest-orchestrator-service';
import { LEAD_BENCH } from './bench-registry';
import { DATA_FILE_TRANSPORT, type DataFileTransport } from '../data/data-files/data-file-transport';
import { WclApiService } from '../data/wcl/wcl-api-service';
import { WCL_TRANSPORT, type WclTransport } from '../data/wcl/wcl-transport';
import { type Result, Results } from '../../shared/util-http/result';
import { BurstTransformService } from '../data/burst-windows/burst-transform-service';
import { RotationTransformService } from '../data/rotation/rotation-transform-service';
import { DefensiveTransformService } from '../data/defensive/defensive-transform-service';
import { GearTransformService } from '../data/gear/gear-transform-service';
import { MapTransformService } from '../data/map/map-transform-service';
import { NorthernSkyTransformService } from '../data/northern-sky/northern-sky-transform-service';
import { IngestSignatureService } from '../data/ingest/ingest-signature-service';
import { INGEST_VERSION } from '../data/ingest/ingest-version';
import { SpecPlanLoaderService } from '../data/simc/spec-plan-loader-service';
import type { SpecPlan } from '../data/simc/spec-plan-service';
import { PLAN_KEY, planLoader, specPlan } from '../../../../testing/builders/spec-plan';

const signatures = TestBed.inject(IngestSignatureService);
TestBed.resetTestingModule();

const SPEC = 'SubtletyRogue';
const RAID = 'Manaforge Omega';
const ZONE_ID = 44;
const PARTITION = 2;

const CURRENT_BOSS = { id: 3129, name: 'Nexus-King Salhadaar' };
const NEW_BOSS = { id: 3131, name: 'Dimensius' };
const RETIRED_BOSS = { id: 2902, name: 'Ulgrax the Devourer' };
const BOSSES = [CURRENT_BOSS, NEW_BOSS, RETIRED_BOSS];

const STORED_SAMPLES = 3;
const FRESH_SAMPLES = 7;
const HOURLY_POINT_LIMIT = 18_000;

const rankedRow = (player: string, code: string, fightID: number) =>
  ({ name: player, server: { name: 'Ravencrest' }, report: { code, fightID } });
type RankedRow = ReturnType<typeof rankedRow>;

const TOP_PARSE = rankedRow('Kaelra', 'aBcD1234', 12);
const RUNNER_UP = rankedRow('Torvin', 'eFgH5678', 3);
const NEWCOMER = rankedRow('Miravel', 'iJkL9012', 5);
const RANKED = [TOP_PARSE, RUNNER_UP];
const RERANKED = [TOP_PARSE, NEWCOMER];

// Fewer rows than the orchestrator's top-N cap: past it, signatureOf stops matching the signature the run stamps.
const signatureOf = (rows: RankedRow[], planKey = PLAN_KEY): string => signatures.encounterSkipKey(
  rows.map(row => ({ report_code: row.report.code, fight_id: row.report.fightID })),
  new Set(), `${INGEST_VERSION}:${planKey}`, rows.length);

const benchPath = (encId: number, bench = LEAD_BENCH): string => `${SPEC}/${bench}/${encId}.json`;
const bossName = (encId: number): string => BOSSES.find(boss => boss.id === encId)?.name ?? '';

interface FakeDisk extends DataFileTransport {
  readonly files: Map<string, unknown>;
}

function fakeDisk(seed: Record<string, unknown>, undeletable = new Set<string>()): FakeDisk {
  const files = new Map<string, unknown>(Object.entries(seed));
  return {
    files,
    readJson: async <T>(path: string): Promise<Result<T>> =>
      files.has(path) ? Results.ok(files.get(path) as T) : Results.missing(`${path} is not ingested`),
    writeJson: async (path: string, data: unknown) => { files.set(path, data); },
    remove: async (path: string) => {
      if (undeletable.has(path)) throw new Error(`the file server refused to delete ${path}`);
      files.delete(path);
    },
    list: async (dir: string) => {
      const prefix = dir ? `${dir}/` : '';
      const entries = new Set<string>();
      for (const path of files.keys()) {
        if (path.startsWith(prefix)) entries.add(path.slice(prefix.length).split('/')[0] ?? '');
      }
      return [...entries];
    },
  };
}

function fakeWcl(encounters: { id: number; name: string }[], rankings: Record<number, RankedRow[]>): WclApiService {
  const zone = { id: ZONE_ID, name: RAID, frozen: false, partitions: [{ id: PARTITION }], encounters };
  return {
    getPointsBudget: async () => ({ limitPerHour: HOURLY_POINT_LIMIT, pointsSpentThisHour: 0 }),
    getPlayableClasses: async () => [{ name: 'Rogue', slug: 'Rogue', specs: [{ name: 'Subtlety', slug: 'Subtlety' }] }],
    getZoneTree: async () => [{ zones: [zone] }],
    getRankings: async (_spec: string, encId: number) => ({ rankings: rankings[encId] ?? [] }),
    query: () => { throw new Error('the run issued a raw WCL query; discovery goes through the narrow reads'); },
  } as unknown as WclApiService;
}

const TRANSFORMS = [
  BurstTransformService, RotationTransformService, DefensiveTransformService,
  GearTransformService, MapTransformService, NorthernSkyTransformService,
];

const stubTransform = {
  getBench: async (_spec: string, encId: number) =>
    Results.ok({ encounter_id: encId, encounter_name: bossName(encId), sample_count: FRESH_SAMPLES }),
};

const cleanTransport: Pick<WclTransport, 'withFetchOutcomes'> = {
  withFetchOutcomes: async run =>
    ({ result: await run(), outcomes: { inaccessibleCodes: new Set(), failedCodes: new Set() } }),
};

function ingest(disk: FakeDisk, wcl: WclApiService, currentRaids: string, plans = planLoader(specPlan())): Promise<void> {
  globalThis.history.replaceState(null, '', currentRaids ? `/?currentRaids=${encodeURIComponent(currentRaids)}` : '/');
  TestBed.configureTestingModule({
    providers: [
      { provide: DATA_FILE_TRANSPORT, useValue: disk },
      { provide: WclApiService, useValue: wcl },
      { provide: WCL_TRANSPORT, useValue: cleanTransport },
      { provide: NgHttpCachingService, useValue: { clearCache: () => undefined } },
      { provide: SpecPlanLoaderService, useValue: plans },
      ...TRANSFORMS.map(transform => ({ provide: transform, useValue: stubTransform })),
    ],
  });
  return TestBed.inject(IngestOrchestratorService).run();
}

describe('IngestOrchestratorService.run', () => {
  const RETIRED_ON_DISK = {
    [benchPath(RETIRED_BOSS.id)]: {
      encounter_id: RETIRED_BOSS.id, encounter_name: RETIRED_BOSS.name,
      sample_count: STORED_SAMPLES, ingest_version: INGEST_VERSION,
    },
    [benchPath(RETIRED_BOSS.id, 'positions')]: { encounter_id: RETIRED_BOSS.id, ingest_version: INGEST_VERSION },
  };
  const filesFor = (disk: FakeDisk, encId: number): string[] =>
    [...disk.files.keys()].filter(path => path.endsWith(`/${encId}.json`));

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes every bench file of an encounter the current raids no longer list', async () => {
    const disk = fakeDisk(RETIRED_ON_DISK);

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(filesFor(disk, RETIRED_BOSS.id)).toEqual([]);
  });

  it('prunes nothing when no current raid resolved, rather than reading that as "prune everything"', async () => {
    const disk = fakeDisk(RETIRED_ON_DISK);

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), '');

    expect(filesFor(disk, RETIRED_BOSS.id))
      .toEqual([benchPath(RETIRED_BOSS.id), benchPath(RETIRED_BOSS.id, 'positions')]);
    expect(disk.files.get(`${SPEC}/encounters.json`))
      .toEqual([{ id: RETIRED_BOSS.id, name: RETIRED_BOSS.name, sample_count: STORED_SAMPLES }]);
  });

  it('keeps a boss the current raids no longer list out of the index, even when its bench survives deletion', async () => {
    const disk = fakeDisk(RETIRED_ON_DISK, new Set([benchPath(RETIRED_BOSS.id)]));

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(filesFor(disk, RETIRED_BOSS.id)).toEqual([benchPath(RETIRED_BOSS.id)]);
    expect(disk.files.get(`${SPEC}/encounters.json`))
      .toEqual([{ id: CURRENT_BOSS.id, name: CURRENT_BOSS.name, sample_count: FRESH_SAMPLES }]);
  });

  it('leaves a benched encounter untouched when its stored signature covers the current top parses', async () => {
    const stored = {
      encounter_id: CURRENT_BOSS.id, encounter_name: CURRENT_BOSS.name, sample_count: STORED_SAMPLES,
      source_signature: signatureOf(RANKED), ingest_version: INGEST_VERSION,
    };
    const disk = fakeDisk({ [benchPath(CURRENT_BOSS.id)]: stored });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toEqual(stored);
  });

  it('re-benches that encounter once one of the top parses changes', async () => {
    const stored = {
      encounter_id: CURRENT_BOSS.id, encounter_name: CURRENT_BOSS.name, sample_count: STORED_SAMPLES,
      source_signature: signatureOf(RANKED), ingest_version: INGEST_VERSION,
    };
    const disk = fakeDisk({ [benchPath(CURRENT_BOSS.id)]: stored });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RERANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({
      sample_count: FRESH_SAMPLES, source_signature: signatureOf(RERANKED),
    });
  });

  it('lists an encounter with no Mythic parses yet in the index, at zero samples', async () => {
    const disk = fakeDisk({});

    await ingest(disk, fakeWcl([CURRENT_BOSS, NEW_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(`${SPEC}/encounters.json`)).toEqual([
      { id: CURRENT_BOSS.id, name: CURRENT_BOSS.name, sample_count: FRESH_SAMPLES },
      { id: NEW_BOSS.id, name: NEW_BOSS.name, sample_count: 0 },
    ]);
  });

  it('re-benches an encounter once its spec\'s plan changes, though the top parses did not', async () => {
    const REVISED_PLAN: SpecPlan = { ...specPlan(), key: 'revised-plan-key' };
    const stored = {
      encounter_id: CURRENT_BOSS.id, encounter_name: CURRENT_BOSS.name, sample_count: STORED_SAMPLES,
      source_signature: signatureOf(RANKED), ingest_version: INGEST_VERSION,
    };
    const disk = fakeDisk({ [benchPath(CURRENT_BOSS.id)]: stored });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, planLoader(REVISED_PLAN));

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({
      sample_count: FRESH_SAMPLES, source_signature: signatureOf(RANKED, REVISED_PLAN.key),
    });
  });

  it('ingests every spec WCL lists, with no file on disk naming it first', async () => {
    const disk = fakeDisk({});

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.has(benchPath(CURRENT_BOSS.id))).toBe(true);
  });

  it('fails a spec whose plan cannot load without writing any of its benches', async () => {
    const disk = fakeDisk({});
    const unreachable = planLoader(Results.transient('WCL is unreachable right now.'));

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, unreachable);

    expect(disk.files.has(benchPath(CURRENT_BOSS.id))).toBe(false);
    expect((globalThis as { __INGEST_DONE__?: { failed: { spec: string }[] } }).__INGEST_DONE__?.failed.map(entry => entry.spec)).toEqual([SPEC]);
  });
});
