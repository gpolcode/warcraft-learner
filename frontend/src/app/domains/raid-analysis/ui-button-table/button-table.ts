import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GameIcon } from '../ui-game-icon/game-icon';
import { FindingOccurrences } from '../ui-finding-table/finding-occurrences';
import { LineSplitTable } from '../ui-finding-table/line-split';
import type { ButtonRow } from '../data/rotation/priority-list/list-finding-service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-button-table',
  host: { class: 'block' },
  imports: [PercentPipe, MatIconModule, MatButtonModule, GameIcon, FindingOccurrences, LineSplitTable],
  templateUrl: './button-table.html',
})
export class ButtonTable {
  readonly heading = input.required<string>();
  readonly subtitle = input<string>('');
  readonly rows = input.required<ButtonRow[]>();

  // The table is reused across pull/player switches, so a stale open row must not survive a rows swap.
  readonly openIndex = linkedSignal<ButtonRow[], number | null>({
    source: this.rows,
    computation: () => null,
  });

  toggle(index: number): void {
    this.openIndex.update(current => current === index ? null : index);
  }
}
