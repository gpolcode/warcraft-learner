import { InjectionToken } from '@angular/core';
import { DataSource } from '../../../core/data-source/data-source';

/** One rulebook ability (major cooldown or defensive) the top parses used, with its consensus cast times. */
export interface NorthernSkyAbility {
  spell_id: number;
  name: string;
  icon: string;
  kind: 'cooldown' | 'defensive';
  /** Consensus cast times (seconds from pull) most top parses share, ascending. */
  cast_times_s: number[];
}

/** The tailored Northern Sky export bench for one encounter, read from `data/specs/{spec}/northern-sky/{enc}.json`. */
export interface NorthernSkyBench {
  spec: string;
  /** Blizzard specialization id, baked at ingest for the note's `tag:` field. */
  spec_id: number;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  abilities: NorthernSkyAbility[];
}

/** The slice's data-source token: prod reads the tailored file, dev/ingest computes it live. */
export const NORTHERN_SKY_DATA_SOURCE = new InjectionToken<DataSource<NorthernSkyBench>>('NORTHERN_SKY_DATA_SOURCE');
