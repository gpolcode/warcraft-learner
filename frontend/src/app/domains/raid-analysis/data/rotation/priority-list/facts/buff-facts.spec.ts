import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, applyBuffStack, cast, removeBuff } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { DARKEST_NIGHT, MAELSTROM_WEAPON, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { BuffFacts } from './buff-facts';

const DANCE_S = 8;
const MAX_STACKS = 10;
/** Envenom's own buff lands 1 ms ahead of its cast. */
const OWN_EFFECT_LEAD_S = 0.001;
/** The Stealth a Garrote breaks drops 13 ms ahead of it. */
const CONSUMED_LEAD_S = 0.013;
/** Bladestorm fired 18 ms after the Recklessness it was macroed with. */
const MACRO_GAP_S = 0.018;
const DARKEST_NIGHT_ENTRY = 117739;
const OTHER_ENTRY = 117101;
const list = priorityList({
  spells: {
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { duration: DANCE_S }),
    maelstrom_weapon: planSpell('Maelstrom Weapon', [MAELSTROM_WEAPON], { max_stacks: MAX_STACKS }),
    roll_the_bones: planSpell('Roll the Bones', [1214909]),
    darkest_night: planSpell('Darkest Night', [DARKEST_NIGHT]),
  },
  talents: { 'talent.darkest_night': { name: 'Darkest Night', entries: [DARKEST_NIGHT_ENTRY] } },
});
const buffs = TestBed.inject(BuffFacts);

const read = (name: string, events: WclEvent[], atS: number, talents?: [number, number][]) => {
  const ctx = factContext(list, { casts: [cast(1, atS)], buffs: events, ...(talents ? { talents } : {}) });
  return buffs.read(name, castAt(ctx, atS), 'x', ctx);
};

describe('BuffFacts', () => {
  const dance = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 10 + DANCE_S)];

  it('reads a buff up going into the cast, the removal second included', () => {
    expect(read('buff.shadow_dance.up', dance, 10 + DANCE_S)).toEqual([1, 1]);
    expect(read('buff.shadow_dance.down', dance, 10 + DANCE_S)).toEqual([0, 0]);
  });

  it('reads a buff whose first event is its removal as up from the pull until that removal', () => {
    const upAtPull = [removeBuff(SHADOW_DANCE, DANCE_S)];
    expect(read('buff.shadow_dance.up', upAtPull, DANCE_S - 1)).toEqual([1, 1]);
    expect(read('buff.shadow_dance.up', upAtPull, DANCE_S + 1)).toEqual([0, 0]);
  });

  it('reads a buff the cast itself applies as not yet up', () => {
    expect(read('buff.shadow_dance.up', dance, 10)).toEqual([0, 0]);
  });

  it('reads a buff the log stamps just ahead of the cast that applies it as not yet up', () => {
    expect(read('buff.shadow_dance.up', [applyBuff(SHADOW_DANCE, 10 - OWN_EFFECT_LEAD_S)], 10)).toEqual([0, 0]);
  });

  it('reads a buff the log drops just ahead of the cast that consumes it as still up', () => {
    expect(read('buff.shadow_dance.up', [applyBuff(SHADOW_DANCE, 1), removeBuff(SHADOW_DANCE, 10 - CONSUMED_LEAD_S)], 10)).toEqual([1, 1]);
  });

  it('reads a buff an earlier press applied just ahead of the cast as up, since that press came first', () => {
    const ctx = factContext(list, { casts: [cast(2, 10 - MACRO_GAP_S), cast(1, 10)], buffs: [applyBuff(SHADOW_DANCE, 10 - MACRO_GAP_S)] });
    expect(buffs.read('buff.shadow_dance.up', castAt(ctx, 10), 'x', ctx)).toEqual([1, 1]);
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

  it('reads a buff the log never shows as down when only a talent the player did not take grants it', () => {
    expect(read('buff.darkest_night.up', [], 12, [[OTHER_ENTRY, 1]])).toEqual([0, 0]);
    expect(read('buff.darkest_night.down', [], 12, [[OTHER_ENTRY, 1]])).toEqual([1, 1]);
  });

  it('reads that buff as unknown when the player took the talent, or the log carries no talents', () => {
    expect(read('buff.darkest_night.up', [], 12, [[DARKEST_NIGHT_ENTRY, 1]])).toEqual(UNKNOWN);
    expect(read('buff.darkest_night.up', [], 12)).toEqual(UNKNOWN);
  });

  it('reads a buff the spell data does not name as unknown', () => {
    expect(read('buff.hidden_opportunity.up', dance, 12)).toEqual(UNKNOWN);
  });
});
