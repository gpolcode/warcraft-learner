import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, applyBuffStack, applyDebuff, cast, refreshDebuff, removeBuff, removeDebuff } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { DARKEST_NIGHT, DEATHMARK, MAELSTROM_WEAPON, RUPTURE, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { Range, UNKNOWN } from '../priority-list.models';
import { CAST_EFFECTS_LEAD_S } from './aura-facts';

const DANCE_S = 8;
const MAX_STACKS = 10;
const RUPTURE_S = 20;
const PANDEMIC_S = (RUPTURE_S * 30) / 100;
const FIGHT_S = 300;
/** Envenom's own buff lands 1 ms ahead of its cast. */
const OWN_EFFECT_LEAD_S = 0.001;
/** The Stealth a Garrote breaks drops 13 ms ahead of it. */
const CONSUMED_LEAD_S = 0.013;
/** Bladestorm fired 18 ms after the Recklessness it was macroed with. */
const MACRO_GAP_S = 0.018;
const LOG_TICK_S = 0.001;
const DARKEST_NIGHT_ENTRY = 117739;
const DEATHMARK_ENTRY = 112662;
const OTHER_ENTRY = 117101;
const BOSS = 1;
const ADD = 2;
const BOSS_KEY = `${BOSS}:0`;
const ADD_KEY = `${ADD}:0`;
const list = priorityList({
  spells: {
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { duration: DANCE_S }),
    maelstrom_weapon: planSpell('Maelstrom Weapon', [MAELSTROM_WEAPON], { max_stacks: MAX_STACKS }),
    roll_the_bones: planSpell('Roll the Bones', [1214909]),
    darkest_night: planSpell('Darkest Night', [DARKEST_NIGHT]),
    rupture: planSpell('Rupture', [RUPTURE], { duration: RUPTURE_S }),
    deathmark: planSpell('Deathmark', [DEATHMARK]),
  },
  talents: { 'talent.darkest_night': { name: 'Darkest Night', entries: [DARKEST_NIGHT_ENTRY] }, 'talent.deathmark': { name: 'Deathmark', entries: [DEATHMARK_ENTRY] } },
});
const evaluator = TestBed.inject(ConditionEvalService);

interface Read {
  reads: string;
  name: string;
  events: WclEvent[];
  atS: number;
  expected: Range;
  /** Null for a cast at no known enemy; a debuff's default is the boss. */
  target?: string | null;
  casts?: WclEvent[];
  talents?: [number, number][];
  action?: string;
}

const read = ({ name, events, atS, target, casts, talents, action = 'x' }: Read): Range => {
  const debuffs = events.filter(event => event.type.includes('debuff'));
  const buffs = events.filter(event => !debuffs.includes(event));
  const ctx = factContext(list, { casts: casts ?? [cast(1, atS)], buffs, debuffs, ...(talents ? { talents } : {}) });
  return evaluator.read(name, castAt(ctx, atS, target === undefined ? (debuffs.length || name.includes('deathmark') ? BOSS_KEY : null) : target), action, ctx);
};

