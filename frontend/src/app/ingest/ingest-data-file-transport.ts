import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataFileTransport } from '../core/services/data-file-transport';
import { Result, LoadError, ok, permanent } from '../core/result';
import { logWarn } from '../core/log';
import { toLoadError } from '../core/http-load-error';
import { INGEST_VERSION } from './ingest-version';
import { isFutureVersion } from './signature';

/**
 * Base URL of the ingest file server (scripts/ingest-server.js), the one process with
 * filesystem access during an ingest run. Its endpoints are dumb file ops; all ingestion
 * semantics stay on this side.
 */
export const INGEST_SERVER_URL = 'http://localhost:3000';

// DataFileApiService paths are relative to data/specs/; the file server is rooted one
// level up at data/ so a single containment guard covers the whole data folder.
const SPECS_PREFIX = 'specs/';

/**
 * Read + write `DataFileTransport` for the ingest environment: every file op goes through
 * the local file server instead of the static asset pipeline. Reads too - the server
 * returns an exact 404 for an absent file (the `missing` signal), where the dev server
 * would be ambiguous about paths it does not know.
 */
@Injectable({ providedIn: 'root' })
export class IngestHttpDataFileTransport implements DataFileTransport {
  private readonly http = inject(HttpClient);

  async readJson<T>(relPath: string): Promise<Result<T, LoadError>> {
    let parsed: unknown;
    try {
      parsed = await firstValueFrom(this.http.get<unknown>(`${INGEST_SERVER_URL}/api/load`, {
        params: { filePath: `${SPECS_PREFIX}${relPath}` },
      }));
    } catch (cause) {
      const result = toLoadError(cause, `data-file.${relPath}`);
      // `missing` is not an error (an un-ingested file is the orchestrator's normal case,
      // hit for every rulebook probe and first-run stamp read), so only real failures log.
      if (!result.ok && result.error.kind !== 'missing') {
        logWarn(`IngestHttpDataFileTransport.readJson ${relPath}`, cause);
      }
      return result;
    }
    // A newer-versioned file has a shape this build does not know; fail it (driving a
    // re-ingest) rather than cast the drifted JSON to T.
    if (isFutureVersion(parsed, INGEST_VERSION)) {
      return permanent('Data file is from a newer ingest version.', `data-file.version.${relPath}`);
    }
    return ok(parsed as T);
  }

  async writeJson(relPath: string, data: unknown): Promise<void> {
    await firstValueFrom(this.http.post(`${INGEST_SERVER_URL}/api/save`, {
      filePath: `${SPECS_PREFIX}${relPath}`,
      data,
    }));
  }

  async remove(relPath: string): Promise<void> {
    await firstValueFrom(this.http.post(`${INGEST_SERVER_URL}/api/delete`, {
      filePath: `${SPECS_PREFIX}${relPath}`,
    }));
  }

  async list(relDir: string): Promise<string[]> {
    const body = await firstValueFrom(this.http.get<{ entries: string[] }>(`${INGEST_SERVER_URL}/api/list`, {
      params: { dir: `${SPECS_PREFIX}${relDir}` },
    }));
    return body.entries;
  }
}
