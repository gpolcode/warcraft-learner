import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PullModel, PullModelInput, PullModelService } from './pull-model-service';
import { WclProjectionsService } from './wcl-projections-service';
import { WclApiService } from '../wcl/wcl-api-service';
import { WclEvent, WclFight } from '../wcl/wcl.models';
import { AnalysisFinding } from './analysis.models';
import { spansS } from './analysis-math';
import { applyBuff, death, removeBuff, resurrect } from '../../../../../testing/builders/events';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { BLOODLUST } from '../../../../../testing/spell-ids';

const pullModels = TestBed.inject(PullModelService);
const projections = TestBed.inject(WclProjectionsService);

const PLAYER_ID = 10;
const FIGHT_S = 300;
const MS_PER_S = 1000;
// Four raiders, so two dead at once is half the raid.
const RAID = [PLAYER_ID, 11, 12, 13];

function fight(over: Partial<WclFight> = {}): WclFight {
  return {
    id: 1, name: 'Boss', startTime: 0, endTime: FIGHT_S * MS_PER_S, kill: false, encounterID: 1, attempt: 1,
    duration_s: FIGHT_S, friendlyPlayers: RAID, fightPercentage: 40,
    ...over,
  };
}

function built(over: { fight?: Partial<WclFight>; deaths?: WclEvent[]; resurrects?: WclEvent[]; buffs?: WclEvent[] } = {}): PullModel {
  const input: PullModelInput = {
    fight: fight(over.fight), fightDurationS: FIGHT_S, playerId: PLAYER_ID,
    deaths: projections.withRelativeS(over.deaths ?? [], 0),
    resurrects: projections.withRelativeS(over.resurrects ?? [], 0),
    buffs: projections.withRelativeS(over.buffs ?? [], 0),
    role: 'dps',
  };
  return pullModels.build(input);
}

describe('PullModelService judged end', () => {
  const HALF_DOWN_S = 200;
  const halfDown = [death(11, 150), death(12, HALF_DOWN_S)];

  it('runs a kill to the fight end, however many raiders died', () => {
    expect(built({ fight: { kill: true }, deaths: halfDown })).toMatchObject({ judgedEndS: FIGHT_S, judgedEndCause: 'kill' });
  });

  it('ends a wipe where the raid called it', () => {
    const CALLED_S = 180;
    expect(built({ fight: { wipeCalledTime: CALLED_S * MS_PER_S } })).toMatchObject({ judgedEndS: CALLED_S, judgedEndCause: 'wipe_called' });
  });

  it('reads the called wipe against the fight start, since WCL stamps it on the report clock', () => {
    const START_MS = 60_000;
    const CALLED_S = 180;
    const late = built({ fight: { startTime: START_MS, endTime: START_MS + FIGHT_S * MS_PER_S, wipeCalledTime: START_MS + CALLED_S * MS_PER_S } });
    expect(late.judgedEndS).toBe(CALLED_S);
  });

  it('ignores a wipe call at the fight end, which cuts nothing', () => {
    expect(built({ fight: { wipeCalledTime: FIGHT_S * MS_PER_S } })).toMatchObject({ judgedEndS: FIGHT_S, judgedEndCause: 'wipe' });
  });

  it('ends an uncalled wipe the first instant half the raid is dead at once', () => {
    expect(built({ deaths: halfDown })).toMatchObject({ judgedEndS: HALF_DOWN_S, judgedEndCause: 'raid_collapse' });
  });

  it('runs an uncalled wipe to the fight end when a resurrect keeps the raid one short of half', () => {
    const rezzed = built({ deaths: halfDown, resurrects: [resurrect(11, 190)] });
    expect(rezzed).toMatchObject({ judgedEndS: FIGHT_S, judgedEndCause: 'wipe' });
  });
});

describe('PullModelService alive spans', () => {
  const DIED_S = 100;
  const BACK_S = 130;

  it('removes exactly the dead span from the alive time', () => {
    const model = built({ fight: { kill: true }, deaths: [death(PLAYER_ID, DIED_S)], resurrects: [resurrect(PLAYER_ID, BACK_S)] });
    expect(model.aliveSpans).toEqual([[0, DIED_S], [BACK_S, FIGHT_S]]);
    expect(spansS(model.aliveSpans)).toBe(FIGHT_S - (BACK_S - DIED_S));
  });

  it('closes a death with no resurrect at the judged end', () => {
    const CALLED_S = 250;
    const model = built({ fight: { wipeCalledTime: CALLED_S * MS_PER_S }, deaths: [death(PLAYER_ID, DIED_S)] });
    expect(model.deadSpans).toEqual([[DIED_S, CALLED_S]]);
    expect(model.aliveSpans).toEqual([[0, DIED_S]]);
  });

  it('keeps a death at or after the judged end out of the player\'s own deaths, as part of the wipe', () => {
    const CALLED_S = 250;
    const model = built({ fight: { wipeCalledTime: CALLED_S * MS_PER_S }, deaths: [death(PLAYER_ID, CALLED_S)] });
    expect(model.deadSpans).toEqual([]);
    expect(model.aliveSpans).toEqual([[0, CALLED_S]]);
  });

  it('partitions the judged span into alive and dead time with nothing left over', () => {
    const deaths = [death(PLAYER_ID, 40), death(PLAYER_ID, 200), death(11, 210), death(12, 220)];
    const model = built({ deaths, resurrects: [resurrect(PLAYER_ID, 70)] });
    const deadS = model.deadSpans.reduce((sum, [diedS, backS]) => sum + backS - diedS, 0);
    expect(spansS(model.aliveSpans) + deadS).toBe(model.judgedEndS);
    for (const [fromS, toS] of model.aliveSpans) expect(pullModels.causeOf(model, fromS, toS)).toBeNull();
  });
});

