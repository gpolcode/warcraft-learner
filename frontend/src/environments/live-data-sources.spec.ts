import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { liveDataSourceProviders } from './live-data-sources';
import { LiveRulebookDataSource } from '../app/domains/raid-analysis/data/data-source/live-rulebook-data-source';
import { BURST_DATA_SOURCE } from '../app/domains/raid-analysis/data/burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from '../app/domains/raid-analysis/data/rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from '../app/domains/raid-analysis/data/defensive/defensive-data-source';
import { NORTHERN_SKY_DATA_SOURCE } from '../app/domains/raid-analysis/data/northern-sky/northern-sky-data-source';
import { GEAR_DATA_SOURCE } from '../app/domains/raid-analysis/data/gear/gear-data-source';
import { GearTransformService } from '../app/domains/raid-analysis/data/gear/gear-transform-service';
import { MAP_DATA_SOURCE } from '../app/domains/raid-analysis/data/map/map-data-source';
import { MapTransformService } from '../app/domains/raid-analysis/data/map/map-transform-service';
import { WCL_TRANSPORT } from '../app/domains/raid-analysis/data/wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../app/domains/raid-analysis/data/data-files/data-file-transport';
import { Results } from '../app/domains/shared/util-http/result';
import { provideAppHttp } from '../app/domains/shared/util-http/http-providers';

function configure(): void {
  TestBed.configureTestingModule({
    providers: [
      ...liveDataSourceProviders,
      // The app's own HTTP stack, so the graph resolves exactly as the dev server builds it; the testing backend answers nothing.
      provideAppHttp(),
      provideHttpClientTesting(),
      { provide: WCL_TRANSPORT, useValue: {} },
      // The spec-meta read fires as the graph builds, so the transport answers it rather than rejecting.
      { provide: DATA_FILE_TRANSPORT, useValue: { readJson: async () => Results.missing('No data files in this test.') } },
    ],
  });
}

describe('liveDataSourceProviders', () => {
  it('runs every bench whose recipe reads a rulebook through one derived in the browser', () => {
    configure();
    expect(TestBed.inject(BURST_DATA_SOURCE)).toBeInstanceOf(LiveRulebookDataSource);
    expect(TestBed.inject(ROTATION_DATA_SOURCE)).toBeInstanceOf(LiveRulebookDataSource);
    expect(TestBed.inject(DEFENSIVE_DATA_SOURCE)).toBeInstanceOf(LiveRulebookDataSource);
    expect(TestBed.inject(NORTHERN_SKY_DATA_SOURCE)).toBeInstanceOf(LiveRulebookDataSource);
  });

  it('leaves a bench that reads the log alone as the transform itself', () => {
    configure();
    expect(TestBed.inject(GEAR_DATA_SOURCE)).toBeInstanceOf(GearTransformService);
    expect(TestBed.inject(MAP_DATA_SOURCE)).toBeInstanceOf(MapTransformService);
  });
});
