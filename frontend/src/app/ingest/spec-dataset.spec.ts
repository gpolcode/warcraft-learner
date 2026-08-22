import { describe, it, expect } from 'vitest';
import { DataFileApiService } from '../core/services/data-file-api';
import { type Result, ok, missing, transient } from '../core/result';
import type { EncounterEntry, SpecEntry } from '../core/models/encounter.models';
import { INGEST_VERSION } from './ingest-version';
import { encounterSkipKey, type SignatureRanking } from './signature';
import type { IngestEncounter } from './models/wcl.models';
import {
  BENCH_SLICE, benchSkipDecision, encounterIndexEntries, pruneRetiredEncounters,
  readSpecDataset, readSpecFreshness, rebuildIndices, recordSpecPass, type SpecPass,
} from './spec-dataset';

const SPEC = 'SubtletyRogue';
const OTHER_SPEC = 'FireMage';
const NEKZALI = 3470;
const SENTINELS = 3445;
const PHASED_OUT_BOSS = 3181;
const SAMPLE_COUNT = 25;
const NOW_S = 1787332065;
const HOUR_S = 3600;
const OLDER_VERSION = INGEST_VERSION - 1;
const STAMP = { version: INGEST_VERSION, ingestedAtS: NOW_S };
const SLICE_FILES = [BENCH_SLICE, 'rotation', 'positions'];
const NO_ENCOUNTERS: IngestEncounter[] = [];
const UNREADABLE = 'The file server did not answer.';

// Mirrors the paths DataFileApiService addresses, so a path changed there has to change here too.
class MemoryFiles {
  readonly files = new Map<string, unknown>();
  readonly unreadable = new Set<string>();
  readonly writes: [string, unknown][] = [];

  constructor(seed: Record<string, unknown> = {}) {
    for (const [path, data] of Object.entries(seed)) this.files.set(path, data);
  }

  get api(): DataFileApiService {
    return this as unknown as DataFileApiService;
  }

  written(path: string): unknown {
    return this.writes.filter(([written]) => written === path).at(-1)?.[1];
  }

  getSlice<T>(spec: string, encounterId: number, slice: string): Promise<Result<T>> {
    return this.read<T>(`${spec}/${slice}/${encounterId}.json`);
  }

  getIngestState(spec: string): Promise<Result<unknown>> {
    return this.read<unknown>(`${spec}/ingest-state.json`);
  }

  async getEncounters(spec: string): Promise<Result<EncounterEntry[]>> {
    const result = await this.read<EncounterEntry[]>(`${spec}/encounters.json`);
    return !result.ok && result.error.kind === 'missing' ? ok([]) : result;
  }

  async writeIngestState(spec: string, data: unknown): Promise<void> {
    this.write(`${spec}/ingest-state.json`, data);
  }

  async writeEncounters(spec: string, entries: EncounterEntry[]): Promise<void> {
    this.write(`${spec}/encounters.json`, entries);
  }

  async writeSpecs(entries: SpecEntry[]): Promise<void> {
    this.write('index.json', entries);
  }

  async listSpecs(): Promise<string[]> {
    return this.namesUnder('').filter(name => !name.includes('.'));
  }

  async listSliceFiles(spec: string, slice: string): Promise<string[]> {
    return this.namesUnder(`${spec}/${slice}`);
  }

  async removeSlice(spec: string, encounterId: number, slice: string): Promise<void> {
    this.files.delete(`${spec}/${slice}/${encounterId}.json`);
  }

  private read<T>(path: string): Promise<Result<T>> {
    if (this.unreadable.has(path)) return Promise.resolve(transient(UNREADABLE));
    return Promise.resolve(this.files.has(path) ? ok(this.files.get(path) as T) : missing('Not yet ingested.'));
  }

  private write(path: string, data: unknown): void {
    this.files.set(path, data);
    this.writes.push([path, data]);
  }

  private namesUnder(dir: string): string[] {
    const prefix = dir ? `${dir}/` : '';
    const names = new Set<string>();
    for (const path of this.files.keys()) {
      if (!path.startsWith(prefix)) continue;
      const [name] = path.slice(prefix.length).split('/');
      if (name) names.add(name);
    }
    return [...names];
  }
}

const benchPath = (spec: string, encounterId: number): string => `${spec}/${BENCH_SLICE}/${encounterId}.json`;
const statePath = (spec: string): string => `${spec}/ingest-state.json`;
const indexPath = (spec: string): string => `${spec}/encounters.json`;

const bench = (over: Record<string, unknown> = {}): Record<string, unknown> =>
  ({ ingest_version: INGEST_VERSION, ingested_at_s: NOW_S, sample_count: SAMPLE_COUNT, ...over });

