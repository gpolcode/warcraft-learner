import { Injectable, inject } from '@angular/core';
import { SimcExpressionService, UNKNOWN, type AplResolver } from './simc-expression-service';
import type { AplExpr, AplLine, ResolvedAction, ResolvedApl } from './simc.models';

const ACTION_LINE = /^actions(?:\.([a-z0-9_]+))?\+?=\/?(.*)$/;
const DEFAULT_LIST = '';
const PRECOMBAT_LIST = 'precombat';
const BOOKKEEPING_ACTIONS = new Set(['variable', 'snapshot_stats']);

/** Leaves the builder cannot know: fight length, gear, sim bookkeeping. They erase as the identity of the operator above them. */
const NEUTRAL_HEADS = new Set([
  'fight_remains', 'time_to_die', 'raid_event', 'raid_events', 'fight_style', 'time', 'prev_gcd', 'prev', 'prev_off_gcd',
  'gcd', 'trinket', 'equipped', 'main_hand', 'off_hand', 'desired_targets', 'druid', 'boss', 'expected_combat_length',
  'cycle_enemies', 'movement', 'spell_haste', 'attack_haste', 'haste', 'toggle', 'level', 'race', 'role', 'action',
  'cast_time', 'execute_time', 'pet', 'active_dot', 'active_dots', 'stealthed', 'incoming_damage_5s', 'ptr', 'hyperthread_wrapper',
  'priority_rotation', 'cycle_targets', 'max_energy',
]);

/** Resource sub-fields the rule kinds can judge; anything else on a resource (regen, time to max) is sim arithmetic. */
const RESOURCE_FIELDS = new Set(['pct', 'deficit', 'max']);
const RESOURCE_HEADS = new Set([
  'mana', 'rage', 'focus', 'energy', 'combo_points', 'rune', 'runic_power', 'soul_shard', 'soul_shards', 'astral_power',
  'holy_power', 'maelstrom', 'chi', 'insanity', 'fury', 'pain', 'essence', 'arcane_charges',
]);

/** Bare fields inside an action's own gate refer to that action's dot or aura, or to its own cooldown. */
const ACTION_RELATIVE_DOT_FIELDS = new Set(['refreshable', 'remains', 'ticking', 'pmultiplier', 'duration', 'in_flight']);
const ACTION_RELATIVE_COOLDOWN_FIELDS = new Set(['charges', 'charges_fractional', 'full_recharge_time', 'recharge_time']);

const MAX_INLINE_DEPTH = 6;

interface VariableDefinition {
  op: string;
  value: AplExpr | null;
  valueElse: AplExpr | null;
  gate: AplExpr | null;
}

interface Walk {
  byList: Map<string, AplLine[]>;
  actions: ResolvedAction[];
  resolverFor: (action: string) => AplResolver;
}

@Injectable({ providedIn: 'root' })
export class SimcAplService {
  private readonly expressions = inject(SimcExpressionService);

  parseLines(text: string): AplLine[] {
    const lines: AplLine[] = [];
    for (const raw of text.split('\n')) {
      const match = ACTION_LINE.exec(raw.trim());
      if (!match) continue;
      const [action, ...rest] = (match[2] ?? '').split(',');
      lines.push({ list: match[1] ?? DEFAULT_LIST, action: action ?? '', options: this.optionsOf(rest), index: lines.length });
    }
    return lines;
  }

  private optionsOf(entries: string[]): Record<string, string> {
    const options: Record<string, string> = {};
    for (const option of entries) {
      const equals = option.indexOf('=');
      if (equals === -1) options[option] = '1';
      else options[option.slice(0, equals)] = option.slice(equals + 1);
    }
    return options;
  }

  /** Flattens the list tree into one priority order with variables inlined; `setBonusToken` names the tier whose bonuses count as worn. */
  resolve(lines: AplLine[], setBonusToken: string): ResolvedApl {
    const unresolvedVariables = new Set<string>();
    const variables = this.variableDefinitions(lines);
    const inlined = new Map<string, AplExpr>();
    const inlineVariable = (name: string, depth: number): AplExpr => {
      const cached = inlined.get(name);
      if (cached) return cached;
      const definitions = variables.get(name);
      if (!definitions || depth > MAX_INLINE_DEPTH) { unresolvedVariables.add(name); return UNKNOWN; }
      const resolver = this.resolver(setBonusToken, null, inner => inlineVariable(inner, depth + 1));
      const result = this.inlineDefinitions(definitions, resolver);
      if (result === null) { unresolvedVariables.add(name); return UNKNOWN; }
      inlined.set(name, result);
      return result;
    };
    const byList = new Map<string, AplLine[]>();
    for (const line of lines) {
      const list = byList.get(line.list) ?? [];
      list.push(line);
      byList.set(line.list, list);
    }
    const walk: Walk = { byList, actions: [], resolverFor: action => this.resolver(setBonusToken, action, name => inlineVariable(name, 0)) };
    this.walkList(walk, DEFAULT_LIST, [], []);
    const precombat = (byList.get(PRECOMBAT_LIST) ?? [])
      .filter(line => !BOOKKEEPING_ACTIONS.has(line.action))
      .map(line => line.action);
    return { actions: walk.actions, precombat, unresolvedVariables: [...unresolvedVariables].sort() };
  }

