import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type BenchEmptyVariant = 'post' | 'pre';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-bench-empty-banner',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './bench-empty-banner.html',
})
export class BenchEmptyBanner {
  readonly encounter = input<string>('');
  readonly variant = input<BenchEmptyVariant>('post');
}
