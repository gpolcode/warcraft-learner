import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { group } from 'd3-array';
import type { RuleCondition } from '../plan/plan.models';
import { AplRuleService } from './apl-rule-service';
import { SimcAplService } from './simc-apl-service';
import type { SpellRecord } from './spell-dump-service';

const rules = TestBed.inject(AplRuleService);
const apl = TestBed.inject(SimcAplService);

const MAELSTROM_MAX_STACKS = 10;
const RAGE_TYPE = 1;

/** A spell as SimC's dump records it, with no cooldown, stacks or labels unless the case gives them. */
const spell = (token: string, over: Partial<SpellRecord> = {}): SpellRecord => ({
  id: 0, name: token, token, cooldown: 0, maxStacks: 0, major: false, defensive: false, talented: false, specs: null, ...over,
});

const derive = (lines: string[], spells: SpellRecord[] = []): RuleCondition[] =>
  rules.derive(apl.readProfile(lines.join('\n')), group(spells, record => record.token));

const cooldown = (token: string): SpellRecord => spell(token, { cooldown: 90 });
const filler = (token: string): SpellRecord => spell(token);

describe('AplRuleService.derive', () => {
  const cases: { name: string; lines: string[]; spells?: SpellRecord[]; derived: RuleCondition[] }[] = [
    {
      name: 'a buff on every line of a cooldown means press it only inside the buff',
      lines: ['actions=bladestorm,if=buff.recklessness.up'],
      spells: [cooldown('bladestorm')],
      derived: [{ kind: 'cast_outside_buff', spell_id: 0, spell_name: 'bladestorm', buff_spell_id: 0, buff_spell_name: 'recklessness', require: 'inside' }],
    },
    {
      name: 'a negated buff means never press it inside the buff',
      lines: ['actions=rampage,if=!buff.recklessness.up'],
      derived: [{ kind: 'cast_outside_buff', spell_id: 0, spell_name: 'rampage', buff_spell_id: 0, buff_spell_name: 'recklessness', require: 'outside' }],
    },
    {
      name: 'a buff that must be down reads the same as a negated one',
      lines: ['actions=rampage,if=buff.recklessness.down'],
      derived: [{ kind: 'cast_outside_buff', spell_id: 0, spell_name: 'rampage', buff_spell_id: 0, buff_spell_name: 'recklessness', require: 'outside' }],
    },
    {
      name: 'a buff gate on a filler also makes it the filler to press inside the buff',
      lines: ['actions=pistol_shot,if=buff.opportunity.up', 'actions+=/sinister_strike'],
      spells: [filler('sinister_strike')],
      derived: [
        { kind: 'cast_outside_buff', spell_id: 0, spell_name: 'pistol_shot', buff_spell_id: 0, buff_spell_name: 'opportunity', require: 'inside' },
        {
          kind: 'filler_in_buff', spell_id: 0, spell_name: 'pistol_shot',
          alternative_spell_ids: [0], alternative_spell_names: ['sinister_strike'], buff_spell_id: 0, buff_spell_name: 'opportunity',
        },
      ],
    },
    {
      name: 'a floor on enemies means press it only on several targets',
      lines: ['actions=whirlwind,if=active_enemies>=2'],
      derived: [{ kind: 'cast_at_target_count', spell_id: 0, spell_name: 'whirlwind', bound: 'min' }],
    },
    {
      name: 'a single target means press it only on a few targets',
      lines: ['actions=raging_blow,if=active_enemies=1'],
      derived: [{ kind: 'cast_at_target_count', spell_id: 0, spell_name: 'raging_blow', bound: 'max' }],
    },
    {
      name: 'a floor on the pool means spend it full',
      lines: ['actions=rampage,if=rage>=80'],
      derived: [{ kind: 'resource_at_cast', spell_id: 0, spell_name: 'rampage', resource_type: RAGE_TYPE, resource_name: 'rage', bound: 'min' }],
    },
    {
      name: 'a floor on the pool\'s deficit means generate before it caps',
      lines: ['actions=bloodthirst,if=rage.deficit>=20'],
      derived: [{ kind: 'resource_at_cast', spell_id: 0, spell_name: 'bloodthirst', resource_type: RAGE_TYPE, resource_name: 'rage', bound: 'max' }],
    },
    {
      name: 'a floor on a buff\'s stacks means spend at high stacks, capped at the buff\'s own maximum',
      lines: ['actions=lightning_bolt,if=buff.maelstrom_weapon.stack>=5'],
      spells: [spell('maelstrom_weapon', { maxStacks: MAELSTROM_MAX_STACKS })],
      derived: [{
        kind: 'spend_at_stacks', spell_id: 0, spell_name: 'lightning_bolt',
        buff_spell_id: 0, buff_spell_name: 'maelstrom_weapon', bound: 'min', max_stacks: MAELSTROM_MAX_STACKS,
      }],
    },
    {
      name: 'a stack floor on a buff whose maximum the dump does not give makes no rule',
      lines: ['actions=lightning_bolt,if=buff.maelstrom_weapon.stack>=5'],
      derived: [],
    },
    {
      name: 'the previous button means press it right after that one',
      lines: ['actions=eviscerate,if=prev_gcd.1.shadow_dance'],
      derived: [{ kind: 'cast_without_prior', spell_id: 0, spell_name: 'eviscerate', required_spell_id: 0, required_spell_name: 'shadow_dance' }],
    },
    {
      name: 'a health ceiling means press it over the fillers in execute',
      lines: ['actions=execute,if=target.health.pct<20', 'actions+=/slam'],
      spells: [filler('slam')],
      derived: [{
        kind: 'filler_below_health', spell_id: 0, spell_name: 'execute',
        alternative_spell_ids: [0], alternative_spell_names: ['slam'], health_pct: 20,
      }],
    },
    {
      name: 'a health ceiling with no filler to displace makes no rule',
      lines: ['actions=execute,if=target.health.pct<20'],
      derived: [],
    },
    {
      name: 'another cooldown\'s remaining time means hold it for that cooldown',
      lines: ['actions=killing_spree,if=cooldown.adrenaline_rush.remains>20'],
      derived: [{ kind: 'hold_cooldown_for_anchor', spell_ids: [0], spell_names: ['killing_spree'], anchor_spell_id: 0, anchor_spell_name: 'adrenaline_rush' }],
    },
    {
      name: 'the pairing still reads when the term also allows the cooldown\'s own window',
      lines: ['actions=killing_spree,if=cooldown.adrenaline_rush.remains>20|buff.adrenaline_rush.up'],
      derived: [{ kind: 'hold_cooldown_for_anchor', spell_ids: [0], spell_names: ['killing_spree'], anchor_spell_id: 0, anchor_spell_name: 'adrenaline_rush' }],
    },
    {
      name: 'a term only one line of a button carries makes no rule',
      lines: ['actions=rampage,if=rage>=80', 'actions+=/rampage'],
      derived: [],
    },
    {
      name: 'refreshing its own dot means keep it up and refresh it late',
      lines: ['actions=rupture,if=refreshable'],
      derived: [
        { kind: 'aura_uptime_below', aura_spell_id: 0, aura_spell_name: 'rupture', on: 'target' },
        { kind: 'aura_clipped', aura_spell_id: 0, aura_spell_name: 'rupture', cast_spell_id: 0, cast_spell_name: 'rupture', on: 'target' },
      ],
    },
    {
      name: 'a dot that must be ticking means keep it on the target',
      lines: ['actions=rip,if=!dot.rip.ticking'],
      derived: [{ kind: 'aura_uptime_below', aura_spell_id: 0, aura_spell_name: 'rip', on: 'target' }],
    },
    {
      name: 'refreshing a buff before it runs out means keep it up',
      lines: ['actions=rampage,if=buff.enrage.remains<1.5'],
      derived: [{ kind: 'aura_uptime_below', aura_spell_id: 0, aura_spell_name: 'enrage', on: 'self' }],
    },
    {
      name: 'a buff the button refreshes itself means keep it up and refresh it late',
      lines: ['actions=slice_and_dice,if=buff.slice_and_dice.refreshable'],
      derived: [
        { kind: 'aura_uptime_below', aura_spell_id: 0, aura_spell_name: 'slice_and_dice', on: 'self' },
        { kind: 'aura_clipped', aura_spell_id: 0, aura_spell_name: 'slice_and_dice', cast_spell_id: 0, cast_spell_name: 'slice_and_dice', on: 'self' },
      ],
    },
    {
      name: 'a buff the APL reacts to but never presses is a proc, spent by every button gated on it',
      lines: ['actions=pyroblast,if=buff.hot_streak.react', 'actions+=/flamestrike,if=buff.hot_streak.react'],
      spells: [cooldown('pyroblast'), cooldown('flamestrike')],
      derived: [
        { kind: 'cast_outside_buff', spell_id: 0, spell_name: 'pyroblast', buff_spell_id: 0, buff_spell_name: 'hot_streak', require: 'inside' },
        { kind: 'cast_outside_buff', spell_id: 0, spell_name: 'flamestrike', buff_spell_id: 0, buff_spell_name: 'hot_streak', require: 'inside' },
        {
          kind: 'proc_wasted', buff_spell_id: 0, buff_spell_name: 'hot_streak',
          spend_spell_ids: [0, 0], spend_spell_names: ['pyroblast', 'flamestrike'],
        },
      ],
    },
  ];

  it.each(cases)('reads $name', ({ lines, spells, derived }) => {
    expect(derive(lines, spells)).toEqual(derived);
  });

  it('derives each rule once, however many lines state it', () => {
    const twice = derive(['actions=bladestorm,if=buff.recklessness.up', 'actions+=/bladestorm,if=buff.recklessness.up'], [cooldown('bladestorm')]);
    expect(twice).toHaveLength(1);
  });
});
