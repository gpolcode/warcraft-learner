import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, damage } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import type { WclEvent } from '../../../wcl/wcl.models';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
import { RecentCastFacts } from './recent-cast-facts';

const SUMMON_DARKGLARE = 205180;
const DARKGLARE_S = 20;
const CHAOS_BOLT = 116858;
const SIGIL_OF_FLAME = 204596;
const PROBE = 999;
const BOSS = 1;
/** A shot the log never shows landing stops counting after this. */
const LOST_AFTER_S = 5;
const list = priorityList({
  spells: {
    summon_darkglare: planSpell('Summon Darkglare', [SUMMON_DARKGLARE], { duration: DARKGLARE_S }),
    chaos_bolt: planSpell('Chaos Bolt', [CHAOS_BOLT]),
    sigil_of_flame: planSpell('Sigil of Flame', [SIGIL_OF_FLAME]),
  },
});
const facts = TestBed.inject(RecentCastFacts);

const read = (name: string, atS: number, log: { casts: WclEvent[]; damage?: WclEvent[] }) => {
  const ctx = factContext(list, { casts: [...log.casts, cast(PROBE, atS)], damage: log.damage ?? [] });
  return facts.read(name, castAt(ctx, atS), 'chaos_bolt', ctx);
};
const bolt = (atS: number) => cast(CHAOS_BOLT, atS, { target: BOSS });
const lands = (atS: number, spellId = CHAOS_BOLT) => damage(spellId, atS, 1, { target: BOSS });
const tick = (atS: number) => ({ ...lands(atS, SIGIL_OF_FLAME), tick: true });

describe('RecentCastFacts', () => {
  it('reads a pet out for its summon\'s duration, and gone once it ran', () => {
    const casts = [cast(SUMMON_DARKGLARE, 10)];
    expect(read('pet.darkglare.active', 10 + DARKGLARE_S - 1, { casts })).toEqual([1, 1]);
    expect(read('pet.darkglare.active', 10 + DARKGLARE_S, { casts })).toEqual([0, 0]);
  });

  it('reads the time the pet has left', () => {
    expect(read('pet.darkglare.remains', 15, { casts: [cast(SUMMON_DARKGLARE, 10)] })).toEqual([DARKGLARE_S - 5, DARKGLARE_S - 5]);
  });

  it('reads a pet no button of the spell data summons as unknown', () => {
    expect(read('pet.army_ghoul.active', 15, { casts: [cast(SUMMON_DARKGLARE, 10)] })).toEqual(UNKNOWN);
  });

  it('reads a shot in the air from its cast until it lands, under the line\'s own button or a named one', () => {
    const log = { casts: [bolt(10)], damage: [lands(11.5)] };
    expect(read('in_flight', 11, log)).toEqual([1, 1]);
    expect(read('action.chaos_bolt.in_flight', 11.5, log)).toEqual([0, 0]);
  });

  it('counts the shots in the air, each landing taking the oldest', () => {
    const log = { casts: [bolt(10), bolt(11)], damage: [lands(11.5)] };
    expect(read('action.chaos_bolt.in_flight_count', 11.2, log)).toEqual([2, 2]);
    expect(read('action.chaos_bolt.in_flight_count', 11.5, log)).toEqual([1, 1]);
  });

  it('never reads a spell that hits as it casts as in the air', () => {
    expect(read('in_flight', 10.5, { casts: [bolt(10)], damage: [lands(10)] })).toEqual([0, 0]);
  });

  it('stops counting a shot the log never shows landing once it must have been lost', () => {
    const log = { casts: [bolt(10)] };
    expect(read('in_flight', 10 + LOST_AFTER_S, log)).toEqual([1, 1]);
    expect(read('in_flight', 10 + LOST_AFTER_S + 0.1, log)).toEqual([0, 0]);
  });

  it('reads the time until the shot lands, none for one not in the air, and unknown for one the log never lands', () => {
    expect(read('action.chaos_bolt.in_flight_remains', 11, { casts: [bolt(10)], damage: [lands(11.5)] })).toEqual([0.5, 0.5]);
    expect(read('action.chaos_bolt.in_flight_remains', 12, { casts: [bolt(10)], damage: [lands(11.5)] })).toEqual([0, 0]);
    expect(read('action.chaos_bolt.in_flight_remains', 11, { casts: [bolt(10)] })).toEqual(UNKNOWN);
  });

  it('reads a sigil as placed until it goes off, its ticks after that counting for no landing', () => {
    const sigil = (atS: number) => cast(SIGIL_OF_FLAME, atS, { target: BOSS });
    const log = { casts: [sigil(10), sigil(15)], damage: [lands(12, SIGIL_OF_FLAME), tick(13), tick(14), tick(15), tick(16)] };
    expect(read('action.sigil_of_flame.placed', 11, log)).toEqual([1, 1]);
    expect(read('action.sigil_of_flame.placed', 12, log)).toEqual([0, 0]);
    expect(read('action.sigil_of_flame.placed', 16.5, log)).toEqual([1, 1]);
  });
});
