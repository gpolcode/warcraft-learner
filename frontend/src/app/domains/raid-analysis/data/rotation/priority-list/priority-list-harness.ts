import { TestBed } from '@angular/core/testing';
import type { PriorityList } from '../../plan/plan.models';
import type { WclEvent } from '../../wcl/wcl.models';
import { WclProjectionsService } from '../../analysis/wcl-projections-service';
import { FactContextService } from './fact-context-service';
import type { CastMoment, FactContext } from './priority-list.models';

const FIGHT_S = 300;

export function priorityList(over: Partial<PriorityList> = {}): PriorityList {
  return { lines: [], variables: [], spells: {}, talents: {}, ...over };
}

export interface LogEvents {
  casts?: WclEvent[];
  buffs?: WclEvent[];
  debuffs?: WclEvent[];
  damage?: WclEvent[];
  resources?: WclEvent[];
  talents?: [number, number][];
  fightDurationS?: number;
  kill?: boolean;
}

/** One log's facts, its events built against a fight starting at 0. */
export function factContext(list: PriorityList, log: LogEvents = {}): FactContext {
  const timed = (events: WclEvent[] = []) => TestBed.inject(WclProjectionsService).withRelativeS(events, 0);
  return TestBed.inject(FactContextService).build({
    list,
    casts: timed(log.casts), buffs: timed(log.buffs), debuffs: timed(log.debuffs), damage: timed(log.damage), resources: timed(log.resources),
    talents: log.talents ? new Map(log.talents) : null,
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
