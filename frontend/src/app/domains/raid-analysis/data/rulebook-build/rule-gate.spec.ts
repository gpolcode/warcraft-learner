import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SimcExpressionService } from '../simc/simc-expression-service';
import { AplLiteralService, type Fact } from './apl-literal-service';
import { RuleGateService } from './rule-gate-service';
import type { ActionLine } from './rule-derivation.models';
import type { SpellRecord } from '../simc/simc.models';
import type { ResolvedAction } from '../simc/simc.models';

const expressions = TestBed.inject(SimcExpressionService);
const literals = TestBed.inject(AplLiteralService);
const gates = TestBed.inject(RuleGateService);

const DEMOLISH = 'demolish';
const SLAYER = 'slayers_dominance';
const UNSEEN_BLADE = 'unseen_blade';
const FACT = 'aoe';

const record = { id: 1, name: 'Mortal Strike' } as SpellRecord;

/** A line is described by the gate it carries and whether it carries the judged fact. */
function line(gate: string, carries: boolean, priority = 0): ActionLine {
  const terms = (expressions.dnf(expressions.parse(gate), 'own') ?? []).map(term => literals.facts(term));
  const lineFacts = gates.everyTerm(terms);
  if (carries) lineFacts.set(FACT, { atom: { family: 'targets', op: '>', value: 2 }, negated: false, provenance: 'own' });
  return { resolved: { action: 'mortal_strike', priority } as ResolvedAction, record, terms, lineFacts, ...gates.talentGate([...lineFacts.values()]) };
}

const carries = (entry: ActionLine): boolean => entry.lineFacts.has(FACT);
const tokens = (set: Set<string> | undefined): string[] => [...(set ?? [])].sort();

describe('RuleGateService.gateAcrossLines', () => {
  it('gates nothing when every line carries the fact', () => {
    const gate = gates.gateAcrossLines([line(`talent.${DEMOLISH}`, true), line('buff.x.up', true)], carries);
    expect(tokens(gate?.requires)).toEqual([]);
    expect(tokens(gate?.excludes)).toEqual([]);
  });

  it('excludes the talent whose lines drop the fact', () => {
    const gate = gates.gateAcrossLines([line('buff.x.up', true), line(`talent.${UNSEEN_BLADE}`, false)], carries);
    expect(tokens(gate?.requires)).toEqual([]);
    expect(tokens(gate?.excludes)).toEqual([UNSEEN_BLADE]);
  });

  it('requires the talent whose lines alone carry the fact', () => {
    const gate = gates.gateAcrossLines([line(`talent.${DEMOLISH}`, true), line(`!talent.${DEMOLISH}`, false)], carries);
    expect(tokens(gate?.requires)).toEqual([DEMOLISH]);
    expect(tokens(gate?.excludes)).toEqual([]);
  });

  it('yields no rule when each hero tree carries the fact on one list and drops it on another', () => {
    const lines = [
      line(`talent.${DEMOLISH}&active_enemies>2`, true), line(`talent.${DEMOLISH}&active_enemies<=2`, false),
      line(`talent.${SLAYER}&active_enemies>2`, true), line(`talent.${SLAYER}&active_enemies<=2`, false),
    ];
    expect(gates.gateAcrossLines(lines, carries)).toBeNull();
  });

  it('yields no rule when an ungated line drops the fact', () => {
    expect(gates.gateAcrossLines([line(`talent.${DEMOLISH}`, true), line('buff.x.up', false)], carries)).toBeNull();
  });
});

describe('RuleGateService.consistent', () => {
  const term = (source: string): Fact[] => literals.facts((expressions.dnf(expressions.parse(source), 'own') ?? [])[0] ?? []);

  it('rejects a term that needs a state both up and down and keeps one that does not', () => {
    expect(gates.consistent(term('buff.x.up&!buff.x.up'))).toBe(false);
    expect(gates.consistent(term('buff.x.up&!buff.y.up'))).toBe(true);
  });
});

describe('RuleGateService.termGate', () => {
  it('keeps only the talents every term shares', () => {
    const terms = expressions.dnf(expressions.parse(`talent.a&talent.b|talent.a&!talent.c`), 'own') ?? [];
    const gate = gates.termGate(terms.map(term => literals.facts(term)));
    expect(tokens(gate.requires)).toEqual(['a']);
    expect(tokens(gate.excludes)).toEqual([]);
  });
});
