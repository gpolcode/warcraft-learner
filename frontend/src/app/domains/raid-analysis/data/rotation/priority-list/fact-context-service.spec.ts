import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyBuff, beginCast, cast, damage, removeBuff } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BACKSTAB, BLADESTORM, BLADESTORM_HERO, BLOODLUST, SHADOW_DANCE, SIGNET_OF_THE_PRIORY, SPYMASTERS_WEB, SPYMASTERS_WEB_USE, STARFIRE, VANISH } from '../../../../../../testing/spell-ids';
import { FactContextService } from './fact-context-service';
import { TRINKET_SLOTS } from '../../gear/gear-extract-service';
import type { PlanLine } from '../../plan/plan.models';
import { factContext, priorityList } from './priority-list-harness';

const DANCE_PASSIVE = 185314;
const TIME_WARP = 80353;
const BERSERKING = 26297;
const RAGE = 1;
const COMBO_POINTS = 4;
const STARFIRE_S = 2;
const BEGUN_S = 10;
const DONE_S = BEGUN_S + STARFIRE_S;
const list = priorityList({
  spells: {
    bladestorm: planSpell('Bladestorm', [BLADESTORM, BLADESTORM_HERO]),
    shadow_dance: planSpell('Shadow Dance', [DANCE_PASSIVE, SHADOW_DANCE]),
    starfire: planSpell('Starfire', [STARFIRE], { cast_time: STARFIRE_S }),
    backstab: planSpell('Backstab', [BACKSTAB], { gcd: 1 }),
    vanish: planSpell('Vanish', [VANISH], { gcd: 0 }),
  },
});
const contexts = TestBed.inject(FactContextService);

describe('FactContextService', () => {
  it('counts a cast under any id the name holds as the same button', () => {
    const ctx = factContext(list, { casts: [cast(BLADESTORM, 1), cast(BLADESTORM_HERO, 2)] });
    expect(ctx.castTimes('bladestorm')).toEqual([1, 2]);
  });

  it('reads an aura under the id the log shows most, so a same-named passive never stands in for it', () => {
    const buffs = [applyBuff(DANCE_PASSIVE, 0), applyBuff(SHADOW_DANCE, 10), removeBuff(SHADOW_DANCE, 16)];
    expect(factContext(list, { buffs }).auraId('shadow_dance', 'self')).toBe(SHADOW_DANCE);
  });

  it('reads a name the spell data lacks under the ids the report names it with', () => {
    const abilities = [{ gameID: BERSERKING, name: 'Berserking', icon: '' }];
    const ctx = factContext(list, { abilities, casts: [cast(BERSERKING, 1)], buffs: [applyBuff(BERSERKING, 1)] });
    expect(ctx.castTimes('berserking')).toEqual([1]);
    expect(ctx.auraId('berserking', 'self')).toBe(BERSERKING);
  });

  it('reads when each hit of a name landed, ticks aside', () => {
    const ctx = factContext(list, { damage: [{ ...damage(STARFIRE, 4, 1), tick: true }, damage(STARFIRE, 3, 1)] });
    expect(ctx.landings('starfire')).toEqual([3]);
  });

  it('reads SimC\'s bloodlust as whichever haste buff the raid used', () => {
    expect(factContext(list, { buffs: [applyBuff(TIME_WARP, 5)] }).auraId('bloodlust', 'self')).toBe(TIME_WARP);
    expect(factContext(list, { buffs: [applyBuff(BLOODLUST, 5)] }).auraId('bloodlust', 'self')).toBe(BLOODLUST);
  });

  it('reads a pool kept in tenths in the game\'s units, and a small pool as logged', () => {
    const rage = contexts.pool(cast(1, 1, { resources: [{ type: RAGE, amount: 450, max: 1300, cost: 200 }] }), RAGE);
    expect(rage).toEqual({ before: 45, left: 25, max: 130 });
    expect(contexts.pool(cast(1, 1, { resources: [{ type: COMBO_POINTS, amount: 5, max: 7 }] }), COMBO_POINTS)).toEqual({ before: 5, left: 5, max: 7 });
  });

  it('reads a pool a cast does not touch as absent', () => {
    expect(contexts.pool(cast(1, 1), RAGE)).toBeNull();
  });

  it('reads haste off each hardcast as its logged time over its base time', () => {
    const ctx = factContext(list, { casts: [beginCast(STARFIRE, 10), cast(STARFIRE, 11.5)] });
    expect(ctx.hasteFactors()).toEqual([[11.5, 1.5 / STARFIRE_S]]);
  });

  it('starts a hardcast at its begincast and an instant cast at itself', () => {
    const ctx = factContext(list, { casts: [cast(BACKSTAB, 5), beginCast(STARFIRE, BEGUN_S), cast(STARFIRE, DONE_S)] });
    expect(ctx.castStartsS()).toEqual([5, BEGUN_S]);
  });

  it('keeps a cast pending through a press off the global cooldown', () => {
    const ctx = factContext(list, { casts: [beginCast(STARFIRE, BEGUN_S), cast(VANISH, BEGUN_S + 1), cast(STARFIRE, DONE_S)] });
    expect(ctx.castStartsS()).toEqual([BEGUN_S + 1, BEGUN_S]);
  });

  it('starts a cast at itself once a press on the global cooldown ended the begincast before it', () => {
    const ctx = factContext(list, { casts: [beginCast(STARFIRE, BEGUN_S), cast(BACKSTAB, BEGUN_S + 1), cast(STARFIRE, DONE_S)] });
    expect(ctx.castStartsS()).toEqual([BEGUN_S + 1, DONE_S]);
  });
});

