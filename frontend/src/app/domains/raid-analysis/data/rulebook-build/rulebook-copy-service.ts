import { Injectable, inject } from '@angular/core';
import type { RuleCondition } from '../rulebook/rulebook.models';
import type { ResolvedAction } from '../simc/simc.models';
import { SimcExpressionService } from '../simc/simc-expression-service';
import { AbilityIndexService } from './ability-index-service';
import { AplLiteralService, type Atom, type Fact } from './apl-literal-service';
import type { AbilityIndex } from './rulebook-build.models';
import type { DefensiveEntry } from './cooldown-derivation-service';

/** The findings table renders this many characters of a rule title untruncated. */
const DESCRIPTION_MAX = 60;
/** A card sentence carries at most this many clauses of a cooldown's gate. */
const USAGE_CLAUSES = 2;
/** Refreshing inside the last 30% of a periodic effect keeps the remainder: the game's pandemic window. */
const PANDEMIC_SHARE = 30;
const SINGLE_TARGET = 1;

type Kind = RuleCondition['kind'];
type Of<K extends Kind> = Extract<RuleCondition, { kind: K }>;
type Copy = { [K in Kind]: (condition: Of<K>) => string };

const list = (names: string[]): string => (names.length <= 1 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} or ${names[names.length - 1] ?? ''}`);

const TITLE: Copy = {
  cast_without_prior: c => (c.position === 'after' ? `${c.spell_name} with ${c.required_spell_name} ready` : `${c.spell_name} after ${c.required_spell_name}`),
  hold_cooldown_for_anchor: c => `Hold ${list(c.spell_names)} for ${c.anchor_spell_name}`,
  cast_outside_buff: c => `${c.spell_name} ${c.require === 'inside' ? 'only inside' : 'never inside'} ${c.buff_spell_name}`,
  aura_uptime_below: c => (c.on === 'target' ? `Keep ${c.aura_spell_name} on the target` : `Keep ${c.aura_spell_name} up`),
  opening_sequence: c => `Open with ${c.spell_names.slice(0, 3).join(', ')}`,
  cast_at_target_count: c => (c.bound === 'min' ? `${c.spell_name} only on several targets` : `${c.spell_name} only on few targets`),
  resource_at_cast: c => (c.bound === 'min' ? `${c.spell_name} at high ${c.resource_name}` : `${c.spell_name} at low ${c.resource_name}`),
  proc_wasted: c => `Spend ${c.buff_spell_name} on sight`,
  filler_in_buff: c => `${c.spell_name} inside ${c.buff_spell_name}`,
  spend_at_stacks: c => (c.bound === 'min' ? `${c.spell_name} at high ${c.buff_spell_name} stacks` : `${c.spell_name} before ${c.buff_spell_name} caps`),
  aura_clipped: c => `Refresh ${c.aura_spell_name} late`,
  filler_below_health: c => `${c.spell_name} below ${c.health_pct}% health`,
};

/** The fallback when the full title overflows the table column. */
const SHORT_TITLE: Partial<Copy> = {
  hold_cooldown_for_anchor: c => `Hold for ${c.anchor_spell_name}`,
  opening_sequence: c => `Open with ${c.spell_names[0] ?? ''}`,
  cast_without_prior: c => `${c.spell_name} with ${c.required_spell_name}`,
  cast_outside_buff: c => `${c.spell_name} in ${c.buff_spell_name}`,
  filler_in_buff: c => `${c.spell_name} in ${c.buff_spell_name}`,
  spend_at_stacks: c => `${c.spell_name} at ${c.buff_spell_name} stacks`,
};

const ACTION: Copy = {
  cast_without_prior: c => (c.position === 'after'
    ? `Press ${c.spell_name} only when ${c.required_spell_name} is ready to follow it.`
    : `Press ${c.required_spell_name} before ${c.spell_name}.`),
  hold_cooldown_for_anchor: c => `Save ${list(c.spell_names)} while ${c.anchor_spell_name} is coming up and press it inside that window.`,
  cast_outside_buff: c => (c.require === 'inside'
    ? `Wait for ${c.buff_spell_name} before you press ${c.spell_name}.`
    : `Hold ${c.spell_name} until ${c.buff_spell_name} has dropped.`),
  aura_uptime_below: c => `Refresh ${c.aura_spell_name} before it falls off.`,
  opening_sequence: c => `Pull with ${c.spell_names.join(', then ')}.`,
  cast_at_target_count: c => (c.bound === 'min'
    ? `Press ${c.spell_name} only once several enemies are up.`
    : `Switch away from ${c.spell_name} once several enemies are up.`),
  resource_at_cast: c => (c.bound === 'min'
    ? `Build ${c.resource_name} before you spend ${c.spell_name}.`
    : `Press ${c.spell_name} only while your ${c.resource_name} ${c.resource_name.endsWith('s') ? 'are' : 'is'} low.`),
  proc_wasted: c => `Press ${list(c.spend_spell_names)} as soon as ${c.buff_spell_name} procs.`,
  filler_in_buff: c => `Press ${c.spell_name} instead of ${list(c.alternative_spell_names)} while ${c.buff_spell_name} is up.`,
  spend_at_stacks: c => (c.bound === 'min'
    ? `Wait for more ${c.buff_spell_name} stacks before you press ${c.spell_name}.`
    : `Press ${c.spell_name} only while ${c.buff_spell_name} is below its cap.`),
  aura_clipped: c => `Refresh ${c.aura_spell_name} only inside its last ${PANDEMIC_SHARE}%.`,
  filler_below_health: c => `Press ${c.spell_name} instead of ${list(c.alternative_spell_names)} once the target is below ${c.health_pct}% health.`,
};

const DEFENSIVE_USAGE: [RegExp, string][] = [
  [/Immunity|Reflection|Deflect/, 'Press it to shrug off a magic hit or a debuff you cannot avoid.'],
  [/Absorb/, 'Press it ahead of a hit so the shield takes it.'],
  [/Dodge%|Parry%/, 'Press it when melee hits are landing on you.'],
  [/Heal/, 'Press it to heal yourself back up after a hit.'],
  [/Health/, 'Press it ahead of a big hit for the extra health.'],
];

@Injectable({ providedIn: 'root' })
export class RulebookCopyService {
  private readonly expressions = inject(SimcExpressionService);
  private readonly literals = inject(AplLiteralService);
  private readonly abilities = inject(AbilityIndexService);

  private render<K extends Kind>(copy: Partial<Copy>, condition: Of<K>): string | null {
    const template: ((entry: Of<K>) => string) | undefined = copy[condition.kind];
    return template ? template(condition) : null;
  }

  description(condition: RuleCondition): string {
    const long = this.render(TITLE, condition) ?? '';
    if (long.length <= DESCRIPTION_MAX) return long;
    const short = this.render(SHORT_TITLE, condition) ?? long;
    return short.length <= DESCRIPTION_MAX ? short : `${short.slice(0, DESCRIPTION_MAX - 3).trimEnd()}...`;
  }

  action(condition: RuleCondition): string {
    return this.render(ACTION, condition) ?? '';
  }

  /** One sentence from the line a raider meets first on one target outside execute: the clauses to act on, two at most. */
  usageRule(lines: ResolvedAction[], index: AbilityIndex): string {
    const own = lines[0]?.action ?? '';
    const facts = this.usageTerm(lines)
      .filter(fact => !(fact.atom.family === 'aura' && fact.atom.token === own))
      .sort((a, b) => this.clauseRank(a) - this.clauseRank(b));
    const clauses: string[] = [];
    for (const fact of facts) {
      const clause = this.clause(fact, index);
      if (clause && !clauses.includes(clause)) clauses.push(clause);
      if (clauses.length === USAGE_CLAUSES) break;
    }
    return clauses.length ? `Press it when ${clauses.join(' and ')}.` : 'Use it on cooldown.';
  }

  /** Every line's resolved gate in SimC syntax, so the card sentence never has to carry the whole condition. */
  aplCondition(lines: ResolvedAction[]): string {
    const gates = lines.map(line => {
      const parts = [...line.context, ...(line.own ? [line.own] : [])].map(gate => this.expressions.print(gate));
      return parts.length ? parts.map(part => (parts.length > 1 ? `(${part})` : part)).join('&') : '1';
    });
    const distinct = [...new Set(gates)];
    return distinct.length > 1 ? distinct.map(gate => `(${gate})`).join('|') : distinct[0] ?? '1';
  }

  /** Every line's gate as the one term a raider meets first: on one target and outside execute where the line allows it, else its first term. */
  private usageTerm(lines: ResolvedAction[]): Fact[] {
    const candidates = lines.map(line => {
      const terms = (this.expressions.termsOf(line.own, line.context) ?? [[]]).map(term => this.literals.facts(term));
      const plain = terms.find(term => this.literals.termAllows(term, SINGLE_TARGET) && !term.some(fact => fact.atom.family === 'health'));
      return { term: plain ?? terms[0] ?? [], plain: plain !== undefined };
    });
    return (candidates.find(candidate => candidate.plain && candidate.term.length > 0) ?? candidates.find(candidate => candidate.term.length > 0))?.term ?? [];
  }

  /** What a raider acts on first: another cooldown, the target's dots, a state, a count, the pool; what must be absent comes last. */
  private clauseRank(fact: Fact): number {
    const family = fact.atom.family;
    const base = family === 'cooldown' ? 0 : family === 'aura' && fact.atom.scope === 'target' ? 1 : family === 'aura' ? 2
      : family === 'targets' ? 3 : family === 'health' ? 4 : 5;
    return base + (fact.negated ? 10 : 0) + (fact.provenance === 'context' ? 0.5 : 0);
  }

  private nameOf(token: string, index: AbilityIndex, scope: 'self' | 'target' | 'cast'): string {
    const record = scope === 'cast' ? this.abilities.cast(index, token) : this.abilities.aura(index, token, scope);
    return record?.name ?? token.replace(/_/g, ' ');
  }

  private clause(fact: Fact, index: AbilityIndex): string | null {
    const { atom } = fact;
    switch (atom.family) {
      case 'aura': return this.auraClause(atom, fact.negated, index);
      case 'cooldown': return this.cooldownClause(atom, fact.negated, index);
      case 'resource': return fact.negated ? null : this.resourceClause(atom);
      case 'targets': return this.targetsClause(atom, fact.negated);
      case 'health': return atom.value === null ? null : `the target is ${fact.negated ? 'above' : 'below'} ${atom.value}% health`;
      default: return null;
    }
  }

  private auraClause(atom: Atom & { family: 'aura' }, negated: boolean, index: AbilityIndex): string | null {
    const name = this.nameOf(atom.token, index, atom.scope);
    if (atom.field === 'up') return this.auraUpClause(name, atom.scope, negated);
    if (atom.field === 'stack') return this.stackClause(name, atom);
    if (atom.field === 'refreshable' || atom.field === 'remains') return `${name} is about to run out`;
    return null;
  }

  private auraUpClause(name: string, scope: 'self' | 'target', negated: boolean): string {
    if (scope === 'target') return negated ? `${name} is not on the target` : `${name} is on the target`;
    return negated ? `${name} is down` : `${name} is up`;
  }

  private stackClause(name: string, atom: Atom & { family: 'aura' }): string | null {
    if (atom.value === null) return null;
    if (atom.op === '>=' || atom.op === '>') return `${name} has ${atom.op === '>' ? atom.value + 1 : atom.value} or more stacks`;
    if (atom.op === '<' || atom.op === '<=') return `${name} is below ${atom.op === '<=' ? atom.value + 1 : atom.value} stacks`;
    return null;
  }

  private cooldownClause(atom: Atom & { family: 'cooldown' }, negated: boolean, index: AbilityIndex): string | null {
    const name = this.nameOf(atom.token, index, 'cast');
    if (atom.field === 'ready' || atom.field === 'charges') return negated ? `${name} is on cooldown` : `${name} is ready`;
    if (atom.field !== 'remains') return null;
    if (atom.op === '<' || atom.op === '<=') return `${name} is about to come back`;
    if (atom.op !== '>' && atom.op !== '>=') return null;
    return atom.value === null ? `${name} is far from ready` : `${name} is more than ${atom.value}s away`;
  }

  private resourceClause(atom: Atom & { family: 'resource' }): string | null {
    if (atom.value === null) return null;
    const name = atom.name.replace(/_/g, ' ');
    const verb = name.endsWith('s') ? 'are' : 'is';
    const direction = atom.op === '>' || atom.op === '>=' ? 'high' : atom.op === '<' || atom.op === '<=' ? 'low' : null;
    if (atom.field === 'deficit') return this.deficitClause(atom, name, verb, direction);
    return direction === null ? null : this.poolClause(atom, name, verb, direction);
  }

  private poolClause(atom: Atom & { family: 'resource' }, name: string, verb: string, direction: 'high' | 'low'): string | null {
    const inclusive = atom.op === '>=' || atom.op === '<=';
    if (atom.field === 'amount') {
      if (direction === 'high') return inclusive ? `you have ${atom.value} or more ${name}` : `you have more than ${atom.value} ${name}`;
      return inclusive ? `you have ${atom.value} or fewer ${name}` : `you have fewer than ${atom.value} ${name}`;
    }
    if (atom.field === 'pct') return direction === 'high' ? `your ${name} ${verb} above ${atom.value}%` : `your ${name} ${verb} below ${atom.value}%`;
    return null;
  }

  private deficitClause(atom: Atom & { family: 'resource' }, name: string, verb: string, direction: 'high' | 'low' | null): string | null {
    if (direction === 'high') return `your ${name} ${verb} not capped`;
    return atom.op === '=' && atom.value === 0 ? `your ${name} ${verb} capped` : null;
  }

  private targetsClause(atom: Atom & { family: 'targets' }, negated: boolean): string | null {
    if (atom.value === null || atom.op === null) return null;
    if (atom.op === '=' || atom.op === '!=') return this.exactTargetsClause(atom.value, (atom.op === '!=') !== negated);
    const high = (atom.op === '>' || atom.op === '>=') !== negated;
    const count = atom.op === '>' || atom.op === '<=' ? atom.value + 1 : atom.value;
    return high ? `${count} or more enemies are up` : `fewer than ${count} enemies are up`;
  }

  private exactTargetsClause(count: number, negated: boolean): string {
    if (count <= SINGLE_TARGET) return negated ? 'more than one enemy is up' : 'you are on a single target';
    return negated ? `not exactly ${count} enemies are up` : `exactly ${count} enemies are up`;
  }

  /** A coaching sentence from the effect that made the button a defensive. */
  defensiveUsage(entry: DefensiveEntry): string {
    const { subtype, baseValue } = entry.effect;
    const usage = DEFENSIVE_USAGE.find(([pattern]) => pattern.test(subtype))?.[1];
    if (usage) return usage;
    const reduction = baseValue !== null && baseValue < 0 ? `${Math.abs(baseValue)}% less damage` : 'less damage';
    return `Press it just before a big hit for ${reduction}.`;
  }
}
