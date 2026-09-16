/** Never import from `environment.ts`: these `*TransformService` references must stay out of the production graph. */
import { InjectionToken, Provider, Type, inject } from '@angular/core';
import { provideLiveDataSource } from '../app/domains/raid-analysis/data/data-source/provide-data-source';
import type { DataSource, RulebookDataSource } from '../app/domains/raid-analysis/data/data-source/data-source';
import { LiveRulebookDataSource } from '../app/domains/raid-analysis/data/data-source/live-rulebook-data-source';
import { LiveRulebookService } from '../app/domains/raid-analysis/data/rulebook-build/live-rulebook-service';
import { RulebookBuildService } from '../app/domains/raid-analysis/data/rulebook-build/rulebook-build-service';
import { WclApiService } from '../app/domains/raid-analysis/data/wcl/wcl-api-service';
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

/** The tier a live analysis derives against; `?simcTier=<branch>/<dir>` overrides it, and the ingest workflow reads the SIMC_TIER repository variable. */
const SIMC_TIER = 'midnight/MID2';

const tierParam = (): string => new URLSearchParams(globalThis.location.search).get('simcTier') ?? SIMC_TIER;

/** A bench whose recipe reads a rulebook gets one derived in the browser; the rest run on the log alone. */
const provideDerivedDataSource = <T>(token: InjectionToken<DataSource<T>>, liveImpl: Type<RulebookDataSource<T>>): Provider => ({
  provide: token,
  useFactory: () => new LiveRulebookDataSource<T>(
    inject(liveImpl), inject(LiveRulebookService), inject(WclApiService), inject(RulebookBuildService).parseTier(tierParam())),
});

export const liveDataSourceProviders: Provider[] = [
  provideDerivedDataSource(BURST_DATA_SOURCE, BurstTransformService),
  provideDerivedDataSource(ROTATION_DATA_SOURCE, RotationTransformService),
  provideDerivedDataSource(DEFENSIVE_DATA_SOURCE, DefensiveTransformService),
  provideDerivedDataSource(NORTHERN_SKY_DATA_SOURCE, NorthernSkyTransformService),
  provideLiveDataSource(GEAR_DATA_SOURCE, GearTransformService),
  provideLiveDataSource(MAP_DATA_SOURCE, MapTransformService),
];
