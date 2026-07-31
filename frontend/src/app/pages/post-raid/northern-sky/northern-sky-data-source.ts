import { InjectionToken } from '@angular/core';
import { DataSource } from '../../../core/data-source/data-source';

/** One rulebook cooldown the top parses used, with the consensus cast times to export. */
export interface NorthernSkyCooldown {
  spell_id: number;
  name: string;
  icon: string;
  /** Consensus cast times (seconds from pull) most top parses share, ascending. */
  cast_times_s: number[];
}

/**
 * The tailored Northern Sky export bench for one encounter, read from
 * `data/specs/{spec}/northern-sky/{enc}.json`. Everything the export card and note builder
 * need: the encounter header, the numeric spec id for the `tag:` field, and the per-cooldown
 * top-parse cast timeline.
 */
export interface NorthernSkyBench {
  spec: string;
  /** Blizzard specialization id, baked at ingest for the note's `tag:` field. */
  spec_id: number;
  encounter_id: number;
  encounter_name: string;
  sample_count: number;
  cooldowns: NorthernSkyCooldown[];
}

/**
 * The Northern Sky slice's data-source token. `provideDataSource` binds it to a
 * `FileDataSource<NorthernSkyBench>` (production: reads the tailored file) or
 * `NorthernSkyTransformService` (development and ingest: computes it live).
 */
export const NORTHERN_SKY_DATA_SOURCE = new InjectionToken<DataSource<NorthernSkyBench>>('NORTHERN_SKY_DATA_SOURCE');
