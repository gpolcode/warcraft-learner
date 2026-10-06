import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { beginCast, cast, damage } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { EVISCERATE, SECRET_TECHNIQUE, SHADOW_BLADES, SHADOW_DANCE, STARFIRE, WRATH } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';

const BASE_GCD_S = 1.5;
const STARFIRE_S = 2;
/** A hardcast logged in 1.5 s of its 2 s base: the player cast at 0.75 of base time. */
const HASTE_FACTOR = 0.75;
const GCD_FLOOR_S = 0.75;
const OFF_GCD = 777;
const UTILITY = 999;
const PROBE = 998;
const SUMMON_DARKGLARE = 205180;
const DARKGLARE_S = 20;
const CHAOS_BOLT = 116858;
const SIGIL_OF_FLAME = 204596;
const BOSS = 1;
/** A shot the log never shows landing stops counting after this. */
const LOST_AFTER_S = 5;
const evaluator = TestBed.inject(ConditionEvalService);
const list = (gcd = BASE_GCD_S) => priorityList({
  lines: [{ action: 'wrath', terms: [] }],
  spells: {
    wrath: planSpell('Wrath', [WRATH], { gcd }),
    starfire: planSpell('Starfire', [STARFIRE], { gcd, cast_time: STARFIRE_S }),
    trinket: planSpell('Trinket', [OFF_GCD], { gcd: 0 }),
    secret_technique: planSpell('Secret Technique', [SECRET_TECHNIQUE], { gcd }),
    eviscerate: planSpell('Eviscerate', [EVISCERATE], { gcd }),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { gcd: 0 }),
    shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { gcd: 0 }),
    summon_darkglare: planSpell('Summon Darkglare', [SUMMON_DARKGLARE], { duration: DARKGLARE_S, gcd }),
    chaos_bolt: planSpell('Chaos Bolt', [CHAOS_BOLT], { gcd }),
    sigil_of_flame: planSpell('Sigil of Flame', [SIGIL_OF_FLAME], { gcd }),
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
  gcd?: number;
}

/** The read happens at the cast at `atS`, a probe added where the casts hold none. */
const read = ({ name, casts, damage: hits = [], atS, action = 'starfire', gcd }: Read): Range => {
  const probed = casts.some(event => event.timestamp === atS * 1000) ? casts : [...casts, cast(PROBE, atS)];
  const ctx = factContext(list(gcd), { casts: probed, damage: hits });
  return evaluator.read(name, castAt(ctx, atS), action, ctx);
};
const hardcast = (atS: number): WclEvent[] => [beginCast(STARFIRE, atS), cast(STARFIRE, atS + STARFIRE_S * HASTE_FACTOR)];
const bolt = (atS: number): WclEvent => cast(CHAOS_BOLT, atS, { target: BOSS });
const lands = (atS: number, spellId = CHAOS_BOLT): WclEvent => damage(spellId, atS, 1, { target: BOSS });
const tick = (atS: number): WclEvent => ({ ...lands(atS, SIGIL_OF_FLAME), tick: true });

