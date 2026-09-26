import { Injectable } from '@angular/core';
import jsep from 'jsep';
import { getOrInsert } from '../analysis/analysis-math';
import type { PlanLine, PlanVariable } from '../plan/plan.models';

export type AplNode = jsep.Expression;

interface AplEntry {
  action: string;
  options: Record<string, string>;
}

export interface AplRead {
  lines: PlanLine[];
  variables: PlanVariable[];
}

interface AplWalk {
  lists: Map<string, AplEntry[]>;
  substitutes: ReadonlyMap<string, AplNode>;
  lines: PlanLine[];
  variables: PlanVariable[];
  precombat: boolean;
}

// SimulationCraft's own order (engine/sim/expressions.cpp): `%` divides, `%%` is the remainder, `<?` and `>?` are max and min.
const BINARY_PRECEDENCE: Record<string, number> = {
  '|': 1, '&': 2,
  '=': 3, '==': 3, '!=': 3, '<': 3, '<=': 3, '>': 3, '>=': 3,
  '<?': 4, '>?': 4, '+': 5, '-': 5, '*': 6, '%': 6, '%%': 6,
};
for (const op of Object.keys(jsep.binary_ops)) jsep.removeBinaryOp(op);
for (const op of Object.keys(jsep.unary_ops)) jsep.removeUnaryOp(op);
for (const [op, precedence] of Object.entries(BINARY_PRECEDENCE)) jsep.addBinaryOp(op, precedence);
for (const op of ['!', '-']) jsep.addUnaryOp(op);
jsep.addIdentifierChar('.');

const LINE = /^actions(?:\.(\w+))?\+?=\/?(.*)$/;
const LIST_CALLS = new Set(['call_action_list', 'run_action_list']);
const NON_SPELL = new Set([
  'auto_attack', 'snapshot_stats', 'potion', 'use_items', 'use_item', 'invoke_external_buff', 'pool_resource', 'wait',
  'cancel_buff', 'retarget_auto_attack', 'flask', 'food', 'augmentation', 'summon_pet', 'cancel_action',
]);
/** `min:` and `max:` only rank the targets; any other `target_if` skips the line when no target satisfies it. */
const TARGET_RANKING = /^(min|max):/;
const MAX_VARIABLE_DEPTH = 3;

@Injectable({ providedIn: 'root' })
export class SimcAplService {
  /** `expressions` stand in for names SimC's class code computes, as SimC text over names a log can answer. */
  readApl(simc: string, expressions: ReadonlyMap<string, string> = new Map()): AplRead {
    const lists = this.parseLists(simc);
    const substitutes = this.substitutes(this.variableExpressions([...lists.values()].flat()), expressions);
    const precombat: AplWalk = { lists, substitutes, lines: [], variables: [], precombat: true };
    const combat: AplWalk = { ...precombat, variables: [], precombat: false };
    this.walk(precombat, 'precombat', [], new Set());
    this.walk(combat, 'default', [], new Set());
    return { lines: combat.lines, variables: this.referenced([...precombat.variables, ...combat.variables], combat.lines) };
  }

  /** A term as the plan stores it; null for one jsep cannot read, which then reads as unknown. */
  parse(term: string): AplNode | null {
    try {
      return jsep(term);
    } catch {
      return null;
    }
  }

  /** SimC text that parses back to the same tree, bracketed only where precedence needs it. */
  print(node: AplNode): string {
    if (node.type === 'Literal') return String((node as jsep.Literal).value);
    if (node.type === 'Identifier') return (node as jsep.Identifier).name;
    if (node.type === 'UnaryExpression') {
      const { operator, argument } = node as jsep.UnaryExpression;
      return `${operator}${argument.type === 'BinaryExpression' ? `(${this.print(argument)})` : this.print(argument)}`;
    }
    if (node.type === 'CallExpression') {
      const { callee, arguments: args } = node as jsep.CallExpression;
      return `${this.print(callee)}(${args.map(argument => this.print(argument)).join(',')})`;
    }
    if (node.type !== 'BinaryExpression') throw new Error(`no SimC form for a ${node.type}`);
    const { operator, left, right } = node as jsep.BinaryExpression;
    const precedence = BINARY_PRECEDENCE[operator] ?? 0;
    // Every SimC operator groups left to right, so only a right operand of equal precedence needs brackets.
    const side = (operand: AplNode, tie: boolean): string => {
      const inner = operand.type === 'BinaryExpression' ? BINARY_PRECEDENCE[(operand as jsep.BinaryExpression).operator] ?? 0 : Infinity;
      return inner < precedence || (tie && inner === precedence) ? `(${this.print(operand)})` : this.print(operand);
    };
    return `${side(left, false)}${operator}${side(right, true)}`;
  }

