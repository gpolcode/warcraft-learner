/**
 * Transform: reshape the generic encounter bench's `gear` block into the gear
 * card's own tailored slice file (`data/specs/{spec}/gear/{enc}.json`). Pure - no
 * IO, no WCL.
 *
 * Keep this shape in sync with the frontend consumer `GearBench`
 * (`pages/post-raid/gear/gear-data-source.ts`). The ingest `GearStats` carries
 * per-entry `count`/`sample_count` bookkeeping and ids that may be strings; the
 * slice file drops the bookkeeping and coerces ids to numbers so it matches the
 * frontend `EncounterGearStats` the shared gear helpers consume.
 */
import type { EncounterBench, GearStats } from '../models/bench.models.ts';

export interface GearTalentBuild {
  key: string;
  pct: number;
  report_code?: string;
  fight_id?: number;
  player_name?: string;
}
export interface GearItemEntry { id: number; name: string; pct: number; }

export interface GearSliceFile {
  spec: string;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  talent_builds: GearTalentBuild[];
  trinkets: Record<number, GearItemEntry[]>;
  enchants: Record<number, GearItemEntry[]>;
}

function toNumberId(id: number | string): number {
  return typeof id === 'number' ? id : Number(id);
}

/** Drop bookkeeping fields and coerce item ids to numbers for a slot map. */
function reshapeSlots(slots: GearStats['trinkets']): Record<number, GearItemEntry[]> {
  const out: Record<number, GearItemEntry[]> = {};
  for (const [slot, entries] of Object.entries(slots)) {
    out[Number(slot)] = entries.map(entry => ({ id: toNumberId(entry.id), name: entry.name, pct: entry.pct }));
  }
  return out;
}

/** Reshape a generic encounter bench's gear block into the gear slice file. */
export function buildGearSlice(bench: EncounterBench): GearSliceFile {
  const gear = bench.gear;
  return {
    spec: bench.spec,
    encounter_id: bench.encounter_id,
    encounter_name: bench.encounter_name,
    sample_count: bench.sample_count,
    talent_builds: gear.talent_builds.map(build => ({
      key: build.key,
      pct: build.pct,
      report_code: build.report_code,
      fight_id: build.fight_id,
      player_name: build.player_name,
    })),
    trinkets: reshapeSlots(gear.trinkets),
    enchants: reshapeSlots(gear.enchants),
  };
}
