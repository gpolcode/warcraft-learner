import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { PetFacts } from './pet-facts';

const SUMMON_DARKGLARE = 205180;
const DARKGLARE_S = 20;
const PROBE = 999;
const list = priorityList({ spells: { summon_darkglare: planSpell('Summon Darkglare', [SUMMON_DARKGLARE], { duration: DARKGLARE_S }) } });
const pets = TestBed.inject(PetFacts);

const read = (name: string, atS: number) => {
  const ctx = factContext(list, { casts: [cast(SUMMON_DARKGLARE, 10), cast(PROBE, atS)] });
  return pets.read(name, castAt(ctx, atS), 'x', ctx);
};

describe('PetFacts', () => {
  it('reads a pet out for its summon\'s duration, and gone once it ran', () => {
    expect(read('pet.darkglare.active', 10 + DARKGLARE_S - 1)).toEqual([1, 1]);
    expect(read('pet.darkglare.active', 10 + DARKGLARE_S)).toEqual([0, 0]);
  });

  it('reads the time the pet has left', () => {
    expect(read('pet.darkglare.remains', 15)).toEqual([DARKGLARE_S - 5, DARKGLARE_S - 5]);
  });

  it('reads a pet no button of the spell data summons as unknown', () => {
    expect(read('pet.army_ghoul.active', 15)).toEqual(UNKNOWN);
  });
});
