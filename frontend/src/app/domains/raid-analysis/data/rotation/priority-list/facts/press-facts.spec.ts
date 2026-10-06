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
const read = (list: PriorityList, name: string, log: { casts: WclEvent[]; damage?: WclEvent[] }, atS: number, action = 'x'): Range => {
  const ctx = factContext(list, { casts: log.casts, damage: log.damage ?? [] });
  return presses.read(catalog.path(name, action), castAt(ctx, atS), ctx);
};

describe('PressFacts earlier presses', () => {
  const sequence = [cast(EVISCERATE, 1), cast(SHADOW_DANCE, 2), cast(UTILITY, 3), cast(SECRET_TECHNIQUE, 4)];
  const prior = (name: string, casts: WclEvent[], atS: number, action = 'x') => read(rogue, name, { casts }, atS, action);

  it('reads the last cast on the global cooldown, skipping off-GCD and utility presses', () => {
    expect(prior('prev_gcd.1.eviscerate', sequence, 4)).toEqual([1, 1]);
    expect(prior('prev_gcd.1.shadow_dance', sequence, 4)).toEqual([0, 0]);
  });

  it('reads further back on the global cooldown', () => {
    expect(prior('prev_gcd.2.secret_technique', [cast(SECRET_TECHNIQUE, 0.5), ...sequence], 4)).toEqual([1, 1]);
  });

  it('reads the last listed cast of any kind', () => {
    expect(prior('prev.shadow_dance', sequence, 4)).toEqual([1, 1]);
  });

  it('reads the off-GCD casts since the last one on it', () => {
    expect(prior('prev_off_gcd.shadow_dance', sequence, 4)).toEqual([1, 1]);
    expect(prior('prev_off_gcd.shadow_blades', sequence, 4)).toEqual([0, 0]);
  });

  it('reads a combo strike as a press that does not repeat the last one on the global cooldown', () => {
    expect(prior('combo_strike', sequence, 4, 'secret_technique')).toEqual([1, 1]);
    expect(prior('combo_strike', sequence, 4, 'eviscerate')).toEqual([0, 0]);
  });

  it('reads the seconds since a button was last pressed, and never for one never pressed', () => {
    expect(prior('action.eviscerate.last_used', sequence, 4)).toEqual([3, 3]);
    expect(prior('action.shadow_blades.last_used', sequence, 4)).toEqual([Infinity, Infinity]);
  });
});

describe('PressFacts shots and pets', () => {
  const recent = (name: string, atS: number, log: { casts: WclEvent[]; damage?: WclEvent[] }) => read(warlock, name, { ...log, casts: [...log.casts, cast(PROBE, atS)] }, atS, 'chaos_bolt');
  const bolt = (atS: number) => cast(CHAOS_BOLT, atS, { target: BOSS });
  const lands = (atS: number, spellId = CHAOS_BOLT) => damage(spellId, atS, 1, { target: BOSS });
  const tick = (atS: number) => ({ ...lands(atS, SIGIL_OF_FLAME), tick: true });

  it('reads a pet out for its summon\'s duration, and gone once it ran', () => {
    const casts = [cast(SUMMON_DARKGLARE, 10)];
    expect(recent('pet.darkglare.active', 10 + DARKGLARE_S - 1, { casts })).toEqual([1, 1]);
    expect(recent('pet.darkglare.active', 10 + DARKGLARE_S, { casts })).toEqual([0, 0]);
    expect(recent('pet.darkglare.remains', 15, { casts })).toEqual([DARKGLARE_S - 5, DARKGLARE_S - 5]);
  });

  it('reads a pet no button of the spell data summons as unknown', () => {
    expect(recent('pet.army_ghoul.active', 15, { casts: [cast(SUMMON_DARKGLARE, 10)] })).toEqual(UNKNOWN);
  });

  it('reads a shot in the air from its cast until it lands, under the line\'s own button or a named one', () => {
    const log = { casts: [bolt(10)], damage: [lands(11.5)] };
    expect(recent('in_flight', 11, log)).toEqual([1, 1]);
    expect(recent('action.chaos_bolt.in_flight', 11.5, log)).toEqual([0, 0]);
    expect(recent('action.chaos_bolt.in_flight_to_target', 11, log)).toEqual([1, 1]);
  });

  it('counts the shots in the air, each landing taking the oldest', () => {
    const log = { casts: [bolt(10), bolt(11)], damage: [lands(11.5)] };
    expect(recent('action.chaos_bolt.in_flight_count', 11.2, log)).toEqual([2, 2]);
    expect(recent('action.chaos_bolt.in_flight_count', 11.5, log)).toEqual([1, 1]);
  });

  it('never reads a spell that hits as it casts as in the air', () => {
    expect(recent('in_flight', 10.5, { casts: [bolt(10)], damage: [lands(10)] })).toEqual([0, 0]);
  });

  it('stops counting a shot the log never shows landing once it must have been lost', () => {
    const log = { casts: [bolt(10)] };
    expect(recent('in_flight', 10 + LOST_AFTER_S, log)).toEqual([1, 1]);
    expect(recent('in_flight', 10 + LOST_AFTER_S + 0.1, log)).toEqual([0, 0]);
  });

  it('reads the time until the shot lands, none for one not in the air, and unknown for one the log never lands', () => {
    expect(recent('action.chaos_bolt.in_flight_remains', 11, { casts: [bolt(10)], damage: [lands(11.5)] })).toEqual([0.5, 0.5]);
    expect(recent('action.chaos_bolt.in_flight_remains', 12, { casts: [bolt(10)], damage: [lands(11.5)] })).toEqual([0, 0]);
    expect(recent('action.chaos_bolt.in_flight_remains', 11, { casts: [bolt(10)] })).toEqual(UNKNOWN);
  });

  it('reads a sigil as placed until it goes off, its ticks after that counting for no landing', () => {
    const sigil = (atS: number) => cast(SIGIL_OF_FLAME, atS, { target: BOSS });
    const log = { casts: [sigil(10), sigil(15)], damage: [lands(12, SIGIL_OF_FLAME), tick(13), tick(14), tick(15), tick(16)] };
    expect(recent('action.sigil_of_flame.placed', 11, log)).toEqual([1, 1]);
    expect(recent('action.sigil_of_flame.placed', 12, log)).toEqual([0, 0]);
    expect(recent('action.sigil_of_flame.placed', 16.5, log)).toEqual([1, 1]);
  });
});

