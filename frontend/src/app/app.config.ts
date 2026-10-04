import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { WCL_TRANSPORT } from './domains/raid-analysis/data/wcl/wcl-transport';
import { HttpWclTransport } from './domains/raid-analysis/data/http/http-wcl-transport';
import { provideWclCaching } from './domains/raid-analysis/data/wcl/wcl-caching';
import { WclResponseStoreInterceptor } from './domains/raid-analysis/data/http/wcl-response-store-interceptor';
import { DATA_FILE_TRANSPORT } from './domains/raid-analysis/data/data-files/data-file-transport';
import { HttpDataFileTransport } from './domains/raid-analysis/data/http/http-data-file-transport';
import { provideAppHttp } from './domains/shared/util-http/http-providers';
import { TAIGA_PROVIDERS } from './domains/shared/util-taiga/taiga-providers';
import { ENVIRONMENT } from '../environments/environment-token';
import { environment, environmentProviders } from '../environments/environment';
// A missing module here means wcl-client.example.ts has not been copied to wcl-client.ts yet.
import { WCL_CLIENT_ID, WCL_CLIENT_SECRET } from '../environments/wcl-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppHttp(),
    provideWclCaching(environment.wclApiUrl),
    // After the memory cache: DI interceptors run in registration order, so a memory hit never reaches the store.
    { provide: HTTP_INTERCEPTORS, useClass: WclResponseStoreInterceptor, multi: true },
    ...TAIGA_PROVIDERS,
    { provide: ENVIRONMENT, useValue: { ...environment, wclClientId: WCL_CLIENT_ID, wclClientSecret: WCL_CLIENT_SECRET } },
    { provide: WCL_TRANSPORT, useExisting: HttpWclTransport },
    { provide: DATA_FILE_TRANSPORT, useExisting: HttpDataFileTransport },
    // Last so an environment can override the bindings above (the ingest one swaps the data-file transport).
    ...environmentProviders,
  ],
};
