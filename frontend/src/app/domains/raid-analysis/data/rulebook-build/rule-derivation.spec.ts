import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RuleDerivationService } from './rule-derivation-service';
import { AbilityIndexService } from './ability-index-service';
import { SimcAplService } from '../simc/simc-apl-service';
import { builder, enemyDot, finisher, parseSample, selfAura, spellRecord } from '../../../../../testing/builders/simc';
import { applyBuff, buffWindow, cast, removeBuff } from '../../../../../testing/builders/events';
import {
  BACKSTAB, BLACK_POWDER, DARKEST_NIGHT, EVISCERATE, GLOOMBLADE, RUPTURE, SECRET_TECHNIQUE, SHADOW_BLADES, SHADOW_DANCE, SHADOW_DANCE_AURA,
  SHADOWSTRIKE, SLICE_AND_DICE, VANISH, EXECUTE, SLAM,
} from '../../../../../testing/spell-ids';
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
/** Slice and Dice up for 70 of 100 seconds sits exactly on the maintained-aura floor. */
const MAINTAINED_S = 70;
const COMBO_POINTS = 4;
const RUPTURE_DOT = 1943;

const KIT = [
  builder(SHADOWSTRIKE, 'Shadowstrike', { className: `${SPEC} ${CLASS}` }),
  builder(BACKSTAB, 'Backstab', { className: CLASS }),
  builder(GLOOMBLADE, 'Gloomblade', { className: `${SPEC} ${CLASS}` }),
  finisher(EVISCERATE, 'Eviscerate', { className: CLASS }),
  finisher(BLACK_POWDER, 'Black Powder', { className: `${SPEC} ${CLASS}` }),
  finisher(RUPTURE, 'Rupture', { className: CLASS, effects: [enemyDot()], durationS: 24 }),
  finisher(SECRET_TECHNIQUE, 'Secret Technique', { className: `${SPEC} ${CLASS}`, charges: { count: 1, rechargeS: 25 } }),
  spellRecord({ id: SHADOW_DANCE, name: 'Shadow Dance', className: `${SPEC} ${CLASS}`, gcd: false, charges: { count: 1, rechargeS: 20 }, durationS: 6, effects: [selfAura()] }),
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

/** One parse: Shadow Dance and Darkest Night up for a lasting share, Slice and Dice up for the floor share, Rupture ticking, three Darkest Night procs of which two are spent. */
function sample(sliceAndDiceS = MAINTAINED_S): ParseSample {
  return parseSample({
    fightDurationS: FIGHT_S,
    casts: [cast(EVISCERATE, 12), cast(EVISCERATE, 42), cast(RUPTURE, 5)],
    buffs: [
      ...buffWindow(SHADOW_DANCE_AURA, 0, 20), ...buffWindow(SLICE_AND_DICE, 0, sliceAndDiceS),
      applyBuff(DARKEST_NIGHT, 10), removeBuff(DARKEST_NIGHT, 14), applyBuff(DARKEST_NIGHT, 40), removeBuff(DARKEST_NIGHT, 44),
      applyBuff(DARKEST_NIGHT, 70), removeBuff(DARKEST_NIGHT, 74),
    ],
    debuffs: buffWindow(RUPTURE_DOT, 5, 95),
  });
}

function drafts(samples: ParseSample[] = [sample()], profile = PROFILE): RuleDraft[] {
  const index = abilities.build(KIT, samples, CLASS, SPEC);
  const resolved = apl.resolve(apl.parseLines(profile), TIER);
  return rules.derive(resolved.actions, index, samples).drafts;
}

function ofKind<K extends RuleCondition['kind']>(all: RuleDraft[], kind: K): (RuleDraft & { condition: Extract<RuleCondition, { kind: K }> })[] {
  return all.filter((draft): draft is RuleDraft & { condition: Extract<RuleCondition, { kind: K }> } => draft.condition.kind === kind);
}

describe('RuleDerivationService.derive', () => {
  const all = drafts();

  it('pairs a cooldown with the one it waits for and holds one for the anchor it keeps clear of', () => {
    const [pairing] = ofKind(all, 'cast_without_prior').filter(draft => draft.condition.spell_id === SHADOW_BLADES);
    expect(pairing?.condition).toMatchObject({ required_spell_id: SHADOW_DANCE, position: 'after' });
    const [hold] = ofKind(all, 'hold_cooldown_for_anchor');
    expect(hold?.condition).toMatchObject({ spell_ids: [SHADOW_DANCE], anchor_spell_id: SHADOW_BLADES });
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
    expect(resource.find(draft => draft.condition.spell_id === EVISCERATE)?.condition.resource_type).toBe(COMBO_POINTS);
  });

  it('reads the builder pressed inside a state from the builders gated outside it', () => {
    const [inDance] = ofKind(all, 'filler_in_buff').filter(draft => draft.condition.buff_spell_id === SHADOW_DANCE_AURA);
    expect(inDance?.condition.spell_id).toBe(SHADOWSTRIKE);
    expect(inDance?.condition.alternative_spell_ids.sort((a, b) => a - b)).toEqual([BACKSTAB, GLOOMBLADE]);
  });

  it('reads the finisher pressed inside a proc against the finishers below it, never a builder', () => {
    const [inNight] = ofKind(all, 'filler_in_buff').filter(draft => draft.condition.buff_spell_id === DARKEST_NIGHT);
    expect(inNight?.condition.spell_id).toBe(EVISCERATE);
    expect(inNight?.condition.alternative_spell_ids.sort((a, b) => a - b)).toEqual([RUPTURE, BLACK_POWDER].sort((a, b) => a - b));
  });

  it('reads the target-count switches from the lines that gate on a count', () => {
    const counts = ofKind(all, 'cast_at_target_count').map(draft => `${draft.condition.spell_id}:${draft.condition.bound}`).sort();
    expect(counts).toEqual([`${BACKSTAB}:max`, `${GLOOMBLADE}:max`, `${BLACK_POWDER}:min`].sort());
  });

  it('never writes a state rule against the action\'s own aura', () => {
    expect(ofKind(all, 'cast_outside_buff').some(draft => draft.condition.spell_id === SHADOW_DANCE)).toBe(false);
  });

  it('reads a refreshable gate on the action\'s own dot as a clip rule', () => {
    const [clip] = ofKind(all, 'aura_clipped');
    expect(clip?.condition).toMatchObject({ aura_spell_id: RUPTURE_DOT, cast_spell_id: RUPTURE, on: 'target' });
  });

  it('keeps an aura the parses hold up for the floor share and drops one just under it', () => {
    expect(ofKind(all, 'aura_uptime_below').map(draft => draft.condition.aura_spell_id)).toContain(SLICE_AND_DICE);
    expect(ofKind(drafts([sample(MAINTAINED_S - 1)]), 'aura_uptime_below').map(draft => draft.condition.aura_spell_id)).not.toContain(SLICE_AND_DICE);
  });

  it('reads a short buff spent inside most of its windows as a proc to spend on sight', () => {
    const [proc] = ofKind(all, 'proc_wasted');
    expect(proc?.condition).toMatchObject({ buff_spell_id: DARKEST_NIGHT, spend_spell_ids: [EVISCERATE] });
  });

  it('drops the proc when the parses spend it in fewer than half its windows', () => {
    const unspent = { ...sample(), casts: sample().casts.filter(event => event.abilityGameID !== EVISCERATE || event.atS > 40) };
    expect(ofKind(drafts([unspent]), 'proc_wasted')).toEqual([]);
  });

  it('orders drafts by the priority of the line that produced them', () => {
    const priorities = all.map(draft => draft.priority);
    expect([...priorities].sort((a, b) => a - b)).toEqual(priorities);
  });
});

describe('RuleDerivationService.derive on an execute', () => {
  const EXECUTE_PCT = 20;
  const MASSACRE_PCT = 35;
  const MASSACRE = 'massacre';
  const WARRIOR_KIT = [
    spellRecord({ id: EXECUTE, name: 'Execute', className: 'Warrior', resources: [{ powerType: 1, amount: 20 }], cooldownS: 6, executeHealthPct: EXECUTE_PCT }),
    spellRecord({ id: SLAM, name: 'Slam', className: 'Warrior', resources: [{ powerType: 1, amount: 20 }] }),
  ];
  const profile = [
    `actions=run_action_list,name=execute,if=talent.${MASSACRE}&target.health.pct<${MASSACRE_PCT}|target.health.pct<${EXECUTE_PCT}`,
    'actions+=/slam',
    'actions.execute=execute',
    'actions.execute+=/slam',
  ].join('\n');

  it('writes one execute rule per threshold, gated on the talent that moves it', () => {
    const index = abilities.build(WARRIOR_KIT, [], 'Warrior', 'Arms');
    const resolved = apl.resolve(apl.parseLines(profile), TIER);
    const executes = ofKind(rules.derive(resolved.actions, index, []).drafts, 'filler_below_health');
    expect(executes.map(draft => draft.condition.health_pct).sort((a, b) => a - b)).toEqual([EXECUTE_PCT, MASSACRE_PCT]);
    expect([...(executes.find(draft => draft.condition.health_pct === MASSACRE_PCT)?.requires ?? [])]).toEqual([MASSACRE]);
    expect(executes.every(draft => draft.condition.alternative_spell_ids.includes(SLAM))).toBe(true);
  });
});