  identifiers(node: AplNode): string[] {
    if (node.type === 'Identifier') return [(node as jsep.Identifier).name];
    return this.children(node).flatMap(child => this.identifiers(child));
  }

  /** The operands of a chain of one binary operator, so `a&(b&c)` yields three terms. */
  operands(node: AplNode, operator: string): AplNode[] {
    if (node.type !== 'BinaryExpression' || (node as jsep.BinaryExpression).operator !== operator) return [node];
    const { left, right } = node as jsep.BinaryExpression;
    return [...this.operands(left, operator), ...this.operands(right, operator)];
  }

  private children(node: AplNode): AplNode[] {
    if (node.type === 'BinaryExpression') return [(node as jsep.BinaryExpression).left, (node as jsep.BinaryExpression).right];
    if (node.type === 'UnaryExpression') return [(node as jsep.UnaryExpression).argument];
    if (node.type === 'CallExpression') return (node as jsep.CallExpression).arguments;
    return [];
  }

  private parseLists(simc: string): Map<string, AplEntry[]> {
    const lists = new Map<string, AplEntry[]>();
    for (const raw of simc.split('\n')) {
      const match = LINE.exec(raw.trim());
      if (!match) continue;
      const [action = '', ...pairs] = (match[2] ?? '').split(',');
      const options = Object.fromEntries(pairs.map(pair => [pair.slice(0, pair.indexOf('=')), pair.slice(pair.indexOf('=') + 1)]));
      getOrInsert(lists, match[1] ?? 'default', () => []).push({ action, options });
    }
    return lists;
  }

  /** A variable set once and unconditionally is its expression, and a 1/0 `setif` is its condition; any other variable stays sim state. */
  private variableExpressions(entries: AplEntry[]): Map<string, string> {
    const definitions = new Map<string, Record<string, string>[]>();
    for (const { action, options } of entries) {
      if (action === 'variable') getOrInsert(definitions, options['name'] ?? '', () => []).push(options);
    }
    const expressions = new Map<string, string>();
    for (const [name, [only, ...more]] of definitions) {
      const expression = only && !more.length && !only['if'] ? this.variableExpression(only) : null;
      if (expression) expressions.set(name, expression);
    }
    return expressions;
  }

  private variableExpression(options: Record<string, string>): string | null {
    const { op = 'set', value, condition } = options;
    if (op === 'set') return value ?? null;
    if (op !== 'setif' || !condition) return null;
    const flags = `${value ?? ''}/${options['value_else'] ?? ''}`;
    return flags === '1/0' ? condition : flags === '0/1' ? `!(${condition})` : null;
  }

  private substitutes(variables: Map<string, string>, expressions: ReadonlyMap<string, string>): Map<string, AplNode> {
    const texts = [...[...variables].map(([name, text]) => [`variable.${name}`, text] as const), ...expressions];
    return new Map(texts.flatMap(([name, text]) => {
      const node = this.parse(this.normalized(text));
      return node ? [[name, node] as const] : [];
    }));
  }

  private substitute(node: AplNode, substitutes: ReadonlyMap<string, AplNode>, depth = 0): AplNode {
    const swap = node.type === 'Identifier' ? substitutes.get((node as jsep.Identifier).name) : undefined;
    if (swap) return depth < MAX_VARIABLE_DEPTH ? this.substitute(swap, substitutes, depth + 1) : node;
    if (node.type === 'BinaryExpression') {
      const binary = node as jsep.BinaryExpression;
      return { ...binary, left: this.substitute(binary.left, substitutes, depth), right: this.substitute(binary.right, substitutes, depth) };
    }
    if (node.type === 'CallExpression') {
      const call = node as jsep.CallExpression;
      return { ...call, arguments: call.arguments.map(argument => this.substitute(argument, substitutes, depth)) };
    }
    if (node.type !== 'UnaryExpression') return node;
    return { ...node, argument: this.substitute((node as jsep.UnaryExpression).argument, substitutes, depth) };
  }

