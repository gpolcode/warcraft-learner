import { Provider } from '@angular/core';
import { Environment, baseEnvironment } from './base-environment';
import { provideFileDataSource } from '../app/domains/raid-analysis/data/data-source/provide-data-source';
import { BURST_DATA_SOURCE } from '../app/domains/raid-analysis/data/burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from '../app/domains/raid-analysis/data/rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from '../app/domains/raid-analysis/data/defensive/defensive-data-source';
import { GEAR_DATA_SOURCE } from '../app/domains/raid-analysis/data/gear/gear-data-source';
import { MAP_DATA_SOURCE } from '../app/domains/raid-analysis/data/map/map-data-source';
import { NORTHERN_SKY_DATA_SOURCE } from '../app/domains/raid-analysis/data/northern-sky/northern-sky-data-source';

/** Site-root absolute, so every deployed build (`main/`, `pr-N/`) reads the one shared data copy whatever its own base href. */
export const environment: Environment = { ...baseEnvironment, dataBaseHref: '/data/specs/' };

/** Never import a `*TransformService` here or it joins the eager production bundle. */
export const environmentProviders: Provider[] = [
  provideFileDataSource(BURST_DATA_SOURCE, 'burst'),
  provideFileDataSource(ROTATION_DATA_SOURCE, 'rotation'),
  provideFileDataSource(DEFENSIVE_DATA_SOURCE, 'defensive'),
  provideFileDataSource(GEAR_DATA_SOURCE, 'gear'),
  provideFileDataSource(MAP_DATA_SOURCE, 'positions'),
  provideFileDataSource(NORTHERN_SKY_DATA_SOURCE, 'northern-sky'),
];
