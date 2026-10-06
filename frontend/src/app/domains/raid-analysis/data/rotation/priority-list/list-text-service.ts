import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import { POOL_TYPES } from '../../simc/spell-dump-service';
import { ConditionEvalService } from './condition-eval-service';
import { FactPaths } from './fact-path';
import type { FactPath, Frame, Range } from './priority-list.models';

type Op = '<' | '<=' | '>' | '>=' | '=' | '!=';

/** A number as a sentence reads it, with what bends it said after the bound: `full` and `one less while Darkest Night is down`. */
interface Amount { n: string; aside: string }

interface Words { path: FactPath; frame: Frame; label: string }

const FLIP: Record<Op, Op> = { '<': '>=', '<=': '>', '>': '<=', '>=': '<', '=': '!=', '!=': '=' };
const MIRROR: Record<Op, Op> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=', '!=': '!=' };
const POOL_WORDS: Record<string, string | undefined> = { soul_shard: 'soul shards', rune: 'runes' };
const AMOUNTS: Record<string, string | undefined> = { cp_max_spend: 'full', 'gcd.max': 'one GCD', gcd: 'one GCD' };
const TRINKETS: Record<string, string | undefined> = { this_trinket: 'this trinket', other_trinket: 'the other trinket' };
const UNITS: Record<Frame, string> = { flag: '', left: ' s left', away: ' s away', count: '', percent: '%', seconds: ' s', amount: '' };

const spaced = (name: string): string => name.replace(/[._]+/g, ' ').trim();
const tidy = (text: string): string => text.replace(/\s+/g, ' ').trim();
const below = (op: Op): boolean => op.startsWith('<');
const numeric = (n: string): boolean => /^\d+(\.\d+)?%?$/.test(n);
const lessMore = (op: Op): string => ({ '<': 'under', '<=': 'at most', '>': 'over', '>=': 'at least', '=': 'exactly', '!=': 'other than' })[op];
const secs = (n: string): string => (/^\d+(\.\d+)?$/.test(n) ? `${n} s` : n);
const bound = (op: Op, n: string): string => {
  if (!numeric(n)) return `${below(op) ? 'under ' : ''}${n}`;
  return { '>=': `${n}+`, '>': `over ${n}`, '<=': `at most ${n}`, '<': `under ${n}`, '=': `exactly ${n}`, '!=': `other than ${n}` }[op];
};
const enemies = (op: Op, n: string): string => {
  const count = Number(n);
  if ((op === '=' || op === '<=') && count === 1) return 'on a single enemy';
  if (op === '<' && count === 2) return 'on a single enemy';
  return op === '>' && Number.isInteger(count) ? `on ${count + 1}+ enemies` : `on ${bound(op, n)} enemies`;
};

type Sentence = (x: string, label: string, op: Op, n: string) => string;
const counted: Sentence = (x, label, op, n) => `with ${bound(op, n)} ${x} ${label}`;
const FRAMES: Record<Frame, Sentence> = {
  flag: counted, count: counted,
  left: (x, label, op, n) => `with ${lessMore(op)} ${secs(n)} of ${x || label} left`,
  away: (x, label, op, n) => `when ${x || label} is ${lessMore(op)} ${secs(n)} away`,
  percent: (x, label, op, n) => `with ${bound(op, `${n}%`)} ${label || x}`,
  seconds: (x, label, op, n) => `with ${lessMore(op)} ${secs(n)} ${label}`,
  amount: (x, label, op, n) => `with ${x && label ? `${x}'s ${label}` : x || label} ${lessMore(op)} ${n}`,
};
/** Sentences a frame's own shape would misread, by field. */
const SPECIAL: Record<string, ((op: Op, n: string) => string) | undefined> = {
  active_enemies: enemies,
  fight_remains: (op, n) => (below(op) ? `in the last ${secs(n)} of the fight` : `with ${lessMore(op)} ${secs(n)} of the fight left`),
  time: (op, n) => (below(op) ? `in the first ${secs(n)} of the fight` : `after the first ${secs(n)} of the fight`),
  'raid_event.adds.in': (op, n) => (below(op) ? `when adds come within ${secs(n)}` : `when adds are ${lessMore(op)} ${secs(n)} away`),
  time_to_die: (op, n) => `when the target has ${lessMore(op)} ${secs(n)} to live`,
};
const holds = (): string => '=holds|=does not hold';
/** The two states a name tested alone shows where its row is no flag. */
const TESTED: Record<Frame, (label: string) => string> = {
  flag: label => label,
  left: () => '=has time left|=has no time left',
  away: () => 'on cooldown|ready',
  count: label => (label ? `=has ${label}|=has no ${label}` : '=is above zero|=is zero'),
  percent: holds, seconds: holds, amount: holds,
};

