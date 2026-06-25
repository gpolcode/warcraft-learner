/**
 * warcraft-learner - Extract layer (Warcraft Logs client)
 *
 * Everything that talks to the WCL v2 API: the OAuth2 client-credentials client,
 * rate-limit/budget tracking, cursor-paginated event fetching, the GraphQL query
 * strings, and the higher-level fetch helpers (encounters, rankings, per-parse
 * event bundles, enchant-name lookups). No filesystem or analysis logic lives
 * here - this layer only produces raw data for the Transform layer to consume.
 */

import { GraphQLClient, ClientError } from 'graphql-request';
import { type WclGearItem } from '../src/app/core/services/wcl-mappers.ts';
import { pickBossActorId } from './analyzer.ts';

const WCL_TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token';
const WCL_API_URL = 'https://www.warcraftlogs.com/api/v2/client';

export const EXCLUDE_ZONE_PATTERNS = ['beta', 'ptr', 'mythic+', 'complete raids', 'delves', 'torghast'];

export const SPEC_TO_WCL_FORWARD: Record<string, [string, string]> = {
  RetributionPaladin:    ['Paladin',    'Retribution'],
  HolyPaladin:           ['Paladin',    'Holy'],
  ProtectionPaladin:     ['Paladin',    'Protection'],
  FireMage:              ['Mage',       'Fire'],
  ArcaneMage:            ['Mage',       'Arcane'],
  FrostMage:             ['Mage',       'Frost'],
  HavocDemonHunter:      ['DemonHunter','Havoc'],
  VengeanceDemonHunter:  ['DemonHunter','Vengeance'],
  FuryWarrior:           ['Warrior',    'Fury'],
  ArmsWarrior:           ['Warrior',    'Arms'],
  ProtectionWarrior:     ['Warrior',    'Protection'],
  UnholyDeathKnight:     ['DeathKnight','Unholy'],
  FrostDeathKnight:      ['DeathKnight','Frost'],
  BloodDeathKnight:      ['DeathKnight','Blood'],
  BalanceDruid:          ['Druid',      'Balance'],
  FeralDruid:            ['Druid',      'Feral'],
  GuardianDruid:         ['Druid',      'Guardian'],
  RestorationDruid:      ['Druid',      'Restoration'],
  BeastMasteryHunter:    ['Hunter',     'BeastMastery'],
  MarksmanshipHunter:    ['Hunter',     'Marksmanship'],
  SurvivalHunter:        ['Hunter',     'Survival'],
  BrewmasterMonk:        ['Monk',       'Brewmaster'],
  WindwalkerMonk:        ['Monk',       'Windwalker'],
  MistweaverMonk:        ['Monk',       'Mistweaver'],
  DisciplinePriest:      ['Priest',     'Discipline'],
  HolyPriest:            ['Priest',     'Holy'],
  ShadowPriest:          ['Priest',     'Shadow'],
  AssassinationRogue:    ['Rogue',      'Assassination'],
  OutlawRogue:           ['Rogue',      'Outlaw'],
  SubtletyRogue:         ['Rogue',      'Subtlety'],
  ElementalShaman:       ['Shaman',     'Elemental'],
  EnhancementShaman:     ['Shaman',     'Enhancement'],
  RestorationShaman:     ['Shaman',     'Restoration'],
  AfflictionWarlock:     ['Warlock',    'Affliction'],
  DemonologyWarlock:     ['Warlock',    'Demonology'],
  DestructionWarlock:    ['Warlock',    'Destruction'],
  DevastationEvoker:     ['Evoker',     'Devastation'],
  PreservationEvoker:    ['Evoker',     'Preservation'],
  AugmentationEvoker:    ['Evoker',     'Augmentation'],
};

export const SPEC_TO_WCL = SPEC_TO_WCL_FORWARD;

// ── Ingest-local WCL API response types ──────────────────────────────────────

interface WclRateLimitData {
  limitPerHour?: number;
  pointsSpentThisHour?: number;
  pointsResetIn?: number | null;
}

