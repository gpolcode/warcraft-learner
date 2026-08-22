// Accepts a `WclQueryClient` so tests can inject a fake; best-effort failures are logged via `logWarn`, never swallowed.

import { logWarn } from '../core/log';
import { toParseRankings, unwrapRankings } from '../shared/analysis/wcl-projections';
import { ENCOUNTERS_Q, RANKINGS_Q } from '../core/services/wcl-queries';
import type {
  EncountersQuery, RankingsQuery, RankingsQueryVariables,
} from '../core/services/wcl-operations.generated';
import { MYTHIC_DIFFICULTY, type ParseRanking } from '../core/models/wcl.models';
import { BudgetExceededError, type WclQueryClient } from './wcl-client';
import {
  filterEncounters, groupEncountersByZone, protectedEncounterIds, type SpecWclMap, type WclExpansions,
} from './wcl-mappers';
import type { IngestEncounter } from './models/wcl.models';

// A genuinely live raid has many real parses for any of these; a beta/PTR/test zone has none.
const PROBE_SPECS = ['FireMage', 'RetributionPaladin', 'FuryWarrior'];
// >=1 is unsafe: a single non-anon parse on a test boss would promote it; a real raid clears this easily.
const LIVE_RANKINGS_THRESHOLD = 3;
const PROBE_COUNT = 10;
const PROBE_BUDGET_MARGIN = 500;
const HEROIC_DIFFICULTY = 4;
const NORMAL_DIFFICULTY = 3;
// A raid is open for days before its first Mythic kills land, so a Mythic-only probe would read a just-opened raid as dead.
const PROBE_DIFFICULTIES = [MYTHIC_DIFFICULTY, HEROIC_DIFFICULTY, NORMAL_DIFFICULTY];

export interface CurrentContent {
  /** Empty leaves the dataset untouched. */
  encounters: IngestEncounter[];
  protectedIds: Set<number>;
  zone: { id: number; name: string } | null;
  /** The one transition allowed to delete the previous tier. */
  reset: boolean;
}

// BudgetExceeded propagates (a clean stop); other per-spec probe errors are logged as zero so one flaky spec can't sink a live zone.
async function probeRankingCount(
  client: WclQueryClient, probeSpec: string, encounter: IngestEncounter, specWcl: SpecWclMap, difficulty: number,
): Promise<number> {
  try {
    const ranked = await getRankingsLite(client, probeSpec, encounter.id, specWcl, PROBE_COUNT, encounter.partitionIds, difficulty);
    return ranked.length;
  } catch (err) {
    if (err instanceof BudgetExceededError) throw err;
    logWarn(`getEncounters probe ${encounter.name} (${probeSpec})`, err);
    return 0;
  }
}

async function isZoneLive(client: WclQueryClient, zoneEncounters: IngestEncounter[], specWcl: SpecWclMap): Promise<boolean> {
  const probeEncounter = zoneEncounters[0];
  if (!probeEncounter) return false;
  let realCount = 0;
  for (const probeSpec of PROBE_SPECS) {
    await client.assertBudget(PROBE_BUDGET_MARGIN);
    for (const difficulty of PROBE_DIFFICULTIES) {
      realCount += await probeRankingCount(client, probeSpec, probeEncounter, specWcl, difficulty);
      if (realCount >= LIVE_RANKINGS_THRESHOLD) return true;
    }
  }
  return false;
}

// A probe answers from live WCL every run, so re-deciding the raid from scratch lets one failed probe read as a tier flip and delete the dataset.
async function findNewerLiveZone(
  client: WclQueryClient, zonesNewestFirst: IngestEncounter[][], specWcl: SpecWclMap, storedZoneId: number | null,
): Promise<IngestEncounter[] | null> {
  for (const zoneEncounters of zonesNewestFirst) {
    const zoneId = zoneEncounters[0]?.zoneId ?? 0;
    if (storedZoneId != null && zoneId <= storedZoneId) return null;
    if (await isZoneLive(client, zoneEncounters, specWcl)) return zoneEncounters;
    logWarn('getEncounters', `zone "${zoneEncounters[0]?.zone}" dropped as non-live (no real rankings) - skipping ${zoneEncounters.length} encounter(s)`);
  }
  return null;
}

function contentFor(expansions: WclExpansions, encounters: IngestEncounter[], reset: boolean): CurrentContent {
  const first = encounters[0];
  return {
    encounters,
    protectedIds: protectedEncounterIds(expansions, first?.zoneId ?? null),
    zone: first ? { id: first.zoneId, name: first.zone } : null,
    reset,
  };
}

/** A null `storedZoneId` re-probes from the newest zone and resets the dataset. */
export async function getEncounters(
  client: WclQueryClient, specWcl: SpecWclMap, storedZoneId: number | null,
): Promise<CurrentContent> {
  const data = await client.query<EncountersQuery>(ENCOUNTERS_Q);
  // An empty expansion tree would silently protect no encounter and publish an empty summary.
  if (!data.worldData?.expansions) throw new Error('WCL returned no worldData.expansions.');
  const expansions = data.worldData.expansions;
  const byZone = groupEncountersByZone(filterEncounters(expansions));
  const zonesNewestFirst = [...byZone.values()].sort((a, b) => (b[0]?.zoneId ?? 0) - (a[0]?.zoneId ?? 0));

  const newer = await findNewerLiveZone(client, zonesNewestFirst, specWcl, storedZoneId);
  if (newer) return contentFor(expansions, newer, true);

  const stored = storedZoneId != null ? byZone.get(storedZoneId) : undefined;
  if (stored) return contentFor(expansions, stored, false);
  if (storedZoneId != null) {
    logWarn('getEncounters', `recorded raid zone ${storedZoneId} is gone from the current expansion - leaving the dataset untouched`);
  }
  return { encounters: [], protectedIds: protectedEncounterIds(expansions, null), zone: null, reset: false };
}

/** Newest-first, since a fresh patch's partition carries the current parses; it reports which one answered because the signature, the transforms and the liveness probe have to read the same one, and a patch rolling the default over to a still-empty partition is where they would otherwise diverge. */
export async function rankingsFromPartition<T>(
  partitionIds: number[], fetch: (partition: number | null) => Promise<T[]>,
): Promise<{ rows: T[]; partition: number | null }> {
  for (const partition of (partitionIds.length ? partitionIds : [null])) {
    const rows = await fetch(partition);
    if (rows.length) return { rows, partition };
  }
  return { rows: [], partition: null };
}

export async function getRankingsLite(
  client: WclQueryClient, spec: string, encounterId: number, specWcl: SpecWclMap, count: number, partitionIds: number[], difficulty: number,
): Promise<ParseRanking[]> {
  const mapping = specWcl[spec];
  if (!mapping) throw new Error(`Unknown spec: ${spec}`);
  const [className, specName] = mapping;

  const { rows } = await rankingsFromPartition(partitionIds, async partition => {
    const variables: RankingsQueryVariables = { encounterID: encounterId, className, specName, difficulty };
    if (partition != null) variables.partition = partition;
    const data = await client.query<RankingsQuery>(RANKINGS_Q, variables);
    return toParseRankings(unwrapRankings(data.worldData?.encounter?.characterRankings), count);
  });
  return rows;
}
