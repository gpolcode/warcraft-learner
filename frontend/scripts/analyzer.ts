/**
 * warcraft-learner - Transform layer (pure analysis)
 *
 * Pure analytical functions for the ingestion pipeline. Nothing here performs
 * network or filesystem I/O: every function takes already-fetched raw event
 * interfaces (or already-read parse samples) and returns typed result objects.
 * The Extract layer (wcl-client.ts) supplies the raw events; the Load layer
 * (storage.ts) persists what these functions compute.
 */

import * as ss from 'simple-statistics';
import { BLOODLUST_IDS } from '../src/app/core/analysis/format.ts';
import { talentKeyFromTree } from '../src/app/core/services/wcl-mappers.ts';
import type { RulebookCooldown, RulebookDefensive } from '../src/app/core/models/rulebook.models.ts';
import type { ParsePositions } from '../src/app/core/models/positioning.models.ts';
import type {
  HoldWindow, CdCastSummary, DefensiveCastSummary,
  RawBurstWindowAbility, RawBurstWindow,
  RawDefensiveWindowAbility, RawDefensiveWindow,
  ParseCooldownData, ParseSample,
} from './parse-sample.models.ts';
import type {
  WclResourceEvent, WclActorEntry, EnrichedRanking, ParseEventBundle,
} from './wcl-client.ts';

// Aggregation thresholds (fractions of the sample/member count). Mirrored in
// CLAUDE.md's "Analysis thresholds" section - keep the two in sync.
const CLUSTER_MIN_FRAC = 0.35;      // min cluster size to surface a burst/defensive window
const HOLD_TRIGGER_FRAC = 0.4;      // min parsers holding at a cast index to emit a hold target
const MEMBER_MAJORITY_FRAC = 0.5;   // "more than half the member parses" (ability inclusion, majority hold)

// ── Result types ──────────────────────────────────────────────────────────────

// Shared base for clustered windows (written to encounters/{enc_id}.json).
export interface ClusterBaseStats {
  time_s: number;
  stddev_s: number;
  count: number;
  total_samples: number;
  dmg_avg: number;
  dmg_stddev: number;
  dmg_min: number;
  dmg_max: number;
  ability_breakdown: Array<{
    spell_id: number;
    avg_damage: number;
    min_damage: number;
    max_damage: number;
    count: number;
    avg_casts?: number;
  }>;
  ref_game_id: number | null;
}

export interface ClusteredBurstWindow extends ClusterBaseStats {
  common_cds: string[];
  avg_targets: number;
  window_length_s: number;
}

export interface ClusteredDefensiveWindow extends ClusterBaseStats {
  defensive_name: string;
  spell_id: number;
  common_defensives: string[];
  common_cds: string[];
  window_length_s: number;
}

// Shared entry shape for buildBaseBenchmark.
export interface BenchEntry {
  first_cast_s: number | null;
  cast_times_s: number[];
  fight_duration_s: number;
  hold_windows: HoldWindow[];
  cast_pattern: string;
}

export interface BaseBenchmark {
  sample_count: number;
  avg_first_cast_s: number;
  stddev_first_cast_s: number;
  avg_gap_s: number | null;
  stddev_gap_s: number | null;
  hold_targets: Record<string, { target_s: number; stddev_s: number; count: number; total_samples: number }>;
  avg_uses: number;
  avg_uses_per_min: number;
  uses_per_min: { avg: number; stddev: number; min: number; max: number } | Record<string, never>;
  majority_hold: boolean;
}

export interface GearStats {
  sample_count: number;
  talent_builds: Array<{ key: string; count: number; pct: number; report_code?: string; fight_id?: number; player_name?: string }>;
  trinkets: Record<string, Array<{ id: number | string; name: string; count: number; pct: number }>>;
  enchants: Record<string, Array<{ id: number | string; name: string; count: number; pct: number }>>;
}

export interface EncounterBench {
  spec: string;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  avg_duration_s: number;
  downtime_threshold_ms: number;
  top_avg_efficiency: number;
  top_efficiency_stddev: number;
  per_cd_benchmarks: Record<string, BaseBenchmark & { avg_bl_offset_s: number | null; stddev_bl_offset_s: number | null; bl_pct: number }>;
  burst_windows: ClusteredBurstWindow[];
  gear: GearStats;
  top_defensives_summary: Array<{ name: string; spell_id: number; avg_uses: number; min_uses: number; max_uses: number; sample_count: number }>;
  per_defensive_benchmarks: Record<string, BaseBenchmark>;
  defensive_windows: ClusteredDefensiveWindow[];
}

// Position sample before resampling.
interface RawPosSample {
  t: number;
  x: number;
  y: number;
  facing: number | null;
  mapID: number | null;
  maxHp: number;
}

interface EnemyWithSamples {
  actorId: number;
  count: number;
  maxHp: number;
  samples: RawPosSample[];
  meta: WclActorEntry;
}

// ── Burst window analysis ─────────────────────────────────────────────────────

