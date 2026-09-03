import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { EncounterGearStats } from '../encounter/encounter.models';
import { BenchHeader } from '../analysis/bench-pipeline-service';

export interface GearBench extends BenchHeader {
  talent_builds: EncounterGearStats['talent_builds'];
  trinket_sets: EncounterGearStats['trinket_sets'];
  enchants: EncounterGearStats['enchants'];
}

export const GEAR_DATA_SOURCE = new InjectionToken<DataSource<GearBench>>('GEAR_DATA_SOURCE');
