import { EnvironmentProviders } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { provideNgHttpCaching, NgHttpCachingMemoryStorage, NgHttpCachingHeaders, NG_HTTP_CACHING_YEAR_IN_MS } from 'ng-http-caching';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import {
  REPORT_Q, REPORT_FIGHTS_Q, RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q,
  EVENTS_Q, RESURRECTS_Q, COMBATANT_INFO_Q, TABLE_Q, PLAYER_DETAILS_Q, GAME_DATA_LOOKUP,
} from './wcl-queries';

/** Below the live-sync poll interval, so each tick sees a fresh pull while a tick's overlapping reads still share one fetch. */
export const WCL_LIVE_CACHE_MS = 10_000;

// Report reads are code-keyed, so they change as a live raid records pulls; everything else is fight-window-keyed (immutable) and keeps the long default.
const VOLATILE_QUERIES: ReadonlySet<string> = new Set([REPORT_Q, REPORT_FIGHTS_Q]);
const UNCACHED_QUERIES: ReadonlySet<string> = new Set([RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q]);
// A stored report read keeps the report as it stood, so a fight logged after it stays unseen until the entry goes.
const STORABLE_QUERIES: ReadonlySet<string> = new Set([REPORT_Q, EVENTS_Q, RESURRECTS_Q, COMBATANT_INFO_Q, TABLE_Q, PLAYER_DETAILS_Q]);

export class WclCaching {
  private constructor() {}

  /** The single place caching is decided, from the query alone - so nothing else branches on live/ingest state. */
  static headersFor(query: string): Record<string, string> {
    if (UNCACHED_QUERIES.has(query)) return { [NgHttpCachingHeaders.DISALLOW_CACHE]: '1' };
    if (VOLATILE_QUERIES.has(query)) return { [NgHttpCachingHeaders.LIFETIME]: String(WCL_LIVE_CACHE_MS) };
    return {};
  }

  static isStorable(req: HttpRequest<unknown>): boolean {
    const query = (req.body as { query?: unknown } | null)?.query;
    return typeof query === 'string' && (STORABLE_QUERIES.has(query) || query.startsWith(GAME_DATA_LOOKUP));
  }

  // Keyed on the GraphQL body so the renewing Authorization header can't fragment the cache.
  static cacheKey(req: HttpRequest<unknown>): string {
    return bytesToHex(sha256(utf8ToBytes(`${req.method}@${req.url}@${JSON.stringify(req.body)}`)));
  }
}

export function provideWclCaching(wclApiUrl: string): EnvironmentProviders {
  return provideNgHttpCaching({
    store: new NgHttpCachingMemoryStorage(),
    lifetime: NG_HTTP_CACHING_YEAR_IN_MS,
    allowedMethod: ['POST'],
    // undefined falls through to the library's default checks; false hard-excludes every non-WCL request.
    isCacheable: (req: HttpRequest<unknown>) => (req.url === wclApiUrl ? undefined : false),
    getKey: (req: HttpRequest<unknown>) => (req.url === wclApiUrl ? WclCaching.cacheKey(req) : undefined),
  });
}
