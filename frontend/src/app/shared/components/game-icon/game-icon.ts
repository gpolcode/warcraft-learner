import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconCacheService } from '../../../core/services/icon-cache';
import { WowheadKind } from '../../../core/services/wowhead-mappers';

export type GameIconKind = WowheadKind;

/**
 * Renders a WoW spell or item as an icon + name that links to Wowhead.
 *
 * Names/icons come from the `IconCacheService` (seeded from a report's
 * `masterData.abilities`) or from explicit `icon`/`name` inputs. Anything not
 * covered by those is resolved from Wowhead via a CORS proxy and swaps in
 * reactively. Until a name is available from some source the component renders
 * nothing - there is no generic "Spell {id}" placeholder.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-game-icon',
  host: { class: 'inline-flex items-center' },
  imports: [NgOptimizedImage, MatTooltipModule],
  template: `
    @if (displayName(); as label) {
      <a
        [href]="wowheadUrl()"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1.5 no-underline hover:brightness-125">
        @if (iconUrl(); as src) {
          <img [ngSrc]="src" [width]="18" [height]="18" alt="" />
        }
        <span>{{ label }}</span>
      </a>
    }
  `,
})
export class GameIconComponent {
  private readonly iconCache = inject(IconCacheService);

  readonly id = input.required<number>();
  readonly kind = input<GameIconKind>('spell');
  /** Explicit display name; otherwise resolved from the icon cache / Wowhead. */
  readonly name = input<string>('');
  /** Explicit icon filename for items, which are not in the spell icon cache. */
  readonly icon = input<string>('');

  private readonly cached = computed(() => this.iconCache.get(this.id(), this.kind()));

  protected readonly iconUrl = computed(() => {
    const file = this.icon() || this.cached()?.icon || '';
    return file ? `https://wow.zamimg.com/images/wow/icons/small/${file}.jpg` : null;
  });

  protected readonly displayName = computed(() => this.name() || this.cached()?.name || '');

  protected readonly wowheadUrl = computed(() => `https://www.wowhead.com/${this.kind()}=${this.id()}`);

  constructor() {
    // When no name is supplied from any source, ask the cache to resolve it
    // from Wowhead. The lookup is deduped/cached, so this is safe to run on
    // every render. A successful resolve updates `cached()` and re-renders.
    effect(() => {
      if (!this.name() && !this.cached()) this.iconCache.resolve(this.kind(), this.id());
    });
  }
}
