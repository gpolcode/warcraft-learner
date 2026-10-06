import { TestBed } from '@angular/core/testing';
import type { PriorityList } from '../../plan/plan.models';
import type { WclAbility, WclEvent } from '../../wcl/wcl.models';
import { WclProjectionsService } from '../../analysis/wcl-projections-service';
import { FactContextService } from './fact-context-service';
import type { CastMoment, FactContext, GearPiece } from './priority-list.models';

const FIGHT_S = 300;

export function priorityList(over: Partial<PriorityList> = {}): PriorityList {
  return { lines: [], variables: [], spells: {}, talents: {}, ...over };
}

export interface LogEvents {
  abilities?: WclAbility[];
  casts?: WclEvent[];
  buffs?: WclEvent[];
  debuffs?: WclEvent[];
  damage?: WclEvent[];
  resources?: WclEvent[];
  talents?: [number, number][];
  gear?: GearPiece[];
  fightDurationS?: number;
  kill?: boolean;
}

/** One log's facts, its events built against a fight starting at 0. */
export function factContext(list: PriorityList, log: LogEvents = {}): FactContext {
  const timed = (events: WclEvent[] = []) => TestBed.inject(WclProjectionsService).withRelativeS(events, 0);
  return TestBed.inject(FactContextService).build({
    list, abilities: log.abilities ?? [],
    casts: timed(log.casts), buffs: timed(log.buffs), debuffs: timed(log.debuffs), damage: timed(log.damage), resources: timed(log.resources),
    talents: log.talents ? new Map(log.talents) : null,
    gear: log.gear ?? [],
    fightDurationS: log.fightDurationS ?? FIGHT_S,
    kill: log.kill ?? true,
  });
}

export function castAt(ctx: FactContext, atS: number, target: string | null = null): CastMoment {
  const index = ctx.casts.findIndex(event => event.atS === atS);
  const event = ctx.casts[index];
  if (!event) throw new Error(`no cast at ${atS}s`);
  return { atS, event, index, target };
}
