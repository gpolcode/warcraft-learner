import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { round } from '../../analysis/analysis-math';
import type { PriorityList } from '../../plan/plan.models';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import type { ReadLine } from './list-check-service';
import type { Range } from './priority-list.models';

type Op = '<' | '<=' | '>' | '>=' | '=' | '!=';

/** A flag in words, `x` the name of the spell it reads, `n` a count it carries (`prev_gcd.2`). */
interface FlagWords {
  match: RegExp;
  words: (x: string, holds: boolean, n: number) => string;
}

/** A number as a sentence reads it, with what bends it said after the bound: `full` and `one less while Darkest Night is down`. */
interface Amount {
  n: string;
  aside: string;
}

/** A measured subject in words: `at` states a bound on it, `unit` names its value on a cast. */
interface SubjectWords {
  match: RegExp;
  at: (x: string, op: Op, n: string) => string;
  unit: string;
}

const FLIP: Record<Op, Op> = { '<': '>=', '<=': '>', '>': '<=', '>=': '<', '=': '!=', '!=': '=' };
const MIRROR: Record<Op, Op> = { '<': '>', '<=': '>=', '>': '<', '>=': '<=', '=': '=', '!=': '!=' };
const TALENT = /^(talent|hero_tree|apex)\.(\w+)(?:\.enabled)?$/;
const POOL = /^(mana|rage|focus|energy|combo_points|rune|runic_power|soul_shard|astral_power|holy_power|maelstrom|chi|insanity|fury|essence)(?:\.(deficit|pct))?$/;
const POOL_WORDS: Record<string, string | undefined> = { soul_shard: 'soul shards', rune: 'runes' };
const AMOUNTS: Record<string, string | undefined> = { cp_max_spend: 'full', 'gcd.max': 'one GCD', gcd: 'one GCD' };
const FLAG_VALUE = /(^|\.)(up|down|ticking|active|enabled|refreshable|ready|executing|exists)$|^(talent|hero_tree|apex)\./;
const SINGULAR = /^(stacks|charges|combo points|soul shards|runes)$/;

const not = (holds: boolean): string => (holds ? '' : 'not ');
const below = (op: Op): boolean => op.startsWith('<');
const lessMore = (op: Op): string => ({ '<': 'under', '<=': 'at most', '>': 'over', '>=': 'at least', '=': 'exactly', '!=': 'other than' })[op];
const secs = (n: string): string => (/^\d+(\.\d+)?$/.test(n) ? `${n} s` : n);
const bound = (op: Op, n: string): string => {
  if (!/^\d/.test(n)) return `${below(op) ? 'under ' : ''}${n}`;
  return { '>=': `${n}+`, '>': `over ${n}`, '<=': `${n} or fewer`, '<': `under ${n}`, '=': `exactly ${n}`, '!=': `other than ${n}` }[op];
};
const enemies = (op: Op, n: string): string => {
  const count = Number(n);
  if ((op === '=' || op === '<=') && count === 1) return 'on a single enemy';
  if (op === '<' && count === 2) return 'on a single enemy';
  return op === '>' && Number.isInteger(count) ? `on ${count + 1}+ enemies` : `on ${bound(op, n)} enemies`;
};

/** What a term no phrase covers reads as, so the player never meets SimC's own syntax. */
const OTHER = 'another condition';

