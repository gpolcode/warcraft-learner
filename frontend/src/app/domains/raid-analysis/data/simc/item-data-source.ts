import { InjectionToken } from '@angular/core';
import type { PlanItem, PlanSpell } from '../plan/plan.models';

/** `items` keys by SimC's item token, `spells` each use spell by `item_<id>`. */
export interface ItemTable {
  items: Record<string, PlanItem>;
  spells: Record<string, PlanSpell>;
}

export interface ItemDataSource {
  /** An item the data does not describe is left out, never an error, so it reads as unknown. */
  items(ids: number[]): Promise<ItemTable>;
}

export const NO_ITEMS: ItemTable = { items: {}, spells: {} };

/** Production reads items from the bench's own list, so the default resolves none; the ingest configuration binds SimC's item data. */
export const ITEM_DATA_SOURCE = new InjectionToken<ItemDataSource>('ITEM_DATA_SOURCE', {
  factory: () => ({ items: () => Promise.resolve(NO_ITEMS) }),
});
