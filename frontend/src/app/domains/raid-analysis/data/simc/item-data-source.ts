import { InjectionToken } from '@angular/core';
import type { PlanItem, PlanSpell } from '../plan/plan.models';

/** What a set of worn items does, as a list carries it: each item by id, and the spell each use casts under its item's token. */
export interface ItemTable {
  items: Record<number, PlanItem>;
  spells: Record<string, PlanSpell>;
}

export interface ItemDataSource {
  /** The use of each item the ids name; an item the data does not describe is left out, so it reads as unknown. */
  items(ids: number[]): Promise<ItemTable>;
}

export const NO_ITEMS: ItemTable = { items: {}, spells: {} };

/** Production reads items from the bench's own list, so the default resolves none; the ingest configuration binds SimC's item data. */
export const ITEM_DATA_SOURCE = new InjectionToken<ItemDataSource>('ITEM_DATA_SOURCE', {
  factory: () => ({ items: () => Promise.resolve(NO_ITEMS) }),
});
