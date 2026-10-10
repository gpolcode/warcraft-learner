import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiCell, TuiNotification, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiConnected } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';

export type BenchEmptyVariant = 'post' | 'pre';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-bench-empty-banner',
  imports: [TuiNotification, TuiTitle, TuiCell, TuiAvatar, TuiConnected, TuiCardLarge],
  host: { class: 'block' },
  templateUrl: './bench-empty-banner.html',
})
export class BenchEmptyBanner {
  readonly encounter = input<string>('');
  readonly variant = input<BenchEmptyVariant>('post');
}
