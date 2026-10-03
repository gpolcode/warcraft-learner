import { Injectable } from '@angular/core';
import { DataFileTransport } from './data-file-transport';
import { Result } from '../../../shared/util-http/result';

const PRERENDER_READONLY = 'DataFileApiService is read-only while prerendering';

// The build has no bench data and ingestion republishes it daily, so a prerendered page keeps its loading state and the browser reads the live copy.
@Injectable({ providedIn: 'root' })
export class PrerenderDataFileTransport implements DataFileTransport {
  readJson<T>(): Promise<Result<T>> {
    return new Promise(() => undefined);
  }

  writeJson(): Promise<void> { throw new Error(PRERENDER_READONLY); }
  remove(): Promise<void> { throw new Error(PRERENDER_READONLY); }
  list(): Promise<string[]> { throw new Error(PRERENDER_READONLY); }
}
