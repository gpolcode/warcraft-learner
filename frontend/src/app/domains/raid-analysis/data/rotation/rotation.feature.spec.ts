import { assert, describe, it, expect } from 'vitest';
import { Result, Results } from '../../../shared/util-http/result';
import { SHADOW_BLADES, SHADOW_DANCE, SECRET_TECHNIQUE, BLOODLUST } from '../../../../../testing/spell-ids';
import { cast, applyBuff, removeBuff } from '../../../../../testing/builders/events';
import { wclReport } from '../../../../../testing/builders/wcl-fixtures';
import { planSpell } from '../../../../../testing/builders/spec-plan';
import { ButtonBench, ROTATION_DATA_SOURCE, RotationBench } from './rotation-data-source';
import { featureService } from '../../../../../testing/service-harness';
import { RotationFeatureService } from './rotation-feature-service';
import { bench, cdBench } from './rotation-harness';

// Subtlety's Secret Technique inside Shadow Dance, which the top logs never press outside it.
const LIST = {
  lines: [{ action: 'secret_technique', terms: ['buff.shadow_dance.up'] }],
  spells: {
    secret_technique: planSpell('Secret Technique', [SECRET_TECHNIQUE]),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { duration: 8 }),
  },
  variables: [],
  talents: {},
};
const ALWAYS_RIGHT: ButtonBench = {
  action: 'secret_technique', spell_id: SECRET_TECHNIQUE, right: { lo: 1, avg: 1, hi: 1 },
  allowed: [1],
};

const FIGHT_END_MS = 120_000;
const REPORT = wclReport({ endTimeMs: FIGHT_END_MS, actors: [] });

// Resolves a valid (empty) player log, so a test's outcome is driven by the bench Result rather than an incidental transport throw.
const WORKING_WCL = {
  getReport: async () => REPORT,
  getAllEvents: async () => [],
};

function withSource(bench: Result<RotationBench>, wcl: unknown = WORKING_WCL): RotationFeatureService {
  return featureService(ROTATION_DATA_SOURCE, RotationFeatureService, bench, wcl);
}

describe('RotationFeatureService', () => {
  it('surfaces a missing bench so the offensives waiting state shows', async () => {
    // A working WCL fake proves the missing comes from the bench read, not a player-log failure.
    const service = withSource(Results.missing('Not yet ingested.'));
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });

  it('wires the shared pull context with the empty offensives view and the rotation repro id', async () => {
    const UNLOGGED_FIGHT_ID = 99;
    const FAILING_CODE = 'boom';
    // TestBed configures once per test, so one service with one refused report code covers both branches.
    const service = withSource(Results.ok(bench()), {
      ...WORKING_WCL,
      getReport: async (code: string) => { if (code === FAILING_CODE) throw new Error('WCL down'); return REPORT; },
    });

    const onMissingFight = await service.loadPlayerView('SubtletyRogue', 1, 'rX', UNLOGGED_FIGHT_ID, 10);
    expect(onMissingFight).toEqual(Results.ok({ buttonRows: [], downtimeRows: [], offensiveRows: [], onPlan: [] }));

    const onFailure = await service.loadPlayerView('SubtletyRogue', 1, FAILING_CODE, 1, 10);
    expect(onFailure.ok).toBe(false);
    if (!onFailure.ok) expect(onFailure.error).toMatchObject({ kind: 'permanent', id: 'rotation.player-view' });
  });

  it('judges the player\'s casts against the list the bench carries', async () => {
    const wcl = {
      getReport: async () => REPORT,
      // The log has to show Shadow Dance, or the aura reads as unknown rather than down.
      getAllEvents: async (_c: string, _f: number, dataType: string) =>
        (dataType === 'Casts' ? [cast(SECRET_TECHNIQUE, 30)] : dataType === 'Buffs' ? [applyBuff(SHADOW_DANCE, 5), removeBuff(SHADOW_DANCE, 13)] : []),
      getCombatantInfo: async () => [],
    };
    const service = withSource(Results.ok(bench({ list: LIST, buttons: [ALWAYS_RIGHT] })), wcl);
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    assert(result.ok);
    expect(result.value.buttonRows).toMatchObject([{ name: 'Secret Technique', you: 0, top: ALWAYS_RIGHT.right }]);
    expect(result.value.buttonRows[0]?.occurrences[0]?.checks).toEqual([{ text: 'While Shadow Dance is up', truth: 'false', value: 'no' }]);
  });

  it('judges no button on a bench an older ingest wrote without a list, and still reads the offensives', async () => {
    const { list: _list, buttons: _buttons, ...older } = bench();
    const service = withSource(Results.ok(older as RotationBench), WORKING_WCL);
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    assert(result.ok);
    expect(result.value.buttonRows).toEqual([]);
  });

  it('computes player findings from the player log', async () => {
    const wcl = {
      getReport: async () => wclReport({
        endTimeMs: FIGHT_END_MS, actors: [], abilities: [{ gameID: SHADOW_BLADES, name: 'Shadow Blades', icon: 'sb' }],
      }),
      getAllEvents: async (_c: string, _f: number, dataType: string) =>
        dataType === 'Casts' ? [cast(SHADOW_BLADES, 6)] : [applyBuff(BLOODLUST, 6)],
    };
    const single = bench({ per_cd_benchmarks: { 'Shadow Blades': cdBench({ uses_per_min: { avg: 0.5, stddev: 0.1 } }) } });
    const service = withSource(Results.ok(single), wcl);
    const result = await service.loadPlayerView('SubtletyRogue', 1, 'rX', 1, 10);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.onPlan).toEqual([{ name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: 'sb' }]);
  });

  it('returns bench-only plan rows for the pre-fight view', async () => {
    const service = withSource(Results.ok(bench({
      per_cd_benchmarks: { 'Shadow Blades': cdBench() },
    })));
    const result = await service.loadPlanView('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.rows).toHaveLength(1);
      assert.exists(result.value.rows[0]);
      expect(result.value.rows[0].name).toBe('Shadow Blades');
      assert.exists(result.value.rows[0]);
      expect(result.value.rows[0].icon).toBe('sb');
    }
  });

  it('propagates a missing bench so the pre-fight plan waiting state shows', async () => {
    const service = withSource(Results.missing('Not yet ingested.'));
    expect(await service.loadPlanView('SubtletyRogue', 1)).toEqual(Results.missing('Not yet ingested.'));
  });
});
