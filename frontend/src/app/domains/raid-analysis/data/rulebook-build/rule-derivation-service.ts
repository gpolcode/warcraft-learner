import { Injectable, inject } from '@angular/core';
import { SimcExpressionService } from '../simc/simc-expression-service';
import type { AplComparisonOp, ResolvedAction, SpellRecord } from '../simc/simc.models';
import type { RuleCondition } from '../rulebook/rulebook.models';
import { getOrInsert } from '../analysis/analysis-math';
import { AbilityIndexService } from './ability-index-service';
import { AplLiteralService, type Atom, type Fact } from './apl-literal-service';
import { RuleGateService } from './rule-gate-service';
import { RuleStateDerivationService } from './rule-state-derivation-service';
import type { ActionGroup, ActionLine, AuraLookup, DraftSeed } from './rule-derivation.models';
import type { AbilityIndex, ParseSample, RuleDraft } from './rulebook-build.models';

/** WCL power type ids, the numbers the engine reads a cast's resource snapshot by. */
const POWER_TYPES: Record<string, { type: number; label: string }> = {
  mana: { type: 0, label: 'mana' }, rage: { type: 1, label: 'rage' }, focus: { type: 2, label: 'focus' },
  energy: { type: 3, label: 'energy' }, combo_points: { type: 4, label: 'combo points' }, rune: { type: 5, label: 'runes' },
  runic_power: { type: 6, label: 'runic power' }, soul_shard: { type: 7, label: 'soul shards' }, soul_shards: { type: 7, label: 'soul shards' },
  astral_power: { type: 8, label: 'astral power' }, holy_power: { type: 9, label: 'holy power' }, maelstrom: { type: 11, label: 'maelstrom' },
  chi: { type: 12, label: 'chi' }, insanity: { type: 13, label: 'insanity' }, fury: { type: 17, label: 'fury' },
  pain: { type: 18, label: 'pain' }, essence: { type: 19, label: 'essence' },
};

const SINGLE_TARGET = 1;

export interface RuleDerivation {
  drafts: RuleDraft[];
  unresolvedActions: string[];
  unresolvedAuras: string[];
}

@Injectable({ providedIn: 'root' })
export class RuleDerivationService {
  private readonly expressions = inject(SimcExpressionService);
  private readonly literals = inject(AplLiteralService);
  private readonly abilities = inject(AbilityIndexService);
  private readonly gates = inject(RuleGateService);
  private readonly states = inject(RuleStateDerivationService);

  derive(actions: ResolvedAction[], index: AbilityIndex, samples: ParseSample[]): RuleDerivation {
    const unresolvedActions = new Set<string>();
    const unresolvedAuras = new Set<string>();
    const lines = this.actionLines(actions, index, unresolvedActions);
    const groups = this.groups(lines);
    const aura: AuraLookup = (token, scope) => {
      const record = this.abilities.aura(index, token, scope);
      if (!record) unresolvedAuras.add(token);
      return record;
    };
    const seeds: DraftSeed[] = [
      ...groups.flatMap(group => this.lineGatedRules(group, index, aura)),
      ...groups.flatMap(group => this.executeRules(group, groups)),
      ...this.states.fillerRules(lines, index, aura),
      ...this.states.procRules(groups, index, samples, aura),
      ...this.states.uptimeRules(lines, index, aura),
      ...this.states.clipRules(groups, aura),
      ...this.states.cooldownPairingRules(groups, index),
    ];
    return { drafts: this.merge(seeds), unresolvedActions: [...unresolvedActions].sort(), unresolvedAuras: [...unresolvedAuras].sort() };
  }

  private actionLines(actions: ResolvedAction[], index: AbilityIndex, unresolved: Set<string>): ActionLine[] {
    const lines: ActionLine[] = [];
    for (const resolved of actions) {
      const record = this.abilities.cast(index, resolved.action);
      if (!record) { unresolved.add(resolved.action); continue; }
      const terms = (this.expressions.termsOf(resolved.own, resolved.context) ?? [this.fallbackTerm(resolved)])
        .map(term => this.literals.facts(term)).filter(term => this.gates.consistent(term));
      if (!terms.length) continue;
      const lineFacts = this.gates.everyTerm(terms);
      lines.push({ resolved, record, terms, lineFacts, ...this.gates.talentGate([...lineFacts.values()]) });
    }
    return lines;
  }

  private fallbackTerm(resolved: ResolvedAction) {
    return [
      ...(resolved.own ? this.expressions.conjunction(resolved.own, 'own') : []),
      ...resolved.context.flatMap(gate => this.expressions.conjunction(gate, 'context')),
    ];
  }

  private groups(lines: ActionLine[]): ActionGroup[] {
    const byToken = new Map<string, ActionGroup>();
    for (const line of lines) {
      getOrInsert(byToken, line.resolved.action, () => ({ token: line.resolved.action, record: line.record, lines: [] })).lines.push(line);
    }
    return [...byToken.values()];
  }

