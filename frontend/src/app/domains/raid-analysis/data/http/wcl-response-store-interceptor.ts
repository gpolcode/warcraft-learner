import { Injectable, inject } from '@angular/core';
import {
  HttpBackend, HttpClient, HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse,
} from '@angular/common/http';
import { Observable, concatMap, defer, firstValueFrom, from, of, switchMap } from 'rxjs';
import { WclCaching } from '../wcl/wcl-caching';
import type { StoreTally } from '../wcl/wcl-transport';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { ENVIRONMENT } from '../../../../../environments/environment-token';

const NOT_STORED_STATUS = 404;
const UNREACHABLE_STATUS = 0;

export const WCL_STORE_TALLY = new HttpContextToken<StoreTally>(() => ({ hits: 0, misses: 0 }));

// Registered behind the memory cache, which already folds a run's repeats and concurrent duplicates into one request here.
@Injectable()
export class WclResponseStoreInterceptor implements HttpInterceptor {
  private readonly environment = inject(ENVIRONMENT);
  private readonly logger = inject(LoggerService);
  // Straight to the backend, so the store's own requests skip the WCL retry and never re-enter this interceptor.
  private readonly store = new HttpClient(inject(HttpBackend));
  private reachable = this.environment.wclResponseCacheDir !== '';

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.reachable || req.url !== this.environment.wclApiUrl || !WclCaching.isStorable(req)) return next.handle(req);
    const entryUrl = `${this.environment.ingestServerUrl}/api/wcl-cache/${WclCaching.cacheKey(req)}`;
    const tally = req.context.get(WCL_STORE_TALLY);
    // Deferred so a retry that resubscribes asks the store again rather than replaying the first answer.
    return defer(() => this.read(entryUrl, req.url)).pipe(
      switchMap(stored => {
        if (stored) {
          tally.hits++;
          return of(stored);
        }
        return next.handle(req).pipe(
          concatMap(event => (event instanceof HttpResponse && event.ok ? from(this.write(entryUrl, event, tally)) : of(event))),
        );
      }),
    );
  }

  private async read(entryUrl: string, url: string): Promise<HttpResponse<unknown> | null> {
    try {
      return new HttpResponse({ body: await firstValueFrom(this.store.get<unknown>(entryUrl)), status: 200, url });
    } catch (cause) {
      if (!(cause instanceof HttpErrorResponse && cause.status === NOT_STORED_STATUS)) this.failed('read', cause);
      return null;
    }
  }

  // Awaited before the response moves on, so a run that ends right after its last fetch still finds that response stored.
  private async write(entryUrl: string, response: HttpResponse<unknown>, tally: StoreTally): Promise<HttpResponse<unknown>> {
    tally.misses++;
    if (!this.reachable) return response;
    try {
      await firstValueFrom(this.store.put(entryUrl, response.body));
    } catch (cause) {
      this.failed('write', cause);
    }
    return response;
  }

  // Status 0 means no file server listens (a bare `ng serve`), so the store stays off for the session.
  private failed(operation: string, cause: unknown): void {
    if (cause instanceof HttpErrorResponse && cause.status === UNREACHABLE_STATUS) this.reachable = false;
    this.logger.logWarn(`WclResponseStoreInterceptor ${operation}`, cause);
  }
}
