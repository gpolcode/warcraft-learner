import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { BurstWindow } from '../analysis/analysis.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';
import { PressFold } from '../analysis/wcl-projections-service';

/** One accepted top log's damage on the pull clock, so any window span can be measured on it after the bench is built. */
export interface BurstParseMeasures {
  /** Damage per whole second from the pull; a hit outside the fight clamps into the first or last second. */
  damage_per_s: number[];
}

export interface BurstBench extends BenchHeader {
  windows: BurstWindow[];
  /** Aligned with `sources`; absent on a bench an older ingest wrote. */
  per_parse?: BurstParseMeasures[];
  cd_spell_ids: Record<string, number>;
  /** Baked because the runtime reads no plan and must fold a player's presses the way ingest folded the top logs'. */
  press_folds?: PressFold[];
  /** Complete over every cd_spell_ids id and every window ability so wl-game-icon renders without a report on /pre. */
  ability_icons: Record<number, { icon: string; name: string }>;
}

export const BURST_DATA_SOURCE = new InjectionToken<DataSource<BurstBench>>('BURST_DATA_SOURCE');
