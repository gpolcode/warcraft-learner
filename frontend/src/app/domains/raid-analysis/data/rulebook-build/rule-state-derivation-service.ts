import { Injectable, inject } from '@angular/core';
import type { SpellRecord } from '../simc/simc.models';
import type { RuleCondition } from '../rulebook/rulebook.models';
import { AuraWindowsService } from '../analysis/aura-windows-service';
import { getOrInsert } from '../analysis/analysis-math';
import { AbilityIndexService } from './ability-index-service';
import { AplLiteralService, type Atom, type Fact } from './apl-literal-service';
import { RuleGateService } from './rule-gate-service';
import type { ActionGroup, ActionLine, AuraLookup, DraftSeed, FactSite, TalentGate, TermSite } from './rule-derivation.models';
import type { AbilityIndex, ParseSample } from './rulebook-build.models';

const SINGLE_TARGET = 1;
const CLEAVE = 3;
/** A buff that lives longer than this is a state, not a proc to react to. */
const PROC_MAX_DURATION_S = 30;
/** Below these the sampled parses call the aura situational rather than maintained, or the proc a lasting tracker rather than a consumed one. */
const MAINTAINED_UPTIME_SHARE = 0.7;
const CONSUMED_PROC_SHARE = 0.5;
const MIN_PROC_APPLICATIONS = 3;

type Scenario = typeof SINGLE_TARGET | typeof CLEAVE;

interface Accumulated {
  records: SpellRecord[];
  terms: Fact[][];
  priority: number;
}

/** The rules read from a state rather than a gate on every line: filler choice, procs, upkeep, clipping and cooldown pairing. */
@Injectable({ providedIn: 'root' })
export class RuleStateDerivationService {
  private readonly literals = inject(AplLiteralService);
  private readonly abilities = inject(AbilityIndexService);
  private readonly gates = inject(RuleGateService);
  private readonly auraWindows = inject(AuraWindowsService);

  private accumulate(map: Map<string, Accumulated>, key: string, site: TermSite): void {
    const entry = getOrInsert(map, key, () => ({ records: [], terms: [], priority: site.line.resolved.priority }));
    entry.records.push(site.line.record);
    entry.terms.push(site.term);
    entry.priority = Math.min(entry.priority, site.line.resolved.priority);
  }

  private survivingTerms(line: ActionLine, scenario: Scenario): Fact[][] {
    return line.terms.filter(term => this.literals.termAllows(term, scenario));
  }

  /** The filler choice, read both ways: a filler gated inside a state, and fillers gated outside it giving way to the one above them. */
  fillerRules(lines: ActionLine[], index: AbilityIndex, aura: AuraLookup): DraftSeed[] {
    const fillers = lines.filter(line => this.abilities.isFiller(line.record));
    return ([SINGLE_TARGET, CLEAVE] as Scenario[]).flatMap(scenario => {
      const live = fillers.filter(line => this.survivingTerms(line, scenario).length > 0);
      return [...this.insideFillerRules(live, scenario, index, aura), ...this.outsideFillerRules(live, index, aura)];
    });
  }

  private insideFillerRules(live: ActionLine[], scenario: Scenario, index: AbilityIndex, aura: AuraLookup): DraftSeed[] {
    const seeds: DraftSeed[] = [];
    for (const line of live) {
      const sites = this.survivingTerms(line, scenario).flatMap(term => this.gates.ownPositiveSelfAuras(term).map(token => ({ term, token })));
      for (const { term, token } of sites) {
        if (token === line.resolved.action) continue;
        const seed = this.fillerSeed(line, token, this.fillersBelow(line, token, live, scenario), this.gates.talentGate(term), index, aura);
        if (seed) seeds.push(seed);
      }
    }
    return seeds;
  }

  /** The fillers a state-gated line displaces: same pools, lower in priority, and pressable without that state. */
  private fillersBelow(line: ActionLine, token: string, live: ActionLine[], scenario: Scenario): ActionLine[] {
    return live.filter(other => other.resolved.priority > line.resolved.priority && other.record.id !== line.record.id
      && this.abilities.sameRole(line.record, other.record)
      && this.survivingTerms(other, scenario).some(entry => !this.gates.positiveSelfAuras(entry).includes(token)));
  }

