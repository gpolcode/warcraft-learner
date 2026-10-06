import { Injectable, inject } from '@angular/core';
import { LoggerService } from '../../../../shared/util-logging/logger-service';
import { WclApiService } from '../../wcl/wcl-api-service';
import type { WclAbility, WclCombatantInfo, WclEvent, WclFight, WclGearItem } from '../../wcl/wcl.models';
import type { ItemTable, PriorityList } from '../../plan/plan.models';
import { PressFold, WclProjectionsService } from '../../analysis/wcl-projections-service';
import { GearExtractService, TRINKET_SLOTS } from '../../gear/gear-extract-service';
import { FactContextService } from './fact-context-service';
import { ListCheckService, LogReading } from './list-check-service';
import type { FactStream, GearPiece } from './priority-list.models';

const NO_ITEMS: ItemTable = { items: {}, spells: {} };

export interface ListPull {
  reportCode: string;
  fight: WclFight;
  playerId: number;
  /** The report's own ability names, which stand in for a name the spell data lacks. */
  abilities: WclAbility[];
  folds: readonly PressFold[];
  /** Ingest's read of SimC's item data for the trinkets the list has no entry for; production passes none, so the bench's entries stand. */
  items?: (trinkets: readonly GearPiece[]) => Promise<ItemTable>;
}

@Injectable({ providedIn: 'root' })
export class ListLogService {
  private readonly logger = inject(LoggerService);
  private readonly wclApi = inject(WclApiService);
  private readonly projections = inject(WclProjectionsService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly contexts = inject(FactContextService);
  private readonly checks = inject(ListCheckService);

  async read(plan: PriorityList, { reportCode, fight, playerId, abilities, folds, items: lookup }: ListPull): Promise<LogReading> {
    if (!plan.lines.length) return { casts: new Map(), order: [], ids: new Map() };
    const streams = this.checks.streams(plan);
    const { startTime, endTime, id } = fight;
    const combatant = this.wclApi.getCombatantInfo(reportCode, id, playerId).then(all => this.gearExtract.selectCombatantInfo(all, playerId));
    const [casts, buffs, enemyAuras, damage, resources, info, gear] = await Promise.all([
      this.wclApi.getAllEvents(reportCode, id, 'Casts', startTime, endTime, playerId, true),
      this.wclApi.getAllEvents(reportCode, id, 'Buffs', startTime, endTime, playerId),
      streams.has('enemyAuras') ? this.wclApi.getEnemyDebuffs(reportCode, id, startTime, endTime, playerId) : Promise.resolve([]),
      // With resources even where no fact reads target health, so the burst card's read of the same rows shares this fetch.
      streams.has('damage') ? this.wclApi.getAllEvents(reportCode, id, 'DamageDone', startTime, endTime, playerId, true) : Promise.resolve([]),
      streams.has('resources') ? this.wclApi.getAllEvents(reportCode, id, 'Resources', startTime, endTime, playerId) : Promise.resolve([]),
      combatant,
      combatant.then(found => this.gear(found, streams, reportCode)),
    ]);
    const unlisted = streams.has('gear') ? this.unlisted(plan, gear) : [];
    const items = lookup && unlisted.length ? await lookup(unlisted) : NO_ITEMS;
    const list = { ...plan, items: { ...plan.items, ...items.items }, spells: { ...plan.spells, ...items.spells } };
    const reading = this.checks.read(this.contexts.build({
      list, abilities,
      casts: this.projections.withRelativeS(this.projections.presses(casts, folds, { buffs, abilities }), startTime),
      buffs: this.projections.withRelativeS([...this.upAtPull(info?.auras ?? [], startTime), ...buffs], startTime),
      debuffs: this.projections.withRelativeS(enemyAuras.filter(event => event.sourceID === playerId), startTime),
      damage: this.projections.withRelativeS(damage, startTime),
      resources: this.projections.withRelativeS(resources, startTime),
      talents: this.gearExtract.pickedTalents(info),
      gear,
      fightDurationS: this.projections.relativeS(endTime, startTime),
      kill: fight.kill,
    }));
    return { ...reading, items };
  }

  /** The gear array is positional, its index the slot; a name WCL left blank is asked for only when a fact reads gear, and stays blank when that lookup fails. */
  private async gear(combatant: WclCombatantInfo | null, streams: ReadonlySet<FactStream>, reportCode: string): Promise<GearPiece[]> {
    const pieces = (combatant?.gear ?? []).flatMap((item: WclGearItem, slot): GearPiece[] => (Number(item.id) ? [{ slot, id: Number(item.id), name: item.name ?? '', itemLevel: item.itemLevel ?? 0 }] : []));
    if (!streams.has('gear') || pieces.every(piece => piece.name)) return pieces;
    try {
      const names = await this.wclApi.getGameNames(pieces.filter(piece => !piece.name).map(piece => piece.id), []);
      return pieces.map(piece => ({ ...piece, name: piece.name || this.gearExtract.decodeHtmlEntities(names[`i${piece.id}`]?.name ?? '') }));
    } catch (cause) {
      this.logger.logWarn(`ListLogService item names ${reportCode}`, cause);
      return pieces;
    }
  }

  private unlisted(plan: PriorityList, gear: GearPiece[]): GearPiece[] {
    const known = new Set(Object.values(plan.items ?? {}).map(item => item.id));
    return gear.filter(piece => (TRINKET_SLOTS as readonly number[]).includes(piece.slot) && !known.has(piece.id));
  }

  /** The stream never applies an aura that was already up at the pull, so the combatant info's list stands in for those applies. */
  private upAtPull(auras: { ability?: number }[], startTime: number): WclEvent[] {
    return auras.flatMap(aura => (aura.ability ? [{ type: 'applybuff', timestamp: startTime - 1, abilityGameID: aura.ability }] : []));
  }
}
