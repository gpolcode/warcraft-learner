import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { round } from '../../analysis/analysis-math';
import type { ConditionCheck, FindingOccurrence } from '../../analysis/analysis.models';
import type { WindowStatus } from '../../analysis/window-comparison.models';
import type { PriorityList } from '../../plan/plan.models';
import type { AplNode } from '../../simc/simc-apl-service';
import type { ButtonBench, RotationBench, ShareRange } from '../rotation-data-source';
import { CastCheck, ListCheckService, LogReading, OrderCheck, ReadLine, TermReading } from './list-check-service';
import { ListTextService } from './list-text-service';

/** A fight can carry far more casts than a chip row should render. */
const MAX_OCCURRENCES = 24;
const SHARE_DIGITS = 3;

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
    const casts = (reading.casts.get(entry.action) ?? []).map(check => this.castOccurrence(list, lines, check));
    const skips = reading.order.filter(check => check.expected === entry.action && check.pressed !== entry.action).map(check => this.skipOccurrence(list, lines, check));
    const occurrences = [...casts, ...skips].sort((a, b) => a.atS - b.atS);
    const you = this.checks.rightShare(reading, entry.action);
    // A button whose moments the log settled none of has no share to bar, only moments it cannot judge.
    if (you === null) return null;
    const spellId = reading.ids.get(entry.action) ?? entry.spell_id;
    const icon = bench.ability_icons[spellId] ?? bench.ability_icons[entry.spell_id];
    return {
      name: icon?.name ?? this.text.name(list, entry.action), spellId, icon: icon?.icon ?? '',
      you: round(you, SHARE_DIGITS), top: entry.right, status: this.status(you, entry.right),
      occurrences: this.thinned(occurrences),
    };
  }

  /** The burst windows' reading: under every top log is bad, under their average a warning. */
  private status(you: number, top: ShareRange): WindowStatus {
    if (you < top.lo) return 'bad';
    return you < top.avg ? 'warn' : 'good';
  }

  private castOccurrence(list: PriorityList, lines: ReadLine[], check: CastCheck): FindingOccurrence {
    const line = lines[check.line];
    const detail = {
      on: 'Right time.',
      off: 'Wrong time. Wait for the conditions marked with a cross.',
      unjudged: 'The log does not show every condition, so this cast is not judged.',
    }[check.verdict];
    return {
      atS: round(check.atS, 3), ok: check.verdict === 'on',
      ...(check.verdict === 'unjudged' ? { unjudged: true } : {}),
      detail, checks: line ? this.checklist(list, line, check.lines[check.line]?.terms ?? []) : [],
    };
  }

  private skipOccurrence(list: PriorityList, lines: ReadLine[], check: OrderCheck): FindingOccurrence {
    const line = lines[check.line];
    return {
      atS: round(check.atS, 3), ok: false,
      detail: `Skipped when due. You pressed ${this.text.name(list, check.pressed)} instead.`,
      checks: line ? this.checklist(list, line, check.terms) : [],
    };
  }

  private checklist(list: PriorityList, line: ReadLine, terms: TermReading[]): ConditionCheck[] {
    return this.unsettled(line.terms ?? [], terms).map(([term, reading]) => this.check(list, term, reading, line.action));
  }

  /** Leaves out what the player's build alone settles, which holds on every cast. */
  private unsettled(terms: AplNode[], readings: TermReading[] | undefined): [AplNode, TermReading | undefined][] {
    return terms.flatMap((term, at) => (readings?.[at]?.build ? [] : [[term, readings?.[at]] as [AplNode, TermReading | undefined]]));
  }

  private check(list: PriorityList, term: AplNode, reading: TermReading | undefined, action: string): ConditionCheck {
    const truth = reading?.truth ?? 'unknown';
    const junction = this.checks.junction(term);
    if (junction) {
      const checks = this.unsettled(junction.operands, reading?.parts).map(([operand, part]) => this.check(list, operand, part, action));
      // The operands read one by one below, so a nested either-or never has to be said in one sentence.
      return { text: junction.any ? 'Any one of these' : 'All of these', truth, value: '', group: { any: junction.any, checks } };
    }
    const text = this.text.capitalized(this.text.phrase(list, term, true, action));
    const subject = this.checks.subject(term);
    const value = reading?.value && subject ? this.text.value(subject, reading.value, this.readsAsFlag(term)) : '';
    return { text, truth, value, ...(this.text.unphrased(text) ? { raw: true as const } : {}) };
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
