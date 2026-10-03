import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiIcon, TuiNotification, TuiTitle } from '@taiga-ui/core';

export type BenchEmptyVariant = 'post' | 'pre';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-bench-empty-banner',
  imports: [TuiNotification, TuiTitle, TuiIcon],
  host: { class: 'block' },
  templateUrl: './bench-empty-banner.html',
})
export class BenchEmptyBanner {
  readonly encounter = input<string>('');
  readonly variant = input<BenchEmptyVariant>('post');
}
