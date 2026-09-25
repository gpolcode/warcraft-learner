import { Injectable, inject } from '@angular/core';
import { greatest, mode, rollup } from 'd3-array';
import { round } from '../../analysis/analysis-math';
import type { ConditionCheck, FindingOccurrence, LineSplit } from '../../analysis/analysis.models';
import type { FindingRow, OnPlanChip } from '../../analysis/finding-rows-service';
import type { PriorityList } from '../../plan/plan.models';
import type { ButtonBench, LineBench, RotationBench } from '../rotation-data-source';
import { CastCheck, ListCheckService, LogReading, OrderCheck, ReadLine, TermReading } from './list-check-service';
import { ListTextService } from './list-text-service';

/** Cap on a finding's cast strip - a fight can carry far more casts than a chip row should render. */
const MAX_OCCURRENCES = 24;

type Judged = FindingRow | 'passed' | null;

/** Judges one log's reading against the bench: a finding per button pressed off its lines or skipped in the order more often than the top logs allow. */
@Injectable({ providedIn: 'root' })
export class ListFindingService {
  private readonly checks = inject(ListCheckService);
  private readonly text = inject(ListTextService);

  judge(bench: RotationBench, reading: LogReading): { rows: FindingRow[]; onPlan: OnPlanChip[] } {
    const buttons = this.checks.buttons(bench.list);
    const rows: FindingRow[] = [];
    const onPlan: OnPlanChip[] = [];
    for (const entry of bench.buttons) {
      const lines = buttons.get(entry.action) ?? [];
      const judged = [this.castRow(bench.list, entry, lines, reading), this.orderRow(bench.list, entry, lines, reading)];
      const found = judged.filter((row): row is FindingRow => typeof row === 'object' && row !== null);
      rows.push(...found);
      if (!found.length && judged.includes('passed')) onPlan.push(this.chip(bench, entry, reading));
    }
    return { rows, onPlan };
  }

  private castRow(list: PriorityList, entry: ButtonBench, lines: ReadLine[], reading: LogReading): Judged {
    const casts = reading.casts.get(entry.action) ?? [];
    const judged = casts.filter(check => check.verdict !== 'unjudged');
    if (entry.off_tolerance === null || !judged.length) return null;
    const off = judged.filter(check => check.verdict === 'off');
    if (!off.length || off.length / judged.length <= entry.off_tolerance) return 'passed';
    const [lineAt, termAt] = this.mostFailed(off);
    const line = lines[lineAt];
    return {
      severity: 'warning', icon: '', chip: 'conditions',
      what: this.offTitle(list, entry.action, line, termAt),
      measured: { value: `${off.length} / ${judged.length}`, unit: 'casts off the list' },
      timestampS: off[0]?.atS ?? null,
      fix: line && this.text.instruction(list, line),
      occurrences: this.thinned(casts.map(check => this.castOccurrence(list, entry, lines, check))),
      occurrenceTarget: this.topRate(entry.off_tolerance, 'cast it off the list'),
      lines: this.split(list, entry, lines, reading),
    };
  }

  /** The button and the term its off-list casts failed most, as what went wrong: `Black Powder below 6 combo points`. */
  private offTitle(list: PriorityList, action: string, line: ReadLine | undefined, termAt: number): string {
    const failed = line?.terms?.[termAt];
    const name = this.text.name(list, action);
    return failed ? `${name} ${this.text.phrase(list, failed, false, action)}` : `${name} off the list`;
  }

  private orderRow(list: PriorityList, entry: ButtonBench, lines: ReadLine[], reading: LogReading): Judged {
    const decided = reading.order.filter(check => check.expected === entry.action);
    if (entry.skip_tolerance === null || !decided.length) return null;
    const skipped = decided.filter(check => check.pressed !== entry.action);
    if (!skipped.length || skipped.length / decided.length <= entry.skip_tolerance) return 'passed';
    const line = lines[mode(skipped, check => check.line)];
    const name = this.text.name(list, entry.action);
    return {
      severity: 'warning', icon: '', chip: 'order',
      what: `${name} skipped for a lower button`,
      measured: { value: `${skipped.length} / ${decided.length}`, unit: 'times skipped' },
      timestampS: skipped[0]?.atS ?? null,
      fix: line ? `Press ${name} ahead of lower buttons ${this.text.sentence(list, line, true)}.` : undefined,
      occurrences: this.thinned(decided.map(check => this.orderOccurrence(list, entry, lines, check))),
      occurrenceTarget: this.topRate(entry.skip_tolerance, 'skip it'),
    };
  }

  /** The line and term that failed most often across the off-list casts, so the title names the usual miss. */
  private mostFailed(off: CastCheck[]): [number, number] {
    const failures = off.flatMap(check => (check.lines[check.line]?.terms ?? []).flatMap((term, at) => (term.truth === 'false' ? [`${check.line}:${at}`] : [])));
    const counts = rollup(failures, same => same.length, key => key);
    const top = greatest([...counts], ([, count]) => count)?.[0];
    if (!top) return [mode(off, check => check.line), -1];
    const [lineAt = 0, termAt = -1] = top.split(':').map(Number);
    return [lineAt, termAt];
  }

