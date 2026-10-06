import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { applyDebuff, cast, damage } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { wclReport } from '../../../../../../testing/builders/wcl-fixtures';
import { RUPTURE, SHADOW_DANCE, EVISCERATE } from '../../../../../../testing/spell-ids';
import type { PlanLine } from '../../plan/plan.models';
import type { WclCombatantInfo, WclEvent } from '../../wcl/wcl.models';
import { WclApiService } from '../../wcl/wcl-api-service';
import { ListLogService, ListPull } from './list-log-service';
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

/** Not WCL data types: they label the enemy-debuff read and the gear-name lookup, which have their own queries, among the recorded calls. */
const ENEMY_DEBUFFS = 'EnemyDebuffs';
const GAME_NAMES = 'GameNames';
const SPYMASTERS_WEB = 220202;
const TRINKET_SLOT = 12;

interface Call { dataType: string; sourceId?: number; includeResources: boolean; hostilityType?: string }

function recording(streams: Record<string, WclEvent[]> = {}, combatant: WclCombatantInfo = {}) {
  const calls: Call[] = [];
  TestBed.configureTestingModule({ providers: [{
    provide: WclApiService,
    useValue: {
      getAllEvents: async (_c: string, _f: number, dataType: string, _s: number, _e: number, sourceId?: number, includeResources = false, hostilityType?: string) => {
        calls.push({ dataType, sourceId, includeResources, hostilityType });
        return streams[dataType] ?? [];
      },
      getEnemyDebuffs: async (_c: string, _f: number, _s: number, _e: number, sourceId: number) => {
        calls.push({ dataType: ENEMY_DEBUFFS, sourceId, includeResources: false });
        return streams[ENEMY_DEBUFFS] ?? [];
      },
      getCombatantInfo: async () => [{ sourceID: PLAYER_ID, ...combatant }],
      getGameNames: async (itemIds: number[]) => {
        calls.push({ dataType: GAME_NAMES, includeResources: false });
        return Object.fromEntries(itemIds.map(id => [`i${id}`, { id, name: id === SPYMASTERS_WEB ? "Spymaster's Web" : '' }]));
      },
    },
  }] });
  return { calls, logs: TestBed.inject(ListLogService) };
}
const pull = (): ListPull => {
  const [fight] = wclReport({ endTimeMs: 120_000 }).fights;
  if (!fight) throw new Error('no pull in the fixture report');
  return { reportCode: 'rX', fight, playerId: PLAYER_ID, abilities: [], folds: [] };
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

  it('fetches only the player\'s own enemy auras when a fact reads them', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['dot.rupture.ticking']), pull());
    expect(calls).toContainEqual({ dataType: ENEMY_DEBUFFS, sourceId: PLAYER_ID, includeResources: false });
  });

  describe('enemy auras', () => {
    const BOSS = 1;
    const onBoss = (sourceID: number) => ({ ...applyDebuff(RUPTURE, 0, { target: BOSS }), sourceID });
    const verdict = async (debuffs: WclEvent[]) => {
      const { logs } = recording({ [ENEMY_DEBUFFS]: debuffs, Casts: [cast(EVISCERATE, 5, { target: BOSS })], DamageDone: [damage(1, 1, 1, { target: BOSS })] });
      return (await logs.read(list(['dot.rupture.ticking']), pull())).casts.get('eviscerate')?.[0]?.verdict;
    };

    it('reads the player\'s own aura out of the stream', async () => {
      expect(await verdict([onBoss(OTHER_RAIDER), onBoss(PLAYER_ID)])).toBe('on');
    });

    it('leaves out another raider\'s, so the player\'s own never shows and reads as unknown', async () => {
      expect(await verdict([onBoss(OTHER_RAIDER)])).toBe('unjudged');
    });
  });

  it('fetches the damage rows with the target\'s health when a fact reads it', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['target.health.pct<20']), pull());
    expect(calls).toContainEqual({ dataType: 'DamageDone', sourceId: PLAYER_ID, includeResources: true, hostilityType: undefined });
  });

  it('fetches the damage rows with the target\'s health even when no fact reads it, as the burst card reads them that way', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['active_enemies>=2']), pull());
    expect(calls).toContainEqual({ dataType: 'DamageDone', sourceId: PLAYER_ID, includeResources: true, hostilityType: undefined });
  });

  it('fetches the gains and drains between casts when a fact reads a pool', async () => {
    const { calls, logs } = recording();
    await logs.read(list(['combo_points>=5']), pull());
    expect(calls.map(call => call.dataType)).toContain('Resources');
  });

  it('reads one cast of a button for a press the log casts twice', async () => {
    const PRESS_S = 5;
    const ECHO_S = 0.02;
    const FOLD_WINDOW_S = 10;
    const { logs } = recording({ Casts: [cast(EVISCERATE, PRESS_S), cast(EVISCERATE, PRESS_S + ECHO_S)] });
    const folds = [{ name: 'Eviscerate', spell_id: EVISCERATE, window_s: FOLD_WINDOW_S }];
    const reading = await logs.read(list([]), { ...pull(), folds });
    expect(reading.casts.get('eviscerate')).toHaveLength(1);
  });

  it('looks up the gear names WCL left blank when a fact reads gear, and judges by them', async () => {
    const gear = Array.from({ length: TRINKET_SLOT + 1 }, (_, slot) => (slot === TRINKET_SLOT ? { id: SPYMASTERS_WEB, itemLevel: 639 } : {}));
    const { calls, logs } = recording({ Casts: [cast(EVISCERATE, 5)] }, { gear });
    const reading = await logs.read(list(['trinket.1.is.spymasters_web']), pull());
    expect(calls.map(call => call.dataType)).toContain(GAME_NAMES);
    expect(reading.casts.get('eviscerate')?.[0]?.verdict).toBe('on');
  });

  it('skips the gear-name lookup when no fact reads gear', async () => {
    const { calls, logs } = recording({ Casts: [cast(EVISCERATE, 5)] }, { gear: [{ id: SPYMASTERS_WEB }] });
    await logs.read(list(['buff.shadow_dance.up']), pull());
    expect(calls.map(call => call.dataType)).not.toContain(GAME_NAMES);
  });

  it('reads an aura up at the pull from the combatant info, since the stream never applies it', async () => {
    const { logs } = recording({ Casts: [cast(EVISCERATE, 5)] }, { auras: [{ ability: SHADOW_DANCE }] });
    const reading = await logs.read(list(['buff.shadow_dance.up']), pull());
    expect(reading.casts.get('eviscerate')?.[0]?.verdict).toBe('on');
  });
});
