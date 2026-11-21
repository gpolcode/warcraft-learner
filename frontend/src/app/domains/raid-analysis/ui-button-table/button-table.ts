import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { TuiItem } from '@taiga-ui/cdk';
import { TuiButton, TuiExpand, TuiTitle } from '@taiga-ui/core';
import { TuiChevron } from '@taiga-ui/kit';
import { TuiCardCollapsed, TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameIcon } from '../ui-game-icon/game-icon';
import { FindingOccurrences } from '../ui-finding-table/finding-occurrences';
import { RangeBar } from '../ui-range-bar/range-bar';
import { RangeLegend } from '../ui-range-bar/range-legend';
import type { ButtonRow } from '../data/rotation/priority-list/list-finding-service';
import { BenchStripCaption } from '../ui-bench-strip/bench-strip';
import type { BenchStrip } from '../data/analysis/bench-strip-service';
import type { RangeLook } from '../ui-range-bar/range-bar';
import { EmptyState } from '../../shared/ui-empty-state/empty-state';

const BAR_STATUS: Record<string, RangeLook> = { red: 'critical', amber: 'warning', blue: 'accent' };

import { NotGraded } from '../ui-not-graded/not-graded';
import type { NotGradedNote } from '../data/verdict/calibration/calibration.models';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-button-table',
  host: { class: 'block' },
  imports: [
    BenchStripCaption, NotGraded, EmptyState,
    PercentPipe, TuiCardLarge, TuiCardCollapsed, TuiHeader, TuiTitle, TuiButton, TuiChevron, TuiExpand, TuiItem,
    GameIcon, FindingOccurrences, RangeBar, RangeLegend,
  ],
  templateUrl: './button-table.html',
})
export class ButtonTable {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>('');
  /** Who the card was compared with; null on a card no bench backs. */
  readonly bench = input<BenchStrip | null>(null);
  readonly rows = input.required<ButtonRow[]>();
  /** Shown when no button had a judged moment. */
  readonly empty = input<string>('');
  readonly notGraded = input<readonly NotGradedNote[]>([]);
  readonly showMap = input<boolean>(false);
  readonly showClip = input<boolean>(false);
  /** The open occurrence's second, for the page's map and clip overlays. */
  readonly openMap = output<number>();
  readonly openClip = output<number>();

  // The table is reused across pull/player switches, so a stale open row must not survive a rows swap.
  readonly openIndex = linkedSignal<ButtonRow[], number | null>({
    source: this.rows,
    computation: () => null,
  });

  /** A comparison row's bar stays grey; only a graded row takes a color. */
  barStatus(row: ButtonRow): RangeLook {
    return BAR_STATUS[row.status] ?? 'muted';
  }

  toggle(index: number): void {
    this.openIndex.update(current => current === index ? null : index);
  }
}
