import { Injectable, inject, signal } from '@angular/core';
import { WclAbility } from '../models/wcl.models';
import { WowheadApiService } from './wowhead-api';
import { WowheadKind } from './wowhead-mappers';

export interface IconInfo {
  icon: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class IconCacheService {
  private readonly wowhead = inject(WowheadApiService);

  private readonly _cache = signal<Record<string, IconInfo>>({});
  /** Keys already requested from Wowhead (in-flight + resolved + missing) to dedupe. */
  private readonly _attempted = new Set<string>();

  seed(abilities: WclAbility[]): void {
    const updated = { ...this._cache() };
    for (const a of abilities) {
      if (a.gameID && a.icon) {
        updated[String(a.gameID)] = { icon: a.icon.replace(/\.jpg$/i, ''), name: a.name };
      }
    }
    this._cache.set(updated);
  }

  seedFromMap(map: Record<string, { icon: string; name: string }>): void {
    const updated = { ...this._cache() };
    Object.assign(updated, map);
    this._cache.set(updated);
  }

  /**
   * Look up an icon/name. Spells seeded from `masterData.abilities` live under
   * the bare id; Wowhead-resolved entries are kind-namespaced to avoid the
   * spell/item id-space overlap. Bare id is tried first for back-compat.
   */
  get(id: number | string, kind: WowheadKind = 'spell'): IconInfo | null {
    const cache = this._cache();
    return cache[String(id)] ?? cache[`${kind}:${id}`] ?? null;
  }

  iconUrl(spellId: number | string): string | null {
    const info = this.get(spellId);
    if (!info?.icon) return null;
    return `https://wow.zamimg.com/images/wow/icons/small/${info.icon}.jpg`;
  }

  /**
   * Best-effort resolve of an unknown spell/item via the Wowhead CORS proxy.
   * Fire-and-forget: on success the cache signal updates and any rendering
   * `wl-game-icon` recomputes. Each `${kind}:${id}` is attempted at most once
   * (including misses) so repeated renders never re-hit the proxy.
   */
  resolve(kind: WowheadKind, id: number): void {
    if (!id) return;
    const key = `${kind}:${id}`;
    if (this.get(id, kind) || this._attempted.has(key)) return;
    this._attempted.add(key);

    void this.wowhead.getGameData(kind, id).then((info) => {
      if (info) this._cache.set({ ...this._cache(), [key]: info });
    });
  }
}
