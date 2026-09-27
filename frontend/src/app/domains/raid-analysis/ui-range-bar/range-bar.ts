import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { WindowStatus } from '../data/analysis/window-comparison.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-range-bar',
  host: { class: 'relative block rounded bg-bg', 'aria-hidden': 'true' },
  templateUrl: './range-bar.html',
})
export class RangeBar {
  /** Each a percent of the bar's width; null leaves that layer out. */
  readonly you = input<number | null>(null);
  readonly rangeLeft = input<number | null>(null);
  readonly rangeWidth = input<number | null>(null);
  readonly avg = input<number | null>(null);
  readonly status = input<WindowStatus>('muted');
}
