import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TalentKeyService } from './talent-key-service';
import { DEATHSTALKER_ENTRY, UNSEEN_BLADE_ENTRY } from '../../../../../testing/spell-ids';

const keys = TestBed.inject(TalentKeyService);

describe('takenEntryIds', () => {
  it('reads the entry ids a build took, skipping a node with no entry', () => {
    expect(keys.takenEntryIds([{ nodeID: 1, id: UNSEEN_BLADE_ENTRY, rank: 1 }, { nodeID: 2 }, { id: DEATHSTALKER_ENTRY }])).toEqual(new Set([UNSEEN_BLADE_ENTRY, DEATHSTALKER_ENTRY]));
  });

  it('reads an empty build off a tree with no picks', () => {
    expect(keys.takenEntryIds([])).toEqual(new Set());
  });

  it('reads an unknown build off a log with no combatant info', () => {
    expect(keys.takenEntryIds(undefined)).toBeNull();
  });
});
