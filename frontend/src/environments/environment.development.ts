/** Dev environment: binds every `*_DATA_SOURCE` token to its `*TransformService`, so a run analyzes a fresh log instead of reading ingested files. */
import { Provider } from '@angular/core';
import { withEnvironment } from './base-environment';
import { liveDataSourceProviders } from './live-data-sources';

export const environment = withEnvironment({});

export const environmentProviders: Provider[] = liveDataSourceProviders;
