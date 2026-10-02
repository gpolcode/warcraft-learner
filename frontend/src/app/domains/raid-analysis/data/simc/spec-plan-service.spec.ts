import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { beginCast, cast } from '../../../../../testing/builders/events';
import { BLADESTORM, BLADESTORM_HERO, DIVINE_HYMN, DIVINE_HYMN_TICK, THE_HUNT, THE_HUNT_LANDING, VANISH } from '../../../../../testing/spell-ids';
import { planSpell, specPlan } from '../../../../../testing/builders/spec-plan';
import type { TalentTree } from '../http/talent-data-service';
import { SpecPlanService } from './spec-plan-service';

const specPlans = TestBed.inject(SpecPlanService);

const RECKLESSNESS = 1719;
const AVATAR = 107574;
const WHIRLWIND = 190411;
const ENRAGED_REGENERATION = 184364;
const SPELL_REFLECTION = 23920;
const DIE_BY_THE_SWORD = 118038;
const ENRAGE = 184362;
const SUMMON_RAVAGER = 228920;
const ANGER_MANAGEMENT_ENTRY = 90371;
const RECKLESSNESS_ENTRY = 90010;
const SLAYER_ENTRY = 123389;
const APEX_TIER_ENTRIES = [137004, 137003, 137002];
const SCORCH_EXECUTE_PCT = 30;

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
  record('Enrage', ENRAGE, 'Duration         : 4 seconds', 'Stacks           : 1 initial, 3 maximum'),
  record('Rampage', 184367, 'GCD              : 1.5 seconds', 'Resource         : 80 Rage (1) (id=1)', 'Cast Time        : 0.5 seconds'),
  record('Summon Ravager', SUMMON_RAVAGER, 'Duration         : 12 seconds', 'Cooldown         : 30 seconds', 'Charges          : 2 (30 seconds cooldown)'),
  record('Scorch', 2948, '#2 (id=1154626)  : Dummy (3)', `                   Base Value: ${SCORCH_EXECUTE_PCT} | Scaled Value: ${SCORCH_EXECUTE_PCT}`),
  record('Vanish', VANISH, 'Duration         : 3 seconds'),
].join('\n\n');
const guarding = (id: number, aura: string, value: number): string => [
  `#1 (id=${id + 1})   : Apply Aura (6) | ${aura}`,
  `                   Base Value: ${value} | Scaled Value: ${value} | Target: Self (1)`,
].join('\n');
const FEINT = 1966;
const DANCING_RUNE_WEAPON = 49028;
const DANCING_RUNE_WEAPON_BUFF = 81256;
const GUARDED_DUMP = [
  DUMP,
  record('Feint', FEINT, 'Charges          : 1 (15 seconds cooldown)', guarding(FEINT, 'Modify AoE Damage Taken% (229)', -40)),
  record('Dancing Rune Weapon', DANCING_RUNE_WEAPON, 'Cooldown         : 120 seconds', 'Labels           : 690: Major Cooldowns'),
  record('Dancing Rune Weapon', DANCING_RUNE_WEAPON_BUFF, guarding(DANCING_RUNE_WEAPON_BUFF, 'Modify Parry% (47)', 30)),
].join('\n\n');
/** Declarations shaped like SimC's class modules. */
const CODE = [
  'buff.enraged = make_buff( this, "enraged", find_spell( 184362 ) );',
  'buffs.shadowmeld = make_buff( this, "shadowmeld", find_spell( 58984 ) );',
  'racial_spell_t( p, "berserking", p->find_spell( 26297 ) )',
].join('\n');
const TREE: TalentTree = {
  talents: [{ id: ANGER_MANAGEMENT_ENTRY, name: 'Anger Management' }],
  heroTrees: [{ id: SLAYER_ENTRY, name: 'Slayer' }],
  apex: APEX_TIER_ENTRIES.map(id => ({ id, name: 'Rampaging Berserker' })),
};
const APL = [
  'actions=recklessness',
  'actions+=/avatar',
  'actions+=/bladestorm,if=buff.recklessness.up',
  'actions+=/whirlwind',
  'actions+=/rampage,if=buff.enrage.remains<1.5',
].join('\n');

