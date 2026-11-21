import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { least, mode } from 'd3-array';
import { AliveSpan, getOrInsert } from '../../analysis/analysis-math';
import { WclProjectionsService } from '../../analysis/wcl-projections-service';
import type { ItemTable, PlanLine, PriorityList } from '../../plan/plan.models';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import { ConditionEvalService } from './condition-eval-service';
import { VariableReplayService } from './variable-replay-service';
import { FactContextService, USE_ITEM, USE_ITEMS } from './fact-context-service';
import { FactPaths } from './fact-path';
import { VERDICT_CHOICES } from '../../verdict/verdict-choices';
import type { CastMoment, FactContext, FactStream, Range, Truth } from './priority-list.models';

const COMPARISONS = new Set(['=', '==', '!=', '<', '<=', '>', '>=']);
/** Past any line's count of failing ordinary terms, so one failing situation term outweighs them all. */
const SITUATION_MISS_WEIGHT = 100;
/** Past any line's situation misses, so a line of another build ranks behind every line of the player's own. */
const OFF_BUILD_WEIGHT = 10_000;

export interface ReadLine {
  /** Across the whole list, not the button's own lines. */
  index: number;
  action: string;
  terms: AplNode[] | null;
  lineCdS: number;
  /** Per term, whether it reads talents alone: such a term says whose build the line is, not when to press. */
  talentTerms: boolean[];
  /** Per term, whether it reads the encounter's state rather than the player's: failing, it says the line is for another situation. */
  situationTerms: boolean[];
}

export interface TermReading {
  truth: Truth;
  /** The player's talents alone make the term hold: it says whose build the line is, not when to press. */
  build?: true;
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

/** The enemy count a moment was read under: one enemy, several, or a count the timeline and the player's hits leave open. */
export type EnemyStratum = 'single' | 'multi' | 'unknown';

/** A higher button whose line certainly held while it was ready, and the reading that settled it. */
export interface DueButton {
  action: string;
  /** Into the due button's own lines. */
  line: number;
  terms: TermReading[];
}

export interface CastCheck {
  atS: number;
  verdict: CastVerdict;
  /** Into the button's own lines: the first that allowed the cast, else the closest one. */
  line: number;
  lines: LineReading[];
  /** Set on a press the list ranked below a button that was due, which makes the press itself off. */
  due?: DueButton;
  stratum?: EnemyStratum;
}

/** `idle`: the player pressed nothing past the reaction allowance while the button was due; `held`: an off-GCD button stayed unpressed from one decision to the next while due. */
export type MissKind = 'idle' | 'held';

/** A decision with no press of its own, charged to the button that was due. */
export interface MissCheck extends DueButton {
  atS: number;
  kind: MissKind;
  stratum?: EnemyStratum;
}

export interface StratumCounts {
  right: number;
  moments: number;
  unjudged: number;
}

export interface ButtonCounts {
  right: number;
  moments: number;
  /** Presses the log could not settle, left out of `moments`; absent on a bench before they were baked. */
  unjudged?: number;
  strata?: Partial<Record<EnemyStratum, StratumCounts>>;
}

export interface LogReading {
  casts: Map<string, CastCheck[]>;
  /** The id this log cast each button under most. */
  ids: Map<string, number>;
  missed: MissCheck[];
  /** The list's buttons with each trinket line resolved to the trinket this log wore; absent, the bench list's own buttons stand. */
  buttons?: Map<string, ReadLine[]>;
  /** The item data of the trinkets this log wore that the list has no entry for, so ingest can bake them. */
  items?: ItemTable;
}

interface Decision {
  moment: CastMoment;
  /** An idle point, or a press on the global cooldown: both are where SimC picks the next button. */
  gcd: boolean;
  idle: boolean;
}

@Injectable({ providedIn: 'root' })
export class ListCheckService {
  private readonly apl = inject(SimcAplService);
  private readonly evaluator = inject(ConditionEvalService);
  private readonly contexts = inject(FactContextService);
  private readonly projections = inject(WclProjectionsService);
  private readonly replay = inject(VariableReplayService);

  streams(list: PriorityList): Set<FactStream> {
    const texts = [...list.lines.flatMap(line => line.terms ?? []), ...list.variables.flatMap(({ value, value_else, condition, terms }) => [value, value_else, condition, ...(terms ?? [])])];
    const names = texts.flatMap(text => {
      const node = text === undefined ? null : this.apl.parse(text);
      return node ? this.apl.identifiers(node) : [];
    });
    const trinkets = list.lines.some(line => line.action === USE_ITEM || line.action === USE_ITEMS) ? ['gear' as const] : [];
    return new Set([...names.flatMap(name => this.evaluator.streams(name)), ...trinkets]);
  }

