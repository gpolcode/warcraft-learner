import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { BurstWindow } from '../analysis/analysis.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';

export interface BurstBench extends BenchHeader {
  windows: BurstWindow[];
  cd_spell_ids: Record<string, number>;
  /** Complete over every cd_spell_ids id and every window ability so wl-game-icon renders without a report on /pre. */
  ability_icons: Record<number, { icon: string; name: string }>;
}

export const BURST_DATA_SOURCE = new InjectionToken<DataSource<BurstBench>>('BURST_DATA_SOURCE');