  private normalized(text: string): string {
    return text.replace(/&&/g, '&').replace(/\|\|/g, '|');
  }

  /** Only a variable a line reads, or one such a variable reads, needs replaying. */
  private referenced(variables: PlanVariable[], lines: PlanLine[]): PlanVariable[] {
    const reads = (texts: (string | undefined)[]): string[] => texts.flatMap(text => [...(text ?? '').matchAll(/variable\.(\w+)/g)].map(([, name = '']) => name));
    const wanted = new Set(reads(lines.flatMap(line => line.terms ?? [])));
    for (let size = -1; size !== wanted.size;) {
      size = wanted.size;
      const reached = variables.filter(variable => wanted.has(variable.name));
      for (const name of reads(reached.flatMap(({ value, value_else, condition, terms }) => [value, value_else, condition, ...(terms ?? [])]))) wanted.add(name);
    }
    return variables.filter(variable => wanted.has(variable.name));
  }

  private walk(context: AplWalk, list: string, inherited: AplNode[] | null, seen: Set<string>): void {
    if (seen.has(list)) return;
    let reached = inherited;
    for (const entry of context.lists.get(list) ?? []) {
      const own = this.gateTerms(entry.options, context.substitutes);
      this.visit(context, entry, own && reached && [...reached, ...own], new Set([...seen, list]));
      if (entry.action !== 'run_action_list') continue;
      if (own?.length === 0) return;
      reached = this.afterRun(reached, own);
    }
  }

  private visit(context: AplWalk, { action, options }: AplEntry, terms: AplNode[] | null, seen: Set<string>): void {
    if (LIST_CALLS.has(action)) this.walk(context, options['name'] ?? '', terms, seen);
    else if (action === 'variable' || action === 'cycling_variable') this.variable(context, options, terms);
    else if (!NON_SPELL.has(action) && !context.precombat) context.lines.push(this.line(action, terms, options['line_cd']));
  }

  private variable(context: AplWalk, options: Record<string, string>, terms: AplNode[] | null): void {
    const { name = '', op = 'set', value, value_else, condition } = options;
    if (!name || context.substitutes.has(`variable.${name}`)) return;
    const expression = (text: string | undefined): string | undefined => {
      const node = text === undefined ? null : this.parse(this.normalized(text));
      return node ? this.printed([this.substitute(node, context.substitutes)])?.[0] : undefined;
    };
    context.variables.push({
      name, op, value: expression(value), value_else: expression(value_else), condition: expression(condition),
      terms: terms && this.printed(terms),
      ...(options['default'] ? { default: Number(options['default']) } : {}),
      ...(context.precombat ? { precombat: true as const } : {}),
    });
  }

  /** SimC never returns from a list it runs, so the lines after the call hold only while its condition does not. */
  private afterRun(reached: AplNode[] | null, own: AplNode[] | null): AplNode[] | null {
    return own && reached && [...reached, this.negation(own)];
  }

  private negation(terms: AplNode[]): AplNode {
    const all = terms.reduce((left, right): AplNode => ({ type: 'BinaryExpression', operator: '&', left, right }));
    const negated: jsep.UnaryExpression = { type: 'UnaryExpression', operator: '!', prefix: true, argument: all };
    return negated;
  }

  private line(action: string, terms: AplNode[] | null, lineCd: string | undefined): PlanLine {
    return { action, terms: terms && this.printed(terms), ...(lineCd ? { line_cd: Number(lineCd) } : {}) };
  }

  /** A tree with a node SimC text has no form for leaves the line unread rather than half-printed. */
  private printed(terms: AplNode[]): string[] | null {
    try {
      return terms.map(term => this.print(term));
    } catch {
      return null;
    }
  }

  private gateTerms(options: Record<string, string>, substitutes: ReadonlyMap<string, AplNode>): AplNode[] | null {
    const targetIf = options['target_if'];
    const gates = [options['if'], targetIf && !TARGET_RANKING.test(targetIf) ? targetIf.replace(/^first:/, '') : undefined];
    const nodes = gates.flatMap(gate => (gate ? [this.parse(this.normalized(gate))] : []));
    if (!nodes.every((node): node is AplNode => node !== null)) return null;
    return nodes.flatMap(node => this.operands(this.substitute(node, substitutes), '&'));
  }
}
