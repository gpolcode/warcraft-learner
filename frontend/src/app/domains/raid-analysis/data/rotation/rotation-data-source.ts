import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { PerCdBenchmark } from '../encounter/encounter.models';
import { PlanCooldown, PriorityList } from '../plan/plan.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';
import { AuraSpan } from '../defensive/defensive-data-source';
import type { ButtonCounts } from './priority-list/list-check-service';
import type { EnemyTimeline } from './priority-list/priority-list.models';

export interface ShareRange {
  lo: number;
  avg: number;
  hi: number;
}

export interface ButtonBench {
  action: string;
  /** The id the top logs cast it under most, which names its icon. */
  spell_id: number;
  /** Over the top logs, each log's share of the button's moments it got right, as `ListCheckService.rightShare` reads it. */
  right: ShareRange;
}

/** `[startS, endS)` in which the player was neither casting nor on the global cooldown. */
export type IdleStretch = [number, number];

/** One accepted top log's measures, at the index its ranking holds in `sources`. */
export interface RotationParseMeasures {
  /** `DowntimeJudgeService.idleStretches` over the whole pull; null for a log with fewer than two casts. */
  idle_s?: IdleStretch[] | null;
  /** The log's first Bloodlust, pull-relative and negative when cast before the pull; null without one. */
  lust_s: number | null;
  /** Pull-relative, as WCL's phase transitions read; empty for a boss with none. */
  phase_starts: { id: number; start_s: number }[];
  /** Per plan cooldown, every use, which carries its count and first cast. */
  cd_casts_s: Record<string, number[]>;
  /** Per plan cooldown, `BloodlustJudgeService.effectSpans` over the whole pull; absent on a bench before they were baked. */
  cd_up_s?: Record<string, AuraSpan[]>;
  buttons: Record<string, ButtonCounts>;
}

export interface RotationBench extends BenchHeader {
  per_cd_benchmarks: Record<string, PerCdBenchmark>;
  major_cooldowns: PlanCooldown[];
  /** The spec's SimulationCraft list, so the runtime reads the player's log with nothing fetched but the log. */
  list: PriorityList;
  buttons: ButtonBench[];
  cd_spell_ids: Record<string, number>;
  per_parse: RotationParseMeasures[];
  /** `EnemyTimelineService.timeline` over every top log; absent on a bench before it was baked, where the enemy count reads the player's own hits. */
  enemy_timeline?: EnemyTimeline | null;
  ability_icons: Record<number, { icon: string; name: string }>;
}

export const ROTATION_DATA_SOURCE = new InjectionToken<DataSource<RotationBench>>('ROTATION_DATA_SOURCE');
