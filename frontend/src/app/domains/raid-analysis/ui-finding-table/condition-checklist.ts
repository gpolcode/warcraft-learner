import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import type { ConditionCheck, FindingOccurrence } from '../data/analysis/analysis.models';

interface ChecklistNode {
  check: ConditionCheck;
  continuing: boolean[];
  last: boolean;
  children: ChecklistNode[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-checklist',
  host: { class: 'block' },
  imports: [TuiIcon, NgTemplateOutlet, FormatDurationPipe],
  templateUrl: './condition-checklist.html',
})
export class ConditionChecklist {
  readonly occurrence = input.required<FindingOccurrence>();

  protected readonly nodes = computed(() => this.placed(this.occurrence().checks, []));

  private placed(checks: ConditionCheck[], continuing: boolean[]): ChecklistNode[] {
    return checks.map((check, at) => {
      const last = at === checks.length - 1;
      return { check, continuing, last, children: this.placed(check.group?.checks ?? [], [...continuing, !last]) };
    });
  }
}