const FLAGS: FlagWords[] = [
  { match: /^target\.debuff\.casting\.(up|react)$/, words: (_, holds) => `while the target is ${not(holds)}casting` },
  { match: /^raid_event\.adds\.exists$/, words: (_, holds) => `in a fight ${holds ? 'with' : 'without'} adds` },
  { match: /^raid_event\.adds\.up$/, words: (_, holds) => (holds ? 'while adds are up' : 'while no adds are up') },
  { match: /^raid_event\.pull\.exists$/, words: (_, holds) => (holds ? 'in a dungeon' : 'outside a dungeon') },
  { match: /^variable\.\w+$/, words: (x, holds) => `${holds ? 'when' : 'unless'} ${x} holds` },
  { match: /^buff\.\w+\.(up|react|stack)$/, words: (x, holds) => `while ${x} is ${holds ? 'up' : 'down'}` },
  { match: /^buff\.\w+\.down$/, words: (x, holds) => `while ${x} is ${holds ? 'down' : 'up'}` },
  { match: /^((?:target\.)?(dot|debuff)\.\w+\.(up|ticking)|ticking)$/, words: (x, holds) => `while ${x} is ${not(holds)}on the target` },
  { match: /^(?:target\.)?(dot|debuff)\.\w+\.down$/, words: (x, holds) => `while ${x} is ${not(!holds)}on the target` },
  { match: /^((?:target\.)?(dot|debuff)\.\w+\.)?refreshable$/, words: (x, holds) => (holds ? `once ${x} is in its last 30%` : `while ${x} has over 30% left`) },
  { match: /^(cooldown\.\w+\.(ready|up)|cooldown_react)$/, words: (x, holds) => (holds ? `when ${x} is ready` : `while ${x} is on cooldown`) },
  { match: /^pet\.\w+\.active$/, words: (x, holds) => `while ${x} is ${not(holds)}out` },
  { match: /^action\.\w+\.executing$/, words: (x, holds) => `while ${not(holds)}casting ${x}` },
  { match: /^(prev|prev_off_gcd|prev_gcd\.1)\.\w+$/, words: (x, holds) => `${not(holds)}right after ${x}` },
  { match: /^prev_gcd\.\d+\.\w+$/, words: (x, holds, n) => `${not(holds)}with ${x} ${n} presses back` },
  { match: /^combo_strike$/, words: (_, holds) => (holds ? 'when it does not repeat your last press' : 'when it repeats your last press') },
];

const SUBJECTS: SubjectWords[] = [
  { match: /^(active_enemies|spell_targets(\.\w+)?)$/, at: (_, op, n) => enemies(op, n), unit: 'enemies' },
  { match: /^raid_event\.adds\.in$/, at: (_, op, n) => (below(op) ? `when adds come within ${secs(n)}` : `when adds are ${lessMore(op)} ${secs(n)} away`), unit: 's until adds' },
  { match: /^raid_event\.adds\.remains$/, at: (_, op, n) => `with ${lessMore(op)} ${secs(n)} of adds left`, unit: 's of adds left' },
  { match: /^raid_event\.adds\.count$/, at: (_, op, n) => `with ${bound(op, n)} adds coming`, unit: 'adds' },
  { match: /^raid_event\.movement\.in$/, at: (_, op, n) => (below(op) ? `when you must move within ${secs(n)}` : `with ${lessMore(op)} ${secs(n)} before you must move`), unit: 's until you move' },
  { match: /^variable\.\w+$/, at: (x, op, n) => `with ${x} ${lessMore(op)} ${n}`, unit: '' },
  { match: /^(?:target\.)?(buff|debuff|dot)\.\w+\.(stack|react)$/, at: (x, op, n) => `at ${bound(op, n)} ${x} stacks`, unit: 'stacks' },
  { match: /^((?:target\.)?(buff|debuff|dot)\.\w+\.)?remains$/, at: (x, op, n) => `with ${lessMore(op)} ${secs(n)} of ${x} left`, unit: 's left' },
  { match: /^cooldown\.\w+\.(remains|full_recharge_time)$/, at: (x, op, n) => (n === '0' && below(op) ? `when ${x} is ready` : `when ${x} is ${lessMore(op)} ${secs(n)} away`), unit: 's away' },
  { match: /^(cooldown\.\w+\.)?(charges|charges_fractional)$/, at: (x, op, n) => `at ${bound(op, n)} ${x} charges`, unit: 'charges' },
  { match: /^active_dot\.\w+$/, at: (x, op, n) => `while ${x} is on ${bound(op, n)} enemies`, unit: 'enemies' },
  { match: /^target\.health\.pct$/, at: (_, op, n) => `${below(op) ? 'below' : 'above'} ${n}% target health`, unit: '% health' },
  { match: /^health\.pct$/, at: (_, op, n) => `${below(op) ? 'below' : 'above'} ${n}% health`, unit: '% health' },
  { match: /^fight_remains$/, at: (_, op, n) => (below(op) ? `in the last ${secs(n)} of the fight` : `with ${lessMore(op)} ${secs(n)} of the fight left`), unit: 's left' },
  { match: /^(target\.)?time_to_die$/, at: (_, op, n) => `when the target has ${lessMore(op)} ${secs(n)} to live`, unit: 's to live' },
  { match: /^time$/, at: (_, op, n) => (below(op) ? `in the first ${secs(n)} of the fight` : `after the first ${secs(n)} of the fight`), unit: 's in' },
];

