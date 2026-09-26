import { Injectable, inject } from '@angular/core';
import { round } from '../../analysis/analysis-math';
import type { ConditionCheck, FindingOccurrence, LineSplit } from '../../analysis/analysis.models';
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
  /** Null where the log settled none of the button's moments. */
  you: number | null;
  top: ShareRange;
  occurrences: FindingOccurrence[];
  lines: LineSplit[];
}

@Injectable({ providedIn: 'root' })
export class ListFindingService {
  private readonly checks = inject(ListCheckService);
  private readonly text = inject(ListTextService);

  /** The buttons furthest under the top raiders' average lead. */
  rows(bench: RotationBench, reading: LogReading): ButtonRow[] {
    const buttons = this.checks.buttons(bench.list);
    const rows = bench.buttons.flatMap(entry => this.row(bench, entry, buttons.get(entry.action) ?? [], reading) ?? []);
    const shortfall = (row: ButtonRow): number => row.top.avg - (row.you ?? row.top.avg);
    return rows.sort((a, b) => shortfall(b) - shortfall(a));
  }

  private row(bench: RotationBench, entry: ButtonBench, lines: ReadLine[], reading: LogReading): ButtonRow | null {
    const { list } = bench;
    const casts = (reading.casts.get(entry.action) ?? []).map(check => this.castOccurrence(list, lines, check));
    const skips = reading.order.filter(check => check.expected === entry.action && check.pressed !== entry.action).map(check => this.skipOccurrence(list, lines, check));
    const occurrences = [...casts, ...skips].sort((a, b) => (a.atS ?? 0) - (b.atS ?? 0));
    if (!occurrences.length) return null;
    const you = this.checks.rightShare(reading, entry.action);
    const spellId = reading.ids.get(entry.action) ?? entry.spell_id;
    const icon = bench.ability_icons[spellId] ?? bench.ability_icons[entry.spell_id];
    return {
      name: icon?.name ?? this.text.name(list, entry.action), spellId, icon: icon?.icon ?? '',
      you: you === null ? null : round(you, SHARE_DIGITS), top: entry.right,
      occurrences: this.thinned(occurrences), lines: this.split(list, entry, lines, reading),
    };
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
    return (line.terms ?? []).map((term, at) => this.check(list, term, terms[at], line.action));
  }

  private check(list: PriorityList, term: AplNode, reading: TermReading | undefined, action: string): ConditionCheck {
    const text = this.text.capitalized(this.text.phrase(list, term, true, action));
    const truth = reading?.truth ?? 'unknown';
    const junction = this.checks.junction(term);
    if (junction) {
      const checks = junction.operands.map((operand, at) => this.check(list, operand, reading?.parts?.[at], action));
      return { text, truth, value: '', group: { any: junction.any, checks } };
    }
    const subject = this.checks.subject(term);
    return { text, truth, value: reading?.value && subject ? this.text.value(subject, reading.value, term.type !== 'BinaryExpression') : '' };
  }

  /** A single line the player's build can press leaves nothing to compare. */
  private split(list: PriorityList, entry: ButtonBench, lines: ReadLine[], reading: LogReading): LineSplit[] {
    const on = (reading.casts.get(entry.action) ?? []).filter(check => check.verdict === 'on');
    const builds = reading.builds.get(entry.action) ?? [];
    const split = lines.flatMap((line, index) => (!line.terms || builds[index] === 'false' ? [] : [{
      text: this.text.capitalized(this.text.sentence(list, line, builds[index] === 'true')),
      you: on.length ? round(on.filter(check => check.line === index).length / on.length, SHARE_DIGITS) : null,
      top: entry.allowed[index] ?? null,
    }]));
    return split.length > 1 ? split : [];
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
