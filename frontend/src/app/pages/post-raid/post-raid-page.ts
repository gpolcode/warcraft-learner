/** Renders the post-raid page for real, so its specs paste into the same field and read the same selects a raider does. */
import { assert } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Provider } from '@angular/core';
import { mapFeatureStub, stubBenchTokens } from '../../../testing/page-stubs';
import { BURST_DATA_SOURCE } from './burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from './rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from './defensive/defensive-data-source';
import { GEAR_DATA_SOURCE } from './gear/gear-data-source';
import { MAP_DATA_SOURCE } from './map/map-data-source';
import { NORTHERN_SKY_DATA_SOURCE } from './northern-sky/northern-sky-data-source';
import { DataFileApiService } from '../../core/services/data-file-api';
import { SpecMeta } from '../../core/models/spec-meta.models';
import { Result, ok } from '../../core/result';
import { LiveCaptureFeatureService } from './live/live-capture.service';
import { MapFeatureService } from './map/map.service';
import { PostRaidComponent } from './post-raid';
import { postRaidProviders } from './post-raid-harness';

// Every slice the page shell mounts a card for; a card cannot construct without its data source.
const SLICE_TOKENS = [
  BURST_DATA_SOURCE, ROTATION_DATA_SOURCE, DEFENSIVE_DATA_SOURCE,
  GEAR_DATA_SOURCE, MAP_DATA_SOURCE, NORTHERN_SKY_DATA_SOURCE,
];

export const FIGHT_SELECT = 0;
export const PLAYER_SELECT = 1;

export interface PostRaidPage {
  /** Types into the report field and presses Enter, which is how a raider starts a load. */
  submitReport(text: string): void;
  /** Fires a real paste on the real input, honouring the caret and any selected range. */
  paste(text: string, opts?: { value?: string; start?: number; end?: number }): void;
  reportValue(): string;
  options(index: number): string[];
  choose(index: number, optionText: string): void;
  /** The label the closed select shows, which is what names the current fight or player on screen. */
  chosen(index: number): string;
  text(): string;
  /** Drains the page's pending loads and re-renders, so a read after it sees the settled screen. */
  settled(): Promise<void>;
}

/** `extraProviders` land last, so a test can override a harness default (a real store, recording slice tokens). */
export function postRaidPage(wclApi: unknown, extraProviders: Provider[] = []): PostRaidPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PostRaidComponent],
    providers: [
      ...postRaidProviders(wclApi),
      // The real service, after the harness fake so it wins: the live controls in the page header read its full surface.
      LiveCaptureFeatureService,
      { provide: MapFeatureService, useValue: mapFeatureStub() },
      // Feeds the class/spec icons behind the player select; the page never reads a data file itself.
      { provide: DataFileApiService, useValue: { getSpecMeta: (): Promise<Result<SpecMeta[]>> => Promise.resolve(ok([])) } },
      ...stubBenchTokens(SLICE_TOKENS),
      ...extraProviders,
    ] as never[],
  });

  const fixture = TestBed.createComponent(PostRaidComponent);
  fixture.detectChanges();

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const clean = (el: Element): string => el.textContent.replace(/\s+/g, ' ').trim();
  const render = (): void => { fixture.detectChanges(); };

  const reportInput = (): HTMLInputElement => {
    const input = host().querySelector<HTMLInputElement>('input[matInput]');
    assert.exists(input);
    return input;
  };

  const setValue = (value: string): void => {
    const input = reportInput();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    render();
  };

  const selectAt = (index: number): HTMLElement => {
    const select = host().querySelectorAll<HTMLElement>('mat-select')[index];
    assert.exists(select);
    return select;
  };

  // Driven by hand rather than through a Material harness, which would await a stability the parked fetches never reach.
  const openOptions = (index: number): HTMLElement[] => {
    const select = selectAt(index);
    const trigger = select.querySelector<HTMLElement>('.mat-mdc-select-trigger');
    assert.exists(trigger);
    trigger.click();
    render();
    const panelId = select.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    assert.exists(panel);
    return Array.from(panel.querySelectorAll<HTMLElement>('mat-option'));
  };

  return {
    submitReport(text) {
      setValue(text);
      reportInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      render();
    },
    paste(text, opts = {}) {
      const input = reportInput();
      const value = opts.value ?? '';
      input.value = value;
      input.selectionStart = opts.start ?? value.length;
      input.selectionEnd = opts.end ?? input.selectionStart;
      // happy-dom/jsdom will not construct a ClipboardEvent carrying data, so attach it to a real paste event.
      const event = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
      input.dispatchEvent(event);
      render();
    },
    reportValue: () => reportInput().value,
    options(index) {
      const labels = openOptions(index).map(clean);
      document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
      render();
      return labels;
    },
    choose(index, optionText) {
      const option = openOptions(index).find(candidate => clean(candidate).includes(optionText));
      if (!option) throw new Error(`choose: select ${index} has no option matching "${optionText}"`);
      option.click();
      render();
    },
    chosen(index) {
      const trigger = selectAt(index).querySelector('.mat-mdc-select-value');
      return trigger ? clean(trigger) : '';
    },
    text: () => clean(host()),
    // A report load settles in stages (report, then player details), so one pass can return mid-flight.
    async settled() {
      for (let pass = 0; pass < 3; pass++) {
        await fixture.whenStable();
        render();
      }
    },
  };
}