  private outsideFillerRules(live: ActionLine[], index: AbilityIndex, aura: AuraLookup): DraftSeed[] {
    return live.flatMap(line => this.gates.negatedSelfAuras(line).flatMap(token => {
      const seed = this.outsideFillerSeed(line, token, live, index, aura);
      return seed ? [seed] : [];
    }));
  }

  /** The nearest same-pool filler above a state-excluded line that the state never excludes is the one pressed inside it. */
  private outsideFillerSeed(line: ActionLine, token: string, live: ActionLine[], index: AbilityIndex, aura: AuraLookup): DraftSeed | null {
    const excluded = new Set(live.filter(other => this.gates.negatedSelfAuras(other).includes(token)).map(other => other.record.id));
    const inside = live.filter(other => other.resolved.priority < line.resolved.priority && !excluded.has(other.record.id)
      && this.abilities.sameRole(line.record, other.record)).sort((a, b) => b.resolved.priority - a.resolved.priority)[0];
    if (!inside) return null;
    const alternatives = live.filter(other => excluded.has(other.record.id) && this.abilities.sameRole(inside.record, other.record));
    return this.fillerSeed(inside, token, alternatives, { requires: line.requires, excludes: line.excludes }, index, aura);
  }

  private fillerSeed(line: ActionLine, token: string, alternatives: ActionLine[], gate: TalentGate, index: AbilityIndex, aura: AuraLookup): DraftSeed | null {
    const buff = aura(token, 'self');
    const records = this.gates.distinct(alternatives.map(other => other.record));
    if (!buff || !records.length || !this.abilities.stateObserved(index, buff.id)) return null;
    const exceptTokens = new Set(alternatives.flatMap(other => other.terms.flatMap(term => this.gates.positiveSelfAuras(term))).filter(other => other !== token));
    const except = this.gates.distinct([...exceptTokens].map(other => aura(other, 'self')).filter((record): record is SpellRecord => record !== null));
    const condition: RuleCondition = {
      kind: 'filler_in_buff', ...this.gates.named(line.record),
      alternative_spell_ids: records.map(record => record.id), alternative_spell_names: records.map(record => record.name),
      buff_spell_id: buff.id, buff_spell_name: buff.name,
      except_buff_spell_ids: except.map(record => record.id), except_buff_spell_names: except.map(record => record.name),
    };
    return this.gates.seed(condition, line.resolved.priority, gate);
  }

  /** A proc the sources spend on sight: short-lived, not a cooldown's own aura, and consumed in the sampled parses more often than not. */
  procRules(groups: ActionGroup[], index: AbilityIndex, samples: ParseSample[], aura: AuraLookup): DraftSeed[] {
    const spenders = new Map<string, Accumulated>();
    const spendSites = groups.flatMap(group => this.gates.termSites(group.lines).flatMap(site =>
      this.gates.positiveSelfAuras(site.term).filter(token => token !== group.token).map(token => ({ token, site }))));
    for (const { token, site } of spendSites) this.accumulate(spenders, token, site);
    const seeds: DraftSeed[] = [];
    for (const [token, entry] of spenders) {
      const buff = aura(token, 'self');
      if (!buff || !this.isProc(buff, token, index)) continue;
      const spends = this.gates.distinct(entry.records);
      if (!this.consumedProc(buff.id, spends.map(record => record.id), samples, index)) continue;
      const condition: RuleCondition = {
        kind: 'proc_wasted', buff_spell_id: buff.id, buff_spell_name: buff.name,
        spend_spell_ids: spends.map(record => record.id), spend_spell_names: spends.map(record => record.name),
      };
      seeds.push(this.gates.seed(condition, entry.priority, this.gates.termGate(entry.terms)));
    }
    return seeds;
  }

