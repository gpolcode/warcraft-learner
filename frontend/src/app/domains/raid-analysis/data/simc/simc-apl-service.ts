import { Injectable, inject } from '@angular/core';
import { SimcExpressionService, UNKNOWN, type AplResolver } from './simc-expression-service';
import { AplVocabularyService } from './apl-vocabulary-service';
import type { AplExpr, AplLine, AplUnknownToken, AplUnknownTokenKind, ResolvedAction, ResolvedApl } from './simc.models';

const ACTION_LINE = /^actions(?:\.([a-z0-9_]+))?\+?=\/?(.*)$/;
const DEFAULT_LIST = '';
const BOOKKEEPING_ACTIONS = new Set(['variable', 'snapshot_stats']);

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

/** What one resolve could not place, and which heads it touched, for the build report. */
interface Audit {
  unknown: Map<string, AplUnknownToken>;
  heads: Set<string>;
}

interface Walk {
  byList: Map<string, AplLine[]>;
  actions: ResolvedAction[];
  resolverFor: (action: string) => AplResolver;
  audit: Audit;
}

@Injectable({ providedIn: 'root' })
export class SimcAplService {
  private readonly expressions = inject(SimcExpressionService);
  private readonly vocabulary = inject(AplVocabularyService);

  parseLines(text: string): AplLine[] {
    const lines: AplLine[] = [];
    for (const raw of text.split('\n')) {
      const match = ACTION_LINE.exec(raw.trim());
      if (!match) continue;
      const [action, ...rest] = (match[2] ?? '').split(',');
      lines.push({ list: match[1] ?? DEFAULT_LIST, action: action ?? '', options: this.optionsOf(rest) });
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
    const audit: Audit = { unknown: new Map(), heads: new Set() };
    const unresolvedVariables = new Set<string>();
    const variables = this.variableDefinitions(lines, audit);
    this.auditOptions(lines, audit);
    const inlined = new Map<string, AplExpr>();
    const inlineVariable = (name: string, depth: number): AplExpr => {
      const cached = inlined.get(name);
      if (cached) return cached;
      const definitions = variables.get(name);
      if (!definitions || depth > MAX_INLINE_DEPTH) { unresolvedVariables.add(name); return UNKNOWN; }
      const resolver = this.resolver(setBonusToken, null, inner => inlineVariable(inner, depth + 1), audit);
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
    const walk: Walk = { byList, actions: [], audit, resolverFor: action => this.resolver(setBonusToken, action, name => inlineVariable(name, 0), audit) };
    this.walkList(walk, DEFAULT_LIST, [], []);
    return {
      actions: walk.actions, unresolvedVariables: [...unresolvedVariables].sort(),
      unknownTokens: [...audit.unknown.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.token.localeCompare(b.token)),
      referencedHeads: [...audit.heads].sort(),
    };
  }

  private note(audit: Audit, kind: AplUnknownTokenKind, token: string): void {
    const key = `${kind}:${token}`;
    const existing = audit.unknown.get(key);
    if (existing) existing.count += 1;
    else audit.unknown.set(key, { kind, token, count: 1 });
  }

  private auditOptions(lines: AplLine[], audit: Audit): void {
    for (const line of lines) {
      for (const key of Object.keys(line.options)) if (!this.vocabulary.option(key)) this.note(audit, 'option', key);
    }
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
        walk.actions.push({ action: line.action, own: gate, context: [...carried], priority: walk.actions.length });
      }
    }
  }

  /** Bookkeeping lines and lines whose gate folded to false never execute. */
  private reachableGate(walk: Walk, line: AplLine): AplExpr | null | 'skip' {
    if (BOOKKEEPING_ACTIONS.has(line.action)) return 'skip';
    const gate = this.gateOf(line, walk.resolverFor(line.action), walk.audit);
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

  private gateOf(line: AplLine, resolver: AplResolver, audit: Audit): AplExpr | null {
    const source = line.options['if'];
    if (source === undefined) return null;
    const simplified = this.simplifyOrUnknown(this.parseOrUnknown(source, audit), resolver);
    return simplified.kind === 'unknown' ? null : simplified;
  }

  private parseOrUnknown(source: string, audit: Audit): AplExpr {
    try {
      return this.expressions.parse(source);
    } catch {
      this.note(audit, 'syntax', source);
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

  private variableDefinitions(lines: AplLine[], audit: Audit): Map<string, VariableDefinition[]> {
    const variables = new Map<string, VariableDefinition[]>();
    for (const line of lines) {
      const name = line.options['name'];
      if (line.action !== 'variable' || !name) continue;
      const op = line.options['op'] ?? 'set';
      if (!this.vocabulary.variableOp(op)) this.note(audit, 'variable_op', op);
      const parse = (option: string): AplExpr | null => {
        const source = line.options[option];
        return source === undefined ? null : this.parseOrUnknown(source, audit);
      };
      const definitions = variables.get(name) ?? [];
      definitions.push({
        op,
        value: parse('value') ?? parse('default'),
        valueElse: parse('value_else'),
        gate: op === 'setif' ? parse('condition') : parse('if'),
      });
      variables.set(name, definitions);
    }
    return variables;
  }

  /** What each reference means at build time; `action` names the line whose bare `refreshable` / `remains` refer to its own dot. */
  private resolver(setBonusToken: string, action: string | null, inlineVariable: (name: string) => AplExpr, audit: Audit): AplResolver {
    return path => {
      const [head, second] = path;
      if (head === undefined) return UNKNOWN;
      if (head === 'variable') return second === undefined ? UNKNOWN : inlineVariable(second);
      if (head === 'set_bonus') return { kind: 'num', value: (second ?? '').startsWith(setBonusToken) ? 1 : 0 };
      return this.resolveSymbol(path, action, audit);
    };
  }

  /** An inventoried leaf is erased or kept symbolic as its entry says; one outside the inventory stays symbolic and is reported. */
  private resolveSymbol(path: readonly string[], action: string | null, audit: Audit): AplExpr | null {
    const [head = ''] = path;
    if (path.length === 1 && (ACTION_RELATIVE_DOT_FIELDS.has(head) || ACTION_RELATIVE_COOLDOWN_FIELDS.has(head))) {
      audit.heads.add(ACTION_RELATIVE_DOT_FIELDS.has(head) ? 'dot' : 'cooldown');
      return this.resolveActionRelative(head, action);
    }
    audit.heads.add(head);
    const entry = this.vocabulary.expression(path);
    if (!entry) {
      this.note(audit, 'expression', this.vocabulary.shape(path));
      return null;
    }
    return entry.support === 'erased' ? UNKNOWN : null;
  }

  private resolveActionRelative(field: string, action: string | null): AplExpr {
    const family = ACTION_RELATIVE_DOT_FIELDS.has(field) ? 'dot' : 'cooldown';
    return action === null ? UNKNOWN : { kind: 'ref', path: [family, action, field] };
  }
}
