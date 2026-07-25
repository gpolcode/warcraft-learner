import { describe, it, expect } from 'vitest';
import { RulebookRule } from '../core/models/rulebook.models';
import {
  SHADOW_BLADES, SHADOW_DANCE, SECRET_TECHNIQUE,
} from '../../testing/spell-ids';
import { validateRulebookRules } from './rulebook-validation';

const SPEC = 'SubtletyRogue';

function holdRule(over: Partial<RulebookRule> = {}): RulebookRule {
  return {
    type: 'cd_hold', priority: 'high',
    description: 'Hold Dance and SecTech charges for Shadow Blades',
    action: 'Stop spending Shadow Dance charges when Shadow Blades is within 20 seconds of coming off cooldown.',
    condition: {
      kind: 'hold_cooldown_for_anchor',
      spell_ids: [SHADOW_DANCE, SECRET_TECHNIQUE], spell_names: ['Shadow Dance', 'Secret Technique'],
      anchor_spell_id: SHADOW_BLADES, anchor_spell_name: 'Shadow Blades', hold_window_s: 20,
    },
    ...over,
  };
}

describe('validateRulebookRules', () => {
  it('passes a hold rule whose action tells the player to withhold', () => {
    expect(validateRulebookRules(SPEC, [holdRule()])).toEqual([]);
  });

  it('passes a display-only rule, which has no condition to disagree with', () => {
    expect(validateRulebookRules(SPEC, [holdRule({ condition: null })])).toEqual([]);
  });

  it('flags a hold rule whose text describes stacking two cooldowns', () => {
    const stacked = holdRule({
      description: 'Stack Shadow Dance with Shadow Blades every window',
      action: 'Always cast Shadow Dance within 5 seconds of Shadow Blades to stack their damage bonuses.',
    });
    const defects = validateRulebookRules(SPEC, [stacked]);
    expect(defects).toHaveLength(1);
    expect(defects[0].problem).toContain('pairing');
  });

  it('flags a hold rule whose action asks for the held cast before the anchor', () => {
    const inverted = holdRule({
      description: 'Keep Shadow Dance cast just before Shadow Blades',
      action: 'Cast Shadow Dance immediately before Shadow Blades so the two cooldowns return at the same time.',
    });
    const defects = validateRulebookRules(SPEC, [inverted]);
    expect(defects).toHaveLength(1);
    expect(defects[0].problem).toContain('Shadow Blades');
  });

  it('passes an action that puts the anchor before the held spell, which is the order a hold wants', () => {
    const correct = holdRule({
      description: 'Get Shadow Blades out first',
      action: 'Always cast Shadow Blades before pressing Shadow Dance so the window is covered.',
    });
    expect(validateRulebookRules(SPEC, [correct])).toEqual([]);
  });

  it('flags a hold rule that holds its own anchor', () => {
    const selfAnchored = holdRule({
      condition: {
        kind: 'hold_cooldown_for_anchor',
        spell_ids: [SHADOW_BLADES], spell_names: ['Shadow Blades'],
        anchor_spell_id: SHADOW_BLADES, anchor_spell_name: 'Shadow Blades', hold_window_s: 20,
      },
    });
    expect(validateRulebookRules(SPEC, [selfAnchored])[0].problem).toBe('Shadow Blades is held for itself');
  });

  it('flags a paired-cast rule that requires a spell to accompany itself', () => {
    const selfRequired: RulebookRule = {
      description: 'Secret Technique always inside Shadow Dance',
      action: 'Cast Secret Technique inside Shadow Dance.',
      condition: {
        kind: 'cast_without_prior',
        spell_id: SECRET_TECHNIQUE, spell_name: 'Secret Technique',
        required_spell_id: SECRET_TECHNIQUE, required_spell_name: 'Secret Technique', window_s: 8,
      },
    };
    expect(validateRulebookRules(SPEC, [selfRequired])[0].problem)
      .toBe('Secret Technique is required to accompany itself');
  });

  it('passes a well-formed paired-cast rule', () => {
    const paired: RulebookRule = {
      description: 'Secret Technique always inside Shadow Dance',
      action: 'Cast Secret Technique inside every Shadow Dance window.',
      condition: {
        kind: 'cast_without_prior',
        spell_id: SECRET_TECHNIQUE, spell_name: 'Secret Technique',
        required_spell_id: SHADOW_DANCE, required_spell_name: 'Shadow Dance', window_s: 8,
      },
    };
    expect(validateRulebookRules(SPEC, [paired])).toEqual([]);
  });

  it('names the spec and the rule so a run log points at the file to fix', () => {
    const stacked = holdRule({ action: 'Cast both together for the burst window.' });
    expect(validateRulebookRules(SPEC, [stacked])[0])
      .toMatchObject({ spec: SPEC, rule: 'Hold Dance and SecTech charges for Shadow Blades' });
  });
});
