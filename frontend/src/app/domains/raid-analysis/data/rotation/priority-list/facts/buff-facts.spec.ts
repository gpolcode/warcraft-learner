import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, applyBuffStack, cast, removeBuff } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { MAELSTROM_WEAPON, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { BuffFacts } from './buff-facts';

const DANCE_S = 8;
const MAX_STACKS = 10;
const list = priorityList({
  spells: {
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { duration: DANCE_S }),
    maelstrom_weapon: planSpell('Maelstrom Weapon', [MAELSTROM_WEAPON], { max_stacks: MAX_STACKS }),
    roll_the_bones: planSpell('Roll the Bones', [1214909]),
  },
});
const buffs = TestBed.inject(BuffFacts);

const read = (name: string, events: WclEvent[], atS: number) => {
  const ctx = factContext(list, { casts: [cast(1, atS)], buffs: events });
  return buffs.read(name, castAt(ctx, atS), 'x', ctx);
};

describe('BuffFacts', () => {
  const dance = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 10 + DANCE_S)];

  it('reads a buff up going into the cast, the removal second included', () => {
    expect(read('buff.shadow_dance.up', dance, 10 + DANCE_S)).toEqual([1, 1]);
    expect(read('buff.shadow_dance.down', dance, 10 + DANCE_S)).toEqual([0, 0]);
  });

  it('reads a buff the cast itself applies as not yet up', () => {
    expect(read('buff.shadow_dance.up', dance, 10)).toEqual([0, 0]);
  });

  it('reads the time left from the log where the buff ran its course', () => {
    expect(read('buff.shadow_dance.remains', dance, 12)).toEqual([DANCE_S - 2, DANCE_S - 2]);
  });

  it('reads the time left of a buff consumed early as spanning its drop and its due end', () => {
    const consumed = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 13)];
    expect(read('buff.shadow_dance.remains', consumed, 12)).toEqual([1, DANCE_S - 2]);
  });

  it('reads a buff\'s stacks, and its stacks at the cap', () => {
    const stacked = [applyBuff(MAELSTROM_WEAPON, 1), applyBuffStack(MAELSTROM_WEAPON, 2, MAX_STACKS)];
    expect(read('buff.maelstrom_weapon.stack', stacked, 3)).toEqual([MAX_STACKS, MAX_STACKS]);
    expect(read('buff.maelstrom_weapon.at_max_stacks', stacked, 3)).toEqual([1, 1]);
    expect(read('buff.maelstrom_weapon.at_max_stacks', stacked.slice(0, 1), 3)).toEqual([0, 0]);
  });

  it('reads the spell data\'s duration and stack cap', () => {
    expect(read('buff.shadow_dance.duration', [], 1)).toEqual([DANCE_S, DANCE_S]);
    expect(read('buff.maelstrom_weapon.max_stack', [], 1)).toEqual([MAX_STACKS, MAX_STACKS]);
  });

  it('reads a buff the log never shows as unknown, since SimC tracks some no game aura backs', () => {
    expect(read('buff.roll_the_bones.up', dance, 12)).toEqual(UNKNOWN);
  });

  it('reads a buff the spell data does not name as unknown', () => {
    expect(read('buff.hidden_opportunity.up', dance, 12)).toEqual(UNKNOWN);
  });
});
