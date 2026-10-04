import { describe, it, expect } from 'vitest';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { NgHttpCachingHeaders } from 'ng-http-caching';
import { WclCaching, WCL_LIVE_CACHE_MS } from './wcl-caching';
import {
  REPORT_Q, REPORT_FIGHTS_Q, EVENTS_Q, TABLE_Q, RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q,
  RESURRECTS_Q, COMBATANT_INFO_Q, PLAYER_DETAILS_Q, RANKINGS_Q, GAME_DATA_LOOKUP,
} from './wcl-queries';

const WCL_API_URL = 'https://www.warcraftlogs.com/api/v2/client';

describe('wclCachingHeaders', () => {
  it('caps the code-keyed report reads at the live-cache lifetime', () => {
    // These are keyed on the report code alone, so they change as a live raid records pulls.
    for (const query of [REPORT_Q, REPORT_FIGHTS_Q]) {
      expect(WclCaching.headersFor(query)).toEqual({ [NgHttpCachingHeaders.LIFETIME]: String(WCL_LIVE_CACHE_MS) });
    }
  });

  it('disables the cache for discovery and budget reads', () => {
    // The budget gate must see fresh points-spent; discovery is one-shot.
    for (const query of [RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q]) {
      expect(WclCaching.headersFor(query)).toEqual({ [NgHttpCachingHeaders.DISALLOW_CACHE]: '1' });
    }
  });

  it('leaves fight-window reads on the long default lifetime', () => {
    // Events/tables are keyed on an immutable fight window, so they need no override.
    for (const query of [EVENTS_Q, TABLE_Q]) {
      expect(WclCaching.headersFor(query)).toEqual({});
    }
  });
});

describe('WclCaching.isStorable', () => {
  const read = (query: string): HttpRequest<unknown> => new HttpRequest('POST', WCL_API_URL, { query, variables: {} });

  it('stores the report read and the fight-scoped reads', () => {
    for (const query of [REPORT_Q, EVENTS_Q, RESURRECTS_Q, COMBATANT_INFO_Q, TABLE_Q, PLAYER_DETAILS_Q]) {
      expect(WclCaching.isStorable(read(query))).toBe(true);
    }
  });

  it('stores a name or icon lookup, whatever ids it asks for', () => {
    expect(WclCaching.isStorable(read(`${GAME_DATA_LOOKUP}a6603: ability(id:6603){id name icon}}}`))).toBe(true);
  });

  it('keeps out the reads that must stay live: the fights list, rankings, budget, and discovery', () => {
    for (const query of [REPORT_FIGHTS_Q, RANKINGS_Q, RATE_LIMIT_Q, CLASSES_Q, ENCOUNTERS_Q]) {
      expect(WclCaching.isStorable(read(query))).toBe(false);
    }
  });

  it('keeps out a request with no GraphQL body', () => {
    expect(WclCaching.isStorable(new HttpRequest('GET', WCL_API_URL))).toBe(false);
  });
});

describe('WclCaching.cacheKey', () => {
  const CASTS_READ = { query: EVENTS_Q, variables: { code: 'AbCdEfGh12345678', fightIDs: [12], dataType: 'Casts' } };
  const BUFFS_READ = { ...CASTS_READ, variables: { ...CASTS_READ.variables, dataType: 'Buffs' } };
  const post = (body: object, token = 'token-1'): HttpRequest<unknown> =>
    new HttpRequest('POST', WCL_API_URL, body, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) });

  it('names the same read the same way on every run', () => {
    expect(WclCaching.cacheKey(post(CASTS_READ))).toBe(WclCaching.cacheKey(post(structuredClone(CASTS_READ))));
  });

  it('ignores the bearer token, which renews mid-run', () => {
    expect(WclCaching.cacheKey(post(CASTS_READ, 'token-1'))).toBe(WclCaching.cacheKey(post(CASTS_READ, 'token-2')));
  });

  it('tells two reads apart that differ only in a variable', () => {
    expect(WclCaching.cacheKey(post(CASTS_READ))).not.toBe(WclCaching.cacheKey(post(BUFFS_READ)));
  });

  it('is a sha256 hex digest, safe as a file name', () => {
    expect(WclCaching.cacheKey(post(CASTS_READ))).toMatch(/^[0-9a-f]{64}$/);
  });
});