  buttons(list: PriorityList): Map<string, ReadLine[]> {
    const buttons = new Map<string, ReadLine[]>();
    list.lines.forEach((line, index) => getOrInsert(buttons, line.action, (): ReadLine[] => []).push(this.parseLine(line, index)));
    return buttons;
  }

  read(ctx: FactContext): LogReading {
    const buttons = this.buttons(ctx.list);
    const lines = [...buttons.values()].flat().sort((a, b) => a.index - b.index);
    const decisions = this.decisions(ctx);
    const seen = decisions.map(decision => decision.moment);
    const moments = this.replay.withVariables(ctx.list, seen, ctx);
    const reacted = this.replay.withVariables(ctx.list, seen.map(moment => ({ ...moment, reactS: VERDICT_CHOICES.reactionS })), ctx);
    const cache = new Map<string, LineReading>();
    const readAt = (at: number) => (line: ReadLine, late = false): LineReading => {
      const moment = (late ? reacted : moments)[at];
      return moment ? getOrInsert(cache, `${at}:${line.index}:${late}`, () => this.readLine(line, moment, ctx)) : { truth: 'unknown', terms: [] };
    };
    const pressedOf = this.pressedOf(ctx, [...buttons.keys()]);
    const casts = new Map<string, CastCheck[]>();
    const missed: MissCheck[] = [];
    decisions.forEach((decision, at) => {
      const late = reacted[at] ?? decision.moment;
      const read = readAt(at);
      const stratum = this.stratum(late, ctx);
      const due = decision.gcd ? this.due(lines, late, ctx, line => read(line, true), buttons) : null;
      if (decision.idle) {
        if (due) missed.push({ ...due, atS: late.atS, kind: 'idle', stratum });
        return;
      }
      const pressed = pressedOf.get(late.event.abilityGameID);
      const own = pressed ? buttons.get(pressed) : undefined;
      if (!pressed || !own) return;
      const check = this.castCheck(own.map(line => read(line)), own.map(line => read(line, true)), late.atS, own, due?.action === pressed ? null : due);
      getOrInsert(casts, pressed, (): CastCheck[] => []).push({ ...check, stratum });
    });
    missed.push(...this.held(buttons, decisions, reacted, ctx, readAt));
    return { casts, missed: missed.sort((a, b) => a.atS - b.atS), buttons, ids: this.castIds(ctx, [...casts.keys()]) };
  }

  private parseLine(line: PlanLine, index: number): ReadLine {
    const terms = line.terms?.map(term => this.apl.parse(term));
    const parsed = terms?.every((term): term is AplNode => term !== null) ? terms : null;
    return {
      index, action: line.action, terms: parsed, lineCdS: line.line_cd ?? 0,
      talentTerms: (parsed ?? []).map(term => this.apl.identifiers(term).every(name => FactPaths.build(FactPaths.path(name, line.action)))),
      situationTerms: (parsed ?? []).map(term => this.apl.identifiers(term).some(name => FactPaths.situation(FactPaths.path(name, line.action)))),
    };
  }

  private pressedOf(ctx: FactContext, actions: string[]): Map<number, string> {
    return new Map(actions.flatMap(action => [...ctx.castIds(action)].map(id => [id, action] as const)));
  }

  /** A cast at no enemy keeps the last enemy the player aimed at, which is what SimC's own target would still be. A hardcast is SimC's choice at its begincast, so its moment is there; an idle stretch longer than the reaction allowance passes one decision point, the allowance after it opened. */
  private decisions(ctx: FactContext): Decision[] {
    const enemies = new Set(ctx.damageIndex().map(([, target]) => target));
    const startsS = ctx.castStartsS();
    const reactS = VERDICT_CHOICES.reactionS;
    const idle = ctx.idleSpans().filter(([startS, endS]) => endS > startS + reactS).map(([startS]) => startS + reactS);
    const points = [
      ...ctx.casts.map((event, index) => ({ atS: startsS[index] ?? event.atS, event, index, idle: false })),
      ...idle.map(atS => ({ atS, event: { type: 'idle', timestamp: 0, abilityGameID: 0, atS }, index: this.castsBefore(ctx, atS), idle: true })),
    ].sort((a, b) => a.atS - b.atS || Number(a.idle) - Number(b.idle));
    let target: string | null = null;
    return points.map(({ idle: isIdle, ...point }) => {
      const key = isIdle ? '' : this.projections.targetKey(point.event);
      if (enemies.has(key)) target = key;
      return { moment: { ...point, target }, idle: isIdle, gcd: isIdle || !!ctx.gcd(point.event.abilityGameID) };
    });
  }

