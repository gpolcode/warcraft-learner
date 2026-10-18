import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { JudgedSpan } from '../data/analysis/pull-model-service';
import { FormatDurationPipe } from '../../shared/ui-format/format-duration-pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-judged-span',
  imports: [FormatDurationPipe],
  host: { class: 'flex flex-col gap-0.5 text-caption text-muted' },
  templateUrl: './judged-span.html',
})
export class JudgedSpanCaption {
  readonly span = input.required<JudgedSpan>();
  /** What the card judges one of, in the singular: `check` or `window`. */
  readonly noun = input<string>('check');

  protected readonly dead = computed(() => this.span().folded.dead);
  protected readonly afterWipe = computed(() => this.span().folded.after_wipe);
  protected readonly notReached = computed(() => this.span().folded.not_reached);
}
