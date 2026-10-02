import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import type { ConditionCheck, FindingOccurrence } from '../data/analysis/analysis.models';

interface ChecklistNode {
  check: ConditionCheck;
  /** Per level above the row, whether that level's branch runs on below it, so its connector passes through. */
  rails: boolean[];
  last: boolean;
  children: ChecklistNode[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-checklist',
  host: { class: 'block' },
  imports: [MatIconModule, NgTemplateOutlet, FormatDurationPipe],
  templateUrl: './condition-checklist.html',
})
export class ConditionChecklist {
  readonly occurrence = input.required<FindingOccurrence>();

  protected readonly nodes = computed(() => this.placed(this.occurrence().checks, []));

  private placed(checks: ConditionCheck[], rails: boolean[]): ChecklistNode[] {
    return checks.map((check, at) => {
      const last = at === checks.length - 1;
      return { check, rails, last, children: this.placed(check.group?.checks ?? [], [...rails, !last]) };
    });
  }
}