  /** So an idle point's casts before it are a slice, as a press's are. */
  private castsBefore(ctx: FactContext, atS: number): number {
    const after = ctx.casts.findIndex(event => event.atS > atS);
    return after < 0 ? ctx.casts.length : after;
  }

  /** Under the encounter timeline where one is baked, so the stratum says what the boss put up, not what the player hit. */
  private stratum(moment: CastMoment, ctx: FactContext): EnemyStratum {
    const [lo, hi] = this.evaluator.read('active_enemies', moment, '', ctx);
    return hi <= 1 ? 'single' : lo >= 2 ? 'multi' : 'unknown';
  }

  /** Off-GCD buttons are their own decisions: one held from a decision to the next while due is one miss per stretch between its presses, however long it sat ready. */
  private held(
    buttons: Map<string, ReadLine[]>, decisions: Decision[], reacted: CastMoment[], ctx: FactContext,
    readAt: (at: number) => (line: ReadLine, late?: boolean) => LineReading,
  ): MissCheck[] {
    const points = decisions.flatMap((decision, at) => (decision.gcd ? [{ at, moment: reacted[at] ?? decision.moment }] : []));
    const reactS = VERDICT_CHOICES.reactionS;
    return [...buttons].flatMap(([action, own]) => {
      if (ctx.list.spells[action]?.gcd !== 0 || !this.owned(action, ctx)) return [];
      const pressesS = ctx.castTimes(action);
      const charged = new Set<number>();
      return points.flatMap(({ at, moment }, k) => {
        const sinceS = pressesS.filter(castS => castS < moment.atS).pop() ?? -Infinity;
        const nextS = points[k + 1]?.moment.atS ?? Infinity;
        if (charged.has(sinceS) || pressesS.some(castS => castS >= moment.atS && castS <= nextS + reactS)) return [];
        const read = readAt(at);
        const line = own.findIndex(entry => this.evaluator.and(read(entry, true).truth, this.ready(entry, moment, ctx)) === 'true');
        const reading = own[line] ? read(own[line], true) : null;
        if (!reading) return [];
        charged.add(sinceS);
        return [{ action, line, terms: reading.terms, atS: moment.atS, kind: 'held' as const, stratum: this.stratum(moment, ctx) }];
      });
    });
  }

  /** A talent button counts only for a player whose talents pick it; with no talent tree in the log, only a button they pressed. */
  private owned(action: string, ctx: FactContext): boolean {
    if (ctx.castTimes(action).length) return true;
    const talent = ctx.list.talents[`talent.${action}`];
    if (!talent) return true;
    const picked = ctx.talents;
    return !!picked && talent.entries.some(entry => (picked.get(entry) ?? 0) > 0);
  }

  private readLine(line: ReadLine, moment: CastMoment, ctx: FactContext): LineReading {
    if (!line.terms) return { truth: 'unknown', terms: [] };
    const terms = line.terms.map(term => this.readTerm(term, moment, line.action, ctx));
    return { truth: this.evaluator.and(...terms.map(term => term.truth)), terms };
  }

  private readTerm(term: AplNode, moment: CastMoment, action: string, ctx: FactContext): TermReading {
    const build = this.buildTruth(term, moment, action, ctx) === 'true' ? { build: true as const } : {};
    const junction = this.junction(term);
    if (!junction) return { truth: this.evaluator.truthOf(term, moment, action, ctx), value: this.measured(term, moment, action, ctx), ...build };
    const parts = junction.operands.map(operand => this.readTerm(operand, moment, action, ctx));
    const truths = parts.map(part => part.truth);
    return { truth: junction.any ? this.evaluator.or(...truths) : this.evaluator.and(...truths), value: null, parts, ...build };
  }

  /** The term read with every name but a talent unknown. */
  private buildTruth(term: AplNode, moment: CastMoment, action: string, ctx: FactContext): Truth {
    if (term.type === 'UnaryExpression' && (term as jsep.UnaryExpression).operator === '!') {
      const inner = this.buildTruth((term as jsep.UnaryExpression).argument, moment, action, ctx);
      return inner === 'unknown' ? inner : inner === 'true' ? 'false' : 'true';
    }
    const junction = this.junction(term);
    if (junction) {
      const parts = junction.operands.map(operand => this.buildTruth(operand, moment, action, ctx));
      return junction.any ? this.evaluator.or(...parts) : this.evaluator.and(...parts);
    }
    const names = this.apl.identifiers(term);
    return names.length && names.every(name => FactPaths.build(FactPaths.path(name, action))) ? this.evaluator.truthOf(term, moment, action, ctx) : 'unknown';
  }

  /** A skip when due counts against the button like a cast off its lines. */
  rightShare(reading: LogReading, action: string): number | null {
    const counts = this.rightCounts(reading, action);
    return counts ? counts.right / counts.moments : null;
  }

