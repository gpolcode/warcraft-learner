import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { round, severityRank } from '../../analysis/analysis-math';
import type { ConditionCheck, FindingOccurrence } from '../../analysis/analysis.models';
import { PullModel, PullModelService, UnjudgedCause } from '../../analysis/pull-model-service';
import { ToneService } from '../../verdict/tone-service';
import type { FamilyCaps, RowRank, Tone } from '../../verdict/tone.models';
import { VERDICT_CHOICES } from '../../verdict/verdict-choices';
import type { PriorityList } from '../../plan/plan.models';
import type { AplNode } from '../../simc/simc-apl-service';
import type { ButtonBench, RotationBench, ShareRange } from '../rotation-data-source';
import { ButtonCounts, CastCheck, CastVerdict, Junction, ListCheckService, LogReading, MissCheck, MissKind, ReadLine, TermReading } from './list-check-service';
import { ButtonJudgeService, ROTATION_BUTTON_FAMILY } from './button-judge-service';
import { ConditionEvalService } from './condition-eval-service';
import { ListTextService } from './list-text-service';
import type { Truth } from './priority-list.models';

/** A fight can carry far more casts than a chip row should render. */
const MAX_OCCURRENCES = 24;
const SHARE_DIGITS = 3;
const FADED = 'Conditions that were not needed are faded.';

const CAST_READS: Record<CastVerdict, { result: string; detail: string; alone: string }> = {
  on: { result: 'Right time', detail: 'they did.', alone: 'Right time.' },
  off: { result: 'Wrong time', detail: 'they did not. Wait for the conditions marked with a cross.', alone: 'Wrong time. Wait for the conditions marked with a cross.' },
  unjudged: {
    result: 'Not judged', detail: 'your log does not show all of them, so this cast is not judged.',
    alone: 'The log does not show every condition, so this cast is not judged.',
  },
};

const MISS_READS: Record<MissKind, { result: string; detail: string; alone: string }> = {
  idle: { result: 'Missed while idle', detail: 'they all held, and you pressed nothing.', alone: 'Missed while idle. You pressed nothing while it was due.' },
  held: {
    result: 'Held when due', detail: 'they all held, and you did not press it before your next button.',
    alone: 'Held when due. You did not press it before your next button.',
  },
};

const UNJUDGED_MESSAGE: Record<UnjudgedCause, string> = {
  dead: 'Every moment came while you were dead, so none is judged.',
  after_wipe: 'Every moment came after the wipe, so none is judged.',
  not_reached: 'Every moment came after the boss died, so none is judged.',
};

export interface ButtonRow {
  family: string;
  name: string;
  spellId: number;
  icon: string;
  /** Null on a muted row, which judged no moment. */
  you: number | null;
  right: number;
  moments: number;
  /** Top logs the share was judged against. */
  n: number;
  top: ShareRange;
  status: Tone;
  /** Absent on a muted row. */
  rank?: RowRank;
  unjudged: UnjudgedCause | null;
  message: string;
  occurrences: FindingOccurrence[];
}

@Injectable({ providedIn: 'root' })
export class ListFindingService {
  private readonly checks = inject(ListCheckService);
  private readonly evaluator = inject(ConditionEvalService);
  private readonly text = inject(ListTextService);
  private readonly judge = inject(ButtonJudgeService);
  private readonly tones = inject(ToneService);
  private readonly pullModel = inject(PullModelService);

  /** Graded rows lead, then the most moments times the shortfall under the top raiders' average; muted rows close. */
  rows(bench: RotationBench, reading: LogReading, model: PullModel, caps?: FamilyCaps): ButtonRow[] {
    const buttons = reading.buttons ?? this.checks.buttons(bench.list);
    const judged = this.checks.within(reading, model.judgedEndS, model.aliveSpans);
    const rows = bench.buttons.flatMap(entry => this.row(bench, entry, buttons.get(entry.action) ?? [], { reading, judged, model, caps, buttons }) ?? []);
    const weight = (row: ButtonRow): number => row.you === null ? 0 : row.moments * Math.max(0, row.top.avg - row.you);
    return rows.sort((a, b) => severityRank(a.status) - severityRank(b.status) || weight(b) - weight(a));
  }

