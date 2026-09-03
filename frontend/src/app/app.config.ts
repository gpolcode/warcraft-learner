import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { routes } from './app.routes';
import { WCL_TRANSPORT } from './domains/raid-analysis/data/wcl/wcl-transport';
import { HttpWclTransport } from './domains/raid-analysis/data/http/http-wcl-transport';
import { provideWclCaching } from './domains/raid-analysis/data/wcl/wcl-caching';
import { DATA_FILE_TRANSPORT } from './domains/raid-analysis/data/data-files/data-file-transport';
import { HttpDataFileTransport } from './domains/raid-analysis/data/http/http-data-file-transport';
import { provideAppHttp } from './domains/shared/util-http/http-providers';
import { environmentProviders } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppHttp(),
    provideWclCaching(),
    provideEnvironmentInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
    { provide: WCL_TRANSPORT, useExisting: HttpWclTransport },
    { provide: DATA_FILE_TRANSPORT, useExisting: HttpDataFileTransport },
    // Last so an environment can override the bindings above (the ingest one swaps the data-file transport).
    ...environmentProviders,
  ],
};
