import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { EncounterGearStats } from '../encounter/encounter.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';
import { SpecTalents } from './talent.models';

export interface TalentNodeCount {
  entry_id: number;
  rank: number;
  count: number;
}

/** One accepted top log's picks, at the index its ranking holds in `sources`. */
export interface GearParseMeasures {
  /** Empty when the log's talent tree was unreadable. */
  talent_key: string;
  trinket_ids: number[];
  /** Enchant id per gear slot. */
  enchant_ids: Record<number, number>;
}

export interface GearBench extends BenchHeader {
  talent_builds: EncounterGearStats['talent_builds'];
  /** Counted over the `talent_sample_count` logs with a readable talent tree. */
  talent_nodes: TalentNodeCount[];
  talent_sample_count: number;
  /** The spec's talents by entry id, so the page names a talent diff without reading the talent dump; empty when the dump failed to load. */
  talent_names: SpecTalents;
  per_parse: GearParseMeasures[];
  trinket_sets: EncounterGearStats['trinket_sets'];
  enchants: EncounterGearStats['enchants'];
}

export const GEAR_DATA_SOURCE = new InjectionToken<DataSource<GearBench>>('GEAR_DATA_SOURCE');
