import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { logWarn } from '../log';
import { Rulebook } from '../models/rulebook.models';
import { EncounterEntry, EncounterBench, SpecEntry } from '../models/encounter.models';
import { EncounterPositions } from '../models/positioning.models';

const DATA_BASE = new URL('data/specs/', document.baseURI).href;

/**
 * Pass-through reader for the ingested static data files. It does NO transform:
 * it fetches `data/specs/**` JSON and returns it as-is. Per-use-case slices read
 * their own tailored file via `getSlice` (the production half of a `*DataSource`).
 *
 * This is one of the two runtime data-source services (the other is
 * `WclApiService`). It is intentionally generic so every slice reuses it; the
 * slice-specific shape is the `<T>` the caller asks for.
 */
@Injectable({ providedIn: 'root' })
export class DataFileApiService {
  private readonly http = inject(HttpClient);

  /**
   * Raw read of a per-use-case tailored slice file:
   * `data/specs/{spec}/{slice}/{encounterId}.json`. Returns null when the file is
   * absent (not yet ingested) - the slice's live `*TransformService` covers that
   * case under the dev flag.
   */
  async getSlice<T>(spec: string, encounterId: number, slice: string): Promise<T | null> {
    const url = `${DATA_BASE}${spec}/${slice}/${encounterId}.json`;
    try {
      return await firstValueFrom(this.http.get<T>(url));
    } catch (err) {
      logWarn(`DataFileApiService.getSlice ${spec}/${slice}/${encounterId}`, err);
      return null;
    }
  }

  /** Raw read of a spec's rulebook (`data/specs/{spec}/rulebook.json`). */
  async getRulebook(spec: string): Promise<Rulebook | null> {
    try {
      return await firstValueFrom(this.http.get<Rulebook>(`${DATA_BASE}${spec}/rulebook.json`));
    } catch (err) {
      logWarn(`DataFileApiService.getRulebook ${spec}`, err);
      return null;
    }
  }

  /** Raw read of the spec manifest (`data/specs/index.json`). Empty when not yet generated. */
  async getSpecs(): Promise<SpecEntry[]> {
    try {
      return await firstValueFrom(this.http.get<SpecEntry[]>(`${DATA_BASE}index.json`)) ?? [];
    } catch (err) {
      logWarn('DataFileApiService.getSpecs', err);
      return [];
    }
  }

  /** Raw read of a spec's encounter index (`data/specs/{spec}/encounters.json`). */
  async getEncounters(spec: string): Promise<EncounterEntry[]> {
    try {
      return await firstValueFrom(this.http.get<EncounterEntry[]>(`${DATA_BASE}${spec}/encounters.json`)) ?? [];
    } catch (err) {
      logWarn(`DataFileApiService.getEncounters ${spec}`, err);
      return [];
    }
  }

  /** Raw read of the generic encounter bench (`data/specs/{spec}/encounters/{enc}.json`). */
  async getBench(spec: string, encounterId: number): Promise<EncounterBench | null> {
    try {
      return await firstValueFrom(this.http.get<EncounterBench>(`${DATA_BASE}${spec}/encounters/${encounterId}.json`));
    } catch (err) {
      logWarn(`DataFileApiService.getBench ${spec}/${encounterId}`, err);
      return null;
    }
  }

  /** Raw read of ingested top-parse position timelines (`data/specs/{spec}/positions/{enc}.json`). */
  async getPositions(spec: string, encounterId: number): Promise<EncounterPositions | null> {
    try {
      return await firstValueFrom(this.http.get<EncounterPositions>(`${DATA_BASE}${spec}/positions/${encounterId}.json`));
    } catch (err) {
      logWarn(`DataFileApiService.getPositions ${spec}/${encounterId}`, err);
      return null;
    }
  }
}
