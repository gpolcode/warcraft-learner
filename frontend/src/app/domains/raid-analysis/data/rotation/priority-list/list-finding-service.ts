import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { round } from '../../analysis/analysis-math';
import type { ConditionCheck, FindingOccurrence } from '../../analysis/analysis.models';
import type { WindowStatus } from '../../analysis/window-comparison.models';
import type { PriorityList } from '../../plan/plan.models';
import type { AplNode } from '../../simc/simc-apl-service';
import type { ButtonBench, RotationBench, ShareRange } from '../rotation-data-source';
import { CastCheck, CastVerdict, Junction, ListCheckService, LogReading, OrderCheck, ReadLine, TermReading } from './list-check-service';
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

export interface ButtonRow {
  name: string;
  spellId: number;
  icon: string;
  you: number;
  top: ShareRange;
  status: WindowStatus;
  occurrences: FindingOccurrence[];
}

@Injectable({ providedIn: 'root' })
export class ListFindingService {
  private readonly checks = inject(ListCheckService);
  private readonly evaluator = inject(ConditionEvalService);
  private readonly text = inject(ListTextService);

  /** The buttons furthest under the top raiders' average lead. */
  rows(bench: RotationBench, reading: LogReading): ButtonRow[] {
    const buttons = this.checks.buttons(bench.list);
    const rows = bench.buttons.flatMap(entry => this.row(bench, entry, buttons.get(entry.action) ?? [], reading) ?? []);
    const shortfall = (row: ButtonRow): number => row.top.avg - row.you;
    return rows.sort((a, b) => shortfall(b) - shortfall(a));
  }

  private row(bench: RotationBench, entry: ButtonBench, lines: ReadLine[], reading: LogReading): ButtonRow | null {
    const { list } = bench;
    const you = this.checks.rightShare(reading, entry.action);
    // A button whose moments the log settled none of has no share to bar, only moments it cannot judge.
    if (you === null) return null;
    const spellId = reading.ids.get(entry.action) ?? entry.spell_id;
    const icon = bench.ability_icons[spellId] ?? bench.ability_icons[entry.spell_id];
    const name = icon?.name ?? this.text.name(list, entry.action);
    const casts = (reading.casts.get(entry.action) ?? []).map(check => this.castOccurrence(list, lines, check, name));
    const skips = reading.order.filter(check => check.expected === entry.action && check.pressed !== entry.action).map(check => this.skipOccurrence(list, lines, check, name));
    const occurrences = [...casts, ...skips].sort((a, b) => a.atS - b.atS);
    return {
      name, spellId, icon: icon?.icon ?? '',
      you: round(you, SHARE_DIGITS), top: entry.right, status: this.status(you, entry.right),
      occurrences: this.thinned(occurrences),
    };
  }

  /** The burst windows' reading: under every top log is bad, under their average a warning. */
  private status(you: number, top: ShareRange): WindowStatus {
    if (you < top.lo) return 'bad';
    return you < top.avg ? 'warn' : 'good';
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

  private skipOccurrence(list: PriorityList, lines: ReadLine[], check: OrderCheck, name: string): FindingOccurrence {
    const line = lines[check.line];
    const checks = line ? this.checklist(list, line, check.terms) : [];
    const pressed = this.text.name(list, check.pressed);
    return {
      atS: round(check.atS, 3), ok: false,
      ...(checks.length
        ? { rule: this.rule(name), result: 'Skipped when due', detail: `they all held, but you pressed ${pressed} instead.` }
        : { detail: `Skipped when due. You pressed ${pressed} instead.` }),
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