export function findBurstWindows(
  damageEvents: WclResourceEvent[], fightStartMs: number,
  cdSummary: CdCastSummary[], specCds: RulebookCooldown[],
  minPctThreshold = 0.03, castEvents: WclResourceEvent[] = [],
): RawBurstWindow[] {
  const hits = damageEvents
    .filter(e => e.type === 'damage' && (e.amount ?? 0) + (e.absorbed ?? 0) > 0)
    .map(e => [e.timestamp, (e.amount ?? 0) + (e.absorbed ?? 0), e.targetID ?? 0, e.abilityGameID ?? 0] as [number, number, number, number])
    .sort((a, b) => a[0] - b[0]);

  // Cast timestamps per ability - used to count player casts inside each window.
  const casts = castEvents
    .filter(e => e.type === 'cast' && e.abilityGameID)
    .map(e => [e.timestamp, e.abilityGameID!] as [number, number]);

  if (!hits.length) return [];
  const total = hits.reduce((s, h) => s + h[1], 0);
  if (!total) return [];

  // Build windows from CD cast times x CD durations
  const rawWins: Array<{ startS: number; endS: number; cdNames: string[] }> = [];
  for (const cdEntry of cdSummary) {
    const cdDef = specCds.find(c => c.name === cdEntry.name);
    const dur = cdDef?.duration ?? 0;
    if (dur <= 0) continue;
    for (const castS of (cdEntry.cast_times_s ?? [])) {
      rawWins.push({ startS: castS, endS: castS + dur, cdNames: [cdEntry.name] });
    }
  }
  if (!rawWins.length) return [];

  // Merge overlapping or near-adjacent windows (<= 3s gap)
  rawWins.sort((a, b) => a.startS - b.startS);
  const merged: Array<{ startS: number; endS: number; cdNames: string[] }> = [{ ...rawWins[0], cdNames: [...rawWins[0].cdNames] }];
  for (let i = 1; i < rawWins.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = rawWins[i];
    if (cur.startS <= prev.endS + 3) {
      prev.endS = Math.max(prev.endS, cur.endS);
      for (const n of cur.cdNames) { if (!prev.cdNames.includes(n)) prev.cdNames.push(n); }
    } else {
      merged.push({ ...cur, cdNames: [...cur.cdNames] });
    }
  }

  const result: RawBurstWindow[] = [];
  for (const win of merged) {
    const startMs = fightStartMs + win.startS * 1000;
    const endMs = fightStartMs + win.endS * 1000;
    const windowHits = hits.filter(h => h[0] >= startMs && h[0] <= endMs);
    const windowDmg = windowHits.reduce((s, h) => s + h[1], 0);
    if (!windowDmg || windowDmg / total < minPctThreshold) continue;

    const abilityDmg = new Map<number, number>();
    for (const [, dmg, , aid] of windowHits) {
      if (aid) abilityDmg.set(aid, (abilityDmg.get(aid) ?? 0) + dmg);
    }
    // Count casts per ability inside the window (boundary matches damage hits: [start, end]).
    const abilityCasts = new Map<number, number>();
    for (const [ts, aid] of casts) {
      if (ts >= startMs && ts <= endMs) abilityCasts.set(aid, (abilityCasts.get(aid) ?? 0) + 1);
    }
    const topAbilities: RawBurstWindowAbility[] = [...abilityDmg.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([sid, d]) => ({ spell_id: sid, damage: d, pct: Math.round(d / windowDmg * 1000) / 1000, casts: abilityCasts.get(sid) ?? 0 }));

    result.push({
      time_s: Math.round(win.startS * 10) / 10,
      window_length_s: Math.round((win.endS - win.startS) * 10) / 10,
      pct_of_total: Math.round(windowDmg / total * 1000) / 1000,
      window_damage: windowDmg,
      total_damage: total,
      ability_breakdown: topAbilities,
      active_cds: win.cdNames,
      target_count: 1,
    });
  }
  return result.sort((a, b) => a.time_s - b.time_s);
}

