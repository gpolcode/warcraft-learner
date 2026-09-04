import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { BenchIdentity } from '../analysis/bench-pipeline-service';
import { NorthernSkyPhase } from './northern-sky-phases';

export interface NorthernSkyAbility {
  spell_id: number;
  name: string;
  icon: string;
  kind: 'cooldown' | 'defensive';
  /** Seconds from pull, ascending. */
  cast_times_s: number[];
}

/** The tailored Northern Sky export bench for one encounter, read from `data/specs/{spec}/northern-sky/{enc}.json`. */
export interface NorthernSkyBench extends BenchIdentity {
  abilities: NorthernSkyAbility[];
  /** Empty for an encounter Northern Sky keeps on one clock all fight; absent from a file still on an ingest version below 30. */
  phases?: NorthernSkyPhase[];
}

/** The feature's data-source token: prod reads the tailored file, dev/ingest computes it live. */
export const NORTHERN_SKY_DATA_SOURCE = new InjectionToken<DataSource<NorthernSkyBench>>('NORTHERN_SKY_DATA_SOURCE');
