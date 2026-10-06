import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, applyBuffStack, applyDebuff, cast, refreshDebuff, removeBuff, removeDebuff } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { DARKEST_NIGHT, DEATHMARK, MAELSTROM_WEAPON, RUPTURE, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { FactCatalogService } from '../fact-catalog-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';
import { AuraFacts } from './aura-facts';

const DANCE_S = 8;
const MAX_STACKS = 10;
const RUPTURE_S = 20;
const PANDEMIC_S = (RUPTURE_S * 30) / 100;
/** Envenom's own buff lands 1 ms ahead of its cast. */
const OWN_EFFECT_LEAD_S = 0.001;
/** The Stealth a Garrote breaks drops 13 ms ahead of it. */
const CONSUMED_LEAD_S = 0.013;
/** Bladestorm fired 18 ms after the Recklessness it was macroed with. */
const MACRO_GAP_S = 0.018;
const BOSS = 1;
const ADD = 2;
const BOSS_KEY = `${BOSS}:0`;
const ADD_KEY = `${ADD}:0`;
const DARKEST_NIGHT_ENTRY = 117739;
const DEATHMARK_ENTRY = 112662;
const OTHER_ENTRY = 117101;
const UP: Range = [1, 1];
const DOWN: Range = [0, 0];
const list = priorityList({
  spells: {
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { duration: DANCE_S }),
    maelstrom_weapon: planSpell('Maelstrom Weapon', [MAELSTROM_WEAPON], { max_stacks: MAX_STACKS }),
    roll_the_bones: planSpell('Roll the Bones', [1214909]),
    darkest_night: planSpell('Darkest Night', [DARKEST_NIGHT]),
    rupture: planSpell('Rupture', [RUPTURE], { duration: RUPTURE_S }),
    deathmark: planSpell('Deathmark', [DEATHMARK]),
  },
  talents: {
    'talent.darkest_night': { name: 'Darkest Night', entries: [DARKEST_NIGHT_ENTRY] },
    'talent.deathmark': { name: 'Deathmark', entries: [DEATHMARK_ENTRY] },
  },
});
const auras = TestBed.inject(AuraFacts);
const catalog = TestBed.inject(FactCatalogService);

interface Read {
  reads: string;
  name: string;
  events: WclEvent[];
  atS: number;
  expected: Range;
  /** The cast's target, for a dot; null for a cast at no known enemy. */
  target?: string | null;
  talents?: [number, number][];
}

const read = ({ name, events, atS, target, talents }: Read, on: 'buffs' | 'debuffs', action: string): Range => {
  const ctx = factContext(list, { casts: [cast(1, atS)], [on]: events, ...(talents ? { talents } : {}) });
  return auras.read(catalog.path(name, action), castAt(ctx, atS, on === 'debuffs' && target === undefined ? BOSS_KEY : target ?? null), ctx);
};

describe('AuraFacts buffs', () => {
  const dance = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 10 + DANCE_S)];
  const consumed = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 13)];
  const stacked = [applyBuff(MAELSTROM_WEAPON, 1), applyBuffStack(MAELSTROM_WEAPON, 2, MAX_STACKS)];
  const untaken: [number, number][] = [[OTHER_ENTRY, 1]];

  it.each<Read>([
    { reads: 'a buff up going into the cast, the removal second included', name: 'buff.shadow_dance.up', events: dance, atS: 10 + DANCE_S, expected: UP },
    { reads: 'the same buff as not down', name: 'buff.shadow_dance.down', events: dance, atS: 10 + DANCE_S, expected: DOWN },
    { reads: 'a buff whose first event is its removal as up from the pull', name: 'buff.shadow_dance.up', events: [removeBuff(SHADOW_DANCE, DANCE_S)], atS: DANCE_S - 1, expected: UP },
    { reads: 'that buff as down after the removal', name: 'buff.shadow_dance.up', events: [removeBuff(SHADOW_DANCE, DANCE_S)], atS: DANCE_S + 1, expected: DOWN },
    { reads: 'a buff the cast itself applies as not yet up', name: 'buff.shadow_dance.up', events: dance, atS: 10, expected: DOWN },
    { reads: 'a buff the log stamps just ahead of the cast that applies it as not yet up', name: 'buff.shadow_dance.up', events: [applyBuff(SHADOW_DANCE, 10 - OWN_EFFECT_LEAD_S)], atS: 10, expected: DOWN },
    { reads: 'a buff the log drops just ahead of the cast that consumes it as still up', name: 'buff.shadow_dance.up', events: [applyBuff(SHADOW_DANCE, 1), removeBuff(SHADOW_DANCE, 10 - CONSUMED_LEAD_S)], atS: 10, expected: UP },
    { reads: 'the time left from the log where the buff ran its course', name: 'buff.shadow_dance.remains', events: dance, atS: 12, expected: [DANCE_S - 2, DANCE_S - 2] },
    { reads: 'the time left of a buff consumed early as spanning its drop and its due end', name: 'buff.shadow_dance.remains', events: consumed, atS: 12, expected: [1, DANCE_S - 2] },
    { reads: 'how long since the buff last triggered', name: 'buff.shadow_dance.last_trigger', events: dance, atS: 12, expected: [2, 2] },
    { reads: 'how long since the buff last dropped', name: 'buff.shadow_dance.last_expire', events: dance, atS: 10 + DANCE_S + 5, expected: [5, 5] },
    { reads: 'a drop still to come as unknown', name: 'buff.shadow_dance.last_expire', events: dance, atS: 12, expected: UNKNOWN },
    { reads: 'a buff\'s stacks', name: 'buff.maelstrom_weapon.stack', events: stacked, atS: 3, expected: [MAX_STACKS, MAX_STACKS] },
    { reads: 'stacks at the cap as at max', name: 'buff.maelstrom_weapon.at_max_stacks', events: stacked, atS: 3, expected: UP },
    { reads: 'stacks under the cap as not at max', name: 'buff.maelstrom_weapon.at_max_stacks', events: stacked.slice(0, 1), atS: 3, expected: DOWN },
    { reads: 'the spell data\'s duration, logged aura or not', name: 'buff.shadow_dance.duration', events: [], atS: 1, expected: [DANCE_S, DANCE_S] },
    { reads: 'the spell data\'s stack cap, logged aura or not', name: 'buff.maelstrom_weapon.max_stack', events: [], atS: 1, expected: [MAX_STACKS, MAX_STACKS] },
    { reads: 'a buff the log never shows as unknown, since SimC tracks some no game aura backs', name: 'buff.roll_the_bones.up', events: dance, atS: 12, expected: UNKNOWN },
    { reads: 'a buff the log never shows as down when only a talent the player did not take grants it', name: 'buff.darkest_night.up', events: [], atS: 12, expected: DOWN, talents: untaken },
    { reads: 'that buff\'s down as holding', name: 'buff.darkest_night.down', events: [], atS: 12, expected: UP, talents: untaken },
    { reads: 'that buff as unknown when the player took the talent', name: 'buff.darkest_night.up', events: [], atS: 12, expected: UNKNOWN, talents: [[DARKEST_NIGHT_ENTRY, 1]] },
    { reads: 'that buff as unknown when the log carries no talents', name: 'buff.darkest_night.up', events: [], atS: 12, expected: UNKNOWN },
    { reads: 'a buff the spell data does not name as unknown', name: 'buff.hidden_opportunity.up', events: dance, atS: 12, expected: UNKNOWN },
    { reads: 'a field no log answers as unknown', name: 'buff.shadow_dance.value', events: dance, atS: 12, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row, 'buffs', 'x')).toEqual(row.expected);
  });

  it('reads a buff an earlier press applied just ahead of the cast as up, since that press came first', () => {
    const ctx = factContext(list, { casts: [cast(2, 10 - MACRO_GAP_S), cast(1, 10)], buffs: [applyBuff(SHADOW_DANCE, 10 - MACRO_GAP_S)] });
    expect(auras.read(catalog.path('buff.shadow_dance.up', 'x'), castAt(ctx, 10), ctx)).toEqual(UP);
  });
});

