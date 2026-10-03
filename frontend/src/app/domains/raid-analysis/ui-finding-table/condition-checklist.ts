import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TUI_TREE_CONTENT, TuiTree } from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import { ConditionTreeRow } from './condition-tree-row';
import type { ConditionCheck, FindingOccurrence } from '../data/analysis/analysis.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-checklist',
  host: { class: 'block' },
  imports: [TuiIcon, TuiTree, FormatDurationPipe],
  templateUrl: './condition-checklist.html',
  providers: [{ provide: TUI_TREE_CONTENT, useValue: new PolymorpheusComponent(ConditionTreeRow) }],
})
export class ConditionChecklist {
  readonly occurrence = input.required<FindingOccurrence>();

  // The press verdict heads the tree as one all-of term, so its conditions nest under it like any group's operands.
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