const marker = (over: Record<string, unknown> = {}): Record<string, unknown> =>
  ({ ingest_version: INGEST_VERSION, ingested_at_s: NOW_S, empty_encounter_ids: [], ...over });

const encounter = (id: number, name: string): IngestEncounter =>
  ({ id, name, zone: 'The Venomous Abyss', zoneId: 53, partitionIds: [] });

const NEKZALI_ENCOUNTER = encounter(NEKZALI, "Nek'zali");
const SENTINELS_ENCOUNTER = encounter(SENTINELS, 'Entombed Sentinels');

describe('readSpecDataset', () => {
  it('lists the benched encounters in numeric order', async () => {
    // "10.json" sorts before "9.json" lexicographically; these ids pin the numeric order.
    const LOW_ID = 9;
    const HIGH_ID = 10;
    const files = new MemoryFiles({
      [benchPath(SPEC, HIGH_ID)]: bench(),
      [benchPath(SPEC, LOW_ID)]: bench(),
    });

    expect((await readSpecDataset(files.api, SPEC)).benchedIds).toEqual([LOW_ID, HIGH_ID]);
  });

  it('reads an encounter id from a bench filename, skipping a crashed temp write, a non-numeric name and a non-json file', async () => {
    const files = new MemoryFiles({
      [benchPath(SPEC, NEKZALI)]: bench(),
      [`${SPEC}/${BENCH_SLICE}/${SENTINELS}.json.7.0.tmp`]: bench(),
      [`${SPEC}/${BENCH_SLICE}/rulebook.json`]: bench(),
      [`${SPEC}/${BENCH_SLICE}/.gitkeep`]: '',
    });

    expect((await readSpecDataset(files.api, SPEC)).benchedIds).toEqual([NEKZALI]);
  });

  it('counts a benched encounter and one marked empty as both checked', async () => {
    const files = new MemoryFiles({
      [benchPath(SPEC, NEKZALI)]: bench(),
      [statePath(SPEC)]: marker({ empty_encounter_ids: [SENTINELS] }),
    });

    const dataset = await readSpecDataset(files.api, SPEC);

    expect([...dataset.checkedIds].sort((a, b) => a - b)).toEqual([SENTINELS, NEKZALI]);
    expect(dataset.state?.empty_encounter_ids).toEqual([SENTINELS]);
  });

  it('reads no marker for a spec that has none, leaving the benched encounters as the checked ones', async () => {
    const files = new MemoryFiles({ [benchPath(SPEC, NEKZALI)]: bench() });

    const dataset = await readSpecDataset(files.api, SPEC);

    expect(dataset.state).toBeNull();
    expect([...dataset.checkedIds]).toEqual([NEKZALI]);
  });
});

describe('readSpecFreshness', () => {
  it('reports a spec with nothing on disk as never checked', async () => {
    expect(await readSpecFreshness(new MemoryFiles().api, SPEC)).toEqual({
      checkedCount: 0,
      emptyCount: 0,
      onCurrentVersion: false,
      version: null,
      ingestedAtS: null,
    });
  });

  it('reports the lowest version and the most recent write across the spec files', async () => {
    const files = new MemoryFiles({
      [benchPath(SPEC, NEKZALI)]: bench({ ingest_version: OLDER_VERSION, ingested_at_s: NOW_S - HOUR_S }),
      [benchPath(SPEC, SENTINELS)]: bench({ ingested_at_s: NOW_S }),
    });

    const freshness = await readSpecFreshness(files.api, SPEC);

    expect(freshness.version).toBe(OLDER_VERSION);
    expect(freshness.ingestedAtS).toBe(NOW_S);
    expect(freshness.onCurrentVersion).toBe(false);
  });

  it('is on the current version once every bench carries it', async () => {
    const files = new MemoryFiles({
      [benchPath(SPEC, NEKZALI)]: bench({ ingested_at_s: NOW_S - HOUR_S }),
      [benchPath(SPEC, SENTINELS)]: bench(),
    });

    const freshness = await readSpecFreshness(files.api, SPEC);

    expect(freshness.onCurrentVersion).toBe(true);
    expect(freshness.version).toBe(INGEST_VERSION);
  });

  it('is not on the current version when a bench carries no version at all', async () => {
    const files = new MemoryFiles({ [benchPath(SPEC, NEKZALI)]: { sample_count: SAMPLE_COUNT } });

    const freshness = await readSpecFreshness(files.api, SPEC);

    expect(freshness.onCurrentVersion).toBe(false);
    expect(freshness.version).toBeNull();
  });

  it('counts a spec whose every encounter is empty as checked, off the marker alone', async () => {
    const files = new MemoryFiles({
      [statePath(SPEC)]: marker({ empty_encounter_ids: [NEKZALI, SENTINELS] }),
    });

    expect(await readSpecFreshness(files.api, SPEC)).toEqual({
      checkedCount: 2,
      emptyCount: 2,
      onCurrentVersion: true,
      version: INGEST_VERSION,
      ingestedAtS: NOW_S,
    });
  });
});

