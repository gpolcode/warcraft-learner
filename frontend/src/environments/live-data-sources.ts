/** Never import from `environment.ts`: these `*TransformService` references must stay out of the production graph. */
import { Provider } from '@angular/core';
import { provideLiveDataSource } from '../app/domains/raid-analysis/data/data-source/provide-data-source';
import { BURST_DATA_SOURCE } from '../app/domains/raid-analysis/data/burst-windows/burst-data-source';
import { BurstTransformService } from '../app/domains/raid-analysis/data/burst-windows/burst-transform-service';
import { ROTATION_DATA_SOURCE } from '../app/domains/raid-analysis/data/rotation/rotation-data-source';
import { RotationTransformService } from '../app/domains/raid-analysis/data/rotation/rotation-transform-service';
import { DEFENSIVE_DATA_SOURCE } from '../app/domains/raid-analysis/data/defensive/defensive-data-source';
import { DefensiveTransformService } from '../app/domains/raid-analysis/data/defensive/defensive-transform-service';
import { GEAR_DATA_SOURCE } from '../app/domains/raid-analysis/data/gear/gear-data-source';
import { GearTransformService } from '../app/domains/raid-analysis/data/gear/gear-transform-service';
import { MAP_DATA_SOURCE } from '../app/domains/raid-analysis/data/map/map-data-source';
import { MapTransformService } from '../app/domains/raid-analysis/data/map/map-transform-service';
import { NORTHERN_SKY_DATA_SOURCE } from '../app/domains/raid-analysis/data/northern-sky/northern-sky-data-source';
import { NorthernSkyTransformService } from '../app/domains/raid-analysis/data/northern-sky/northern-sky-transform-service';

export const liveDataSourceProviders: Provider[] = [
  provideLiveDataSource(BURST_DATA_SOURCE, BurstTransformService),
  provideLiveDataSource(ROTATION_DATA_SOURCE, RotationTransformService),
  provideLiveDataSource(DEFENSIVE_DATA_SOURCE, DefensiveTransformService),
  provideLiveDataSource(GEAR_DATA_SOURCE, GearTransformService),
  provideLiveDataSource(MAP_DATA_SOURCE, MapTransformService),
  provideLiveDataSource(NORTHERN_SKY_DATA_SOURCE, NorthernSkyTransformService),
];