describe('PressFacts timing', () => {
  const timing = (name: string, casts: WclEvent[], atS: number, gcd?: number) => read(druid(gcd), name, { casts }, atS, 'starfire');
  const hardcast = (atS: number) => [beginCast(STARFIRE, atS), cast(STARFIRE, atS + STARFIRE_S * HASTE_FACTOR)];

  it('hastes a hasted global cooldown by the factor the log\'s hardcasts show', () => {
    expect(timing('gcd.max', [...hardcast(0), cast(WRATH, 5)], 5)).toEqual([BASE_GCD_S * HASTE_FACTOR, BASE_GCD_S * HASTE_FACTOR]);
  });

  it('keeps a one second global cooldown flat', () => {
    expect(timing('gcd.max', [cast(WRATH, 5)], 5, 1)).toEqual([1, 1]);
  });

  it('bounds the global cooldown by its floor and base when no hardcast narrows it', () => {
    expect(timing('gcd', [cast(WRATH, 5)], 5)).toEqual([0.75, BASE_GCD_S]);
  });

  it('reads a cast time hasted by the same factor, and an execute time no shorter than the global cooldown', () => {
    expect(timing('cast_time', [...hardcast(0), cast(WRATH, 5)], 5)).toEqual([STARFIRE_S * HASTE_FACTOR, STARFIRE_S * HASTE_FACTOR]);
    expect(timing('action.wrath.execute_time', [...hardcast(0), cast(WRATH, 5)], 5)).toEqual([BASE_GCD_S * HASTE_FACTOR, BASE_GCD_S * HASTE_FACTOR]);
  });

  it('reads an off-GCD cast as waiting on the last cast that spent the global cooldown', () => {
    expect(timing('gcd.remains', [cast(WRATH, 5), cast(OFF_GCD, 5.5)], 5.5, 1)).toEqual([0.5, 0.5]);
    expect(timing('gcd.remains', [cast(WRATH, 5)], 5, 1)).toEqual([0, 0]);
  });

  it('reads a cast made while another is still being cast', () => {
    const casts = [beginCast(STARFIRE, 10), cast(OFF_GCD, 11), cast(STARFIRE, 11.5)];
    expect(timing('action.starfire.executing', casts, 11)).toEqual([1, 1]);
    expect(timing('action.starfire.channeling', casts, 11)).toEqual([1, 1]);
    expect(timing('action.starfire.execute_remains', casts, 11)).toEqual([0.5, 0.5]);
    expect(timing('action.starfire.executing', casts, 11.5)).toEqual([0, 0]);
  });
});