  /** The reading cut to the moments at or before `endS`, so nothing after the judged end counts; with `alive`, a miss while dead is no decision. */
  within(reading: LogReading, endS: number, alive?: readonly AliveSpan[]): LogReading {
    const casts = new Map([...reading.casts].map(([action, checks]) => [action, checks.filter(check => check.atS <= endS)]));
    const living = (atS: number): boolean => !alive || alive.some(([fromS, toS]) => fromS <= atS && atS <= toS);
    return { ...reading, casts, missed: reading.missed.filter(check => check.atS <= endS && living(check.atS)) };
  }

  /** A button's moments are its judged presses plus the decisions it was due at with nothing pressed; null when it had none. */
  rightCounts(reading: LogReading, action: string): ButtonCounts | null {
    const presses = reading.casts.get(action) ?? [];
    const missed = reading.missed.filter(check => check.action === action);
    const tally = (checks: readonly CastCheck[], misses: readonly MissCheck[]): StratumCounts => {
      const judged = checks.filter(check => check.verdict !== 'unjudged');
      return { right: judged.filter(check => check.verdict === 'on').length, moments: judged.length + misses.length, unjudged: checks.length - judged.length };
    };
    const counts = tally(presses, missed);
    if (!counts.moments) return null;
    const strata = Object.fromEntries((['single', 'multi', 'unknown'] as const).flatMap(stratum => {
      const own = tally(presses.filter(check => check.stratum === stratum), missed.filter(check => check.stratum === stratum));
      return own.moments || own.unjudged ? [[stratum, own]] : [];
    }));
    return Object.keys(strata).length ? { ...counts, strata } : counts;
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

  /** Off when a higher button was due; else on when a line holds as the log stands; off only when every line still fails with the facts that changed inside the reaction allowance unknown, since a player cannot answer what they had no time to see. */
  private castCheck(seen: LineReading[], reacted: LineReading[], atS: number, lines: ReadLine[], due: DueButton | null): CastCheck {
    if (due) return { atS, verdict: 'off', line: this.closest(reacted, lines), lines: reacted, due };
    const allowed = seen.findIndex(reading => reading.truth === 'true');
    if (allowed >= 0) return { atS, verdict: 'on', line: allowed, lines: seen };
    const verdict: CastVerdict = reacted.every(reading => reading.truth === 'false') ? 'off' : 'unjudged';
    return { atS, verdict, line: this.closest(reacted, lines), lines: reacted };
  }

  /** A tie goes to the line more of whose terms hold, as it matches more of the moment, then to the earlier line. */
  private closest(readings: LineReading[], lines: ReadLine[]): number {
    const ranked = readings.map((reading, index) => {
      const line = lines[index];
      const failing = reading.terms.flatMap((term, at) => (term.truth === 'false' ? [at] : []));
      const situation = failing.filter(at => line?.situationTerms[at]).length;
      const offBuild = failing.some(at => line?.talentTerms[at]);
      const misses = (offBuild ? OFF_BUILD_WEIGHT : 0) + situation * SITUATION_MISS_WEIGHT + failing.length - situation;
      return { index, misses, holds: reading.terms.filter(term => term.truth === 'true').length };
    });
    return least(ranked, (a, b) => a.misses - b.misses || b.holds - a.holds || a.index - b.index)?.index ?? 0;
  }

  /** The first button the list certainly presses; a line above it that may or may not hold leaves the moment undecided. */
  private due(
    lines: ReadLine[], moment: CastMoment, ctx: FactContext, readLine: (line: ReadLine) => LineReading, buttons: Map<string, ReadLine[]>,
  ): DueButton | null {
    for (const line of lines) {
      if (!this.pressable(line.action, ctx)) continue;
      const reading = readLine(line);
      const state = this.evaluator.and(reading.truth, this.ready(line, moment, ctx));
      if (state === 'false') continue;
      if (state === 'unknown') return null;
      return { action: line.action, line: buttons.get(line.action)?.indexOf(line) ?? -1, terms: reading.terms };
    }
    return null;
  }

  /** A button on the global cooldown the player owns competes for each press, pressed this pull or not: its cooldown says whether it was ready. */
  private pressable(action: string, ctx: FactContext): boolean {
    return !!ctx.list.spells[action]?.gcd && this.owned(action, ctx);
  }

  /** A cost the pool may not cover reads as unknown, since talents cut costs. */
  private ready(line: ReadLine, moment: CastMoment, ctx: FactContext): Truth {
    const cooldown = this.evaluator.truth(this.evaluator.read('cooldown_react', moment, line.action, ctx));
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