  private row(
    bench: RotationBench, entry: ButtonBench, lines: ReadLine[], pull: { reading: LogReading; judged: LogReading; model: PullModel; caps?: FamilyCaps; buttons: Map<string, ReadLine[]> },
  ): ButtonRow | null {
    const { list } = bench;
    const { reading, judged, model, buttons } = pull;
    const spellId = reading.ids.get(entry.action) ?? entry.spell_id;
    const icon = bench.ability_icons[spellId] ?? bench.ability_icons[entry.spell_id];
    const name = icon?.name ?? this.text.name(list, entry.action);
    const base = { family: ROTATION_BUTTON_FAMILY.id, name, spellId, icon: icon?.icon ?? '', top: entry.right };
    const counts = this.judge.measure(reading, entry.action, model.judgedEndS, model.aliveSpans);
    // A button whose moments the log settled none of has no share to bar, only moments it cannot judge.
    if (!counts) return this.unjudgedRow(base, reading, entry.action, model);
    const reference = this.judge.reference(bench.per_parse, entry.action);
    const evidence = this.judge.judge(counts, reference);
    const status = this.tones.tone(ROTATION_BUTTON_FAMILY, evidence, pull.caps);
    return {
      ...base, you: round(counts.right / counts.moments, SHARE_DIGITS), right: counts.right, moments: counts.moments, n: reference.length,
      status, rank: this.tones.rank(ROTATION_BUTTON_FAMILY, evidence), unjudged: null, message: `You got ${counts.right} of ${counts.moments} moments right.${this.unread(counts)}${this.against(counts, reference)}${this.aim(status, counts, evidence.target)}`,
      occurrences: this.occurrences(list, { lines, buttons }, judged, entry.action, name),
    };
  }

  private occurrences(
    list: PriorityList, own: { lines: ReadLine[]; buttons: Map<string, ReadLine[]> }, judged: LogReading, action: string, name: string,
  ): FindingOccurrence[] {
    const casts = (judged.casts.get(action) ?? []).map(check => (check.due ? this.dueOccurrence(list, own.buttons, check, check.due) : this.castOccurrence(list, own.lines, check, name)));
    const misses = judged.missed.filter(check => check.action === action).map(check => this.missOccurrence(list, own.lines, check, name));
    return this.thinned([...casts, ...misses].sort((a, b) => a.atS - b.atS));
  }

  /** Presses the log could not settle are left out of the count, so the row says how many. */
  private unread(counts: ButtonCounts): string {
    const unjudged = counts.unjudged ?? 0;
    return unjudged ? ` ${unjudged} more ${unjudged === 1 ? 'press was' : 'presses were'} not judged.` : '';
  }

  /** Muted when the log settled moments only after the judged end; nothing at all when it settled none. */
  private unjudgedRow(
    base: Pick<ButtonRow, 'family' | 'name' | 'spellId' | 'icon' | 'top'>, reading: LogReading, action: string, model: PullModel,
  ): ButtonRow | null {
    if (!this.judge.measure(reading, action, Number.POSITIVE_INFINITY)) return null;
    const unjudged = this.pullModel.causeOf(model, model.judgedEndS, Number.POSITIVE_INFINITY);
    if (!unjudged) return null;
    return {
      ...base, you: null, right: 0, moments: 0, n: 0, status: this.tones.muted(), unjudged,
      message: UNJUDGED_MESSAGE[unjudged], occurrences: [],
    };
  }

