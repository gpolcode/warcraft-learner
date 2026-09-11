import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RulebookCopyService } from './rulebook-copy-service';
import { AbilityIndexService } from './ability-index-service';
import { SimcAplService } from '../simc/simc-apl-service';
import { builder, selfAura, spellRecord } from '../../../../../testing/builders/simc';
import { BACKSTAB, SHADOW_BLADES, SHADOW_DANCE, SHADOWSTRIKE, SLICE_AND_DICE } from '../../../../../testing/spell-ids';
import type { RuleCondition } from '../rulebook/rulebook.models';

const copy = TestBed.inject(RulebookCopyService);
const abilities = TestBed.inject(AbilityIndexService);
const apl = TestBed.inject(SimcAplService);

const DESCRIPTION_MAX = 60;
const TIER = 'midnight_season_2';
const LONG_NAME = 'Incarnation: Chosen of Elune';

const KIT = [
  builder(SHADOWSTRIKE, 'Shadowstrike', { className: 'Rogue' }),
  builder(BACKSTAB, 'Backstab', { className: 'Rogue' }),
  spellRecord({ id: SHADOW_DANCE, name: 'Shadow Dance', className: 'Rogue', gcd: false, rechargeS: 20, durationS: 6, effects: [selfAura()] }),
  spellRecord({ id: SHADOW_BLADES, name: 'Shadow Blades', className: 'Rogue', gcd: false, cooldownS: 90, durationS: 20, effects: [selfAura()] }),
  spellRecord({ id: SLICE_AND_DICE, name: 'Slice and Dice', className: 'Rogue', durationS: 30, effects: [selfAura()] }),
];
const index = abilities.build(KIT, [], 'Rogue', 'Subtlety');

const fillerInBuff: RuleCondition = {
  kind: 'filler_in_buff', spell_id: SHADOWSTRIKE, spell_name: 'Shadowstrike', alternative_spell_ids: [BACKSTAB], alternative_spell_names: ['Backstab'],
  buff_spell_id: SHADOW_DANCE, buff_spell_name: 'Shadow Dance', except_buff_spell_ids: [], except_buff_spell_names: [],
};

function linesOf(profile: string) {
  return apl.resolve(apl.parseLines(profile), TIER).actions;
}

describe('RulebookCopyService.description', () => {
  it('names the abilities of the rule and fits the findings table', () => {
    expect(copy.description(fillerInBuff)).toBe('Shadowstrike inside Shadow Dance');
  });

  it('falls back to the short title when the full one overflows', () => {
    const long: RuleCondition = { ...fillerInBuff, spell_name: LONG_NAME, buff_spell_name: `${LONG_NAME} and a long state name` };
    const description = copy.description(long);
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(description.startsWith(`${LONG_NAME} in `)).toBe(true);
  });
});

describe('RulebookCopyService.action', () => {
  it('says what to press instead and when, in the second person', () => {
    expect(copy.action(fillerInBuff)).toBe('Press Shadowstrike instead of Backstab while Shadow Dance is up.');
    expect(copy.action({ kind: 'aura_uptime_below', aura_spell_id: SLICE_AND_DICE, aura_spell_name: 'Slice and Dice', on: 'self' }))
      .toBe('Refresh Slice and Dice before it falls off.');
    expect(copy.action({ kind: 'resource_at_cast', spell_id: 1, spell_name: 'Vanish', resource_type: 4, resource_name: 'combo points', bound: 'max' }))
      .toBe('Press Vanish only while your combo points are low.');
  });
});

describe('RulebookCopyService.usageRule', () => {
  it('reads the cooldown clause first and a state after it, dropping the action\'s own aura', () => {
    const lines = linesOf('actions=shadow_dance,if=!buff.shadow_dance.up&buff.slice_and_dice.up&cooldown.shadow_blades.remains>=35');
    expect(copy.usageRule(lines, index)).toBe('Press it when Shadow Blades is more than 35s away and Slice and Dice is up.');
  });

  it('prefers the line met on one target over an AoE list and puts what must be absent last', () => {
    const lines = linesOf([
      'actions=run_action_list,name=aoe,if=active_enemies>2',
      'actions+=/run_action_list,name=st',
      'actions.aoe=shadow_blades,if=active_enemies>2',
      'actions.st=shadow_blades,if=!buff.shadow_dance.up&buff.slice_and_dice.up',
    ].join('\n'));
    expect(copy.usageRule(lines, index)).toBe('Press it when Slice and Dice is up and fewer than 3 enemies are up.');
  });

  it('falls back to an unconditional sentence', () => {
    expect(copy.usageRule(linesOf('actions=shadow_blades'), index)).toBe('Use it on cooldown.');
  });
});

describe('RulebookCopyService.aplCondition', () => {
  it('joins every line\'s inherited and own gates in SimC syntax', () => {
    const lines = linesOf([
      'actions=call_action_list,name=cds,if=combo_points>=5',
      'actions.cds=shadow_blades,if=buff.slice_and_dice.up',
      'actions.cds+=/shadow_blades,if=buff.shadow_dance.up',
    ].join('\n'));
    expect(copy.aplCondition(lines)).toBe('((combo_points>=5)&(buff.slice_and_dice.up))|((combo_points>=5)&(buff.shadow_dance.up))');
    expect(copy.aplCondition(linesOf('actions=shadow_blades'))).toBe('1');
  });
});

describe('RulebookCopyService.defensiveUsage', () => {
  it('names the mitigation the effect gives', () => {
    const entry = (subtype: string, baseValue: number | null) => ({ record: KIT[0] as never, effect: { subtype, baseValue } });
    expect(copy.defensiveUsage(entry('Modify AoE Damage Taken%', -40))).toBe('Press it just before a big hit for 40% less damage.');
    expect(copy.defensiveUsage(entry('Absorb Damage', 0))).toBe('Press it ahead of a hit so the shield takes it.');
    expect(copy.defensiveUsage(entry('School Immunity', 100))).toBe('Press it to shrug off a magic hit or a debuff you cannot avoid.');
  });
});
