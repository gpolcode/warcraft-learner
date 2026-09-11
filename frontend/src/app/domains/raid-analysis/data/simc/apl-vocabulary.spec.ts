import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AplVocabularyService } from './apl-vocabulary-service';
import { EXPRESSION_SHAPES } from './apl-vocabulary';
import { SimcAplService } from './simc-apl-service';
import { SimcExpressionService } from './simc-expression-service';
import { AplLiteralService } from '../rulebook-build/apl-literal-service';

const vocabulary = TestBed.inject(AplVocabularyService);
const apl = TestBed.inject(SimcAplService);
const expressions = TestBed.inject(SimcExpressionService);
const literals = TestBed.inject(AplLiteralService);

const CURRENT_TIER = 'midnight_season_2';
const NAME = 'x';

/** A subtree key is its own sample path; any other shape stands in a spell name for every `*`. */
const sample = (shape: string): string => shape.split('.').map(segment => (segment === '*' ? NAME : segment)).join('.');

function gateOf(expression: string) {
  const [action] = apl.resolve(apl.parseLines(`actions=${NAME},if=${expression}`), CURRENT_TIER).actions;
  return action?.own ?? null;
}

function familyOf(expression: string): string {
  const gate = gateOf(expression);
  if (!gate) throw new Error(`${expression} resolved to nothing`);
  const [fact] = literals.facts([{ atom: gate, negated: false, provenance: 'own' }]);
  return fact?.atom.family ?? 'none';
}

const bySupport = (support: string): string[] =>
  Object.entries(EXPRESSION_SHAPES).filter(([, entry]) => entry.support === support).map(([shape]) => shape);

describe('AplVocabularyService.shape', () => {
  it('stands a name slot and a number in for the spell, the list and the position', () => {
    expect(vocabulary.shape(['buff', 'rupture', 'up'])).toBe('buff.*.up');
    expect(vocabulary.shape(['prev_gcd', '1', 'scorch'])).toBe('prev_gcd.*.*');
    expect(vocabulary.shape(['trinket', '1', 'is', 'algethar_puzzle_box'])).toBe('trinket.*.is.algethar_puzzle_box');
  });

  it('keeps a field name that is not a name slot', () => {
    expect(vocabulary.shape(['stealthed', 'all'])).toBe('stealthed.all');
    expect(vocabulary.shape(['energy', 'deficit'])).toBe('energy.deficit');
  });
});

describe('AplVocabularyService.expression', () => {
  it('finds an exact shape', () => {
    expect(vocabulary.expression(['cooldown', 'vanish', 'remains'])?.support).toBe('rule');
  });

  it('lets a subtree entry cover every path under it', () => {
    expect(vocabulary.expression(['trinket', '1', 'is', 'algethar_puzzle_box'])?.note).toMatch(/gear/);
    expect(vocabulary.expression(['raid_event', 'adds', 'in'])?.support).toBe('erased');
  });

  it('does not let a plain entry cover a field it does not name', () => {
    expect(vocabulary.expression(['buff', 'rupture', 'brand_new_field'])).toBeNull();
  });
});

describe('the vocabulary inventory against the resolver and the reader', () => {
  it('reads every rule shape into a fact family a rule kind can name', () => {
    const unreadable = bySupport('rule').filter(shape => ['other', 'none'].includes(familyOf(sample(shape))));
    expect(unreadable).toEqual([]);
  });

  it('reads every read shape into a fact family, even though no kind consumes it', () => {
    const unreadable = bySupport('read').filter(shape => ['other', 'none'].includes(familyOf(sample(shape))));
    expect(unreadable).toEqual([]);
  });

  it('erases every erased shape as if it were not written', () => {
    const kept = bySupport('erased').filter(shape => gateOf(sample(shape)) !== null);
    expect(kept).toEqual([]);
  });

  it('keeps every opaque shape as a literal no reader names', () => {
    const readable = bySupport('opaque').filter(shape => familyOf(sample(shape)) !== 'other');
    expect(readable).toEqual([]);
  });
});

describe('SimcAplService.resolve unknown tokens', () => {
  it('reports a shape outside the inventory once, with how often it appears, and keeps it as a literal', () => {
    const result = apl.resolve(apl.parseLines(`actions=${NAME},if=buff.a.new_field&buff.b.new_field`), CURRENT_TIER);
    expect(result.unknownTokens).toEqual([{ kind: 'expression', token: 'buff.*.new_field', count: 2 }]);
    expect(result.actions[0]?.own ? expressions.print(result.actions[0].own) : null).toBe('buff.a.new_field&buff.b.new_field');
  });

  it('reports an option and a variable op outside the inventory', () => {
    const profile = [
      `actions=variable,name=n,op=average,value=1`,
      `actions+=/${NAME},strange_option=1,if=buff.a.up`,
    ].join('\n');
    expect(apl.resolve(apl.parseLines(profile), CURRENT_TIER).unknownTokens).toEqual([
      { kind: 'option', token: 'strange_option', count: 1 },
      { kind: 'variable_op', token: 'average', count: 1 },
    ]);
  });

  it('reports an expression the parser rejects as a syntax token and drops the gate', () => {
    const result = apl.resolve(apl.parseLines(`actions=${NAME},if=buff.a.remains~=1`), CURRENT_TIER);
    expect(result.unknownTokens).toEqual([{ kind: 'syntax', token: 'buff.a.remains~=1', count: 1 }]);
    expect(result.actions[0]?.own).toBeNull();
  });

  it('reports nothing for a profile written in the inventory alone', () => {
    const profile = [
      `actions=variable,name=n,op=reset,default=0`,
      `actions+=/${NAME},if=buff.a.up&cooldown.b.remains>10&fight_remains<30&energy.deficit>20,target_if=min:dot.c.remains,line_cd=5`,
    ].join('\n');
    expect(apl.resolve(apl.parseLines(profile), CURRENT_TIER).unknownTokens).toEqual([]);
  });

  it('names the heads the gates touched, counting a bare dot field as a dot', () => {
    const profile = `actions=${NAME},if=refreshable&buff.a.up&fight_remains>10`;
    expect(apl.resolve(apl.parseLines(profile), CURRENT_TIER).referencedHeads).toEqual(['buff', 'dot', 'fight_remains']);
  });
});
