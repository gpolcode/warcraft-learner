import { Injectable, inject } from '@angular/core';
import type { ItemTable, PlanItem, PlanSpell } from '../plan/plan.models';
import type { GearPiece } from '../rotation/priority-list/priority-list.models';
import { SimcDataService } from '../http/simc-data-service';
import { SpellDumpService, SpellRecord } from './spell-dump-service';

/** One row of `item_effect.inc`: the effect's id, its spell, its item, its index and its trigger; the comment that trails a row names the spell, not the item. */
const EFFECT_ROW = /^\s*\{\s*\d+,\s*(\d+),\s*(\d+),\s*-?\d+,\s*(-?\d+),/gm;
/** SimC's `ITEM_SPELLTRIGGER_ON_USE`. */
const ON_USE = 0;
/** The dump names every spell the game has, so SimC splits off the non-class ones into one file. */
const NON_CLASS_DUMP = 'nonclass';
const NONE: ItemTable = { items: {}, spells: {} };

@Injectable({ providedIn: 'root' })
export class ItemDataService {
  private readonly simc = inject(SimcDataService);
  private readonly dumps = inject(SpellDumpService);
  private uses: Promise<Map<number, number | null> | null> | null = null;
  private dump: Promise<string | null> | null = null;

  /** A piece the report left nameless, or whose use spell the dump does not hold, is left out, so it reads as unknown rather than as an item with no use. */
  async items(pieces: readonly GearPiece[]): Promise<ItemTable> {
    const uses = await (this.uses ??= this.loadUses());
    // A failed read is not kept, so the next pull asks again.
    if (!uses) this.uses = null;
    const known = pieces.filter(piece => piece.name && uses?.has(piece.id));
    if (!known.length) return NONE;
    const records = await this.records(new Set(known.flatMap(piece => uses?.get(piece.id) ?? [])));
    return known.reduce<ItemTable>((table, piece) => {
      const use = uses?.get(piece.id) ?? null;
      const record = use === null ? undefined : records.get(use);
      return use !== null && !record ? table : this.add(table, piece, record);
    }, NONE);
  }

  /** The dump proves a use buff or damage but not their absence, which SimC may still grant through a spell the use triggers. */
  private add(table: ItemTable, { id, name }: GearPiece, record: SpellRecord | undefined): ItemTable {
    const token = `item_${id}`;
    const item: PlanItem = { id, name, use: record ? token : null, use_buff: record ? record.statBuff || null : false, use_damage: record ? record.damage || null : false };
    const spells = record ? { ...table.spells, [token]: this.spell(name, record) } : table.spells;
    return { items: { ...table.items, [this.dumps.tokenize(name)]: item }, spells };
  }

  private spell(name: string, record: SpellRecord): PlanSpell {
    return {
      name, ids: [record.id], cooldown: record.cooldown, charges: record.charges, duration: record.duration, gcd: record.gcd,
      cast_time: record.castTime, max_stacks: record.maxStacks, costs: [], energize: null,
    };
  }

  private async loadUses(): Promise<Map<number, number | null> | null> {
    const text = await this.simc.getItemEffects();
    if (!text.ok) return null;
    const uses = new Map<number, number | null>();
    for (const [, spell = '', item = '', trigger = ''] of text.value.matchAll(EFFECT_ROW)) {
      uses.set(Number(item), Number(trigger) === ON_USE ? Number(spell) : uses.get(Number(item)) ?? null);
    }
    return uses;
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
