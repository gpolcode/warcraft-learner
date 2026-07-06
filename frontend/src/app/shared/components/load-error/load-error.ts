import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoadError } from '../../../core/result';

/**
 * The two `LoadError` arms this leaf renders. `missing` is handled elsewhere by
 * `wl-bench-empty-banner`, so it is excluded here.
 */
export type RenderableLoadError = Extract<LoadError, { kind: 'transient' | 'permanent' }>;

/**
 * Inline error state for a load that failed. Inputs-only leaf: it renders a Material icon
 * plus the taxonomy `message`, and distinguishes the two kinds by look. `transient` reads
 * as a temporary outage that clears on the next sync; `permanent` reads as a hard, bugged
 * analysis. No retry control - the interceptor auto-retries transient loads and the user
 * re-syncs or reselects the fight. Logging of permanent errors is the consuming service's job.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-load-error',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './load-error.html',
})
export class LoadErrorComponent {
  readonly error = input.required<RenderableLoadError>();
}
