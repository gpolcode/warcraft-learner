import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { injectContext } from '@taiga-ui/polymorpheus';
import type { TuiTreeItemContext } from '@taiga-ui/kit';

// Replaces Taiga's default row, which pads every row under a group by a toggle's width even when nothing can collapse.
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-condition-tree-row',
  host: { class: 'flex' },
  imports: [NgTemplateOutlet],
  template: '<ng-container [ngTemplateOutlet]="context.template" />',
})
export class ConditionTreeRow {
  protected readonly context = injectContext<TuiTreeItemContext>();
}