export function findDefensiveWindows(
  damageTakenEvents: WclResourceEvent[], fightStartMs: number,
  buffWindows: Map<number, Array<[number, number | null]>>,
  specDefensives: RulebookDefensive[],
  npcById: Map<number, WclActorEntry>,
): RawDefensiveWindow[] {
  const hits = damageTakenEvents
    .filter(e => e.type === 'damage' && (e.amount ?? 0) + (e.absorbed ?? 0) > 0)
    .map(e => [e.timestamp, (e.amount ?? 0) + (e.absorbed ?? 0), e.abilityGameID ?? 0, e.sourceID ?? null] as [number, number, number, number | null])
    .sort((a, b) => a[0] - b[0]);

  if (!hits.length) return [];
  const total = hits.reduce((s, h) => s + h[1], 0);
  if (!total) return [];

  const result: RawDefensiveWindow[] = [];

  for (const defn of specDefensives) {
    const sid = defn.spell_id;
    const dur = defn.duration ?? 5;

    for (const bw of (buffWindows.get(sid) ?? [])) {
      // buffWindows store relative-seconds from fight start
      const startS = bw[0];
      const endS = bw[1] != null ? bw[1] : startS + dur;
      const startMs = fightStartMs + startS * 1000;
      const endMs = fightStartMs + endS * 1000;

      const windowHits = hits.filter(h => h[0] >= startMs && h[0] <= endMs);
      const windowDmg = windowHits.reduce((s, h) => s + h[1], 0);
      const pct = total ? Math.round(windowDmg / total * 1000) / 1000 : 0;

      const abilityDmg = new Map<number, number>();
      for (const [, dmg, aid] of windowHits) {
        if (aid) abilityDmg.set(aid, (abilityDmg.get(aid) ?? 0) + dmg);
      }
      const topAbilities: RawDefensiveWindowAbility[] = [...abilityDmg.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([abilityId, d]) => ({
          spell_id: abilityId,
          damage: d,
          pct: windowDmg ? Math.round(d / windowDmg * 1000) / 1000 : 0,
        }));

      // Reference for the map = the enemy that dealt the most damage in the window.
      const dmgBySource = new Map<number, number>();
      for (const [, dmg, , src] of windowHits) {
        if (src != null && npcById.has(src)) dmgBySource.set(src, (dmgBySource.get(src) ?? 0) + dmg);
      }
      const topSource = [...dmgBySource.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const refGameId = topSource != null ? (npcById.get(topSource)?.gameID ?? null) : null;

      result.push({
        time_s: Math.round(startS * 10) / 10,
        window_length_s: Math.round((endS - startS) * 10) / 10,
        pct_of_total: pct,
        window_damage: windowDmg,
        total_damage: total,
        ability_breakdown: topAbilities,
        active_cds: [defn.name],
        defensive_name: defn.name,
        spell_id: sid,
        ref_game_id: refGameId ?? null,
      });
    }
  }

  return result.sort((a, b) => a.time_s - b.time_s);
}

// Defensive windows cluster per-defensive first (so Cloak at 1:00 and Feint at 1:00
// remain separate clusters), then by time within each defensive group.
export function clusterDefensiveWindows(windows: RawDefensiveWindow[], totalSamples: number, mergeS = 20.0): ClusteredDefensiveWindow[] {
  if (!windows.length) return [];
  const byDefensive = new Map<string, RawDefensiveWindow[]>();
  for (const w of windows) {
    const name = w.defensive_name || w.active_cds?.[0] || '';
    if (!byDefensive.has(name)) byDefensive.set(name, []);
    byDefensive.get(name)!.push(w);
  }
  const result: ClusteredDefensiveWindow[] = [];
  for (const [defensiveName, defWindows] of byDefensive.entries()) {
    for (const cl of groupByTime(defWindows, mergeS)) {
      if (cl.length < Math.max(2, totalSamples * CLUSTER_MIN_FRAC)) continue;
      const base = clusterBaseStats(cl, totalSamples);
      result.push({
        ...base,
        window_length_s: round(mean(cl.map(c => c.window_length_s))),
        defensive_name: defensiveName,
        spell_id: cl[0].spell_id,
        common_defensives: [defensiveName],
        common_cds: [defensiveName],
      });
    }
  }
  return result.sort((a, b) => a.time_s - b.time_s);
}

// ── Position timelines ───────────────────────────────────────────────────────
// Positions come from events fetched with includeResources:true, which flattens
// one actor's snapshot onto the event (top-level x/y/facing/mapID); resourceActor
// says whose (1 = source, 2 = target). x/y are hundredths of a yard, facing
// milliradians - stored raw here and scaled by the frontend (positioning-core).

export const POSITIONS_INTERVAL_S = 1.5;
const MAX_TRACKED_ENEMIES = 5;
const MIN_ENEMY_SAMPLES = 4;

function posActorId(e: WclResourceEvent): number | null {
  if (typeof e.x !== 'number' || typeof e.y !== 'number') return null;
  return e.resourceActor === 2 ? (e.targetID ?? null) : (e.sourceID ?? null);
}

/** Boss actor id = the NPC with the highest maxHitPoints across resource snapshots. */
export function pickBossActorId(events: WclResourceEvent[], npcById: Map<number, WclActorEntry>): number | null {
  const maxHp = new Map<number, number>();
  for (const e of events) {
    const id = posActorId(e);
    if (id == null || !npcById.has(id)) continue;
    const hp = typeof e.maxHitPoints === 'number' ? e.maxHitPoints : 0;
    if (hp > (maxHp.get(id) ?? -1)) maxHp.set(id, hp);
  }
  let bossId: number | null = null, best = -1;
  for (const [id, hp] of maxHp) if (hp > best) { best = hp; bossId = id; }
  return bossId;
}

/** Group raw position samples per actor id from resource-bearing events. */
function collectPositionSamples(events: WclResourceEvent[], fightStartMs: number): Map<number, RawPosSample[]> {
  const byActor = new Map<number, RawPosSample[]>();
  for (const e of events) {
    const id = posActorId(e);
    if (id == null) continue;
    let arr = byActor.get(id);
    if (!arr) { arr = []; byActor.set(id, arr); }
    arr.push({
      t: (e.timestamp - fightStartMs) / 1000,
      x: e.x!, y: e.y!,
      facing: typeof e.facing === 'number' ? e.facing : null,
      mapID: typeof e.mapID === 'number' ? e.mapID : null,
      maxHp: typeof e.maxHitPoints === 'number' ? e.maxHitPoints : 0,
    });
  }
  for (const arr of byActor.values()) arr.sort((a, b) => a.t - b.t);
  return byActor;
}

/** Resample to a fixed cadence: [t, x, y, facing, mapID] rows, linear for x/y, nearest for facing/mapID. */
function resampleTimeline(samples: RawPosSample[], durationS: number, intervalS: number): ParsePositions['player'] {
  if (!samples.length) return [];
  const first = samples[0].t, last = samples[samples.length - 1].t;
  const out: ParsePositions['player'] = [];
  let idx = 0;
  for (let t = 0; t <= durationS + 1e-6; t += intervalS) {
    if (t < first - intervalS || t > last + intervalS) continue;
    while (idx + 1 < samples.length && samples[idx + 1].t <= t) idx++;
    const a = samples[idx];
    const b = samples[idx + 1];
    let x = a.x, y = a.y, near = a;
    if (b && b.t > a.t && t >= a.t) {
      const f = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
      x = a.x + (b.x - a.x) * f;
      y = a.y + (b.y - a.y) * f;
      near = f < 0.5 ? a : b;
    }
    out.push([
      Math.round(t * 10) / 10, Math.round(x), Math.round(y),
      near.facing == null ? null : Math.round(near.facing), near.mapID,
    ]);
  }
  return out;
}

/**
 * Build the per-parse position payload: the ranked player's timeline plus the
 * notable enemy timelines (boss = highest maxHitPoints). Enemies are keyed by
 * gameID so the frontend can match "the same boss/add" across parses.
 */
function buildParsePositions(
  reportCode: string, fightId: number, playerName: string, playerId: number,
  npcById: Map<number, WclActorEntry>, posEvents: WclResourceEvent[],
  fightStartMs: number, durationS: number,
): ParsePositions {
  const byActor = collectPositionSamples(posEvents, fightStartMs);
  const playerSamples = byActor.get(playerId) ?? [];

  const enemies: EnemyWithSamples[] = [];
  for (const [id, samples] of byActor) {
    if (id === playerId || !npcById.has(id)) continue;
    const maxHp = samples.reduce((m, s) => Math.max(m, s.maxHp), 0);
    enemies.push({ actorId: id, count: samples.length, maxHp, samples, meta: npcById.get(id)! });
  }
  enemies.sort((a, b) => b.count - a.count);
  const bossEntry = enemies.reduce<EnemyWithSamples | null>((best, e) => (e.maxHp > (best?.maxHp ?? -1) ? e : best), null);
  const bossId = bossEntry?.actorId ?? null;
  // Keep the boss plus the most-active enemies (likely add/mechanic casters).
  const kept = enemies.slice(0, MAX_TRACKED_ENEMIES);
  if (bossId != null && !kept.some(e => e.actorId === bossId)) {
    const boss = enemies.find(e => e.actorId === bossId);
    if (boss) kept.push(boss);
  }

  return {
    report_code: reportCode,
    fight_id: fightId,
    player_name: playerName,
    duration_s: Math.round(durationS * 10) / 10,
    interval_s: POSITIONS_INTERVAL_S,
    player: resampleTimeline(playerSamples, durationS, POSITIONS_INTERVAL_S),
    enemies: kept.map(e => ({
      game_id: e.meta.gameID ?? null,
      name: e.meta.name ?? '',
      is_boss: e.actorId === bossId,
      samples: resampleTimeline(e.samples, durationS, POSITIONS_INTERVAL_S),
    })).filter(e => e.is_boss || e.samples.length >= MIN_ENEMY_SAMPLES),
  };
}

// ── Parse analysis ────────────────────────────────────────────────────────────

// Pure per-parse analysis: turns an already-fetched event bundle into the
// cooldown_data + positions payload. The rulebook-derived cooldown/defensive
// lists and the player's combatant info are supplied by the caller; this
// function does no network or file access.
export function analyzeParse(
  bundle: ParseEventBundle, spec: string,
  specCds: RulebookCooldown[], specDefensives: RulebookDefensive[],
  combatantInfo: EnrichedRanking['combatant_info'],
): { cooldown_data: ParseCooldownData; positions: ParsePositions | null } {
  const {
    player, npcById, start, fightDurS,
    castEvents, buffEvents, damageEvents, damageTakenEvents,
    enemyCastEvents, combatantEvents, bossDamageEvents,
  } = bundle;

  // Detect Bloodlust
  let blTimeS: number | null = null;
  for (const e of buffEvents) {
    if (e.type === 'applybuff' && e.abilityGameID != null && BLOODLUST_IDS.has(e.abilityGameID)) {
      blTimeS = (e.timestamp - start) / 1000;
      break;
    }
  }

  // Per-CD analysis
  const cdSummary: CdCastSummary[] = [];
  for (const cd of specCds) {
    const cdCasts = castEvents
      .filter(c => c.type === 'cast' && c.abilityGameID === cd.spell_id)
      .sort((a, b) => a.timestamp - b.timestamp);

    const castTimesS = cdCasts.map(c => (c.timestamp - start) / 1000);
    const firstCastS = castTimesS.length > 0 ? castTimesS[0] : null;

    let blAligned = false;
    let blOffsetS: number | null = null;
    if (blTimeS != null && castTimesS.length > 0) {
      for (const t of castTimesS) {
        if (blTimeS - 30 <= t && t <= blTimeS + 55) { blAligned = true; break; }
      }
      const windowOffsets = castTimesS
        .filter(t => blTimeS! - 30 <= t && t <= blTimeS! + 55)
        .map(t => t - blTimeS!);
      if (windowOffsets.length > 0) {
        blOffsetS = Math.round(windowOffsets.reduce((best, v) => Math.abs(v) < Math.abs(best) ? v : best) * 10) / 10;
      }
    }

    // Hold pattern
    const holdWindows: HoldWindow[] = [];
    if (castTimesS.length > 1) {
      const cdSeconds = cd.cooldown ?? 90;
      let expectedT = castTimesS[0];
      for (let k = 1; k < castTimesS.length; k++) {
        expectedT += cdSeconds;
        const actual = castTimesS[k];
        const holdAmount = actual - expectedT;
        if (holdAmount > 8.0) {
          holdWindows.push({
            cast_index: k + 1,
            expected_s: Math.round(expectedT * 10) / 10,
            actual_s: Math.round(actual * 10) / 10,
            hold_amount_s: Math.round(holdAmount * 10) / 10,
          });
        }
      }
    }

    cdSummary.push({
      name: cd.name,
      spell_id: cd.spell_id,
      total_uses: cdCasts.length,
      first_cast_s: firstCastS != null ? Math.round(firstCastS * 10) / 10 : null,
      bl_aligned: blAligned,
      bl_offset_s: blOffsetS,
      cast_times_s: castTimesS.map(t => Math.round(t * 100) / 100),
      hold_windows: holdWindows,
      cast_pattern: holdWindows.length > 0 ? 'hold' : 'on_cooldown',
    });
  }

  // Cast efficiency
  const completed = castEvents.filter(e => e.type === 'cast').sort((a, b) => a.timestamp - b.timestamp);
  let castEffPct: number | null = null;
  let castGapListMs: number[] = [];
  if (completed.length >= 2 && fightDurS > 0) {
    castGapListMs = [];
    for (let i = 1; i < completed.length; i++) {
      castGapListMs.push(Math.round(completed[i].timestamp - completed[i - 1].timestamp));
    }
    castGapListMs.sort((a, b) => a - b);
    const downtimeMs = castGapListMs.filter(g => g > 1500).reduce((s, g) => s + g, 0);
    castEffPct = Math.round(Math.max(0, (1 - downtimeMs / 1000 / fightDurS) * 100) * 10) / 10;
  }

  // Burst windows - sized by CD durations, active_cds set inside
  const burstWindows = findBurstWindows(damageEvents, start, cdSummary, specCds, 0.03, castEvents);

  // Gear data from combatant info (trinkets/enchants from rankings; talent key from this fight's
  // CombatantInfo talentTree, which uses the same full-tree representation as the frontend).
  const gearData = combatantInfo;
  const ciEvent = combatantEvents.find(e => e.sourceID === player.id) ?? combatantEvents[0];
  const talentKey = talentKeyFromTree(ciEvent?.talentTree);

  // Defensive tracking
  // Build buff window lookup: Map<spell_id, [[start_s, end_s|null], ...]>
  const buffWindows = new Map<number, Array<[number, number | null]>>();
  for (const e of buffEvents) {
    const sid = e.abilityGameID;
    if (sid == null) continue;
    const tS = (e.timestamp - start) / 1000;
    if (e.type === 'applybuff') {
      if (!buffWindows.has(sid)) buffWindows.set(sid, []);
      buffWindows.get(sid)!.push([tS, null]);
    } else if (e.type === 'removebuff') {
      const windows = buffWindows.get(sid) ?? [];
      for (let i = windows.length - 1; i >= 0; i--) {
        if (windows[i][1] == null) { windows[i][1] = tS; break; }
      }
    }
  }

  const defensiveSummary: DefensiveCastSummary[] = [];
  for (const defn of specDefensives) {
    const sid = defn.spell_id;
    const duration = defn.duration ?? 0;
    const cooldownS = defn.cooldown ?? 90;
    const windows: Array<{ start_s: number; end_s: number; dmg_during: number }> = [];
    let castTimes: number[] = [];

    for (const bw of (buffWindows.get(sid) ?? [])) {
      const wStart = bw[0];
      const wEnd = bw[1] != null ? bw[1] : (duration ? wStart + duration : wStart + 5);
      const dmgDuring = damageTakenEvents
        .filter(e => e.type === 'damage')
        .reduce((s, e) => {
          const tS = (e.timestamp - start) / 1000;
          return tS >= wStart && tS <= wEnd ? s + (e.amount ?? 0) + (e.absorbed ?? 0) : s;
        }, 0);
      windows.push({ start_s: Math.round(wStart * 10) / 10, end_s: Math.round(wEnd * 10) / 10, dmg_during: Math.round(dmgDuring) });
      castTimes.push(Math.round(wStart * 10) / 10);
    }

    // Also track explicit casts for defensives without self-buff
    if (castTimes.length === 0) {
      const casts = castEvents
        .filter(c => c.type === 'cast' && c.abilityGameID === sid)
        .map(c => Math.round((c.timestamp - start) / 1000 * 10) / 10);
      for (const tS of casts) {
        const wEnd = tS + (duration || 5);
        const dmgDuring = damageTakenEvents
          .filter(e => e.type === 'damage')
          .reduce((s, e) => {
            const eS = (e.timestamp - start) / 1000;
            return eS >= tS && eS <= wEnd ? s + (e.amount ?? 0) + (e.absorbed ?? 0) : s;
          }, 0);
        windows.push({ start_s: tS, end_s: Math.round(wEnd * 10) / 10, dmg_during: Math.round(dmgDuring) });
        castTimes.push(tS);
      }
    }

    castTimes.sort((a, b) => a - b);
    const holdWindowsDef: HoldWindow[] = [];
    for (let j = 1; j < castTimes.length; j++) {
      const expectedS = castTimes[j - 1] + cooldownS;
      const actualS = castTimes[j];
      const holdAmountS = actualS - expectedS;
      if (holdAmountS > 8) {
        holdWindowsDef.push({
          cast_index: j,
          expected_s: Math.round(expectedS * 10) / 10,
          actual_s: Math.round(actualS * 10) / 10,
          hold_amount_s: Math.round(holdAmountS * 10) / 10,
        });
      }
    }

    if (castTimes.length > 0) {
      defensiveSummary.push({
        name: defn.name,
        spell_id: sid,
        cooldown: cooldownS,
        uses: castTimes.length,
        cast_times_s: castTimes,
        first_cast_s: castTimes[0],
        hold_windows: holdWindowsDef,
        cast_pattern: holdWindowsDef.length > 0 ? 'hold' : 'on_cooldown',
        windows,
      });
    }
  }

  const defensiveWindows = findDefensiveWindows(damageTakenEvents, start, buffWindows, specDefensives, npcById);

  const cooldownData: ParseCooldownData = {
    player: player.name,
    spec,
    fight_duration_s: Math.round(fightDurS * 10) / 10,
    bloodlust_s: blTimeS != null ? Math.round(blTimeS * 10) / 10 : null,
    cast_efficiency_pct: castEffPct,
    cast_gap_list_ms: castGapListMs,
    cooldowns: cdSummary,
    burst_windows: burstWindows,
    defensives: defensiveSummary,
    defensive_windows: defensiveWindows,
    talent_key: talentKey,
    trinkets: gearData.trinkets,
    enchants: gearData.enchants,
  };

  let positions: ParsePositions | null = null;
  try {
    positions = buildParsePositions(
      bundle.report_code, bundle.fight_id, player.name, player.id, npcById,
      [...castEvents, ...enemyCastEvents, ...bossDamageEvents], start, fightDurS,
    );
    if (!positions.player.length) positions = null;
  } catch { positions = null; }

  return { cooldown_data: cooldownData, positions };
}

// ── Analysis utils ────────────────────────────────────────────────────────────

// Thin guarded delegators to simple-statistics. The guards preserve the
// zero-on-empty / zero-on-single contract the ~30 call sites rely on
// (ss.mean/ss.median throw on empty input; sampleStandardDeviation needs n >= 2).
// stdev uses the sample (n-1) standard deviation, matching the prior implementation.
function median(arr: number[]): number {
  return arr.length ? ss.median(arr) : 0;
}

function mean(arr: number[]): number {
  return arr.length ? ss.mean(arr) : 0;
}

function stdev(arr: number[]): number {
  return arr.length >= 2 ? ss.sampleStandardDeviation(arr) : 0;
}

function round(v: number, decimals = 1): number {
  return Math.round(v * 10 ** decimals) / 10 ** decimals;
}

// ── Shared clustering primitives ─────────────────────────────────────────────

// Median of an already-ascending-sorted array (O(1)); matches median() exactly.
function medianOfSorted(sortedTimes: number[]): number {
  const mid = sortedTimes.length >> 1;
  return sortedTimes.length % 2
    ? sortedTimes[mid]
    : (sortedTimes[mid - 1] + sortedTimes[mid]) / 2;
}

// Group windows by proximity in time (within mergeS seconds of the running cluster
// median). Single O(N) pass: windows are processed in ascending time order, so the
// moment a new cluster is created every earlier cluster's median is already below
// w - mergeS and (since later windows only increase) can never match again. Hence
// only the most-recently-created cluster is ever a candidate - the previous greedy
// scan over all clusters was redundant. Output is identical to that greedy version.
function groupByTime<T extends { time_s: number }>(windows: T[], mergeS: number): T[][] {
  const sorted = [...windows].sort((a, b) => a.time_s - b.time_s);
  const clusters: T[][] = [];
  let openTimes: number[] = []; // ascending times of the last (only open) cluster
  for (const w of sorted) {
    if (clusters.length && Math.abs(w.time_s - medianOfSorted(openTimes)) <= mergeS) {
      clusters[clusters.length - 1].push(w);
      openTimes.push(w.time_s); // w.time_s >= every prior time, so still sorted
    } else {
      clusters.push([w]);
      openTimes = [w.time_s];
    }
  }
  return clusters;
}

// Common statistics for a cluster of windows (time, absolute damage, ability breakdown).
// Windows are compared by absolute damage rather than share-of-fight-total: on
// progression (wipes) the fight-total denominator is unstable, so a share would
// inflate against full-kill top parses. Absolute damage stays comparable.
function clusterBaseStats(cl: Array<{ time_s: number; window_damage?: number; ability_breakdown?: Array<{ spell_id: number; damage?: number; casts?: number }>; ref_game_id?: number | null }>, totalSamples: number): ClusterBaseStats {
  const times = cl.map(c => c.time_s);
  const dmgs  = cl.map(c => c.window_damage ?? 0);
  const sorted = [...dmgs].sort((a, b) => a - b);

  const abilityTotals = new Map<number, number[]>();
  const abilityCasts = new Map<number, number[]>();
  for (const c of cl) {
    for (const ab of (c.ability_breakdown ?? [])) {
      if (!abilityTotals.has(ab.spell_id)) abilityTotals.set(ab.spell_id, []);
      abilityTotals.get(ab.spell_id)!.push(ab.damage ?? 0);
      // Cast counts only exist on burst windows; defensive windows omit them.
      if (ab.casts != null) {
        if (!abilityCasts.has(ab.spell_id)) abilityCasts.set(ab.spell_id, []);
        abilityCasts.get(ab.spell_id)!.push(ab.casts);
      }
    }
  }
  const ability_breakdown: ClusterBaseStats['ability_breakdown'] = [...abilityTotals.entries()]
    .filter(([, ds]) => ds.length >= cl.length * MEMBER_MAJORITY_FRAC)
    .map(([sid, ds]) => {
      const castsArr = abilityCasts.get(sid);
      const entry: ClusterBaseStats['ability_breakdown'][number] = {
        spell_id: sid,
        avg_damage: Math.round(mean(ds)),
        min_damage: Math.round(Math.min(...ds)),
        max_damage: Math.round(Math.max(...ds)),
        count: ds.length,
      };
      if (castsArr?.length) entry.avg_casts = Math.round(mean(castsArr));
      return entry;
    })
    .sort((a, b) => b.avg_damage - a.avg_damage)
    .slice(0, 6);

  // Majority map-reference enemy across members (defensive windows only; null for burst).
  const refCounts = new Map<number, number>();
  for (const c of cl) if (c.ref_game_id != null) refCounts.set(c.ref_game_id, (refCounts.get(c.ref_game_id) ?? 0) + 1);
  const ref_game_id = [...refCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    time_s: round(median(times)),
    stddev_s: round(stdev(times)),
    count: cl.length,
    total_samples: totalSamples,
    dmg_avg: Math.round(mean(dmgs)),
    dmg_stddev: Math.round(stdev(dmgs)),
    dmg_min: Math.round(sorted[0]),
    dmg_max: Math.round(sorted[sorted.length - 1]),
    ability_breakdown,
    ref_game_id,
  };
}

export function clusterBurstWindows(windows: RawBurstWindow[], totalSamples: number, mergeS = 15.0): ClusteredBurstWindow[] {
  if (!windows.length) return [];
  const result: ClusteredBurstWindow[] = [];
  for (const cl of groupByTime(windows, mergeS)) {
    if (cl.length < Math.max(2, totalSamples * CLUSTER_MIN_FRAC)) continue;
    const base = clusterBaseStats(cl, totalSamples);
    const cdCounts = new Map<string, number>();
    for (const c of cl) {
      for (const name of (c.active_cds ?? [])) cdCounts.set(name, (cdCounts.get(name) ?? 0) + 1);
    }
    const common_cds = [...cdCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .filter(([, cnt]) => cnt >= cl.length * MEMBER_MAJORITY_FRAC)
      .map(([name]) => name);
    const window_length_s = round(mean(cl.map(c => c.window_length_s)));
    result.push({ ...base, common_cds, avg_targets: round(mean(cl.map(c => c.target_count ?? 1))), window_length_s });
  }
  return result.sort((a, b) => a.time_s - b.time_s);
}

export function aggregateGear(samples: ParseSample[]): GearStats {
  const total = samples.length;
  const talentCounter = new Map<string, number>();
  const talentExample = new Map<string, { report_code: string; fight_id: number; player_name: string }>();
  const trinketCounters: Record<number, Map<number | string, number>> = { 12: new Map(), 13: new Map() };
  const trinketNames = new Map<number | string, string>();
  const enchantCounters = new Map<number, Map<number | string, number>>();
  const enchantNames = new Map<number | string, string>();

  for (const s of samples) {
    const cdData = s.cooldown_data;
    const tk = cdData.talent_key ?? '';
    if (tk) {
      talentCounter.set(tk, (talentCounter.get(tk) ?? 0) + 1);
      if (!talentExample.has(tk)) {
        talentExample.set(tk, {
          report_code: s.report_code ?? '',
          fight_id: s.fight_id,
          player_name: s.player_name ?? '',
        });
      }
    }

    for (const t of (cdData.trinkets ?? [])) {
      const slot = t.slot as 12 | 13;
      const itemId = t.id;
      if ((slot === 12 || slot === 13) && itemId) {
        trinketCounters[slot].set(itemId, (trinketCounters[slot].get(itemId) ?? 0) + 1);
        if (!trinketNames.has(itemId)) trinketNames.set(itemId, t.name ?? '');
      }
    }

    for (const e of (cdData.enchants ?? [])) {
      const slot = e.slot;
      const encId = e.id;
      if (slot != null && encId) {
        if (!enchantCounters.has(slot)) enchantCounters.set(slot, new Map());
        const slotMap = enchantCounters.get(slot)!;
        slotMap.set(encId, (slotMap.get(encId) ?? 0) + 1);
        if (!enchantNames.has(encId)) enchantNames.set(encId, e.name ?? '');
      }
    }
  }

  const talentBuilds = [...talentCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, c]) => ({
      key: k, count: c, pct: total ? Math.round(c / total * 100) : 0,
      ...(talentExample.get(k) ?? {}),
    }));

  const trinkets: Record<string, Array<{ id: number | string; name: string; count: number; pct: number }>> = {};
  for (const [slot, counter] of Object.entries(trinketCounters)) {
    const counterMap = counter as Map<number | string, number>;
    if (!counterMap.size) continue;
    trinkets[slot] = [...counterMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, c]) => ({ id, name: trinketNames.get(id) ?? '', count: c, pct: total ? Math.round(c / total * 100) : 0 }));
  }

  const enchants: Record<string, Array<{ id: number | string; name: string; count: number; pct: number }>> = {};
  for (const [slot, counter] of enchantCounters.entries()) {
    if (!counter.size) continue;
    enchants[String(slot)] = [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, c]) => ({ id, name: enchantNames.get(id) ?? '', count: c, pct: total ? Math.round(c / total * 100) : 0 }));
  }

  return { sample_count: total, talent_builds: talentBuilds, trinkets, enchants };
}