const fury = (apl: string | null = APL, code = '') => specPlans.build({ apl, dump: DUMP, specLabel: 'Fury', talents: TREE, code });

describe('SpecPlanService.build', () => {
  it('plans the APL buttons Blizzard labels major or that hold a minute or longer, in APL order', () => {
    expect(fury().cooldowns.map(cooldown => [cooldown.name, cooldown.opener_priority])).toEqual([['Recklessness', 1], ['Avatar', 2], ['Bladestorm', 3]]);
  });

  it('plans each button under the record with its longest cooldown and marks a talented one', () => {
    expect(fury().cooldowns[0]).toEqual({ name: 'Recklessness', spell_id: RECKLESSNESS, cooldown: 90, duration: 0, charges: 1, talent_gated: true, opener_priority: 1 });
  });

  it('names the talent entry that grants a talented button, by the tree\'s own name for it', () => {
    const tree: TalentTree = { ...TREE, talents: [...TREE.talents, { id: RECKLESSNESS_ENTRY, name: 'Recklessness' }] };
    const plan = specPlans.build({ apl: APL, dump: DUMP, specLabel: 'Fury', talents: tree, code: '' });
    expect(plan.cooldowns[0]?.talent_entries).toEqual([RECKLESSNESS_ENTRY]);
    expect(plan.cooldowns[1]?.talent_entries).toBeUndefined();
  });

  it('plans only the labelled cooldowns, in no order, for a spec SimC writes no APL for', () => {
    expect(fury(null).cooldowns.map(cooldown => [cooldown.name, cooldown.opener_priority])).toEqual([['Recklessness', undefined], ['Bladestorm', undefined]]);
    expect(fury(null).lines).toEqual([]);
  });

  it('carries each button\'s aura duration and charges, merged over every record of its name', () => {
    const AVATAR_AURA_S = 20;
    const REGENERATION_CHARGES = 2;
    const dump = [
      DUMP,
      record('Avatar', AVATAR + 1, `Duration         : ${AVATAR_AURA_S} seconds`),
      record('Enraged Regeneration', ENRAGED_REGENERATION + 1, `Charges          : ${REGENERATION_CHARGES} (120 seconds cooldown)`),
    ].join('\n\n');
    const plan = specPlans.build({ apl: APL, dump, specLabel: 'Fury', talents: TREE, code: '' });
    expect(plan.cooldowns.find(cooldown => cooldown.name === 'Avatar')).toMatchObject({ spell_id: AVATAR, duration: AVATAR_AURA_S, charges: 1 });
    expect(plan.defensives.find(defensive => defensive.name === 'Enraged Regeneration')).toMatchObject({ duration: 0, charges: REGENERATION_CHARGES });
  });

  it('plans the spec\'s own big and external defensives, leaving out a name only another spec\'s talent carries', () => {
    expect(fury().defensives.map(defensive => defensive.name)).toEqual(['Enraged Regeneration', 'Spell Reflection']);
  });

  it('plans a button whose own aura guards its caster as a defensive, though Blizzard labels it none', () => {
    const plan = specPlans.build({ apl: APL, dump: GUARDED_DUMP, specLabel: 'Fury', talents: TREE, code: '' });
    expect(plan.defensives.map(defensive => defensive.name)).toContain('Feint');
  });

  it('keeps a guarding button Blizzard labels a major cooldown a cooldown', () => {
    const plan = specPlans.build({ apl: `${APL}\nactions+=/dancing_rune_weapon`, dump: GUARDED_DUMP, specLabel: 'Fury', talents: TREE, code: '' });
    expect(plan.cooldowns.map(cooldown => cooldown.name)).toContain('Dancing Rune Weapon');
    expect(plan.defensives.map(defensive => defensive.name)).not.toContain('Dancing Rune Weapon');
  });

  it('keeps a button another spec\'s talent carries when the spec\'s own APL presses it', () => {
    const armsPressesIt = `${APL}\nactions+=/die_by_the_sword`;
    expect(fury(armsPressesIt).defensives.map(defensive => defensive.name)).toContain('Die by the Sword');
  });

  it('keeps the list\'s lines and the spell data of every name they use', () => {
    expect(fury().lines[2]).toEqual({ action: 'bladestorm', terms: ['buff.recklessness.up'] });
    expect(fury().spells['bladestorm']?.ids).toEqual([BLADESTORM, BLADESTORM_HERO]);
    expect(fury().spells['enrage']).toMatchObject({ name: 'Enrage', ids: [ENRAGE], duration: 4, max_stacks: 3 });
    expect(fury().spells['rampage']).toMatchObject({ gcd: 1.5, cast_time: 0.5, costs: [{ type: 1, amount: 80 }] });
  });

  it('reads a pet the list names through the button that summons it', () => {
    expect(fury(`${APL}\nactions+=/execute,if=pet.ravager.active`).spells['summon_ravager']).toMatchObject({ duration: 12, charges: 2 });
  });

  it('names the talent entries each talent, hero tree and apex tier of the list stands for', () => {
    const { talents } = fury(`${APL}\nactions+=/execute,if=talent.anger_management.enabled&hero_tree.slayer&apex.2`);
    expect(talents).toEqual({
      'talent.anger_management': { name: 'Anger Management', entries: [ANGER_MANAGEMENT_ENTRY] },
      'hero_tree.slayer': { name: 'Slayer', entries: [SLAYER_ENTRY] },
      'apex.2': { name: 'Rampaging Berserker', entries: [APEX_TIER_ENTRIES[1]] },
    });
  });

  it('reads a tiered talent\'s numbered name as that many ranks over the tiered node of the name', () => {
    const { talents } = fury(`${APL}\nactions+=/execute,if=talent.rampaging_berserker_3`);
    expect(talents).toEqual({ 'talent.rampaging_berserker_3': { name: 'Rampaging Berserker', entries: APEX_TIER_ENTRIES, points: 3 } });
  });

  it('names the talent an aura the list reads is called after, and none for an aura no talent carries', () => {
    const tree: TalentTree = { ...TREE, talents: [...TREE.talents, { id: RECKLESSNESS_ENTRY, name: 'Recklessness' }] };
    const { talents } = specPlans.build({ apl: APL, dump: DUMP, specLabel: 'Fury', talents: tree, code: '' });
    expect(talents).toEqual({ 'talent.recklessness': { name: 'Recklessness', entries: [RECKLESSNESS_ENTRY] } });
  });

  it('leaves out a talent the tree does not carry, which the list then reads as unknown', () => {
    expect(fury(`${APL}\nactions+=/execute,if=talent.massacre`).talents).toEqual({});
  });

  it('reads a name the spell data does not hold through the SimC code that declares it', () => {
    expect(fury(`${APL}\nactions+=/execute,if=buff.enraged.up`, CODE).spells['enraged']).toMatchObject({ name: 'Enrage', ids: [ENRAGE], duration: 4 });
  });

  it('plans no spell for a name the code declares without spell data, leaving its ids to the log\'s own names', () => {
    const plan = fury(`${APL}\nactions+=/execute,if=buff.shadowmeld.up&cooldown.berserking.remains>10`, CODE);
    expect(plan.spells['shadowmeld']).toBeUndefined();
    expect(plan.spells['berserking']).toBeUndefined();
  });

  it('reads SimC\'s rogue stealth over whichever stealth buffs the spec\'s own spell data holds', () => {
    expect(fury(`${APL}\nactions+=/execute,if=stealthed.rogue`).lines.at(-1)?.terms).toEqual(['buff.vanish.up']);
  });

  it('reads a name SimC computes in class code as the same test over what a log shows, with its threshold from the spell data', () => {
    const plan = fury(`${APL}\nactions+=/execute,if=scorch_execute.active\nactions+=/whirlwind,if=soul_fragments.total>=4`);
    expect(plan.lines.at(-2)?.terms).toEqual(['talent.scorch', `target.health.pct<=${SCORCH_EXECUTE_PCT}`]);
    expect(plan.lines.at(-1)?.terms).toEqual(['buff.soul_fragments.stack>=4']);
  });

  it('carries the variables its lines read, and the spell data of the names they use', () => {
    const plan = fury(`${APL}\nactions+=/variable,name=pool,value=1,if=buff.enrage.up\nactions+=/variable,name=pool,value=0\nactions+=/execute,if=variable.pool`);
    expect(plan.variables.map(variable => variable.name)).toEqual(['pool', 'pool']);
    expect(plan.spells['enrage']).toBeDefined();
  });

  it('keys a plan on what it derived: an APL edit changes the key', () => {
    expect(fury(`${APL}\nactions+=/execute,if=rage>=40`).key).not.toBe(fury().key);
  });

  it('keeps the key when the sources derive the same plan', () => {
    expect(fury(`${APL}\n\n# a comment`).key).toBe(fury().key);
  });
});

