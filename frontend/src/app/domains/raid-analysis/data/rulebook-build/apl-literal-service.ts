import { Injectable, inject } from '@angular/core';
import { SimcExpressionService } from '../simc/simc-expression-service';
import type { AplComparisonOp, AplExpr, AplLiteral, GateProvenance } from '../simc/simc.models';

export type AuraField = 'up' | 'stack' | 'refreshable' | 'remains' | 'other';
export type CooldownField = 'ready' | 'remains' | 'charges' | 'other';
type ResourceField = 'amount' | 'pct' | 'deficit' | 'max';

/** An APL literal read in the vocabulary the rule kinds judge: which aura, cooldown, resource or count, and which way. */
export type Atom =
  | { family: 'aura'; scope: 'self' | 'target'; token: string; field: AuraField; op: AplComparisonOp | null; value: number | null }
  | { family: 'cooldown'; token: string; field: CooldownField; op: AplComparisonOp | null; value: number | null }
  | { family: 'resource'; name: string; field: ResourceField; op: AplComparisonOp | null; value: number | null }
  | { family: 'targets'; op: AplComparisonOp | null; value: number | null }
  | { family: 'health'; op: AplComparisonOp | null; value: number | null }
  | { family: 'talent'; token: string }
  | { family: 'hero'; token: string }
  | { family: 'other' };

export interface Fact {
  atom: Atom;
  negated: boolean;
  provenance: GateProvenance;
}

/** A normalised literal: the atom plus a polarity a field like `down` may have flipped. */
interface Read {
  atom: Atom;
  negated: boolean;
}

const RESOURCE_HEADS = new Set([
  'mana', 'rage', 'focus', 'energy', 'combo_points', 'rune', 'runic_power', 'soul_shard', 'soul_shards', 'astral_power',
  'holy_power', 'maelstrom', 'chi', 'insanity', 'fury', 'pain', 'essence', 'arcane_charges',
]);
const TARGET_HEADS = new Set(['spell_targets', 'active_enemies', 'enemies']);
const AURA_HEADS: Record<string, 'self' | 'target'> = { buff: 'self', debuff: 'target', dot: 'target' };
const RESOURCE_FIELDS = new Set<ResourceField>(['pct', 'deficit', 'max']);
const UP_FIELDS = new Set(['', 'up', 'react', 'ticking']);
const MIRRORED: Record<AplComparisonOp, AplComparisonOp> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=', '!=': '!=' };

const OTHER: Atom = { family: 'other' };

@Injectable({ providedIn: 'root' })
export class AplLiteralService {
  private readonly expressions = inject(SimcExpressionService);

  facts(literals: AplLiteral[]): Fact[] {
    return literals.map(literal => ({ ...this.read(literal.atom, literal.negated), provenance: literal.provenance }));
  }

  private read(expr: AplExpr, negated: boolean): Read {
    if (expr.kind === 'ref') return this.refAtom(expr.path, null, null, negated);
    if (expr.kind === 'bin' && this.expressions.isComparison(expr.op)) {
      if (expr.left.kind === 'ref') return this.refAtom(expr.left.path, expr.op, this.constant(expr.right), negated);
      if (expr.right.kind === 'ref') return this.refAtom(expr.right.path, MIRRORED[expr.op], this.constant(expr.left), negated);
    }
    return { atom: OTHER, negated };
  }

  private constant(expr: AplExpr): number | null {
    return expr.kind === 'num' ? expr.value : null;
  }

  private refAtom(path: readonly string[], op: AplComparisonOp | null, value: number | null, negated: boolean): Read {
    const [head = '', second = '', third = ''] = path;
    const scope = AURA_HEADS[head];
    if (scope && second) return this.auraAtom(scope, second, third, op, value, negated);
    if (head === 'cooldown' && second) return this.cooldownAtom(second, third, op, value, negated);
    if (RESOURCE_HEADS.has(head)) return this.resourceAtom(head, second, op, value, negated);
    return this.plainAtom(path, op, value, negated);
  }

  private plainAtom(path: readonly string[], op: AplComparisonOp | null, value: number | null, negated: boolean): Read {
    const [head = '', second = ''] = path;
    if (TARGET_HEADS.has(head)) return { atom: { family: 'targets', op, value }, negated };
    if (path.join('.') === 'target.health.pct') return { atom: { family: 'health', op, value }, negated };
    return { atom: this.gateAtom(head, second), negated };
  }

  private gateAtom(head: string, token: string): Atom {
    if (!token) return OTHER;
    if (head === 'talent') return { family: 'talent', token };
    return head === 'hero_tree' ? { family: 'hero', token } : OTHER;
  }

