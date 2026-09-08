import { assert, describe, it, expect } from 'vitest';
import { DEFENSIVE_DATA_SOURCE, DefensiveBench } from './defensive-data-source';
import { featureService } from '../../../../../testing/service-harness';
import { DefensiveFeatureService } from './defensive-feature-service';
import { applyBuff, removeBuff, damageTaken } from '../../../../../testing/builders/events';
import { CLOAK_OF_SHADOWS, EVASION } from '../../../../../testing/spell-ids';
import { wclReport } from '../../../../../testing/builders/wcl-fixtures';
import { Result, Results } from '../../../shared/util-http/result';
import { BOSS_HIT_SPELL_ID, CLOAK_META, WINDOW_REF_GAME_ID, benchWith, defBench, fullBench } from './defensive-harness';

function serviceWith(bench: Result<DefensiveBench>, wcl: Record<string, unknown> = {}): DefensiveFeatureService {
  return featureService(DEFENSIVE_DATA_SOURCE, DefensiveFeatureService, bench, wcl);
}

const EVASION_META = { name: 'Evasion', spell_id: EVASION, cooldown: 120, usage_rule: 'Use on melee', talent_gated: false };

function twoDefensiveBench(): DefensiveBench {
  return benchWith({
    per_defensive_benchmarks: {
      'Cloak of Shadows': defBench(),
      Evasion: defBench({ used_sample_count: 0 }),
    },
    defensives: [CLOAK_META, EVASION_META],
    cd_spell_ids: { 'Cloak of Shadows': CLOAK_OF_SHADOWS, Evasion: EVASION },
    ability_icons: {
      [CLOAK_OF_SHADOWS]: { icon: 'cloak', name: 'Cloak of Shadows' },
      [EVASION]: { icon: 'evasion', name: 'Evasion' },
    },
  });
}

describe('DefensiveFeatureService.loadAnalysisView (post-raid)', () => {
  it('propagates a non-ok bench unchanged (missing drives the waiting state)', async () => {
    const service = serviceWith(Results.missing('Not yet ingested.'));
    const result = await service.loadAnalysisView('SubtletyRogue', 1, 'r1', 1, 10);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });

  it('computes player findings + windows from the player log', async () => {
    const report = wclReport({ playerName: 'P', abilities: [{ gameID: BOSS_HIT_SPELL_ID, name: 'Boss Hit', icon: 'hit' }] });
    const wcl = {
      getReport: async () => report,
      getAllEvents: async (_c: string, _f: number, dataType: string) => {
        if (dataType === 'Buffs') return [applyBuff(CLOAK_OF_SHADOWS, 30), removeBuff(CLOAK_OF_SHADOWS, 35)];
        if (dataType === 'Casts') return [];
        return [damageTaken(BOSS_HIT_SPELL_ID, 32, 1150)]; // t=32 falls inside the 30-35 buff window
      },
    };
    const service = serviceWith(Results.ok(fullBench()), wcl);
    const result = await service.loadAnalysisView('SubtletyRogue', 1, 'r1', 1, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.windows).toHaveLength(1);
    assert.exists(result.value.windows[0]);
    expect(result.value.windows[0].overview.playerPct).toBe(1150);
    expect(result.value.anchors[0]).toMatchObject({ refGameId: WINDOW_REF_GAME_ID });
    // 1 use vs avg ~2, but only one buff window -> first cast at 30 (late) gives a warning finding.
    expect(result.value.findingRows.length).toBeGreaterThan(0);
  });

  it('shapes a missed defensive into a finding row and a defensive used on plan into a chip', async () => {
    const ON_PLAN_USE_S = 40;
    const wcl = {
      getReport: async () => wclReport({ playerName: 'P' }),
      getAllEvents: async (_c: string, _f: number, dataType: string) =>
        dataType === 'Buffs' ? [applyBuff(EVASION, ON_PLAN_USE_S)] : [],
    };
    const service = serviceWith(Results.ok(twoDefensiveBench()), wcl);
    const result = await service.loadAnalysisView('SubtletyRogue', 1, 'r1', 1, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.findingRows).toHaveLength(1);
    expect(result.value.findingRows[0]).toMatchObject({
      severity: 'critical', name: 'Cloak of Shadows', spellId: CLOAK_OF_SHADOWS, icon: 'cloak',
    });
    expect(result.value.onPlan).toEqual([{ name: 'Evasion', spellId: EVASION, icon: 'evasion' }]);
  });

  it('does not throw and yields an empty icon when a cd spell id is missing from the ability map', async () => {
    const report = wclReport({ playerName: 'P' });
    const wcl = { getReport: async () => report, getAllEvents: async () => [] };
    // ability_icons intentionally omits CLOAK_OF_SHADOWS even though cd_spell_ids still references it.
    const bench = { ...fullBench(), ability_icons: {} };
    const service = serviceWith(Results.ok(bench), wcl);
    const result = await service.loadAnalysisView('SubtletyRogue', 1, 'r1', 1, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    assert.exists(result.value.findingRows[0]);
    expect(result.value.findingRows[0].icon).toBe('');
  });

  it('wires the shared pull context with the empty defensive view and the defensive repro id', async () => {
    const UNLOGGED_FIGHT_ID = 99;
    const FAILING_CODE = 'boom';
    // TestBed configures once per test, so one service with one refused report code covers both branches.
    const service = serviceWith(Results.ok(fullBench()), {
      getReport: async (code: string) => {
        if (code === FAILING_CODE) throw new Error('WCL down');
        return wclReport({ fights: [], actors: [] });
      },
      getAllEvents: async () => [],
    });

    const onMissingFight = await service.loadAnalysisView('SubtletyRogue', 1, 'r1', UNLOGGED_FIGHT_ID, 10);
    expect(onMissingFight).toEqual(Results.ok({
      findingRows: [], onPlan: [], windows: [], anchors: [], clipAnchors: [],
    }));

    const onFailure = await service.loadAnalysisView('SubtletyRogue', 1, FAILING_CODE, 1, 10);
    expect(onFailure.ok).toBe(false);
    if (!onFailure.ok) expect(onFailure.error).toMatchObject({ kind: 'permanent', id: 'defensive.player-view' });
  });
});

describe('DefensiveFeatureService.loadPlan (pre-fight)', () => {
  it('returns the bench-only plan rows', async () => {
    const service = serviceWith(Results.ok(fullBench()));
    const result = await service.loadPlan('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.rows).toHaveLength(1);
      expect(result.value.rows[0]).toMatchObject({ name: 'Cloak of Shadows', spellId: CLOAK_OF_SHADOWS, typicalUses: 2, firstCastS: 10, windowsS: [30] });
    }
  });

  it('propagates a missing bench so the pre-fight plan waiting state shows', async () => {
    const service = serviceWith(Results.missing('Not yet ingested.'));
    expect(await service.loadPlan('SubtletyRogue', 1)).toEqual(Results.missing('Not yet ingested.'));
  });
});
