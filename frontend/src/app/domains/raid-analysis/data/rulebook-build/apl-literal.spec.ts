import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SimcExpressionService } from '../simc/simc-expression-service';
import { AplLiteralService, type Fact } from './apl-literal-service';

const expressions = TestBed.inject(SimcExpressionService);
const literals = TestBed.inject(AplLiteralService);

const SINGLE_TARGET = 1;
const CLEAVE = 3;

function facts(source: string): Fact[] {
  const terms = expressions.dnf(expressions.parse(source), 'own') ?? [];
  return literals.facts(terms[0] ?? []);
}

function only(source: string): Fact {
  const [fact] = facts(source);
  if (!fact) throw new Error(`${source} yielded no fact`);
  return fact;
}

describe('AplLiteralService.facts', () => {
  it('reads a buff as a self aura that is up and a dot as a target aura', () => {
    expect(only('buff.shadow_dance.up').atom).toEqual({ family: 'aura', scope: 'self', token: 'shadow_dance', field: 'up', op: null, value: null });
    expect(only('dot.rupture.ticking').atom).toMatchObject({ family: 'aura', scope: 'target', token: 'rupture', field: 'up' });
  });

  it('reads down as the negation of up and remains above a number as up', () => {
    expect(only('buff.x.down')).toMatchObject({ negated: true, atom: { field: 'up' } });
    expect(only('buff.x.remains>2')).toMatchObject({ negated: false, atom: { field: 'up' } });
  });

  it('reads remains below a number as the refresh window and a stack count with its bound', () => {
    expect(only('dot.garrote.remains<=4').atom).toMatchObject({ field: 'remains', op: '<=', value: 4 });
    expect(only('buff.maelstrom.stack>=5').atom).toMatchObject({ field: 'stack', op: '>=', value: 5 });
  });

  it('reads a cooldown as ready from ready, from remains at zero, and from a charge at hand', () => {
    expect(only('cooldown.x.ready').atom).toMatchObject({ family: 'cooldown', field: 'ready' });
    expect(only('cooldown.x.remains=0').atom).toMatchObject({ field: 'ready' });
    expect(only('cooldown.x.charges_fractional>=1.8').atom).toMatchObject({ field: 'ready' });
  });

  it('reads a bare cooldown remains as not ready and remains against a number as a timing', () => {
    expect(only('cooldown.x.remains')).toMatchObject({ negated: true, atom: { field: 'ready' } });
    expect(only('cooldown.x.remains>=35').atom).toMatchObject({ field: 'remains', op: '>=', value: 35 });
  });

  it('reads a resource with its field, a mirrored comparison, and a bare resource as above zero', () => {
    expect(only('combo_points>=5').atom).toEqual({ family: 'resource', name: 'combo_points', field: 'amount', op: '>=', value: 5 });
    expect(only('30<energy').atom).toMatchObject({ name: 'energy', op: '>', value: 30 });
    expect(only('rage').atom).toMatchObject({ name: 'rage', op: '>', value: 0 });
  });

  it('reads a symbolic right side as a direction without a magnitude', () => {
    expect(only('combo_points>=cp_max_spend-1').atom).toMatchObject({ name: 'combo_points', op: '>=', value: null });
  });

  it('reads target counts, the execute health share, and the talent and hero tree gates', () => {
    expect(only('spell_targets.fan_of_knives>1').atom).toEqual({ family: 'targets', op: '>', value: 1 });
    expect(only('target.health.pct<20').atom).toEqual({ family: 'health', op: '<', value: 20 });
    expect(only('talent.massacre.enabled').atom).toEqual({ family: 'talent', token: 'massacre' });
    expect(only('!hero_tree.deathstalker')).toEqual({ negated: true, provenance: 'own', atom: { family: 'hero', token: 'deathstalker' } });
  });

  it('reads anything else as other and keys it as nothing', () => {
    const fact = only('buff.x.value>3');
    expect(fact.atom).toMatchObject({ family: 'aura', field: 'other' });
    expect(literals.key(only('pet.active'))).toBeNull();
  });
});

describe('AplLiteralService.key', () => {
  it('folds a magnitude into a direction so the same rule is one key', () => {
    expect(literals.key(only('combo_points>=5'))).toBe(literals.key(only('combo_points>6')));
    expect(literals.key(only('combo_points>=5'))).not.toBe(literals.key(only('combo_points<=2')));
  });

  it('keeps polarity in the key', () => {
    expect(literals.key(only('buff.x.up'))).not.toBe(literals.key(only('!buff.x.up')));
  });
});

describe('AplLiteralService.termAllows', () => {
  it('lets a single target through a count below two and keeps it out of a count above two', () => {
    expect(literals.termAllows(facts('spell_targets<2&buff.x.up'), SINGLE_TARGET)).toBe(true);
    expect(literals.termAllows(facts('spell_targets>2&buff.x.up'), SINGLE_TARGET)).toBe(false);
  });

  it('judges the boundary strictly and never rules out a symbolic count', () => {
    expect(literals.termAllows(facts('active_enemies>=3'), CLEAVE)).toBe(true);
    expect(literals.termAllows(facts('active_enemies>3'), CLEAVE)).toBe(false);
    expect(literals.termAllows(facts('active_enemies>=3-talent.x'), SINGLE_TARGET)).toBe(true);
  });
});