interface WclPartition { id: number; name: string; }
interface WclZone { id: number; name: string; partitions?: WclPartition[]; encounters?: Array<{ id: number; name: string }>; }
interface WclExpansion { id: number; name: string; zones?: WclZone[]; }

interface WclServerRef { id?: number; name?: string; region?: { slug?: string }; }
interface WclReportRef { code?: string; fightID?: number; }

export interface WclRawRanking {
  name?: string;
  amount?: number;
  duration?: number;
  server?: WclServerRef;
  report?: WclReportRef;
  gear?: WclGearItem[];
}

interface WclFightEntry { id: number; startTime: number; endTime: number; encounterID: number; }
export interface WclActorEntry { id: number; name: string; type: string; subType?: string; gameID?: number | null; }

// Event from WCL (may include position fields when includeResources: true).
export interface WclResourceEvent {
  type: string;
  timestamp: number;
  abilityGameID?: number;
  amount?: number;
  absorbed?: number;
  sourceID?: number;
  targetID?: number;
  resourceActor?: number;
  x?: number;
  y?: number;
  facing?: number;
  mapID?: number;
  maxHitPoints?: number;
}

// CombatantInfo event shape.
export interface WclCombatantInfoEvent {
  type: string;
  timestamp: number;
  sourceID?: number;
  talentTree?: Array<{ id?: number; rank?: number; nodeID?: number }>;
}

// ── Ingest-local aggregation types ───────────────────────────────────────────

export interface ParseRanking {
  rank: number;
  player: string;
  amount: number;
  duration_s: number;
  report_code: string;
  fight_id: number;
  server: string;
  _raw: WclRawRanking;
}

export interface EnrichedRanking {
  server_slug: string;
  server_region: string;
  combatant_info: {
    talent_key: string;
    trinkets: Array<{ slot: number; id: number | string; name: string }>;
    enchants: Array<{ slot: number; id: number | string; name: string }>;
  };
}

export interface IngestEncounter {
  id: number;
  name: string;
  zone: string;
  expansion: string;
  partitionIds: number[];
}

// Fully-fetched per-parse event payload handed to the (pure) analyzer.
export interface ParseEventBundle {
  report_code: string;
  fight_id: number;
  player: WclActorEntry;
  npcById: Map<number, WclActorEntry>;
  start: number;
  end: number;
  fightDurS: number;
  castEvents: WclResourceEvent[];
  buffEvents: WclResourceEvent[];
  damageEvents: WclResourceEvent[];
  damageTakenEvents: WclResourceEvent[];
  enemyCastEvents: WclResourceEvent[];
  combatantEvents: WclCombatantInfoEvent[];
  bossDamageEvents: WclResourceEvent[];
}

// ── WCL OAuth2 client ─────────────────────────────────────────────────────────

// Thrown when the WCL hourly point budget is (about to be) exhausted. The ingest
// loop catches this to stop cleanly and commit partial progress; the remaining work
// is picked up on the next run. We do NOT retry: the limit resets on an hourly
// boundary and an hourly task must not stall waiting for it.
export class BudgetExceededError extends Error {
  override name = 'BudgetExceededError';
  constructor(msg: string) { super(msg); }
}