describe('AuraFacts buffs', () => {
  const dance = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 10 + DANCE_S)];
  const upAtPull = [removeBuff(SHADOW_DANCE, DANCE_S)];
  const stacked = [applyBuff(MAELSTROM_WEAPON, 1), applyBuffStack(MAELSTROM_WEAPON, 2, MAX_STACKS)];

  it.each<Read>([
    { reads: 'a buff up going into the cast, the removal second included', name: 'buff.shadow_dance.up', events: dance, atS: 10 + DANCE_S, expected: [1, 1] },
    { reads: 'a buff whose first event is its removal as up from the pull', name: 'buff.shadow_dance.up', events: upAtPull, atS: DANCE_S - 1, expected: [1, 1] },
    { reads: 'that buff as down after the removal', name: 'buff.shadow_dance.up', events: upAtPull, atS: DANCE_S + 1, expected: [0, 0] },
    { reads: 'a buff the cast itself applies as not yet up', name: 'buff.shadow_dance.up', events: dance, atS: 10, expected: [0, 0] },
    { reads: 'a buff the log stamps just ahead of the cast that applies it as not yet up', name: 'buff.shadow_dance.up', events: [applyBuff(SHADOW_DANCE, 10 - OWN_EFFECT_LEAD_S)], atS: 10, expected: [0, 0] },
    { reads: 'a buff the log drops just ahead of the cast that consumes it as still up', name: 'buff.shadow_dance.up', events: [applyBuff(SHADOW_DANCE, 1), removeBuff(SHADOW_DANCE, 10 - CONSUMED_LEAD_S)], atS: 10, expected: [1, 1] },
    { reads: 'a buff an earlier press applied just ahead of the cast as up, since that press came first', name: 'buff.shadow_dance.up', events: [applyBuff(SHADOW_DANCE, 10 - MACRO_GAP_S)], atS: 10, casts: [cast(2, 10 - MACRO_GAP_S), cast(1, 10)], expected: [1, 1] },
    { reads: 'a buff applied at the lead\'s edge as not up, the whole lead kept when the earlier press sits outside it', name: 'buff.shadow_dance.up', events: [applyBuff(SHADOW_DANCE, 10 - CAST_EFFECTS_LEAD_S)], atS: 10, casts: [cast(2, 10 - CAST_EFFECTS_LEAD_S - LOG_TICK_S), cast(1, 10)], expected: [0, 0] },
    { reads: 'the time left from the log where the buff ran its course', name: 'buff.shadow_dance.remains', events: dance, atS: 12, expected: [DANCE_S - 2, DANCE_S - 2] },
    { reads: 'the time left of a buff consumed early as spanning its drop and its due end', name: 'buff.shadow_dance.remains', events: [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 13)], atS: 12, expected: [1, DANCE_S - 2] },
    { reads: 'an aura up since before the pull as lasting no longer than its drop, its start unknown', name: 'buff.shadow_dance.remains', events: upAtPull, atS: 1, expected: [-Infinity, DANCE_S - 1] },
    { reads: 'an aura that outlived the log as lasting at least to the fight\'s end', name: 'buff.roll_the_bones.remains', events: [applyBuff(1214909, 290)], atS: 295, expected: [FIGHT_S - 295, Infinity] },
    { reads: 'a buff\'s stacks at the cap', name: 'buff.maelstrom_weapon.stack', events: stacked, atS: 3, expected: [MAX_STACKS, MAX_STACKS] },
    { reads: 'the cap as reached', name: 'buff.maelstrom_weapon.at_max_stacks', events: stacked, atS: 3, expected: [1, 1] },
    { reads: 'one stack as under the cap', name: 'buff.maelstrom_weapon.at_max_stacks', events: stacked.slice(0, 1), atS: 3, expected: [0, 0] },
    { reads: 'an up buff whose timeline starts mid-aura as holding one stack up to its cap', name: 'buff.maelstrom_weapon.stack', events: [removeBuff(MAELSTROM_WEAPON, 20)], atS: 5, expected: [1, MAX_STACKS] },
    { reads: 'the spell data\'s duration', name: 'buff.shadow_dance.duration', events: [], atS: 1, expected: [DANCE_S, DANCE_S] },
    { reads: 'the spell data\'s stack cap', name: 'buff.maelstrom_weapon.max_stack', events: [], atS: 1, expected: [MAX_STACKS, MAX_STACKS] },
    { reads: 'the time since the buff last triggered', name: 'buff.shadow_dance.last_trigger', events: dance, atS: 12, expected: [2, 2] },
    { reads: 'a buff the log never shows as unknown, since SimC tracks some no game aura backs', name: 'buff.roll_the_bones.up', events: dance, atS: 12, expected: UNKNOWN },
    { reads: 'a buff the log never shows as down when only a talent the player did not take grants it', name: 'buff.darkest_night.up', events: [], atS: 12, talents: [[OTHER_ENTRY, 1]], expected: [0, 0] },
    { reads: 'that buff\'s down field as holding', name: 'buff.darkest_night.down', events: [], atS: 12, talents: [[OTHER_ENTRY, 1]], expected: [1, 1] },
    { reads: 'that buff as unknown when the player took the talent', name: 'buff.darkest_night.up', events: [], atS: 12, talents: [[DARKEST_NIGHT_ENTRY, 1]], expected: UNKNOWN },
    { reads: 'that buff as unknown when the log carries no talents', name: 'buff.darkest_night.up', events: [], atS: 12, expected: UNKNOWN },
    { reads: 'a buff the spell data does not name as unknown', name: 'buff.hidden_opportunity.up', events: dance, atS: 12, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});

