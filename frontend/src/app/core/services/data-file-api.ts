import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { logWarn } from '../log';

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
}
