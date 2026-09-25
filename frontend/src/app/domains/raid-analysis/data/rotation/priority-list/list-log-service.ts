import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../../wcl/wcl-api-service';
import type { WclEvent, WclFight } from '../../wcl/wcl.models';
import type { PriorityList } from '../../plan/plan.models';
import { WclProjectionsService } from '../../analysis/wcl-projections-service';
import { GearExtractService } from '../../gear/gear-extract-service';
import { FactContextService } from './fact-context-service';
import { ListCheckService, LogReading } from './list-check-service';

export interface ListPull {
  reportCode: string;
  fight: WclFight;
  playerId: number;
}

/** Fetches what a list's facts read from one pull and reads the pull against the list; the bench and the player's view share it. */
@Injectable({ providedIn: 'root' })
export class ListLogService {
  private readonly wclApi = inject(WclApiService);
  private readonly projections = inject(WclProjectionsService);
  private readonly gearExtract = inject(GearExtractService);
  private readonly contexts = inject(FactContextService);
  private readonly checks = inject(ListCheckService);

  async read(list: PriorityList, { reportCode, fight, playerId }: ListPull): Promise<LogReading> {
    if (!list.lines.length) return { casts: new Map(), order: [], builds: new Map(), ids: new Map() };
    const streams = this.checks.streams(list);
    const { startTime, endTime, id } = fight;
    const [casts, buffs, enemyAuras, damage, resources, combatants] = await Promise.all([
      this.wclApi.getAllEvents(reportCode, id, 'Casts', startTime, endTime, playerId, true),
      this.wclApi.getAllEvents(reportCode, id, 'Buffs', startTime, endTime, playerId),
      // Unnarrowable, so it costs several raid-wide pages: `Enemies` plus a sourceID returns nothing.
      streams.has('enemyAuras') ? this.wclApi.getAllEvents(reportCode, id, 'Debuffs', startTime, endTime, undefined, false, 'Enemies') : Promise.resolve([]),
      streams.has('damage') || streams.has('targetHealth')
        ? this.wclApi.getAllEvents(reportCode, id, 'DamageDone', startTime, endTime, playerId, streams.has('targetHealth'))
        : Promise.resolve([]),
      streams.has('resources') ? this.wclApi.getAllEvents(reportCode, id, 'Resources', startTime, endTime, playerId) : Promise.resolve([]),
      this.wclApi.getCombatantInfo(reportCode, id, playerId),
    ]);
    const combatant = this.gearExtract.selectCombatantInfo(combatants, playerId);
    const tree = combatant?.talentTree;
    return this.checks.read(this.contexts.build({
      list,
      casts: this.projections.withRelativeS(casts, startTime),
      buffs: this.projections.withRelativeS([...this.upAtPull(combatant?.auras ?? [], startTime), ...buffs], startTime),
      debuffs: this.projections.withRelativeS(enemyAuras.filter(event => event.sourceID === playerId), startTime),
      damage: this.projections.withRelativeS(damage, startTime),
      resources: this.projections.withRelativeS(resources, startTime),
      talents: tree ? new Map(tree.flatMap(node => (node.id == null ? [] : [[node.id, node.rank ?? 1] as const]))) : null,
      fightDurationS: this.projections.relativeS(endTime, startTime),
      kill: fight.kill,
    }));
  }

  /** The stream never applies an aura that was already up at the pull, so the combatant info's list stands in for those applies. */
  private upAtPull(auras: { ability?: number }[], startTime: number): WclEvent[] {
    return auras.flatMap(aura => (aura.ability ? [{ type: 'applybuff', timestamp: startTime - 1, abilityGameID: aura.ability }] : []));
  }
}
