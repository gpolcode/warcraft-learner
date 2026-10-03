import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TUI_BREAKPOINT } from '@taiga-ui/core';
import { serverConfig } from './app.config.server';
import { DATA_FILE_TRANSPORT } from './domains/raid-analysis/data/data-files/data-file-transport';
import { PrerenderDataFileTransport } from './domains/raid-analysis/data/data-files/prerender-data-file-transport';

function useServerConfig(): void {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: serverConfig.providers });
}

describe('serverConfig', () => {
  it('reads data files through the prerender transport, so no bench data bakes into the HTML', () => {
    useServerConfig();

    expect(TestBed.inject(DATA_FILE_TRANSPORT)).toBeInstanceOf(PrerenderDataFileTransport);
  });

  it('lays the page out for a desktop viewport, which the build cannot measure', () => {
    useServerConfig();

    expect(TestBed.inject(TUI_BREAKPOINT)()).toBe('desktopLarge');
  });
});
