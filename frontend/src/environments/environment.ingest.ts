/** Run `npm run data:pull` first: the signature-skip check compares against the published data. */
import { EnvironmentProviders, Provider, inject, provideAppInitializer } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { baseEnvironment } from './base-environment';
import { liveDataSourceProviders } from './live-data-sources';
import { DATA_FILE_TRANSPORT } from '../app/domains/raid-analysis/data/data-files/data-file-transport';
import { RETRY_MAX_ATTEMPTS, RETRY_TOO_MANY_REQUESTS } from '../app/domains/shared/util-http/retry-transient-interceptor';
import { WclRateLimitWaitInterceptor } from '../app/domains/raid-analysis/data/http/wcl-rate-limit-wait-interceptor';
import { IngestHttpDataFileTransport } from '../app/domains/raid-analysis/data/http/ingest-http-data-file-transport';
import { IngestOrchestratorService } from '../app/domains/raid-analysis/feature-ingest/ingest-orchestrator-service';

// Why 3: see RETRY_MAX_ATTEMPTS - unattended runs must ride out longer blips.
const INGEST_RETRY_MAX_ATTEMPTS = 3;

export const environment = baseEnvironment;

export const environmentProviders: (Provider | EnvironmentProviders)[] = [
  ...liveDataSourceProviders,
  { provide: DATA_FILE_TRANSPORT, useExisting: IngestHttpDataFileTransport },
  { provide: RETRY_MAX_ATTEMPTS, useValue: INGEST_RETRY_MAX_ATTEMPTS },
  { provide: RETRY_TOO_MANY_REQUESTS, useValue: false },
  // Registered after the response store, so a stored answer never waits.
  { provide: HTTP_INTERCEPTORS, useClass: WclRateLimitWaitInterceptor, multi: true },
  provideAppInitializer(() => {
    // Not awaited: the app shell must render while ingestion runs; run() owns its failures.
    void inject(IngestOrchestratorService).run();
  }),
];
