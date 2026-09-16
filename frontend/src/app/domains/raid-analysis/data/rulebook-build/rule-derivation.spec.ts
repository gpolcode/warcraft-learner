import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RuleDerivationService } from './rule-derivation-service';
import { AbilityIndexService } from './ability-index-service';
import { SimcAplService } from '../simc/simc-apl-service';
import { builder, enemyDot, finisher, selfAura, spellRecord } from '../../../../../testing/builders/simc';
import { parseSample } from '../../../../../testing/builders/parse-sample';
import { applyBuff, buffWindow, cast, removeBuff } from '../../../../../testing/builders/events';
import {
  BACKSTAB, BLACK_POWDER, DARKEST_NIGHT, EVISCERATE, GLOOMBLADE, RUPTURE, SECRET_TECHNIQUE, SHADOW_BLADES, SHADOW_DANCE, SHADOW_DANCE_AURA,
  SHADOWSTRIKE, SLICE_AND_DICE, VANISH, EXECUTE, SLAM,
} from '../../../../../testing/spell-ids';
import { COMBO_POINT_TYPE } from '../rotation/rotation-rules/rule-fixtures';
import type { ParseSample, RuleDraft } from './rulebook-build.models';
import type { RuleCondition } from '../rulebook/rulebook.models';

const rules = TestBed.inject(RuleDerivationService);
const abilities = TestBed.inject(AbilityIndexService);
const apl = TestBed.inject(SimcAplService);

const CLASS = 'Rogue';
const SPEC = 'Subtlety';
const TIER = 'midnight_season_2';
const UNSEEN_BLADE = 'unseen_blade';
const FIGHT_S = 100;
/** Slice and Dice up for 70 of 100 seconds sits on the maintained-aura floor, so the sample carries an upkeep rule. */
const MAINTAINED_S = 70;
/** Darkest Night is applied three times, the proc floor, and spent twice, so the sample carries a proc rule. */
const PROC_APPLICATIONS = 3;
const RAGE_TYPE = 1;

const KIT = [
  builder(SHADOWSTRIKE, 'Shadowstrike', { className: `${SPEC} ${CLASS}` }),
  builder(BACKSTAB, 'Backstab', { className: CLASS }),
  builder(GLOOMBLADE, 'Gloomblade', { className: `${SPEC} ${CLASS}` }),
  finisher(EVISCERATE, 'Eviscerate', { className: CLASS }),
  finisher(BLACK_POWDER, 'Black Powder', { className: `${SPEC} ${CLASS}` }),
  finisher(RUPTURE, 'Rupture', { className: CLASS, effects: [enemyDot()], durationS: 24 }),
  finisher(SECRET_TECHNIQUE, 'Secret Technique', { className: `${SPEC} ${CLASS}`, rechargeS: 25 }),
  spellRecord({ id: SHADOW_DANCE, name: 'Shadow Dance', className: `${SPEC} ${CLASS}`, gcd: false, rechargeS: 20, durationS: 6, effects: [selfAura()] }),
  spellRecord({ id: SHADOW_DANCE_AURA, name: 'Shadow Dance', className: CLASS, durationS: 6, effects: [selfAura()] }),
  spellRecord({ id: SHADOW_BLADES, name: 'Shadow Blades', className: `${SPEC} ${CLASS}`, gcd: false, cooldownS: 90, durationS: 20, effects: [selfAura()] }),
  spellRecord({ id: VANISH, name: 'Vanish', className: CLASS, gcd: false, cooldownS: 120 }),
  spellRecord({ id: SLICE_AND_DICE, name: 'Slice and Dice', className: CLASS, durationS: 30, effects: [selfAura()] }),
  spellRecord({ id: DARKEST_NIGHT, name: 'Darkest Night', className: CLASS, durationS: 30, effects: [selfAura()] }),
];