@Injectable({ providedIn: 'root' })
export class ListTextService {
  private readonly apl = inject(SimcAplService);
  private readonly evaluator = inject(ConditionEvalService);

  name(list: PriorityList, token: string): string {
    return list.spells[token]?.name ?? spaced(token);
  }

  capitalized(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /** The term in words; `holds` false phrases its negation, which a title uses to name what went wrong. */
  phrase(list: PriorityList, node: AplNode, holds: boolean, action: string): string {
    if (node.type === 'UnaryExpression' && (node as jsep.UnaryExpression).operator === '!') return this.phrase(list, (node as jsep.UnaryExpression).argument, !holds, action);
    if (node.type === 'Identifier') {
      const path = FactPaths.path((node as jsep.Identifier).name, action);
      return FactPaths.row(path) ? this.tested(list, path, holds) : this.raw(holds);
    }
    return node.type === 'BinaryExpression' ? this.binary(list, node as jsep.BinaryExpression, holds, action) : this.raw(holds);
  }

  /** `flag` marks a term that tests the value for truth alone, which shows as a state rather than a number. */
  value(node: AplNode, range: Range, flag = false): string {
    const [lo, hi] = range;
    if (lo === -Infinity && hi === Infinity) return this.apl.identifiers(node).every(name => this.evaluator.reads(name)) ? 'Not in the log' : 'Not read by warcraft-learner';
    if (lo === Infinity && hi === Infinity) return 'Never';
    const words = this.words(FactPaths.path(node.type === 'Identifier' ? (node as jsep.Identifier).name : '', ''));
    return flag ? this.state(words, this.evaluator.truth(range)) : this.span(lo, hi) + this.unit(words, range);
  }

  private unit(words: Words, [lo, hi]: Range): string {
    const unit = words.frame === 'count' ? ` ${words.label || this.noun(null, words.path)}` : UNITS[words.frame];
    return lo === hi && lo === 1 ? this.singular(unit) : unit;
  }

  private words(path: FactPath, list: PriorityList | null = null): Words {
    const row = path.field === 'prev_gcd' && path.n === 1 ? FactPaths.row({ ...path, field: 'prev' }) : FactPaths.row(path);
    const [frame, label] = row ?? ['amount', ''];
    return { path, frame, label: label.replace(/\{n\}/g, String(path.n)).replace(/\{s\}/g, this.itemName(list, path.subject)) };
  }

  private itemName(list: PriorityList | null, token: string): string {
    return list?.items?.[token]?.name ?? spaced(token);
  }

  private noun(list: PriorityList | null, path: FactPath): string {
    const { kind, subject } = path;
    if (kind === 'fight' || kind === 'unread') return '';
    if (kind === 'build') return this.talentName(list, path);
    if (kind === 'gear') return this.gearNoun(list, path);
    if (kind === 'pool' && POOL_TYPES[subject] !== undefined) return POOL_WORDS[subject] ?? spaced(subject);
    return this.spellNoun(list, path);
  }

  /** SimC's `debuff.casting` is no aura but the target's own cast. */
  private spellNoun(list: PriorityList | null, { kind, subject }: FactPath): string {
    if (kind === 'aura' && subject === 'casting') return 'the target';
    return list ? this.name(list, subject) : spaced(subject);
  }

  private gearNoun(list: PriorityList | null, { subject, field, n }: FactPath): string {
    if (n) return `your ${n === 1 ? 'first' : 'second'} trinket`;
    if (field === 'set_bonus') return this.setBonus(subject);
    if (field === 'main_hand' || field === 'off_hand') return `your ${spaced(field)}`;
    return TRINKETS[subject] ?? this.itemName(list, subject);
  }

  /** SimC names a set bonus by its tier and piece count (`midnight_season_2_4pc`); only the count is a word the player knows. */
  private setBonus(token: string): string {
    const pieces = /(\d+)pc$/.exec(token)?.[1];
    return pieces ? `your ${pieces}-piece set bonus` : 'your set bonus';
  }

  private talentName(list: PriorityList | null, { subject, field, n }: FactPath): string {
    if (field === 'variable') return spaced(subject);
    const named = list?.talents[subject]?.name;
    if (subject.startsWith('apex.')) return named ?? `apex tier ${n}`;
    const name = named ?? spaced(subject.slice(subject.indexOf('.') + 1));
    return subject.startsWith('hero_tree.') ? `the ${name} hero tree` : name;
  }

  private states({ path, frame, label }: Words): [string, string] {
    const pair = frame !== 'flag' && path.kind === 'aura' ? 'up|down' : TESTED[frame](label);
    const [on = '', off = ''] = (path.kind === 'aura' ? this.auraStates(path, pair) : pair).split('|');
    return [on, off];
  }

  /** A dot or debuff is on or off the target rather than up or down; SimC's `debuff.casting` is the target's own cast. */
  private auraStates({ subject, target }: FactPath, pair: string): string {
    if (subject === 'casting') return 'casting|not casting';
    return target ? pair.replace(/\bup\b/, 'on the target').replace(/\bdown\b/, 'not on the target') : pair;
  }

  private tested(list: PriorityList, path: FactPath, holds: boolean): string {
    const [on, off] = this.states(this.words(path, list));
    const state = holds ? on : off;
    const x = this.noun(list, path);
    if (!x) return `while ${state.replace(/^=/, '')}`;
    return tidy(`while ${x} ${state.startsWith('=') ? state.slice(1) : `is ${state}`}`);
  }

  private state(words: Words, truth: 'true' | 'false' | 'unknown'): string {
    if (truth === 'unknown') return 'Could be either';
    const [on, off] = this.states(words);
    return this.capitalized((truth === 'true' ? on : off).replace(/^=/, ''));
  }

  private span(lo: number, hi: number): string {
    if (lo === hi) return this.number(lo);
    return hi === Infinity ? `${this.number(lo)}+` : `${this.number(lo)} to ${this.number(hi)}`;
  }

  private singular(unit: string): string {
    return unit.replace(/\b(\w+?)(ies|s)\b/, (_, stem: string, end: string) => (end === 'ies' ? `${stem}y` : stem));
  }

  private binary(list: PriorityList, node: jsep.BinaryExpression, holds: boolean, action: string): string {
    const { operator, left, right } = node;
    if (operator === '|' || operator === '&') return this.compound(list, node, operator, holds, action);
    const op = (operator === '==' ? '=' : operator) as Op;
    if (!(op in FLIP)) return this.raw(holds);
    const facing = left.type === 'Literal' ? { subject: right, op: MIRROR[op], amount: left } : { subject: left, op, amount: right };
    return this.comparison(list, facing.subject, holds ? facing.op : FLIP[facing.op], facing.amount, action) ?? this.raw(holds);
  }

  private compound(list: PriorityList, node: AplNode, operator: string, holds: boolean, action: string): string {
    const parts = this.apl.operands(node, operator).map(part => this.phrase(list, part, true, action));
    if (operator === '|') return holds ? `either ${this.join(parts, 'or')}` : `neither ${this.join(parts, 'nor')}`;
    return holds ? this.join(parts) : `unless ${this.join(parts)}`;
  }

  private comparison(list: PriorityList, subject: AplNode, op: Op, amount: AplNode, action: string): string | null {
    const count = subject.type === 'Identifier' ? this.amount(list, amount, action) : null;
    if (!count) return null;
    const path = FactPaths.path((subject as jsep.Identifier).name, action);
    if (!FactPaths.row(path)) return null;
    const words = this.words(path);
    const is = FactPaths.row(path)?.[2];
    const special = SPECIAL[path.field] ?? (typeof is === 'string' ? SPECIAL[is] : undefined);
    const x = this.noun(list, path);
    const sentence = special ? special(op, count.n) : FRAMES[words.frame](x, words.label.replace(/\{x\}/g, x), op, count.n);
    return tidy(count.aside ? `${sentence} (${count.aside})` : sentence);
  }

  private amount(list: PriorityList, node: AplNode, action: string): Amount | null {
    if (node.type === 'Literal') return { n: this.number(Number((node as jsep.Literal).value)), aside: '' };
    const named = node.type === 'Identifier' ? AMOUNTS[(node as jsep.Identifier).name] : undefined;
    if (named) return { n: named, aside: '' };
    return node.type === 'BinaryExpression' ? this.arithmetic(list, node as jsep.BinaryExpression, action) : null;
  }

  private arithmetic(list: PriorityList, { operator, left, right }: jsep.BinaryExpression, action: string): Amount | null {
    const gcd = [left, right].find(side => side.type === 'Identifier' && /^gcd(\.max)?$/.test((side as jsep.Identifier).name));
    const gcds = operator === '*' && gcd ? this.amount(list, gcd === left ? right : left, action) : null;
    if (gcds) return { n: `${gcds.n} GCDs`, aside: gcds.aside };
    const flag = right.type === 'Identifier' || (right.type === 'UnaryExpression' && (right as jsep.UnaryExpression).operator === '!');
    const base = operator === '-' && flag ? this.amount(list, left, action) : null;
    return base && { n: base.n, aside: `one less ${this.phrase(list, right, true, action)}` };
  }

  /** What a term no sentence covers reads as, so the player never meets SimC's own syntax. */
  private raw(holds: boolean): string {
    return `${holds ? 'when' : 'unless'} another condition holds`;
  }

  private join(parts: string[], last = 'and'): string {
    if (parts.length <= 1) return parts[0] ?? '';
    return `${parts.slice(0, -1).join(', ')} ${last} ${parts[parts.length - 1] ?? ''}`;
  }

  private number(value: number): string {
    return String(round(value, 1));
  }
}
