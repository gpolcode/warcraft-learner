import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataFileTransport } from '../data-files/data-file-transport';
import { Result, Results } from '../../../shared/util-http/result';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { HttpLoadErrors } from './http-load-error';
import { IngestStampService } from '../ingest/ingest-stamp-service';
import { ENVIRONMENT } from '../../../../../environments/environment-token';

// The file server is rooted one level up at data/ so a single containment guard covers the whole data folder.
const SPECS_PREFIX = 'specs/';

/** The server returns an exact 404 for an absent file - the `missing` signal. */
@Injectable({ providedIn: 'root' })
export class IngestHttpDataFileTransport implements DataFileTransport {
  private readonly logger = inject(LoggerService);
  private readonly stamp = inject(IngestStampService);
  private readonly http = inject(HttpClient);
  private readonly serverUrl = inject(ENVIRONMENT).ingestServerUrl;

  private fileUrl(relPath: string): string {
    return `${this.serverUrl}/api/data/${SPECS_PREFIX}${relPath}`;
  }

  async readJson<T>(relPath: string): Promise<Result<T>> {
    let parsed: unknown;
    try {
      parsed = await firstValueFrom(this.http.get<unknown>(this.fileUrl(relPath)));
    } catch (cause) {
      const result = HttpLoadErrors.toLoadError(cause, `data-file.${relPath}`);
      // An un-ingested file is the orchestrator's normal case, so only real failures log.
      if (!result.ok && result.error.kind !== 'missing') {
        this.logger.logWarn(`IngestHttpDataFileTransport.readJson ${relPath}`, cause);
      }
      return result;
    }
    // A newer-versioned file has a shape this build does not know; fail it rather than cast the drifted JSON to T.
    if (this.stamp.isFutureVersion(parsed)) {
      return Results.permanent('Data file is from a newer ingest version.', `data-file.version.${relPath}`);
    }
    return Results.ok(parsed as T);
  }

  async writeJson(relPath: string, data: unknown): Promise<void> {
    await firstValueFrom(this.http.put(this.fileUrl(relPath), data));
  }

  async remove(relPath: string): Promise<void> {
    await firstValueFrom(this.http.delete(this.fileUrl(relPath)));
  }

  async list(relDir: string): Promise<string[]> {
    return await firstValueFrom(this.http.get<string[]>(`${this.serverUrl}/api/dirs/${SPECS_PREFIX}${relDir}`));
  }
}