const PROFILE = [
  'actions=call_action_list,name=cds',
  'actions+=/call_action_list,name=finish,if=combo_points>=5',
  'actions+=/call_action_list,name=build',
  'actions.cds=shadow_blades,if=cooldown.shadow_dance.charges_fractional>=1',
  'actions.cds+=/shadow_dance,if=cooldown.shadow_blades.remains>=35&!buff.shadow_dance.up',
  'actions.cds+=/vanish,if=combo_points<=2',
  'actions.cds+=/secret_technique,if=buff.shadow_dance.up',
  `actions.cds+=/secret_technique,if=talent.${UNSEEN_BLADE}&!cooldown.shadow_dance.ready`,
  'actions.finish=eviscerate,if=buff.darkest_night.up|!buff.slice_and_dice.up',
  'actions.finish+=/rupture,if=refreshable',
  'actions.finish+=/black_powder,if=spell_targets.shuriken_storm>=2',
  'actions.finish+=/eviscerate',
  'actions.build=shadowstrike',
  'actions.build+=/gloomblade,if=spell_targets.shuriken_storm<2&!buff.shadow_dance.up',
  'actions.build+=/backstab,if=spell_targets.shuriken_storm<2&!buff.shadow_dance.up',
].join('\n');

/** One parse: Shadow Dance up for a lasting share, Slice and Dice for the floor share, Rupture ticking, Darkest Night applied the floor count and spent twice. */
const SAMPLE: ParseSample = parseSample({
  fightDurationS: FIGHT_S,
  casts: [cast(EVISCERATE, 12), cast(EVISCERATE, 42), cast(RUPTURE, 5)],
  buffs: [
    ...buffWindow(SHADOW_DANCE_AURA, 0, 20), ...buffWindow(SLICE_AND_DICE, 0, MAINTAINED_S),
    ...Array.from({ length: PROC_APPLICATIONS }, (_, index) => [applyBuff(DARKEST_NIGHT, 10 + index * 30), removeBuff(DARKEST_NIGHT, 14 + index * 30)]).flat(),
  ],
  debuffs: buffWindow(RUPTURE, 5, 95),
});

function drafts(profile = PROFILE, kit = KIT, samples: ParseSample[] = [SAMPLE]): RuleDraft[] {
  const index = abilities.build(kit, samples, CLASS, SPEC);
  const resolved = apl.resolve(apl.parse(profile), TIER);
  return rules.derive(resolved.actions, index, samples).drafts;
}

function ofKind<K extends RuleCondition['kind']>(all: RuleDraft[], kind: K): (RuleDraft & { condition: Extract<RuleCondition, { kind: K }> })[] {
  return all.filter((draft): draft is RuleDraft & { condition: Extract<RuleCondition, { kind: K }> } => draft.condition.kind === kind);
}