@Injectable({ providedIn: 'root' })
export class ListTextService {
  private readonly apl = inject(SimcAplService);

  name(list: PriorityList, token: string): string {
    return list.spells[token]?.name ?? token.replace(/_/g, ' ');
  }

  capitalized(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /** `With Deathstalker's Mark: at full combo points and on 2+ enemies`; the talent prefix is left out where `ownBuild` says the player has it. */
  sentence(list: PriorityList, line: ReadLine, ownBuild = false): string {
    if (!line.terms) return '';
    const picked = line.terms.filter((term, at) => line.talentTerms[at] && this.picksTalent(term));
    const body = [...new Set(line.terms.filter(term => !picked.includes(term)).map(term => this.phrase(list, term, true, line.action)))];
    const prefix = picked.length && !ownBuild ? `With ${this.join(picked.map(term => this.talentName(list, this.apl.identifiers(term)[0] ?? '')))}: ` : '';
    return prefix + (this.join(body) || 'whenever it is ready');
  }

  instruction(list: PriorityList, line: ReadLine): string {
    return `Press ${this.name(list, line.action)} ${this.sentence(list, line, true)}.`;
  }

  /** The term in words; `holds` false phrases its negation, which a title uses to name what went wrong. */
  phrase(list: PriorityList, node: AplNode, holds: boolean, action: string): string {
    if (node.type === 'UnaryExpression' && (node as jsep.UnaryExpression).operator === '!') return this.phrase(list, (node as jsep.UnaryExpression).argument, !holds, action);
    if (node.type === 'Identifier') return this.flag(list, (node as jsep.Identifier).name, holds, action) ?? this.raw(holds);
    return node.type === 'BinaryExpression' ? this.binary(list, node as jsep.BinaryExpression, holds, action) : this.raw(holds);
  }

  /** The term's miss in words, or null where no phrase names it, since a title reads nothing from `another condition`. */
  failure(list: PriorityList, node: AplNode, action: string): string | null {
    const words = this.phrase(list, node, false, action);
    return words.includes(OTHER) ? null : words;
  }

  /** `flag` marks a term that tests the value for truth alone, so a variable read that way shows as yes or no. */
  value(node: AplNode, [lo, hi]: Range, flag = false): string {
    if (lo === -Infinity && hi === Infinity) return 'not in the log';
    const name = node.type === 'Identifier' ? (node as jsep.Identifier).name : '';
    if (this.readsAsFlag(name, flag)) return lo !== hi ? 'either' : this.flagValue(name, lo);
    const unit = this.unit(name, lo === 1 && hi === 1);
    const text = this.span(lo, hi);
    return unit ? `${text} ${unit}` : text;
  }

  private readsAsFlag(name: string, flag: boolean): boolean {
    return FLAG_VALUE.test(name) || (flag && name.startsWith('variable.'));
  }

  private span(lo: number, hi: number): string {
    if (lo === hi) return this.number(lo);
    return hi === Infinity ? `${this.number(lo)}+` : `${this.number(lo)} to ${this.number(hi)}`;
  }

  private flagValue(name: string, value: number): string {
    if (TALENT.test(name)) return value ? 'picked' : 'not picked';
    return value ? 'yes' : 'no';
  }

  private unit(name: string, one: boolean): string {
    const pool = POOL.exec(name);
    const units = pool ? this.poolUnit(pool[1] ?? '', pool[2]) : SUBJECTS.find(subject => subject.match.test(name))?.unit ?? '';
    if (!one) return units;
    return units === 'enemies' ? 'enemy' : SINGULAR.test(units) ? units.slice(0, -1) : units;
  }

  private binary(list: PriorityList, node: jsep.BinaryExpression, holds: boolean, action: string): string {
    const { operator, left, right } = node;
    if (operator === '|' || operator === '&') return this.compound(list, node, operator, holds, action);
    const op = (operator === '==' ? '=' : operator) as Op;
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

  private flag(list: PriorityList, name: string, holds: boolean, action: string): string | null {
    const talent = TALENT.exec(name);
    if (talent) return `${holds ? 'with' : 'without'} ${this.talentName(list, name)}`;
    const words = FLAGS.find(flag => flag.match.test(name));
    return words ? words.words(this.name(list, this.token(name, action)), holds, Number(/^prev_gcd\.(\d+)/.exec(name)?.[1] ?? 1)) : null;
  }

  private comparison(list: PriorityList, subject: AplNode, op: Op, amount: AplNode, action: string): string | null {
    const name = subject.type === 'Identifier' ? (subject as jsep.Identifier).name : '';
    const count = this.amount(list, amount, action);
    const words = count && this.bounded(list, name, op, count.n, action);
    return words && (count.aside ? `${words} (${count.aside})` : words);
  }

  private bounded(list: PriorityList, name: string, op: Op, n: string, action: string): string | null {
    const pool = POOL.exec(name);
    if (pool) return this.poolBound(this.poolUnit(pool[1] ?? '', undefined), pool[2], op, n);
    const words = SUBJECTS.find(entry => entry.match.test(name));
    return words ? words.at(this.name(list, this.token(name, action)), op, n) : null;
  }

  private poolUnit(pool: string, field: string | undefined): string {
    const words = POOL_WORDS[pool] ?? pool.replace(/_/g, ' ');
    return field === 'deficit' ? `${words} missing` : field === 'pct' ? `% ${words}` : words;
  }

  private poolBound(pool: string, field: string | undefined, op: Op, n: string): string {
    if (field === 'deficit') return n === '0' && (op === '<=' || op === '=') ? `at full ${pool}` : `with ${bound(op, n)} ${pool} missing`;
    if (field === 'pct') return `at ${bound(op, `${n}%`)} ${pool}`;
    return n === 'full' && !below(op) ? `at full ${pool}` : `at ${bound(op, n)} ${pool}`;
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

  private picksTalent(term: AplNode): boolean {
    return term.type === 'Identifier' && TALENT.test((term as jsep.Identifier).name);
  }

  private token(name: string, action: string): string {
    const parts = name.replace(/^target\./, '').split('.');
    if (parts[0] === 'prev_gcd') return parts[2] ?? action;
    return parts.length > 1 ? parts[1] ?? action : action;
  }

  private talentName(list: PriorityList, name: string): string {
    const [, kind = '', token = ''] = TALENT.exec(name) ?? [];
    const named = list.talents[`${kind}.${token}`]?.name ?? token.replace(/_/g, ' ');
    return kind === 'hero_tree' ? `the ${named} hero tree` : named;
  }

  private raw(holds: boolean): string {
    return `${holds ? 'when' : 'unless'} ${OTHER} holds`;
  }

  private join(parts: string[], last = 'and'): string {
    if (parts.length <= 1) return parts[0] ?? '';
    return `${parts.slice(0, -1).join(', ')} ${last} ${parts[parts.length - 1] ?? ''}`;
  }

  private number(value: number): string {
    return String(round(value, 1));
  }
}
