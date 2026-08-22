import { InjectionToken } from '@angular/core';

// The app authenticates with the client-credentials grant, so it targets the `/client` endpoint.
export const WCL_API_URL = 'https://www.warcraftlogs.com/api/v2/client';

// `status` is the HTTP status when known (e.g. 401 for a rejected token), or 0 for a GraphQL-level / network error.
export class WclTransportError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'WclTransportError';
  }
}

// 422 because a client-error status is never in the retryable set, so `toLoadError` classifies it `permanent`.
export const WCL_UNUSABLE_STATUS = 422;

/** A query naming no report (rankings, rate limit) records nothing here. */
export interface FetchOutcomes {
  // Only deterministic permission denials land here - a transient error must not stick a usable log as inaccessible.
  inaccessibleCodes: ReadonlySet<string>;
  // Permission denials included, so a stamp keys on the parses the scope actually got.
  failedCodes: ReadonlySet<string>;
}

// An interface (not the concrete {@link HttpWclTransport}) so specs can fake it through the token.
export interface WclTransport {
  /** Runs the GraphQL POST; caching is the query's own concern (`wclCachingHeaders`). Throws {@link WclTransportError} on failure. */
  query<TData>(gqlString: string, variables: object, token: string): Promise<TData>;
  /** Two scopes must never overlap: each takes the other's codes. */
  withFetchOutcomes<T>(run: () => Promise<T>): Promise<{ result: T; outcomes: FetchOutcomes }>;
}

export const WCL_TRANSPORT = new InjectionToken<WclTransport>('WCL_TRANSPORT');
