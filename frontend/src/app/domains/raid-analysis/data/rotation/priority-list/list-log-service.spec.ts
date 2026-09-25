import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyDebuff, cast, damage } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { wclReport } from '../../../../../../testing/builders/wcl-fixtures';
import { RUPTURE, SHADOW_DANCE, EVISCERATE } from '../../../../../../testing/spell-ids';
import type { PlanLine } from '../../plan/plan.models';
import type { WclCombatantInfo, WclEvent, WclFight } from '../../wcl/wcl.models';
import { WclApiService } from '../../wcl/wcl-api-service';
import { ListLogService } from './list-log-service';
import { priorityList } from './priority-list-harness';

const PLAYER_ID = 10;
const OTHER_RAIDER = 99;
const list = (terms: string[]) => priorityList({
  lines: [{ action: 'eviscerate', terms } satisfies PlanLine],
  spells: {
    eviscerate: planSpell('Eviscerate', [EVISCERATE]),
    rupture: planSpell('Rupture', [RUPTURE], { duration: 20 }),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { duration: 8 }),
  },
});

interface Call { dataType: string; sourceId?: number; includeResources: boolean; hostilityType?: string }

/** Records every event fetch and answers each stream from the given events. */
function recording(streams: Record<string, WclEvent[]> = {}, combatant: WclCombatantInfo = {}) {
  const calls: Call[] = [];
  TestBed.configureTestingModule({ providers: [{
    provide: WclApiService,
    useValue: {
      getAllEvents: async (_c: string, _f: number, dataType: string, _s: number, _e: number, sourceId?: number, includeResources = false, hostilityType?: string) => {
        calls.push({ dataType, sourceId, includeResources, hostilityType });
        return streams[dataType] ?? [];
      },
      getCombatantInfo: async () => [{ sourceID: PLAYER_ID, ...combatant }],
    },
  }] });
  return { calls, logs: TestBed.inject(ListLogService) };
}
const pull = (): { reportCode: string; fight: WclFight; playerId: number } => {
  const [fight] = wclReport({ endTimeMs: 120_000 }).fights;
  if (!fight) throw new Error('no pull in the fixture report');
  return { reportCode: 'rX', fight, playerId: PLAYER_ID };
};

describe('ListLogService', () => {
  it('fetches the player\'s casts with their pools on', async () => {
    const { calls, logs } = recording();
    await logs.read(list([]), pull());
    expect(calls).toContainEqual({ dataType: 'Casts', sourceId: PLAYER_ID, includeResources: true, hostilityType: undefined });
  });

  it('skips the enemy aura, damage and resource fetches when no fact reads them', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['buff.shadow_dance.up']), pull());
    expect(calls.map(call => call.dataType).sort()).toEqual(['Buffs', 'Casts']);
  });

  it('fetches enemy auras with Enemies hostility and no source, the only shape WCL answers', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['dot.rupture.ticking']), pull());
    expect(calls).toContainEqual({ dataType: 'Debuffs', sourceId: undefined, includeResources: false, hostilityType: 'Enemies' });
  });

  describe('raid-wide enemy auras', () => {
    const BOSS = 1;
    const onBoss = (sourceID: number) => ({ ...applyDebuff(RUPTURE, 0, { target: BOSS }), sourceID });
    const verdict = async (debuffs: WclEvent[]) => {
      const { logs } = recording({ Debuffs: debuffs, Casts: [cast(EVISCERATE, 5, { target: BOSS })], DamageDone: [damage(1, 1, 1, { target: BOSS })] });
      return (await logs.read(list(['dot.rupture.ticking']), pull())).casts.get('eviscerate')?.[0]?.verdict;
    };

    it('reads the player\'s own aura out of the stream', async () => {
      expect(await verdict([onBoss(OTHER_RAIDER), onBoss(PLAYER_ID)])).toBe('on');
    });

    it('leaves out another raider\'s, so the player\'s own never shows and reads as unknown', async () => {
      expect(await verdict([onBoss(OTHER_RAIDER)])).toBe('unjudged');
    });
  });

  it('fetches the target\'s health on the damage rows only when a fact reads it', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['target.health.pct<20']), pull());
    expect(calls).toContainEqual({ dataType: 'DamageDone', sourceId: PLAYER_ID, includeResources: true, hostilityType: undefined });
  });

  it('fetches the gains and drains between casts when a fact reads a pool', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['combo_points>=5']), pull());
    expect(calls.map(call => call.dataType)).toContain('Resources');
  });

  it('reads an aura up at the pull from the combatant info, since the stream never applies it', async () => {
    const { logs } = recording({ Casts: [cast(EVISCERATE, 5)] }, { auras: [{ ability: SHADOW_DANCE }] });
    const reading = await logs.read(list(['buff.shadow_dance.up']), pull());
    expect(reading.casts.get('eviscerate')?.[0]?.verdict).toBe('on');
  });
});
