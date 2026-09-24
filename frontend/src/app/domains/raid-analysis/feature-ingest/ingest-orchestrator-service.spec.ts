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
import { SimcDataService } from '../data/http/simc-data-service';
import type { SpecMeta } from '../data/data-files/spec-meta.models';
import { TalentDataService } from '../data/http/talent-data-service';
import { EncounterRulebookService } from '../data/rulebook-build/encounter-rulebook-service';
import { RulebookBuildService } from '../data/rulebook-build/rulebook-build-service';
import type { PublishedRunSummary } from '../data/ingest/ingest-run-summary-service';
import type { Rulebook } from '../data/rulebook/rulebook.models';
import { rulebook } from '../../../../testing/builders/rulebook';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';

const signatures = TestBed.inject(IngestSignatureService);
const builder = TestBed.inject(RulebookBuildService);
TestBed.resetTestingModule();

const SPEC = 'SubtletyRogue';
const RAID = 'Manaforge Omega';
const ZONE_ID = 44;
const PARTITION = 2;
const TIER = 'midnight/MID2';

const CURRENT_BOSS = { id: 3129, name: 'Nexus-King Salhadaar' };
const NEW_BOSS = { id: 3131, name: 'Dimensius' };
const RETIRED_BOSS = { id: 2902, name: 'Ulgrax the Devourer' };
const BOSSES = [CURRENT_BOSS, NEW_BOSS, RETIRED_BOSS];

const STORED_SAMPLES = 3;
const FRESH_SAMPLES = 7;
const HOURLY_POINT_LIMIT = 18_000;

const APL = 'actions=backstab,if=buff.shadow_dance.up';
const OLDER_APL = 'actions=backstab';
const DUMP = '';
const UNKNOWN_SHAPE = 'buff.*.brand_new_field';
const APL_WITH_GAP = 'actions=backstab,if=buff.shadow_dance.brand_new_field';
const META: SpecMeta = { spec: SPEC, className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety', classIcon: 'class_rogue' };
const TIER_PARTS = { branch: 'midnight', dir: 'MID2' };

/** The stamp keys on what the rules read, so the expected signature carries the key the builder derives from the action list and dump. */
const sourceKey = async (apl: string | null): Promise<string> => {
  if (apl === null) return String(INGEST_VERSION);
  const sources = builder.prepare({ spec: META, tier: TIER_PARTS, apl, spellData: DUMP, talents: {} });
  return `${INGEST_VERSION}:${await builder.sourceKey(sources)}`;
};

const rankedRow = (player: string, code: string, fightID: number) =>
  ({ name: player, server: { name: 'Ravencrest' }, report: { code, fightID } });
type RankedRow = ReturnType<typeof rankedRow>;

const TOP_PARSE = rankedRow('Kaelra', 'aBcD1234', 12);
const RUNNER_UP = rankedRow('Torvin', 'eFgH5678', 3);
const NEWCOMER = rankedRow('Miravel', 'iJkL9012', 5);
const RANKED = [TOP_PARSE, RUNNER_UP];
const RERANKED = [TOP_PARSE, NEWCOMER];

// Fewer rows than the orchestrator's top-N cap: past it, signatureOf stops matching the signature the run stamps.
const signatureOf = async (rows: RankedRow[], apl: string | null = APL): Promise<string> => signatures.encounterSkipKey(
  rows.map(row => ({ report_code: row.report.code, fight_id: row.report.fightID })),
  new Set(), await sourceKey(apl), rows.length);

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

const cleanTransport: Pick<WclTransport, 'withFetchOutcomes'> = {
  withFetchOutcomes: async run =>
    ({ result: await run(), outcomes: { inaccessibleCodes: new Set(), failedCodes: new Set() } }),
};

interface RunOptions {
  simcTier: string | null;
  apl: Result<string>;
  /** Sees the rulebook every bench received, so a test can tell a derived one from none. */
  onBench: (received: Rulebook | null) => void;
}

const DERIVED = rulebook({ spec: SPEC, cooldowns: [{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }] });

function ingest(disk: FakeDisk, wcl: WclApiService, currentRaids: string, over: Partial<RunOptions> = {}): Promise<void> {
  const options: RunOptions = { simcTier: TIER, apl: Results.ok(APL), onBench: () => undefined, ...over };
  const params = new URLSearchParams();
  if (currentRaids) params.set('currentRaids', currentRaids);
  if (options.simcTier) params.set('simcTier', options.simcTier);
  globalThis.history.replaceState(null, '', params.size ? `/?${params}` : '/');
  const stubTransform = {
    getBench: async (_spec: string, encId: number, _selection: unknown, received: Rulebook | null) => {
      options.onBench(received);
      return Results.ok({ encounter_id: encId, encounter_name: bossName(encId), sample_count: FRESH_SAMPLES });
    },
  };
  const simcFake = {
    getApl: async () => options.apl,
    getSpellDataDump: async () => Results.ok(DUMP),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: DATA_FILE_TRANSPORT, useValue: disk },
      { provide: WclApiService, useValue: wcl },
      { provide: WCL_TRANSPORT, useValue: cleanTransport },
      { provide: NgHttpCachingService, useValue: { clearCache: () => undefined } },
      { provide: SimcDataService, useValue: simcFake },
      { provide: TalentDataService, useValue: { getTalentIndex: async () => Results.ok(new Map()) } },
      { provide: EncounterRulebookService, useValue: { derive: async () => ({ rulebook: DERIVED, gaps: [] }) } },
      ...TRANSFORMS.map(transform => ({ provide: transform, useValue: stubTransform })),
    ],
  });
  return TestBed.inject(IngestOrchestratorService).run();
}