describe('FactContextService trinket lines', () => {
  const items = {
    spymasters_web: { id: SPYMASTERS_WEB, name: "Spymaster's Web", use: `item_${SPYMASTERS_WEB}`, use_buff: true, use_damage: null },
    signet: { id: SIGNET_OF_THE_PRIORY, name: 'Signet', use: null, use_buff: null, use_damage: null },
  };
  const trinketList = (lines: PlanLine[]) => priorityList({ lines, items, spells: { [`item_${SPYMASTERS_WEB}`]: planSpell("Spymaster's Web", [SPYMASTERS_WEB_USE], { gcd: 0 }) } });
  const worn = (first: number, second: number) => [{ slot: TRINKET_SLOTS[0], id: first, name: '', itemLevel: 0 }, { slot: TRINKET_SLOTS[1], id: second, name: '', itemLevel: 0 }];
  const actions = (lines: PlanLine[], gear = worn(SPYMASTERS_WEB, SIGNET_OF_THE_PRIORY)) => contexts.withTrinkets(trinketList(lines), gear).lines.map(line => line.action);

  it('reads a line naming a trinket as its use spell when the player wears it', () => {
    expect(actions([{ action: 'use_item', terms: [], item: 'spymasters_web' }])).toEqual([`item_${SPYMASTERS_WEB}`]);
  });

  it('drops a line naming a trinket the player does not wear', () => {
    expect(actions([{ action: 'use_item', terms: [], item: 'spymasters_web' }], worn(SIGNET_OF_THE_PRIORY, SIGNET_OF_THE_PRIORY))).toEqual([]);
  });

  it('reads a slot line as the trinket worn in that slot, and drops one whose trinket has no use', () => {
    expect(actions([{ action: 'use_item', terms: [], item: 'trinket1' }])).toEqual([`item_${SPYMASTERS_WEB}`]);
    expect(actions([{ action: 'use_item', terms: [], item: 'trinket2' }])).toEqual([]);
  });

  it('reads a line for every trinket as one line per worn trinket with a use', () => {
    expect(actions([{ action: 'use_items', terms: ['buff.shadow_dance.up'] }], worn(SPYMASTERS_WEB, SPYMASTERS_WEB))).toEqual([`item_${SPYMASTERS_WEB}`, `item_${SPYMASTERS_WEB}`]);
  });
});

describe('FactContextService idle spans', () => {
  it('reads the stretches past each cast\'s global cooldown as idle', () => {
    const IDLE_FROM_S = 11;
    const IDLE_TO_S = 20;
    expect(factContext(list, { casts: [cast(BACKSTAB, 10), cast(BACKSTAB, IDLE_TO_S)] }).idleSpans()).toEqual([[IDLE_FROM_S, IDLE_TO_S]]);
  });

  it('reads none under two casts', () => {
    expect(factContext(list, { casts: [cast(BACKSTAB, 10)] }).idleSpans()).toEqual([]);
  });
});
