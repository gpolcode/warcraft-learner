import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer, throwError } from 'rxjs';

/**
 * Retries a failed HTTP request once, and only for transient statuses, before letting
 * the failure reach the shell. Because Apollo's `HttpLink` rides on Angular's
 * `HttpClient`, this one interceptor covers both the static data-file GETs and the WCL
 * GraphQL POSTs. WCL GraphQL operations are reads (semantically idempotent) even though
 * they are HTTP POST, so retrying them is safe; the predicate gates on status, not verb.
 *
 * 401/403/404 pass straight through un-retried: 401 is handled by the WCL auth layer
 * (retrying would fight the token refresh), 404 is the `missing` signal, and 403 is a
 * permanent failure. Whatever survives the retry is mapped to a `LoadError` by the shell.
 */
const MAX_RETRIES = 1;
const BASE_DELAY_MS = 400;
const RETRYABLE_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);

export const retryTransientInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    retry({
      count: MAX_RETRIES,
      // `delay` as a function is the modern replacement for `retryWhen`: return an
      // observable that fires after the backoff to retry, or rethrow to stop retrying.
      delay: (error, retryCount) => {
        const status = error instanceof HttpErrorResponse ? error.status : -1;
        if (!RETRYABLE_STATUSES.has(status)) return throwError(() => error);
        return timer(BASE_DELAY_MS * 2 ** (retryCount - 1));
      },
    }),
  );
