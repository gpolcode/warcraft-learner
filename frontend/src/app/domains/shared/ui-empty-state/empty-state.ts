import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

export type EmptyStateTone = 'muted' | 'success';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-empty-state',
  imports: [TuiBlockStatus, TuiIcon],
  host: { class: 'block' },
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly icon = input<string>('help_outline');
  readonly tone = input<EmptyStateTone>('muted');
}
