import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SimcAplService } from './simc-apl-service';
import { SimcExpressionService } from './simc-expression-service';
import type { ResolvedAction } from './simc.models';

const apl = TestBed.inject(SimcAplService);
const expressions = TestBed.inject(SimcExpressionService);

const CURRENT_TIER = 'midnight_season_2';
/** A variable referencing a variable inlines this many levels down before the resolver gives up. */
const INLINE_DEPTH_CAP = 6;

const PROFILE = [
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
  return apl.resolve(apl.parseLines(PROFILE), CURRENT_TIER).actions;
}

function line(action: string): ResolvedAction {
  const match = resolved().find(entry => entry.action === action);
  if (!match) throw new Error(`${action} did not resolve`);
  return match;
}

const printed = (action: ResolvedAction): string | null => (action.own ? expressions.print(action.own) : null);

describe('SimcAplService.parseLines', () => {
  it('reads the list name, the action and every option of an action line', () => {
    const lines = apl.parseLines(PROFILE);
    const shadowBlades = lines.find(entry => entry.action === 'shadow_blades');
    expect(shadowBlades?.list).toBe('cds');
    expect(shadowBlades?.options).toEqual({ if: 'variable.stealth&set_bonus.midnight_season_2_2pc' });
  });

  it('ignores lines that are not action lines', () => {
    expect(apl.parseLines(PROFILE).every(entry => entry.action !== 'rogue')).toBe(true);
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

  it('reports a variable it cannot inline and treats it as unknown', () => {
    const profile = 'actions=variable,name=count,op=add,value=1\nactions+=/backstab,if=variable.count>2&buff.x.up';
    const result = apl.resolve(apl.parseLines(profile), CURRENT_TIER);
    expect(result.unresolvedVariables).toEqual(['count']);
    expect(result.actions.map(printed)).toEqual(['buff.x.up']);
  });

  it('inlines a chain of variables to the depth cap and reports the one past it', () => {
    const chain = (length: number): string => [
      ...Array.from({ length }, (_, index) => `actions${index ? '+=/' : '='}variable,name=v${index},value=${index + 1 < length ? `variable.v${index + 1}` : 'buff.x.up'}`),
      'actions+=/backstab,if=variable.v0',
    ].join('\n');
    const atCap = apl.resolve(apl.parseLines(chain(INLINE_DEPTH_CAP + 1)), CURRENT_TIER);
    const pastCap = apl.resolve(apl.parseLines(chain(INLINE_DEPTH_CAP + 2)), CURRENT_TIER);
    expect(atCap.unresolvedVariables).toEqual([]);
    expect(atCap.actions.map(printed)).toEqual(['buff.x.up']);
    expect(pastCap.unresolvedVariables).toEqual([`v${INLINE_DEPTH_CAP + 1}`]);
  });

  it('chains conditional sets of a flag variable into the gate that makes it true', () => {
    const profile = [
      'actions=variable,name=cds,op=set,value=1,if=buff.a.up',
      'actions+=/variable,name=cds,op=set,value=0,if=buff.b.up',
      'actions+=/backstab,if=variable.cds',
    ].join('\n');
    const result = apl.resolve(apl.parseLines(profile), CURRENT_TIER);
    expect(result.actions.map(printed)).toEqual(['!buff.b.up&buff.a.up']);
  });
});
