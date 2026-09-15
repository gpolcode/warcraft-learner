import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SimcExpressionService, UNKNOWN, type AplResolver } from './simc-expression-service';
import type { AplExpr } from './simc.models';

const expressions = TestBed.inject(SimcExpressionService);

/** Six two-way pairs cross into 64 terms, the cap. */
const TERM_CAP_PAIRS = 6;

const keepEverything: AplResolver = () => null;
const eraseTime: AplResolver = path => (path[0] === 'fight_remains' ? UNKNOWN : null);
const roundTrip = (source: string): string => expressions.print(expressions.parse(source));
const simplified = (source: string, resolve: AplResolver = keepEverything): string =>
  expressions.print(expressions.simplify(expressions.parse(source), resolve));
const literals = (source: string): string[][] =>
  (expressions.dnf(expressions.parse(source), 'own') ?? []).map(term =>
    term.map(literal => `${literal.negated ? '!' : ''}${expressions.print(literal.atom)}`));

describe('SimcExpressionService.parse', () => {
  it('binds & tighter than | and comparisons tighter than both', () => {
    expect(roundTrip('a|b&c>=1')).toBe('a|b&c>=1');
    expect(roundTrip('(a|b)&c')).toBe('(a|b)&c');
  });

  it('binds arithmetic tighter than the min operator and the min operator tighter than a comparison', () => {
    expect(roundTrip('cooldown.x.remains<?buff.y.remains+2<5')).toBe('cooldown.x.remains<?buff.y.remains+2<5');
    expect(roundTrip('(a<?b)+2')).toBe('(a<?b)+2');
  });

  it('reads a dotted reference with a numeric segment as one name', () => {
    const expr = expressions.parse('trinket.1.has_use_buff');
    expect(expr).toEqual({ kind: 'ref', path: ['trinket', '1', 'has_use_buff'] });
  });

  it('reads prefix negation, the modulo operator and a floor call', () => {
    expect(roundTrip('!buff.x.up&floor(energy%%10)=0')).toBe('!buff.x.up&floor(energy%%10)=0');
  });

  it('rejects an unbalanced parenthesis', () => {
    expect(() => expressions.parse('(a&b')).toThrow(/unexpected end/);
  });
});

describe('SimcExpressionService.simplify', () => {
  it('folds constants and drops a true conjunct', () => {
    expect(simplified('1+2>=3&buff.x.up')).toBe('buff.x.up');
  });

  it('short-circuits a false conjunct and a true disjunct to a constant', () => {
    expect(simplified('1>2&buff.x.up')).toBe('0');
    expect(simplified('2>1|buff.x.up')).toBe('1');
  });

  it('erases an unknown leaf as the identity of & and of |', () => {
    expect(simplified('buff.x.up&fight_remains<20', eraseTime)).toBe('buff.x.up');
    expect(simplified('buff.x.up|fight_remains<20', eraseTime)).toBe('buff.x.up');
  });

  it('keeps a comparison whose right side is symbolic', () => {
    expect(simplified('combo_points>=cp_max_spend-1')).toBe('combo_points>=cp_max_spend-1');
  });

  it('turns a comparison against an unknown into unknown, not into false', () => {
    expect(simplified('buff.x.up&energy>fight_remains', eraseTime)).toBe('buff.x.up');
  });

  it('inlines a replacement expression and simplifies through it', () => {
    const inlineTargets: AplResolver = path => (path[0] === 'variable' ? { kind: 'num', value: 3 } : null);
    expect(simplified('variable.targets>=2&buff.x.up', inlineTargets)).toBe('buff.x.up');
  });
});

describe('SimcExpressionService.dnf', () => {
  it('splits a disjunction into terms and a conjunction into literals', () => {
    expect(literals('buff.a.up&combo_points>=5|!buff.b.up')).toEqual([['buff.a.up', 'combo_points>=5'], ['!buff.b.up']]);
  });

  it('pushes a negation through a conjunction and flips a comparison', () => {
    expect(literals('!(buff.a.up&energy>=50)')).toEqual([['!buff.a.up'], ['energy<50']]);
  });

  it('gives a constant-true gate one empty term and a constant-false gate none', () => {
    expect(expressions.dnf({ kind: 'num', value: 1 }, 'own')).toEqual([[]]);
    expect(expressions.dnf({ kind: 'num', value: 0 }, 'own')).toEqual([]);
  });

  it('expands a gate at the term cap and gives up one pair past it', () => {
    const pairs = (count: number): string => Array.from({ length: count }, (_, index) => `(buff.a${index}.up|buff.b${index}.up)`).join('&');
    expect(expressions.dnf(expressions.parse(pairs(TERM_CAP_PAIRS)), 'own')).toHaveLength(2 ** TERM_CAP_PAIRS);
    expect(expressions.dnf(expressions.parse(pairs(TERM_CAP_PAIRS + 1)), 'own')).toBeNull();
  });
});

describe('SimcExpressionService.termsOf', () => {
  it('crosses the own gate with every inherited gate and tags each literal with its origin', () => {
    const own: AplExpr = expressions.parse('buff.a.up');
    const context: AplExpr = expressions.parse('combo_points>=5|buff.b.up');
    const terms = expressions.termsOf(own, [context]) ?? [];
    expect(terms.map(term => term.map(literal => `${literal.provenance}:${expressions.print(literal.atom)}`))).toEqual([
      ['own:buff.a.up', 'context:combo_points>=5'],
      ['own:buff.a.up', 'context:buff.b.up'],
    ]);
  });

  it('gives an unconditional line one empty term', () => {
    expect(expressions.termsOf(null, [])).toEqual([[]]);
  });
});
