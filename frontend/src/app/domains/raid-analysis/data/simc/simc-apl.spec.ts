import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SimcAplService } from './simc-apl-service';
import { SimcExpressionService } from './simc-expression-service';
import type { ResolvedAction } from './simc.models';

const apl = TestBed.inject(SimcAplService);
const expressions = TestBed.inject(SimcExpressionService);

const CURRENT_TIER = 'midnight_season_2';
/** Longer than any cap a reader might guess at: a chain inlines whole. */
const LONG_CHAIN = 12;

const APL_TEXT = [
  'rogue="MID2_Rogue_Subtlety"',
  'actions.precombat=apply_poison',
  'actions.precombat+=/snapshot_stats',
  'actions.precombat+=/stealth',
  'actions=variable,name=stealth,value=buff.shadow_dance.up|buff.vanish.up',
  'actions+=/variable,name=targets,value=spell_targets.shuriken_storm',
  'actions+=/call_action_list,name=cds',
  'actions+=/run_action_list,name=finish,if=combo_points>=cp_max_spend',
  'actions+=/backstab,if=variable.targets<2&!variable.stealth&fight_remains>10',
  'actions.cds=shadow_blades,if=variable.stealth&set_bonus.midnight_season_2_2pc',
  'actions.cds+=/vanish,if=!variable.stealth&set_bonus.midnight_season_1_4pc',
  'actions.finish=eviscerate,if=buff.darkest_night.up|!buff.slice_and_dice.up',
  'actions.finish+=/rupture,if=refreshable&remains<4',
].join('\n');

function resolved(): ResolvedAction[] {
  return apl.resolve(apl.parse(APL_TEXT), CURRENT_TIER).actions;
}

function line(action: string): ResolvedAction {
  const match = resolved().find(entry => entry.action === action);
  if (!match) throw new Error(`${action} did not resolve`);
  return match;
}

const printed = (action: ResolvedAction): string | null => (action.own ? expressions.print(action.own) : null);

describe('SimcAplService.parse', () => {
  it('reads the list name, the action and every option of an action line', () => {
    const { lines } = apl.parse(APL_TEXT);
    const shadowBlades = lines.find(entry => entry.action === 'shadow_blades');
    expect(shadowBlades?.list).toBe('cds');
    expect(shadowBlades?.options).toEqual({ if: 'variable.stealth&set_bonus.midnight_season_2_2pc' });
  });

  it('ignores lines that are not action lines', () => {
    expect(apl.parse(APL_TEXT).lines.every(entry => entry.action !== 'rogue')).toBe(true);
  });

  it('reads a list whose name carries capitals, as SimulationCraft does', () => {
    const { lines } = apl.parse('actions.HC_st=malefic_rapture\nactions.HC_st+=/agony');
    expect(lines.map(entry => entry.list)).toEqual(['HC_st', 'HC_st']);
  });

  it('keeps an actions line it cannot split whole, for the resolve to report', () => {
    const source = apl.parse('actions.cds-if=buff.x.up\nactions+=/backstab');
    expect(source.unparsed).toEqual(['actions.cds-if=buff.x.up']);
    expect(source.lines.map(entry => entry.action)).toEqual(['backstab']);
  });
});

