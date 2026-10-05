import { InjectionToken } from '@angular/core';

// `status` is the HTTP status when known (e.g. 401 for a rejected token), or 0 for a GraphQL-level / network error.
export class WclTransportError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'WclTransportError';
  }
}

// 422 because a client-error status is never in the retryable set, so `toLoadError` classifies it `permanent`.
export const WCL_UNUSABLE_STATUS = 422;

// A read the memory cache answers never reaches the response store, so it is neither a hit nor a miss.
export interface StoreTally {
  hits: number;
  // Counted when WCL answers, not when the store lookup misses, so a retried request counts once.
  misses: number;
}

export interface FetchOutcomes {
  // HTTP failures only: a GraphQL error (a private log) answers the same on every run, so a retry cannot help.
  failedCodes: ReadonlySet<string>;
  store: Readonly<StoreTally>;
}

// An interface (not the concrete {@link HttpWclTransport}) so specs can fake it through the token.
export interface WclTransport {
  /** Runs the GraphQL POST; caching is the query's own concern (`wclCachingHeaders`). Throws {@link WclTransportError} on failure. */
  query<TData>(gqlString: string, variables: object, token: string): Promise<TData>;
  /** The ingest's response store keeps its copy, so there a forgotten read is answered from disk, not WCL. */
  forget(gqlString: string, variables: object): void;
  /** One run at a time: two open at once share the single scope and take each other's codes. */
  withFetchOutcomes<T>(run: () => Promise<T>): Promise<{ result: T; outcomes: FetchOutcomes }>;
}

export const WCL_TRANSPORT = new InjectionToken<WclTransport>('WCL_TRANSPORT');
