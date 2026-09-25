import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { PlanCooldown, PriorityList } from '../plan/plan.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';

export interface ButtonBench {
  action: string;
  /** The id the top logs cast it under most, which names its icon. */
  spell_id: number;
  /** The off-list share all but the sloppiest top log stays at or under; null when too few top logs cast it or past MAX_TOLERANCE. */
  off_tolerance: number | null;
  /** The same for the moments its line led the list and something lower was pressed. */
  skip_tolerance: number | null;
  /** Per line of the button, in list order, its share of the top logs' on-list casts. */
  allowed: number[];
}

export interface RotationBench extends BenchHeader {
  downtime_threshold_s: number;
  top_avg_efficiency: number;
  top_efficiency_stddev: number;
  per_cd_benchmarks: Record<string, PerCdBenchmark>;
  major_cooldowns: PlanCooldown[];
  /** The spec's SimulationCraft list, so the runtime reads the player's log with nothing fetched but the log. */
  list: PriorityList;
  buttons: ButtonBench[];
  cd_spell_ids: Record<string, number>;
  ability_icons: Record<number, { icon: string; name: string }>;
}

export const ROTATION_DATA_SOURCE = new InjectionToken<DataSource<RotationBench>>('ROTATION_DATA_SOURCE');
