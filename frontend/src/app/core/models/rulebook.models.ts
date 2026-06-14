export interface RulebookCooldown {
  name: string;
  spell_id: number;
  cooldown: number;
  duration?: number;
  align_with_bloodlust?: boolean;
  opener_priority?: number;
  usage_rule?: string;
}

export interface RulebookDefensive {
  name: string;
  spell_id: number;
  cooldown: number;
  duration?: number;
  usage_rule?: string;
}

export interface CastWithoutPriorCondition {
  kind: 'cast_without_prior';
  spell_id: number;
  spell_name: string;
  required_spell_id: number;
  required_spell_name: string;
  window_s?: number;
  exception?: {
    context_spell_id: number;
    context_window_s?: number;
    position?: 'before' | 'after';
  };
}

export interface HoldCooldownForAnchorCondition {
  kind: 'hold_cooldown_for_anchor';
  spell_ids: number[];
  spell_names: string[];
  anchor_spell_id: number;
  anchor_spell_name: string;
  hold_window_s?: number;
}

export interface CastWithoutBuffCondition {
  kind: 'cast_without_buff';
  spell_id: number;
  spell_name: string;
  buff_id: number;
  buff_name: string;
}

export interface CastWithBuffCondition {
  kind: 'cast_with_buff';
  spell_id: number;
  spell_name: string;
  buff_id: number;
  buff_name: string;
}

export type RuleCondition = CastWithoutPriorCondition | HoldCooldownForAnchorCondition | CastWithoutBuffCondition | CastWithBuffCondition;

export interface RulebookRule {
  type?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low' | string;
  description?: string;
  condition?: RuleCondition | null;
  action?: string;
}

export interface Rulebook {
  spec: string;
  major_cooldowns?: RulebookCooldown[];
  defensives?: RulebookDefensive[];
  rules?: RulebookRule[];
  source_summary?: string;
  guide_count?: number;
  saved_at?: string;
}