  /** Later sets override earlier ones under their own gate, so the chain reads as nested if-then-else; null for an op the builder cannot follow. */
  private inlineDefinitions(definitions: VariableDefinition[], resolver: AplResolver): AplExpr | null {
    let result: AplExpr = { kind: 'num', value: 0 };
    for (const definition of definitions) {
      if (definition.op === 'setif') {
        result = this.ifThenElse(definition.gate, definition.value, definition.valueElse, resolver);
      } else if (definition.op === 'set') {
        result = definition.gate ? this.ifThenElse(definition.gate, definition.value, result, resolver) : this.simplifyOrUnknown(definition.value, resolver);
      } else {
        return null;
      }
    }
    return result;
  }

  private walkList(walk: Walk, list: string, context: AplExpr[], visiting: string[]): void {
    if (visiting.includes(list) || visiting.length > MAX_INLINE_DEPTH) return;
    const carried = [...context];
    for (const line of walk.byList.get(list) ?? []) {
      const gate = this.reachableGate(walk, line);
      if (gate === 'skip') continue;
      if (this.isListCall(line)) {
        this.walkList(walk, line.options['name'] ?? '', gate ? [...carried, gate] : carried, [...visiting, list]);
        if (!this.reachableAfter(line, gate, carried)) return;
      } else {
        walk.actions.push({ action: line.action, list, options: line.options, own: gate, context: [...carried], priority: walk.actions.length });
      }
    }
  }

  /** Bookkeeping lines and lines whose gate folded to false never execute. */
  private reachableGate(walk: Walk, line: AplLine): AplExpr | null | 'skip' {
    if (BOOKKEEPING_ACTIONS.has(line.action)) return 'skip';
    const gate = this.gateOf(line, walk.resolverFor(line.action));
    return gate?.kind === 'num' && gate.value === 0 ? 'skip' : gate;
  }

  private isListCall(line: AplLine): boolean {
    return line.action === 'call_action_list' || line.action === 'run_action_list';
  }

  /** A run_action_list never returns: what follows it is reachable only when its gate failed, and never after an unconditional one. */
  private reachableAfter(line: AplLine, gate: AplExpr | null, carried: AplExpr[]): boolean {
    if (line.action !== 'run_action_list') return true;
    if (!gate) return false;
    carried.push({ kind: 'not', arg: gate });
    return true;
  }

  private gateOf(line: AplLine, resolver: AplResolver): AplExpr | null {
    const source = line.options['if'];
    if (source === undefined) return null;
    const simplified = this.simplifyOrUnknown(this.parseOrUnknown(source), resolver);
    return simplified.kind === 'unknown' ? null : simplified;
  }

  private parseOrUnknown(source: string): AplExpr {
    try {
      return this.expressions.parse(source);
    } catch {
      return UNKNOWN;
    }
  }

  private simplifyOrUnknown(expr: AplExpr | null, resolver: AplResolver): AplExpr {
    return expr ? this.expressions.simplify(expr, resolver) : UNKNOWN;
  }

  private ifThenElse(gate: AplExpr | null, value: AplExpr | null, otherwise: AplExpr | null, resolver: AplResolver): AplExpr {
    const condition = gate ? this.expressions.simplify(gate, resolver) : { kind: 'num' as const, value: 1 };
    const then = this.simplifyOrUnknown(value, resolver);
    const fallback = this.simplifyOrUnknown(otherwise, resolver);
    const chosen: AplExpr = {
      kind: 'bin', op: '|',
      left: { kind: 'bin', op: '&', left: condition, right: then },
      right: { kind: 'bin', op: '&', left: { kind: 'not', arg: condition }, right: fallback },
    };
    return this.expressions.simplify(chosen, () => null);
  }

  private variableDefinitions(lines: AplLine[]): Map<string, VariableDefinition[]> {
    const variables = new Map<string, VariableDefinition[]>();
    for (const line of lines) {
      const name = line.options['name'];
      if (line.action !== 'variable' || !name) continue;
      const parse = (option: string): AplExpr | null => {
        const source = line.options[option];
        return source === undefined ? null : this.parseOrUnknown(source);
      };
      const definitions = variables.get(name) ?? [];
      definitions.push({
        op: line.options['op'] ?? 'set',
        value: parse('value') ?? parse('default'),
        valueElse: parse('value_else'),
        gate: line.options['op'] === 'setif' ? parse('condition') : parse('if'),
      });
      variables.set(name, definitions);
    }
    return variables;
  }

  /** What each reference means at build time; `action` names the line whose bare `refreshable` / `remains` refer to its own dot. */
  private resolver(setBonusToken: string, action: string | null, inlineVariable: (name: string) => AplExpr): AplResolver {
    return path => {
      const [head, second] = path;
      if (head === undefined) return UNKNOWN;
      if (head === 'variable') return second === undefined ? UNKNOWN : inlineVariable(second);
      if (head === 'set_bonus') return { kind: 'num', value: (second ?? '').startsWith(setBonusToken) ? 1 : 0 };
      return this.resolveSymbol(path, action);
    };
  }

  private resolveSymbol(path: readonly string[], action: string | null): AplExpr | null {
    const [head = '', second] = path;
    if (NEUTRAL_HEADS.has(head)) return UNKNOWN;
    if (head === 'target') return second === 'health' ? null : UNKNOWN;
    if (RESOURCE_HEADS.has(head)) return second === undefined || RESOURCE_FIELDS.has(second) ? null : UNKNOWN;
    return path.length === 1 ? this.resolveActionRelative(head, action) : null;
  }

  private resolveActionRelative(field: string, action: string | null): AplExpr | null {
    const family = ACTION_RELATIVE_DOT_FIELDS.has(field) ? 'dot' : ACTION_RELATIVE_COOLDOWN_FIELDS.has(field) ? 'cooldown' : null;
    if (family === null) return null;
    return action === null ? UNKNOWN : { kind: 'ref', path: [family, action, field] };
  }
}
