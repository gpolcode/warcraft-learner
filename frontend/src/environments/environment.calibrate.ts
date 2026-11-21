/** Run `npm run data:pull` first: the check recomputes calibration from the published benches and compares it with the published index. */
import { EnvironmentProviders, Provider, inject, provideAppInitializer } from '@angular/core';
import { baseEnvironment } from './base-environment';
import { liveDataSourceProviders } from './live-data-sources';
import { DATA_FILE_TRANSPORT } from '../app/domains/raid-analysis/data/data-files/data-file-transport';
import { IngestHttpDataFileTransport } from '../app/domains/raid-analysis/data/http/ingest-http-data-file-transport';
import { CalibrationCheckService } from '../app/domains/raid-analysis/feature-ingest/calibration-check-service';

export const environment = baseEnvironment;

export const environmentProviders: (Provider | EnvironmentProviders)[] = [
  // The page shell still injects every card's source; nothing in a recompute calls one.
  ...liveDataSourceProviders,
  { provide: DATA_FILE_TRANSPORT, useExisting: IngestHttpDataFileTransport },
  provideAppInitializer(() => {
    // Not awaited, as ingest: run() owns its failures and publishes its own exit signal.
    void inject(CalibrationCheckService).run();
  }),
];
