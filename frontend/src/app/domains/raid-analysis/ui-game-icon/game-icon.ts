import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { TuiCopy } from '@taiga-ui/kit';
import { WowheadTooltipsService } from '../util-wowhead/wowhead-tooltips-service';
import { ENVIRONMENT } from '../../../../environments/environment-token';

export type GameIconKind = 'spell' | 'item';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-game-icon',
  host: { class: 'inline-flex items-center' },
  imports: [NgOptimizedImage, NgTemplateOutlet, TuiCopy],
  templateUrl: './game-icon.html',
})
export class GameIcon {
  private readonly environment = inject(ENVIRONMENT);

  constructor() {
    // Load the tooltip enhancer on first render; afterNextRender is browser-only, so prerender skips it.
    const tooltips = inject(WowheadTooltipsService);
    afterNextRender(() => {
      tooltips.ensureLoaded();
      // Re-scan so an icon rendered after the load-time scan still gets a tooltip.
      tooltips.refreshLinks();
    });
  }

  // A missing id renders the name alone, so a caller with no game identity never wraps this in an @if with a text fallback.
  readonly id = input<number | null | undefined>(null);
  readonly kind = input<GameIconKind>('spell');
  readonly name = input.required<string>();
  readonly icon = input.required<string>();
  readonly copyable = input(false);

  // Tracks the URL that last failed to load so the template hides it and degrades to name-only; a changed `icon` retries.
  protected readonly failedSrc = signal<string | null>(null);

  // WCL's master-data icons may already carry a `.jpg` extension; strip it first so the zamimg URL never doubles up.
  protected readonly iconUrl = computed(() => {
    const file = this.icon().replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    return file ? `${this.environment.zamimgIconUrl}/${file}.jpg` : null;
  });

  protected readonly wowheadUrl = computed(() => {
    const id = this.id();
    return id ? `${this.environment.wowheadUrl}/${this.kind()}=${id}` : null;
  });
}
