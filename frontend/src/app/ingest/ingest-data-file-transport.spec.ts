import { describe, it, expect, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { IngestHttpDataFileTransport, INGEST_SERVER_URL } from './ingest-data-file-transport';
import { INGEST_VERSION } from './ingest-version';
import { ok, missing } from '../core/result';

const REL_PATH = 'SubtletyRogue/burst/3176.json';
// The file server is rooted at data/, one level above the specs tree the transport addresses.
const SERVER_FILE_PATH = `specs/${REL_PATH}`;
const SLICE_BODY = { encounter_id: 3176, sample_count: 5, ingest_version: INGEST_VERSION };
const FUTURE_BODY = { encounter_id: 3176, ingest_version: INGEST_VERSION + 1 };
const NOT_FOUND_STATUS = 404;
const MISSING_MESSAGE = 'Not yet ingested.';

function setup(): { transport: IngestHttpDataFileTransport; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    transport: TestBed.inject(IngestHttpDataFileTransport),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('IngestHttpDataFileTransport', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  it('reads through the file server load endpoint and returns ok(body)', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.readJson<typeof SLICE_BODY>(REL_PATH);
    const req = httpMock.expectOne(request => request.url === `${INGEST_SERVER_URL}/api/load`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('filePath')).toBe(SERVER_FILE_PATH);
    req.flush(SLICE_BODY);

    expect(await pending).toEqual(ok(SLICE_BODY));
  });

  it('resolves missing on an exact 404 - the un-ingested signal', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.readJson(REL_PATH);
    httpMock
      .expectOne(request => request.url === `${INGEST_SERVER_URL}/api/load`)
      .flush({ error: 'not found' }, { status: NOT_FOUND_STATUS, statusText: 'Not Found' });

    expect(await pending).toEqual(missing(MISSING_MESSAGE));
  });

  it('fails a file stamped with a future ingest version as permanent', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.readJson(REL_PATH);
    httpMock.expectOne(request => request.url === `${INGEST_SERVER_URL}/api/load`).flush(FUTURE_BODY);

    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('permanent');
  });

  it('POSTs writes to the save endpoint with the server-rooted path and raw data', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.writeJson(REL_PATH, SLICE_BODY);
    const req = httpMock.expectOne(`${INGEST_SERVER_URL}/api/save`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ filePath: SERVER_FILE_PATH, data: SLICE_BODY });
    req.flush({ ok: true });

    await pending;
  });

  it('POSTs removals to the delete endpoint', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.remove(REL_PATH);
    const req = httpMock.expectOne(`${INGEST_SERVER_URL}/api/delete`);
    expect(req.request.body).toEqual({ filePath: SERVER_FILE_PATH });
    req.flush({ ok: true });

    await pending;
  });

  it('lists a directory through the list endpoint and unwraps the entries', async () => {
    const { transport, httpMock } = setup();

    const pending = transport.list('SubtletyRogue/burst');
    const req = httpMock.expectOne(request => request.url === `${INGEST_SERVER_URL}/api/list`);
    expect(req.request.params.get('dir')).toBe('specs/SubtletyRogue/burst');
    req.flush({ entries: ['3176.json', '3177.json'] });

    expect(await pending).toEqual(['3176.json', '3177.json']);
  });
});
