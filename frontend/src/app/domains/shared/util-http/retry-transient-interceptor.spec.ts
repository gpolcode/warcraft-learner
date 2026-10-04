import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import type { Provider } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { RETRY_TOO_MANY_REQUESTS, retryTransientInterceptor } from './retry-transient-interceptor';

// The backoff is a real RxJS timer, so the retry is driven by advancing fake timers.
const URL = '/data/specs/index.json';
const BODY = { ok: true };
const BACKOFF_MS = 400;

const HTTP_SERVICE_UNAVAILABLE = 503;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_NETWORK_OR_CORS = 0;
const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;

function setup(...overrides: Provider[]): { http: HttpClient; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      ...overrides,
      provideHttpClient(withInterceptors([retryTransientInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  return { http: TestBed.inject(HttpClient), httpMock: TestBed.inject(HttpTestingController) };
}

describe('retryTransientInterceptor', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.useRealTimers();
  });

  it('retries a transient 503 once and succeeds on the second attempt', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.get(URL));

    httpMock.expectOne(URL).flush(null, { status: HTTP_SERVICE_UNAVAILABLE, statusText: 'Service Unavailable' });
    await vi.advanceTimersByTimeAsync(BACKOFF_MS);
    httpMock.expectOne(URL).flush(BODY);

    expect(await pending).toEqual(BODY);
  });

  it('retries a status-0 network/CORS failure once', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.get(URL));

    httpMock.expectOne(URL).error(new ProgressEvent('error'), { status: HTTP_NETWORK_OR_CORS });
    await vi.advanceTimersByTimeAsync(BACKOFF_MS);
    httpMock.expectOne(URL).flush(BODY);

    expect(await pending).toEqual(BODY);
  });

  it('gives up after a single retry when the transient failure persists', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.get(URL)).catch((e: unknown) => (e as HttpErrorResponse).status);

    httpMock.expectOne(URL).flush(null, { status: HTTP_SERVICE_UNAVAILABLE, statusText: 'Service Unavailable' });
    await vi.advanceTimersByTimeAsync(BACKOFF_MS);
    httpMock.expectOne(URL).flush(null, { status: HTTP_SERVICE_UNAVAILABLE, statusText: 'Service Unavailable' });

    expect(await pending).toBe(HTTP_SERVICE_UNAVAILABLE);
  });

  it('retries a 429 once by default', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.get(URL));

    httpMock.expectOne(URL).flush(null, { status: HTTP_TOO_MANY_REQUESTS, statusText: 'Too Many Requests' });
    await vi.advanceTimersByTimeAsync(BACKOFF_MS);
    httpMock.expectOne(URL).flush(BODY);

    expect(await pending).toEqual(BODY);
  });

  it('passes a 429 straight through where RETRY_TOO_MANY_REQUESTS is off', async () => {
    const { http, httpMock } = setup({ provide: RETRY_TOO_MANY_REQUESTS, useValue: false });
    const pending = firstValueFrom(http.get(URL)).catch((e: unknown) => (e as HttpErrorResponse).status);

    httpMock.expectOne(URL).flush(null, { status: HTTP_TOO_MANY_REQUESTS, statusText: 'Too Many Requests' });

    expect(await pending).toBe(HTTP_TOO_MANY_REQUESTS);
  });

  it('does not retry a 404 (the missing-data signal passes straight through)', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.get(URL)).catch((e: unknown) => (e as HttpErrorResponse).status);

    httpMock.expectOne(URL).flush(null, { status: HTTP_NOT_FOUND, statusText: 'Not Found' });

    expect(await pending).toBe(HTTP_NOT_FOUND);
  });

  it('does not retry a 403 (a permanent failure passes straight through)', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.get(URL)).catch((e: unknown) => (e as HttpErrorResponse).status);

    httpMock.expectOne(URL).flush(null, { status: HTTP_FORBIDDEN, statusText: 'Forbidden' });

    expect(await pending).toBe(HTTP_FORBIDDEN);
  });
});
