import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * A card-shaped placeholder shown in place of a bench-driven card when the encounter
 * has no ingested top-parse data yet. Presentational leaf: inputs only, no services.
 *
 * It mirrors the finding-table / window-comparison card chrome (header + dashed
 * divider + centered body) so an un-benched card reads as *pending ingest* ("Waiting
 * for top parses"), not as a clean/empty result. `heading` + `subtitle` match the
 * card it replaces; `caption` is the optional line under the waiting message.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-waiting-placeholder',
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './waiting-placeholder.html',
})
export class WaitingPlaceholderComponent {
  readonly heading = input<string>('');
  readonly subtitle = input<string>('');
  readonly caption = input<string>('');
}
