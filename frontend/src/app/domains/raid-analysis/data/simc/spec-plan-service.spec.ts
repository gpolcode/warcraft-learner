import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { RuleCondition } from '../plan/plan.models';
import { cast } from '../../../../../testing/builders/events';
import { BLADESTORM, BLADESTORM_HERO } from '../../../../../testing/spell-ids';
import { specPlan } from '../../../../../testing/builders/spec-plan';
import { SpecPlanService, SpellScope } from './spec-plan-service';

const specPlans = TestBed.inject(SpecPlanService);

const RECKLESSNESS = 1719;
const AVATAR = 107574;
const WHIRLWIND = 190411;
const ENRAGED_REGENERATION = 184364;
const SPELL_REFLECTION = 23920;
const DIE_BY_THE_SWORD = 118038;
const ENRAGE = 184362;

const record = (name: string, id: number, ...fields: string[]): string =>
  [`Name             : ${name} (id=${id}) [Spell Family (4)] `, ...fields].join('\n');
const DUMP = [
  record('Recklessness', RECKLESSNESS, 'Talent Entry     : Fury [tree=spec, row=7]', 'Cooldown         : 90 seconds', 'Labels           : 690: Major Cooldowns'),
  record('Avatar', AVATAR, 'Cooldown         : 90 seconds'),
  record('Bladestorm', BLADESTORM, 'Cooldown         : 90 seconds', 'Labels           : 690: Major Cooldowns'),
  record('Bladestorm', BLADESTORM_HERO, 'Cooldown         : 90 seconds'),
  record('Whirlwind', WHIRLWIND, 'Cooldown         : 30 seconds'),
  record('Enraged Regeneration', ENRAGED_REGENERATION, 'Cooldown         : 120 seconds', 'Attributes       : Big Defensive (512)'),
  record('Spell Reflection', SPELL_REFLECTION, 'Cooldown         : 25 seconds', 'Attributes       : External Defensive (499)'),
  record('Die by the Sword', DIE_BY_THE_SWORD, 'Talent Entry     : Arms [tree=spec, row=3]', 'Cooldown         : 120 seconds', 'Attributes       : Big Defensive (512)'),
  // The spell record beside Arms' talent, untalented, as the dump lists many a spec's buttons.
  record('Die by the Sword', DIE_BY_THE_SWORD + 1, 'Cooldown         : 120 seconds', 'Attributes       : Big Defensive (512)'),
  record('Enrage', ENRAGE, 'Duration         : 4 seconds'),
].join('\n\n');
const PROFILE = [
  'actions=recklessness',
  'actions+=/avatar',
  'actions+=/bladestorm,if=buff.recklessness.up',
  'actions+=/whirlwind',
  'actions+=/rampage,if=buff.enrage.remains<1.5',
].join('\n');

const fury = (profile: string | null = PROFILE) => specPlans.build({ profile, dump: DUMP, specLabel: 'Fury' });

describe('SpecPlanService.build', () => {
  it('plans the APL buttons Blizzard labels major or that hold a minute or longer, in APL order', () => {
    expect(fury().cooldowns.map(cooldown => [cooldown.name, cooldown.opener_priority])).toEqual([['Recklessness', 1], ['Avatar', 2], ['Bladestorm', 3]]);
  });

  it('plans each button under the record with its longest cooldown and marks a talented one', () => {
    expect(fury().cooldowns[0]).toEqual({ name: 'Recklessness', spell_id: RECKLESSNESS, cooldown: 90, talent_gated: true, opener_priority: 1 });
  });

  it('plans only the labelled cooldowns, in no order, for a spec SimC writes no APL for', () => {
    expect(fury(null).cooldowns.map(cooldown => [cooldown.name, cooldown.opener_priority])).toEqual([['Recklessness', undefined], ['Bladestorm', undefined]]);
    expect(fury(null).rules).toEqual([]);
  });

  it('plans the spec\'s own big and external defensives, leaving out a name only another spec\'s talent carries', () => {
    expect(fury().defensives.map(defensive => defensive.name)).toEqual(['Enraged Regeneration', 'Spell Reflection']);
  });

  it('keeps a button another spec\'s talent carries when the spec\'s own APL presses it', () => {
    const armsPressesIt = `${PROFILE}\nactions+=/die_by_the_sword`;
    expect(fury(armsPressesIt).defensives.map(defensive => defensive.name)).toContain('Die by the Sword');
  });

  it('derives the APL\'s rules and every id the dump holds under each name they use', () => {
    expect(fury().rules.map(rule => rule.kind)).toEqual(['cast_outside_buff', 'aura_uptime_below']);
    expect(fury().spells['bladestorm']).toEqual({ name: 'Bladestorm', ids: [BLADESTORM, BLADESTORM_HERO] });
    expect(fury().spells['enrage']).toEqual({ name: 'Enrage', ids: [ENRAGE] });
  });

  it('keys a plan on what it derived: an APL edit that adds a rule changes the key', () => {
    expect(fury(`${PROFILE}\nactions+=/execute,if=rage>=40`).key).not.toBe(fury().key);
  });

  it('keeps the key through an APL edit that derives nothing new', () => {
    // No filler to displace, so the execute line makes no rule.
    expect(fury(`${PROFILE}\nactions+=/execute,if=target.health.pct<20`).key).toBe(fury().key);
  });
});

