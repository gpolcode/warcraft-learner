import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Which page the banner explains: the post-raid analysis or the pre-fight plan. */
export type BenchEmptyVariant = 'post' | 'pre';

/**
 * Top-of-page banner shown when the selected encounter has no ingested top-parse bench
 * yet (a fresh tier/expansion). Presentational leaf: inputs only, no services.
 *
 * It names the encounter, explains that comparisons need top-parse logs, and lays out
 * the three-step ingest pipeline (mythic kills logged -> ingest -> unlock). The
 * `variant` switches the body copy and the final step between the post-raid
 * ("Comparisons unlock") and pre-fight ("Plan unlocks") wording.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-bench-empty-banner',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './bench-empty-banner.html',
})
export class BenchEmptyBannerComponent {
  readonly encounter = input<string>('');
  readonly variant = input<BenchEmptyVariant>('post');
}
