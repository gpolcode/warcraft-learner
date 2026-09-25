import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { PlanLine } from '../plan/plan.models';
import { SimcAplService } from './simc-apl-service';

const apl = TestBed.inject(SimcAplService);

const lines = (...entries: string[]): PlanLine[] => apl.readApl(entries.join('\n'));

describe('SimcAplService.readApl', () => {
  it('reads each button line of the default list with its top-level & terms', () => {
    expect(lines('actions=rampage,if=buff.enrage.down&rage>=80')).toEqual([{ action: 'rampage', terms: ['buff.enrage.down', 'rage>=80'] }]);
  });

  it('carries the terms of a called list onto every line inside it', () => {
    const [line] = lines(
      'actions=call_action_list,name=cooldowns,if=active_enemies>=2',
      'actions.cooldowns=bladestorm,if=buff.recklessness.up',
    );
    expect(line).toEqual({ action: 'bladestorm', terms: ['active_enemies>=2', 'buff.recklessness.up'] });
  });

  it('reads && as & and leaves a | term whole, sim-only branches included', () => {
    const [line] = lines('actions=pistol_shot,if=buff.opportunity.up&&(energy<50|fight_remains<10)');
    expect(line?.terms).toEqual(['buff.opportunity.up', 'energy<50|fight_remains<10']);
  });

  it('holds the lines after a run_action_list call to the call\'s condition failing, since SimC never returns from it', () => {
    const [, after] = lines(
      'actions=run_action_list,name=aoe,if=active_enemies>=3&buff.x.up',
      'actions.aoe=whirlwind',
      'actions+=/rampage',
    );
    expect(after).toEqual({ action: 'rampage', terms: ['!(active_enemies>=3&buff.x.up)'] });
  });

  it('reaches no line after an unconditional run_action_list', () => {
    expect(lines('actions=run_action_list,name=aoe', 'actions.aoe=whirlwind', 'actions+=/rampage').map(line => line.action)).toEqual(['whirlwind']);
  });

  it('keeps a line\'s line_cd', () => {
    expect(lines('actions=rampage,line_cd=10')).toEqual([{ action: 'rampage', terms: [], line_cd: 10 }]);
  });

  it('inlines a variable set once, unconditionally', () => {
    const [line] = lines('actions=variable,name=st,value=active_enemies=1', 'actions+=/rampage,if=variable.st');
    expect(line?.terms).toEqual(['active_enemies=1']);
  });

  it('inlines a 1/0 setif as its condition and a 0/1 setif as its negation', () => {
    const [one, zero] = lines(
      'actions=variable,name=st,op=setif,value=1,value_else=0,condition=active_enemies=1',
      'actions+=/variable,name=aoe,op=setif,value=0,value_else=1,condition=active_enemies=1',
      'actions+=/rampage,if=variable.st',
      'actions+=/whirlwind,if=variable.aoe',
    );
    expect(one?.terms).toEqual(['active_enemies=1']);
    expect(zero?.terms).toEqual(['!(active_enemies=1)']);
  });

  it('leaves a variable assigned more than once as sim state', () => {
    const [line] = lines(
      'actions=variable,name=pool,value=1,if=energy<50',
      'actions+=/variable,name=pool,value=0,if=energy>=50',
      'actions+=/rampage,if=variable.pool',
    );
    expect(line?.terms).toEqual(['variable.pool']);
  });

  it('skips actions that press no spell of the spec', () => {
    expect(lines('actions=auto_attack', 'actions+=/potion', 'actions+=/use_item,name=trinket').map(line => line.action)).toEqual([]);
  });

  it('keeps a line under a condition jsep cannot read, with no terms to read', () => {
    expect(lines('actions=rampage,if=rage>=(80')).toEqual([{ action: 'rampage', terms: null }]);
  });
});

describe('SimcAplService.print', () => {
  const printed = (text: string): string => {
    const node = apl.parse(text);
    return node ? apl.print(node) : '';
  };

  it('prints a term back in SimC text, bracketed only where precedence needs it', () => {
    expect(printed('combo_points>=cp_max_spend-!buff.darkest_night.up')).toBe('combo_points>=cp_max_spend-!buff.darkest_night.up');
    expect(printed('(a|b)&c')).toBe('(a|b)&c');
    expect(printed('a-(b-c)')).toBe('a-(b-c)');
    expect(printed('(a-b)-c')).toBe('a-b-c');
    expect(printed('!(a&b)')).toBe('!(a&b)');
  });

  it('reads a term back to the tree it was printed from', () => {
    const node = apl.parse('cooldown.x.remains<gcd.max*2|!(buff.y.up&z>=3-talent.w)');
    expect(node && apl.parse(apl.print(node))).toEqual(node);
  });
});