  /** Only a graded row names a target. */
  private aim(status: Tone, counts: ButtonCounts, toleratedMisses: number | null): string {
    const graded = status === 'amber' || status === 'red';
    return graded ? ` Aim for ${counts.moments - (toleratedMisses ?? 0)} or more.` : '';
  }

  /** The odds are the rate the row is judged against, weighted to the pull's enemy counts. */
  private against(counts: ButtonCounts, reference: readonly ButtonCounts[]): string {
    const n = reference.length;
    if (!n) return '';
    if (n < VERDICT_CHOICES.minReferenceN) return ` Only ${n} top logs had it, too few to judge.`;
    const rate = this.judge.expectedRate(counts, reference);
    return rate
      ? ` ${n} top logs miss about 1 in ${Math.round(1 / rate)}.`
      : ` ${n} top logs missed none of their ${reference.reduce((sum, top) => sum + top.moments, 0)}.`;
  }

  private castOccurrence(list: PriorityList, lines: ReadLine[], check: CastCheck, name: string): FindingOccurrence {
    const line = lines[check.line];
    const checks = line ? this.checklist(list, line, check.lines[check.line]?.terms ?? []) : [];
    const { result, detail, alone } = CAST_READS[check.verdict];
    const faded = check.verdict === 'on' && this.anyUnneeded(checks) ? ` ${FADED}` : '';
    return {
      atS: round(check.atS, 3), ok: check.verdict === 'on',
      ...(check.verdict === 'unjudged' ? { unjudged: true } : {}),
      ...(checks.length ? { rule: this.rule(name), result, detail: detail + faded } : { detail: alone }),
      checks,
    };
  }

  /** The due button's own conditions are what settled the press, so they are the ones shown. */
  private dueOccurrence(list: PriorityList, buttons: Map<string, ReadLine[]>, check: CastCheck, due: NonNullable<CastCheck['due']>): FindingOccurrence {
    const line = buttons.get(due.action)?.[due.line];
    const checks = line ? this.checklist(list, line, due.terms) : [];
    const dueName = this.text.name(list, due.action);
    return {
      atS: round(check.atS, 3), ok: false,
      ...(checks.length
        ? { rule: `${dueName} comes first when these conditions hold.`, result: 'Wrong time', detail: `they all held, so ${dueName} was due instead.` }
        : { detail: `Wrong time. ${dueName} was due instead.` }),
      checks,
    };
  }

  private missOccurrence(list: PriorityList, lines: ReadLine[], check: MissCheck, name: string): FindingOccurrence {
    const line = lines[check.line];
    const checks = line ? this.checklist(list, line, check.terms) : [];
    const { result, detail, alone } = MISS_READS[check.kind];
    return {
      atS: round(check.atS, 3), ok: false,
      ...(checks.length ? { rule: `${name} is due when these conditions hold.`, result, detail } : { detail: alone }),
      checks,
    };
  }

  private rule(name: string): string {
    return `${name} is only right when these conditions hold.`;
  }

  private checklist(list: PriorityList, line: ReadLine, terms: TermReading[]): ConditionCheck[] {
    const checks = this.unsettled(line.terms ?? [], terms).map(([term, reading]) => this.check(list, term, reading, line.action));
    const result = this.evaluator.and(...checks.map(check => check.truth));
    return checks.map(check => this.marked(check, result));
  }

  /** A met condition is not what to change on a missed press, so it decides only when every condition held. */
  private marked(check: ConditionCheck, result: Truth): ConditionCheck {
    const { group } = check;
    if (!group) return check.truth !== 'true' || result === 'true' ? { ...check, role: 'decisive' } : check;
    const settling = group.any ? this.settling(group.checks, check.truth) : group.checks;
    // An either-or's order never changes its result, so the options that settled it lead.
    const parts = [
      ...settling.map(part => this.marked(part, result)),
      ...group.checks.filter(part => !settling.includes(part)).map(part => this.unneeded(part)),
    ];
    return { ...check, group: { ...group, checks: parts } };
  }

