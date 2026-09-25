import { Injectable } from '@angular/core';
import jsep from 'jsep';
import { getOrInsert } from '../analysis/analysis-math';
import type { PlanLine } from '../plan/plan.models';

export type AplNode = jsep.Expression;

interface AplEntry {
  action: string;
  options: Record<string, string>;
}

interface AplWalk {
  lists: Map<string, AplEntry[]>;
  variables: Map<string, string>;
  lines: PlanLine[];
}

// SimulationCraft's own table (engine/sim/expressions.cpp): `%` divides, `%%` is the remainder, `<?` and `>?` are max and min.
const BINARY_PRECEDENCE: Record<string, number> = {
  '|': 1, '^': 2, '&': 3,
  '=': 4, '==': 4, '!=': 4, '<': 4, '<=': 4, '>': 4, '>=': 4, '~': 4, '!~': 4,
  '<?': 5, '>?': 5, '+': 6, '-': 6, '*': 7, '%': 7, '%%': 7,
};
for (const op of Object.keys(jsep.binary_ops)) jsep.removeBinaryOp(op);
for (const op of Object.keys(jsep.unary_ops)) jsep.removeUnaryOp(op);
for (const [op, precedence] of Object.entries(BINARY_PRECEDENCE)) jsep.addBinaryOp(op, precedence);
for (const op of ['!', '-', '@']) jsep.addUnaryOp(op);
jsep.addIdentifierChar('.');

const LINE = /^actions(?:\.(\w+))?\+?=\/?(.*)$/;
const LIST_CALLS = new Set(['call_action_list', 'run_action_list']);
const NON_SPELL = new Set([
  'auto_attack', 'snapshot_stats', 'potion', 'use_items', 'use_item', 'invoke_external_buff', 'pool_resource', 'wait',
  'cancel_buff', 'retarget_auto_attack', 'flask', 'food', 'augmentation', 'summon_pet', 'variable', 'cancel_action',
]);
const MAX_VARIABLE_DEPTH = 3;

/** Reads a SimulationCraft action priority list into button lines, each condition split into its `&` terms and printed back as SimC text. */
@Injectable({ providedIn: 'root' })
export class SimcAplService {
  /** Every button line reachable from the default list, in priority order. */
  readApl(simc: string): PlanLine[] {
    const lists = this.parseLists(simc);
    const context: AplWalk = { lists, variables: this.variableExpressions([...lists.values()].flat()), lines: [] };
    this.walk(context, 'default', [], new Set());
    return context.lines;
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

  private inline(gate: string, variables: Map<string, string>): string {
    let text = gate;
    for (let depth = 0; depth < MAX_VARIABLE_DEPTH; depth++) {
      text = text.replace(/variable\.(\w+)/g, (term, name: string) => {
        const expression = variables.get(name);
        return expression ? `(${expression})` : term;
      });
    }
    return text;
  }

  /** A null term list is a line under a condition jsep could not read: its terms are unknown, not absent. */
  private walk(context: AplWalk, list: string, inherited: AplNode[] | null, seen: Set<string>): void {
    if (seen.has(list)) return;
    let reached = inherited;
    for (const entry of context.lists.get(list) ?? []) {
      const own = this.gateTerms(entry.options['if'], context.variables);
      this.visit(context, entry, own && reached && [...reached, ...own], new Set([...seen, list]));
      if (entry.action !== 'run_action_list') continue;
      if (own?.length === 0) return;
      reached = this.afterRun(reached, own);
    }
  }

  private visit(context: AplWalk, { action, options }: AplEntry, terms: AplNode[] | null, seen: Set<string>): void {
    if (LIST_CALLS.has(action)) this.walk(context, options['name'] ?? '', terms, seen);
    else if (!NON_SPELL.has(action)) context.lines.push(this.line(action, terms, options['line_cd']));
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

  private gateTerms(gate: string | undefined, variables: Map<string, string>): AplNode[] | null {
    if (!gate) return [];
    const text = this.inline(gate, variables).replace(/&&/g, '&').replace(/\|\|/g, '|').replace(/\^\^/g, '^');
    const node = this.parse(text);
    return node && this.operands(node, '&');
  }
}
