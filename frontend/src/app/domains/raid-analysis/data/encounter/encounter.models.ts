import { TalentDiff } from '../gear/talent.models';

export interface SpecEntry {
  spec: string;
  encounter_count: number;
}

export interface EncounterEntry {
  id: number;
  name: string;
  sample_count: number;
}

interface UsesPerMin {
  avg: number;
  stddev: number;
}

interface HoldTarget {
  target_s: number;
  count: number;
  total_samples: number;
}

// Cascade-free: the band is measured from the player's OWN prior cast, not a cumulative ideal schedule.
interface CdHoldTarget extends HoldTarget {
  delay_s: number;
  band_s: number;
  effective_cd_s: number;
}

export type CdHoldTargets = Record<string, CdHoldTarget>;

export interface CadenceBenchmark {
  /** Total top parses sampled (NOT users-only, so `used_sample_count` is comparable). */
  sample_count: number;
  used_sample_count: number;
  avg_first_cast_s: number;
  stddev_first_cast_s: number;
  avg_gap_s: number | null;
  stddev_gap_s: number | null;
  hold_targets: CdHoldTargets;
  // A median: one outlier parse cannot move it.
  median_uses: number;
  uses_per_min: UsesPerMin;
  majority_hold: boolean;
}

export interface PerCdBenchmark extends CadenceBenchmark {
  avg_bl_offset_s: number | null;
  stddev_bl_offset_s: number | null;
  bl_pct: number;
}

export type PerDefensiveBenchmark = CadenceBenchmark;

export interface EncounterGearStats {
  talent_builds: { key: string; pct: number; report_code: string; fight_id: number; player_name: string; source_id: number; diff?: TalentDiff[] }[];
  trinket_sets: { items: { id: number; name: string; icon: string }[]; pct: number }[];
  enchants: Record<number, { id: number; name: string; icon: string; item_id: number | null; pct: number }[]>;
}