export class WCLClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private _token: string | null = null;
  private _tokenExpiry = 0;
  private readonly _serverSlugCache = new Map<number, [string, string]>();
  private _limitPerHour: number | null = null;
  private _pointsSpentThisHour = 0;
  private readonly _client = new GraphQLClient(WCL_API_URL);

  constructor() {
    this.clientId = process.env['WCL_CLIENT_ID'] ?? '';
    this.clientSecret = process.env['WCL_CLIENT_SECRET'] ?? '';
    if (!this.clientId || !this.clientSecret) {
      throw new Error('WCL_CLIENT_ID and WCL_CLIENT_SECRET environment variables must be set');
    }
  }

  private async _getToken(): Promise<string> {
    if (this._token && Date.now() / 1000 < this._tokenExpiry - 60) {
      return this._token;
    }
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    const res = await fetch(WCL_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OAuth2 token error ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json() as { access_token: string; expires_in?: number };
    this._token = data.access_token;
    this._tokenExpiry = Date.now() / 1000 + (data.expires_in ?? 3600);
    return this._token;
  }

  async query<T = unknown>(gql: string, variables: Record<string, unknown> = {}): Promise<T> {
    const token = await this._getToken();
    try {
      // graphql-request returns the GraphQL `data` payload directly and throws a
      // ClientError both on a non-2xx HTTP status and on a 200 response that carries
      // a top-level `errors` array, so all error handling lives in the catch below.
      return await this._client.request<T>(gql, variables, { Authorization: `Bearer ${token}` });
    } catch (err) {
      if (err instanceof ClientError) {
        const status = err.response.status;
        const errText = JSON.stringify(err.response.errors ?? err.response);
        if (status === 429 || /rate.?limit|too many requests|exhausted/i.test(errText)) {
          throw new BudgetExceededError(`WCL rate limit: ${errText.slice(0, 200)}`);
        }
        throw new Error(`WCL API error ${status}: ${errText.slice(0, 300)}`);
      }
      throw err;
    }
  }

  // Reads the live hourly point budget and caches it on the instance.
  async getRateLimit(): Promise<{ limitPerHour: number | null; pointsSpentThisHour: number; pointsResetIn: number | null }> {
    const data = await this.query<{ rateLimitData?: WclRateLimitData }>(
      'query { rateLimitData { limitPerHour pointsSpentThisHour pointsResetIn } }',
    );
    const rl = data.rateLimitData ?? {};
    if (rl.limitPerHour != null) this._limitPerHour = rl.limitPerHour;
    if (rl.pointsSpentThisHour != null) this._pointsSpentThisHour = rl.pointsSpentThisHour;
    return { limitPerHour: this._limitPerHour, pointsSpentThisHour: this._pointsSpentThisHour, pointsResetIn: rl.pointsResetIn ?? null };
  }

  // Fetches live budget then throws BudgetExceededError if remaining points < margin.
  async assertBudget(margin: number): Promise<void> {
    const { limitPerHour, pointsSpentThisHour } = await this.getRateLimit();
    if (limitPerHour == null) return; // unknown - don't block
    const remaining = limitPerHour - pointsSpentThisHour;
    if (remaining < margin) {
      throw new BudgetExceededError(
        `WCL budget low: ${remaining} of ${limitPerHour} remaining (need ${margin})`,
      );
    }
  }

  // Streams WCL event pages via cursor pagination, yielding one page of events at a
  // time. The generator owns only the cursor (`nextPageTimestamp`); accumulation is
  // the caller's concern, so deep pagination never builds a growing array in here.
  async *fetchAllEvents(
    code: string, fightId: number, dataType: string,
    startTime: number, endTime: number,
    options: { sourceId?: number; targetId?: number; includeResources?: boolean; hostilityType?: string } = {},
  ): AsyncGenerator<WclResourceEvent[]> {
    const EVENTS_QUERY = `
      query GetEvents(
        $code: String! $fightIDs: [Int]! $dataType: EventDataType
        $sourceID: Int $targetID: Int $startTime: Float $endTime: Float
        $includeResources: Boolean $hostilityType: HostilityType
      ) {
        reportData { report(code: $code) {
          events(fightIDs: $fightIDs dataType: $dataType sourceID: $sourceID
                 targetID: $targetID startTime: $startTime endTime: $endTime
                 includeResources: $includeResources hostilityType: $hostilityType limit: 10000) {
            data nextPageTimestamp
          }
        }}
      }`;
    let currentStart = startTime;
    while (true) {
      const vars: Record<string, unknown> = { code, fightIDs: [fightId], dataType, startTime: currentStart, endTime };
      if (options.sourceId != null) vars['sourceID'] = options.sourceId;
      if (options.targetId != null) vars['targetID'] = options.targetId;
      if (options.includeResources) vars['includeResources'] = true;
      if (options.hostilityType) vars['hostilityType'] = options.hostilityType;
      const data = await this.query<{
        reportData: { report: { events: { data: WclResourceEvent[]; nextPageTimestamp?: number | null } } }
      }>(EVENTS_QUERY, vars);
      const page = data.reportData.report.events;
      if (page.data?.length) yield page.data;
      if (page.nextPageTimestamp == null) break;
      currentStart = page.nextPageTimestamp;
    }
  }

  // Thin accumulator over fetchAllEvents for callers that want the full event list.
  async getAllEvents(
    code: string, fightId: number, dataType: string,
    startTime: number, endTime: number,
    options: { sourceId?: number; targetId?: number; includeResources?: boolean; hostilityType?: string } = {},
  ): Promise<WclResourceEvent[]> {
    const events: WclResourceEvent[] = [];
    for await (const page of this.fetchAllEvents(code, fightId, dataType, startTime, endTime, options)) {
      events.push(...page);
    }
    return events;
  }

  async resolveServerSlug(serverId: number): Promise<[string, string]> {
    const cached = this._serverSlugCache.get(serverId);
    if (cached) return cached;
    const SERVER_QUERY = `query($id: Int!) { worldData { server(id: $id) { slug region { slug } } } }`;
    try {
      const data = await this.query<{ worldData: { server?: { slug?: string; region?: { slug?: string } } } }>(SERVER_QUERY, { id: serverId });
      const srv = data.worldData.server ?? {};
      const result: [string, string] = [(srv.slug ?? '').toLowerCase(), ((srv.region?.slug) ?? '').toLowerCase()];
      this._serverSlugCache.set(serverId, result);
      return result;
    } catch {
      this._serverSlugCache.set(serverId, ['', '']);
      return ['', ''];
    }
  }
}