function benchUsesPerMin(entries: BenchEntry[]): { avg: number; stddev: number; min: number; max: number } | Record<string, never> {
  const upms: number[] = [];
  for (const e of entries) {
    const dur = e.fight_duration_s ?? 0;
    const times = e.cast_times_s ?? [];
    if (dur > 0 && times.length > 0) {
      upms.push(Math.round(times.length / dur * 60 * 1000) / 1000);
    }
  }
  if (!upms.length) return {};
  return {
    avg: round(mean(upms), 3),
    stddev: round(stdev(upms), 3),
    min: Math.min(...upms),
    max: Math.max(...upms),
  };
}

// Per-cast-index hold targets: cast positions where enough top parsers delayed
// the cast, with the median delay players should match. Shared by the cooldown
// and defensive benchmark passes.
function buildHoldTargets(entries: BenchEntry[]): Record<string, { target_s: number; stddev_s: number; count: number; total_samples: number }> {
  const holdByCastIdx = new Map<number, number[]>();
  for (const entry of entries) {
    for (const hw of (entry.hold_windows ?? [])) {
      if (!holdByCastIdx.has(hw.cast_index)) holdByCastIdx.set(hw.cast_index, []);
      holdByCastIdx.get(hw.cast_index)!.push(hw.actual_s);
    }
  }
  const holdTargets: Record<string, { target_s: number; stddev_s: number; count: number; total_samples: number }> = {};
  for (const [castIdx, times] of holdByCastIdx.entries()) {
    if (times.length >= Math.max(2, entries.length * HOLD_TRIGGER_FRAC)) {
      holdTargets[String(castIdx)] = {
        target_s: round(median(times)),
        stddev_s: round(stdev(times)),
        count: times.length,
        total_samples: entries.length,
      };
    }
  }
  return holdTargets;
}

