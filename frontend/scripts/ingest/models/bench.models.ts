/**
 * Aggregated bench shapes written to `data/specs/{spec}/encounters/{enc_id}.json`.
 *
 * These are the output types of the Transform layer (analysis/**): per-cooldown
 * and per-defensive benchmarks, clustered burst/defensive windows, gear
 * aggregates, and the top-level `EncounterBench` envelope. Mirrored by the
 * frontend consumers in `src/app/core/models/encounter.models.ts` - keep the two
 * in sync (see CLAUDE.md "Keep data shapes in sync").
 */

import type { HoldWindow } from './parse-sample.models.ts';

// Shared base + burst cluster types moved to the shared pipeline; re-exported so
// existing ingest imports keep working.
import type { ClusterBaseStats, ClusteredBurstWindow } from '../../../src/app/core/analysis/bench/models.ts';
export type { ClusterBaseStats, ClusteredBurstWindow };

export interface ClusteredDefensiveWindow extends ClusterBaseStats {
  defensive_name: string;
  spell_id: number;
  common_defensives: string[];
  common_cds: string[];
  window_length_s: number;
}

// Shared entry shape consumed by buildBaseBenchmark.
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
  hold_targets: Record<string, HoldTarget>;
  avg_uses: number;
  avg_uses_per_min: number;
  uses_per_min: UsesPerMin | Record<string, never>;
  majority_hold: boolean;
}

export interface HoldTarget { target_s: number; stddev_s: number; count: number; total_samples: number; }
export interface UsesPerMin { avg: number; stddev: number; min: number; max: number; }

export type CdBenchmark = BaseBenchmark & { avg_bl_offset_s: number | null; stddev_bl_offset_s: number | null; bl_pct: number };

export interface DefensiveSummary {
  name: string;
  spell_id: number;
  avg_uses: number;
  min_uses: number;
  max_uses: number;
  sample_count: number;
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
  per_cd_benchmarks: Record<string, CdBenchmark>;
  burst_windows: ClusteredBurstWindow[];
  gear: GearStats;
  top_defensives_summary: DefensiveSummary[];
  per_defensive_benchmarks: Record<string, BaseBenchmark>;
  defensive_windows: ClusteredDefensiveWindow[];
}