// ── GraphQL queries ───────────────────────────────────────────────────────────

const ENCOUNTERS_QUERY = `
query {
  worldData {
    expansions {
      id name
      zones {
        id name
        partitions { id name }
        encounters { id name }
      }
    }
  }
}`;

const RANKINGS_QUERY = `
query($encounterID: Int!, $className: String!, $specName: String!, $partition: Int) {
  worldData {
    encounter(id: $encounterID) {
      name
      characterRankings(className: $className specName: $specName metric: dps includeCombatantInfo: true partition: $partition)
    }
  }
}`;

const REPORT_META_Q = `
  query($code: String!) {
    reportData { report(code: $code) {
      fights(killType: Kills) { id startTime endTime encounterID }
      masterData { actors { id name type subType gameID } }
    }}
  }`;

// ── Encounter fetching ────────────────────────────────────────────────────────

export async function getEncounters(wcl: WCLClient): Promise<IngestEncounter[]> {
  const data = await wcl.query<{ worldData: { expansions: WclExpansion[] } }>(ENCOUNTERS_QUERY);
  const expansions = data.worldData.expansions;

  const result: IngestEncounter[] = [];
  const firstExp = expansions[0];
  if (!firstExp) return result;

  for (const zone of (firstExp.zones ?? [])) {
    const lname = zone.name.toLowerCase();
    if (EXCLUDE_ZONE_PATTERNS.some(p => lname.includes(p))) continue;
    // Sort partition IDs descending (highest = newest first) so we try the
    // most recent patch partition first and fall back to older ones when the
    // new partition is empty (e.g. right after a patch drops).
    const partitionIds = (zone.partitions ?? [])
      .map(p => p.id)
      .sort((a, b) => b - a);
    for (const enc of (zone.encounters ?? [])) {
      result.push({ id: enc.id, name: enc.name, zone: zone.name, expansion: firstExp.name, partitionIds });
    }
  }
  return result;
}

// ── Gear extraction ───────────────────────────────────────────────────────────

const TRINKET_INDICES = new Set([12, 13]);

// Trinkets (gear slots 12/13) and permanent enchants. Gear shape is identical
// across both ranking APIs, so this is shared.
function extractGear(rankingEntry: WclRawRanking): {
  trinkets: Array<{ slot: number; id: number | string; name: string }>;
  enchants: Array<{ slot: number; id: number | string; name: string }>;
} {
  const gear = rankingEntry.gear ?? [];
  const trinkets: Array<{ slot: number; id: number | string; name: string }> = [];
  const enchants: Array<{ slot: number; id: number | string; name: string }> = [];
  for (let idx = 0; idx < gear.length; idx++) {
    const item = gear[idx];
    if (!item || !item.id) continue;
    const itemId = typeof item.id === 'number' ? item.id : (parseInt(String(item.id)) || item.id);
    const name = item.name ?? '';

    if (TRINKET_INDICES.has(idx)) {
      trinkets.push({ slot: idx, id: itemId, name });
    }

    const encRaw = item.permanentEnchant;
    if (encRaw) {
      const encId = typeof encRaw === 'number' ? encRaw : (parseInt(String(encRaw)) || encRaw);
      enchants.push({ slot: idx, id: encId, name: item.permanentEnchantName ?? '' });
    }
  }
  return { trinkets, enchants };
}

