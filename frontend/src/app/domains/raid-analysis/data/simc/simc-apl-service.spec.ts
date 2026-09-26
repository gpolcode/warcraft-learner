import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { PlanLine } from '../plan/plan.models';
import { SimcAplService } from './simc-apl-service';

const apl = TestBed.inject(SimcAplService);

const lines = (...entries: string[]): PlanLine[] => apl.readApl(entries.join('\n')).lines;

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

  it('gates a line on a target_if that skips it when no target satisfies it, but not on one that only ranks targets', () => {
    const [gated, ranked] = lines(
      'actions=rake,target_if=refreshable,if=combo_points<5',
      'actions+=/rip,target_if=max:target.time_to_die,if=combo_points>=5',
    );
    expect(gated).toEqual({ action: 'rake', terms: ['combo_points<5', 'refreshable'] });
    expect(ranked).toEqual({ action: 'rip', terms: ['combo_points>=5'] });
  });

  it('reads a first: target_if as the same gate', () => {
    expect(lines('actions=reapers_mark,target_if=first:debuff.reapers_mark.down')).toEqual([{ action: 'reapers_mark', terms: ['debuff.reapers_mark.down'] }]);
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

  it('inlines a variable read inside a function call', () => {
    const [line] = lines('actions=variable,name=casts,value=floor(fight_remains%variable.cd)', 'actions+=/variable,name=cd,value=90', 'actions+=/rampage,if=variable.casts>1');
    expect(line?.terms).toEqual(['floor(fight_remains%90)>1']);
  });

  it('leaves a variable assigned more than once as sim state', () => {
    const [line] = lines(
      'actions=variable,name=pool,value=1,if=energy<50',
      'actions+=/variable,name=pool,value=0,if=energy>=50',
      'actions+=/rampage,if=variable.pool',
    );
    expect(line?.terms).toEqual(['variable.pool']);
  });

  it('stands an expression in for a name SimC computes, its & terms joining the line\'s own', () => {
    const [line] = apl.readApl('actions=rampage,if=scorch_execute.active&rage>=80', new Map([['scorch_execute.active', 'talent.scorch&target.health.pct<=30']])).lines;
    expect(line?.terms).toEqual(['talent.scorch', 'target.health.pct<=30', 'rage>=80']);
  });

  it('skips actions that press no spell of the spec', () => {
    expect(lines('actions=auto_attack', 'actions+=/potion', 'actions+=/use_item,name=trinket').map(line => line.action)).toEqual([]);
  });

  it('keeps a line under a condition jsep cannot read, with no terms to read', () => {
    expect(lines('actions=rampage,if=rage>=(80')).toEqual([{ action: 'rampage', terms: null }]);
  });
});

describe('SimcAplService.readApl variables', () => {
  const variables = (...entries: string[]) => apl.readApl(entries.join('\n')).variables;

  it('keeps a variable set more than once for replay, each action in list order under its own and its list\'s condition', () => {
    expect(variables(
      'actions=call_action_list,name=cds,if=active_enemies>=2',
      'actions.cds=variable,name=pool,op=setif,value=1,value_else=0,condition=rage<50,if=buff.enrage.up',
      'actions+=/variable,name=pool,op=reset',
      'actions+=/rampage,if=variable.pool',
    )).toEqual([
      { name: 'pool', op: 'setif', value: '1', value_else: '0', condition: 'rage<50', terms: ['active_enemies>=2', 'buff.enrage.up'] },
      { name: 'pool', op: 'reset', terms: [] },
    ]);
  });

  it('marks a variable set before the pull', () => {
    expect(variables('actions.precombat=variable,name=pool,value=1', 'actions=variable,name=pool,value=0,if=rage>50', 'actions+=/rampage,if=variable.pool')[0])
      .toMatchObject({ name: 'pool', value: '1', precombat: true });
  });

  it('keeps a variable a kept variable reads, and none that no line reaches', () => {
    expect(variables(
      'actions=variable,name=base,value=1,if=rage>50', 'actions+=/variable,name=base,value=0',
      'actions+=/variable,name=pool,value=variable.base,if=rage>80', 'actions+=/variable,name=pool,value=0',
      'actions+=/variable,name=unread,value=1,if=rage>80', 'actions+=/variable,name=unread,value=0',
      'actions+=/rampage,if=variable.pool',
    ).map(variable => variable.name)).toEqual(['base', 'base', 'pool', 'pool']);
  });

  it('replays a cycling variable as one read on the cast\'s own target', () => {
    expect(variables('actions=cycling_variable,name=ttd,op=reset', 'actions+=/cycling_variable,name=ttd,op=max,value=target.time_to_die', 'actions+=/rampage,if=variable.ttd>10'))
      .toEqual([{ name: 'ttd', op: 'reset', terms: [] }, { name: 'ttd', op: 'max', value: 'target.time_to_die', terms: [] }]);
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

  it('prints a SimC function call as written', () => {
    expect(printed('floor(fight_remains%cooldown.x.duration-0.05)')).toBe('floor(fight_remains%cooldown.x.duration-0.05)');
  });

  it('reads a term back to the tree it was printed from', () => {
    const node = apl.parse('cooldown.x.remains<gcd.max*2|!(buff.y.up&z>=3-talent.w)');
    expect(node && apl.parse(apl.print(node))).toEqual(node);
  });
});
