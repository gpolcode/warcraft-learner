import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { SpellIconComponent } from '../spell-icon/spell-icon';

/** One collapsible spell row: a cooldown / defensive and its findings. */
export interface FindingEntry {
  name: string;
  spellId: number | null;
  hasIssue: boolean;
  hasCritical: boolean;
  /** Short status chips shown in the collapsed header (e.g. "held", "2 hold tips"). */
  metaItems: string[];
  findings: AnalysisFinding[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-finding-list',
  imports: [MatExpansionModule, SpellIconComponent],
  templateUrl: './finding-list.html',
})
export class FindingListComponent {
  readonly entries = input.required<FindingEntry[]>();

  protected formatMs(ms: number | undefined): string {
    if (ms == null) return '';
    const s = ms / 1000;
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }
}
