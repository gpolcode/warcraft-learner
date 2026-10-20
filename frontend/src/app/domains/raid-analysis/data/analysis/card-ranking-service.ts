import { inject, Injectable } from '@angular/core';
import { FINDING_REGISTRY } from '../verdict/finding-registry';
import { CardRanking, RankedRow } from '../verdict/row-order-service';
import type { RowRank, Tone } from '../verdict/tone.models';
import type { ButtonRow } from '../rotation/priority-list/list-finding-service';
import type { EnchantRow, GearVerdict } from '../gear/gear-judge-service';
import { fmtClock } from './analysis-math';
import type { FindingRow } from './finding-rows-service';
import { FoldCounts, PullModelService, UnjudgedCause } from './pull-model-service';
import type { ComparisonWindow, WindowStatus } from './window-comparison.models';

const LABEL_OF = new Map(FINDING_REGISTRY.map(family => [family.id, family.label]));

interface Judged { family?: string | null; tone: Tone | WindowStatus; rank?: RowRank; subject: string; message: string }

/** Turns each card's own rows into the rows the page ranks across cards; a row no rule judged is left out. */
@Injectable({ providedIn: 'root' })
export class CardRankingService {
  private readonly pullModel = inject(PullModelService);

  ranking(rows: readonly RankedRow[], folded: FoldCounts = this.pullModel.noFolds()): CardRanking {
    return { rows: [...rows], folded };
  }

  findings(card: string, rows: readonly FindingRow[]): RankedRow[] {
    return rows.flatMap(row => this.ranked(card, { family: row.family, tone: row.severity, rank: row.rank, subject: this.subjectOf(row), message: row.message }, row.damage ?? null));
  }

  /** A cooldown row names its cooldown; a pull-wide row such as idle time leaves the name empty and names what it measured. */
  private subjectOf(row: FindingRow): string {
    return [row.name, row.what].find(text => text) ?? '';
  }

  buttons(card: string, rows: readonly ButtonRow[]): RankedRow[] {
    return rows.flatMap(row => this.ranked(card, { family: row.family, tone: row.status, rank: row.rank, subject: row.name, message: row.message }));
  }

  windows(card: string, windows: readonly ComparisonWindow[]): RankedRow[] {
    return windows.flatMap(window => this.ranked(card, { family: window.family, tone: window.status, rank: window.rank, subject: fmtClock(window.timeStartS), message: window.message }));
  }

  gear(card: string, verdicts: readonly (GearVerdict | null)[], enchants: readonly EnchantRow[]): RankedRow[] {
    return [
      ...verdicts.flatMap(verdict => verdict ? this.ranked(card, { family: verdict.family, tone: verdict.tone, rank: verdict.rank, subject: '', message: verdict.note }) : []),
      ...enchants.flatMap(row => this.ranked(card, { family: row.family, tone: row.tone, rank: row.rank, subject: row.slotName, message: row.note ?? '' })),
    ];
  }

  /** Muted rows the card shows by their cause, which the page folds under its root cause. */
  mutedFolds(rows: readonly { unjudged?: UnjudgedCause | null }[]): FoldCounts {
    const folded = this.pullModel.noFolds();
    for (const row of rows) if (row.unjudged) folded[row.unjudged] += 1;
    return folded;
  }

  private ranked(card: string, row: Judged, damage: RankedRow['damage'] = null): RankedRow[] {
    const { family, rank, tone } = row;
    if (!family || !rank || tone === 'muted') return [];
    return [{ card, check: LABEL_OF.get(family) ?? '', subject: row.subject, tone, rank, damage, message: row.message }];
  }
}
