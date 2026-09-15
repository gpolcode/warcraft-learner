import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TalentKeyService } from './talent-key-service';

const keys = TestBed.inject(TalentKeyService);

const UNSEEN_BLADE = 125_700;
const DEATHSTALKER = 123_373;

describe('TalentKeyService.takenEntryIds', () => {
  it('reads the entry ids a build took, skipping a node with no entry', () => {
    expect(keys.takenEntryIds([{ nodeID: 1, id: UNSEEN_BLADE, rank: 1 }, { nodeID: 2 }, { id: DEATHSTALKER }])).toEqual(new Set([UNSEEN_BLADE, DEATHSTALKER]));
  });

  it('reads an unknown build off a log with no combatant info', () => {
    expect(keys.takenEntryIds(undefined)).toBeNull();
    expect(keys.takenEntryIds([])).toEqual(new Set());
  });
});
