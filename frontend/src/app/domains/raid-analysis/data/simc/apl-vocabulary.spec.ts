import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AplVocabularyService } from './apl-vocabulary-service';
import { EXPRESSION_SHAPES } from './apl-vocabulary';
import { SimcAplService } from './simc-apl-service';
import { AplLiteralService } from '../rulebook-build/apl-literal-service';

const vocabulary = TestBed.inject(AplVocabularyService);
const apl = TestBed.inject(SimcAplService);
const literals = TestBed.inject(AplLiteralService);

const CURRENT_TIER = 'midnight_season_2';
const NAME = 'x';

/** A subtree key is its own sample path; any other shape stands in a spell name for every `*`. */
const sample = (shape: string): string => shape.split('.').map(segment => (segment === '*' ? NAME : segment)).join('.');

function gateOf(expression: string) {
  const [action] = apl.resolve(apl.parse(`actions=${NAME},if=${expression}`), CURRENT_TIER).actions;
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

  it('answers a bare action-relative field with its family\'s row', () => {
    expect(vocabulary.expression(['refreshable'])).toBe(EXPRESSION_SHAPES['dot.*.refreshable']);
    expect(vocabulary.expression(['charges'])).toBe(EXPRESSION_SHAPES['cooldown.*.charges']);
    expect(vocabulary.expression(['ready'])).toBeNull();
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