  /** Gates that hold on every line of an action: resource, stacks, target count and buff windows. */
  private lineGatedRules(group: ActionGroup, index: AbilityIndex, aura: AuraLookup): DraftSeed[] {
    const seeds: DraftSeed[] = [];
    const keys = new Set(group.lines.flatMap(line => [...line.lineFacts.keys()]));
    for (const key of keys) {
      const withFact = group.lines.filter(line => line.lineFacts.has(key));
      const gate = this.gates.gateAcrossLines(group.lines, line => line.lineFacts.has(key), token => this.abilities.heroTree(index, token));
      const fact = withFact[0]?.lineFacts.get(key);
      if (!gate || !fact) continue;
      const condition = this.lineGatedCondition(group, fact, index, aura);
      if (condition) seeds.push(this.gates.seed(condition, Math.min(...withFact.map(line => line.resolved.priority)), gate));
    }
    return seeds;
  }

  private lineGatedCondition(group: ActionGroup, fact: Fact, index: AbilityIndex, aura: AuraLookup): RuleCondition | null {
    const { atom } = fact;
    if (atom.family === 'resource') return fact.negated ? null : this.resourceCondition(group.record, atom);
    if (atom.family === 'aura') return this.selfAuraCondition(group, atom, fact.negated, index, aura);
    if (atom.family !== 'targets') return null;
    const bound = this.targetBound(atom, fact.negated);
    return bound ? { kind: 'cast_at_target_count', ...this.gates.named(group.record), bound } : null;
  }

  private selfAuraCondition(group: ActionGroup, atom: Atom & { family: 'aura' }, negated: boolean, index: AbilityIndex, aura: AuraLookup): RuleCondition | null {
    if (atom.scope !== 'self' || atom.token === group.token) return null;
    if (atom.field === 'stack') return negated ? null : this.stackCondition(group.record, atom, aura);
    if (atom.field === 'up' && !this.abilities.isFiller(group.record)) return this.buffWindowCondition(group.record, atom, negated, index, aura);
    return null;
  }

  private stackCondition(record: SpellRecord, atom: Atom & { family: 'aura' }, aura: AuraLookup): RuleCondition | null {
    const bound = this.bound(atom.op);
    const buff = bound ? aura(atom.token, 'self') : null;
    const cap = buff?.maxStacks ?? 0;
    if (!bound || !buff || cap < 2) return null;
    return { kind: 'spend_at_stacks', ...this.gates.named(record), buff_spell_id: buff.id, buff_spell_name: buff.name, bound, max_stacks: cap };
  }

  private buffWindowCondition(record: SpellRecord, atom: Atom & { family: 'aura' }, negated: boolean, index: AbilityIndex, aura: AuraLookup): RuleCondition | null {
    const buff = aura(atom.token, 'self');
    if (!buff || (index.observation.buffParses.get(buff.id) ?? 0) === 0 || !this.abilities.stateObserved(index, buff.id)) return null;
    return { kind: 'cast_outside_buff', ...this.gates.named(record), buff_spell_id: buff.id, buff_spell_name: buff.name, require: negated ? 'outside' : 'inside' };
  }

  private resourceCondition(record: SpellRecord, atom: Atom & { family: 'resource' }): RuleCondition | null {
    const power = POWER_TYPES[atom.name];
    if (!power || atom.field === 'max') return null;
    const bound = atom.field === 'deficit' ? this.deficitBound(atom) : this.bound(atom.op);
    if (!bound) return null;
    return { kind: 'resource_at_cast', ...this.gates.named(record), resource_type: power.type, resource_name: power.label, bound };
  }

  /** Room left in the pool reads the other way round: a generator wanting deficit is guarding the cap, a spender wanting none is spending full. */
  private deficitBound(atom: Atom & { family: 'resource' }): 'min' | 'max' | null {
    if (atom.op === '=' && atom.value === 0) return 'min';
    const bound = this.bound(atom.op);
    return bound === 'min' ? 'max' : bound === 'max' ? 'min' : null;
  }

  private bound(op: AplComparisonOp | null): 'min' | 'max' | null {
    if (op === '>' || op === '>=') return 'min';
    if (op === '<' || op === '<=') return 'max';
    return null;
  }

  private targetBound(atom: Atom & { family: 'targets' }, negated: boolean): 'min' | 'max' | null {
    const bound = atom.op === '=' ? this.equalityTargetBound(atom.value) : this.bound(atom.op);
    if (!bound || this.trivialTargetGate(atom, bound)) return null;
    return negated ? (bound === 'min' ? 'max' : 'min') : bound;
  }

  private equalityTargetBound(value: number | null): 'min' | 'max' | null {
    if (value === null) return null;
    return value <= SINGLE_TARGET ? 'max' : 'min';
  }

