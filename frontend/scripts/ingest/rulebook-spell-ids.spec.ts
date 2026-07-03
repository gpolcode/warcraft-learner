import { describe, it, expect } from 'vitest';
import { rulebookSpellIds, unresolvedSpellIds } from './rulebook-spell-ids.ts';
import type { Rulebook } from '../../src/app/core/models/rulebook.models.ts';
import type { WclRawAbility } from '../../src/app/core/models/wcl.models.ts';

const ability = (id: number): WclRawAbility => ({ id, name: `Spell ${id}`, icon: 'x.jpg' });
const resolvedMap = (...ids: number[]): Record<string, WclRawAbility | null> =>
  Object.fromEntries(ids.map(id => [`a${id}`, ability(id)]));

describe('rulebookSpellIds', () => {
  it('collects cooldown, defensive, and both rule-condition spell ids', () => {
    const rulebook: Rulebook = {
      spec: 'SubtletyRogue',
      major_cooldowns: [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 180 }],
      defensives: [{ name: 'Cloak of Shadows', spell_id: 31224, cooldown: 120 }],
      rules: [
        {
          condition: {
            kind: 'cast_without_prior',
            spell_id: 185313, spell_name: 'Shadow Dance',
            required_spell_id: 280719, required_spell_name: 'Secret Technique', window_s: 5,
            exception: { context_spell_id: 121471, context_window_s: 20, position: 'before' },
          },
        },
        {
          condition: {
            kind: 'hold_cooldown_for_anchor',
            spell_ids: [185313, 280719], spell_names: ['Shadow Dance', 'Secret Technique'],
            anchor_spell_id: 121471, anchor_spell_name: 'Shadow Blades', hold_window_s: 15,
          },
        },
      ],
    };
    // Distinct, positive ids across every source (121471, 31224, 185313, 280719).
    expect(rulebookSpellIds(rulebook).sort((a, b) => a - b)).toEqual([31224, 121471, 185313, 280719]);
  });

  it('drops zero / negative placeholder ids and de-duplicates', () => {
    const rulebook: Rulebook = {
      spec: 'X',
      major_cooldowns: [{ name: 'A', spell_id: 100, cooldown: 90 }, { name: 'B', spell_id: 0, cooldown: 90 }],
      defensives: [{ name: 'C', spell_id: 100, cooldown: 90 }],
    };
    expect(rulebookSpellIds(rulebook)).toEqual([100]);
  });

  it('returns an empty list for a rulebook with no ids', () => {
    expect(rulebookSpellIds({ spec: 'X' })).toEqual([]);
  });

  it('ignores rules whose condition is null (display-only)', () => {
    const rulebook: Rulebook = { spec: 'X', rules: [{ condition: null }, { description: 'no condition' }] };
    expect(rulebookSpellIds(rulebook)).toEqual([]);
  });
});

describe('unresolvedSpellIds', () => {
  it('returns ids WCL resolved to null or omitted, ascending', () => {
    const resolved: Record<string, WclRawAbility | null> = { ...resolvedMap(100, 300), a200: null };
    expect(unresolvedSpellIds([300, 200, 100, 400], resolved)).toEqual([200, 400]);
  });

  it('returns an empty list when every id resolves', () => {
    expect(unresolvedSpellIds([100, 200], resolvedMap(100, 200))).toEqual([]);
  });

  it('treats an empty resolved map as everything unresolved', () => {
    expect(unresolvedSpellIds([100, 200], {})).toEqual([100, 200]);
  });
});
