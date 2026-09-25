import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { PlanCooldown, PriorityList } from '../plan/plan.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';

/** How the top logs press one button against its lines in the list. */
export interface ButtonBench {
  action: string;
  /** The id the top logs cast it under most, which names its icon. */
  spell_id: number;
  /** The share of casts off the list all but the sloppiest top log stays at or under; null when too few top logs cast it, or the field strays so often the list does not describe how it plays. */
  off_tolerance: number | null;
  /** The same for the moments its line led the list and something lower was pressed. */
  skip_tolerance: number | null;
  /** The button's own lines, in list order. */
  lines: LineBench[];
}

export interface LineBench {
  /** Share of the field's on-list casts of the button this line allowed. */
  allowed: number;
  /** Per term, what it measures at the field's casts from the 10th to the 90th percentile; null for a flag or a value the log only bounds. */
  spreads: (readonly [number, number] | null)[];
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
