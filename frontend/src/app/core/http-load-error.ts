import { HttpErrorResponse } from '@angular/common/http';
import { Result, LoadError, missing, transient, permanent } from './result';
import { WclTransportError } from './services/wcl-transport';

// The interceptor already retried these once, so reaching here means the retry did not
// help. Status 0 is a network/CORS drop or the status-0 WclTransportError a GraphQL-level
// failure raises.
const TRANSIENT_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);
const HTTP_NOT_FOUND = 404;

// Bound on the cause chain walk, so a self-referential or pathologically nested cause can
// never spin. Real chains here are one or two links deep.
const MAX_CAUSE_DEPTH = 8;

/**
 * The HTTP/transport status of the failure, or -1 when none is present. The chain of
 * `Error.cause` links is walked so a wrapped `HttpErrorResponse` / `WclTransportError`
 * still classifies by its real status instead of collapsing to the `permanent` fallback.
 */
function statusOf(cause: unknown): number {
  let current: unknown = cause;
  for (let depth = 0; current != null && depth < MAX_CAUSE_DEPTH; depth++) {
    if (current instanceof HttpErrorResponse) return current.status;
    if (current instanceof WclTransportError) return current.status;
    current = current instanceof Error ? current.cause : null;
  }
  return -1;
}

/**
 * The single place an HTTP/transport status becomes a taxonomy variant, so slices never
 * re-derive the mapping. Only for the catch site: a pure-core semantic failure calls the
 * `missing`/`permanent` builders directly.
 */
export function toLoadError(cause: unknown, id: string): Result<never, LoadError> {
  const status = statusOf(cause);

  if (status === HTTP_NOT_FOUND) return missing('Not yet ingested.');
  if (TRANSIENT_STATUSES.has(status)) return transient('WCL is unreachable right now.');
  return permanent('Analysis data could not be loaded.', id, cause);
}