describe('benchSkipDecision', () => {
  const VERSION = String(INGEST_VERSION);
  const TOP_N = 10;
  const ranking = (index: number): SignatureRanking => ({ report_code: `report${index}`, fight_id: index });
  const ROWS = [1, 2, 3].map(ranking);
  const SIGNATURE = encounterSkipKey(ROWS, new Set(), VERSION, TOP_N);
  const decisionFor = (files: MemoryFiles) =>
    benchSkipDecision(files.api, SPEC, NEKZALI, { rows: ROWS, version: VERSION, topN: TOP_N });

  it('decides off the stamp on the bench file of that encounter', async () => {
    const files = new MemoryFiles({ [benchPath(SPEC, NEKZALI)]: bench({ source_signature: SIGNATURE }) });

    expect(await decisionFor(files)).toEqual({ skip: true, signature: SIGNATURE });
  });

  it('decides off no stamp when the encounter has no bench yet', async () => {
    expect(await decisionFor(new MemoryFiles())).toEqual({ skip: false, signature: SIGNATURE });
  });
});

describe('recordSpecPass', () => {
  const pass = (over: Partial<SpecPass> = {}): SpecPass =>
    ({ previous: null, emptyIds: [], encounters: NO_ENCOUNTERS, stamp: STAMP, ...over });

  it('marks the encounters this pass found parseless', async () => {
    const files = new MemoryFiles();

    await recordSpecPass(files.api, SPEC, pass({ emptyIds: [SENTINELS] }));

    expect(files.written(statePath(SPEC))).toEqual({
      ingest_version: INGEST_VERSION,
      ingested_at_s: NOW_S,
      empty_encounter_ids: [SENTINELS],
    });
  });

  it('clears a marked encounter that this pass benched', async () => {
    const files = new MemoryFiles({ [benchPath(SPEC, SENTINELS)]: bench() });
    const previous = { ingest_version: OLDER_VERSION, ingested_at_s: NOW_S - HOUR_S, empty_encounter_ids: [SENTINELS] };

    await recordSpecPass(files.api, SPEC, pass({ previous }));

    expect(files.written(statePath(SPEC))).toMatchObject({ empty_encounter_ids: [] });
  });

  it('rebuilds the spec index from the benched files and lists the spec in the manifest', async () => {
    const files = new MemoryFiles({
      [benchPath(SPEC, NEKZALI)]: bench({ encounter_id: NEKZALI, encounter_name: "Nek'zali" }),
    });

    await recordSpecPass(files.api, SPEC, pass({ encounters: [NEKZALI_ENCOUNTER, SENTINELS_ENCOUNTER] }));

    expect(files.written(indexPath(SPEC))).toEqual([
      { id: NEKZALI, name: "Nek'zali", sample_count: SAMPLE_COUNT },
      { id: SENTINELS, name: 'Entombed Sentinels', sample_count: 0 },
    ]);
    expect(files.written('index.json')).toEqual([{ spec: SPEC, encounter_count: 2 }]);
  });

  it('leaves an unreadable bench at zero samples rather than dropping the encounter', async () => {
    const files = new MemoryFiles({ [benchPath(SPEC, NEKZALI)]: bench() });
    files.unreadable.add(benchPath(SPEC, NEKZALI));

    await recordSpecPass(files.api, SPEC, pass({ encounters: [NEKZALI_ENCOUNTER] }));

    expect(files.written(indexPath(SPEC))).toEqual([{ id: NEKZALI, name: "Nek'zali", sample_count: 0 }]);
  });

  it('leaves a spec with no encounter out of the manifest', async () => {
    const files = new MemoryFiles({ [statePath(SPEC)]: marker() });

    await recordSpecPass(files.api, SPEC, pass());

    expect(files.written(indexPath(SPEC))).toEqual([]);
    expect(files.written('index.json')).toEqual([]);
  });
});

describe('rebuildIndices', () => {
  it('rebuilds the index of every spec on disk, not just the one being ingested', async () => {
    const files = new MemoryFiles({
      [benchPath(SPEC, NEKZALI)]: bench({ encounter_id: NEKZALI, encounter_name: "Nek'zali" }),
      [benchPath(OTHER_SPEC, NEKZALI)]: bench({ encounter_id: NEKZALI, encounter_name: "Nek'zali", sample_count: 0 }),
    });

    await rebuildIndices(files.api, [NEKZALI_ENCOUNTER]);

    expect(files.written(indexPath(SPEC))).toEqual([{ id: NEKZALI, name: "Nek'zali", sample_count: SAMPLE_COUNT }]);
    expect(files.written(indexPath(OTHER_SPEC))).toEqual([{ id: NEKZALI, name: "Nek'zali", sample_count: 0 }]);
    expect(files.written('index.json')).toEqual([
      { spec: OTHER_SPEC, encounter_count: 1 },
      { spec: SPEC, encounter_count: 1 },
    ]);
  });
});

