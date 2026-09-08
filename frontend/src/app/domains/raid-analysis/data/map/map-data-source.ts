import { InjectionToken } from '@angular/core';
import { DataSource } from '../data-source/data-source';
import { EncounterPositions } from '../encounter/positioning.models';

export type MapData = EncounterPositions;

export const MAP_DATA_SOURCE = new InjectionToken<DataSource<MapData>>('MAP_DATA_SOURCE');
