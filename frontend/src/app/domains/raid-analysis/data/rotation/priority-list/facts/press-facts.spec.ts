import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { beginCast, cast, damage } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { EVISCERATE, SECRET_TECHNIQUE, SHADOW_BLADES, SHADOW_DANCE, STARFIRE, WRATH } from '../../../../../../../testing/spell-ids';
import type { PriorityList } from '../../../plan/plan.models';
import type { WclEvent } from '../../../wcl/wcl.models';
import { FactCatalogService } from '../fact-catalog-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';
import { PressFacts } from './press-facts';

const UTILITY = 999;
const PROBE = 998;
const BOSS = 1;
const SUMMON_DARKGLARE = 205180;
const DARKGLARE_S = 20;
const CHAOS_BOLT = 116858;
const SIGIL_OF_FLAME = 204596;
const BASE_GCD_S = 1.5;
const STARFIRE_S = 2;
/** A hardcast logged in 1.5 s of its 2 s base: the player cast at 0.75 of base time. */
const HASTE_FACTOR = 0.75;
const OFF_GCD = 777;
/** A shot the log never shows landing stops counting after this. */
const LOST_AFTER_S = 5;
const NEVER: Range = [Infinity, Infinity];
const presses = TestBed.inject(PressFacts);
const catalog = TestBed.inject(FactCatalogService);

const rogue = priorityList({
  spells: {
    secret_technique: planSpell('Secret Technique', [SECRET_TECHNIQUE]),
    eviscerate: planSpell('Eviscerate', [EVISCERATE]),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { gcd: 0 }),
    shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { gcd: 0 }),
  },
});
const warlock = priorityList({
  spells: {
    summon_darkglare: planSpell('Summon Darkglare', [SUMMON_DARKGLARE], { duration: DARKGLARE_S }),
    chaos_bolt: planSpell('Chaos Bolt', [CHAOS_BOLT]),
    sigil_of_flame: planSpell('Sigil of Flame', [SIGIL_OF_FLAME]),
  },
});
const druid = (gcd = BASE_GCD_S) => priorityList({
  lines: [{ action: 'wrath', terms: [] }],
  spells: {
    wrath: planSpell('Wrath', [WRATH], { gcd }),
    starfire: planSpell('Starfire', [STARFIRE], { gcd, cast_time: STARFIRE_S }),
    trinket: planSpell('Trinket', [OFF_GCD], { gcd: 0 }),
  },
});

interface Read {
  reads: string;
  name: string;
  casts: WclEvent[];
  atS: number;
  expected: Range;
  damage?: WclEvent[];
  action?: string;
  list?: PriorityList;
}

const read = ({ name, casts, damage = [], atS, action = 'x', list = rogue }: Read): Range => {
  const ctx = factContext(list, { casts, damage });
  return presses.read(catalog.path(name, action), castAt(ctx, atS), ctx);
};

