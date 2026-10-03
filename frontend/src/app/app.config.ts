import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { provideHlmSidebarConfig } from '@spartan-ng/helm/sidebar';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';
import { WCL_TRANSPORT } from './domains/raid-analysis/data/wcl/wcl-transport';
import { HttpWclTransport } from './domains/raid-analysis/data/http/http-wcl-transport';
import { provideWclCaching } from './domains/raid-analysis/data/wcl/wcl-caching';
import { DATA_FILE_TRANSPORT } from './domains/raid-analysis/data/data-files/data-file-transport';
import { HttpDataFileTransport } from './domains/raid-analysis/data/http/http-data-file-transport';
import { provideAppHttp } from './domains/shared/util-http/http-providers';
import { APP_ICONS } from './domains/shared/ui-icon/app-icons';
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
    provideSpartanHlm(),
    // Every project on the github.io origin shares its cookies, so the remembered rail state gets an app-specific name.
    provideHlmSidebarConfig({ sidebarCookieName: 'wl_sidebar_state', sidebarCookieMaxAge: 60 * 60 * 24 * 365 }),
    // Root-level so a status icon named by the data layer resolves in any component.
    provideIcons(APP_ICONS),
    { provide: ENVIRONMENT, useValue: { ...environment, wclClientId: WCL_CLIENT_ID, wclClientSecret: WCL_CLIENT_SECRET } },
    { provide: WCL_TRANSPORT, useExisting: HttpWclTransport },
    { provide: DATA_FILE_TRANSPORT, useExisting: HttpDataFileTransport },
    // Last so an environment can override the bindings above (the ingest one swaps the data-file transport).
    ...environmentProviders,
  ],
};
