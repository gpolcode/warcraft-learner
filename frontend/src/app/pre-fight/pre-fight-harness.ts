import { assert } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncounterEntry, SpecEntry } from '../domains/raid-analysis/data/encounter/encounter.models';
import { SpecMeta } from '../domains/raid-analysis/data/data-files/spec-meta.models';
import { Result, Results } from '../domains/shared/util-http/result';
import { mapFeatureStub, stubBenchTokens } from '../../testing/page-stubs';
import { mountPortalLayer } from '../../testing/component-harness';
import { BURST_DATA_SOURCE } from '../domains/raid-analysis/data/burst-windows/burst-data-source';
import { ROTATION_DATA_SOURCE } from '../domains/raid-analysis/data/rotation/rotation-data-source';
import { DEFENSIVE_DATA_SOURCE } from '../domains/raid-analysis/data/defensive/defensive-data-source';
import { GEAR_DATA_SOURCE } from '../domains/raid-analysis/data/gear/gear-data-source';
import { MAP_DATA_SOURCE } from '../domains/raid-analysis/data/map/map-data-source';
import { NORTHERN_SKY_DATA_SOURCE } from '../domains/raid-analysis/data/northern-sky/northern-sky-data-source';
import { DataFileApiService } from '../domains/raid-analysis/data/data-files/data-file-api-service';
import { WclApiService } from '../domains/raid-analysis/data/wcl/wcl-api-service';
import { SelectionStore } from '../domains/raid-analysis/data/selection/selection-store';
import { MapFeatureService } from '../domains/raid-analysis/data/map/map-feature-service';
import { EncounterSelectionService } from './encounter-selection-service';
import { PreFight } from './pre-fight';

// A card cannot construct without its data source, so every feature the shell mounts one for is listed here.
const BENCH_TOKENS = [
  BURST_DATA_SOURCE, ROTATION_DATA_SOURCE, DEFENSIVE_DATA_SOURCE,
  GEAR_DATA_SOURCE, MAP_DATA_SOURCE, NORTHERN_SKY_DATA_SOURCE,
];

export const SUBTLETY_ROGUE = 'SubtletyRogue';
const ASSASSINATION_ROGUE = 'AssassinationRogue';
export const FROST_MAGE = 'FrostMage';

const meta = (spec: string, className: string, specLabel: string): SpecMeta => ({
  spec, className, specName: specLabel, classLabel: className, specLabel, classIcon: 'icon',
});

// Two Rogue specs so a spec change is reachable without also changing class.
const SPEC_META: SpecMeta[] = [
  meta(SUBTLETY_ROGUE, 'Rogue', 'Subtlety'),
  meta(ASSASSINATION_ROGUE, 'Rogue', 'Assassination'),
  meta(FROST_MAGE, 'Mage', 'Frost'),
];

export const SPEC_INDEX: SpecEntry[] = [
  { spec: SUBTLETY_ROGUE, encounter_count: 2 },
  { spec: ASSASSINATION_ROGUE, encounter_count: 2 },
  { spec: FROST_MAGE, encounter_count: 2 },
];

/** An index is addressable only once its gate opens: no spec select before a class, no encounter select before a spec. */
export const CLASS_SELECT = 0;
export const SPEC_SELECT = 1;
export const ENCOUNTER_SELECT = 2;

export type EncounterReads = Pick<EncounterSelectionService, 'getSpecs' | 'getEncounters'>;

export interface PreFightPage {
  readonly fixture: ComponentFixture<PreFight>;
  selectCount(): number;
  options(index: number): string[];
  choose(index: number, optionText: string): void;
  text(): string;
  /** The export card renders only while `selectedEncId()` holds, so its presence is the gate. */
  cardsShown(): boolean;
  settled(): Promise<void>;
  render(): void;
}

export type SavedSelection = Pick<SelectionStore, 'loadPreFight' | 'savePreFight'>;

const NO_SAVED_SELECTION: SavedSelection = { loadPreFight: () => null, savePreFight: () => undefined };

export function preFightPage(encounterSelection: EncounterReads, savedSelection: SavedSelection = NO_SAVED_SELECTION): PreFightPage {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PreFight],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MapFeatureService, useValue: mapFeatureStub() },
      {
        provide: SelectionStore,
        useValue: { ...savedSelection, loadNorthernSky: () => null, saveNorthernSky: () => undefined },
      },
      {
        provide: DataFileApiService,
        useValue: {
          getSpecMeta: (): Promise<Result<SpecMeta[]>> => Promise.resolve(Results.ok(SPEC_META)),
          getSpecs: (): Promise<Result<SpecEntry[]>> => encounterSelection.getSpecs(),
          getEncounters: (spec: string): Promise<Result<EncounterEntry[]>> => encounterSelection.getEncounters(spec),
        },
      },
      // Injected at construction by the gear card, never called on a benched-missing page.
      { provide: WclApiService, useValue: {} },
      ...stubBenchTokens(BENCH_TOKENS),
    ] as never[],
  });

  // A select's options open in the portal layer, outside the page.
  const portal = mountPortalLayer();
  const fixture = TestBed.createComponent(PreFight);
  fixture.detectChanges();

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const clean = (el: Element): string => el.textContent.replace(/\s+/g, ' ').trim();
  const render = (): void => { fixture.detectChanges(); };

  // Driven by hand: the page holds a pending task while encounters load, so `whenStable()` deadlocks on a parked read.
  const selectAt = (index: number): HTMLInputElement => {
    const select = host().querySelectorAll<HTMLInputElement>('input[tuiSelect]')[index];
    assert.exists(select);
    return select;
  };
  const openOptions = (index: number): HTMLElement[] => {
    selectAt(index).click();
    render();
    return Array.from(portal.querySelectorAll<HTMLElement>('[tuiOption]'));
  };
  // A second click on the select closes its options again.
  const closeOptions = (index: number): void => {
    selectAt(index).click();
    render();
  };

  return {
    fixture,
    selectCount: () => host().querySelectorAll('input[tuiSelect]').length,
    options(index) {
      const labels = openOptions(index).map(clean);
      closeOptions(index);
      return labels;
    },
    choose(index, optionText) {
      const option = openOptions(index).find(candidate => clean(candidate).includes(optionText));
      if (!option) throw new Error(`choose: select ${index} has no option matching "${optionText}"`);
      option.click();
      render();
    },
    text: () => clean(host()),
    cardsShown: () => host().querySelector('wl-northern-sky-export') !== null,
    settled: () => fixture.whenStable(),
    render,
  };
}

export class ParkedEncounterSelection {
  private readonly resolvers = new Map<string, (result: Result<EncounterEntry[]>) => void>();

  getSpecs(): Promise<Result<SpecEntry[]>> {
    return Promise.resolve(Results.ok(SPEC_INDEX));
  }

  getEncounters(spec: string): Promise<Result<EncounterEntry[]>> {
    return new Promise(resolve => this.resolvers.set(spec, resolve));
  }

  settle(spec: string, encounters: EncounterEntry[]): void {
    const resolve = this.resolvers.get(spec);
    assert.exists(resolve);
    resolve(Results.ok(encounters));
  }
}
