import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { ConditionCheck } from '../data/analysis/analysis.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-checklist',
  host: { class: 'block' },
  imports: [MatIconModule],
  templateUrl: './condition-checklist.html',
})
export class ConditionChecklist {
  readonly checks = input.required<ConditionCheck[]>();
}