describe('PressFacts earlier presses', () => {
  const sequence = [cast(EVISCERATE, 1), cast(SHADOW_DANCE, 2), cast(UTILITY, 3), cast(SECRET_TECHNIQUE, 4)];

  it.each<Read>([
    { reads: 'the last cast on the global cooldown, skipping off-GCD and utility presses', name: 'prev_gcd.1.eviscerate', casts: sequence, atS: 4, expected: [1, 1] },
    { reads: 'an off-GCD press as not the last on the global cooldown', name: 'prev_gcd.1.shadow_dance', casts: sequence, atS: 4, expected: [0, 0] },
    { reads: 'further back on the global cooldown', name: 'prev_gcd.2.secret_technique', casts: [cast(SECRET_TECHNIQUE, 0.5), ...sequence], atS: 4, expected: [1, 1] },
    { reads: 'the last listed cast of any kind', name: 'prev.shadow_dance', casts: sequence, atS: 4, expected: [1, 1] },
    { reads: 'the off-GCD casts since the last one on it', name: 'prev_off_gcd.shadow_dance', casts: sequence, atS: 4, expected: [1, 1] },
    { reads: 'an off-GCD cast before the last one on it as not among them', name: 'prev_off_gcd.shadow_blades', casts: sequence, atS: 4, expected: [0, 0] },
    { reads: 'a combo strike as a press that does not repeat the last one on the global cooldown', name: 'combo_strike', casts: sequence, atS: 4, expected: [1, 1], action: 'secret_technique' },
    { reads: 'a repeat as no combo strike', name: 'combo_strike', casts: sequence, atS: 4, expected: [0, 0], action: 'eviscerate' },
    { reads: 'the seconds since a button was last pressed', name: 'action.eviscerate.last_used', casts: sequence, atS: 4, expected: [3, 3] },
    { reads: 'a button never pressed as never', name: 'action.shadow_blades.last_used', casts: sequence, atS: 4, expected: NEVER },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});

describe('PressFacts shots and pets', () => {
  const bolt = (atS: number) => cast(CHAOS_BOLT, atS, { target: BOSS });
  const sigil = (atS: number) => cast(SIGIL_OF_FLAME, atS, { target: BOSS });
  const lands = (atS: number, spellId = CHAOS_BOLT) => damage(spellId, atS, 1, { target: BOSS });
  const tick = (atS: number) => ({ ...lands(atS, SIGIL_OF_FLAME), tick: true });
  const summoned = [cast(SUMMON_DARKGLARE, 10)];
  const flying = [bolt(10)];
  const landed = [lands(11.5)];
  const sigils = [sigil(10), sigil(15)];
  const sigilHits = [lands(12, SIGIL_OF_FLAME), tick(13), tick(14), tick(15), tick(16)];
  const recent = (row: Omit<Read, 'action' | 'list'>): Range => read({ ...row, casts: [...row.casts, cast(PROBE, row.atS)], action: 'chaos_bolt', list: warlock });

  it.each<Omit<Read, 'action' | 'list'>>([
    { reads: 'a pet out for its summon\'s duration', name: 'pet.darkglare.active', casts: summoned, atS: 10 + DARKGLARE_S - 1, expected: [1, 1] },
    { reads: 'a pet gone once its duration ran', name: 'pet.darkglare.active', casts: summoned, atS: 10 + DARKGLARE_S, expected: [0, 0] },
    { reads: 'the time the pet has left', name: 'pet.darkglare.remains', casts: summoned, atS: 15, expected: [DARKGLARE_S - 5, DARKGLARE_S - 5] },
    { reads: 'a pet no button of the spell data summons as unknown', name: 'pet.army_ghoul.active', casts: summoned, atS: 15, expected: UNKNOWN },
    { reads: 'a shot in the air from its cast, under the line\'s own button', name: 'in_flight', casts: flying, damage: landed, atS: 11, expected: [1, 1] },
    { reads: 'a shot as landed once the log shows its hit', name: 'action.chaos_bolt.in_flight', casts: flying, damage: landed, atS: 11.5, expected: [0, 0] },
    { reads: 'a shot in the air toward its target', name: 'action.chaos_bolt.in_flight_to_target', casts: flying, damage: landed, atS: 11, expected: [1, 1] },
    { reads: 'the shots in the air', name: 'action.chaos_bolt.in_flight_count', casts: [bolt(10), bolt(11)], damage: landed, atS: 11.2, expected: [2, 2] },
    { reads: 'each landing as taking the oldest shot', name: 'action.chaos_bolt.in_flight_count', casts: [bolt(10), bolt(11)], damage: landed, atS: 11.5, expected: [1, 1] },
    { reads: 'a spell that hits as it casts as never in the air', name: 'in_flight', casts: flying, damage: [lands(10)], atS: 10.5, expected: [0, 0] },
    { reads: 'a shot the log never shows landing as in the air until it must have been lost', name: 'in_flight', casts: flying, atS: 10 + LOST_AFTER_S, expected: [1, 1] },
    { reads: 'that shot as lost past that', name: 'in_flight', casts: flying, atS: 10 + LOST_AFTER_S + 0.1, expected: [0, 0] },
    { reads: 'the time until the shot lands', name: 'action.chaos_bolt.in_flight_remains', casts: flying, damage: landed, atS: 11, expected: [0.5, 0.5] },
    { reads: 'no time to land for a shot not in the air', name: 'action.chaos_bolt.in_flight_remains', casts: flying, damage: landed, atS: 12, expected: [0, 0] },
    { reads: 'the time to land as unknown for a shot the log never lands', name: 'action.chaos_bolt.in_flight_remains', casts: flying, atS: 11, expected: UNKNOWN },
    { reads: 'a sigil as placed until it goes off', name: 'action.sigil_of_flame.placed', casts: sigils, damage: sigilHits, atS: 11, expected: [1, 1] },
    { reads: 'a sigil as gone off at its first hit', name: 'action.sigil_of_flame.placed', casts: sigils, damage: sigilHits, atS: 12, expected: [0, 0] },
    { reads: 'a second sigil as placed, the first one\'s ticks counting for no landing', name: 'action.sigil_of_flame.placed', casts: sigils, damage: sigilHits, atS: 16.5, expected: [1, 1] },
  ])('reads $reads', row => {
    expect(recent(row)).toEqual(row.expected);
  });
});

describe('PressFacts timing', () => {
  const hardcast = (atS: number) => [beginCast(STARFIRE, atS), cast(STARFIRE, atS + STARFIRE_S * HASTE_FACTOR)];
  const hasted = [...hardcast(0), cast(WRATH, 5)];
  const casting = [beginCast(STARFIRE, 10), cast(OFF_GCD, 11), cast(STARFIRE, 11.5)];
  const timing = (row: Omit<Read, 'action' | 'list'> & { gcd?: number }): Range => read({ ...row, action: 'starfire', list: druid(row.gcd) });

  it.each<Omit<Read, 'action' | 'list'> & { gcd?: number }>([
    { reads: 'a hasted global cooldown by the factor the log\'s hardcasts show', name: 'gcd.max', casts: hasted, atS: 5, expected: [BASE_GCD_S * HASTE_FACTOR, BASE_GCD_S * HASTE_FACTOR] },
    { reads: 'a one second global cooldown as flat', name: 'gcd.max', casts: [cast(WRATH, 5)], atS: 5, expected: [1, 1], gcd: 1 },
    { reads: 'the global cooldown between its floor and base when no hardcast narrows it', name: 'gcd', casts: [cast(WRATH, 5)], atS: 5, expected: [0.75, BASE_GCD_S] },
    { reads: 'a cast time hasted by the same factor', name: 'cast_time', casts: hasted, atS: 5, expected: [STARFIRE_S * HASTE_FACTOR, STARFIRE_S * HASTE_FACTOR] },
    { reads: 'an execute time no shorter than the global cooldown', name: 'action.wrath.execute_time', casts: hasted, atS: 5, expected: [BASE_GCD_S * HASTE_FACTOR, BASE_GCD_S * HASTE_FACTOR] },
    { reads: 'an off-GCD cast as waiting on the last cast that spent the global cooldown', name: 'gcd.remains', casts: [cast(WRATH, 5), cast(OFF_GCD, 5.5)], atS: 5.5, expected: [0.5, 0.5], gcd: 1 },
    { reads: 'a cast on the global cooldown as waiting on nothing', name: 'gcd.remains', casts: [cast(WRATH, 5)], atS: 5, expected: [0, 0], gcd: 1 },
    { reads: 'a cast made while another is still being cast', name: 'action.starfire.executing', casts: casting, atS: 11, expected: [1, 1] },
    { reads: 'the same under SimC\'s channeling', name: 'action.starfire.channeling', casts: casting, atS: 11, expected: [1, 1] },
    { reads: 'the time left on the cast under way', name: 'action.starfire.execute_remains', casts: casting, atS: 11, expected: [0.5, 0.5] },
    { reads: 'a cast as done once it lands', name: 'action.starfire.executing', casts: casting, atS: 11.5, expected: [0, 0] },
  ])('reads $reads', row => {
    expect(timing(row)).toEqual(row.expected);
  });
});
