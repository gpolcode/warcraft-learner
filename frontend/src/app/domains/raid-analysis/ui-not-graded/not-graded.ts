import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { NotGradedNote } from '../data/verdict/calibration/calibration.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-not-graded',
  host: { class: 'block border-t border-line py-2.5' },
  templateUrl: './not-graded.html',
})
export class NotGraded {
  readonly notes = input.required<readonly NotGradedNote[]>();
}
