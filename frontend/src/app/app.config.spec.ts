import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TUI_ICON_REGISTRY } from '@taiga-ui/core';
import { appConfig } from './app.config';

// The statusIcon names the burst and defensive window services emit; one missing from the registry renders as an empty box.
const DATA_LAYER_ICONS = ['schedule', 'error', 'help_outline', 'check_circle', 'insights', 'warning_amber'];
const INLINE_SVG = /^"data:image\/svg\+xml/;

describe('appConfig icon registry', () => {
  it('inlines every status icon the data layer names, so none is fetched from an icon folder the deploy never ships', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: appConfig.providers });
    const registry = TestBed.inject(TUI_ICON_REGISTRY);

    for (const name of DATA_LAYER_ICONS) expect(registry[name]).toMatch(INLINE_SVG);
  });
});
