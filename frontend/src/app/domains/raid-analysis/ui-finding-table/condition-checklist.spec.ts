import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { ConditionChecklist } from './condition-checklist';
import type { ConditionCheck, FindingOccurrence } from '../data/analysis/analysis.models';

const met = (text: string): ConditionCheck => ({ text, truth: 'true', value: '' });
const oneOf = (...checks: ConditionCheck[]): ConditionCheck => ({ text: 'One of', truth: 'true', value: '', group: { any: true, checks } });
const rightPress = (checks: ConditionCheck[]): FindingOccurrence => ({
  atS: 10, ok: true, rule: 'Eviscerate is only right when these conditions hold.', result: 'Right time', detail: 'they did.', checks,
});
const checklistOf = (checks: ConditionCheck[]) => mountVm(ConditionChecklist, { occurrence: rightPress(checks) }).vm;

describe('ConditionChecklist', () => {
  it('heads the tree with the press verdict as one all-of term over every condition', () => {
    const checks = [met('At 5+ combo points'), met('Shadow Dance is up')];
    const tree = checklistOf(checks)['tree']();
    expect(tree.text).toBe('Right time');
    expect(tree.group).toEqual({ any: false, checks });
  });

  it('nests an either-or term\'s operands under its own row', () => {
    const operands = [met('Stealth is up'), met('Vanish is up')];
    const checklist = checklistOf([oneOf(...operands)]);
    expect(checklist['operands'](oneOf(...operands))).toEqual(operands);
  });

  it('leaves a plain condition with no rows under it', () => {
    const checklist = checklistOf([met('At 5+ combo points')]);
    expect(checklist['operands'](met('At 5+ combo points'))).toEqual([]);
  });
});
