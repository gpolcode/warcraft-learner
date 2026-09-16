import { Injectable, inject } from '@angular/core';
import type { EncounterEntry, SpecEntry } from '../encounter/encounter.models';
import { SpecMeta } from './spec-meta.models';
import { DATA_FILE_TRANSPORT } from './data-file-transport';
import { Result, Results } from '../../../shared/util-http/result';

const ENCOUNTERS_FILE = 'encounters.json';
const INGEST_STATE_FILE = 'ingest-state.json';
/** The files written at a spec root; the bench directories beside them belong to the registry. */
const SPEC_FILES = new Set([ENCOUNTERS_FILE, INGEST_STATE_FILE]);

// A manifest with no file yet is the legitimate empty fresh-tier state; a real read failure must propagate so the UI surfaces it instead of a silently empty list.
function foldMissingToEmpty<T>(result: Result<T[]>): Result<T[]> {
  if (result.ok) return result;
  return result.error.kind === 'missing' ? Results.ok([]) : result;
}

@Injectable({ providedIn: 'root' })
export class DataFileApiService {
  private readonly io = inject(DATA_FILE_TRANSPORT);

  getBench<T>(spec: string, encounterId: number, bench: string): Promise<Result<T>> {
    return this.io.readJson<T>(`${spec}/${bench}/${encounterId}.json`);
  }

  async getSpecs(): Promise<Result<SpecEntry[]>> {
    return foldMissingToEmpty(await this.io.readJson<SpecEntry[]>('index.json'));
  }

  async getSpecMeta(): Promise<Result<SpecMeta[]>> {
    return foldMissingToEmpty(await this.io.readJson<SpecMeta[]>('spec-meta.json'));
  }

  async getEncounters(spec: string): Promise<Result<EncounterEntry[]>> {
    return foldMissingToEmpty(await this.io.readJson<EncounterEntry[]>(`${spec}/${ENCOUNTERS_FILE}`));
  }

  // Typed `unknown` both ways: the shape belongs to the ingest layer, which core may not import.
  getIngestState(spec: string): Promise<Result<unknown>> {
    return this.io.readJson<unknown>(`${spec}/${INGEST_STATE_FILE}`);
  }

  writeIngestState(spec: string, data: unknown): Promise<void> {
    return this.io.writeJson(`${spec}/${INGEST_STATE_FILE}`, data);
  }

  writeBench(spec: string, encounterId: number, bench: string, data: unknown): Promise<void> {
    return this.io.writeJson(`${spec}/${bench}/${encounterId}.json`, data);
  }

  writeEncounters(spec: string, entries: EncounterEntry[]): Promise<void> {
    return this.io.writeJson(`${spec}/${ENCOUNTERS_FILE}`, entries);
  }

  writeSpecs(entries: SpecEntry[]): Promise<void> {
    return this.io.writeJson('index.json', entries);
  }

  writeSpecMeta(metas: SpecMeta[]): Promise<void> {
    return this.io.writeJson('spec-meta.json', metas);
  }

  // A spec folder name never contains a dot; otherwise the index rebuild reads `index.json/encounters.json` and hits ENOTDIR.
  async listSpecs(): Promise<string[]> {
    return (await this.io.list('')).filter(name => !name.includes('.'));
  }

  listBenchFiles(spec: string, bench: string): Promise<string[]> {
    return this.io.list(`${spec}/${bench}`);
  }

  // A name with a dot is a file; the rest are bench directories.
  async listStraySpecFiles(spec: string): Promise<string[]> {
    return (await this.io.list(spec)).filter(name => name.includes('.') && !SPEC_FILES.has(name));
  }

  removeSpecFile(spec: string, file: string): Promise<void> {
    return this.io.remove(`${spec}/${file}`);
  }

  removeBench(spec: string, encounterId: number, bench: string): Promise<void> {
    return this.io.remove(`${spec}/${bench}/${encounterId}.json`);
  }
}
