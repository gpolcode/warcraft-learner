import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { RuleCondition } from '../../plan/plan.models';
import { BLADESTORM } from '../../../../../../testing/spell-ids';
import { RuleCopyService } from './rule-copy-service';

const copy = TestBed.inject(RuleCopyService);

const RECKLESSNESS = 1719;
const HOT_STREAK = 48108;
const PYROBLAST = 11366;
const FLAMESTRIKE = 2120;

describe('RuleCopyService.rule', () => {
  const cases: { name: string; condition: RuleCondition; title: string; action: string; type: string }[] = [
    {
      name: 'a cooldown held for a buff',
      condition: { kind: 'cast_outside_buff', spell_id: BLADESTORM, spell_name: 'Bladestorm', buff_spell_id: RECKLESSNESS, buff_spell_name: 'Recklessness', require: 'inside' },
      title: 'Bladestorm only inside Recklessness',
      action: 'Wait for Recklessness before you press Bladestorm.',
      type: 'cooldown_pairing',
    },
    {
      name: 'a proc spent by several buttons',
      condition: {
        kind: 'proc_wasted', buff_spell_id: HOT_STREAK, buff_spell_name: 'Hot Streak!',
        spend_spell_ids: [PYROBLAST, FLAMESTRIKE], spend_spell_names: ['Pyroblast', 'Flamestrike'],
      },
      title: 'Spend Hot Streak! on sight',
      action: 'Press Pyroblast or Flamestrike as soon as Hot Streak! procs.',
      type: 'rotation',
    },
    {
      name: 'a pool that takes a singular verb',
      condition: { kind: 'resource_at_cast', spell_id: 1, spell_name: 'Bloodthirst', resource_type: 1, resource_name: 'rage', bound: 'max' },
      title: 'Bloodthirst at low rage',
      action: 'Press Bloodthirst only while your rage is low.',
      type: 'rotation',
    },
  ];

  it.each(cases)('writes the title, fix and chip for $name', ({ condition, title, action, type }) => {
    expect(copy.rule(condition)).toEqual({ type, severity: 'warning', description: title, condition, action });
  });
});
