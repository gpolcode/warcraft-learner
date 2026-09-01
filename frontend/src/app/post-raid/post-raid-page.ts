import { assert } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Provider } from '@angular/core';
import { mapFeatureStub, stubBenchTokens } from '../../testing/page-stubs';
import { BURST_DATA_SOURCE } from '../domains/raid-analysis/data/burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from '../domains/raid-analysis/data/rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from '../domains/raid-analysis/data/defensive/defensive-data-source';
import { GEAR_DATA_SOURCE } from '../domains/raid-analysis/data/gear/gear-data-source';
import { MAP_DATA_SOURCE } from '../domains/raid-analysis/data/map/map-data-source';
import { NORTHERN_SKY_DATA_SOURCE } from '../domains/raid-analysis/data/northern-sky/northern-sky-data-source';
import { DataFileApiService } from '../domains/raid-analysis/data/data-files/data-file-api-service';
import { SpecMeta } from '../domains/raid-analysis/data/data-files/spec-meta.models';
import { Result, Results } from '../domains/shared/util-http/result';
import { LiveCaptureFeatureService } from '../domains/raid-analysis/data/live/live-capture-feature-service';
import { MapFeatureService } from '../domains/raid-analysis/data/map/map-feature-service';
import { PostRaid } from './post-raid';
import { postRaidProviders } from './post-raid-harness';

// A card cannot construct without its data source, so every feature the shell mounts one for is listed here.
const BENCH_TOKENS = [
  BURST_DATA_SOURCE, ROTATION_DATA_SOURCE, DEFENSIVE_DATA_SOURCE,
  GEAR_DATA_SOURCE, MAP_DATA_SOURCE, NORTHERN_SKY_DATA_SOURCE,
];

export const FIGHT_SELECT = 0;
export const PLAYER_SELECT = 1;

export interface PostRaidPage {
  submitReport(text: string): void;
  paste(text: string, opts?: { value?: string; start?: number; end?: number }): void;
  reportValue(): string;
  options(index: number): string[];
  choose(index: number, optionText: string): void;
  chosen(index: number): string;
  text(): string;
  settled(): Promise<void>;
}

/** `extraProviders` land last, so a test can override a harness default. */
export function postRaidPage(wclApi: unknown, extraProviders: Provider[] = []): PostRaidPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PostRaid],
    providers: [
      ...postRaidProviders(wclApi),
      // After the harness fake so it wins: the header's live controls read a surface the fake does not carry.
      LiveCaptureFeatureService,
      { provide: MapFeatureService, useValue: mapFeatureStub() },
      { provide: DataFileApiService, useValue: { getSpecMeta: (): Promise<Result<SpecMeta[]>> => Promise.resolve(Results.ok([])) } },
      ...stubBenchTokens(BENCH_TOKENS),
      ...extraProviders,
    ] as never[],
  });

  const fixture = TestBed.createComponent(PostRaid);
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

  // Not a Material harness: it awaits a stability the parked fetches never reach.
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
