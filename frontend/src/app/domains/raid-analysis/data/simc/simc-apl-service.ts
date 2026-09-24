import { Injectable } from '@angular/core';
import jsep from 'jsep';
import { getOrInsert } from '../analysis/analysis-math';

export type AplNode = jsep.Expression;

export interface AplLine {
  action: string;
  /** The top-level `&` operands of the line's own `if=` plus those of every list call above it. */
  terms: AplNode[];
  /** False when jsep could not parse a condition on the line, so its terms are unknown rather than absent. */
  readable: boolean;
}

export interface AplProfile {
  /** Every button line reachable from the default list, in priority order. */
  lines: AplLine[];
  unreadable: number;
}

interface AplEntry {
  action: string;
  options: Record<string, string>;
}

interface AplWalk {
  lists: Map<string, AplEntry[]>;
  variables: Map<string, string>;
  profile: AplProfile;
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
/** Sim state a log never records; a `|` branch that reads only these is dropped, so `buff.x.up|fight_remains<5` reads as `buff.x.up`. */
const SIM_ONLY = /^(fight_remains|time_to_die|target\.time_to_die|raid_event\.|trinket\.|fight_style\.|equipped\.|set_bonus\.|variable\.|boss)/;
const PLAYER_STATE = /^(buff|dot|debuff|talent)\.|^(active_enemies|spell_targets)/;
const MAX_VARIABLE_DEPTH = 3;

/** Reads a SimulationCraft action priority list into button lines whose conditions are jsep trees. */
@Injectable({ providedIn: 'root' })
export class SimcAplService {
  readProfile(simc: string): AplProfile {
    const lists = this.parseLists(simc);
    const variables = this.variableExpressions([...lists.values()].flat());
    const profile: AplProfile = { lines: [], unreadable: 0 };
    this.walk({ lists, variables, profile }, 'default', [], new Set());
    return profile;
  }

  /** The terms on every line of one button: a term every line agrees on is a requirement of pressing it. */
  sharedTerms(lines: AplLine[]): AplNode[] {
    if (lines.some(line => !line.readable)) return [];
    const [first, ...rest] = lines;
    const others = rest.map(line => new Set(line.terms.map(term => this.termKey(term))));
    return (first?.terms ?? []).filter(term => others.every(keys => keys.has(this.termKey(term))));
  }

  termKey(term: AplNode): string {
    return JSON.stringify(term);
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

  private walk(context: AplWalk, list: string, inherited: AplNode[] | null, seen: Set<string>): void {
    if (seen.has(list)) return;
    for (const entry of context.lists.get(list) ?? []) this.visit(context, entry, inherited, new Set([...seen, list]));
  }

  /** A null term list is a line under a condition jsep could not read: its terms are unknown, not absent. */
  private visit(context: AplWalk, { action, options }: AplEntry, inherited: AplNode[] | null, seen: Set<string>): void {
    const own = this.gateTerms(options['if'], context.variables);
    if (own === null) context.profile.unreadable++;
    const terms = own && inherited ? [...inherited, ...own] : null;
    if (LIST_CALLS.has(action)) this.walk(context, options['name'] ?? '', terms, seen);
    else if (!NON_SPELL.has(action)) context.profile.lines.push({ action, terms: terms ?? [], readable: terms !== null });
  }

  private gateTerms(gate: string | undefined, variables: Map<string, string>): AplNode[] | null {
    if (!gate) return [];
    const text = this.inline(gate, variables).replace(/&&/g, '&').replace(/\|\|/g, '|').replace(/\^\^/g, '^');
    try {
      return this.operands(jsep(text), '&').map(term => this.dropSimOnly(term));
    } catch {
      return null;
    }
  }

  private dropSimOnly(term: AplNode): AplNode {
    const branches = this.operands(term, '|');
    const kept = branches.filter(branch => {
      const names = this.identifiers(branch);
      return !names.some(name => SIM_ONLY.test(name)) || names.some(name => PLAYER_STATE.test(name));
    });
    if (!kept.length || kept.length === branches.length) return term;
    return kept.reduce((left, right): AplNode => ({ type: 'BinaryExpression', operator: '|', left, right }));
  }
}
