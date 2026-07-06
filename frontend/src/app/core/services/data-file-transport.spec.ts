import { describe, it, expect, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DataFileTransport, HttpDataFileTransport } from './data-file-transport';
import { ok, err, missing, transient } from '../result';

/**
 * The browser transport is a read-only HTTP GET of the static ingested files. These
 * tests pin the outcomes the runtime relies on: a slice read resolves `ok(body)` under
 * the configured data base; a 404 (a spec/encounter with no ingested file yet) resolves
 * `err(missing)`, the "un-ingested file is not an error" waiting state every *DataSource
 * depends on; and a 5xx / network failure resolves `err(transient)` - a distinct outcome
 * so a data-host outage surfaces "retry in a moment" instead of masquerading as "not
 * ingested". Both failure outcomes still logWarn. The write side is a hard error in the
 * browser (only the Node ingestion writes).
 */
const REL_PATH = 'SubtletyRogue/burst/3176.json';
const SLICE_BODY = { encounter_id: 3176, sample_count: 5 };
const NOT_FOUND_STATUS = 404;
const SERVER_ERROR_STATUS = 500;
// The two taxonomy messages toLoadError stamps for these statuses.
const MISSING_MESSAGE = 'Not yet ingested.';
const TRANSIENT_MESSAGE = 'WCL is unreachable right now.';
const BROWSER_READONLY_ERROR = /read-only in the browser/;

// The transport is exercised through its interface, so the read-only write-side methods
// are called with the arguments real callers pass (the browser impl ignores them and throws).
function setup(): { transport: DataFileTransport; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [HttpDataFileTransport, provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    transport: TestBed.inject(HttpDataFileTransport),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

/** Silences and captures the transport's logWarn output on a failed read. */
function spyOnWarn() {
  return vi.spyOn(console, 'warn').mockImplementation(() => undefined);
}

describe('HttpDataFileTransport', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  it('GETs the relative path under the data base and returns ok(body)', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.readJson<typeof SLICE_BODY>(REL_PATH);
    const req = httpMock.expectOne(request => request.url.endsWith(`data/specs/${REL_PATH}`));
    expect(req.request.method).toBe('GET');
    req.flush(SLICE_BODY);

    expect(await pending).toEqual(ok(SLICE_BODY));
  });

  it('resolves err(missing) and logs a warning when the file is missing (404)', async () => {
    const warn = spyOnWarn();
    const { transport, httpMock } = setup();

    const pending = transport.readJson(REL_PATH);
    httpMock
      .expectOne(request => request.url.endsWith(`data/specs/${REL_PATH}`))
      .flush('Not found', { status: NOT_FOUND_STATUS, statusText: 'Not Found' });

    expect(await pending).toEqual(err(missing(MISSING_MESSAGE)));
    expect(warn).toHaveBeenCalled();
  });

  it('resolves err(transient) and logs a warning when the read fails (500), distinct from missing', async () => {
    const warn = spyOnWarn();
    const { transport, httpMock } = setup();

    const pending = transport.readJson(REL_PATH);
    httpMock
      .expectOne(request => request.url.endsWith(`data/specs/${REL_PATH}`))
      .flush('Server error', { status: SERVER_ERROR_STATUS, statusText: 'Internal Server Error' });

    const result = await pending;
    expect(result).toEqual(err(transient(TRANSIENT_MESSAGE)));
    // A data-host outage must not read as "not ingested": the transient outcome is distinct.
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('transient');
    expect(warn).toHaveBeenCalled();
  });

  it('throws on every write-side method - the browser transport is read-only', () => {
    const { transport } = setup();

    expect(() => transport.writeJson(REL_PATH, SLICE_BODY)).toThrow(BROWSER_READONLY_ERROR);
    expect(() => transport.remove(REL_PATH)).toThrow(BROWSER_READONLY_ERROR);
    expect(() => transport.list('SubtletyRogue/burst')).toThrow(BROWSER_READONLY_ERROR);
  });
});
