import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../../wcl/wcl-api-service';
import type { WclAbility, WclEvent, WclFight, WclGearItem } from '../../wcl/wcl.models';
import type { PriorityList } from '../../plan/plan.models';
import { PressFold, WclProjectionsService } from '../../analysis/wcl-projections-service';
import { GearExtractService, TRINKET_SLOTS } from '../../gear/gear-extract-service';
import { ITEM_DATA_SOURCE, ItemTable, NO_ITEMS } from '../../simc/item-data-source';
import { FactContextService } from './fact-context-service';
import { ListCheckService, LogReading } from './list-check-service';
import type { FactStream, GearPiece } from './priority-list.models';

export interface ListPull {
  reportCode: string;
  fight: WclFight;
  playerId: number;
  /** The report's own ability names, which stand in for a name the spell data lacks. */
  abilities: WclAbility[];
  folds: readonly PressFold[];
}

/** A log's reading, with what the item data said of the trinkets it wore that the list did not yet know, for the bench to carry. */
export interface ListReading extends LogReading {
  items: ItemTable;
}

@Injectable({ providedIn: 'root' })
export class ListLogService {
  private readonly wclApi = inject(WclApiService);
  private readonly projections = inject(WclProjectionsService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly itemData = inject(ITEM_DATA_SOURCE);
  private readonly contexts = inject(FactContextService);
  private readonly checks = inject(ListCheckService);

  async read(list: PriorityList, { reportCode, fight, playerId, abilities, folds }: ListPull): Promise<ListReading> {
    if (!list.lines.length) return { casts: new Map(), order: [], ids: new Map(), items: NO_ITEMS };
    const streams = this.checks.streams(list);
    const { startTime, endTime, id } = fight;
    const [casts, buffs, enemyAuras, damage, resources, combatants] = await Promise.all([
      this.wclApi.getAllEvents(reportCode, id, 'Casts', startTime, endTime, playerId, true),
      this.wclApi.getAllEvents(reportCode, id, 'Buffs', startTime, endTime, playerId),
      streams.has('enemyAuras') ? this.wclApi.getEnemyDebuffs(reportCode, id, startTime, endTime, playerId) : Promise.resolve([]),
      // With resources even where no fact reads target health, so the burst card's read of the same rows shares this fetch.
      streams.has('damage') ? this.wclApi.getAllEvents(reportCode, id, 'DamageDone', startTime, endTime, playerId, true) : Promise.resolve([]),
      streams.has('resources') ? this.wclApi.getAllEvents(reportCode, id, 'Resources', startTime, endTime, playerId) : Promise.resolve([]),
      this.wclApi.getCombatantInfo(reportCode, id, playerId),
    ]);
    const combatant = this.gearExtract.selectCombatantInfo(combatants, playerId);
    const gear = await this.gear(combatant?.gear ?? [], streams);
    const items = streams.has('gear') ? await this.items(list, gear) : NO_ITEMS;
    const reading = this.checks.read(this.contexts.build({
      list: this.withItems(list, items), abilities,
      casts: this.projections.withRelativeS(this.projections.presses(casts, folds, { buffs, abilities }), startTime),
      buffs: this.projections.withRelativeS([...this.upAtPull(combatant?.auras ?? [], startTime), ...buffs], startTime),
      debuffs: this.projections.withRelativeS(enemyAuras.filter(event => event.sourceID === playerId), startTime),
      damage: this.projections.withRelativeS(damage, startTime),
      resources: this.projections.withRelativeS(resources, startTime),
      talents: this.gearExtract.pickedTalents(combatant),
      gear,
      fightDurationS: this.projections.relativeS(endTime, startTime),
      kill: fight.kill,
    }));
    return { ...reading, items };
  }

  /** The trinkets this log wore that the list does not yet describe, so ingest asks the item data once per item. */
  private items(list: PriorityList, gear: readonly GearPiece[]): Promise<ItemTable> {
    const unknown = gear.filter(piece => (TRINKET_SLOTS as readonly number[]).includes(piece.slot) && !list.items?.[piece.id]).map(piece => piece.id);
    return unknown.length ? this.itemData.items(unknown) : Promise.resolve(NO_ITEMS);
  }

  private withItems(list: PriorityList, { items, spells }: ItemTable): PriorityList {
    if (!Object.keys(items).length) return list;
    return { ...list, items: { ...list.items, ...items }, spells: { ...list.spells, ...spells } };
  }

  /** The stream never applies an aura that was already up at the pull, so the combatant info's list stands in for those applies. */
  private upAtPull(auras: { ability?: number }[], startTime: number): WclEvent[] {
    return auras.flatMap(aura => (aura.ability ? [{ type: 'applybuff', timestamp: startTime - 1, abilityGameID: aura.ability }] : []));
  }

  /** WCL leaves most gear names blank, so a list that reads gear looks them up, once per pull. */
  private async gear(items: WclGearItem[], streams: ReadonlySet<FactStream>): Promise<GearPiece[]> {
    const pieces = items.flatMap((item, slot) => (Number(item.id) ? [{ slot, id: Number(item.id), name: item.name ?? '', itemLevel: Number(item.itemLevel ?? 0) }] : []));
    const blank = pieces.filter(piece => !piece.name);
    if (!streams.has('gear') || !blank.length) return pieces;
    const names = await this.wclApi.getGameNames(blank.map(piece => piece.id), []);
    this.gearExtract.fillGameNames(blank, 'i', names);
    return pieces;
  }
}