describe('pruneRetiredEncounters', () => {
  const retired = (spec: string): Record<string, unknown> => ({
    [`${spec}/${BENCH_SLICE}/${PHASED_OUT_BOSS}.json`]: bench(),
    [`${spec}/rotation/${PHASED_OUT_BOSS}.json`]: bench(),
    [`${spec}/positions/${PHASED_OUT_BOSS}.json`]: bench(),
    [benchPath(spec, NEKZALI)]: bench(),
  });

  it('removes every slice file of an encounter the current raids no longer carry', async () => {
    const files = new MemoryFiles(retired(SPEC));

    const pruned = await pruneRetiredEncounters(files.api, SLICE_FILES, new Set([NEKZALI]));

    expect(pruned).toEqual([{ spec: SPEC, encounterIds: [PHASED_OUT_BOSS] }]);
    expect([...files.files.keys()]).toEqual([benchPath(SPEC, NEKZALI)]);
  });

  it('prunes nothing when no raid is named, so an unset variable cannot empty the dataset', async () => {
    const files = new MemoryFiles(retired(SPEC));

    expect(await pruneRetiredEncounters(files.api, SLICE_FILES, new Set())).toEqual([]);
    expect(files.files.size).toBe(Object.keys(retired(SPEC)).length);
    expect(files.writes).toEqual([]);
  });

  it('prunes every spec on disk, not just the ones this run ingests', async () => {
    const files = new MemoryFiles({ ...retired(SPEC), ...retired(OTHER_SPEC) });

    const pruned = await pruneRetiredEncounters(files.api, SLICE_FILES, new Set([NEKZALI]));

    expect(pruned.map(entry => entry.spec).sort()).toEqual([OTHER_SPEC, SPEC]);
  });

  it('drops a marked empty encounter outside the current raids', async () => {
    const files = new MemoryFiles({
      [statePath(SPEC)]: marker({ empty_encounter_ids: [PHASED_OUT_BOSS, NEKZALI] }),
    });

    await pruneRetiredEncounters(files.api, SLICE_FILES, new Set([NEKZALI]));

    expect(files.written(statePath(SPEC))).toMatchObject({ empty_encounter_ids: [NEKZALI] });
  });

  it('rewrites no marker when every marked encounter is still current', async () => {
    const files = new MemoryFiles({ [statePath(SPEC)]: marker({ empty_encounter_ids: [NEKZALI] }) });

    await pruneRetiredEncounters(files.api, SLICE_FILES, new Set([NEKZALI]));

    expect(files.writes).toEqual([]);
  });
});

describe('encounterIndexEntries', () => {
  const ON_DISK: EncounterEntry[] = [{ id: SENTINELS, name: 'Entombed Sentinels', sample_count: SAMPLE_COUNT }];

  it('lists every current encounter in zone order, at zero samples when nothing is on disk yet', () => {
    expect(encounterIndexEntries([NEKZALI_ENCOUNTER, SENTINELS_ENCOUNTER], [])).toEqual([
      { id: NEKZALI, name: "Nek'zali", sample_count: 0 },
      { id: SENTINELS, name: 'Entombed Sentinels', sample_count: 0 },
    ]);
  });

  it('carries the on-disk sample count for a benched encounter and 0 for the rest', () => {
    expect(encounterIndexEntries([NEKZALI_ENCOUNTER, SENTINELS_ENCOUNTER], ON_DISK)).toEqual([
      { id: NEKZALI, name: "Nek'zali", sample_count: 0 },
      { id: SENTINELS, name: 'Entombed Sentinels', sample_count: SAMPLE_COUNT },
    ]);
  });

  it('drops on-disk entries outside the current zone (the phased-out tier)', () => {
    const stale: EncounterEntry[] = [{ id: PHASED_OUT_BOSS, name: 'Old Boss', sample_count: SAMPLE_COUNT }];
    expect(encounterIndexEntries([NEKZALI_ENCOUNTER], stale)).toEqual([
      { id: NEKZALI, name: "Nek'zali", sample_count: 0 },
    ]);
  });

  it('keeps the on-disk entries untouched when no live zone was resolved', () => {
    expect(encounterIndexEntries(NO_ENCOUNTERS, ON_DISK)).toEqual(ON_DISK);
  });
});
