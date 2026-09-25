import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PercentPipe } from '@angular/common';
import type { LineSplit } from '../data/analysis/analysis.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-line-split',
  host: { class: 'block' },
  imports: [PercentPipe],
  templateUrl: './line-split.html',
})
export class LineSplitTable {
  readonly lines = input.required<LineSplit[]>();
}