// Benchmark fields common to cooldowns and defensives. `usesOf` reads the per-parse
// use count (cooldowns expose `total_uses`, defensives `uses`); `requireUsesForUpm`
// excludes zero-use parses from the uses-per-minute mean (defensive behavior).
function buildBaseBenchmark(entries: BenchEntry[], usesOf: (e: BenchEntry) => number, requireUsesForUpm: boolean): BaseBenchmark {
  const topFirstCasts = entries.map(e => e.first_cast_s).filter((v): v is number => v != null);
  const gaps: number[] = [];
  for (const entry of entries) {
    const times = entry.cast_times_s ?? [];
    for (let j = 1; j < times.length; j++) gaps.push(times[j] - times[j - 1]);
  }
  const upmList = entries
    .filter(e => e.fight_duration_s && (!requireUsesForUpm || usesOf(e)))
    .map(e => usesOf(e) / (e.fight_duration_s / 60));
  return {
    sample_count: entries.length,
    avg_first_cast_s: topFirstCasts.length ? round(mean(topFirstCasts)) : 0,
    stddev_first_cast_s: topFirstCasts.length ? round(stdev(topFirstCasts)) : 0,
    avg_gap_s: gaps.length ? round(mean(gaps)) : null,
    stddev_gap_s: gaps.length ? round(stdev(gaps)) : null,
    hold_targets: buildHoldTargets(entries),
    avg_uses: entries.length ? round(mean(entries.map(e => usesOf(e) ?? 0))) : 0,
    avg_uses_per_min: upmList.length ? round(mean(upmList), 2) : 0,
    uses_per_min: benchUsesPerMin(entries),
    majority_hold: entries.filter(e => e.cast_pattern === 'hold').length > entries.length * MEMBER_MAJORITY_FRAC,
  };
}

