import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { BenchStrip } from '../data/analysis/bench-strip-service';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import { FormatDayPipe } from '../../shared/ui-format/format-day-pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-bench-strip',
  imports: [FormatDurationPipe, FormatDayPipe],
  host: { class: 'flex flex-col gap-0.5 text-caption text-muted' },
  templateUrl: './bench-strip.html',
})
export class BenchStripCaption {
  readonly strip = input.required<BenchStrip>();
}
