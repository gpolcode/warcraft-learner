/**
 * Shared types for the pure burst/bench pipeline (used by BOTH the ingest scripts
 * and the browser BurstTransformService). Defined here under src/app/core so app
 * code can import them; the ingest model files re-export them so existing ingest
 * imports keep working unchanged.
 */

/**
 * The minimal WCL event shape the pure pipeline reads. Both the app's `WclEvent`
 * and the ingest `WclResourceEvent` are assignable to it, so events from either
 * side pass straight in.
 */
export interface BenchEvent {
  type: string;
  timestamp: number;
  abilityGameID?: number;
  amount?: number;
  absorbed?: number;
  sourceID?: number;
  targetID?: number;
}

export interface HoldWindow {
  cast_index: number;
  expected_s: number;
  actual_s: number;
  hold_amount_s: number;
}

export interface CdCastSummary {
  name: string;
  spell_id: number;
  total_uses: number;
  first_cast_s: number | null;
  bl_aligned: boolean;
  bl_offset_s: number | null;
  cast_times_s: number[];
  hold_windows: HoldWindow[];
  cast_pattern: 'hold' | 'on_cooldown';
}

export interface RawBurstWindowAbility { spell_id: number; damage: number; pct: number; casts: number; }

export interface RawBurstWindow {
  time_s: number;
  window_length_s: number;
  pct_of_total: number;
  window_damage: number;
  total_damage: number;
  ability_breakdown: RawBurstWindowAbility[];
  active_cds: string[];
  target_count: number;
}

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
