import { Injectable, inject } from '@angular/core';
import type { PlanItem, PlanSpell } from '../plan/plan.models';
import { SimcDataService } from '../http/simc-data-service';
import { ItemDataSource, ItemTable, NO_ITEMS } from './item-data-source';
import { SpellDumpService, SpellRecord } from './spell-dump-service';

/** One row of `item_effect.inc`: the effect's id, its spell, its item, its index, its trigger, then cooldown fields, and the item's name as a comment. */
const EFFECT_ROW = /^\s*\{\s*\d+,\s*(\d+),\s*(\d+),\s*-?\d+,\s*(-?\d+),(?:\s*-?\d+,){2}\s*-?\d+\s*\},\s*\/\/\s*(.*?)\s*$/gm;
/** SimC's `ITEM_SPELLTRIGGER_ON_USE`. */
const ON_USE = 0;
/** The dump names every spell the game has, so SimC splits off the non-class ones into one file. */
const NON_CLASS_DUMP = 'nonclass';

interface ItemEffects {
  name: string;
  use: number | null;
}

@Injectable({ providedIn: 'root' })
export class ItemDataService implements ItemDataSource {
  private readonly simc = inject(SimcDataService);
  private readonly dumps = inject(SpellDumpService);
  private effects: Promise<Map<number, ItemEffects> | null> | null = null;
  private dump: Promise<string | null> | null = null;

  async items(ids: number[]): Promise<ItemTable> {
    const effects = await (this.effects ??= this.loadEffects());
    // A failed read is not kept, so the next pull asks again.
    if (!effects) this.effects = null;
    const known = [...new Set(ids)].flatMap(id => {
      const item = effects?.get(id);
      return item ? [[id, item] as const] : [];
    });
    if (!known.length) return NO_ITEMS;
    const records = await this.records(new Set(known.flatMap(([, item]) => item.use ?? [])));
    return known.reduce<ItemTable>((table, [id, item]) => this.add(table, id, item, item.use === null ? undefined : records.get(item.use)), { items: {}, spells: {} });
  }

  private add(table: ItemTable, id: number, { name }: ItemEffects, record: SpellRecord | undefined): ItemTable {
    const token = `item_${id}`;
    const item: PlanItem = { id, name, use: record ? token : null, use_buff: record?.statBuff ?? false, use_damage: record?.damage ?? false };
    const spells = record ? { ...table.spells, [token]: this.spell(name, record) } : table.spells;
    return { items: { ...table.items, [this.dumps.tokenize(name)]: item }, spells };
  }

  /** An item's use is off the global cooldown and costs nothing. */
  private spell(name: string, record: SpellRecord): PlanSpell {
    return {
      name, ids: [record.id], cooldown: record.cooldown, charges: record.charges, duration: record.duration, gcd: 0,
      cast_time: record.castTime, max_stacks: record.maxStacks, costs: [], energize: null,
    };
  }

  private async loadEffects(): Promise<Map<number, ItemEffects> | null> {
    const text = await this.simc.getItemEffects();
    if (!text.ok) return null;
    const effects = new Map<number, ItemEffects>();
    for (const [, spell = '', item = '', trigger = '', name = ''] of text.value.matchAll(EFFECT_ROW)) {
      const known = effects.get(Number(item)) ?? { name, use: null };
      effects.set(Number(item), Number(trigger) === ON_USE ? { ...known, use: Number(spell) } : known);
    }
    return effects;
  }

  private async records(ids: ReadonlySet<number>): Promise<Map<number, SpellRecord>> {
    if (!ids.size) return new Map();
    const dump = await (this.dump ??= this.loadDump());
    if (dump === null) this.dump = null;
    return new Map(this.dumps.readDump(dump ?? '', ids).map(record => [record.id, record]));
  }

  private async loadDump(): Promise<string | null> {
    const dump = await this.simc.getSpellDump(NON_CLASS_DUMP);
    return dump.ok ? dump.value : null;
  }
}
