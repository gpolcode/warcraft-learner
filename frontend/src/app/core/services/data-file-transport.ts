import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { logWarn } from '../log';
import { Result, LoadError, ok } from '../result';
import { toLoadError } from '../http-load-error';
import { environment } from '../../../environments/environment';

/**
 * The low-level file transport `DataFileApiService` delegates to, so the data API
 * works in both environments. The browser binds {@link HttpDataFileTransport} (HTTP
 * GET under `document.baseURI`, read-only); the Node ingestion binds a filesystem
 * implementation that also writes/lists/removes. Paths are relative to the
 * `data/specs/` root (e.g. `SubtletyRogue/burst/3176.json`, `index.json`).
 *
 * `readJson` returns a `Result`: `ok(body)` on a hit, `err(missing)` when the file is
 * absent (a 404 / ENOENT, which the cards render as the un-ingested waiting state), and
 * `err(transient)` / `err(permanent)` when the read itself failed - so a data-host
 * outage surfaces as an error instead of masquerading as "not ingested".
 */
export interface DataFileTransport {
  readJson<T>(relPath: string): Promise<Result<T, LoadError>>;
  /** Write side - Node ingestion only; the browser transport throws if called. */
  writeJson(relPath: string, data: unknown): Promise<void>;
  /** Remove a file (pruning) - Node only. */
  remove(relPath: string): Promise<void>;
  /** List the entry names under a relative directory - Node only. */
  list(relDir: string): Promise<string[]>;
}

export const DATA_FILE_TRANSPORT = new InjectionToken<DataFileTransport>('DATA_FILE_TRANSPORT');

const BROWSER_READONLY = 'DataFileApiService is read-only in the browser';

/** Browser transport: HTTP GET of the static files served under `data/specs/`. */
@Injectable({ providedIn: 'root' })
export class HttpDataFileTransport implements DataFileTransport {
  private readonly http = inject(HttpClient);
  // Deployed builds set an absolute `dataBaseHref` pointing at the single shared
  // gh-pages-root data copy; empty (development) resolves `data/specs/` relative to
  // `document.baseURI`.
  private readonly base = new URL(environment.dataBaseHref || 'data/specs/', document.baseURI).href;

  async readJson<T>(relPath: string): Promise<Result<T, LoadError>> {
    try {
      return ok(await firstValueFrom(this.http.get<T>(`${this.base}${relPath}`)));
    } catch (cause) {
      logWarn(`DataFileTransport.readJson ${relPath}`, cause);
      return { ok: false, error: toLoadError(cause, `data-file.${relPath}`) };
    }
  }

  writeJson(): Promise<void> { throw new Error(BROWSER_READONLY); }
  remove(): Promise<void> { throw new Error(BROWSER_READONLY); }
  list(): Promise<string[]> { throw new Error(BROWSER_READONLY); }
}
