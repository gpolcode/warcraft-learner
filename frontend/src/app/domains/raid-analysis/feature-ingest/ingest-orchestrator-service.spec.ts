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
import { SimcDataService, type SimcText } from '../data/http/simc-data-service';
import { TalentDataService } from '../data/http/talent-data-service';
import { EncounterRulebookService } from '../data/rulebook-build/encounter-rulebook-service';
import { RULEBOOK_BUILDER_VERSION } from '../data/rulebook-build/rulebook-build-service';
import type { PublishedRunSummary } from '../data/ingest/ingest-run-summary-service';
import type { Rulebook } from '../data/rulebook/rulebook.models';
import { rulebook } from '../../../../testing/builders/rulebook';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';

const signatures = TestBed.inject(IngestSignatureService);
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

const PROFILE: SimcText = { text: 'actions=backstab,if=buff.shadow_dance.up', sha256: 'p'.repeat(64) };
const OLDER_PROFILE: SimcText = { text: 'actions=backstab', sha256: 'o'.repeat(64) };
const DUMP: SimcText = { text: '', sha256: 'd'.repeat(64) };
const UNKNOWN_SHAPE = 'buff.*.brand_new_field';
const PROFILE_WITH_GAP: SimcText = { text: 'actions=backstab,if=buff.shadow_dance.brand_new_field', sha256: 'g'.repeat(64) };

/** The stamp keys on the sources too, so the expected signature names the profile and spell dump a bench was built from. */
const sourceKey = (profile: SimcText | null): string =>
  profile ? `${INGEST_VERSION}:${RULEBOOK_BUILDER_VERSION}:${profile.sha256}:${DUMP.sha256}` : String(INGEST_VERSION);

const rankedRow = (player: string, code: string, fightID: number) =>
  ({ name: player, server: { name: 'Ravencrest' }, report: { code, fightID } });
type RankedRow = ReturnType<typeof rankedRow>;

const TOP_PARSE = rankedRow('Kaelra', 'aBcD1234', 12);
const RUNNER_UP = rankedRow('Torvin', 'eFgH5678', 3);
const NEWCOMER = rankedRow('Miravel', 'iJkL9012', 5);
const RANKED = [TOP_PARSE, RUNNER_UP];
const RERANKED = [TOP_PARSE, NEWCOMER];

// Fewer rows than the orchestrator's top-N cap: past it, signatureOf stops matching the signature the run stamps.
const signatureOf = (rows: RankedRow[], profile: SimcText | null = PROFILE): string => signatures.encounterSkipKey(
  rows.map(row => ({ report_code: row.report.code, fight_id: row.report.fightID })),
  new Set(), sourceKey(profile), rows.length);

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
  profile: Result<SimcText>;
  /** Sees the rulebook every bench received, so a test can tell a derived one from none. */
  onBench: (received: Rulebook | null) => void;
}

const DERIVED = rulebook({ spec: SPEC, cooldowns: [{ name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 90 }] });
const NO_GAPS = { unresolvedActions: [], unresolvedAuras: [], unresolvedTalents: [], unresolvedVariables: [], unknownTokens: [] };

function ingest(disk: FakeDisk, wcl: WclApiService, currentRaids: string, over: Partial<RunOptions> = {}): Promise<void> {
  const options: RunOptions = { simcTier: TIER, profile: Results.ok(PROFILE), onBench: () => undefined, ...over };
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
    parseTier: (raw: string | null) => {
      const [branch, dir] = (raw ?? '').split('/');
      return branch && dir ? { branch, dir } : null;
    },
    getProfile: async () => options.profile,
    getSpellDataDump: async () => Results.ok(DUMP),
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: DATA_FILE_TRANSPORT, useValue: disk },
      { provide: WclApiService, useValue: wcl },
      { provide: WCL_TRANSPORT, useValue: cleanTransport },
      { provide: NgHttpCachingService, useValue: { clearCache: () => undefined } },
      { provide: SimcDataService, useValue: simcFake },
      { provide: TalentDataService, useValue: { getTalents: async () => Results.ok({}) } },
      { provide: EncounterRulebookService, useValue: { derive: async () => ({ rulebook: DERIVED, report: NO_GAPS }) } },
      ...TRANSFORMS.map(transform => ({ provide: transform, useValue: stubTransform })),
    ],
  });
  return TestBed.inject(IngestOrchestratorService).run();
}