  private castOccurrence(list: PriorityList, entry: ButtonBench, lines: ReadLine[], check: CastCheck): FindingOccurrence {
    const line = lines[check.line];
    const terms = check.lines[check.line]?.terms ?? [];
    const wanted = check.verdict === 'off' ? 'false' : check.verdict === 'unjudged' ? 'unknown' : null;
    const headline = terms.findIndex((term, at) => (wanted ? term.truth === wanted : !line?.talentTerms[at] && term.value));
    const detail = {
      on: 'The line that allowed this cast:',
      off: 'No line of the list allowed this cast. The closest one:',
      unjudged: 'The log cannot settle whether a line allowed this cast. The closest one:',
    }[check.verdict];
    return {
      atS: round(check.atS, 3), ok: check.verdict === 'on', label: this.short(terms[headline]),
      ...(check.verdict === 'unjudged' ? { unjudged: true } : {}),
      detail, checks: line ? this.checklist(list, line, terms, entry.lines[check.line]?.spreads) : [],
    };
  }

  private orderOccurrence(list: PriorityList, entry: ButtonBench, lines: ReadLine[], check: OrderCheck): FindingOccurrence {
    const kept = check.pressed === entry.action;
    const line = lines[check.line];
    return {
      atS: round(check.atS, 3), ok: kept, label: kept ? 'kept' : 'skipped',
      detail: kept ? 'Its line led the list and you pressed it.' : `Its line led the list and it was ready, and you pressed ${this.text.name(list, check.pressed)}.`,
      checks: line ? this.checklist(list, line, check.terms, entry.lines[check.line]?.spreads) : [],
    };
  }

  /** Each term with what the log shows for it, and where the top logs' casts put it. */
  private checklist(list: PriorityList, line: ReadLine, terms: TermReading[], spreads: LineBench['spreads'] = []): ConditionCheck[] {
    return (line.terms ?? []).map((term, at) => {
      const reading = terms[at];
      const subject = this.checks.subject(term);
      const spread = spreads[at];
      return {
        text: this.text.capitalized(this.text.phrase(list, term, true, line.action)),
        truth: reading?.truth ?? 'unknown',
        value: reading?.value && subject ? this.text.value(subject, reading.value) : '',
        ...(spread && subject ? { top: this.text.value(subject, spread) } : {}),
      };
    });
  }

  private split(list: PriorityList, entry: ButtonBench, lines: ReadLine[], reading: LogReading): LineSplit[] {
    const on = (reading.casts.get(entry.action) ?? []).filter(check => check.verdict === 'on');
    return lines.map((line, index) => ({
      text: this.text.capitalized(this.text.sentence(list, line)),
      build: reading.builds.get(entry.action)?.[index] ?? 'unknown',
      you: on.length ? round(on.filter(check => check.line === index).length / on.length, 3) : null,
      top: entry.lines[index]?.allowed ?? null,
    }));
  }

  private chip(bench: RotationBench, entry: ButtonBench, reading: LogReading): OnPlanChip {
    const spellId = reading.ids.get(entry.action) ?? entry.spell_id;
    const icon = bench.ability_icons[spellId] ?? bench.ability_icons[entry.spell_id];
    return { name: icon?.name ?? this.text.name(bench.list, entry.action), spellId, icon: icon?.icon ?? '' };
  }

  /** A strip chip's label is the measured value alone: `5`, `yes`, or a dash where the log cannot say. */
  private short(term: TermReading | undefined): string {
    if (!term?.value) return ({ true: 'yes', false: 'no', unknown: '-' } as const)[term?.truth ?? 'unknown'];
    const [lo, hi] = term.value;
    if (lo === -Infinity && hi === Infinity) return '-';
    if (lo === hi) return String(round(lo, 1));
    return hi === Infinity ? `${round(lo, 1)}+` : `${round(lo, 1)}-${round(hi, 1)}`;
  }

  /** A share as odds, since "1 in 10" lands faster than "10%" for a miss rate. */
  private topRate(share: number, miss: string): string {
    return share > 0 ? `Top raiders ${miss} at most 1 in ${Math.max(2, Math.round(1 / share))} times.` : `Top raiders never ${miss}.`;
  }

  /** Thins to at most MAX_OCCURRENCES without ever dropping a failing cast in favor of a passing one. */
  private thinned(occurrences: FindingOccurrence[]): FindingOccurrence[] {
    if (occurrences.length <= MAX_OCCURRENCES) return occurrences;
    const bad = occurrences.filter(occ => !occ.ok && !occ.unjudged);
    const rest = occurrences.filter(occ => !bad.includes(occ));
    const kept = new Set([...this.even(bad, MAX_OCCURRENCES), ...this.even(rest, Math.max(0, MAX_OCCURRENCES - bad.length))]);
    return occurrences.filter(occ => kept.has(occ));
  }

  private even<T>(items: T[], count: number): T[] {
    const step = items.length / count;
    return items.filter((_, index) => count > 0 && Math.floor(index / step) !== Math.floor((index - 1) / step));
  }
}
