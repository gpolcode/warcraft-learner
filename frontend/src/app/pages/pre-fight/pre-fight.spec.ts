import { describe, it, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { EncounterEntry, SpecEntry } from '../../core/models/encounter.models';
import { LoadError, Result, ok } from '../../core/result';
import { mountVm } from '../../../testing/component-harness';
import { PreFightComponent } from './pre-fight';
import { EncounterSelectionService } from './encounter-selection.service';
import { MapFeatureService } from '../post-raid/map/map.service';
import { SelectionStore } from '../../core/services/selection-store';

// The template gates every feature card on `@if (selectedEncId())`, so 0 closes it.
const NO_ENCOUNTER = 0;
const SELECTED_ENCOUNTER_ID = 3144;
const NEW_SPEC = 'SubtletyRogue';

const BENCHED_ENCOUNTER: EncounterEntry = { id: SELECTED_ENCOUNTER_ID, name: 'Boss A', sample_count: 12 };

function providers(encounterSelection: Partial<EncounterSelectionService>): unknown[] {
  const mapFeature = { clear: (): void => undefined } as unknown as MapFeatureService;
  const selectionStore = { savePreFight: (): void => undefined } as unknown as SelectionStore;
  return [
    { provide: EncounterSelectionService, useValue: encounterSelection as EncounterSelectionService },
    { provide: MapFeatureService, useValue: mapFeature },
    { provide: SelectionStore, useValue: selectionStore },
  ];
}

function mountPreFight(encounters: EncounterEntry[] = [BENCHED_ENCOUNTER]) {
  return mountVm(PreFightComponent, {}, providers({
    getSpecs: (): Promise<Result<SpecEntry[], LoadError>> => Promise.resolve(ok([])),
    getEncounters: (_spec: string): Promise<Result<EncounterEntry[], LoadError>> => Promise.resolve(ok(encounters)),
  }));
}

function selectedEncId(vm: Record<string, unknown>): number {
  return (vm['selectedEncId'] as () => number)();
}

function pickEncounter(vm: Record<string, unknown>, id: number): void {
  const encControl = vm['encControl'] as FormControl<number>;
  encControl.enable();
  encControl.setValue(id);
}

describe('PreFightComponent stale-encounter reset', () => {
  it('closes the encounter-gated cards when the class changes', () => {
    const { vm } = mountPreFight();
    pickEncounter(vm, SELECTED_ENCOUNTER_ID);
    expect(selectedEncId(vm)).toBe(SELECTED_ENCOUNTER_ID);

    (vm['onClassChange'] as () => void)();

    expect(selectedEncId(vm)).toBe(NO_ENCOUNTER);
  });

  it('closes the encounter-gated cards when the spec changes', () => {
    const { vm } = mountPreFight();
    (vm['specControl'] as FormControl<string>).setValue(NEW_SPEC);
    pickEncounter(vm, SELECTED_ENCOUNTER_ID);
    expect(selectedEncId(vm)).toBe(SELECTED_ENCOUNTER_ID);

    (vm['onSpecChange'] as () => void)();

    expect(selectedEncId(vm)).toBe(NO_ENCOUNTER);
  });
});

describe('PreFightComponent encounter load latest-wins', () => {
  const SLOW_SPEC = 'SubtletyRogue';
  const NEWER_SPEC = 'FrostMage';
  const SLOW_ENCOUNTER: EncounterEntry = { id: 3129, name: 'Boss Slow', sample_count: 9 };
  const NEWER_ENCOUNTER: EncounterEntry = { id: 3131, name: 'Boss Newer', sample_count: 4 };

  class ParkedEncounterSelection {
    private readonly resolvers = new Map<string, (result: Result<EncounterEntry[], LoadError>) => void>();

    getSpecs(): Promise<Result<SpecEntry[], LoadError>> {
      return Promise.resolve(ok([]));
    }

    getEncounters(spec: string): Promise<Result<EncounterEntry[], LoadError>> {
      return new Promise(resolve => this.resolvers.set(spec, resolve));
    }

    settle(spec: string, encounters: EncounterEntry[]): void {
      this.resolvers.get(spec)!(ok(encounters));
    }
  }

  const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0));

  function setup(): { api: ParkedEncounterSelection; vm: Record<string, unknown> } {
    const api = new ParkedEncounterSelection();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        PreFightComponent,
        ...providers(api as unknown as EncounterSelectionService),
      ] as never[],
    });
    return { api, vm: TestBed.inject(PreFightComponent) as unknown as Record<string, unknown> };
  }

  function selectSpec(vm: Record<string, unknown>, spec: string): void {
    (vm['specControl'] as FormControl<string>).setValue(spec);
    (vm['onSpecChange'] as () => void)();
  }

  const encounterIds = (vm: Record<string, unknown>): number[] =>
    (vm['encounters'] as () => EncounterEntry[])().map(entry => entry.id);
  const loadingEncounters = (vm: Record<string, unknown>): boolean => (vm['loadingEncounters'] as () => boolean)();
  const encEnabled = (vm: Record<string, unknown>): boolean => (vm['encControl'] as FormControl<number>).enabled;

  it('shows the newer spec\'s encounters when responses arrive in order', async () => {
    const { api, vm } = setup();

    selectSpec(vm, SLOW_SPEC);
    api.settle(SLOW_SPEC, [SLOW_ENCOUNTER]);
    await flush();
    expect(encounterIds(vm)).toEqual([SLOW_ENCOUNTER.id]);

    selectSpec(vm, NEWER_SPEC);
    api.settle(NEWER_SPEC, [NEWER_ENCOUNTER]);
    await flush();

    expect(encounterIds(vm)).toEqual([NEWER_ENCOUNTER.id]);
    expect(encEnabled(vm)).toBe(true);
    expect(loadingEncounters(vm)).toBe(false);
  });

  it('keeps the newer spec\'s encounters when the earlier request resolves after it', async () => {
    const { api, vm } = setup();

    selectSpec(vm, SLOW_SPEC);
    selectSpec(vm, NEWER_SPEC);
    api.settle(NEWER_SPEC, [NEWER_ENCOUNTER]);
    await flush();
    api.settle(SLOW_SPEC, [SLOW_ENCOUNTER]);
    await flush();

    expect(encounterIds(vm)).toEqual([NEWER_ENCOUNTER.id]);
    expect(encEnabled(vm)).toBe(true);
    expect(loadingEncounters(vm)).toBe(false);
  });

  it('holds the loading indication until the pending request lands', async () => {
    const { api, vm } = setup();

    selectSpec(vm, NEWER_SPEC);
    await flush();
    expect(loadingEncounters(vm)).toBe(true);

    api.settle(NEWER_SPEC, [NEWER_ENCOUNTER]);
    await flush();
    expect(loadingEncounters(vm)).toBe(false);
  });
});
