import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface EmbellishmentRef {
  item_ids: Record<string, string>;
  bonus_ids: Record<string, string>;
}

/** Resolved match from the embellishment reference. */
export interface EmbellishmentMatch {
  /** The detecting key: item_id for pre-embellished items, bonus_id for reagent-applied. */
  id: number;
  name: string;
}

/**
 * Lazily loads and caches the static embellishments.json reference file.
 * Provides a fast lookup: (bonusIDs, itemId) -> EmbellishmentMatch | null.
 *
 * Detection order:
 *   1. Item ID  - covers pre-embellished items with a fixed item ID.
 *   2. Bonus ID - covers optional-reagent embellishments added to crafted gear.
 */
@Injectable({ providedIn: 'root' })
export class EmbellishmentRefService {
  private readonly http = inject(HttpClient);

  private _itemIds = new Map<number, string>();
  private _bonusIds = new Map<number, string>();
  private _loaded: Promise<void> | null = null;

  /** Ensures the reference is loaded. Call once before any resolve() calls. */
  async load(): Promise<void> {
    if (!this._loaded) {
      this._loaded = firstValueFrom(this.http.get<EmbellishmentRef>('/data/embellishments.json'))
        .then(ref => {
          for (const [k, v] of Object.entries(ref.item_ids ?? {})) {
            if (!k.startsWith('_')) this._itemIds.set(parseInt(k, 10), v);
          }
          for (const [k, v] of Object.entries(ref.bonus_ids ?? {})) {
            if (!k.startsWith('_')) this._bonusIds.set(parseInt(k, 10), v);
          }
        })
        .catch(() => { /* silently degrade - card will be empty */ });
    }
    return this._loaded;
  }

  /**
   * Resolves an embellishment from a gear item's IDs.
   * Returns null if no embellishment is found for this item.
   */
  resolve(itemId: number, bonusIDs?: (number | string)[]): EmbellishmentMatch | null {
    const byItem = this._itemIds.get(itemId);
    if (byItem) return { id: itemId, name: byItem };
    if (bonusIDs) {
      for (const bid of bonusIDs) {
        const numBid = typeof bid === 'string' ? parseInt(bid, 10) : bid;
        const byBonus = this._bonusIds.get(numBid);
        if (byBonus) return { id: numBid, name: byBonus };
      }
    }
    return null;
  }
}