describe('SimcAplService.resolve', () => {
  it('flattens called lists into one priority order without the variable lines', () => {
    expect(resolved().map(entry => entry.action)).toEqual(['shadow_blades', 'eviscerate', 'rupture', 'backstab']);
  });

  it('inlines a variable and erases a fight-length escape hatch', () => {
    expect(printed(line('backstab'))).toBe('spell_targets.shuriken_storm<2&!(buff.shadow_dance.up|buff.vanish.up)');
  });

  it('counts the current tier set bonus as worn and every other as absent', () => {
    expect(printed(line('shadow_blades'))).toBe('buff.shadow_dance.up|buff.vanish.up');
    expect(resolved().some(entry => entry.action === 'vanish')).toBe(false);
  });

  it('gives a run_action_list line its gate as context and the lines after it the negated gate', () => {
    expect(line('eviscerate').context.map(gate => expressions.print(gate))).toEqual(['combo_points>=cp_max_spend']);
    expect(line('backstab').context.map(gate => expressions.print(gate))).toEqual(['!(combo_points>=cp_max_spend)']);
  });

  it('reads a bare refreshable or remains as the action\'s own dot', () => {
    expect(printed(line('rupture'))).toBe('dot.rupture.refreshable&dot.rupture.remains<4');
  });

  it('treats a running-op variable as unknown without reporting it, since the inventory lists the op', () => {
    const text = 'actions=variable,name=count,op=add,value=1\nactions+=/backstab,if=variable.count>2&buff.x.up';
    const result = apl.resolve(apl.parse(text), CURRENT_TIER);
    expect(result.gaps).toEqual([]);
    expect(result.actions.map(printed)).toEqual(['buff.x.up']);
  });

  it('reports a variable no line defines and treats it as unknown', () => {
    const result = apl.resolve(apl.parse('actions=backstab,if=variable.missing&buff.x.up'), CURRENT_TIER);
    expect(result.gaps).toEqual([{ kind: 'variable', token: 'missing' }]);
    expect(result.actions.map(printed)).toEqual(['buff.x.up']);
  });

  it('reports an unparsed line and a call to a list with no lines, and walks the rest', () => {
    const text = [
      'actions.cds-if=buff.x.up',
      'actions=call_action_list,name=cds',
      'actions+=/backstab',
    ].join('\n');
    const result = apl.resolve(apl.parse(text), CURRENT_TIER);
    expect(result.gaps).toEqual([{ kind: 'line', token: 'actions.cds-if=buff.x.up' }, { kind: 'list', token: 'cds' }]);
    expect(result.actions.map(entry => entry.action)).toEqual(['backstab']);
  });

  it('reports lines that never write the default list', () => {
    expect(apl.resolve(apl.parse('actions.precombat=stealth'), CURRENT_TIER).gaps).toEqual([{ kind: 'list', token: 'default' }]);
  });

  it('reports a shape outside the inventory once and keeps it as a literal', () => {
    const result = apl.resolve(apl.parse('actions=backstab,if=buff.a.new_field&buff.b.new_field'), CURRENT_TIER);
    expect(result.gaps).toEqual([{ kind: 'expression', token: 'buff.*.new_field' }]);
    expect(result.actions.map(printed)).toEqual(['buff.a.new_field&buff.b.new_field']);
  });

  it('reports an option and a variable op outside the inventory', () => {
    const text = [
      'actions=variable,name=n,op=average,value=1',
      'actions+=/backstab,strange_option=1,if=buff.a.up',
    ].join('\n');
    expect(apl.resolve(apl.parse(text), CURRENT_TIER).gaps).toEqual([
      { kind: 'option', token: 'strange_option' },
      { kind: 'variable_op', token: 'average' },
    ]);
  });

  it('reports an expression the parser rejects as a syntax gap and drops the gate', () => {
    const result = apl.resolve(apl.parse('actions=backstab,if=buff.a.remains~=1'), CURRENT_TIER);
    expect(result.gaps).toEqual([{ kind: 'syntax', token: 'buff.a.remains~=1' }]);
    expect(result.actions[0]?.own).toBeNull();
  });

  it('reports nothing for lines written in the inventory alone', () => {
    const text = [
      'actions=variable,name=n,op=reset,default=0',
      'actions+=/backstab,if=buff.a.up&cooldown.b.remains>10&fight_remains<30&energy.deficit>20,target_if=min:dot.c.remains,line_cd=5',
    ].join('\n');
    expect(apl.resolve(apl.parse(text), CURRENT_TIER).gaps).toEqual([]);
  });

  it('names the heads the gates touched, counting a bare dot field as a dot', () => {
    const text = 'actions=backstab,if=refreshable&buff.a.up&fight_remains>10';
    expect(apl.resolve(apl.parse(text), CURRENT_TIER).referencedHeads).toEqual(['buff', 'dot', 'fight_remains']);
  });

  it('walks two lists that call each other once each, without reporting a gap', () => {
    const text = [
      'actions=call_action_list,name=a',
      'actions.a=backstab',
      'actions.a+=/call_action_list,name=b',
      'actions.b=eviscerate',
      'actions.b+=/call_action_list,name=a',
    ].join('\n');
    const result = apl.resolve(apl.parse(text), CURRENT_TIER);
    expect(result.gaps).toEqual([]);
    expect(result.actions.map(entry => entry.action)).toEqual(['backstab', 'eviscerate']);
  });

  it('inlines a chain of variables whole, however long', () => {
    const chain = [
      ...Array.from({ length: LONG_CHAIN }, (_, index) => `actions${index ? '+=/' : '='}variable,name=v${index},value=${index + 1 < LONG_CHAIN ? `variable.v${index + 1}` : 'buff.x.up'}`),
      'actions+=/backstab,if=variable.v0',
    ].join('\n');
    const result = apl.resolve(apl.parse(chain), CURRENT_TIER);
    expect(result.gaps).toEqual([]);
    expect(result.actions.map(printed)).toEqual(['buff.x.up']);
  });

  it('reads a variable that refers to its own earlier value as unknown, without reporting it', () => {
    const text = [
      'actions=variable,name=hold,op=set,value=buff.a.up',
      'actions+=/variable,name=hold,op=set,value=buff.b.up,if=variable.hold&buff.c.up',
      'actions+=/backstab,if=variable.hold&buff.x.up',
    ].join('\n');
    const result = apl.resolve(apl.parse(text), CURRENT_TIER);
    expect(result.gaps).toEqual([]);
    expect(result.actions.map(printed)).toEqual(['(buff.c.up&buff.b.up|!buff.c.up&buff.a.up)&buff.x.up']);
  });

  it('reads a cycling variable as defined and unknown', () => {
    const text = 'actions=cycling_variable,name=ttd,op=max,value=target.time_to_die\nactions+=/backstab,if=variable.ttd>10&buff.x.up';
    const result = apl.resolve(apl.parse(text), CURRENT_TIER);
    expect(result.gaps).toEqual([]);
    expect(result.actions.map(printed)).toEqual(['buff.x.up']);
  });

  it('chains conditional sets of a flag variable into the gate that makes it true', () => {
    const text = [
      'actions=variable,name=cds,op=set,value=1,if=buff.a.up',
      'actions+=/variable,name=cds,op=set,value=0,if=buff.b.up',
      'actions+=/backstab,if=variable.cds',
    ].join('\n');
    const result = apl.resolve(apl.parse(text), CURRENT_TIER);
    expect(result.actions.map(printed)).toEqual(['!buff.b.up&buff.a.up']);
  });
});
