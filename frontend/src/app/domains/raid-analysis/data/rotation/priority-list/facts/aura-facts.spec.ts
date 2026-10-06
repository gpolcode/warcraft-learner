import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, applyBuffStack, applyDebuff, cast, refreshDebuff, removeBuff, removeDebuff } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import { DARKEST_NIGHT, DEATHMARK, MAELSTROM_WEAPON, RUPTURE, SHADOW_DANCE } from '../../../../../../../testing/spell-ids';
import type { WclEvent } from '../../../wcl/wcl.models';
import { FactCatalogService } from '../fact-catalog-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { UNKNOWN } from '../priority-list.models';
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
const DARKEST_NIGHT_ENTRY = 117739;
const DEATHMARK_ENTRY = 112662;
const OTHER_ENTRY = 117101;
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

const readBuff = (name: string, buffs: WclEvent[], atS: number, talents?: [number, number][]) => {
  const ctx = factContext(list, { casts: [cast(1, atS)], buffs, ...(talents ? { talents } : {}) });
  return auras.read(catalog.path(name, 'x'), castAt(ctx, atS), ctx);
};
const readDot = (name: string, debuffs: WclEvent[], atS: number, target: string | null = BOSS_KEY, talents?: [number, number][]) => {
  const ctx = factContext(list, { casts: [cast(1, atS)], debuffs, ...(talents ? { talents } : {}) });
  return auras.read(catalog.path(name, 'rupture'), castAt(ctx, atS, target), ctx);
};

describe('AuraFacts buffs', () => {
  const dance = [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 10 + DANCE_S)];

  it('reads a buff up going into the cast, the removal second included', () => {
    expect(readBuff('buff.shadow_dance.up', dance, 10 + DANCE_S)).toEqual([1, 1]);
    expect(readBuff('buff.shadow_dance.down', dance, 10 + DANCE_S)).toEqual([0, 0]);
  });

  it('reads a buff whose first event is its removal as up from the pull until that removal', () => {
    const upAtPull = [removeBuff(SHADOW_DANCE, DANCE_S)];
    expect(readBuff('buff.shadow_dance.up', upAtPull, DANCE_S - 1)).toEqual([1, 1]);
    expect(readBuff('buff.shadow_dance.up', upAtPull, DANCE_S + 1)).toEqual([0, 0]);
  });

  it('reads a buff the cast itself applies as not yet up, even one the log stamps just ahead of the cast', () => {
    expect(readBuff('buff.shadow_dance.up', dance, 10)).toEqual([0, 0]);
    expect(readBuff('buff.shadow_dance.up', [applyBuff(SHADOW_DANCE, 10 - OWN_EFFECT_LEAD_S)], 10)).toEqual([0, 0]);
  });

  it('reads a buff the log drops just ahead of the cast that consumes it as still up', () => {
    expect(readBuff('buff.shadow_dance.up', [applyBuff(SHADOW_DANCE, 1), removeBuff(SHADOW_DANCE, 10 - CONSUMED_LEAD_S)], 10)).toEqual([1, 1]);
  });

  it('reads a buff an earlier press applied just ahead of the cast as up, since that press came first', () => {
    const ctx = factContext(list, { casts: [cast(2, 10 - MACRO_GAP_S), cast(1, 10)], buffs: [applyBuff(SHADOW_DANCE, 10 - MACRO_GAP_S)] });
    expect(auras.read(catalog.path('buff.shadow_dance.up', 'x'), castAt(ctx, 10), ctx)).toEqual([1, 1]);
  });

  it('reads the time left from the log where the buff ran its course, and as a span where it was consumed early', () => {
    expect(readBuff('buff.shadow_dance.remains', dance, 12)).toEqual([DANCE_S - 2, DANCE_S - 2]);
    expect(readBuff('buff.shadow_dance.remains', [applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 13)], 12)).toEqual([1, DANCE_S - 2]);
  });

  it('reads how long the buff has been up and how long since it last triggered or dropped', () => {
    expect(readBuff('buff.shadow_dance.elapsed', dance, 12)).toEqual([2, 2]);
    expect(readBuff('buff.shadow_dance.last_trigger', dance, 12)).toEqual([2, 2]);
    expect(readBuff('buff.shadow_dance.last_expire', dance, 10 + DANCE_S + 5)).toEqual([5, 5]);
    expect(readBuff('buff.shadow_dance.last_expire', dance, 12)).toEqual(UNKNOWN);
  });

  it('reads a buff\'s stacks, and whether they sit at the cap', () => {
    const stacked = [applyBuff(MAELSTROM_WEAPON, 1), applyBuffStack(MAELSTROM_WEAPON, 2, MAX_STACKS)];
    expect(readBuff('buff.maelstrom_weapon.stack', stacked, 3)).toEqual([MAX_STACKS, MAX_STACKS]);
    expect(readBuff('buff.maelstrom_weapon.at_max_stacks', stacked, 3)).toEqual([1, 1]);
    expect(readBuff('buff.maelstrom_weapon.at_max_stacks', stacked.slice(0, 1), 3)).toEqual([0, 0]);
  });

  it('reads the spell data\'s duration and stack cap, logged aura or not', () => {
    expect(readBuff('buff.shadow_dance.duration', [], 1)).toEqual([DANCE_S, DANCE_S]);
    expect(readBuff('buff.maelstrom_weapon.max_stack', [], 1)).toEqual([MAX_STACKS, MAX_STACKS]);
  });

  it('reads a buff the log never shows as unknown, since SimC tracks some no game aura backs', () => {
    expect(readBuff('buff.roll_the_bones.up', dance, 12)).toEqual(UNKNOWN);
  });

  it('reads a buff the log never shows as down when only a talent the player did not take grants it', () => {
    expect(readBuff('buff.darkest_night.up', [], 12, [[OTHER_ENTRY, 1]])).toEqual([0, 0]);
    expect(readBuff('buff.darkest_night.down', [], 12, [[OTHER_ENTRY, 1]])).toEqual([1, 1]);
  });

  it('reads that buff as unknown when the player took the talent, or the log carries no talents', () => {
    expect(readBuff('buff.darkest_night.up', [], 12, [[DARKEST_NIGHT_ENTRY, 1]])).toEqual(UNKNOWN);
    expect(readBuff('buff.darkest_night.up', [], 12)).toEqual(UNKNOWN);
  });

  it('reads a buff the spell data does not name as unknown, and a field no log answers as unknown', () => {
    expect(readBuff('buff.hidden_opportunity.up', dance, 12)).toEqual(UNKNOWN);
    expect(readBuff('buff.shadow_dance.value', dance, 12)).toEqual(UNKNOWN);
  });
});