describe('SpecPlanService button ids', () => {
  const plan = specPlan({
    cooldowns: [{ name: 'Bladestorm', spell_id: BLADESTORM, cooldown: 90 }],
    spells: { bladestorm: { name: 'Bladestorm', ids: [BLADESTORM, BLADESTORM_HERO] } },
  });

  it('reads the record a log cast a button with, over the others its name holds', () => {
    expect(specPlans.castIds(plan, [cast(BLADESTORM_HERO, 10), cast(BLADESTORM_HERO, 100)])).toEqual({ Bladestorm: BLADESTORM_HERO });
  });

  it('leaves out a button the log never cast', () => {
    expect(specPlans.castIds(plan, [])).toEqual({});
  });

  it('plans a log\'s buttons under the ids that log cast them with', () => {
    expect(specPlans.inLog(plan, { Bladestorm: BLADESTORM_HERO }).cooldowns[0]?.spell_id).toBe(BLADESTORM_HERO);
  });

  it('keeps the plan\'s own id for a button the log never cast', () => {
    expect(specPlans.inLog(plan, {}).cooldowns[0]?.spell_id).toBe(BLADESTORM);
  });

  it('plans the top logs\' buttons under the id most of them cast it with', () => {
    const perLog = [{ Bladestorm: BLADESTORM_HERO }, { Bladestorm: BLADESTORM }, { Bladestorm: BLADESTORM_HERO }];
    expect(specPlans.inTopLogs(plan, perLog).cooldowns[0]?.spell_id).toBe(BLADESTORM_HERO);
  });

  it('leaves out a button no top log cast, but keeps one a single log cast', () => {
    expect(specPlans.inTopLogs(plan, [{}, {}]).cooldowns).toEqual([]);
    expect(specPlans.inTopLogs(plan, [{}, { Bladestorm: BLADESTORM }]).cooldowns).toHaveLength(1);
  });
});

describe('SpecPlanService.resolveRule', () => {
  const plan = specPlan({
    spells: {
      bladestorm: { name: 'Bladestorm', ids: [BLADESTORM, BLADESTORM_HERO] },
      recklessness: { name: 'Recklessness', ids: [RECKLESSNESS] },
    },
  });
  const template: RuleCondition = {
    kind: 'cast_outside_buff', spell_id: 0, spell_name: 'bladestorm', buff_spell_id: 0, buff_spell_name: 'recklessness', require: 'inside',
  };
  // A log that cast the hero-talent Bladestorm and wore Recklessness as a buff.
  const shown: Record<SpellScope, number[]> = { cast: [BLADESTORM_HERO], self: [RECKLESSNESS], target: [] };
  const inLog = (seen: Record<SpellScope, number[]>) => (ids: number[], scope: SpellScope): number | null =>
    ids.find(id => seen[scope].includes(id)) ?? null;

  it('names each spell by the id the log shows in the stream its field reads, and by its in-game name', () => {
    expect(specPlans.resolveRule(plan, template, inLog(shown))).toEqual({
      kind: 'cast_outside_buff', spell_id: BLADESTORM_HERO, spell_name: 'Bladestorm',
      buff_spell_id: RECKLESSNESS, buff_spell_name: 'Recklessness', require: 'inside',
    });
  });

  it('resolves nothing when a spell the rule needs never shows in the log', () => {
    expect(specPlans.resolveRule(plan, template, inLog({ ...shown, self: [] }))).toBeNull();
  });

  it('resolves nothing for a name SimC\'s spell data does not hold', () => {
    expect(specPlans.resolveRule(plan, { ...template, buff_spell_name: 'bloodlust' }, inLog(shown))).toBeNull();
  });
});
