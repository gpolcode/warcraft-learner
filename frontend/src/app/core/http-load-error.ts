import { HttpErrorResponse } from '@angular/common/http';
import { LoadError, missing, transient, permanent } from './result';
import { WclTransportError } from './services/wcl-transport';

/**
 * HTTP statuses that mean "temporary": the retry-transient interceptor already retried
 * these once, so reaching here means the retry did not help. Status 0 covers a network
 * drop or CORS failure (and the status-0 `WclTransportError` a GraphQL-level failure
 * raises). 404 is handled separately as `missing`, not a transient failure.
 */
const TRANSIENT_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);
const HTTP_NOT_FOUND = 404;

/**
 * Convert any error caught at the imperative-shell boundary into a `LoadError`. This is
 * the single place an HTTP/transport status becomes a taxonomy variant: 404 -> `missing`
 * (un-ingested), a transient status -> `transient`, everything else (400/401/403 and
 * unknown throws) -> `permanent` with a repro `id` carrying the original cause.
 *
 * A genuinely-`missing` or `permanent` semantic condition produced by a pure core
 * function (no HTTP involved) calls the `missing()` / `permanent()` builders directly;
 * this converter is only for the catch site.
 */
export function toLoadError(cause: unknown, id: string): LoadError {
  const status =
    cause instanceof HttpErrorResponse ? cause.status
    : cause instanceof WclTransportError ? cause.status
    : -1;

  if (status === HTTP_NOT_FOUND) return missing('Not yet ingested.');
  if (TRANSIENT_STATUSES.has(status)) return transient('WCL is unreachable right now.');
  return permanent('Analysis data could not be loaded.', id, cause);
}