  /** Short-lived, not a cooldown's own aura, and not a buff the parses keep up anyway: a maintained state is upkeep, not a proc. */
  private isProc(buff: SpellRecord, token: string, index: AbilityIndex): boolean {
    if (buff.durationS === null || buff.durationS > PROC_MAX_DURATION_S) return false;
    if ((index.observation.uptimeShare.get(buff.id) ?? 0) >= MAINTAINED_UPTIME_SHARE) return false;
    return !(index.byToken.get(token) ?? []).some(record => this.abilities.isMajorCooldown(record));
  }

  private consumedProc(buffId: number, spendIds: number[], samples: ParseSample[], index: AbilityIndex): boolean {
    const applications = index.observation.applications.get(buffId) ?? 0;
    if (applications < MIN_PROC_APPLICATIONS) return false;
    let spent = 0;
    for (const sample of samples) {
      const windows = this.auraWindows.buildAuraWindows(sample.buffs);
      spent += sample.casts.filter(cast => spendIds.includes(cast.abilityGameID) && this.auraWindows.auraUpAt(windows, buffId, cast.atS)).length;
    }
    return spent / applications >= CONSUMED_PROC_SHARE;
  }

  private maintainedAura(site: FactSite): { key: string; scope: 'self' | 'target' } | null {
    const { atom } = site.fact;
    if (atom.family !== 'aura') return null;
    const maintained = atom.field === 'refreshable' || atom.field === 'remains' || (atom.field === 'up' && site.fact.negated);
    return maintained ? { key: `${atom.scope}:${atom.token}`, scope: atom.scope } : null;
  }

  /** The keep-up family: an aura the APL refreshes or checks for absence, which the top parses in fact keep up most of the fight. */
  uptimeRules(lines: ActionLine[], index: AbilityIndex, aura: AuraLookup): DraftSeed[] {
    const candidates = new Map<string, Accumulated>();
    const scopes = new Map<string, 'self' | 'target'>();
    for (const site of this.gates.factSites(lines)) {
      const maintained = this.maintainedAura(site);
      if (!maintained) continue;
      this.accumulate(candidates, maintained.key, site);
      scopes.set(maintained.key, maintained.scope);
    }
    return [...candidates].flatMap(([key, entry]) => {
      const seed = this.uptimeSeed(key.slice(key.indexOf(':') + 1), scopes.get(key) ?? 'self', entry, index, aura);
      return seed ? [seed] : [];
    });
  }

  private uptimeSeed(token: string, scope: 'self' | 'target', entry: Accumulated, index: AbilityIndex, aura: AuraLookup): DraftSeed | null {
    if ((index.byToken.get(token) ?? []).some(record => this.abilities.isMajorCooldown(record))) return null;
    const record = aura(token, scope);
    const share = record ? index.observation.uptimeShare.get(record.id) ?? 0 : 0;
    if (!record || share < MAINTAINED_UPTIME_SHARE) return null;
    const condition: RuleCondition = { kind: 'aura_uptime_below', aura_spell_id: record.id, aura_spell_name: record.name, on: scope };
    return this.gates.seed(condition, entry.priority, this.gates.termGate(entry.terms));
  }

  private refreshFact(fact: Fact, ownTokens: Set<string>): boolean {
    return fact.atom.family === 'aura' && ownTokens.has(fact.atom.token) && !fact.negated
      && (fact.atom.field === 'refreshable' || fact.atom.field === 'remains');
  }

