import { EnvironmentProviders } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { provideNgHttpCaching, NgHttpCachingMemoryStorage, NgHttpCachingHeaders, NG_HTTP_CACHING_YEAR_IN_MS } from 'ng-http-caching';
import { WCL_API_URL } from './wcl-transport';
import { REPORT_Q, REPORT_FIGHTS_Q, RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q } from './wcl-queries';

/**
 * How long a report read may be served from cache before a re-read hits WCL. Kept below the
 * live-sync poll interval so every poll tick still sees a freshly-recorded pull, while the
 * five slice cards' overlapping reads within a single tick share one fetch.
 */
export const WCL_LIVE_CACHE_MS = 10_000;

// A report read is keyed on the report code alone, so its result changes as a live raid records
// new pulls - cap it at WCL_LIVE_CACHE_MS. Discovery and budget reads must always be fresh (the
// budget gate reads the current points spent; discovery is one-shot). Every other read is keyed
// on an immutable fight window, so it keeps the long default lifetime and a new pull's distinct
// window fetches fresh on its own.
const VOLATILE_QUERIES: ReadonlySet<string> = new Set([REPORT_Q, REPORT_FIGHTS_Q]);
const UNCACHED_QUERIES: ReadonlySet<string> = new Set([RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q]);

/**
 * Per-request cache-control headers for a WCL query, derived from the query alone: a short
 * lifetime for the volatile report reads, no cache for discovery/budget reads, and nothing
 * (the long default) for everything else. This is the single place that decides caching, so
 * neither the transport nor the API service branches on live/ingest state.
 */
export function wclCachingHeaders(query: string): Record<string, string> {
  if (UNCACHED_QUERIES.has(query)) return { [NgHttpCachingHeaders.DISALLOW_CACHE]: '1' };
  if (VOLATILE_QUERIES.has(query)) return { [NgHttpCachingHeaders.LIFETIME]: String(WCL_LIVE_CACHE_MS) };
  return {};
}

/**
 * The WCL response cache: dedupes reads so the five slice cards share one report/event fetch
 * within a poll tick. Only WCL_API_URL POSTs are cacheable, keyed on the GraphQL body so the
 * renewing Authorization header cannot fragment the cache. The default lifetime is
 * nominal-infinite (immutable fight-window reads); `wclCachingHeaders` shortens or disables it
 * per query. Eviction is by scope: a page close drops the store, and the ingest orchestrator
 * clears it between encounters to bound memory.
 */
export function provideWclCaching(): EnvironmentProviders {
  return provideNgHttpCaching({
    store: new NgHttpCachingMemoryStorage(),
    lifetime: NG_HTTP_CACHING_YEAR_IN_MS,
    allowedMethod: ['POST'],
    // undefined falls through to the library's default checks (DISALLOW_CACHE header,
    // allowedMethod); false hard-excludes every non-WCL request.
    isCacheable: (req: HttpRequest<unknown>) => (req.url === WCL_API_URL ? undefined : false),
    getKey: (req: HttpRequest<unknown>) =>
      req.url === WCL_API_URL ? `${req.method}@${req.url}@${JSON.stringify(req.body)}` : undefined,
  });
}
