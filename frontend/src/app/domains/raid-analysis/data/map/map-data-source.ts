import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { EncounterPositions } from '../encounter/positioning.models';

/** The alias keeps the feature's storage shape named like the other features' bench types (e.g. `BurstBench`) so a future reshape stays local to this file. */
export type MapData = EncounterPositions;

export const MAP_DATA_SOURCE = new InjectionToken<DataSource<MapData>>('MAP_DATA_SOURCE');