// ── Rankings fetching ─────────────────────────────────────────────────────────

// Cheap rankings fetch: 1 API query. Returns raw ranking objects with an
// additional `_raw` field so the caller can extract gear later.
// Server slug resolution deferred to enrichRanking(); talent key from analyzeParse().
export async function fetchRankingsLite(wcl: WCLClient, spec: string, encounterId: number, count = 10, partitionIds: number[] = []): Promise<ParseRanking[]> {
  const mapping = SPEC_TO_WCL[spec];
  if (!mapping) throw new Error(`Unknown spec: ${spec}`);
  const [className, specName] = mapping;

  // Try partitions newest-first; fall back to null (current) when zone has none.
  const attempts: Array<number | null> = partitionIds.length > 0 ? partitionIds : [null];
  let rawRankings: WclRawRanking[] = [];
  for (const partition of attempts) {
    const vars: Record<string, unknown> = { encounterID: encounterId, className, specName };
    if (partition != null) vars['partition'] = partition;
    const data = await wcl.query<{ worldData: { encounter: { name: string; characterRankings: string | { rankings: WclRawRanking[] } } } }>(RANKINGS_QUERY, vars);
    const enc = data.worldData.encounter;
    const raw = enc.characterRankings;
    const rankingsData = typeof raw === 'string' ? JSON.parse(raw) as { rankings: WclRawRanking[] } : raw;
    // Filter anonymous parses (report: null) before slicing - the full page is
    // already in the response, so this costs zero extra queries and ensures we
    // always get TOP_N public (fetchable) parses rather than wasting a slot on
    // a parse we can never access.
    rawRankings = (rankingsData.rankings ?? []).filter(r => r.report?.code).slice(0, count);
    if (rawRankings.length > 0) break;
  }

  return rawRankings.map((r, i) => ({
    rank: i + 1,
    player: r.name ?? '',
    amount: Math.round(r.amount ?? 0),
    duration_s: Math.round((r.duration ?? 0) / 100) / 10,
    report_code: r.report?.code ?? '',
    fight_id: r.report?.fightID ?? 0,
    server: r.server?.name ?? '',
    _raw: r, // kept for enrichRanking(); not persisted
  }));
}

// Per-player enrichment: resolves server slug (1 query, in-memory cached per server).
export async function enrichRanking(wcl: WCLClient, ranking: ParseRanking): Promise<EnrichedRanking> {
  const r = ranking._raw;
  const sid = r.server?.id;
  const [serverSlug, serverRegion] = sid ? await wcl.resolveServerSlug(sid) : ['', ''];
  return {
    server_slug: serverSlug,
    server_region: serverRegion,
    combatant_info: { talent_key: '', ...extractGear(r) },
  };
}

// ── Per-parse event fetching ───────────────────────────────────────────────────