describe('PullModelService lust, phases and role', () => {
  it('reads the earliest Bloodlust on the player as the lust span', () => {
    const LUST_S = 12;
    const LUST_END_S = 52;
    expect(built({ buffs: [applyBuff(BLOODLUST, LUST_S), removeBuff(BLOODLUST, LUST_END_S)] }).lust).toEqual({ startS: LUST_S, endS: LUST_END_S });
  });

  it('carries no lust when the player never had it', () => {
    expect(built().lust).toBeNull();
  });

  it('turns WCL phase transitions into pull-relative starts', () => {
    const START_MS = 60_000;
    const PHASE_TWO_S = 95;
    const phased = built({ fight: { startTime: START_MS, endTime: START_MS + FIGHT_S * MS_PER_S, phaseTransitions: [{ id: 1, startTime: START_MS }, { id: 2, startTime: START_MS + PHASE_TWO_S * MS_PER_S }] } });
    expect(phased.phases).toEqual([{ id: 1, startS: 0 }, { id: 2, startS: PHASE_TWO_S }]);
  });

  it('names the role from the roster group that lists the player', () => {
    const roster = { tanks: [{ id: 3, type: 'Warrior', name: 'T' }], healers: [{ id: PLAYER_ID, type: 'Priest', name: 'H' }] };
    expect(pullModels.roleOf(roster, PLAYER_ID)).toBe('healer');
    expect(pullModels.roleOf(roster, 3)).toBe('tank');
  });

  it('names no role for a player the roster does not list', () => {
    expect(pullModels.roleOf({ dps: [{ id: 3, type: 'Rogue', name: 'D' }] }, PLAYER_ID)).toBe('unknown');
  });
});

describe('PullModelService causeOf', () => {
  const CALLED_S = 200;
  const called = pullModel({ judgedEndS: CALLED_S, judgedEndCause: 'wipe_called', deadSpans: [[100, 120]] });

  it('judges a stretch ending exactly at the judged end', () => {
    expect(pullModels.causeOf(called, 180, CALLED_S)).toBeNull();
  });

  it('puts a stretch ending just after the judged end after the wipe', () => {
    expect(pullModels.causeOf(called, 180, CALLED_S + 0.1)).toBe('after_wipe');
  });

  it('puts a stretch past the end of a kill as not reached', () => {
    expect(pullModels.causeOf(pullModel({ fightDurationS: CALLED_S }), 180, CALLED_S + 0.1)).toBe('not_reached');
  });

  it('names the death first when a stretch crosses both a death and the wipe', () => {
    expect(pullModels.causeOf(called, 110, CALLED_S + 1)).toBe('dead');
  });

  it('judges a stretch that ends the instant the player dies', () => {
    expect(pullModels.causeOf(called, 90, 100)).toBeNull();
  });
});

describe('PullModelService foldFindings', () => {
  const finding = (span?: { fromS: number; toS: number }): AnalysisFinding =>
    ({ severity: 'warning', category: 'cooldown_delay', message: 'probe', occurrences: [], ...(span && { span }) });
  const deadMidway = pullModel({ deadSpans: [[100, 120]] });

  it('folds a finding whose span the death explains, and counts it under the death', () => {
    const { kept, folded } = pullModels.foldFindings(deadMidway, [finding({ fromS: 90, toS: 130 })]);
    expect(kept).toEqual([]);
    expect(folded).toEqual({ dead: 1, after_wipe: 0, not_reached: 0 });
  });

  it('keeps a finding with no span, which no timeline event can explain', () => {
    expect(pullModels.foldFindings(deadMidway, [finding()]).kept).toHaveLength(1);
  });
});

describe('PullModelService load', () => {
  function recording(deaths: WclEvent[]): { wcl: WclApiService; resurrectReads: () => number } {
    let reads = 0;
    const wcl = {
      getAllEvents: async (_c: string, _f: number, dataType: string) => (dataType === 'Deaths' ? deaths : []),
      getPlayerDetails: async () => ({ dps: [{ id: PLAYER_ID, type: 'Rogue', name: 'P' }] }),
      getResurrects: async () => { reads += 1; return []; },
    } as unknown as WclApiService;
    return { wcl, resurrectReads: () => reads };
  }
  const PULL = { reportCode: 'rX', playerId: PLAYER_ID };

  it('reads the resurrects when the player died, and names the role from the roster', async () => {
    const { wcl, resurrectReads } = recording([death(PLAYER_ID, 50)]);
    const model = await pullModels.load(wcl, PULL, fight({ kill: true }), FIGHT_S);
    expect(resurrectReads()).toBe(1);
    expect(model.role).toBe('dps');
  });

  it('reads the resurrects on an uncalled wipe with half the raid dead', async () => {
    const { wcl, resurrectReads } = recording([death(11, 50), death(12, 60)]);
    await pullModels.load(wcl, PULL, fight(), FIGHT_S);
    expect(resurrectReads()).toBe(1);
  });

  it('skips the resurrects when one death short of half the raid and the player alive', async () => {
    const { wcl, resurrectReads } = recording([death(11, 50)]);
    await pullModels.load(wcl, PULL, fight(), FIGHT_S);
    expect(resurrectReads()).toBe(0);
  });
});