describe('RuleDerivationService.derive', () => {
  const all = drafts();

  it('seeds a rule of every family the state and the gates carry, ordered by the priority of the line that produced it', () => {
    const kinds = new Set(all.map(draft => draft.condition.kind));
    expect([...kinds].sort()).toEqual([
      'aura_clipped', 'aura_uptime_below', 'cast_at_target_count', 'cast_outside_buff', 'cast_without_prior', 'filler_in_buff',
      'hold_cooldown_for_anchor', 'proc_wasted', 'resource_at_cast',
    ]);
    const priorities = all.map(draft => draft.priority);
    expect([...priorities].sort((a, b) => a - b)).toEqual(priorities);
  });

  it('keeps a cooldown inside the state every plain line asks for, excluding the talent whose line does not', () => {
    const [inside] = ofKind(all, 'cast_outside_buff');
    expect(inside?.condition).toMatchObject({ spell_id: SECRET_TECHNIQUE, buff_spell_id: SHADOW_DANCE_AURA, require: 'inside' });
    expect([...(inside?.excludes ?? [])]).toEqual([UNSEEN_BLADE]);
  });

  it('reads a resource gate as the bound the line names, from the action or from its list', () => {
    const resource = ofKind(all, 'resource_at_cast');
    const bound = (id: number) => resource.find(draft => draft.condition.spell_id === id)?.condition.bound;
    expect(bound(VANISH)).toBe('max');
    expect(bound(EVISCERATE)).toBe('min');
    expect(resource.find(draft => draft.condition.spell_id === EVISCERATE)?.condition.resource_type).toBe(COMBO_POINT_TYPE);
  });

  it('reads the target-count switches from the lines that gate on a count', () => {
    const counts = ofKind(all, 'cast_at_target_count').map(draft => `${draft.condition.spell_id}:${draft.condition.bound}`).sort();
    expect(counts).toEqual([`${BACKSTAB}:max`, `${GLOOMBLADE}:max`, `${BLACK_POWDER}:min`].sort());
  });

  it('never writes a state rule against the action\'s own aura', () => {
    expect(ofKind(all, 'cast_outside_buff').some(draft => draft.condition.spell_id === SHADOW_DANCE)).toBe(false);
  });

  it('merges the same rule from two lines into one draft carrying the union of their lists', () => {
    const profile = [
      'actions=shadowstrike,if=buff.shadow_dance.up',
      'actions+=/backstab,if=!buff.shadow_dance.up',
      'actions+=/gloomblade,if=!buff.shadow_dance.up',
    ].join('\n');
    const inDance = ofKind(drafts(profile, KIT, []), 'filler_in_buff');
    expect(inDance).toHaveLength(1);
    expect(inDance[0]?.condition.alternative_spell_ids.sort((a, b) => a - b)).toEqual([BACKSTAB, GLOOMBLADE]);
  });

  it('reports the actions and auras no record answers to', () => {
    const index = abilities.build(KIT, [], CLASS, SPEC);
    const resolved = apl.resolve(apl.parse('actions=goremaws_bite,if=buff.brand_new.up\nactions+=/backstab,if=buff.also_new.up'), TIER);
    expect(rules.derive(resolved.actions, index, []).gaps).toEqual([{ kind: 'action', token: 'goremaws_bite' }, { kind: 'aura', token: 'also_new' }]);
  });
});

describe('RuleDerivationService.derive on an execute', () => {
  const EXECUTE_PCT = 20;
  const MASSACRE_PCT = 35;
  const MASSACRE = 'massacre';
  const WARRIOR_KIT = [
    spellRecord({ id: EXECUTE, name: 'Execute', className: 'Warrior', powerTypes: [RAGE_TYPE], cooldownS: 6, executeHealthPct: EXECUTE_PCT }),
    spellRecord({ id: SLAM, name: 'Slam', className: 'Warrior', powerTypes: [RAGE_TYPE] }),
  ];
  const profile = [
    `actions=run_action_list,name=execute,if=talent.${MASSACRE}&target.health.pct<${MASSACRE_PCT}|target.health.pct<${EXECUTE_PCT}`,
    'actions+=/slam',
    'actions.execute=execute',
    'actions.execute+=/slam',
  ].join('\n');

  it('writes one execute rule per threshold, gated on the talent that moves it', () => {
    const index = abilities.build(WARRIOR_KIT, [], 'Warrior', 'Arms');
    const resolved = apl.resolve(apl.parse(profile), TIER);
    const executes = ofKind(rules.derive(resolved.actions, index, []).drafts, 'filler_below_health');
    expect(executes.map(draft => draft.condition.health_pct).sort((a, b) => a - b)).toEqual([EXECUTE_PCT, MASSACRE_PCT]);
    expect([...(executes.find(draft => draft.condition.health_pct === MASSACRE_PCT)?.requires ?? [])]).toEqual([MASSACRE]);
    expect(executes.every(draft => draft.condition.alternative_spell_ids.includes(SLAM))).toBe(true);
  });

  it('writes no execute rule for a button with no same-pool filler to give way to it', () => {
    const index = abilities.build([WARRIOR_KIT[0] ?? spellRecord({ id: EXECUTE, name: 'Execute' })], [], 'Warrior', 'Arms');
    const resolved = apl.resolve(apl.parse(`actions=execute,if=target.health.pct<${EXECUTE_PCT}`), TIER);
    expect(ofKind(rules.derive(resolved.actions, index, []).drafts, 'filler_below_health')).toEqual([]);
  });
});