// Aggregate already-read parse samples into the encounter bench file payload.
// Pure: no reads or writes. The caller (storage) supplies the spec defensives
// (from the rulebook) and persists the returned object.
export function buildEncounterBench(
  samples: ParseSample[], specDefensives: RulebookDefensive[],
  spec: string, encounterId: number,
): EncounterBench {
  const encName = samples[0].encounter_name ?? '';

  // Efficiency
  const allGapsMs: number[] = [];
  for (const s of samples) {
    const gaps = s.cooldown_data.cast_gap_list_ms ?? [];
    allGapsMs.push(...gaps);
  }
  allGapsMs.sort((a, b) => a - b);
  let downtimeThresholdMs = 1500;
  if (allGapsMs.length) {
    const p90Idx = Math.max(0, Math.floor(0.90 * allGapsMs.length) - 1);
    downtimeThresholdMs = allGapsMs[p90Idx];
  }

  const effVals: number[] = [];
  for (const s of samples) {
    const cdData = s.cooldown_data;
    const gapList = cdData.cast_gap_list_ms ?? [];
    const durS = cdData.fight_duration_s ?? 0;
    if (gapList.length && durS > 0) {
      const dtS = gapList.filter(g => g > downtimeThresholdMs).reduce((acc, g) => acc + g, 0) / 1000;
      effVals.push(round(Math.max(0, (1 - dtS / durS) * 100)));
    }
  }
  if (!effVals.length) {
    for (const s of samples) {
      const v = s.cooldown_data.cast_efficiency_pct;
      if (v != null) effVals.push(v);
    }
  }
  const topAvgEfficiency = effVals.length ? round(mean(effVals)) : 0;
  const topEfficiencyStddev = effVals.length ? round(stdev(effVals)) : 0;

  // Per-CD benchmarks
  const agg = new Map<string, Array<CdCastSummary & { fight_duration_s: number }>>();
  for (const s of samples) {
    const cdData = s.cooldown_data;
    const fightDur = cdData.fight_duration_s ?? 0;
    for (const cd of (cdData.cooldowns ?? [])) {
      if (!agg.has(cd.name)) agg.set(cd.name, []);
      agg.get(cd.name)!.push({ ...cd, fight_duration_s: fightDur });
    }
  }

  const perCdBenchmarks: Record<string, BaseBenchmark & { avg_bl_offset_s: number | null; stddev_bl_offset_s: number | null; bl_pct: number }> = {};
  for (const [cdName, entries] of agg.entries()) {
    const blOffsets = entries.map(e => e.bl_offset_s).filter((v): v is number => v != null);
    const blCount = entries.filter(e => e.bl_aligned).length;

    perCdBenchmarks[cdName] = {
      ...buildBaseBenchmark(entries, e => (e as unknown as CdCastSummary).total_uses, false),
      avg_bl_offset_s: blOffsets.length ? round(mean(blOffsets)) : null,
      stddev_bl_offset_s: blOffsets.length ? round(stdev(blOffsets)) : null,
      bl_pct: entries.length ? Math.round(blCount / entries.length * 100) : 0,
    };
  }

  // Duration
  const durations = samples.map(s => s.cooldown_data.fight_duration_s).filter(Boolean) as number[];
  const avgDurationS = durations.length ? round(mean(durations)) : 0;

  // Burst windows
  const allBw: RawBurstWindow[] = [];
  for (const s of samples) {
    for (const bw of (s.cooldown_data.burst_windows ?? [])) allBw.push(bw);
  }
  const burstWindowsClustered = allBw.length ? clusterBurstWindows(allBw, samples.length) : [];

  // Gear
  const gear = aggregateGear(samples);

  // Defensive benchmarks
  const aggDefUses = new Map<string, number[]>();
  for (const s of samples) {
    for (const d of (s.cooldown_data.defensives ?? [])) {
      if (!aggDefUses.has(d.name)) aggDefUses.set(d.name, []);
      aggDefUses.get(d.name)!.push(d.uses ?? 0);
    }
  }

  const topDefensivesSummary: Array<{ name: string; spell_id: number; avg_uses: number; min_uses: number; max_uses: number; sample_count: number }> = [];
  for (const defn of specDefensives) {
    const uses = aggDefUses.get(defn.name);
    if (!uses?.length) continue;
    topDefensivesSummary.push({
      name: defn.name,
      spell_id: defn.spell_id,
      avg_uses: round(mean(uses)),
      min_uses: Math.min(...uses),
      max_uses: Math.max(...uses),
      sample_count: uses.length,
    });
  }

  const aggDef = new Map<string, Array<DefensiveCastSummary & { fight_duration_s: number }>>();
  for (const s of samples) {
    const cdData = s.cooldown_data;
    const fightDur = cdData.fight_duration_s ?? 0;
    for (const d of (cdData.defensives ?? [])) {
      if (!aggDef.has(d.name)) aggDef.set(d.name, []);
      aggDef.get(d.name)!.push({ ...d, fight_duration_s: fightDur });
    }
  }

  const perDefensiveBenchmarks: Record<string, BaseBenchmark> = {};
  for (const [defName, entries] of aggDef.entries()) {
    perDefensiveBenchmarks[defName] = buildBaseBenchmark(entries, e => (e as DefensiveCastSummary).uses, true);
  }

  // Defensive windows
  const allDw: RawDefensiveWindow[] = [];
  for (const s of samples) {
    for (const dw of (s.cooldown_data.defensive_windows ?? [])) allDw.push(dw);
  }
  const defensiveWindowsClustered = allDw.length ? clusterDefensiveWindows(allDw, samples.length) : [];

  return {
    spec, encounter_id: encounterId, encounter_name: encName,
    sample_count: samples.length,
    avg_duration_s: avgDurationS,
    downtime_threshold_ms: Math.round(downtimeThresholdMs),
    top_avg_efficiency: topAvgEfficiency,
    top_efficiency_stddev: topEfficiencyStddev,
    per_cd_benchmarks: perCdBenchmarks,
    burst_windows: burstWindowsClustered,
    gear,
    top_defensives_summary: topDefensivesSummary,
    per_defensive_benchmarks: perDefensiveBenchmarks,
    defensive_windows: defensiveWindowsClustered,
  };
}
