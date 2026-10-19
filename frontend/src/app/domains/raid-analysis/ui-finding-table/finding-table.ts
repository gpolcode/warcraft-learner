import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { TuiItem } from '@taiga-ui/cdk';
import { TuiButton, TuiExpand, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiBadge, TuiChevron, TuiChip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameIcon } from '../ui-game-icon/game-icon';
import { FindingOccurrences } from './finding-occurrences';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import type { FindingRow, OnPlanChip } from '../data/analysis/finding-rows-service';
import { EmptyState } from '../../shared/ui-empty-state/empty-state';
import { JudgedSpanCaption } from '../ui-judged-span/judged-span';
import type { JudgedSpan, UnjudgedCause } from '../data/analysis/pull-model-service';
import { BenchStripCaption } from '../ui-bench-strip/bench-strip';
import type { BenchStrip } from '../data/analysis/bench-strip-service';

export type { FindingRow, OnPlanChip } from '../data/analysis/finding-rows-service';

type RowTone = 'red' | 'amber' | 'blue' | 'neutral' | 'muted';

const TONE_ICON: Record<Exclude<RowTone, 'muted'>, string> = { red: 'error', amber: 'warning_amber', blue: 'info', neutral: 'compare_arrows' };
const UNJUDGED_ICON: Record<UnjudgedCause, string> = { dead: 'skull', after_wipe: 'flag', not_reached: 'schedule' };

import { NotGraded } from '../ui-not-graded/not-graded';
import type { NotGradedNote } from '../data/verdict/calibration/calibration.models';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-finding-table',
  // Angular custom elements default to display:inline; block keeps the card full-width.
  host: { class: 'block' },
  imports: [
    BenchStripCaption, NotGraded,
    EmptyState, TuiCardLarge, TuiHeader, TuiTitle, TuiIcon, TuiButton, TuiChevron, TuiExpand, TuiItem, TuiBadge, TuiChip,
    GameIcon, FindingOccurrences, FormatDurationPipe, JudgedSpanCaption,
  ],
  templateUrl: './finding-table.html',
})
export class FindingTable {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>('');
  /** Who the card was compared with; null on a card no bench backs. */
  readonly bench = input<BenchStrip | null>(null);
  /** The pull time the rows were judged over; null on a card that judges no pull. */
  readonly judged = input<JudgedSpan | null>(null);
  readonly rows = input.required<FindingRow[]>();
  readonly onPlan = input<OnPlanChip[]>([]);
  /** Shown when nothing is flagged and nothing is on plan. */
  readonly empty = input<string>('Nothing flagged.');
  readonly notGraded = input<readonly NotGradedNote[]>([]);
  readonly showMap = input<boolean>(false);
  readonly showClip = input<boolean>(false);
  readonly openMap = output<FindingRow>();
  readonly openClip = output<FindingRow>();

  // The table is reused across pull/player switches, so a stale open row must not survive a rows swap.
  readonly openIndex = linkedSignal<FindingRow[], number | null>({
    source: this.rows,
    computation: () => null,
  });

  toggle(index: number): void {
    this.openIndex.update(current => current === index ? null : index);
  }

  /** A legacy producer's word read as the tone it stands for, so both kinds of row share one look. */
  toneOf(row: FindingRow): RowTone {
    return row.severity;
  }

  iconOf(row: FindingRow): string {
    const tone = this.toneOf(row);
    return tone === 'muted' ? UNJUDGED_ICON[row.unjudged ?? 'dead'] : TONE_ICON[tone];
  }

  /** An occurrence's moment, so the page opens the map or clip on it rather than on the row's own time. */
  moment(row: FindingRow, atS: number): FindingRow {
    return { ...row, timestampS: atS };
  }
}