describe('PressFacts timing', () => {
  it.each<Read>([
    { reads: 'a hasted global cooldown by the factor the log\'s hardcasts show', name: 'gcd.max', casts: [...hardcast(0), cast(WRATH, 5)], atS: 5, expected: [BASE_GCD_S * HASTE_FACTOR, BASE_GCD_S * HASTE_FACTOR] },
    { reads: 'a one second global cooldown as flat', name: 'gcd.max', casts: [cast(WRATH, 5)], atS: 5, gcd: 1, expected: [1, 1] },
    { reads: 'the global cooldown between its floor and base when no hardcast narrows it', name: 'gcd', casts: [cast(WRATH, 5)], atS: 5, expected: [GCD_FLOOR_S, BASE_GCD_S] },
    { reads: 'a cast time hasted by the same factor', name: 'cast_time', casts: [...hardcast(0), cast(WRATH, 5)], atS: 5, expected: [STARFIRE_S * HASTE_FACTOR, STARFIRE_S * HASTE_FACTOR] },
    { reads: 'the execute time as the longer of the cast time and the global cooldown', name: 'execute_time', casts: [...hardcast(0), cast(WRATH, 5)], atS: 5, expected: [STARFIRE_S * HASTE_FACTOR, STARFIRE_S * HASTE_FACTOR] },
    { reads: 'an off-GCD cast as waiting on the last cast that spent the global cooldown', name: 'gcd.remains', casts: [cast(WRATH, 5), cast(OFF_GCD, 5.5)], atS: 5.5, gcd: 1, expected: [0.5, 0.5] },
    { reads: 'a cast on the global cooldown as waiting on nothing', name: 'gcd.remains', casts: [cast(WRATH, 5)], atS: 5, gcd: 1, expected: [0, 0] },
    { reads: 'a cast made while another is still being cast', name: 'action.starfire.executing', casts: [beginCast(STARFIRE, 10), cast(OFF_GCD, 11), cast(STARFIRE, 11.5)], atS: 11, expected: [1, 1] },
    { reads: 'the time left on that cast', name: 'action.starfire.execute_remains', casts: [beginCast(STARFIRE, 10), cast(OFF_GCD, 11), cast(STARFIRE, 11.5)], atS: 11, expected: [0.5, 0.5] },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});

describe('PressFacts recent casts', () => {
  const summoned = [cast(SUMMON_DARKGLARE, 10)];
  const sigil = (atS: number): WclEvent => cast(SIGIL_OF_FLAME, atS, { target: BOSS });
  const sigils = { casts: [sigil(10), sigil(15)], damage: [lands(12, SIGIL_OF_FLAME), tick(13), tick(14), tick(15), tick(16)] };

  it.each<Read>([
    { reads: 'a pet out for its summon\'s duration', name: 'pet.darkglare.active', casts: summoned, atS: 10 + DARKGLARE_S - 1, expected: [1, 1] },
    { reads: 'a pet gone once its summon ran', name: 'pet.darkglare.active', casts: summoned, atS: 10 + DARKGLARE_S, expected: [0, 0] },
    { reads: 'the time the pet has left', name: 'pet.darkglare.remains', casts: summoned, atS: 15, expected: [DARKGLARE_S - 5, DARKGLARE_S - 5] },
    { reads: 'a pet no button of the spell data summons as unknown', name: 'pet.army_ghoul.remains', casts: summoned, atS: 15, expected: UNKNOWN },
    { reads: 'a shot in the air from its cast until it lands, under the line\'s own button', name: 'in_flight', casts: [bolt(10)], damage: [lands(11.5)], atS: 11, action: 'chaos_bolt', expected: [1, 1] },
    { reads: 'the shot landed under a named button', name: 'action.chaos_bolt.in_flight', casts: [bolt(10)], damage: [lands(11.5)], atS: 11.5, expected: [0, 0] },
    { reads: 'the shots in the air, each landing taking the oldest', name: 'action.chaos_bolt.in_flight_count', casts: [bolt(10), bolt(11)], damage: [lands(11.5)], atS: 11.2, expected: [2, 2] },
    { reads: 'one shot left once the first landed', name: 'action.chaos_bolt.in_flight_count', casts: [bolt(10), bolt(11)], damage: [lands(11.5)], atS: 11.5, expected: [1, 1] },
    { reads: 'a spell that hits as it casts as never in the air', name: 'in_flight', casts: [bolt(10)], damage: [lands(10)], atS: 10.5, action: 'chaos_bolt', expected: [0, 0] },
    { reads: 'a shot the log never shows landing as in the air until it must have been lost', name: 'in_flight', casts: [bolt(10)], atS: 10 + LOST_AFTER_S, action: 'chaos_bolt', expected: [1, 1] },
    { reads: 'that shot as lost past then', name: 'in_flight', casts: [bolt(10)], atS: 10 + LOST_AFTER_S + 0.1, action: 'chaos_bolt', expected: [0, 0] },
    { reads: 'the time until the shot lands', name: 'action.chaos_bolt.in_flight_remains', casts: [bolt(10)], damage: [lands(11.5)], atS: 11, expected: [0.5, 0.5] },
    { reads: 'no time to land for a shot not in the air', name: 'action.chaos_bolt.in_flight_remains', casts: [bolt(10)], damage: [lands(11.5)], atS: 12, expected: [0, 0] },
    { reads: 'the time to land as unknown for a shot the log never lands', name: 'action.chaos_bolt.in_flight_remains', casts: [bolt(10)], atS: 11, expected: UNKNOWN },
    { reads: 'a sigil as placed until it goes off', name: 'action.sigil_of_flame.placed', ...sigils, atS: 11, expected: [1, 1] },
    { reads: 'a sigil as gone off, its ticks counting for no landing', name: 'action.sigil_of_flame.placed', ...sigils, atS: 12, expected: [0, 0] },
    { reads: 'a second sigil as placed while the first still ticks', name: 'action.sigil_of_flame.placed', ...sigils, atS: 16.5, expected: [1, 1] },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});

describe('PressFacts prior casts', () => {
  const sequence = [cast(EVISCERATE, 1), cast(SHADOW_DANCE, 2), cast(UTILITY, 3), cast(SECRET_TECHNIQUE, 4)];
  const longer = [cast(SECRET_TECHNIQUE, 0.5), ...sequence];

  it.each<Read>([
    { reads: 'the last cast on the global cooldown, skipping off-GCD and utility presses', name: 'prev_gcd.1.eviscerate', casts: sequence, atS: 4, expected: [1, 1] },
    { reads: 'an off-GCD press as not the last on the global cooldown', name: 'prev_gcd.1.shadow_dance', casts: sequence, atS: 4, expected: [0, 0] },
    { reads: 'further back on the global cooldown', name: 'prev_gcd.2.secret_technique', casts: longer, atS: 4, expected: [1, 1] },
    { reads: 'the last listed cast of any kind', name: 'prev.shadow_dance', casts: sequence, atS: 4, expected: [1, 1] },
    { reads: 'an off-GCD cast since the last one on the global cooldown', name: 'prev_off_gcd.shadow_dance', casts: sequence, atS: 4, expected: [1, 1] },
    { reads: 'an off-GCD button not pressed since then', name: 'prev_off_gcd.shadow_blades', casts: sequence, atS: 4, expected: [0, 0] },
    { reads: 'a combo strike as a press that does not repeat the last one on the global cooldown', name: 'combo_strike', casts: sequence, atS: 4, action: 'secret_technique', expected: [1, 1] },
    { reads: 'a repeat as no combo strike', name: 'combo_strike', casts: sequence, atS: 4, action: 'eviscerate', expected: [0, 0] },
    { reads: 'the seconds since a button was last pressed', name: 'action.eviscerate.last_used', casts: sequence, atS: 4, expected: [3, 3] },
    { reads: 'a button never pressed as last used never', name: 'action.shadow_blades.last_used', casts: sequence, atS: 4, expected: [Infinity, Infinity] },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
