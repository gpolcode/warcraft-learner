import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { ConditionChecklist } from './condition-checklist';
import type { ConditionCheck, FindingOccurrence } from '../data/analysis/analysis.models';

const met = (text: string): ConditionCheck => ({ text, truth: 'true', value: '' });
const oneOf = (...checks: ConditionCheck[]): ConditionCheck => ({ text: 'One of', truth: 'true', value: '', group: { any: true, checks } });
const rightPress = (checks: ConditionCheck[]): FindingOccurrence => ({
  atS: 10, ok: true, rule: 'Eviscerate is only right when these conditions hold.', result: 'Right time', detail: 'they did.', checks,
});
const nodesOf = (checks: ConditionCheck[]) => mountVm(ConditionChecklist, { occurrence: rightPress(checks) }).vm['nodes']();

describe('ConditionChecklist', () => {
  it('carries a level\'s connector through the rows nested under a row with siblings below it', () => {
    const [group] = nodesOf([oneOf(met('Stealth is up'), met('Vanish is up')), met('At 5+ combo points')]);
    expect(group?.children.map(node => node.continuing)).toEqual([[true], [true]]);
  });

  it('ends a level\'s connector at its last row, so the rows nested under it carry none of it', () => {
    const nodes = nodesOf([met('At 5+ combo points'), oneOf(met('Stealth is up'), met('Vanish is up'))]);
    expect(nodes.map(node => node.last)).toEqual([false, true]);
    expect(nodes[1]?.children.map(node => node.continuing)).toEqual([[false], [false]]);
  });
});