  /** `targets>=1` and `targets<1` gate nothing a raid ever shows. */
  private trivialTargetGate(atom: Atom & { family: 'targets' }, bound: 'min' | 'max'): boolean {
    if (atom.value === null || atom.value > SINGLE_TARGET) return false;
    return (bound === 'min' && atom.op === '>=') || (bound === 'max' && atom.op === '<');
  }

  /** An execute is gated per term, since the same button is also pressed on procs, so its threshold and talent come from the terms that name a health share. */
  private executeRules(group: ActionGroup, groups: ActionGroup[]): DraftSeed[] {
    if (group.record.executeHealthPct === null) return [];
    const alternatives = groups.map(other => other.record).filter(record =>
      record.id !== group.record.id && this.abilities.isFiller(record) && this.abilities.sameRole(record, group.record));
    if (!alternatives.length) return [];
    const byThreshold = new Map<number, { terms: Fact[][]; priority: number }>();
    for (const site of this.gates.termSites(group.lines)) {
      const threshold = this.healthThreshold(site.term, group.record.executeHealthPct);
      if (threshold === null) continue;
      const entry = getOrInsert(byThreshold, threshold, () => ({ terms: [], priority: site.line.resolved.priority }));
      entry.terms.push(site.term);
      entry.priority = Math.min(entry.priority, site.line.resolved.priority);
    }
    return [...byThreshold].map(([threshold, entry]) => {
      const condition: RuleCondition = {
        kind: 'filler_below_health', ...this.gates.named(group.record),
        alternative_spell_ids: alternatives.map(record => record.id), alternative_spell_names: alternatives.map(record => record.name),
        health_pct: threshold,
      };
      return this.gates.seed(condition, entry.priority, this.gates.termGate(entry.terms), `${this.gates.conditionKey(condition)}:${threshold}`);
    });
  }

  private healthThreshold(term: Fact[], fallback: number): number | null {
    for (const fact of term) {
      if (fact.atom.family !== 'health' || fact.negated || (fact.atom.op !== '<' && fact.atom.op !== '<=')) continue;
      return fact.atom.value ?? fallback;
    }
    return null;
  }

  /** Same rule from several lines or builds: the gates every source shares survive, list fields take the union. */
  private merge(seeds: DraftSeed[]): RuleDraft[] {
    const drafts = new Map<string, RuleDraft>();
    for (const seed of seeds) {
      const existing = drafts.get(seed.key);
      if (!existing) {
        drafts.set(seed.key, { condition: seed.condition, type: seed.type, priority: seed.priority, requires: new Set(seed.gate.requires), excludes: new Set(seed.gate.excludes) });
        continue;
      }
      existing.priority = Math.min(existing.priority, seed.priority);
      existing.requires = this.gates.intersection([existing.requires, seed.gate.requires]);
      existing.excludes = this.gates.intersection([existing.excludes, seed.gate.excludes]);
      existing.condition = this.unionLists(existing.condition, seed.condition);
    }
    return [...drafts.values()].sort((a, b) => a.priority - b.priority);
  }

  private unionLists(base: RuleCondition, extra: RuleCondition): RuleCondition {
    if (base.kind === 'hold_cooldown_for_anchor' && extra.kind === 'hold_cooldown_for_anchor') {
      return { ...base, ...this.unionPair(base.spell_ids, base.spell_names, extra.spell_ids, extra.spell_names, 'spell') };
    }
    if (base.kind === 'proc_wasted' && extra.kind === 'proc_wasted') {
      return { ...base, ...this.unionPair(base.spend_spell_ids, base.spend_spell_names, extra.spend_spell_ids, extra.spend_spell_names, 'spend_spell') };
    }
    return base.kind === 'filler_in_buff' && extra.kind === 'filler_in_buff' ? this.unionFiller(base, extra) : base;
  }

  private unionFiller(base: Extract<RuleCondition, { kind: 'filler_in_buff' }>, extra: Extract<RuleCondition, { kind: 'filler_in_buff' }>): RuleCondition {
    return {
      ...base,
      ...this.unionPair(base.alternative_spell_ids, base.alternative_spell_names, extra.alternative_spell_ids, extra.alternative_spell_names, 'alternative_spell'),
      ...this.unionPair(base.except_buff_spell_ids ?? [], base.except_buff_spell_names ?? [], extra.except_buff_spell_ids ?? [], extra.except_buff_spell_names ?? [], 'except_buff_spell'),
    };
  }

  private unionPair(ids: number[], names: string[], moreIds: number[], moreNames: string[], prefix: string): Record<string, number[] | string[]> {
    const mergedIds = [...ids];
    const mergedNames = [...names];
    moreIds.forEach((id, position) => {
      if (mergedIds.includes(id)) return;
      mergedIds.push(id);
      mergedNames.push(moreNames[position] ?? '');
    });
    return { [`${prefix}_ids`]: mergedIds, [`${prefix}_names`]: mergedNames };
  }
}
