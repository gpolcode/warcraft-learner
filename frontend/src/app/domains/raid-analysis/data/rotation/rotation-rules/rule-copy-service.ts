import { Injectable } from '@angular/core';
import type { RuleCondition, PlanRule } from '../../plan/plan.models';

type Kind = RuleCondition['kind'];
type Of<K extends Kind> = Extract<RuleCondition, { kind: K }>;
type Copy = { [K in Kind]: (condition: Of<K>) => string };

/** Refreshing inside the last 30% of a periodic effect keeps the remainder: the game's pandemic window. */
const PANDEMIC_SHARE = 30;

const list = (names: string[]): string => (names.length <= 1 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} or ${names[names.length - 1] ?? ''}`);
/** A pool named in the plural takes a plural verb: combo points are, energy is. */
const verb = (name: string): string => (name.endsWith('s') ? 'are' : 'is');

const TITLE: Copy = {
  cast_without_prior: c => `${c.spell_name} after ${c.required_spell_name}`,
  hold_cooldown_for_anchor: c => `Hold ${list(c.spell_names)} for ${c.anchor_spell_name}`,
  cast_outside_buff: c => `${c.spell_name} ${c.require === 'inside' ? 'only inside' : 'never inside'} ${c.buff_spell_name}`,
  aura_uptime_below: c => (c.on === 'target' ? `Keep ${c.aura_spell_name} on the target` : `Keep ${c.aura_spell_name} up`),
  opening_sequence: c => `Open with ${c.spell_names.join(', ')}`,
  cast_at_target_count: c => (c.bound === 'min' ? `${c.spell_name} only on several targets` : `${c.spell_name} only on a few targets`),
  resource_at_cast: c => (c.bound === 'min' ? `${c.spell_name} at high ${c.resource_name}` : `${c.spell_name} at low ${c.resource_name}`),
  proc_wasted: c => `Spend ${c.buff_spell_name} on sight`,
  filler_in_buff: c => `${c.spell_name} inside ${c.buff_spell_name}`,
  spend_at_stacks: c => (c.bound === 'min' ? `${c.spell_name} at high ${c.buff_spell_name} stacks` : `${c.spell_name} before ${c.buff_spell_name} caps`),
  aura_clipped: c => `Refresh ${c.aura_spell_name} late`,
  filler_below_health: c => `${c.spell_name} below ${c.health_pct}% health`,
};

const ACTION: Copy = {
  cast_without_prior: c => `Press ${c.required_spell_name} before ${c.spell_name}.`,
  hold_cooldown_for_anchor: c => `Save ${list(c.spell_names)} for the ${c.anchor_spell_name} window and press ${c.spell_names.length > 1 ? 'them' : 'it'} inside it.`,
  cast_outside_buff: c => (c.require === 'inside'
    ? `Wait for ${c.buff_spell_name} before you press ${c.spell_name}.`
    : `Hold ${c.spell_name} until ${c.buff_spell_name} has dropped.`),
  aura_uptime_below: c => `Refresh ${c.aura_spell_name} before it falls off.`,
  opening_sequence: c => `Pull with ${c.spell_names.join(', then ')}.`,
  cast_at_target_count: c => (c.bound === 'min'
    ? `Press ${c.spell_name} only once several enemies are up.`
    : `Switch away from ${c.spell_name} once several enemies are up.`),
  resource_at_cast: c => (c.bound === 'min'
    ? `Build ${c.resource_name} before you spend ${c.spell_name}.`
    : `Press ${c.spell_name} only while your ${c.resource_name} ${verb(c.resource_name)} low.`),
  proc_wasted: c => `Press ${list(c.spend_spell_names)} as soon as ${c.buff_spell_name} procs.`,
  filler_in_buff: c => `Press ${c.spell_name} instead of ${list(c.alternative_spell_names)} while ${c.buff_spell_name} is up.`,
  spend_at_stacks: c => (c.bound === 'min'
    ? `Wait for more ${c.buff_spell_name} stacks before you press ${c.spell_name}.`
    : `Press ${c.spell_name} only while ${c.buff_spell_name} is below its cap.`),
  aura_clipped: c => `Refresh ${c.aura_spell_name} only inside its last ${PANDEMIC_SHARE}%.`,
  filler_below_health: c => `Press ${c.spell_name} instead of ${list(c.alternative_spell_names)} once the target is below ${c.health_pct}% health.`,
};

/** The findings table's type chip for each kind: the tag the top rules of each kind carried. */
const TYPE: Record<Kind, string> = {
  cast_without_prior: 'cooldown_pairing',
  hold_cooldown_for_anchor: 'cd_hold',
  cast_outside_buff: 'cooldown_pairing',
  aura_uptime_below: 'rotation',
  opening_sequence: 'opener',
  cast_at_target_count: 'aoe_switch',
  resource_at_cast: 'rotation',
  proc_wasted: 'rotation',
  filler_in_buff: 'rotation',
  spend_at_stacks: 'rotation',
  aura_clipped: 'rotation',
  filler_below_health: 'rotation',
};

/** The title, fix and chip a finding row prints, written from the condition alone. */
@Injectable({ providedIn: 'root' })
export class RuleCopyService {
  rule(condition: RuleCondition): PlanRule {
    return {
      type: TYPE[condition.kind],
      severity: 'warning',
      description: this.render(TITLE, condition),
      condition,
      action: this.render(ACTION, condition),
    };
  }

  private render<K extends Kind>(copy: Copy, condition: Of<K>): string {
    const template: (entry: Of<K>) => string = copy[condition.kind];
    return template(condition);
  }
}
