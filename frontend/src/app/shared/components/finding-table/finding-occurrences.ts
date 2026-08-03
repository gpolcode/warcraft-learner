import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormatDurationPipe } from '../../pipes/format-duration-pipe';
import type { FindingOccurrence, FindingTimeline } from '../../../core/models/analysis.models';

/** One up-span positioned as a percentage of the fight, for the timeline bar (aura uptime only). */
export interface TimelineBand {
  leftPct: number;
  widthPct: number;
}

/** The expandable detail behind a rule finding's summary count: a moment-chip strip, plus a timeline bar when the finding carries one. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-finding-occurrences',
  host: { class: 'block' },
  imports: [FormatDurationPipe],
  templateUrl: './finding-occurrences.html',
})
export class FindingOccurrencesComponent {
  readonly occurrences = input.required<FindingOccurrence[]>();
  readonly target = input<string>('');
  readonly timeline = input<FindingTimeline | undefined>(undefined);

  private readonly selectedIndex = signal<number | null>(null);

  /** Defaults to the first failing instance, so opening a finding points straight at a moment worth reading. */
  private readonly firstBadIndex = computed(() => {
    const index = this.occurrences().findIndex(occ => !occ.ok);
    return index === -1 ? 0 : index;
  });

  readonly activeIndex = computed(() => this.selectedIndex() ?? this.firstBadIndex());
  readonly active = computed<FindingOccurrence | undefined>(() => this.occurrences()[this.activeIndex()]);

  readonly segments = computed<TimelineBand[]>(() => {
    const t = this.timeline();
    if (!t || t.fightDurationMs <= 0) return [];
    return t.segmentsMs.map(([start, end]) => ({
      leftPct: (start / t.fightDurationMs) * 100,
      widthPct: ((end - start) / t.fightDurationMs) * 100,
    }));
  });

  select(index: number): void {
    this.selectedIndex.set(index);
  }
}
