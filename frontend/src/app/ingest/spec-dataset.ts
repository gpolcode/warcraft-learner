// Every read and write of the ingested dataset on disk, so no caller carries a copy of its file layout.
import { DataFileApiService } from '../core/services/data-file-api';
import { logWarn } from '../core/log';
import type { EncounterEntry, SpecEntry } from '../core/models/encounter.models';
import { INGEST_VERSION } from './ingest-version';
import { nextIngestState, prunedIngestState, readIngestState, type SpecIngestState } from './ingest-state';
import {
  readStamp, skipDecision, type EncounterParses, type IngestStamp, type SkipDecision, type StampedFile,
} from './stamp';
import type { IngestEncounter } from './models/wcl.models';

/** The one slice whose file carries the encounter signature and the sample count, so it alone lists what a spec has benched. */
export const BENCH_SLICE = 'burst';

interface IndexedBench {
  encounter_id?: number;
  encounter_name?: string;
  sample_count?: number;
}

interface SpecDataset {
  benchedIds: number[];
  /** Benched plus marked empty, so an encounter found parseless is not re-offered as never checked. */
  checkedIds: Set<number>;
  state: SpecIngestState | null;
}

interface SpecFreshness {
  checkedCount: number;
  emptyCount: number;
  onCurrentVersion: boolean;
  // Worst version but most recent write: "still on v23", "last ingested 3h ago".
  version: number | null;
  ingestedAtS: number | null;
}

export interface SpecPass {
  previous: SpecIngestState | null;
  emptyIds: readonly number[];
  encounters: readonly IngestEncounter[];
  stamp: IngestStamp;
}

interface SpecPrune {
  spec: string;
  encounterIds: number[];
}

/** The file server's crashed temp writes are named `<id>.json.<pid>.<n>.tmp`, so only an exact `.json` name is an encounter. */
function encounterIdsFromFiles(files: readonly string[]): number[] {
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => parseInt(file))
    .filter(id => Number.isFinite(id))
    .sort((a, b) => a - b);
}

function benchedEncounterIds(dataFile: DataFileApiService, spec: string): Promise<number[]> {
  return dataFile.listSliceFiles(spec, BENCH_SLICE).then(encounterIdsFromFiles);
}

async function readSpecState(dataFile: DataFileApiService, spec: string): Promise<SpecIngestState | null> {
  const stored = await dataFile.getIngestState(spec);
  return stored.ok ? readIngestState(stored.value) : null;
}

export async function readSpecDataset(dataFile: DataFileApiService, spec: string): Promise<SpecDataset> {
  const benchedIds = await benchedEncounterIds(dataFile, spec);
  const state = await readSpecState(dataFile, spec);
  return { benchedIds, checkedIds: new Set([...benchedIds, ...(state?.empty_encounter_ids ?? [])]), state };
}

export async function readSpecFreshness(dataFile: DataFileApiService, spec: string): Promise<SpecFreshness> {
  const { benchedIds, checkedIds, state } = await readSpecDataset(dataFile, spec);
  const stamps = await Promise.all(benchedIds.map(async encounterId => {
    const bench = await dataFile.getSlice<StampedFile>(spec, encounterId, BENCH_SLICE);
    return readStamp(bench.ok ? bench.value : null);
  }));
  const versions = stamps.map(stamp => stamp.version);
  const times = stamps.map(stamp => stamp.ingestedAtS);
  if (state) {
    versions.push(state.ingest_version);
    times.push(state.ingested_at_s);
  }
  const storedVersions = versions.filter((version): version is number => version !== null);
  const storedTimes = times.filter((time): time is number => time !== null);
  return {
    checkedCount: checkedIds.size,
    emptyCount: state?.empty_encounter_ids.length ?? 0,
    onCurrentVersion: versions.length > 0 && versions.every(version => version === INGEST_VERSION),
    version: storedVersions.length ? Math.min(...storedVersions) : null,
    ingestedAtS: storedTimes.length ? Math.max(...storedTimes) : null,
  };
}

export async function benchSkipDecision(
  dataFile: DataFileApiService, spec: string, encounterId: number, parses: EncounterParses,
): Promise<SkipDecision> {
  const stored = await dataFile.getSlice<StampedFile>(spec, encounterId, BENCH_SLICE);
  return skipDecision(stored.ok ? stored.value : null, parses);
}

