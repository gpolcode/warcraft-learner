import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { ConditionCheck } from '../data/analysis/analysis.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-checklist',
  host: { class: 'block' },
  imports: [MatIconModule, NgTemplateOutlet],
  templateUrl: './condition-checklist.html',
})
export class ConditionChecklist {
  readonly checks = input.required<ConditionCheck[]>();
}
