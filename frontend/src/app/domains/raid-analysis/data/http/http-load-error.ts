import { HttpErrorResponse } from '@angular/common/http';
import { Result, Results } from '../../../shared/util-http/result';
import { WclReportUnavailableError, WclTransportError } from '../wcl/wcl-transport';

// Status 0 is a network/CORS drop or the status-0 WclTransportError a GraphQL-level failure raises.
const TRANSIENT_STATUSES = new Set([0, 408, 429, 500, 502, 503, 504]);
const HTTP_NOT_FOUND = 404;

// Bound the cause-chain walk so a cyclic cause can never spin.
const MAX_CAUSE_DEPTH = 8;

export class HttpLoadErrors {
  private constructor() {}

  // Walks `Error.cause` so a wrapped transport/HTTP error still classifies by its real status instead of the `permanent` fallback.
  private static causeChain(cause: unknown): unknown[] {
    const chain: unknown[] = [];
    let current: unknown = cause;
    for (let depth = 0; current != null && depth < MAX_CAUSE_DEPTH; depth++) {
      chain.push(current);
      current = current instanceof Error ? current.cause : null;
    }
    return chain;
  }

  private static statusOf(chain: unknown[]): number {
    for (const link of chain) {
      if (link instanceof HttpErrorResponse || link instanceof WclTransportError) return link.status;
    }
    return -1;
  }

  // The single place an HTTP/transport status becomes a taxonomy variant, so features never re-derive the mapping.
  static toLoadError(cause: unknown, id: string): Result<never> {
    const chain = HttpLoadErrors.causeChain(cause);
    if (chain.some(link => link instanceof WclReportUnavailableError)) {
      return Results.unusableLog('This report is private, expired or does not exist.', id, cause);
    }
    const status = HttpLoadErrors.statusOf(chain);

    if (status === HTTP_NOT_FOUND) return Results.missing('Not yet ingested.');
    if (TRANSIENT_STATUSES.has(status)) return Results.transient('WCL is unreachable right now.');
    return Results.permanent('Analysis data could not be loaded.', id, cause);
  }
}
