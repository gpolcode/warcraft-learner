import { EnvironmentProviders } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { provideNgHttpCaching, NgHttpCachingMemoryStorage, NG_HTTP_CACHING_YEAR_IN_MS } from 'ng-http-caching';
import { WCL_API_URL } from './wcl-transport';

/**
 * The WCL response cache: ng-http-caching scoped to the WCL GraphQL endpoint only.
 *
 * - Store is strictly in-memory (never localStorage/sessionStorage): cached report/event
 *   streams run far past the ~5 MB storage quota, and the dedupe contract is per-session
 *   anyway - the store lives and dies with the tab.
 * - Only POSTs to WCL_API_URL are cacheable. Data-file GETs, the OAuth token grant, and
 *   the ingest file-server calls all bypass the cache.
 * - The key includes the serialized GraphQL body, so distinct queries/variables cache
 *   separately while the per-request Authorization header (which renews on expiry) does
 *   not fragment the cache.
 * - Lifetime is nominal-infinite (one year) because eviction is handled by scope: a page
 *   close drops the store, and the ingest orchestrator clears it between encounters via
 *   NgHttpCachingService.clearCache() to bound memory.
 * - `network-only` reads (live-sync polling, ingest discovery/budget queries) opt out per
 *   request through the DISALLOW_CACHE header set by HttpWclTransport.
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
