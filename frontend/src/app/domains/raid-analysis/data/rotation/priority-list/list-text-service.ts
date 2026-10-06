import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import { ConditionEvalService } from './condition-eval-service';
import { FactCatalogService } from './fact-catalog-service';
import { Words } from './list-words';
import type { FactPath, FieldWords, Frame, Op, Range, Truth } from './priority-list.models';

/** A number as a sentence reads it, with what bends it said after the bound: `full` and `one less while Darkest Night is down`. */
interface Amount {
  n: string;
  aside: string;
}

const FLIP: Record<Op, Op> = { '<': '>=', '<=': '>', '>': '<=', '>=': '<', '=': '!=', '!=': '=' };
const MIRROR: Record<Op, Op> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=', '!=': '!=' };
/** SimC's spellings of equality: `==` and the floating-point `~`. */
const EQUALS: Record<string, Op | undefined> = { '==': '=', '~': '=', '!~': '!=' };
const POOL_WORDS: Record<string, string | undefined> = { soul_shard: 'soul shards', rune: 'runes' };
const AMOUNTS: Record<string, string | undefined> = { cp_max_spend: 'full', 'gcd.max': 'one GCD', gcd: 'one GCD' };
const SLOTS: Record<string, string | undefined> = { '1': 'your first trinket', '2': 'your second trinket', this: 'this trinket', other: 'your other trinket' };
const SINGULAR = /^(stacks|charges|combo points|soul shards|runes|ranks|ticks)$/;
const UNSETTLED = 'Could be either';
const HOLDS: readonly [string, string] = ['Holds', 'Does not hold'];
/** The unit a frame's values carry unless the field names its own. */
const FRAME_UNITS: Record<Frame, string> = { flag: '', left: 's left', away: 's away', count: '', percent: '%', seconds: 's', amount: '' };

