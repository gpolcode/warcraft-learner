import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { TuiItem } from '@taiga-ui/cdk';
import { TuiButton, TuiExpand, TuiTitle } from '@taiga-ui/core';
import { TuiChevron } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameIcon } from '../ui-game-icon/game-icon';
import { FindingOccurrences } from '../ui-finding-table/finding-occurrences';
import { RangeBar } from '../ui-range-bar/range-bar';
import { RangeLegend } from '../ui-range-bar/range-legend';
import type { ButtonRow } from '../data/rotation/priority-list/list-finding-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-button-table',
  host: { class: 'block' },
  imports: [
    PercentPipe, TuiCardLarge, TuiHeader, TuiTitle, TuiButton, TuiChevron, TuiExpand, TuiItem,
    GameIcon, FindingOccurrences, RangeBar, RangeLegend,
  ],
  templateUrl: './button-table.html',
})
export class ButtonTable {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>('');
  readonly rows = input.required<ButtonRow[]>();
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

  toggle(index: number): void {
    this.openIndex.update(current => current === index ? null : index);
  }
}