describe('AuraFacts dots', () => {
  const onBoss = [applyDebuff(RUPTURE, 0, { target: BOSS }), removeDebuff(RUPTURE, RUPTURE_S, { target: BOSS })];

  it('reads a dot ticking on the cast\'s target, and not on another enemy', () => {
    expect(readDot('dot.rupture.ticking', onBoss, 5)).toEqual([1, 1]);
    expect(readDot('dot.rupture.ticking', onBoss, 5, `${ADD}:0`)).toEqual([0, 0]);
  });

  it('reads a dot as refreshable inside its last 30%, and not at the window\'s edge', () => {
    expect(readDot('refreshable', onBoss, RUPTURE_S - PANDEMIC_S + 0.1)).toEqual([1, 1]);
    expect(readDot('refreshable', onBoss, RUPTURE_S - PANDEMIC_S)).toEqual([0, 0]);
  });

  it('reads a missing dot as refreshable', () => {
    expect(readDot('dot.rupture.refreshable', onBoss, RUPTURE_S + 1)).toEqual([1, 1]);
  });

  it('reads the time left through a refresh to the final drop', () => {
    const refreshed = [applyDebuff(RUPTURE, 0, { target: BOSS }), refreshDebuff(RUPTURE, 10, { target: BOSS }), removeDebuff(RUPTURE, 10 + RUPTURE_S, { target: BOSS })];
    expect(readDot('dot.rupture.remains', refreshed, 15)).toEqual([RUPTURE_S - 5, RUPTURE_S - 5]);
  });

  it('counts the enemies the dot is on, under either spelling SimC reads', () => {
    const spread = [...onBoss, applyDebuff(RUPTURE, 1, { target: ADD })];
    expect(readDot('active_dot.rupture', spread, 5, null)).toEqual([2, 2]);
    expect(readDot('active_dots.rupture', spread, 5, null)).toEqual([2, 2]);
  });

  it('reads a per-target fact as unknown when the cast aims at no known enemy', () => {
    expect(readDot('dot.rupture.ticking', onBoss, 5, null)).toEqual(UNKNOWN);
  });

  it('reads a dot the log never shows as unknown', () => {
    expect(readDot('dot.rupture.ticking', [], 5)).toEqual(UNKNOWN);
  });

  it('reads a dot the log never shows as off when only a talent the player did not take grants it', () => {
    expect(readDot('dot.deathmark.ticking', [], 5, BOSS_KEY, [[OTHER_ENTRY, 1]])).toEqual([0, 0]);
    expect(readDot('dot.deathmark.refreshable', [], 5, BOSS_KEY, [[OTHER_ENTRY, 1]])).toEqual([1, 1]);
  });

  it('reads that dot as unknown when the player took the talent', () => {
    expect(readDot('dot.deathmark.ticking', [], 5, BOSS_KEY, [[DEATHMARK_ENTRY, 1]])).toEqual(UNKNOWN);
  });

  it('reads the ticks and snapshot a log never carries as unknown', () => {
    expect(readDot('dot.rupture.ticks_remain', onBoss, 5)).toEqual(UNKNOWN);
    expect(readDot('dot.rupture.pmultiplier', onBoss, 5)).toEqual(UNKNOWN);
  });
});
