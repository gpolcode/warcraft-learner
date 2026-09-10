import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NgHttpCachingService } from 'ng-http-caching';
import { RulebookBuildOrchestratorService } from './rulebook-build-orchestrator-service';
import { DATA_FILE_TRANSPORT, type DataFileTransport } from '../data/data-files/data-file-transport';
import { WclApiService } from '../data/wcl/wcl-api-service';
import { SimcDataService } from '../data/http/simc-data-service';
import { TalentDataService } from '../data/http/talent-data-service';
import { ParseSampleService } from '../data/rulebook-build/parse-sample-service';
import { type Result, Results } from '../../shared/util-http/result';
import type { Rulebook } from '../data/rulebook/rulebook.models';
import { RULEBOOK_BUILDER_VERSION } from '../data/rulebook-build/rulebook-build-service';
import { SHADOW_BLADES } from '../../../../testing/spell-ids';

const SPEC = 'SubtletyRogue';
const UNKNOWN_SPEC = 'ArcaneRogue';
const RAID = 'The Venomous Abyss';
const ZONE_ID = 44;
const PARTITION = 2;
const HOURLY_POINT_LIMIT = 18_000;
const SPEC_ICON = 'ability_stealth';

const PROFILE = 'actions=shadow_blades';
const DUMP = [
  `Name             : Shadow Blades (id=${SHADOW_BLADES}) [Spell Family (8)] `,
  'Class            : Subtlety Rogue',
  'Cooldown         : 90 seconds',
  'Effects          :',
].join('\n');

interface FakeDisk extends DataFileTransport {
  readonly files: Map<string, unknown>;
}

function fakeDisk(seed: Record<string, unknown>): FakeDisk {
  const files = new Map<string, unknown>(Object.entries(seed));
  return {
    files,
    readJson: async <T>(path: string): Promise<Result<T>> => (files.has(path) ? Results.ok(files.get(path) as T) : Results.missing(`${path} is not ingested`)),
    writeJson: async (path: string, data: unknown) => { files.set(path, data); },
    remove: async () => undefined,
    list: async () => [],
  };
}

function fakeWcl(): WclApiService {
  const zone = { id: ZONE_ID, name: RAID, frozen: false, partitions: [{ id: PARTITION }], encounters: [{ id: 3129, name: 'Boss' }] };
  return {
    getPointsBudget: async () => ({ limitPerHour: HOURLY_POINT_LIMIT, pointsSpentThisHour: 0 }),
    getPlayableClasses: async () => [{ name: 'Rogue', slug: 'Rogue', specs: [{ name: 'Subtlety', slug: 'Subtlety' }] }],
    getZoneTree: async () => [{ zones: [zone] }],
  } as unknown as WclApiService;
}

function fakeSimc(profile: Result<{ text: string; sha256: string }>): Partial<SimcDataService> {
  return {
    parseTier: raw => (raw === 'midnight/MID2' ? { branch: 'midnight', dir: 'MID2' } : null),
    getProfile: async () => profile,
    getSpellDataDump: async () => Results.ok({ text: DUMP, sha256: 'd' }),
  };
}

async function run(disk: FakeDisk, specs: string, profile: Result<{ text: string; sha256: string }> = Results.ok({ text: PROFILE, sha256: 'p' })) {
  globalThis.history.replaceState(null, '', `/?mode=rulebooks&specs=${specs}&simcTier=midnight/MID2&currentRaids=${encodeURIComponent(RAID)}`);
  TestBed.configureTestingModule({
    providers: [
      { provide: DATA_FILE_TRANSPORT, useValue: disk },
      { provide: WclApiService, useValue: fakeWcl() },
      { provide: SimcDataService, useValue: fakeSimc(profile) },
      { provide: TalentDataService, useValue: { getTalents: async () => Results.ok({}) } },
      { provide: ParseSampleService, useValue: { sample: async () => [] } },
      { provide: NgHttpCachingService, useValue: { clearCache: () => undefined } },
    ],
  });
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  await TestBed.inject(RulebookBuildOrchestratorService).run();
  return (globalThis as { __INGEST_DONE__?: { succeeded: string[]; failed: { spec: string; message: string }[]; fatal?: string } }).__INGEST_DONE__;
}

describe('RulebookBuildOrchestratorService.run', () => {
  it('writes the spec\'s rulebook from its profile, carrying the published icon forward', async () => {
    const disk = fakeDisk({ [`${SPEC}/rulebook.json`]: { spec_icon: SPEC_ICON } });
    const summary = await run(disk, SPEC);
    const written = disk.files.get(`${SPEC}/rulebook.json`) as Rulebook;
    expect(summary?.succeeded).toEqual([SPEC]);
    expect(written.spec_icon).toBe(SPEC_ICON);
    expect(written.major_cooldowns.map(cooldown => cooldown.spell_id)).toEqual([SHADOW_BLADES]);
    expect(written.source?.builder_version).toBe(RULEBOOK_BUILDER_VERSION);
  });

  it('fails the spec that has no profile and the one WCL does not know, leaving the disk alone', async () => {
    const disk = fakeDisk({});
    const summary = await run(disk, `${SPEC},${UNKNOWN_SPEC}`, Results.missing('no such file'));
    expect(summary?.succeeded).toEqual([]);
    expect(summary?.failed.map(entry => entry.spec)).toEqual([SPEC, UNKNOWN_SPEC]);
    expect(summary?.failed[0]?.message).toMatch(/no profile/);
    expect(disk.files.size).toBe(0);
  });

  it('reports a malformed tier as fatal', async () => {
    globalThis.history.replaceState(null, '', `/?mode=rulebooks&specs=${SPEC}&simcTier=MID2`);
    TestBed.configureTestingModule({ providers: [
      { provide: DATA_FILE_TRANSPORT, useValue: fakeDisk({}) },
      { provide: WclApiService, useValue: fakeWcl() },
      { provide: SimcDataService, useValue: fakeSimc(Results.ok({ text: PROFILE, sha256: 'p' })) },
    ] });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await TestBed.inject(RulebookBuildOrchestratorService).run();
    const summary = (globalThis as { __INGEST_DONE__?: { fatal?: string } }).__INGEST_DONE__;
    expect(summary?.fatal).toMatch(/SIMC_TIER/);
  });
});
