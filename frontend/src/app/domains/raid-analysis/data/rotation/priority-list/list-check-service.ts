import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { mode } from 'd3-array';
import { getOrInsert } from '../../analysis/analysis-math';
import { WclProjectionsService } from '../../analysis/wcl-projections-service';
import type { PlanLine, PriorityList } from '../../plan/plan.models';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import { ConditionEvalService } from './condition-eval-service';
import { VariableReplayService } from './variable-replay-service';
import { FactContextService } from './fact-context-service';
import { CooldownFacts } from './facts/cooldown-facts';
import type { CastMoment, FactContext, FactStream, Range, Truth } from './priority-list.models';

const COMPARISONS = new Set(['=', '==', '!=', '<', '<=', '>', '>=']);
const TALENT = /^(talent|hero_tree|apex)\./;

export interface ReadLine {
  /** Across the whole list, not the button's own lines. */
  index: number;
  action: string;
  terms: AplNode[] | null;
  lineCdS: number;
  /** Per term, whether it reads talents alone: such a term says whose build the line is, not when to press. */
  talentTerms: boolean[];
}

export interface TermReading {
  truth: Truth;
  /** What the term measures: a comparison's left side, a flag's own value; null for a term that is neither. */
  value: Range | null;
  /** Per operand of an `|` or `&` term, in the order `junction` lists them. */
  parts?: TermReading[];
}

export interface Junction {
  any: boolean;
  operands: AplNode[];
}

export interface LineReading {
  truth: Truth;
  terms: TermReading[];
}

export type CastVerdict = 'on' | 'off' | 'unjudged';

export interface CastCheck {
  atS: number;
  verdict: CastVerdict;
  /** Into the button's own lines: the first that allowed the cast, else the closest one. */
  line: number;
  lines: LineReading[];
}

/** Only casts where the list's order settled what SimC presses. */
export interface OrderCheck {
  atS: number;
  expected: string;
  pressed: string;
  /** Into the expected button's own lines. */
  line: number;
  terms: TermReading[];
}

export interface LogReading {
  casts: Map<string, CastCheck[]>;
  /** The id this log cast each button under most. */
  ids: Map<string, number>;
  order: OrderCheck[];
}

@Injectable({ providedIn: 'root' })
export class ListCheckService {
  private readonly apl = inject(SimcAplService);
  private readonly evaluator = inject(ConditionEvalService);
  private readonly contexts = inject(FactContextService);
  private readonly cooldowns = inject(CooldownFacts);
  private readonly projections = inject(WclProjectionsService);
  private readonly replay = inject(VariableReplayService);

  streams(list: PriorityList): Set<FactStream> {
    const texts = [...list.lines.flatMap(line => line.terms ?? []), ...list.variables.flatMap(({ value, value_else, condition, terms }) => [value, value_else, condition, ...(terms ?? [])])];
    const names = texts.flatMap(text => {
      const node = text === undefined ? null : this.apl.parse(text);
      return node ? this.apl.identifiers(node) : [];
    });
    return new Set(names.flatMap(name => this.evaluator.readerFor(name)?.streams ?? []));
  }

  buttons(list: PriorityList): Map<string, ReadLine[]> {
    const buttons = new Map<string, ReadLine[]>();
    list.lines.forEach((line, index) => getOrInsert(buttons, line.action, (): ReadLine[] => []).push(this.parseLine(line, index)));
    return buttons;
  }

  read(ctx: FactContext): LogReading {
    const buttons = this.buttons(ctx.list);
    const lines = [...buttons.values()].flat().sort((a, b) => a.index - b.index);
    const moments = this.replay.withVariables(ctx.list, this.moments(ctx), ctx);
    const cache = new Map<string, LineReading>();
    const readLine = (line: ReadLine, moment: CastMoment): LineReading =>
      getOrInsert(cache, `${moment.index}:${line.index}`, () => this.readLine(line, moment, ctx));
    const pressedOf = this.pressedOf(ctx, [...buttons.keys()]);
    const casts = new Map<string, CastCheck[]>();
    const order: OrderCheck[] = [];
    for (const moment of moments) {
      const pressed = pressedOf.get(moment.event.abilityGameID);
      const own = pressed ? buttons.get(pressed) : undefined;
      if (pressed && own) getOrInsert(casts, pressed, (): CastCheck[] => []).push(this.castCheck(own.map(line => readLine(line, moment)), moment.atS, own));
      const decided = pressed && ctx.gcd(moment.event.abilityGameID) ? this.orderCheck(lines, pressed, moment, ctx, readLine) : null;
      if (decided) order.push({ ...decided, line: buttons.get(decided.expected)?.findIndex(line => line.index === decided.line) ?? -1 });
    }
    return { casts, order, ids: this.castIds(ctx, [...casts.keys()]) };
  }

  private parseLine(line: PlanLine, index: number): ReadLine {
    const terms = line.terms?.map(term => this.apl.parse(term));
    const parsed = terms?.every((term): term is AplNode => term !== null) ? terms : null;
    return {
      index, action: line.action, terms: parsed, lineCdS: line.line_cd ?? 0,
      talentTerms: (parsed ?? []).map(term => this.apl.identifiers(term).every(name => TALENT.test(name))),
    };
  }

  private pressedOf(ctx: FactContext, actions: string[]): Map<number, string> {
    return new Map(actions.flatMap(action => [...ctx.castIds(action)].map(id => [id, action] as const)));
  }

