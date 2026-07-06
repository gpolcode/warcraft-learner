import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LoadError } from '../../../core/result';

/** Which page the not-yet-ingested banner explains: the post-raid analysis or the pre-fight plan. */
export type BenchEmptyVariant = 'post' | 'pre';

/** The hard-error kinds this banner renders as an error header; `missing` shows the ingest banner. */
export type RenderableLoadError = Extract<LoadError, { kind: 'transient' | 'permanent' }>;

/**
 * One banner for every "the section is not showing its data" state, so they share a look.
 * A transient/permanent `error` renders an error header; otherwise (no error, or a `missing`
 * one) it names the encounter and lays out the three-step ingest pipeline. `variant` switches
 * that pipeline copy between post-raid and pre-fight.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-bench-empty-banner',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './bench-empty-banner.html',
})
export class BenchEmptyBannerComponent {
  readonly error = input<LoadError | null>(null);
  readonly encounter = input<string>('');
  readonly variant = input<BenchEmptyVariant>('post');
}