// Fetches all event streams for one parse and returns them as a ParseEventBundle
// for the pure analyzer. Returns null on the failure paths the ingest loop treats
// as "skip this parse" (missing report/fight, event-fetch error). Throws only when
// the player is genuinely absent from the report (a data integrity error).
export async function fetchParseEvents(
  wcl: WCLClient, reportCode: string, fightId: number, playerName: string,
): Promise<ParseEventBundle | null> {
  let meta: { reportData: { report: { fights: WclFightEntry[]; masterData: { actors: WclActorEntry[] } } } };
  try {
    meta = await wcl.query(REPORT_META_Q, { code: reportCode });
  } catch {
    return null;
  }

  const report = meta.reportData.report;
  const fight = report.fights.find(f => f.id === fightId);
  if (!fight) return null;

  const actors = report.masterData.actors;
  const player = actors.find(a => a.name === playerName && a.type === 'Player');
  if (!player) throw new Error(`Player "${playerName}" not found in report ${reportCode} (fight ${fightId}).`);
  // Enemy actor lookup (by actor id) for position timelines, keyed later by gameID.
  const npcById = new Map<number, WclActorEntry>(actors.filter(a => a.type !== 'Player').map(a => [a.id, a]));

  const start = fight.startTime;
  const end = fight.endTime;
  const fightDurS = (end - start) / 1000;

  // Fetch all event types in parallel. Positions ride along on the (smaller)
  // Casts streams via includeResources, keeping the dense damage streams plain.
  let castEvents: WclResourceEvent[], buffEvents: WclResourceEvent[], damageEvents: WclResourceEvent[],
    damageTakenEvents: WclResourceEvent[], enemyCastEvents: WclResourceEvent[], combatantEvents: WclCombatantInfoEvent[];
  try {
    const results = await Promise.all([
      wcl.getAllEvents(reportCode, fightId, 'Casts',         start, end, { sourceId: player.id, includeResources: true }),
      wcl.getAllEvents(reportCode, fightId, 'Buffs',         start, end, { targetId: player.id }),
      wcl.getAllEvents(reportCode, fightId, 'DamageDone',    start, end, { sourceId: player.id }),
      wcl.getAllEvents(reportCode, fightId, 'DamageTaken',   start, end, { sourceId: player.id }),
      wcl.getAllEvents(reportCode, fightId, 'Casts',         start, end, { includeResources: true, hostilityType: 'Enemies' }).catch((): WclResourceEvent[] => []),
      wcl.getAllEvents(reportCode, fightId, 'CombatantInfo', start, end, { sourceId: player.id }).catch((): WclResourceEvent[] => []),
    ]);
    castEvents = results[0];
    buffEvents = results[1];
    damageEvents = results[2];
    damageTakenEvents = results[3];
    enemyCastEvents = results[4];
    combatantEvents = results[5] as unknown as WclCombatantInfoEvent[];
  } catch {
    return null;
  }

  // Dense boss positions from a single targeted stream (boss auto-attacks),
  // identified as the highest-maxHitPoints enemy in the enemy cast snapshots.
  let bossDamageEvents: WclResourceEvent[] = [];
  const bossActorId = pickBossActorId(enemyCastEvents, npcById);
  if (bossActorId != null) {
    bossDamageEvents = await wcl
      .getAllEvents(reportCode, fightId, 'DamageDone', start, end, { sourceId: bossActorId, includeResources: true })
      .catch((): WclResourceEvent[] => []);
  }

  return {
    report_code: reportCode, fight_id: fightId, player, npcById, start, end, fightDurS,
    castEvents, buffEvents, damageEvents, damageTakenEvents, enemyCastEvents, combatantEvents, bossDamageEvents,
  };
}

// ── Enchant name resolution ─────────────────────────────────────────────────────

// Batch-resolves enchant display names via WCL `gameData.enchant(id)`, using
// GraphQL field aliases so all IDs are fetched in one round-trip. Returns an
// id->name map (only ids that resolved to a non-empty name are present). Silently
// returns an empty/partial map if the API does not support the query for some ids.
export async function batchResolveEnchants(wcl: WCLClient, ids: Array<number | string>): Promise<Map<number | string, string>> {
  const names = new Map<number | string, string>();
  if (!ids.length) return names;

  const aliases = ids
    .map(id => `e${id}: enchant(id: ${id}) { id name }`)
    .join('\n    ');
  const query = `query { gameData { ${aliases} } }`;

  try {
    const result = await wcl.query<{ gameData: Record<string, { id: number; name: string } | null | undefined> }>(query);
    const gameData = result.gameData ?? {};
    for (const id of ids) {
      const name = (gameData[`e${id}`]?.name ?? '').trim();
      if (name) names.set(id, name);
    }
  } catch {
    // gameData.enchant may not be available for all enchant IDs; keep empty names.
  }
  return names;
}
