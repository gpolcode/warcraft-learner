import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../../wcl/wcl-api-service';
import type { WclAbility, WclEvent, WclFight, WclGearItem } from '../../wcl/wcl.models';
import type { PriorityList } from '../../plan/plan.models';
import { PressFold, WclProjectionsService } from '../../analysis/wcl-projections-service';
import { GearExtractService } from '../../gear/gear-extract-service';
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

  async read(list: PriorityList, { reportCode, fight, playerId, abilities, folds }: ListPull): Promise<LogReading> {
    if (!list.lines.length) return { casts: new Map(), order: [], ids: new Map() };
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
    return this.checks.read(this.contexts.build({
      list, abilities,
      casts: this.projections.withRelativeS(this.projections.presses(casts, folds, { buffs, abilities }), startTime),
      buffs: this.projections.withRelativeS([...this.upAtPull(combatant?.auras ?? [], startTime), ...buffs], startTime),
      debuffs: this.projections.withRelativeS(enemyAuras.filter(event => event.sourceID === playerId), startTime),
      damage: this.projections.withRelativeS(damage, startTime),
      resources: this.projections.withRelativeS(resources, startTime),
      talents: this.gearExtract.pickedTalents(combatant),
      gear: await this.gear(combatant?.gear ?? [], streams),
      fightDurationS: this.projections.relativeS(endTime, startTime),
      kill: fight.kill,
    }));
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