/** Zero-sample encounters stay listed, or a new raid's bosses are not selectable until its first parses land. */
export function encounterIndexEntries(current: readonly IngestEncounter[], onDisk: EncounterEntry[]): EncounterEntry[] {
  if (!current.length) return onDisk;
  const samplesById = new Map(onDisk.map(entry => [entry.id, entry.sample_count]));
  return current.map(encounter => ({ id: encounter.id, name: encounter.name, sample_count: samplesById.get(encounter.id) ?? 0 }));
}

async function rebuildEncounterIndex(
  dataFile: DataFileApiService, spec: string, current: readonly IngestEncounter[],
): Promise<void> {
  const onDisk: EncounterEntry[] = [];
  for (const encounterId of await benchedEncounterIds(dataFile, spec)) {
    const bench = await dataFile.getSlice<IndexedBench>(spec, encounterId, BENCH_SLICE);
    if (!bench.ok) continue;
    onDisk.push({
      id: bench.value.encounter_id ?? encounterId,
      name: bench.value.encounter_name ?? String(encounterId),
      sample_count: bench.value.sample_count ?? 0,
    });
  }
  await dataFile.writeEncounters(spec, encounterIndexEntries(current, onDisk));
}

async function rebuildSpecIndex(dataFile: DataFileApiService): Promise<void> {
  const entries: SpecEntry[] = [];
  for (const spec of (await dataFile.listSpecs()).sort()) {
    const encounters = await dataFile.getEncounters(spec);
    // Zero-sample encounters count: gating on benched data would hide every spec while a new raid waits for its first Mythic parses.
    const count = encounters.ok ? encounters.value.length : 0;
    if (count > 0) entries.push({ spec, encounter_count: count });
  }
  await dataFile.writeSpecs(entries);
}

/** Every run, so samples ingested for a spec that is not selected again still surface in its index. */
export async function rebuildIndices(
  dataFile: DataFileApiService, current: readonly IngestEncounter[],
): Promise<void> {
  for (const spec of await dataFile.listSpecs()) {
    await rebuildEncounterIndex(dataFile, spec, current);
  }
  await rebuildSpecIndex(dataFile);
}

/** Re-lists the benched ids rather than tracking this pass's writes, so a mark still clears after a run that died between writing a bench and updating the marker. */
export async function recordSpecPass(dataFile: DataFileApiService, spec: string, pass: SpecPass): Promise<void> {
  const benched = new Set(await benchedEncounterIds(dataFile, spec));
  await dataFile.writeIngestState(spec, nextIngestState(pass.previous, pass.emptyIds, benched, pass.stamp));
  await rebuildEncounterIndex(dataFile, spec, pass.encounters);
  await rebuildSpecIndex(dataFile);
}

async function removeRetiredFiles(
  dataFile: DataFileApiService, spec: string,
  sliceFiles: readonly string[], protectedIds: ReadonlySet<number>,
): Promise<number[]> {
  const removed: number[] = [];
  for (const encounterId of await benchedEncounterIds(dataFile, spec)) {
    if (protectedIds.has(encounterId)) continue;
    for (const slice of sliceFiles) {
      try {
        await dataFile.removeSlice(spec, encounterId, slice);
      } catch (err) {
        logWarn(`removeRetiredFiles ${spec}/${encounterId}/${slice}`, err);
      }
    }
    removed.push(encounterId);
  }
  return removed;
}

/** Pruning only the selected specs would leave them at zero data and permanently re-selected. */
export async function pruneRetiredEncounters(
  dataFile: DataFileApiService, sliceFiles: readonly string[], protectedIds: ReadonlySet<number>,
): Promise<SpecPrune[]> {
  // An unset CURRENT_RAIDS names no raid, which must not read as "prune everything".
  if (protectedIds.size === 0) return [];
  const pruned: SpecPrune[] = [];
  for (const spec of await dataFile.listSpecs()) {
    const encounterIds = await removeRetiredFiles(dataFile, spec, sliceFiles, protectedIds);
    if (encounterIds.length) pruned.push({ spec, encounterIds });
    const marker = prunedIngestState(await readSpecState(dataFile, spec), protectedIds);
    if (marker) await dataFile.writeIngestState(spec, marker);
  }
  return pruned;
}