const published = (): PublishedRunSummary | undefined => (globalThis as { __INGEST_DONE__?: PublishedRunSummary }).__INGEST_DONE__;

describe('IngestOrchestratorService.run', () => {
  const RULEBOOK_ONLY = { [`${SPEC}/rulebook.json`]: { spec_icon: 'ability_rogue_shadowdance' } };
  const RETIRED_ON_DISK = {
    ...RULEBOOK_ONLY,
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
    const stored = storedBench(signatureOf(RANKED));
    const disk = fakeDisk({ ...RULEBOOK_ONLY, [benchPath(CURRENT_BOSS.id)]: stored });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toEqual(stored);
  });

  it('re-benches that encounter once one of the top parses changes', async () => {
    const disk = fakeDisk({ ...RULEBOOK_ONLY, [benchPath(CURRENT_BOSS.id)]: storedBench(signatureOf(RANKED)) });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RERANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({
      sample_count: FRESH_SAMPLES, source_signature: signatureOf(RERANKED),
    });
  });

  it('re-benches that encounter once the SimulationCraft profile it was built from changes', async () => {
    const disk = fakeDisk({ ...RULEBOOK_ONLY, [benchPath(CURRENT_BOSS.id)]: storedBench(signatureOf(RANKED, OLDER_PROFILE)) });

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({
      sample_count: FRESH_SAMPLES, source_signature: signatureOf(RANKED),
    });
  });

  it('hands every bench the rulebook derived for the encounter', async () => {
    const received: (Rulebook | null)[] = [];

    await ingest(fakeDisk(RULEBOOK_ONLY), fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { onBench: entry => received.push(entry) });

    expect(received).toHaveLength(TRANSFORMS.length);
    expect(received.every(entry => entry === DERIVED)).toBe(true);
  });

  it('benches a spec SimulationCraft ships no profile for with no rulebook, stamped on the version alone', async () => {
    const received: (Rulebook | null)[] = [];
    const disk = fakeDisk(RULEBOOK_ONLY);

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID,
      { profile: Results.missing('no profile'), onBench: entry => received.push(entry) });

    expect(received.every(entry => entry === null)).toBe(true);
    expect(disk.files.get(benchPath(CURRENT_BOSS.id))).toMatchObject({ source_signature: signatureOf(RANKED, null) });
  });

  it('reports the tokens outside the vocabulary inventory over every profile the tier ships', async () => {
    await ingest(fakeDisk(RULEBOOK_ONLY), fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { profile: Results.ok(PROFILE_WITH_GAP) });

    expect(published()?.vocabularyGaps).toEqual([{ kind: 'expression', token: UNKNOWN_SHAPE, specs: [SPEC] }]);
    expect(published()?.gapWarnings).toEqual([`Expression "${UNKNOWN_SHAPE}" is outside the APL vocabulary inventory (${SPEC})`]);
    expect(published()?.gapReport).toContain(`| Expression | \`${UNKNOWN_SHAPE}\` | ${SPEC} |`);
  });

  it('renders no gap report for a tier the inventory covers', async () => {
    await ingest(fakeDisk(RULEBOOK_ONLY), fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(published()?.vocabularyGaps).toEqual([]);
    expect(published()?.gapReport).toBeNull();
  });

  it('stops before any WCL work when SIMC_TIER is unset', async () => {
    const disk = fakeDisk(RULEBOOK_ONLY);

    await ingest(disk, fakeWcl([CURRENT_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID, { simcTier: null });

    expect(published()?.fatal).toMatch(/SIMC_TIER/);
    expect(disk.files.has(benchPath(CURRENT_BOSS.id))).toBe(false);
  });

  it('lists an encounter with no Mythic parses yet in the index, at zero samples', async () => {
    const disk = fakeDisk(RULEBOOK_ONLY);

    await ingest(disk, fakeWcl([CURRENT_BOSS, NEW_BOSS], { [CURRENT_BOSS.id]: RANKED }), RAID);

    expect(disk.files.get(`${SPEC}/encounters.json`)).toEqual([
      { id: CURRENT_BOSS.id, name: CURRENT_BOSS.name, sample_count: FRESH_SAMPLES },
      { id: NEW_BOSS.id, name: NEW_BOSS.name, sample_count: 0 },
    ]);
  });
});
