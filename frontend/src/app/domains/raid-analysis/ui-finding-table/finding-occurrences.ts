import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';
import type { FindingOccurrence } from '../data/analysis/analysis.models';
import { ConditionChecklist } from './condition-checklist';

// Distinguishes option ids when several occurrence strips are open across the page.
let nextInstanceSeq = 0;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-finding-occurrences',
  host: { class: 'block' },
  imports: [TuiButton, FormatDurationPipe, ConditionChecklist],
  templateUrl: './finding-occurrences.html',
})
export class FindingOccurrences {
  readonly occurrences = input.required<FindingOccurrence[]>();
  readonly showMap = input<boolean>(false);
  readonly showClip = input<boolean>(false);
  /** The open occurrence's second, for the page's map and clip overlays. */
  readonly openMap = output<number>();
  readonly openClip = output<number>();

  private readonly selectedIndex = linkedSignal<FindingOccurrence[], number | null>({
    source: this.occurrences,
    computation: () => null,
  });

  /** Defaults to the first failing instance, so opening a finding points straight at a moment worth reading. */
  private readonly firstBadIndex = computed(() => {
    const index = this.occurrences().findIndex(occ => !occ.ok && !occ.unjudged);
    return index === -1 ? 0 : index;
  });

  readonly activeIndex = computed(() => this.selectedIndex() ?? this.firstBadIndex());
  readonly active = computed<FindingOccurrence | undefined>(() => this.occurrences()[this.activeIndex()]);

  private readonly instanceId = `wl-finding-occurrences-${nextInstanceSeq++}`;

  optionId(index: number): string {
    return `${this.instanceId}-opt-${index}`;
  }

  readonly detailId = `${this.instanceId}-detail`;

  // The listbox keeps focus (a clicked chip hands it back); aria-activedescendant points screen readers at the active chip.
  readonly activeOptionId = computed(() => this.optionId(this.activeIndex()));

  select(index: number): void {
    this.selectedIndex.set(index);
  }

  onKeydown(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = this.activeIndex() + delta;
    if (next >= 0 && next < this.occurrences().length) this.select(next);
  }
}
