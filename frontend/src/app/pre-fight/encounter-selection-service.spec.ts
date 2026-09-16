import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DataFileApiService } from '../domains/raid-analysis/data/data-files/data-file-api-service';
import { SpecMetaService } from '../domains/raid-analysis/data/data-files/spec-meta-service';
import { SpecMeta } from '../domains/raid-analysis/data/data-files/spec-meta.models';
import { EncounterEntry } from '../domains/raid-analysis/data/encounter/encounter.models';
import { Result, Results } from '../domains/shared/util-http/result';
import { EncounterSelectionService } from './encounter-selection-service';

const SPEC = 'SubtletyRogue';
const ROGUE = 'Rogue';

const BENCHED: EncounterEntry = { id: 3144, name: 'Boss A', sample_count: 12 };
const WAITING: EncounterEntry = { id: 3146, name: 'Boss C', sample_count: 0 };

const SUBTLETY: SpecMeta = {
  spec: SPEC, className: ROGUE, specName: 'Subtlety',
  classLabel: ROGUE, specLabel: 'Subtlety', classIcon: 'class_rogue',
};

const ROGUE_CLASS = { className: ROGUE, classLabel: ROGUE, classIcon: 'class_rogue' };

const specMeta = {
  classList: () => [ROGUE_CLASS],
  specsForClass: (className: string, available: string[]) =>
    className === ROGUE && available.includes(SPEC) ? [SUBTLETY] : [],
  resolve: (spec: string | null | undefined) => Promise.resolve(spec === SPEC ? SUBTLETY : undefined),
} as unknown as SpecMetaService;

function selectionService(encounters: Result<EncounterEntry[]> = Results.ok([])): EncounterSelectionService {
  const files = {
    getEncounters: (): Promise<Result<EncounterEntry[]>> => Promise.resolve(encounters),
  } as unknown as DataFileApiService;
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: DataFileApiService, useValue: files },
      { provide: SpecMetaService, useValue: specMeta },
    ],
  });
  return TestBed.inject(EncounterSelectionService);
}

describe('EncounterSelectionService', () => {
  it('returns every listed encounter, including a zero-sample one still waiting for parses', async () => {
    expect(await selectionService(Results.ok([BENCHED, WAITING])).getEncounters(SPEC)).toEqual(Results.ok([BENCHED, WAITING]));
  });

  it('lists the classes spec-meta knows', () => {
    expect(selectionService().classList()).toEqual([ROGUE_CLASS]);
  });

  it('lists the specs a class has among the available ones', () => {
    expect(selectionService().specsForClass(ROGUE, [SPEC])).toEqual([SUBTLETY]);
  });

  it('resolves a picked spec to its meta', async () => {
    expect(await selectionService().resolve(SPEC)).toEqual(SUBTLETY);
  });
});