/** The sentence each frame makes of a bound, for a field with no sentence of its own. */
const FRAMES: Record<Frame, (noun: string, op: Op, n: string, label: string, unit: string) => string> = {
  flag: (noun, op, n) => `with ${noun} ${Words.lessMore(op)} ${n}`,
  left: (noun, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} of ${noun} left`,
  away: (noun, op, n) => (n === '0' && Words.below(op) ? `when ${noun} is ready` : `when ${noun} is ${Words.lessMore(op)} ${Words.secs(n)} away`),
  count: (noun, op, n, _, unit) => `at ${Words.bound(op, n)} ${noun} ${unit}`,
  percent: (noun, op, n) => `at ${Words.bound(op, `${n}%`)} ${noun}`,
  seconds: (noun, op, n, label) => `with ${[Words.possessive(noun), label].filter(Boolean).join(' ')} ${Words.lessMore(op)} ${Words.secs(n)}`,
  amount: (noun, op, n, label) => `with ${[noun && Words.possessive(noun), label].filter(Boolean).join(' ')} ${Words.lessMore(op)} ${n}`,
};

@Injectable({ providedIn: 'root' })
export class ListTextService {
  private readonly apl = inject(SimcAplService);
  private readonly catalog = inject(FactCatalogService);
  private readonly evaluator = inject(ConditionEvalService);

  name(list: PriorityList, token: string): string {
    return list.spells[token]?.name ?? Words.spaced(token);
  }

  capitalized(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /** The term in words; `holds` false phrases its negation, which a title uses to name what went wrong. */
  phrase(list: PriorityList, node: AplNode, holds: boolean, action: string): string {
    if (node.type === 'UnaryExpression' && (node as jsep.UnaryExpression).operator === '!') return this.phrase(list, (node as jsep.UnaryExpression).argument, !holds, action);
    if (node.type === 'Identifier') return this.flag(list, (node as jsep.Identifier).name, holds, action);
    return node.type === 'BinaryExpression' ? this.binary(list, node as jsep.BinaryExpression, holds, action) : this.raw(holds);
  }

  /** `flag` marks a term that tests the value for truth alone, which a count with no unit answers only as a state. */
  value(node: AplNode, range: Range, flag = false): string {
    const [lo, hi] = range;
    if (lo === -Infinity && hi === Infinity) return this.unread(node);
    const path = node.type === 'Identifier' ? this.catalog.path((node as jsep.Identifier).name, '') : undefined;
    const words = path && this.catalog.words(path);
    const unit = this.unit(path, words, lo === 1 && hi === 1);
    if (path && this.readsAsState(words, flag, unit)) return this.state(words, this.evaluator.truth(range));
    const text = this.span(lo, hi);
    return unit ? `${text} ${unit}` : text;
  }

  /** A field the catalog knows but the log did not settle, against a name outside the catalog. */
  private unread(node: AplNode): string {
    const known = this.apl.identifiers(node).every(name => this.catalog.words(this.catalog.path(name, '')));
    return known ? 'Not in the log' : 'Not read by warcraft-learner';
  }

  /** A flag always reads as a state; a measure tested alone does when it has states or no unit to count in. */
  private readsAsState(words: FieldWords | undefined, flag: boolean, unit: string): boolean {
    return words?.frame === 'flag' || (flag && (!!words?.states || !unit));
  }

  private span(lo: number, hi: number): string {
    if (lo === hi) return this.number(lo);
    return hi === Infinity ? `${this.number(lo)}+` : `${this.number(lo)} to ${this.number(hi)}`;
  }

  /** A field with no states of its own holds or does not. */
  private state(words: FieldWords | undefined, truth: Truth): string {
    if (truth === 'unknown') return UNSETTLED;
    return (words?.states ?? HOLDS)[truth === 'true' ? 0 : 1];
  }

  private unit(path: FactPath | undefined, words: FieldWords | undefined, one: boolean): string {
    const raw = words?.unit;
    const units = typeof raw === 'function' ? raw(this.poolWords(path?.subject ?? '')) : raw ?? (words ? FRAME_UNITS[words.frame] : '');
    if (!one) return units;
    return units === 'enemies' ? 'enemy' : SINGULAR.test(units) ? units.slice(0, -1) : units;
  }

  private binary(list: PriorityList, node: jsep.BinaryExpression, holds: boolean, action: string): string {
    const { operator, left, right } = node;
    if (operator === '|' || operator === '&') return this.compound(list, node, operator, holds, action);
    const op = (EQUALS[operator] ?? operator) as Op;
    if (!(op in FLIP)) return this.raw(holds);
    const facing = left.type === 'Literal' ? { subject: right, op: MIRROR[op], amount: left } : { subject: left, op, amount: right };
    const words = this.comparison(list, facing.subject, holds ? facing.op : FLIP[facing.op], facing.amount, action);
    return words ?? this.raw(holds);
  }

  private compound(list: PriorityList, node: AplNode, operator: string, holds: boolean, action: string): string {
    const parts = this.apl.operands(node, operator).map(part => this.phrase(list, part, true, action));
    if (operator === '|') return holds ? `either ${this.join(parts, 'or')}` : `neither ${this.join(parts, 'nor')}`;
    return holds ? this.join(parts) : `unless ${this.join(parts)}`;
  }

  private flag(list: PriorityList, name: string, holds: boolean, action: string): string {
    const path = this.catalog.path(name, action);
    const words = this.catalog.words(path);
    const noun = this.noun(list, path);
    if (!words) return `${holds ? 'when' : 'unless'} ${this.described(noun, path)} holds`;
    return words.flag?.(noun, holds, path) ?? this.stated(words, noun, holds, path);
  }

  /** A flag by its state; a measure tested alone is above zero or not. */
  private stated(words: FieldWords, noun: string, holds: boolean, path: FactPath): string {
    const state = words.states?.[holds ? 0 : 1].toLowerCase();
    if (!state) return `while ${this.described(noun, path, words.label)} is ${holds ? 'above zero' : 'zero'}`;
    return noun ? `while ${noun} is ${state}` : `while ${state}`;
  }

  private comparison(list: PriorityList, subject: AplNode, op: Op, amount: AplNode, action: string): string | null {
    if (subject.type !== 'Identifier') return null;
    const count = this.amount(list, amount, action);
    if (!count) return null;
    const path = this.catalog.path((subject as jsep.Identifier).name, action);
    const words = this.catalog.words(path);
    const noun = this.noun(list, path);
    const text = words
      ? words.at?.(noun, op, count.n, path) ?? FRAMES[words.frame](noun, op, count.n, words.label ?? '', this.unit(path, words, false))
      : `with ${this.described(noun, path)} ${Words.lessMore(op)} ${count.n}`;
    return count.aside ? `${text} (${count.aside})` : text;
  }

  /** A field in its own words, outside the catalog or tested alone: `Reap's souls consumed`, `movement distance`. */
  private described(noun: string, path: FactPath, label?: string): string {
    if (!noun) return label ?? Words.spaced(path.field.replace(/\./g, ' '));
    return `${Words.possessive(noun)} ${label ?? Words.spaced(path.field.split('.').pop() ?? path.field)}`;
  }

  /** What the name is about, as the player knows it. */
  private noun(list: PriorityList, path: FactPath): string {
    if (path.spell) return this.name(list, path.subject);
    switch (path.kind) {
      case 'pool': return this.poolWords(path.subject);
      case 'build': return this.talentName(list, path.subject);
      case 'gear': return SLOTS[path.subject] ?? Words.spaced(path.subject);
      default: return Words.spaced(path.subject);
    }
  }

  private poolWords(pool: string): string {
    return POOL_WORDS[pool] ?? Words.spaced(pool);
  }

  private talentName(list: PriorityList, key: string): string {
    const [kind = '', token = ''] = key.split('.');
    const named = list.talents[key]?.name ?? (kind === 'apex' ? `apex tier ${token}` : Words.spaced(token));
    return kind === 'hero_tree' ? `the ${named} hero tree` : named;
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
    const base = operator === '-' && this.isFlag(right) ? this.amount(list, left, action) : null;
    return base && { n: base.n, aside: `one less ${this.phrase(list, right, true, action)}` };
  }

  private isFlag(node: AplNode): boolean {
    return node.type === 'Identifier' || (node.type === 'UnaryExpression' && (node as jsep.UnaryExpression).operator === '!');
  }

  /** A term built of nothing a name reads, such as a bare number. */
  private raw(holds: boolean): string {
    return `${holds ? 'when' : 'unless'} this holds`;
  }

  private join(parts: string[], last = 'and'): string {
    if (parts.length <= 1) return parts[0] ?? '';
    return `${parts.slice(0, -1).join(', ')} ${last} ${parts[parts.length - 1] ?? ''}`;
  }

  private number(value: number): string {
    return String(round(value, 1));
  }
}
