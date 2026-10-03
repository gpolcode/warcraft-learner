import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DataFileTransport } from './data-file-transport';
import { PrerenderDataFileTransport } from './prerender-data-file-transport';

const REL_PATH = 'SubtletyRogue/burst/3176.json';
const BENCH_BODY = { encounter_id: 3176, sample_count: 5 };
const PRERENDER_READONLY_ERROR = /read-only while prerendering/;
const STILL_PENDING = 'still pending';

// A timer fires only once every queued microtask has run, so a read still unsettled by then is waiting on nothing.
function afterQueuedWork(): Promise<typeof STILL_PENDING> {
  return new Promise(resolve => { setTimeout(() => { resolve(STILL_PENDING); }, 0); });
}

function transport(): DataFileTransport {
  return TestBed.inject(PrerenderDataFileTransport);
}

describe('PrerenderDataFileTransport', () => {
  it('leaves every read pending, so a prerendered page ships its loading state', async () => {
    expect(await Promise.race([transport().readJson(REL_PATH), afterQueuedWork()])).toBe(STILL_PENDING);
  });

  it('throws on every write-side method', () => {
    expect(() => transport().writeJson(REL_PATH, BENCH_BODY)).toThrow(PRERENDER_READONLY_ERROR);
    expect(() => transport().remove(REL_PATH)).toThrow(PRERENDER_READONLY_ERROR);
    expect(() => transport().list('SubtletyRogue/burst')).toThrow(PRERENDER_READONLY_ERROR);
  });
});
