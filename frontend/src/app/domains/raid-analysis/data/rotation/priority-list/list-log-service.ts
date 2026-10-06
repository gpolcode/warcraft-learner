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

@Injectable({ providedIn: 'root' })
export class ListLogService {
  private readonly wclApi = inject(WclApiService);
  private readonly projections = inject(WclProjectionsService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly contexts = inject(FactContextService);
  private readonly checks = inject(ListCheckService);
  private readonly itemData = inject(ITEM_DATA_SOURCE);

  async read(plan: PriorityList, { reportCode, fight, playerId, abilities, folds }: ListPull): Promise<LogReading> {
    if (!plan.lines.length) return { casts: new Map(), order: [], ids: new Map() };
    const streams = this.checks.streams(plan);
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
    const items = streams.has('gear') ? await this.items(plan, gear) : NO_ITEMS;
    const list = { ...plan, items: { ...plan.items, ...items.items }, spells: { ...plan.spells, ...items.spells } };
    const reading = this.checks.read(this.contexts.build({
      list, abilities,
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

  /** The gear array is positional, its index the slot; a name WCL left blank is asked for only when a fact reads gear. */
  private async gear(worn: WclGearItem[], streams: ReadonlySet<FactStream>): Promise<GearPiece[]> {
    const pieces = worn.flatMap((item, slot): GearPiece[] => (Number(item.id) ? [{ slot, id: Number(item.id), name: item.name ?? '', itemLevel: item.itemLevel ?? 0 }] : []));
    if (!streams.has('gear') || pieces.every(piece => piece.name)) return pieces;
    const names = await this.wclApi.getGameNames(pieces.filter(piece => !piece.name).map(piece => piece.id), []);
    return pieces.map(piece => ({ ...piece, name: piece.name || this.gearExtract.decodeHtmlEntities(names[`i${piece.id}`]?.name ?? '') }));
  }

  /** Asked only for the trinkets the list has no entry for; production's source answers nothing, so the bench's entries stand. */
  private items(plan: PriorityList, gear: GearPiece[]): Promise<ItemTable> {
    const known = new Set(Object.values(plan.items ?? {}).map(item => item.id));
    const ids = gear.filter(piece => (TRINKET_SLOTS as readonly number[]).includes(piece.slot) && !known.has(piece.id)).map(piece => piece.id);
    return ids.length ? this.itemData.items(ids) : Promise.resolve(NO_ITEMS);
  }

  /** The stream never applies an aura that was already up at the pull, so the combatant info's list stands in for those applies. */
  private upAtPull(auras: { ability?: number }[], startTime: number): WclEvent[] {
    return auras.flatMap(aura => (aura.ability ? [{ type: 'applybuff', timestamp: startTime - 1, abilityGameID: aura.ability }] : []));
  }
}
