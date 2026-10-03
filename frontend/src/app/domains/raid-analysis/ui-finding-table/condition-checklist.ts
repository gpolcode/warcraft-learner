import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TuiTree } from '@taiga-ui/kit';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import type { ConditionCheck, FindingOccurrence } from '../data/analysis/analysis.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-checklist',
  host: { class: 'block' },
  imports: [TuiIcon, TuiTree, FormatDurationPipe],
  templateUrl: './condition-checklist.html',
})
export class ConditionChecklist {
  readonly occurrence = input.required<FindingOccurrence>();

  // tui-tree takes a single root, so the press verdict becomes an all-of group over the cast's conditions.
  protected readonly tree = computed<ConditionCheck>(() => {
    const occ = this.occurrence();
    return {
      text: occ.result ?? '',
      truth: occ.unjudged ? 'unknown' : (occ.ok ? 'true' : 'false'),
      value: '',
      group: { any: false, checks: occ.checks },
    };
  });

  protected readonly operands = (check: ConditionCheck): readonly ConditionCheck[] => check.group?.checks ?? [];
}
