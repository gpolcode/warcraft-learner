import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { BurstWindow } from '../analysis/analysis.models';
import { PerDefensiveBenchmark } from '../encounter/encounter.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';

export interface DefensivePlanMeta {
  name: string;
  spell_id: number;
  cooldown: number;
  duration?: number;
  charges?: number;
  talent_gated: boolean;
  talent_entries?: number[];
}

interface BakedAbility {
  icon: string;
  name: string;
}

/** One accepted top log's measures, at the index its ranking holds in `sources`. */
export interface DefensiveParseMeasures {
  /** Per plan defensive, every use, which carries its count and first cast. */
  def_casts_s: Record<string, number[]>;
}

export interface DefensiveBench extends BenchHeader {
  per_defensive_benchmarks: Record<string, PerDefensiveBenchmark>;
  defensive_windows: BurstWindow[];
  defensives: DefensivePlanMeta[];
  cd_spell_ids: Record<string, number>;
  per_parse: DefensiveParseMeasures[];
  ability_icons: Record<number, BakedAbility>;
}

export const DEFENSIVE_DATA_SOURCE = new InjectionToken<DataSource<DefensiveBench>>('DEFENSIVE_DATA_SOURCE');