  private unneeded(check: ConditionCheck): ConditionCheck {
    const { group } = check;
    return { ...check, role: 'unneeded', ...(group ? { group: { ...group, checks: group.checks.map(part => this.unneeded(part)) } } : {}) };
  }

  /** Every option tied for nearest stays, so none reads as the one to aim for over an equally near one. */
  private settling(options: ConditionCheck[], truth: Truth): ConditionCheck[] {
    if (truth !== 'false') return options.filter(option => option.truth === truth);
    const shares = options.map(option => this.metShare(option));
    const nearest = Math.max(...shares);
    return options.filter((_, at) => shares[at] === nearest);
  }

  private metShare(check: ConditionCheck): number {
    const leaves = this.leaves(check);
    return leaves.filter(leaf => leaf.truth === 'true').length / leaves.length;
  }

  private leaves(check: ConditionCheck): ConditionCheck[] {
    return check.group ? check.group.checks.flatMap(part => this.leaves(part)) : [check];
  }

  private anyUnneeded(checks: ConditionCheck[]): boolean {
    return checks.some(check => check.role === 'unneeded' || this.anyUnneeded(check.group?.checks ?? []));
  }

  /** Leaves out what the player's build alone settles, which holds on every cast. */
  private unsettled(terms: AplNode[], readings: TermReading[] | undefined): [AplNode, TermReading | undefined][] {
    return terms.flatMap((term, at) => (readings?.[at]?.build ? [] : [[term, readings?.[at]] as [AplNode, TermReading | undefined]]));
  }

  private check(list: PriorityList, term: AplNode, reading: TermReading | undefined, action: string): ConditionCheck {
    const junction = this.checks.junction(term);
    if (junction) return this.group(list, junction, reading, action);
    const text = this.text.capitalized(this.text.phrase(list, term, true, action));
    const subject = this.checks.subject(term);
    return { text, truth: reading?.truth ?? 'unknown', value: reading?.value && subject ? this.text.value(subject, reading.value, this.readsAsFlag(term)) : '' };
  }

  private group(list: PriorityList, junction: Junction, reading: TermReading | undefined, action: string): ConditionCheck {
    const checks = this.unsettled(junction.operands, reading?.parts).map(([operand, part]) => this.check(list, operand, part, action));
    // Dropping the build's own operands can leave an all-of holding a single condition.
    if (checks.length === 1 && checks[0]) return checks[0];
    // The operands read one by one below, so a nested either-or never has to be said in one sentence.
    return { text: junction.any ? 'One of' : 'All of', truth: reading?.truth ?? 'unknown', value: '', group: { any: junction.any, checks } };
  }

  /** `!(x>2)` names a subject too, yet compares it as a number rather than testing it as a flag. */
  private readsAsFlag(term: AplNode): boolean {
    return term.type === 'Identifier' || (term.type === 'UnaryExpression' && this.readsAsFlag((term as jsep.UnaryExpression).argument));
  }

  /** Keeps the strip's own share of misses, so a thinned strip never reads worse or better than the bar above it. */
  private thinned(occurrences: FindingOccurrence[]): FindingOccurrence[] {
    if (occurrences.length <= MAX_OCCURRENCES) return occurrences;
    const bad = occurrences.filter(occ => !occ.ok && !occ.unjudged);
    const rest = occurrences.filter(occ => !bad.includes(occ));
    const badKept = bad.length ? Math.max(1, Math.round(MAX_OCCURRENCES * bad.length / occurrences.length)) : 0;
    const kept = new Set([...this.even(bad, badKept), ...this.even(rest, MAX_OCCURRENCES - badKept)]);
    return occurrences.filter(occ => kept.has(occ));
  }

  private even<T>(items: T[], count: number): T[] {
    const step = items.length / count;
    return items.filter((_, index) => count > 0 && Math.floor(index / step) !== Math.floor((index - 1) / step));
  }
}
