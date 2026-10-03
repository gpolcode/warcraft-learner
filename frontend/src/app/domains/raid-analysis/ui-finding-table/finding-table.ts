import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { TuiItem } from '@taiga-ui/cdk';
import { TuiButton, TuiExpand, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiBadge, TuiChevron, TuiChip, TuiStatus } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { GameIcon } from '../ui-game-icon/game-icon';
import { Collapsible } from '../../shared/ui-collapsible/collapsible';
import { FindingOccurrences } from './finding-occurrences';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import type { FindingRow, OnPlanChip } from '../data/analysis/finding-rows-service';

export type { FindingRow, OnPlanChip } from '../data/analysis/finding-rows-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-finding-table',
  // Angular custom elements default to display:inline; block keeps the card full-width.
  host: { class: 'block' },
  imports: [
    TuiCardLarge, TuiHeader, TuiTitle, TuiIcon, TuiButton, TuiChevron, TuiExpand, TuiItem, TuiBadge, TuiStatus, TuiChip,
    GameIcon, Collapsible, FindingOccurrences, FormatDurationPipe,
  ],
  templateUrl: './finding-table.html',
})
export class FindingTable {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>('');
  readonly rows = input.required<FindingRow[]>();
  readonly onPlan = input<OnPlanChip[]>([]);
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

  /** An occurrence's moment, so the page opens the map or clip on it rather than on the row's own time. */
  moment(row: FindingRow, atS: number): FindingRow {
    return { ...row, timestampS: atS };
  }
}
