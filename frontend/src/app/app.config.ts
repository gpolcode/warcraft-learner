import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { routes } from './app.routes';
import { WCL_TRANSPORT } from './core/services/wcl-transport';
import { HttpWclTransport } from './core/services/http-wcl-transport';
import { provideWclCaching } from './core/services/wcl-caching';
import { DATA_FILE_TRANSPORT, HttpDataFileTransport } from './core/services/data-file-transport';
import { DataFileApiService } from './core/services/data-file-api';
import { retryTransientInterceptor } from './core/interceptors/retry-transient.interceptor';
import { hydrateSpecMeta } from './core/spec-meta';
import { environmentProviders } from '../environments/environment';

const GITHUB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577
    0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756
    -1.089-.745.083-.73.083-.73 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997
    .107-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.465-2.381 1.235-3.221
    -.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138
    3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221
    0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286
    0 .315.21.69.825.57C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
</svg>`;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    // Every request rides this HttpClient, so the retry-transient interceptor covers
    // both the WCL GraphQL POSTs and the static data-file GETs from one place.
    // withInterceptorsFromDi() lets the ng-http-caching interceptor (a DI-registered
    // class interceptor, see provideWclCaching below) join the same chain.
    provideHttpClient(withFetch(), withInterceptors([retryTransientInterceptor]), withInterceptorsFromDi()),
    provideAppInitializer(async () => {
      // Hydrate the spec-meta cache (folder -> class/spec names + icons) from the baked
      // spec-meta.json before anything renders, so the class/spec dropdowns, the icon pipes,
      // and getRankings resolve. One tiny (~40-entry) file fetch, blocking bootstrap.
      const dataFile = inject(DataFileApiService);
      // Bootstrap has no card to surface an error on, so a failed read degrades to an empty
      // universe (which then shows the empty dropdowns) rather than blocking the app.
      const specMeta = await dataFile.getSpecMeta();
      hydrateSpecMeta(specMeta.ok ? specMeta.value : []);
    }),
    // WCL response cache (in-memory, WCL endpoint only): dedupes the cache-first reads so
    // the five cards share one report/event fetch per session.
    provideWclCaching(),
    provideEnvironmentInitializer(() => {
      const iconRegistry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);
      iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
      iconRegistry.addSvgIconLiteral('github', sanitizer.bypassSecurityTrustHtml(GITHUB_SVG));
    }),
    { provide: WCL_TRANSPORT, useExisting: HttpWclTransport },
    // Data-file transport: HTTP read-only at runtime (the ingest environment overrides
    // this binding with the read+write file-server transport).
    { provide: DATA_FILE_TRANSPORT, useExisting: HttpDataFileTransport },
    // File-backed in production, live transforms under the dev flag, the full ingest
    // wiring in the ingest environment. The per-environment list keeps a production build
    // from importing (so it tree-shakes out) the five *TransformServices and the ingest
    // machinery, and being last lets an environment override the bindings above.
    ...environmentProviders,
  ],
};