  /** A cast at no enemy keeps the last enemy the player aimed at, which is what SimC's own target would still be. */
  private moments(ctx: FactContext): CastMoment[] {
    const enemies = new Set(ctx.damageIndex().map(([, target]) => target));
    let target: string | null = null;
    return ctx.casts.map((event, index) => {
      const key = this.projections.targetKey(event);
      if (enemies.has(key)) target = key;
      return { atS: event.atS, event, index, target };
    });
  }

  private readLine(line: ReadLine, moment: CastMoment, ctx: FactContext): LineReading {
    if (!line.terms) return { truth: 'unknown', terms: [] };
    const terms = line.terms.map(term => this.readTerm(term, moment, line.action, ctx));
    return { truth: this.evaluator.and(...terms.map(term => term.truth)), terms };
  }

  private readTerm(term: AplNode, moment: CastMoment, action: string, ctx: FactContext): TermReading {
    const junction = this.junction(term);
    if (!junction) return { truth: this.evaluator.truthOf(term, moment, action, ctx), value: this.measured(term, moment, action, ctx) };
    const parts = junction.operands.map(operand => this.readTerm(operand, moment, action, ctx));
    const truths = parts.map(part => part.truth);
    return { truth: junction.any ? this.evaluator.or(...truths) : this.evaluator.and(...truths), value: null, parts };
  }

  /** A skip when due counts against the button like a cast off its lines. */
  rightShare(reading: LogReading, action: string): number | null {
    const judged = (reading.casts.get(action) ?? []).filter(check => check.verdict !== 'unjudged');
    const skipped = reading.order.filter(check => check.expected === action && check.pressed !== action);
    const moments = judged.length + skipped.length;
    return moments ? judged.filter(check => check.verdict === 'on').length / moments : null;
  }

  junction(term: AplNode): Junction | null {
    const operator = term.type === 'BinaryExpression' ? (term as jsep.BinaryExpression).operator : '';
    return operator === '|' || operator === '&' ? { any: operator === '|', operands: this.apl.operands(term, operator) } : null;
  }

  private measured(term: AplNode, moment: CastMoment, action: string, ctx: FactContext): Range | null {
    const subject = this.subject(term);
    return subject ? this.evaluator.value(subject, moment, action, ctx) : null;
  }

  subject(term: AplNode): AplNode | null {
    if (term.type === 'Identifier') return term;
    if (term.type === 'UnaryExpression') return this.subject((term as jsep.UnaryExpression).argument);
    const { operator, left } = term as jsep.BinaryExpression;
    return term.type === 'BinaryExpression' && COMPARISONS.has(operator) ? left : null;
  }

  /** The closest line fails the fewest terms, a line of another build ranking behind every line of the player's own. */
  private castCheck(readings: LineReading[], atS: number, lines: ReadLine[]): CastCheck {
    const allowed = readings.findIndex(reading => reading.truth === 'true');
    const rank = (reading: LineReading, index: number): number => {
      const offBuild = reading.terms.some((term, at) => lines[index]?.talentTerms[at] && term.truth === 'false');
      return (offBuild ? 1000 : 0) + reading.terms.filter(term => term.truth === 'false').length;
    };
    const closest = allowed >= 0 ? allowed : readings.reduce((best, reading, index) => (rank(reading, index) < rank(readings[best] ?? reading, best) ? index : best), 0);
    const verdict: CastVerdict = allowed >= 0 ? 'on' : readings.every(reading => reading.truth === 'false') ? 'off' : 'unjudged';
    return { atS, verdict, line: closest, lines: readings };
  }

  /** A line above the first certain one that may or may not hold leaves the moment undecided. */
  private orderCheck(
    lines: ReadLine[], pressed: string, moment: CastMoment, ctx: FactContext,
    readLine: (line: ReadLine, moment: CastMoment) => LineReading,
  ): { atS: number; expected: string; pressed: string; line: number; terms: TermReading[] } | null {
    for (const line of lines) {
      if (!this.pressable(line.action, ctx)) continue;
      const reading = readLine(line, moment);
      const state = this.evaluator.and(reading.truth, this.ready(line, moment, ctx));
      if (state === 'false') continue;
      if (state === 'unknown') return null;
      return { atS: moment.atS, expected: line.action, pressed, line: line.index, terms: reading.terms };
    }
    return null;
  }

  /** Only a button the player pressed this pull, on the global cooldown, can be what they skipped for another. */
  private pressable(action: string, ctx: FactContext): boolean {
    return !!ctx.list.spells[action]?.gcd && ctx.castTimes(action).length > 0;
  }

  /** A cost the pool may not cover reads as unknown, since talents cut costs. */
  private ready(line: ReadLine, moment: CastMoment, ctx: FactContext): Truth {
    const cooldown = this.evaluator.truth(this.cooldowns.read('cooldown_react', moment, line.action, ctx));
    const costs = (ctx.list.spells[line.action]?.costs ?? []).map(({ type, amount }) => {
      const own = this.contexts.pool(moment.event, type);
      const left = own ? own.before : ctx.resourcePool(type).filter(row => row[4] < moment.index).pop()?.[2];
      return left !== undefined && left >= amount ? 'true' : 'unknown';
    });
    const waited = line.lineCdS && ctx.castTimes(line.action).some(castS => castS < moment.atS && castS > moment.atS - line.lineCdS) ? 'unknown' : 'true';
    return this.evaluator.and(cooldown, waited, ...costs);
  }

  private castIds(ctx: FactContext, actions: string[]): Map<string, number> {
    return new Map(actions.flatMap(action => {
      const ids = ctx.castIds(action);
      const casts = ctx.casts.filter(event => ids.has(event.abilityGameID));
      return casts.length ? [[action, mode(casts, event => event.abilityGameID)] as const] : [];
    }));
  }
}