const published = (): PublishedRunSummary | undefined => (globalThis as { __INGEST_DONE__?: PublishedRunSummary }).__INGEST_DONE__;

describe('IngestOrchestratorService.run', () => {
  const SPEC_ON_DISK = { [`${SPEC}/encounters.json`]: [] };
  const RETIRED_ON_DISK = {
    ...SPEC_ON_DISK,
    [benchPath(RETIRED_BOSS.id)]: {
      encounter_id: RETIRED_BOSS.id, encounter_name: RETIRED_BOSS.name,
      sample_count: STORED_SAMPLES, ingest_version: INGEST_VERSION,
    },
    [benchPath(RETIRED_BOSS.id, 'positions')]: { encounter_id: RETIRED_BOSS.id, ingest_version: INGEST_VERSION },
  };
  const filesFor = (disk: FakeDisk, encId: number): string[] =>
    [...disk.files.keys()].filter(path => path.endsWith(`/${encId}.json`));
  const storedBench = (signature: string) => ({
    encounter_id: CURRENT_BOSS.id, encounter_name: CURRENT_BOSS.name, sample_count: STORED_SAMPLES,
    source_signature: signature, ingest_version: INGEST_VERSION,
  });

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
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

  it('leaves a benched encounter untouched when its stored signature covers the current top parses and sources', async () => {
    const stored = storedBench(await signatureOf(RANKED));
    const disk = fakeDisk({ ...SPEC_ON_DISK, [benchPath(CURRENT_BOSS.id)]: stored });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toEqual(stored);
  });

  it('re-benches that encounter once one of the top parses changes', async () => {
    const disk = fakeDisk({ ...SPEC_ON_DISK, [benchPath(CURRENT_BOSS.id)]: storedBench(await signatureOf(RANKED)) });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RERANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({
      sample_count: FRESH_SAMPLES, source_signature: await signatureOf(RERANKED),
    });
  });

  it('re-benches that encounter once the SimulationCraft gates it was built from change', async () => {
    const disk = fakeDisk({ ...SPEC_ON_DISK, [benchPath(CURRENT_BOSS.id)]: storedBench(await signatureOf(RANKED, OLDER_APL)) });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({
      sample_count: FRESH_SAMPLES, source_signature: await signatureOf(RANKED),
    });
  });

  it('leaves that encounter alone when the action list changed outside what the rules read', async () => {
    const stored = storedBench(await signatureOf(RANKED));
    const disk = fakeDisk({ ...SPEC_ON_DISK, [benchPath(CURRENT_BOSS.id)]: stored });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { apl: Results.ok(`# a reworded comment\n${APL}`) });

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toEqual(stored);
  });

  it('removes a file at the spec root that no step writes and keeps the index and state files', async () => {
    const disk = fakeDisk({ ...SPEC_ON_DISK, [`${SPEC}/stale.json`]: {} });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.has(`${SPEC}/stale.json`)).toBe(false);
    expect(disk.files.has(`${SPEC}/encounters.json`)).toBe(true);
    expect(disk.files.has(`${SPEC}/ingest-state.json`)).toBe(true);
  });

  it('hands every bench the rulebook derived for the encounter', async () => {
    const received: (Rulebook | null)[] = [];

    await ingest(fakeDisk(SPEC_ON_DISK), fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { onBench: entry => received.push(entry) });

    expect(received).toHaveLength(TRANSFORMS.length);
    expect(received.every(entry => entry === DERIVED)).toBe(true);
  });

  it('benches a spec SimulationCraft writes no action list for with no rulebook, stamped on the version alone', async () => {
    const received: (Rulebook | null)[] = [];
    const disk = fakeDisk(SPEC_ON_DISK);

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID,
      { apl: Results.missing('no action list'), onBench: entry => received.push(entry) });

    expect(received.every(entry => entry === null)).toBe(true);
    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({ source_signature: await signatureOf(RANKED, null) });
  });

  it('reports what the builder cannot read over every action list SimulationCraft writes, before any parse is sampled', async () => {
    await ingest(fakeDisk(SPEC_ON_DISK), fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { apl: Results.ok(APL_WITH_GAP) });

    expect(published()?.gaps).toEqual([
      { kind: 'action', token: 'backstab', specs: [SPEC] },
      { kind: 'expression', token: UNKNOWN_SHAPE, specs: [SPEC] },
    ]);
    expect(published()?.gapWarnings[1]).toBe(`Expression "${UNKNOWN_SHAPE}" is outside what the rulebook builder reads (${SPEC})`);
    expect(published()?.gapReport).toContain(`| Expression | \`${UNKNOWN_SHAPE}\` | ${SPEC} |`);
  });

  it('renders no gap report for a tier the builder reads whole', async () => {
    await ingest(fakeDisk(SPEC_ON_DISK), fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { apl: Results.ok('actions=variable,name=n,value=1') });

    expect(published()?.gaps).toEqual([]);
    expect(published()?.gapReport).toBeNull();
  });

  it('stops before any WCL work when SIMC_TIER is unset', async () => {
    const disk = fakeDisk(SPEC_ON_DISK);
    const refuse = (method: string) => () => { throw new Error(`the run called WCL ${method} without a tier`); };
    const untouched = {
      getPointsBudget: refuse('getPointsBudget'), getPlayableClasses: refuse('getPlayableClasses'), getZoneTree: refuse('getZoneTree'),
      getRankings: refuse('getRankings'), query: refuse('query'),
    } as unknown as WclApiService;

    await ingest(disk, untouched, RAID, { simcTier: null });

    expect(published()?.fatal).toMatch(/SIMC_TIER/);
    expect(disk.files.has(benchPath(CURRENT_BOSS.id))).toBe(false);
  });

  it('lists an encounter with no Mythic parses yet in the index, at zero samples', async () => {
    const disk = fakeDisk(SPEC_ON_DISK);

    await ingest(disk, fakeWcl([CURRENT_BOSS, NEW_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(`${SPEC}/encounters.json`)).toEqual([
      { id: CURRENT_BOSS.id, name: CURRENT_BOSS.name, sample_count: FRESH_SAMPLES },
      { id: NEW_BOSS.id, name: NEW_BOSS.name, sample_count: 0 },
    ]);
  });
});