describe('AuraFacts dots', () => {
  const onBoss = [applyDebuff(RUPTURE, 0, { target: BOSS }), removeDebuff(RUPTURE, RUPTURE_S, { target: BOSS })];
  const refreshed = [applyDebuff(RUPTURE, 0, { target: BOSS }), refreshDebuff(RUPTURE, 10, { target: BOSS }), removeDebuff(RUPTURE, 10 + RUPTURE_S, { target: BOSS })];
  const spread = [...onBoss, applyDebuff(RUPTURE, 1, { target: ADD })];
  const untaken: [number, number][] = [[OTHER_ENTRY, 1]];

  it.each<Read>([
    { reads: 'a dot ticking on the cast\'s target', name: 'dot.rupture.ticking', events: onBoss, atS: 5, expected: UP },
    { reads: 'a dot as not ticking on another enemy', name: 'dot.rupture.ticking', events: onBoss, atS: 5, expected: DOWN, target: ADD_KEY },
    { reads: 'a dot as refreshable inside its last 30%, under the line\'s own button\'s bare name', name: 'refreshable', events: onBoss, atS: RUPTURE_S - PANDEMIC_S + 0.1, expected: UP },
    { reads: 'a dot as not refreshable at the window\'s edge', name: 'refreshable', events: onBoss, atS: RUPTURE_S - PANDEMIC_S, expected: DOWN },
    { reads: 'a missing dot as refreshable', name: 'dot.rupture.refreshable', events: onBoss, atS: RUPTURE_S + 1, expected: UP },
    { reads: 'the time left through a refresh to the final drop', name: 'dot.rupture.remains', events: refreshed, atS: 15, expected: [RUPTURE_S - 5, RUPTURE_S - 5] },
    { reads: 'the enemies the dot is on', name: 'active_dot.rupture', events: spread, atS: 5, expected: [2, 2], target: null },
    { reads: 'the enemies the dot is on under SimC\'s other spelling', name: 'active_dots.rupture', events: spread, atS: 5, expected: [2, 2], target: null },
    { reads: 'a per-target fact as unknown when the cast aims at no known enemy', name: 'dot.rupture.ticking', events: onBoss, atS: 5, expected: UNKNOWN, target: null },
    { reads: 'a dot the log never shows as unknown', name: 'dot.rupture.ticking', events: [], atS: 5, expected: UNKNOWN },
    { reads: 'a dot the log never shows as off when only a talent the player did not take grants it', name: 'dot.deathmark.ticking', events: [], atS: 5, expected: DOWN, talents: untaken },
    { reads: 'that dot as refreshable', name: 'dot.deathmark.refreshable', events: [], atS: 5, expected: UP, talents: untaken },
    { reads: 'that dot as unknown when the player took the talent', name: 'dot.deathmark.ticking', events: [], atS: 5, expected: UNKNOWN, talents: [[DEATHMARK_ENTRY, 1]] },
    { reads: 'the ticks a log never carries as unknown', name: 'dot.rupture.ticks_remain', events: onBoss, atS: 5, expected: UNKNOWN },
    { reads: 'the snapshot a log never carries as unknown', name: 'dot.rupture.pmultiplier', events: onBoss, atS: 5, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row, 'debuffs', 'rupture')).toEqual(row.expected);
  });
});
