import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { WindowStatus } from '../data/analysis/window-comparison.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-range-legend',
  host: { class: 'flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted' },
  templateUrl: './range-legend.html',
})
export class RangeLegend {
  /** The tone of the bar it explains; a legend over bars of several tones stays muted. */
  readonly status = input<WindowStatus>('muted');
}
