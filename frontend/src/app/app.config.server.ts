import { ApplicationConfig, mergeApplicationConfig, signal } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { NEVER } from 'rxjs';
import { WA_ANIMATION_FRAME } from '@ng-web-apis/common';
import { TUI_BREAKPOINT } from '@taiga-ui/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { DATA_FILE_TRANSPORT } from './domains/raid-analysis/data/data-files/data-file-transport';
import { PrerenderDataFileTransport } from './domains/raid-analysis/data/data-files/prerender-data-file-transport';

export const serverConfig: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: DATA_FILE_TRANSPORT, useExisting: PrerenderDataFileTransport },
    // The server window has no requestAnimationFrame, which Taiga's scrollbar polls.
    { provide: WA_ANIMATION_FRAME, useValue: NEVER },
    // The build cannot know the viewport; desktop, where raiders read logs, is the layout that ships in the HTML.
    { provide: TUI_BREAKPOINT, useValue: signal('desktopLarge').asReadonly() },
  ],
});
