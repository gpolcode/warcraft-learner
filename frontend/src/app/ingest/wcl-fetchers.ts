// Accepts a `WclQueryClient` so tests can inject a fake; best-effort failures are logged via `logWarn`, never swallowed.

import { logWarn } from '../core/log';
import { countRecentParses, toParseRankings, unwrapRankings } from '../shared/analysis/wcl-projections';
import { ENCOUNTERS_Q, RANKINGS_Q } from '../core/services/wcl-queries';
import type {
  EncountersQuery, RankingsQuery, RankingsQueryVariables,
} from '../core/services/wcl-operations.generated';
import { MYTHIC_DIFFICULTY, type ParseRanking } from '../core/models/wcl.models';
import { BudgetExceededError, type WclQueryClient } from './wcl-client';
import { filterEncounters, groupEncountersByZone, type SpecWclMap } from './wcl-mappers';
import type { IngestEncounter } from './models/wcl.models';
import type { CurrentRaid } from '../core/models/encounter.models';

// One raid lockout: a raid being progressed posts parses every week, and a beta/PTR/test zone posts none.
const ACTIVE_WINDOW_S = 7 * 24 * 60 * 60;
// Raids shipped together land within days; the previous tier was adopted a patch cycle ago, so a newcomer retires it.
const RELEASE_WAVE_S = 30 * 24 * 60 * 60;
// A genuinely live raid has many real parses for any of these; a beta/PTR/test zone has none.
const PROBE_SPECS = ['FireMage', 'RetributionPaladin', 'FuryWarrior'];
// >=1 is unsafe: a single recent parse on a test boss would promote it; a raid being progressed clears this easily.
const ACTIVE_PARSES_THRESHOLD = 3;
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
  zones: CurrentRaid[];
  /** The one transition allowed to delete a retired raid. */
  reset: boolean;
}

// BudgetExceeded propagates (a clean stop); other per-spec probe errors are logged as zero so one flaky spec can't sink a live zone.
async function probeRecentCount(
  client: WclQueryClient, probeSpec: string, encounter: IngestEncounter, specWcl: SpecWclMap, difficulty: number, sinceS: number,
): Promise<number> {
  try {
    const ranked = await getRankingsLite(client, probeSpec, encounter.id, specWcl, PROBE_COUNT, encounter.partitionIds, difficulty);
    return countRecentParses(ranked, sinceS);
  } catch (err) {
    if (err instanceof BudgetExceededError) throw err;
    logWarn(`getEncounters probe ${encounter.name} (${probeSpec})`, err);
    return 0;
  }
}

async function isZoneActive(
  client: WclQueryClient, zoneEncounters: IngestEncounter[], specWcl: SpecWclMap, sinceS: number,
): Promise<boolean> {
  const probeEncounter = zoneEncounters[0];
  if (!probeEncounter) return false;
  let recent = 0;
  for (const probeSpec of PROBE_SPECS) {
    await client.assertBudget(PROBE_BUDGET_MARGIN);
    for (const difficulty of PROBE_DIFFICULTIES) {
      recent += await probeRecentCount(client, probeSpec, probeEncounter, specWcl, difficulty, sinceS);
      if (recent >= ACTIVE_PARSES_THRESHOLD) return true;
    }
  }
  return false;
}

/** Older zones are never probed: WCL leaves a finished tier non-frozen, and its newest partition makes even that tier's parses look current, so only the zone ordering separates it from a new raid. */
async function adoptableZones(
  client: WclQueryClient, byZone: Map<number, IngestEncounter[]>, watermark: number | null, specWcl: SpecWclMap, nowS: number,
): Promise<IngestEncounter[][]> {
  const adopted: IngestEncounter[][] = [];
  const newer = [...byZone.entries()]
    .filter(([zoneId]) => watermark == null || zoneId > watermark)
    .sort(([a], [b]) => b - a);
  for (const [, zoneEncounters] of newer) {
    if (!await isZoneActive(client, zoneEncounters, specWcl, nowS - ACTIVE_WINDOW_S)) continue;
    adopted.push(zoneEncounters);
    // Without a watermark every zone reads as new, so anything past the newest live one would be the tiers behind it.
    if (watermark == null) break;
  }
  return adopted;
}

function raidOf(zoneEncounters: IngestEncounter[], adoptedAtS: number): CurrentRaid {
  return { zone_id: zoneEncounters[0]?.zoneId ?? 0, zone_name: zoneEncounters[0]?.zone ?? '', adopted_at_s: adoptedAtS };
}

/** Every recorded raid stays current until WCL freezes its zone or a raid from a later release wave takes over. */
export async function getEncounters(
  client: WclQueryClient, specWcl: SpecWclMap, recorded: CurrentRaid[], nowS: number,
): Promise<CurrentContent> {
  const data = await client.query<EncountersQuery>(ENCOUNTERS_Q);
  // An empty expansion tree would silently protect no encounter and publish an empty summary.
  if (!data.worldData?.expansions) throw new Error('WCL returned no worldData.expansions.');
  const byZone = groupEncountersByZone(filterEncounters(data.worldData.expansions));

  const live = recorded.filter(raid => byZone.has(raid.zone_id));
  for (const raid of recorded.filter(entry => !byZone.has(entry.zone_id))) {
    logWarn('getEncounters', `recorded raid "${raid.zone_name}" (zone ${raid.zone_id}) is frozen or gone - retiring it and pruning its data`);
  }
  const watermark = live.length ? Math.max(...live.map(raid => raid.zone_id)) : null;
  const adopted = await adoptableZones(client, byZone, watermark, specWcl, nowS);

  const kept = adopted.length
    ? live.filter(raid => raid.adopted_at_s > nowS - RELEASE_WAVE_S)
    : live;
  for (const raid of live.filter(entry => !kept.includes(entry))) {
    logWarn('getEncounters', `recorded raid "${raid.zone_name}" belongs to an earlier release wave - retiring it and pruning its data`);
  }

  const zones = [...adopted.map(zoneEncounters => raidOf(zoneEncounters, nowS)), ...kept]
    .sort((a, b) => b.zone_id - a.zone_id);
  const encounters = zones.flatMap(raid => byZone.get(raid.zone_id) ?? []);
  return {
    encounters,
    protectedIds: new Set(encounters.map(encounter => encounter.id)),
    zones,
    reset: adopted.length > 0 || kept.length !== recorded.length,
  };
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