  /** A bare resource reference is truthy above zero, so it reads as `> 0`. */
  private resourceAtom(name: string, second: string, op: AplComparisonOp | null, value: number | null, negated: boolean): Read {
    const field: ResourceField = RESOURCE_FIELDS.has(second as ResourceField) ? (second as ResourceField) : 'amount';
    return { atom: { family: 'resource', name, field, op: op ?? '>', value: op ? value : 0 }, negated };
  }

  private auraAtom(scope: 'self' | 'target', token: string, field: string, op: AplComparisonOp | null, value: number | null, negated: boolean): Read {
    const aura = (read: AuraField, flip = false, keep = true): Read =>
      ({ atom: { family: 'aura', scope, token, field: read, op: keep ? op : null, value: keep ? value : null }, negated: flip ? !negated : negated });
    if (UP_FIELDS.has(field)) return aura('up', false, false);
    if (field === 'down') return aura('up', true, false);
    if (field === 'stack') return aura('stack');
    if (field === 'refreshable') return aura('refreshable', false, false);
    return field === 'remains' ? this.remainsAtom(aura, op) : aura('other');
  }

  /** Time left above a number is the aura being up; time left below one is the refresh window. */
  private remainsAtom(aura: (read: AuraField, flip?: boolean, keep?: boolean) => Read, op: AplComparisonOp | null): Read {
    if (op === null || op === '>' || op === '>=') return aura('up', false, false);
    return op === '<' || op === '<=' ? aura('remains') : aura('other');
  }

  private cooldownAtom(token: string, field: string, op: AplComparisonOp | null, value: number | null, negated: boolean): Read {
    const cooldown = (read: CooldownField, flip = false, keep = true): Read =>
      ({ atom: { family: 'cooldown', token, field: read, op: keep ? op : null, value: keep ? value : null }, negated: flip ? !negated : negated });
    if (field === 'ready' || field === 'up') return cooldown('ready', false, false);
    if (field === 'remains') return this.cooldownRemainsAtom(cooldown, op, value);
    if (field === 'charges' || field === 'charges_fractional') return this.chargesAtom(cooldown, op, value);
    return cooldown('other');
  }

  /** A bare `remains` is truthy while on cooldown, so it reads as not ready; `remains=0` is ready. */
  private cooldownRemainsAtom(cooldown: (read: CooldownField, flip?: boolean, keep?: boolean) => Read, op: AplComparisonOp | null, value: number | null): Read {
    if (op === null) return cooldown('ready', true, false);
    return op === '=' && value === 0 ? cooldown('ready', false, false) : cooldown('remains');
  }

  private chargesAtom(cooldown: (read: CooldownField, flip?: boolean, keep?: boolean) => Read, op: AplComparisonOp | null, value: number | null): Read {
    const atLeastOne = (op === '>=' || op === '>') && (value === null || value >= 1);
    return op === null || atLeastOne ? cooldown('ready', false, false) : cooldown('charges');
  }

  /** A stable key for "the same rule fact", identity and direction only, so a magnitude never splits one rule into two. */
  key(fact: Fact): string | null {
    const parts = this.keyParts(fact.atom);
    return parts === null ? null : `${parts.join(':')}:${fact.negated ? '!' : ''}`;
  }

  private keyParts(atom: Atom): string[] | null {
    switch (atom.family) {
      case 'aura': return ['aura', atom.scope, atom.token, atom.field, this.direction(atom.op)];
      case 'cooldown': return ['cooldown', atom.token, atom.field, this.direction(atom.op)];
      case 'resource': return ['resource', atom.name, atom.field, this.direction(atom.op)];
      case 'targets': return ['targets', this.direction(atom.op)];
      case 'health': return ['health', this.direction(atom.op)];
      case 'talent': return ['talent', atom.token];
      case 'hero': return ['hero', atom.token];
      case 'other': return null;
    }
  }

  private direction(op: AplComparisonOp | null): string {
    if (op === '>' || op === '>=') return 'high';
    if (op === '<' || op === '<=') return 'low';
    return op ?? '';
  }

  /** Whether the term can be chosen with this many enemies up; a symbolic count never rules it out. */
  termAllows(term: Fact[], enemies: number): boolean {
    return term.every(fact => {
      if (fact.atom.family !== 'targets' || fact.atom.value === null || fact.atom.op === null) return true;
      const holds = this.compare(enemies, fact.atom.op, fact.atom.value);
      return fact.negated ? !holds : holds;
    });
  }

  private compare(left: number, op: AplComparisonOp, right: number): boolean {
    switch (op) {
      case '=': return left === right;
      case '!=': return left !== right;
      case '<': return left < right;
      case '<=': return left <= right;
      case '>': return left > right;
      case '>=': return left >= right;
    }
  }
}