describe('SpecPlanService button ids', () => {
  const plan = specPlan({
    cooldowns: [{ name: 'Bladestorm', spell_id: BLADESTORM, cooldown: 90 }],
    spells: { bladestorm: planSpell('Bladestorm', [BLADESTORM, BLADESTORM_HERO]) },
  });

  it('reads the record a log cast a button with, over the others its name holds', () => {
    expect(specPlans.castIds(plan, [cast(BLADESTORM_HERO, 10), cast(BLADESTORM_HERO, 100)])).toEqual({ Bladestorm: BLADESTORM_HERO });
  });

  it('leaves out a button the log never cast', () => {
    expect(specPlans.castIds(plan, [])).toEqual({});
  });

  it('reads a hardcast under the record it began under, not the landing the log casts as often', () => {
    const hunt = specPlan({
      cooldowns: [{ name: 'The Hunt', spell_id: THE_HUNT_LANDING, cooldown: 90 }],
      spells: { the_hunt: planSpell('The Hunt', [THE_HUNT, THE_HUNT_LANDING]) },
    });
    const press = [beginCast(THE_HUNT, 2), cast(THE_HUNT, 3), cast(THE_HUNT_LANDING, 3.3)];
    expect(specPlans.castIds(hunt, press)).toEqual({ 'The Hunt': THE_HUNT });
  });

  it('reads a channel under the record its cooldown sits on, not the tick record the log casts once a second', () => {
    const hymn = specPlan({
      cooldowns: [{ name: 'Divine Hymn', spell_id: DIVINE_HYMN, cooldown: 180 }],
      spells: { divine_hymn: planSpell('Divine Hymn', [DIVINE_HYMN, DIVINE_HYMN_TICK]) },
    });
    const channel = [cast(DIVINE_HYMN, 50), ...[50, 51, 52, 53, 54].map(atS => cast(DIVINE_HYMN_TICK, atS))];
    expect(specPlans.castIds(hymn, channel)).toEqual({ 'Divine Hymn': DIVINE_HYMN });
  });

  it('falls back to the most cast record when the log neither began nor cast the button\'s own', () => {
    const hymn = specPlan({
      cooldowns: [{ name: 'Divine Hymn', spell_id: DIVINE_HYMN, cooldown: 180 }],
      spells: { divine_hymn: planSpell('Divine Hymn', [DIVINE_HYMN, DIVINE_HYMN_TICK]) },
    });
    expect(specPlans.castIds(hymn, [cast(DIVINE_HYMN_TICK, 50), cast(DIVINE_HYMN_TICK, 51)])).toEqual({ 'Divine Hymn': DIVINE_HYMN_TICK });
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