describe('AuraFacts dots', () => {
  const onBoss = [applyDebuff(RUPTURE, 0, { target: BOSS }), removeDebuff(RUPTURE, RUPTURE_S, { target: BOSS })];
  const refreshed = [applyDebuff(RUPTURE, 0, { target: BOSS }), refreshDebuff(RUPTURE, 10, { target: BOSS }), removeDebuff(RUPTURE, 10 + RUPTURE_S, { target: BOSS })];
  const spread = [...onBoss, applyDebuff(RUPTURE, 1, { target: ADD })];

  it.each<Read>([
    { reads: 'a dot ticking on the cast\'s target', name: 'dot.rupture.ticking', events: onBoss, atS: 5, expected: [1, 1] },
    { reads: 'a dot as not ticking on another enemy', name: 'dot.rupture.ticking', events: onBoss, atS: 5, target: ADD_KEY, expected: [0, 0] },
    { reads: 'the line\'s own dot as refreshable inside its last 30%', name: 'refreshable', events: onBoss, atS: RUPTURE_S - PANDEMIC_S + 0.1, action: 'rupture', expected: [1, 1] },
    { reads: 'the dot as not refreshable at the window\'s edge', name: 'refreshable', events: onBoss, atS: RUPTURE_S - PANDEMIC_S, action: 'rupture', expected: [0, 0] },
    { reads: 'a missing dot as refreshable', name: 'dot.rupture.refreshable', events: onBoss, atS: RUPTURE_S + 1, expected: [1, 1] },
    { reads: 'the time left through a refresh to the final drop', name: 'dot.rupture.remains', events: refreshed, atS: 15, expected: [RUPTURE_S - 5, RUPTURE_S - 5] },
    { reads: 'the enemies the dot is on', name: 'active_dot.rupture', events: spread, atS: 5, target: null, expected: [2, 2] },
    { reads: 'the same count under SimC\'s other spelling', name: 'active_dots.rupture', events: spread, atS: 5, target: null, expected: [2, 2] },
    { reads: 'a per-target fact as unknown when the cast aims at no known enemy', name: 'dot.rupture.ticking', events: onBoss, atS: 5, target: null, expected: UNKNOWN },
    { reads: 'a dot the log never shows as unknown', name: 'dot.rupture.ticking', events: [], atS: 5, target: BOSS_KEY, expected: UNKNOWN },
    { reads: 'a dot the log never shows as off when only a talent the player did not take grants it', name: 'dot.deathmark.ticking', events: [], atS: 5, talents: [[OTHER_ENTRY, 1]], expected: [0, 0] },
    { reads: 'that dot as refreshable', name: 'dot.deathmark.refreshable', events: [], atS: 5, talents: [[OTHER_ENTRY, 1]], expected: [1, 1] },
    { reads: 'that dot as unknown when the player took the talent', name: 'dot.deathmark.ticking', events: [], atS: 5, talents: [[DEATHMARK_ENTRY, 1]], expected: UNKNOWN },
    { reads: 'a field the log cannot answer as unknown', name: 'dot.rupture.ticks_remain', events: onBoss, atS: 5, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
