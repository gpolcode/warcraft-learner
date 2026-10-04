import { describe, it, expect, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { WclResponseStoreInterceptor } from './wcl-response-store-interceptor';
import { provideWclCaching } from '../wcl/wcl-caching';
import { EVENTS_Q, REPORT_Q } from '../wcl/wcl-queries';
import { ENVIRONMENT } from '../../../../../environments/environment-token';
import { baseEnvironment } from '../../../../../environments/base-environment';

/** Spelled out rather than read from the environment, so moving either host fails the assertions. */
const WCL_API_URL = 'https://www.warcraftlogs.com/api/v2/client';
const STORE_URL = 'http://localhost:3000/api/wcl-cache/';
const SHA256_HEX = /^[0-9a-f]{64}$/;

const CASTS_READ = { query: EVENTS_Q, variables: { code: 'AbCdEfGh12345678', fightIDs: [12], dataType: 'Casts' } };
const REPORT_READ = { query: REPORT_Q, variables: { code: 'AbCdEfGh12345678' } };
const CASTS = { data: { reportData: { report: { events: { data: [{ type: 'cast' }], nextPageTimestamp: null } } } } };
const PRIVATE_REPORT = { errors: [{ message: 'You do not have permission to view this report.' }] };
const NOT_FOUND = { status: 404, statusText: 'Not Found' };
const UNAVAILABLE = { status: 503, statusText: 'Service Unavailable' };

const toStore = (req: { url: string }): boolean => req.url.startsWith(STORE_URL);
const toWcl = (req: { url: string }): boolean => req.url === WCL_API_URL;

function setup(storeDir = '.wcl-cache', memoryCache = false): { http: HttpClient; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      // Registered in app.config.ts's order, so a memory hit never reaches the store.
      ...(memoryCache ? [provideWclCaching(WCL_API_URL)] : []),
      { provide: HTTP_INTERCEPTORS, useClass: WclResponseStoreInterceptor, multi: true },
      { provide: ENVIRONMENT, useValue: { ...baseEnvironment, wclResponseCacheDir: storeDir } },
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  });
  return { http: TestBed.inject(HttpClient), httpMock: TestBed.inject(HttpTestingController) };
}

/** The store answers before WCL is asked, so each next request appears a few microtasks after the last one settles. */
const nextRequest = (httpMock: HttpTestingController, match: (req: { url: string }) => boolean): Promise<TestRequest> =>
  vi.waitFor(() => httpMock.expectOne(req => match(req)));

describe('WclResponseStoreInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('answers a stored fight-window read without asking WCL', async () => {
    const { http, httpMock } = setup();

    const pending = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    (await nextRequest(httpMock, toStore)).flush(CASTS);

    expect(await pending).toEqual(CASTS);
  });

  it('fetches a read the store does not hold from WCL, then stores what WCL answered', async () => {
    const { http, httpMock } = setup();

    const pending = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    const lookup = await nextRequest(httpMock, toStore);
    lookup.flush(null, NOT_FOUND);
    (await nextRequest(httpMock, toWcl)).flush(CASTS);
    const write = await nextRequest(httpMock, toStore);
    write.flush(null);

    expect(await pending).toEqual(CASTS);
    expect(write.request.method).toBe('PUT');
    expect(write.request.url).toBe(lookup.request.url);
    expect(write.request.body).toEqual(CASTS);
  });

  it('files each read under a sha256 key', async () => {
    const { http, httpMock } = setup();

    const pending = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    const lookup = await nextRequest(httpMock, toStore);
    lookup.flush(CASTS);
    await pending;

    expect(lookup.request.url.slice(STORE_URL.length)).toMatch(SHA256_HEX);
  });

  it('stores a GraphQL error answer, so a private report is asked for only once', async () => {
    const { http, httpMock } = setup();

    const pending = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    (await nextRequest(httpMock, toStore)).flush(null, NOT_FOUND);
    (await nextRequest(httpMock, toWcl)).flush(PRIVATE_REPORT);
    const write = await nextRequest(httpMock, toStore);
    write.flush(null);

    expect(await pending).toEqual(PRIVATE_REPORT);
    expect(write.request.body).toEqual(PRIVATE_REPORT);
  });

  it('never stores a WCL request that failed, so a later run asks again', async () => {
    const { http, httpMock } = setup();

    const pending = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    (await nextRequest(httpMock, toStore)).flush(null, NOT_FOUND);
    (await nextRequest(httpMock, toWcl)).flush('Unavailable', UNAVAILABLE);

    await expect(pending).rejects.toMatchObject({ status: UNAVAILABLE.status });
  });

  it('sends a report read straight to WCL, since a report still recording gains fights', async () => {
    const { http, httpMock } = setup();

    const pending = firstValueFrom(http.post(WCL_API_URL, REPORT_READ));
    httpMock.expectOne(toWcl).flush(CASTS);

    expect(await pending).toEqual(CASTS);
  });

  it('sends every read straight to WCL when the build turns the store off', async () => {
    const { http, httpMock } = setup('');

    const pending = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    httpMock.expectOne(toWcl).flush(CASTS);

    expect(await pending).toEqual(CASTS);
  });

  it('stops asking a store it cannot reach for the rest of the session', async () => {
    const { http, httpMock } = setup();

    const first = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    (await nextRequest(httpMock, toStore)).error(new ProgressEvent('error'));
    (await nextRequest(httpMock, toWcl)).flush(CASTS);
    expect(await first).toEqual(CASTS);

    const second = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    httpMock.expectOne(toWcl).flush(CASTS);
    expect(await second).toEqual(CASTS);
  });

  it('leaves a repeat within the run to the memory cache, which sits in front of it', async () => {
    const { http, httpMock } = setup('.wcl-cache', true);

    const first = firstValueFrom(http.post(WCL_API_URL, CASTS_READ));
    (await nextRequest(httpMock, toStore)).flush(CASTS);
    await first;

    expect(await firstValueFrom(http.post(WCL_API_URL, CASTS_READ))).toEqual(CASTS);
  });
});
