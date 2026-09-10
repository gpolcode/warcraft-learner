import { Injectable, inject } from '@angular/core';
import type { RuleCondition } from '../rulebook/rulebook.models';
import type { SpellRecord } from '../simc/simc.models';
import { AplLiteralService, type Fact } from './apl-literal-service';
import type { ActionLine, DraftSeed, FactSite, TalentGate, TermSite } from './rule-derivation.models';

/** Past this many talents the build space is too wide to enumerate, and a gate that wide is not a rule. */
const MAX_GATE_TOKENS = 8;

/** The bookkeeping every rule kind shares: talent gates, term walking, identity keys. */
@Injectable({ providedIn: 'root' })
export class RuleGateService {
  private readonly literals = inject(AplLiteralService);

  talentGate(facts: Fact[]): TalentGate {
    const requires = new Set<string>();
    const excludes = new Set<string>();
    for (const fact of facts) {
      if (fact.atom.family !== 'talent' && fact.atom.family !== 'hero') continue;
      const token = fact.atom.family === 'hero' ? `hero:${fact.atom.token}` : fact.atom.token;
      (fact.negated ? excludes : requires).add(token);
    }
    return { requires, excludes };
  }

  /** The gate every term shares: a rule read from several terms applies where all of them do. */
  termGate(terms: Fact[][]): TalentGate {
    const gates = terms.map(term => this.talentGate(term));
    return { requires: this.intersection(gates.map(gate => gate.requires)), excludes: this.intersection(gates.map(gate => gate.excludes)) };
  }

  intersection(sets: Set<string>[]): Set<string> {
    const [first, ...rest] = sets;
    return new Set([...(first ?? [])].filter(token => rest.every(set => set.has(token))));
  }

  /** A fact is a rule for the builds on which every line that can fire carries it; the gate names those builds when one talent set does. */
  gateAcrossLines(lines: ActionLine[], hasFact: (line: ActionLine) => boolean): TalentGate | null {
    const tokens = [...new Set(lines.flatMap(line => [...line.requires, ...line.excludes]))];
    if (tokens.length > MAX_GATE_TOKENS) return null;
    const holding: Set<string>[] = [];
    const builds = 1 << tokens.length;
    for (let mask = 0; mask < builds; mask += 1) {
      const build = new Set(tokens.filter((_, index) => mask & (1 << index)));
      const applicable = lines.filter(line => [...line.requires].every(token => build.has(token)) && [...line.excludes].every(token => !build.has(token)));
      if (applicable.length && applicable.every(hasFact)) holding.push(build);
    }
    if (!holding.length) return null;
    if (holding.length === builds) return { requires: new Set(), excludes: new Set() };
    return this.characterize(holding, tokens);
  }

  /** The builds the fact holds on, as the talents they all take and the ones none takes; null when no such description fits them exactly. */
  private characterize(holding: Set<string>[], tokens: string[]): TalentGate | null {
    const requires = this.intersection(holding);
    const excludes = new Set(tokens.filter(token => holding.every(build => !build.has(token))));
    const matching = 1 << (tokens.length - requires.size - excludes.size);
    return matching === holding.length ? { requires, excludes } : null;
  }

  /** A term that needs a state both up and down can never fire; it is a cross-product artefact of a list gate, not a way to choose the line. */
  consistent(term: Fact[]): boolean {
    const keys = term.map(fact => this.literals.key(fact)).filter((key): key is string => key !== null);
    const polarityFree = new Set(keys.map(key => key.replace(/!$/, '')));
    return polarityFree.size === new Set(keys).size;
  }

  everyTerm(terms: Fact[][]): Map<string, Fact> {
    const [first, ...rest] = terms;
    const facts = new Map<string, Fact>();
    for (const fact of first ?? []) {
      const key = this.literals.key(fact);
      if (key !== null && rest.every(term => term.some(other => this.literals.key(other) === key))) facts.set(key, fact);
    }
    return facts;
  }

  termSites(lines: ActionLine[]): TermSite[] {
    return lines.flatMap(line => line.terms.map(term => ({ line, term })));
  }

  factSites(lines: ActionLine[]): FactSite[] {
    return this.termSites(lines).flatMap(site => site.term.map(fact => ({ ...site, fact })));
  }

  positiveSelfAuras(term: Fact[]): string[] {
    return term.flatMap(fact => (fact.atom.family === 'aura' && fact.atom.scope === 'self' && fact.atom.field === 'up' && !fact.negated ? [fact.atom.token] : []));
  }

  /** States the action's own gate asks for; a list gate applies to every line in the list and so chooses nothing. */
  ownPositiveSelfAuras(term: Fact[]): string[] {
    return this.positiveSelfAuras(term.filter(fact => fact.provenance === 'own'));
  }

  /** Self auras the action's own gate says must be down on every line. */
  negatedSelfAuras(line: ActionLine): string[] {
    return [...line.lineFacts.values()].flatMap(fact =>
      (fact.provenance === 'own' && fact.atom.family === 'aura' && fact.atom.scope === 'self' && fact.atom.field === 'up' && fact.negated ? [fact.atom.token] : []));
  }

  named(record: SpellRecord): { spell_id: number; spell_name: string } {
    return { spell_id: record.id, spell_name: record.name };
  }

  distinct(records: SpellRecord[]): SpellRecord[] {
    const byId = new Map<number, SpellRecord>();
    for (const record of records) if (!byId.has(record.id)) byId.set(record.id, record);
    return [...byId.values()];
  }

  seed(condition: RuleCondition, priority: number, gate: TalentGate, key = this.conditionKey(condition)): DraftSeed {
    return { key, condition, type: this.typeOf(condition), priority, gate };
  }

  typeOf(condition: RuleCondition): string {
    switch (condition.kind) {
      case 'cast_without_prior': return 'cooldown_pairing';
      case 'hold_cooldown_for_anchor': return 'cd_hold';
      case 'opening_sequence': return 'opener';
      case 'cast_at_target_count': return 'aoe_switch';
      default: return 'rotation';
    }
  }

  /** Identity and direction only: two lines that name the same rule with different magnitudes are one rule. */
  conditionKey(condition: RuleCondition): string {
    switch (condition.kind) {
      case 'cast_without_prior': return `${condition.kind}:${condition.spell_id}:${condition.required_spell_id}:${condition.position ?? 'before'}`;
      case 'hold_cooldown_for_anchor': return `${condition.kind}:${condition.anchor_spell_id}`;
      case 'cast_outside_buff': return `${condition.kind}:${condition.spell_id}:${condition.buff_spell_id}:${condition.require}`;
      case 'aura_uptime_below': return `${condition.kind}:${condition.aura_spell_id}:${condition.on}`;
      case 'cast_at_target_count': return `${condition.kind}:${condition.spell_id}:${condition.bound}`;
      case 'resource_at_cast': return `${condition.kind}:${condition.spell_id}:${condition.resource_type}:${condition.bound}`;
      default: return this.stateConditionKey(condition);
    }
  }

  private stateConditionKey(condition: RuleCondition): string {
    switch (condition.kind) {
      case 'proc_wasted': return `${condition.kind}:${condition.buff_spell_id}`;
      case 'filler_in_buff': return `${condition.kind}:${condition.spell_id}:${condition.buff_spell_id}`;
      case 'spend_at_stacks': return `${condition.kind}:${condition.spell_id}:${condition.buff_spell_id}:${condition.bound}`;
      case 'aura_clipped': return `${condition.kind}:${condition.aura_spell_id}`;
      case 'filler_below_health': return `${condition.kind}:${condition.spell_id}`;
      default: return condition.kind;
    }
  }
}
