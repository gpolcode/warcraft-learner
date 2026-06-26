import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { PlayerBurstWindow } from '../../../core/models/analysis.models';
import { ComparisonWindow, WindowComparisonComponent } from '../../../shared/components/window-comparison/window-comparison';
import { BurstFeatureService, AbilityIcons } from './burst.service';
import { BurstMapAnchor } from './burst.vm';

/**
 * Burst card. A feature component: it injects exactly one service
 * (`BurstFeatureService`) and renders. Its bench windows come from the swappable
 * `BURST_DATA_SOURCE` (file in prod, live transform under the dev flag); ability
 * names arrive baked via `abilityIcons`; opening the map is an output the page wires.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-burst-windows',
  imports: [WindowComparisonComponent],
  templateUrl: './burst-windows.html',
})
export class BurstWindowsComponent {
  private readonly burst = inject(BurstFeatureService);

  readonly spec = input.required<string>();
  readonly encounterId = input.required<number>();
  readonly fightDuration = input<number>(0);
  readonly playerWindows = input<PlayerBurstWindow[]>([]);
  readonly abilityIcons = input<AbilityIcons>({});
  /** Map button is available once the page has loaded top-parse positions. */
  readonly showMap = input<boolean>(false);

  readonly openMap = output<BurstMapAnchor>();

  private readonly _windows = signal<ComparisonWindow[]>([]);
  private readonly _anchors = signal<BurstMapAnchor[]>([]);
  protected readonly windows = this._windows.asReadonly();

  // Bumped on every reload so a slow earlier response can't overwrite a newer one.
  private loadToken = 0;

  constructor() {
    effect(() => {
      const spec = this.spec();
      const encounterId = this.encounterId();
      const fightDuration = this.fightDuration();
      const playerWindows = this.playerWindows();
      const abilityIcons = this.abilityIcons();
      const token = ++this.loadToken;
      void this.burst.loadView(spec, encounterId, fightDuration, playerWindows, abilityIcons).then(view => {
        if (token !== this.loadToken) return;
        this._windows.set(view.windows);
        this._anchors.set(view.anchors);
      });
    });
  }

  protected onOpenMap(index: number): void {
    const anchor = this._anchors()[index];
    if (anchor) this.openMap.emit(anchor);
  }
}
