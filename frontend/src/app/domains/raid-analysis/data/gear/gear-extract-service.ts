import { Injectable } from '@angular/core';
import { CharacterGear, WclCombatantInfo, WclGearItem } from '../wcl/wcl.models';
import { EnchantItems } from '../http/enchant-item-data-service';

@Injectable({ providedIn: 'root' })
export class GearExtractService {

  // WCL keys the CombatantInfo event by sourceID; falls back to the first event when there is no exact match.
  selectCombatantInfo(
    events: WclCombatantInfo[], playerId: number,
  ): WclCombatantInfo | null {
    return events.find(event => event.sourceID === playerId) ?? events[0] ?? null;
  }

  /** Rank per talent entry the player picked; null when the combatant info carries no talents. */
  pickedTalents(combatant: WclCombatantInfo | null): Map<number, number> | null {
    const tree = combatant?.talentTree;
    return tree ? new Map(tree.flatMap(node => (node.id == null ? [] : [[node.id, node.rank ?? 1] as const]))) : null;
  }

  iconFile(icon?: string): string {
    return (icon ?? '').replace(/\.jpg$/i, '');
  }

  decodeHtmlEntities(text: string): string {
    return text.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => HTML_ENTITIES[entity] ?? entity);
  }

  /** Fills in the names WCL left blank on the gear rows themselves, in place. */
  fillGameNames(items: { id: number; name: string }[], prefix: 'i' | 'e', names: GameNames): void {
    for (const item of items) {
      if (!item.name && item.id) item.name = this.decodeHtmlEntities(names[`${prefix}${item.id}`]?.name ?? '');
    }
  }

  // Read from the `i` item alias: WCL's `e` enchant alias names only the effect (stat text for an armor kit).
  enchantItem(enchantId: number, enchantItems: EnchantItems, names: GameNames): { id: number; name: string; icon: string } | null {
    const itemId = enchantItems[enchantId];
    const item = itemId === undefined ? undefined : names[`i${itemId}`];
    if (itemId === undefined || !item?.name) return null;
    return { id: itemId, name: this.decodeHtmlEntities(item.name), icon: this.iconFile(item.icon) };
  }

  extractGear(gear: WclGearItem[] | undefined): {
    trinkets: NonNullable<CharacterGear['trinkets']>;
    enchants: NonNullable<CharacterGear['enchants']>;
  } {
    const trinkets: NonNullable<CharacterGear['trinkets']> = [];
    const enchants: NonNullable<CharacterGear['enchants']> = [];

    (gear ?? []).forEach((item, slotIndex) => {
      if (!item.id) return;
      const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;

      if ((TRINKET_SLOTS as readonly number[]).includes(slotIndex)) {
        trinkets.push({ slot: slotIndex, id: itemId, name: item.name ?? '', icon: this.iconFile(item.icon) });
      }

      const enchant = item.permanentEnchant;
      if (enchant) {
        const enchantId = typeof enchant === 'string' ? parseInt(enchant, 10) : enchant;
        enchants.push({ slot: slotIndex, id: enchantId, name: item.permanentEnchantName ?? '' });
      }
    });

    return { trinkets, enchants };
  }
}

// WCL's CombatantInfo gear array is positionally indexed (the index IS the slot).
export const RING_SLOTS = [10, 11] as const;
export const TRINKET_SLOTS = [12, 13] as const;

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/** A WCL game-name batch, keyed by the alias the query built: `i` plus an item id, `e` plus an enchant id. */
export type GameNames = Record<string, { id: number; name: string; icon?: string }>;
