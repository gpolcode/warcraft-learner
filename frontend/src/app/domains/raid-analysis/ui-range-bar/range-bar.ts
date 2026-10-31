import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The bar's fill color, already read from the window's status or tone. */
export type RangeLook = 'success' | 'warning' | 'critical' | 'accent' | 'muted';

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
  readonly status = input<RangeLook>('muted');
}
