/**
 * Dev-flag `GearDataSource`: computes the gear bench live in the browser (no
 * ingestion). Self-contained per the slice rule - it imports ONLY the two API
 * services + models + `logWarn`, and reimplements its own aggregation math below
 * (it does NOT reference the ingest analysis). Bound by `environment.useLiveTransform`.
 *
 * It fetches the encounter's top parses and, for each, refetches the player's
 * combatant-info gear (trinkets, enchants, talent fingerprint) from that parse's
 * log, then rolls the per-parse gear up into talent / trinket / enchant
 * distributions - the same shape the ingest bench writes.
 */
import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../../../core/services/wcl-api';
import { CharacterGear, ParseRanking } from '../../../core/models/wcl.models';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { logWarn } from '../../../core/log';
import { GearBench, GearDataSource } from './gear-data-source';

/** How many top parses to sample (matches the ingest bench). */
const TOP_PARSE_COUNT = 10;
/** Trinket slots, per the WCL gear quirks. */
const TRINKET_SLOTS = [12, 13] as const;
/** Keep at most this many talent builds / trinkets / enchants per slot. */
const MAX_TALENT_BUILDS = 5;
const MAX_TRINKETS_PER_SLOT = 5;
const MAX_ENCHANTS_PER_SLOT = 3;

/* ----------------------------- pure helpers (own math) ----------------------------- */

function pct(count: number, total: number): number {
  return total ? Math.round((count / total) * 100) : 0;
}

/** One top parse reduced to just its gear fingerprint (or null when unavailable). */
export interface ParseGear {
  talent_key: string;
  trinkets: Array<{ slot: number; id: number; name: string }>;
  enchants: Array<{ slot: number; id: number; name: string }>;
}

/** Reduce a fetched `CharacterGear` to the fields the gear aggregation needs. */
export function toParseGear(gear: CharacterGear | null): ParseGear | null {
  if (!gear?.found) return null;
  return {
    talent_key: gear.talent_key ?? '',
    trinkets: (gear.trinkets ?? []).map(trinket => ({ slot: trinket.slot, id: trinket.id, name: trinket.name })),
    enchants: (gear.enchants ?? []).map(enchant => ({ slot: enchant.slot, id: enchant.id, name: enchant.name })),
  };
}

/**
 * Roll per-parse gear up into bench talent builds, per-slot trinkets (12/13), and
 * per-slot enchants - the `EncounterGearStats` block. Mirrors the ingest aggregation
 * (`scripts/ingest/analysis/gear.ts`) but reads already-resolved player gear.
 */
export function aggregateParseGear(parses: ParseGear[]): EncounterGearStats {
  const total = parses.length;

  const talentCounter = new Map<string, number>();
  const talentExample = new Map<string, { report_code?: string; fight_id?: number; player_name?: string }>();
  const trinketCounters = new Map<number, Map<number, number>>();
  const trinketNames = new Map<number, string>();
  const enchantCounters = new Map<number, Map<number, number>>();
  const enchantNames = new Map<number, string>();

  for (const parse of parses) {
    if (parse.talent_key) {
      talentCounter.set(parse.talent_key, (talentCounter.get(parse.talent_key) ?? 0) + 1);
      if (!talentExample.has(parse.talent_key)) talentExample.set(parse.talent_key, {});
    }

    for (const trinket of parse.trinkets) {
      const slot = trinket.slot;
      if ((slot === 12 || slot === 13) && trinket.id) {
        if (!trinketCounters.has(slot)) trinketCounters.set(slot, new Map());
        const slotMap = trinketCounters.get(slot)!;
        slotMap.set(trinket.id, (slotMap.get(trinket.id) ?? 0) + 1);
        if (!trinketNames.has(trinket.id)) trinketNames.set(trinket.id, trinket.name ?? '');
      }
    }

    for (const enchant of parse.enchants) {
      const slot = enchant.slot;
      if (slot != null && enchant.id) {
        if (!enchantCounters.has(slot)) enchantCounters.set(slot, new Map());
        const slotMap = enchantCounters.get(slot)!;
        slotMap.set(enchant.id, (slotMap.get(enchant.id) ?? 0) + 1);
        if (!enchantNames.has(enchant.id)) enchantNames.set(enchant.id, enchant.name ?? '');
      }
    }
  }

  const talent_builds = [...talentCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TALENT_BUILDS)
    .map(([key, count]) => ({ key, pct: pct(count, total), ...(talentExample.get(key) ?? {}) }));

  const trinkets: EncounterGearStats['trinkets'] = {};
  for (const slot of TRINKET_SLOTS) {
    const counter = trinketCounters.get(slot);
    if (!counter?.size) continue;
    trinkets[slot] = [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TRINKETS_PER_SLOT)
      .map(([id, count]) => ({ id, name: trinketNames.get(id) ?? '', pct: pct(count, total) }));
  }

  const enchants: EncounterGearStats['enchants'] = {};
  for (const [slot, counter] of [...enchantCounters.entries()].sort((a, b) => a[0] - b[0])) {
    if (!counter.size) continue;
    enchants[slot] = [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_ENCHANTS_PER_SLOT)
      .map(([id, count]) => ({ id, name: enchantNames.get(id) ?? '', pct: pct(count, total) }));
  }

  return { talent_builds, trinkets, enchants };
}

/* ----------------------------- service shell ----------------------------- */

@Injectable({ providedIn: 'root' })
export class GearTransformService implements GearDataSource {
  private readonly wclApi = inject(WclApiService);

  async getGearBench(spec: string, encounterId: number): Promise<GearBench | null> {
    const rankings = await this.wclApi.getRankings(spec, encounterId, TOP_PARSE_COUNT);
    if (!rankings.length) return null;

    const parses: ParseGear[] = [];
    let encounterName = '';
    for (const ranking of rankings) {
      const fetched = await this.fetchParseGear(ranking, spec);
      if (!fetched) continue;
      parses.push(fetched.gear);
      encounterName ||= fetched.encounterName;
    }
    if (!parses.length) return null;

    const stats = aggregateParseGear(parses);
    return {
      spec,
      encounter_id: encounterId,
      encounter_name: encounterName,
      sample_count: parses.length,
      talent_builds: stats.talent_builds,
      trinkets: stats.trinkets,
      enchants: stats.enchants,
    };
  }

  /** One parse's gear fingerprint via combatant info; null if it can't be fetched. */
  private async fetchParseGear(
    ranking: ParseRanking, spec: string,
  ): Promise<{ gear: ParseGear; encounterName: string } | null> {
    try {
      const report = await this.wclApi.getReport(ranking.report_code);
      const fight = report.fights.find(entry => entry.id === ranking.fight_id);
      const player = report.masterData?.actors?.find(actor => actor.name === ranking.player);
      if (!fight || !player) return null;

      const characterGear = await this.wclApi.getCombatantGear(ranking.report_code, fight.id, player.id, spec);
      const gear = toParseGear(characterGear);
      if (!gear) return null;
      return { gear, encounterName: fight.name ?? '' };
    } catch (err) {
      logWarn(`GearTransformService parse ${ranking.report_code}:${ranking.fight_id}`, err);
      return null;
    }
  }
}
