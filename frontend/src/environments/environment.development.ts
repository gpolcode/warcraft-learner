import { Provider } from '@angular/core';
import { baseEnvironment } from './base-environment';
import { liveDataSourceProviders } from './live-data-sources';

export const environment = baseEnvironment;

export const environmentProviders: Provider[] = liveDataSourceProviders;