  /** Do-not-clip: a line that refreshes the action's own dot only when it is refreshable; the lines that refresh it regardless name the windows that suspend the rule. */
  clipRules(groups: ActionGroup[], aura: AuraLookup): DraftSeed[] {
    const seeds: DraftSeed[] = [];
    for (const group of groups) {
      const ownTokens = new Set([group.token, `${group.token}_dot`]);
      const refreshing = group.lines.filter(line => line.terms.some(term => term.some(fact => this.refreshFact(fact, ownTokens))));
      const fact = refreshing.flatMap(line => line.terms.flat()).find(entry => this.refreshFact(entry, ownTokens));
      if (fact?.atom.family !== 'aura') continue;
      const record = aura(fact.atom.token, fact.atom.scope);
      if (!record) continue;
      const except = this.exceptAuras(group.lines.filter(line => !refreshing.includes(line)), aura);
      const condition: RuleCondition = {
        kind: 'aura_clipped', aura_spell_id: record.id, aura_spell_name: record.name,
        cast_spell_id: group.record.id, cast_spell_name: group.record.name, on: fact.atom.scope,
        except_buff_spell_ids: except.map(entry => entry.id), except_buff_spell_names: except.map(entry => entry.name),
      };
      const priority = Math.min(...refreshing.map(line => line.resolved.priority));
      seeds.push(this.gates.seed(condition, priority, this.gates.termGate(refreshing.flatMap(line => line.terms))));
    }
    return seeds;
  }

  private exceptAuras(lines: ActionLine[], aura: AuraLookup): SpellRecord[] {
    const tokens = new Set(lines.flatMap(line => line.terms.flatMap(term => this.gates.positiveSelfAuras(term))));
    return this.gates.distinct([...tokens].map(token => aura(token, 'self')).filter((entry): entry is SpellRecord => entry !== null));
  }

  /** Readiness gates pair a cast with the cooldown it waits for; a far-away gate holds it for that cooldown instead. */
  cooldownPairingRules(groups: ActionGroup[], index: AbilityIndex): DraftSeed[] {
    const holds: DraftSeed[] = [];
    const pairings: DraftSeed[] = [];
    for (const group of groups.filter(entry => !this.abilities.isFiller(entry.record))) {
      for (const site of this.gates.factSites(group.lines)) {
        const seed = this.pairingSeed(group, site, index);
        if (seed) (seed.condition.kind === 'hold_cooldown_for_anchor' ? holds : pairings).push(seed);
      }
    }
    const held = new Set(holds.map(seed => (seed.condition.kind === 'hold_cooldown_for_anchor'
      ? `${seed.condition.spell_ids[0] ?? 0}:${seed.condition.anchor_spell_id}` : '')));
    return [...holds, ...pairings.filter(seed => seed.condition.kind === 'cast_without_prior'
      && !held.has(`${seed.condition.spell_id}:${seed.condition.required_spell_id}`))];
  }

  private pairingSeed(group: ActionGroup, site: FactSite, index: AbilityIndex): DraftSeed | null {
    const { atom } = site.fact;
    if (atom.family !== 'cooldown' || atom.token === group.token) return null;
    const anchor = this.abilities.cast(index, atom.token);
    if (!anchor || !this.abilities.isMajorCooldown(anchor)) return null;
    const condition = this.pairingCondition(group.record, anchor, atom, site.fact.negated);
    return condition ? this.gates.seed(condition, site.line.resolved.priority, this.gates.talentGate(site.term)) : null;
  }

  private pairingCondition(record: SpellRecord, anchor: SpellRecord, atom: Atom & { family: 'cooldown' }, negated: boolean): RuleCondition | null {
    const timing = atom.field === 'remains' ? this.remainsTiming(atom) : atom.field === 'other' ? null : 'ready';
    if (timing === 'far' && !negated) {
      return { kind: 'hold_cooldown_for_anchor', spell_ids: [record.id], spell_names: [record.name], anchor_spell_id: anchor.id, anchor_spell_name: anchor.name };
    }
    if (timing !== 'ready') return null;
    return { kind: 'cast_without_prior', ...this.gates.named(record), required_spell_id: anchor.id, required_spell_name: anchor.name, position: negated ? 'before' : 'after' };
  }

  /** Time left above a number holds the cast for the anchor; time left below one is the anchor about to be ready. */
  private remainsTiming(atom: Atom & { family: 'cooldown' }): 'far' | 'ready' | null {
    if (atom.op === '>' || atom.op === '>=') return 'far';
    return atom.op === '<' || atom.op === '<=' ? 'ready' : null;
  }
}
