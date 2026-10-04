import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { WclRateLimitWaitInterceptor } from './wcl-rate-limit-wait-interceptor';
import { ENVIRONMENT } from '../../../../../environments/environment-token';
import { baseEnvironment } from '../../../../../environments/base-environment';

// The wait is a real RxJS timer, so the resend is driven by advancing fake timers.
/** Spelled out rather than read from the environment, so moving the WCL host fails the assertions. */
const WCL_API_URL = 'https://www.warcraftlogs.com/api/v2/client';
const OTHER_HOST_URL = 'https://www.raidbots.com/static/data/live/talents.json';
const READ = { query: 'query RateLimit { rateLimitData { limitPerHour pointsSpentThisHour } }' };
const ANSWER = { data: { rateLimitData: { limitPerHour: 3600, pointsSpentThisHour: 12 } } };
const TOO_MANY_REQUESTS = { status: 429, statusText: 'Too Many Requests' };
const UNAVAILABLE = { status: 503, statusText: 'Service Unavailable' };
/** WCL's per-minute request window. */
const WINDOW_MS = 60_000;
const JUST_BEFORE_WINDOW_MS = WINDOW_MS - 1;

function setup(): { http: HttpClient; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [
      { provide: HTTP_INTERCEPTORS, useClass: WclRateLimitWaitInterceptor, multi: true },
      { provide: ENVIRONMENT, useValue: baseEnvironment },
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting(),
    ],
  });
  return { http: TestBed.inject(HttpClient), httpMock: TestBed.inject(HttpTestingController) };
}

const failureStatus = (pending: Promise<unknown>): Promise<unknown> =>
  pending.catch((error: unknown) => (error as HttpErrorResponse).status);

describe('WclRateLimitWaitInterceptor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sends a WCL request again a minute after its 429', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.post(WCL_API_URL, READ));

    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    httpMock.expectOne(WCL_API_URL).flush(ANSWER);

    expect(await pending).toEqual(ANSWER);
  });

  it('holds the request until the minute is up', async () => {
    const { http, httpMock } = setup();
    void firstValueFrom(http.post(WCL_API_URL, READ));

    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);
    await vi.advanceTimersByTimeAsync(JUST_BEFORE_WINDOW_MS);

    httpMock.expectNone(WCL_API_URL);
  });

  it('waits out a second minute when the first ends in another 429', async () => {
    const { http, httpMock } = setup();
    const pending = firstValueFrom(http.post(WCL_API_URL, READ));

    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    httpMock.expectOne(WCL_API_URL).flush(ANSWER);

    expect(await pending).toEqual(ANSWER);
  });

  it('passes the 429 on once two minutes of waiting have not cleared it', async () => {
    const { http, httpMock } = setup();
    const status = failureStatus(firstValueFrom(http.post(WCL_API_URL, READ)));

    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);
    await vi.advanceTimersByTimeAsync(WINDOW_MS);
    httpMock.expectOne(WCL_API_URL).flush(null, TOO_MANY_REQUESTS);

    expect(await status).toBe(TOO_MANY_REQUESTS.status);
  });

  it('passes any other WCL failure straight on', async () => {
    const { http, httpMock } = setup();
    const status = failureStatus(firstValueFrom(http.post(WCL_API_URL, READ)));

    httpMock.expectOne(WCL_API_URL).flush(null, UNAVAILABLE);

    expect(await status).toBe(UNAVAILABLE.status);
  });

  it('leaves a 429 from any other host to the caller', async () => {
    const { http, httpMock } = setup();
    const status = failureStatus(firstValueFrom(http.get(OTHER_HOST_URL)));

    httpMock.expectOne(OTHER_HOST_URL).flush(null, TOO_MANY_REQUESTS);

    expect(await status).toBe(TOO_MANY_REQUESTS.status);
  });
});
