import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, retry, throwError, timer } from 'rxjs';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { ENVIRONMENT } from '../../../../../environments/environment-token';

const RATE_LIMITED_STATUS = 429;
// WCL caps requests per minute apart from the hourly points, and its CORS hides Retry-After, so the wait is the whole window.
const WINDOW_MS = 60_000;
// The hourly points are the budget check's to stop on; a 429 that outlasts this is not the per-minute cap.
const MAX_WAIT_MS = 120_000;

@Injectable()
export class WclRateLimitWaitInterceptor implements HttpInterceptor {
  private readonly logger = inject(LoggerService);
  private readonly wclApiUrl = inject(ENVIRONMENT).wclApiUrl;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.url !== this.wclApiUrl) return next.handle(req);
    return next.handle(req).pipe(
      retry({
        count: MAX_WAIT_MS / WINDOW_MS,
        delay: (error: unknown) => {
          if (!(error instanceof HttpErrorResponse && error.status === RATE_LIMITED_STATUS)) return throwError(() => error);
          this.logger.logWarn('WclRateLimitWaitInterceptor', `WCL answered ${RATE_LIMITED_STATUS}, resending in ${WINDOW_MS / 1000} s`);
          return timer(WINDOW_MS);
        },
      }),
    );
  }
}
