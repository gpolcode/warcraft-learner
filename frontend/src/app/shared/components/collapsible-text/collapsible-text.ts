import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Collapsible text disclosure. Projects its content and, on mobile, clamps it to
 * two lines behind a "Show more / Show less" toggle. At >=md the content is never
 * clamped and the toggle is hidden, so desktop always shows the full text (the
 * frozen desktop layout). Presentational leaf: owns only its own open/closed
 * state - no inputs, no services.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-collapsible-text',
  // Angular custom elements default to display:inline; block keeps the clamp + toggle stacked.
  host: { class: 'block' },
  imports: [MatIconModule],
  templateUrl: './collapsible-text.html',
})
export class CollapsibleTextComponent {
  protected readonly expanded = signal(false);

  protected toggle(): void {
    this.expanded.update(open => !open);
  }
}
