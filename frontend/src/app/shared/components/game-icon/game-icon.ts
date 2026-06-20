import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconCacheService } from '../../../core/services/icon-cache';
import { WowheadKind } from '../../../core/services/wowhead-mappers';

export type GameIconKind = WowheadKind;

/**
 * Renders a WoW spell or item as an icon + name that links to Wowhead.
 *
 * Icon art and names come from the `IconCacheService` (seeded from a report's
 * `masterData.abilities`) or from explicit `icon`/`name` inputs. When neither
 * resolves the id, the cache fetches it from Wowhead via a CORS proxy and the
 * icon swaps in reactively; until then the name renders as a plain Wowhead link.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wl-game-icon',
  host: { class: 'inline-flex items-center' },
  imports: [NgOptimizedImage, MatTooltipModule],
  template: `
    <a
      [href]="wowheadUrl()"
      target="_blank"
      rel="noopener"
      class="inline-flex items-center gap-1.5 no-underline hover:brightness-125">
      @if (iconUrl(); as src) {
        <img [ngSrc]="src" [width]="18" [height]="18" alt="" />
      }
      <span>{{ displayName() }}</span>
    </a>
  `,
})
export class GameIconComponent {
  private readonly iconCache = inject(IconCacheService);

  readonly id = input.required<number>();
  readonly kind = input<GameIconKind>('spell');
  /** Explicit display name; falls back to the icon cache, then a generic label. */
  readonly name = input<string>('');
  /** Explicit icon filename for items, which are not in the spell icon cache. */
  readonly icon = input<string>('');

  private readonly cached = computed(() => this.iconCache.get(this.id(), this.kind()));

  protected readonly iconUrl = computed(() => {
    const file = this.icon() || this.cached()?.icon || '';
    return file ? `https://wow.zamimg.com/images/wow/icons/small/${file}.jpg` : null;
  });

  protected readonly displayName = computed(() =>
    this.name() || this.cached()?.name || `${this.kind() === 'item' ? 'Item' : 'Spell'} ${this.id()}`);

  protected readonly wowheadUrl = computed(() => `https://www.wowhead.com/${this.kind()}=${this.id()}`);

  constructor() {
    // When nothing supplies an icon for this id, ask the cache to resolve it
    // from Wowhead. The lookup is deduped/cached, so this is safe to run on
    // every render. A successful resolve updates `cached()` and re-renders.
    effect(() => {
      if (!this.icon() && !this.cached()?.icon) this.iconCache.resolve(this.kind(), this.id());
    });
  }
}
