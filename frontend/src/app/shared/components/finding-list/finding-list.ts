import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { SpellIconComponent } from '../spell-icon/spell-icon';
import { FormatDurationPipe } from '../../pipes/format-duration-pipe';

/** One collapsible spell row: a cooldown / defensive and its findings. */
export interface FindingEntry {
  name: string;
  spellId: number | null;
  hasIssue: boolean;
  hasCritical: boolean;
  /** Short status chips shown in the header (e.g. "held", "2 hold tips"). */
  metaItems: string[];
  findings: AnalysisFinding[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-finding-list',
  imports: [MatCardModule, MatIconModule, MatButtonModule, SpellIconComponent, FormatDurationPipe],
  templateUrl: './finding-list.html',
  // Material's card-header padding is asymmetric (16px top, 0 bottom) - fine when a
  // content block follows, but leaves the empty "Doing Well" rows hugging the bottom
  // edge. Balance the header padding and tighten the content gap so every row reads the same.
  styles: `
    mat-card-header.mat-mdc-card-header { padding: 12px 16px; }
    mat-card-content.mat-mdc-card-content { padding: 0 16px 12px; }
  `,
})
export class FindingListComponent {
  readonly entries = input.required<FindingEntry[]>();

  // Per-row open/closed override; entries with issues start expanded.
  private readonly overrides = signal(new Map<number, boolean>());

  protected isOpen(i: number, defaultOpen: boolean): boolean {
    return this.overrides().get(i) ?? defaultOpen;
  }

  protected toggle(i: number, defaultOpen: boolean): void {
    const next = !this.isOpen(i, defaultOpen);
    this.overrides.update(m => new Map(m).set(i, next));
  }

  protected statusIcon(entry: FindingEntry): string {
    return entry.hasCritical ? 'error' : entry.hasIssue ? 'warning_amber' : 'check_circle';
  }
}
