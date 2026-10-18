import { describe, it, expect } from 'vitest';
import { AnalysisFinding } from '../analysis/analysis.models';
import { FindingFamily } from './finding-family.models';
import { FINDING_REGISTRY } from './finding-registry';
import { VERDICT_CHOICES } from './verdict-choices';

/** One scenario per family that runs its producer on a pull with the family's mistake in it; it witnesses that some producer emits the family. */
const PRODUCING_SCENARIOS: Record<string, () => Promise<AnalysisFinding[]>> = {};

const blank = (text: string): boolean => text.trim() === '';

const CONFORMANCE: readonly { problem: string; fails: (family: FindingFamily) => boolean }[] = [
  { problem: 'version below 1', fails: family => !Number.isInteger(family.version) || family.version < 1 },
  {
    problem: 'blank text field',
    fails: family => [family.id, family.claim, family.construct, family.alignment, family.uncertaintyShown, family.copy.message,
      family.reference.population].some(blank),
  },
  { problem: 'reference under the minimum n', fails: family => family.reference.minN < VERDICT_CHOICES.minReferenceN },
  { problem: 'no availability mask', fails: family => !family.availability.length },
  { problem: 'no limits', fails: family => !family.limits.length },
  { problem: 'red tier below the high cost class', fails: family => family.tier === 'red' && family.costClass !== 'high' },
  { problem: 'graded tier with no injected mistake', fails: family => ['red', 'amber'].includes(family.tier) && !family.injectedMistakes.length },
];

const problemsOf = (family: FindingFamily): string[] =>
  CONFORMANCE.filter(check => check.fails(family)).map(check => check.problem);

const family = (over: Partial<FindingFamily> = {}): FindingFamily => ({
  id: 'lost_cooldown', version: 1, tier: 'red',
  claim: 'You pressed a major cooldown fewer times than top raiders do over the same alive time.',
  construct: 'Casts of one cooldown over alive, pre-wipe time.',
  reference: { population: 'Top Mythic kills for the spec and boss', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Alive time',
  availability: ['talent taken'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing'] },
  rule: 'count', costClass: 'high',
  uncertaintyShown: 'Expected uses from 10 top logs',
  copy: { message: 'You pressed {cd} {uses} times. Top raiders press it {expected} times.', remedy: null },
  injectedMistakes: ['drop-major-cooldown-cast'],
  limits: ['Why a cooldown was held'],
  ...over,
});

describe('FINDING_REGISTRY', () => {
  it('gives every family a unique id', () => {
    const ids = FINDING_REGISTRY.map(entry => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('fills every field of every family', () => {
    const incomplete = FINDING_REGISTRY.filter(entry => problemsOf(entry).length);

    expect(incomplete.map(entry => entry.id)).toEqual([]);
  });

  it('has a producer emitting every family', async () => {
    const unused: string[] = [];
    for (const entry of FINDING_REGISTRY) {
      const findings = await PRODUCING_SCENARIOS[entry.id]?.() ?? [];
      if (!findings.some(finding => finding.family === entry.id)) unused.push(entry.id);
    }

    expect(unused).toEqual([]);
  });

  it('keeps no producing scenario for a family outside the registry', () => {
    const ids = new Set(FINDING_REGISTRY.map(entry => entry.id));

    expect(Object.keys(PRODUCING_SCENARIOS).filter(id => !ids.has(id))).toEqual([]);
  });
});

describe('the registry conformance check', () => {
  it('passes a complete family', () => {
    expect(problemsOf(family())).toEqual([]);
  });

  it('fails a family at version 0', () => {
    expect(problemsOf(family({ version: 0 }))).toEqual(['version below 1']);
  });

  it('fails a family with a blank claim', () => {
    expect(problemsOf(family({ claim: ' ' }))).toEqual(['blank text field']);
  });

  it('fails a reference one log under the minimum', () => {
    expect(problemsOf(family({ reference: { population: 'Top Mythic kills', minN: VERDICT_CHOICES.minReferenceN - 1 } })))
      .toEqual(['reference under the minimum n']);
  });

  it('fails a family with no availability mask or no limits', () => {
    expect(problemsOf(family({ availability: [], limits: [] }))).toEqual(['no availability mask', 'no limits']);
  });

  it('fails a red family on a medium cost class', () => {
    expect(problemsOf(family({ costClass: 'medium' }))).toEqual(['red tier below the high cost class']);
  });

  it('passes an amber family on a medium cost class', () => {
    expect(problemsOf(family({ tier: 'amber', costClass: 'medium' }))).toEqual([]);
  });

  it('fails a graded family with no injected mistake', () => {
    expect(problemsOf(family({ tier: 'amber', injectedMistakes: [] }))).toEqual(['graded tier with no injected mistake']);
  });

  it('passes a blue family with no injected mistake', () => {
    expect(problemsOf(family({ tier: 'blue', injectedMistakes: [] }))).toEqual([]);
  });
});
