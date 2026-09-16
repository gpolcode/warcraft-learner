import { Injectable, inject } from '@angular/core';
import { FALSE, SimcExpressionService, TRUE, UNKNOWN, type AplResolver } from './simc-expression-service';
import { AplVocabularyService } from './apl-vocabulary-service';
import type { AplExpr, AplGap, AplGapKind, AplLine, AplSource, ResolvedAction, ResolvedApl } from './simc.models';

const ACTION_LINE = /^actions(?:\.([A-Za-z0-9_]+))?\+?=\/?(.*)$/;
const ACTION_PREFIX = 'actions';
const DEFAULT_LIST = '';
/** How the gap report names the unnamed default list. */
const DEFAULT_LIST_LABEL = 'default';
const VARIABLE_ACTIONS = new Set(['variable', 'cycling_variable']);
const BOOKKEEPING_ACTIONS = new Set([...VARIABLE_ACTIONS, 'snapshot_stats']);

interface VariableDefinition {
  op: string;
  value: AplExpr | null;
  valueElse: AplExpr | null;
  gate: AplExpr | null;
}

/** What one resolve could not place, and which heads it touched, for the build report. */
interface Audit {
  gaps: Map<string, AplGap>;
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

  /** Every `actions` line as written; one the reader cannot split is kept whole so the resolve can report it. */
  parse(text: string): AplSource {
    const source: AplSource = { lines: [], unparsed: [] };
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      const match = ACTION_LINE.exec(line);
      if (match) {
        const [action, ...rest] = (match[2] ?? '').split(',');
        source.lines.push({ list: match[1] ?? DEFAULT_LIST, action: action ?? '', options: this.optionsOf(rest) });
      } else if (line.startsWith(ACTION_PREFIX)) {
        source.unparsed.push(line);
      }
    }
    return source;
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
  resolve(source: AplSource, setBonusToken: string): ResolvedApl {
    const audit: Audit = { gaps: new Map(), heads: new Set() };
    for (const line of source.unparsed) this.note(audit, 'line', line);
    const variables = this.variableDefinitions(source.lines, audit);
    this.auditOptions(source.lines, audit);
    const inlined = new Map<string, AplExpr>();
    // A definition that reads its own earlier value, directly or through a cycle, is a running value: unknown, like a running op.
    const inlineVariable = (name: string, visiting: readonly string[]): AplExpr => {
      const cached = inlined.get(name);
      if (cached) return cached;
      const definitions = variables.get(name);
      if (!definitions) { this.note(audit, 'variable', name); return UNKNOWN; }
      if (visiting.includes(name)) return UNKNOWN;
      const resolver = this.resolver(setBonusToken, null, inner => inlineVariable(inner, [...visiting, name]), audit);
      const result = this.inlineDefinitions(definitions, resolver);
      if (result === null) return UNKNOWN;
      inlined.set(name, result);
      return result;
    };
    const byList = new Map<string, AplLine[]>();
    for (const line of source.lines) {
      const list = byList.get(line.list) ?? [];
      list.push(line);
      byList.set(line.list, list);
    }
    const walk: Walk = { byList, actions: [], audit, resolverFor: action => this.resolver(setBonusToken, action, name => inlineVariable(name, []), audit) };
    this.walkList(walk, DEFAULT_LIST, [], []);
    return {
      actions: walk.actions,
      gaps: [...audit.gaps.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.token.localeCompare(b.token)),
      referencedHeads: [...audit.heads].sort(),
    };
  }

  private note(audit: Audit, kind: AplGapKind, token: string): void {
    audit.gaps.set(`${kind}:${token}`, { kind, token });
  }

  private auditOptions(lines: AplLine[], audit: Audit): void {
    for (const line of lines) {
      for (const key of Object.keys(line.options)) if (!this.vocabulary.option(key)) this.note(audit, 'option', key);
    }
  }

  /** Later sets override earlier ones under their own gate, so the chain reads as nested if-then-else; null for a running op, which the inventory lists as read as unknown. */
  private inlineDefinitions(definitions: VariableDefinition[], resolver: AplResolver): AplExpr | null {
    let result: AplExpr = FALSE;
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
    if (visiting.includes(list)) return;
    const lines = walk.byList.get(list);
    if (!lines) { this.note(walk.audit, 'list', list || DEFAULT_LIST_LABEL); return; }
    const carried = [...context];
    for (const line of lines) {
      if (!this.walkLine(walk, line, carried, [...visiting, list])) return;
    }
  }

  /** False once a line ends the list: nothing after an unconditional run_action_list is reachable. */
  private walkLine(walk: Walk, line: AplLine, carried: AplExpr[], visiting: string[]): boolean {
    const gate = this.reachableGate(walk, line);
    if (gate === 'skip') return true;
    if (!this.isListCall(line)) {
      walk.actions.push({ action: line.action, own: gate, context: [...carried], priority: walk.actions.length });
      return true;
    }
    this.walkList(walk, line.options['name'] ?? '', gate ? [...carried, gate] : carried, visiting);
    return this.reachableAfter(line, gate, carried);
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
    const expr = this.expressions.parse(source);
    if (!expr) this.note(audit, 'syntax', source);
    return expr ?? UNKNOWN;
  }

  private simplifyOrUnknown(expr: AplExpr | null, resolver: AplResolver): AplExpr {
    return expr ? this.expressions.simplify(expr, resolver) : UNKNOWN;
  }

  private ifThenElse(gate: AplExpr | null, value: AplExpr | null, otherwise: AplExpr | null, resolver: AplResolver): AplExpr {
    const condition = gate ? this.expressions.simplify(gate, resolver) : TRUE;
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
      if (!VARIABLE_ACTIONS.has(line.action) || !name) continue;
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
      if (head === 'set_bonus') return (second ?? '').startsWith(setBonusToken) ? TRUE : FALSE;
      return this.resolveSymbol(path, action, audit);
    };
  }

  /** An inventoried leaf is erased or kept symbolic as its entry says; one outside the inventory stays symbolic and is reported. */
  private resolveSymbol(path: readonly string[], action: string | null, audit: Audit): AplExpr | null {
    const [head = ''] = path;
    const family = path.length === 1 ? this.vocabulary.actionRelative(head) : null;
    if (family) {
      audit.heads.add(family);
      return action === null ? UNKNOWN : { kind: 'ref', path: [family, action, head] };
    }
    audit.heads.add(head);
    const entry = this.vocabulary.expression(path);
    if (!entry) {
      this.note(audit, 'expression', this.vocabulary.shape(path));
      return null;
    }
    return entry.support === 'erased' ? UNKNOWN : null;
  }
}
