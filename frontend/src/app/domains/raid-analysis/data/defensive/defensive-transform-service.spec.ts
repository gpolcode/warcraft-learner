import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DefensiveTransformService, ParseDefWindow, ParseDefensiveSummary } from './defensive-transform-service';
import { applyBuff, removeBuff, damageTaken, cast } from '../../../../../testing/builders/events';
import { planLoader, specPlan } from '../../../../../testing/builders/spec-plan';
import { abilityLookup, parseRankings, reportsByCode } from '../../../../../testing/builders/wcl-fixtures';
import { provideApiFakes } from '../../../../../testing/api-fakes';
import { BLUR, BLUR_BUFF, CLOAK_OF_SHADOWS, EVASION, WCL_SYNTHETIC_SOURCE_FALLBACK_ID } from '../../../../../testing/spell-ids';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';

const wclProjections = TestBed.inject(WclProjectionsService);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
] });
const svc = TestBed.inject(DefensiveTransformService);
TestBed.resetTestingModule();

/** Fixture events build against a fight-start of 0, so stamping is a pass-through to seconds. */
const timed: WclProjectionsService['withRelativeS'] = (events, startMs) => wclProjections.withRelativeS(events, startMs);

// Enemy-side identifiers for the damage-taken fixtures (not player abilities, so local).
const BOSS_HIT = 700;
const ADD_HIT = 701;
const BOSS_ACTOR = 9;
const ADD_ACTOR = 8;
const BOSS_GAME_ID = 6666;
const ADD_GAME_ID = 5555;

const CLOAK = { name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, cooldown: 120 };
const FIGHT_DUR_S = 300;

describe('defensivePlanMeta', () => {
  it('carries metadata with nullable defaults', () => {
    expect(svc['defensivePlanMeta']([{ name: 'Evasion', spell_id: EVASION, cooldown: 120 }]))
      .toEqual([{ name: 'Evasion', spell_id: EVASION, cooldown: 120, talent_gated: false }]);
  });

  it('carries the talent entries that grant a talent-gated defensive', () => {
    const ENTRY = 90003;
    expect(svc['defensivePlanMeta']([{ name: 'Evasion', spell_id: EVASION, cooldown: 120, talent_gated: true, talent_entries: [ENTRY] }]))
      .toEqual([{ name: 'Evasion', spell_id: EVASION, cooldown: 120, talent_gated: true, talent_entries: [ENTRY] }]);
  });
});

/** One parse's uses of Cloak, as `DefensiveUsesService.uses` reads them. */
const cloakUses = (...uses: { start_s: number; end_s: number }[]) => new Map([[CLOAK_OF_SHADOWS, uses]]);

describe('summarizeDefensiveCasts', () => {
  it('reads each use start as a cast, a point use included, and detects holds > 8s past cooldown', () => {
    const FIRST_USE_S = 10, FIRST_AURA_END_S = 15;
    const SECOND_USE_S = 200;  // a point use: an external on another raider
    const HELD_INDEX = 2;  // 1-based ordinal of the held (second) use
    // The second use lands SECOND_USE_S - (FIRST_USE_S + cooldown) past its reset, well over 8s.
    const EXPECTED_DELAY_S = SECOND_USE_S - (FIRST_USE_S + CLOAK.cooldown);
    const uses = cloakUses({ start_s: FIRST_USE_S, end_s: FIRST_AURA_END_S }, { start_s: SECOND_USE_S, end_s: SECOND_USE_S });
    const summaries = svc['summarizeDefensiveCasts']([CLOAK], uses, FIGHT_DUR_S);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ name: 'Cloak of Shadows', cast_times_s: [FIRST_USE_S, SECOND_USE_S], first_cast_s: FIRST_USE_S, cast_pattern: 'hold' });
    // cast_index is 1-based (the 2nd use), matching rotation + the runtime's -1 decode.
    assert.exists(summaries[0]);
    expect(summaries[0].hold_windows).toEqual([{ cast_index: HELD_INDEX, actual_s: SECOND_USE_S, delay_s: EXPECTED_DELAY_S }]);
  });

  it('records no summary for a defensive the parse never used', () => {
    expect(svc['summarizeDefensiveCasts']([CLOAK], new Map(), FIGHT_DUR_S)).toEqual([]);
  });
});

describe('findParseDefensiveWindows', () => {
  it('slices damage taken by the use window (inclusive end, amount + absorbed) and picks the dominant enemy', () => {
    const BOSS_ABSORB = 250;
    const result = svc['findParseDefensiveWindows'](
      timed([
        damageTaken(BOSS_HIT, 12, 500, { source: BOSS_ACTOR, absorbed: BOSS_ABSORB }),
        damageTaken(ADD_HIT, 15, 200, { source: ADD_ACTOR }), // at the exact aura-end second: the inclusive end must count it
        damageTaken(BOSS_HIT, 100, 999, { source: BOSS_ACTOR }),
      ], 0),
      cloakUses({ start_s: 10, end_s: 15 }), [CLOAK], new Map([[BOSS_ACTOR, BOSS_GAME_ID], [ADD_ACTOR, ADD_GAME_ID]]),
    );
    expect(result).toHaveLength(1);
    // window damage = (500 + 250 absorbed) + 200 at the inclusive end = 950.
    expect(result[0]).toMatchObject({ defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, window_damage: 950, ref_game_id: BOSS_GAME_ID });
    assert.exists(result[0]);
    expect(result[0].ability_breakdown[0]).toMatchObject({ spell_id: BOSS_HIT, damage: 750 });
  });

  it('builds no window from a point use, an external on another raider, even with a hit at its second', () => {
    const PRESS_S = 40;
    const result = svc['findParseDefensiveWindows'](
      timed([damageTaken(BOSS_HIT, PRESS_S, 400, { source: BOSS_ACTOR })], 0),
      cloakUses({ start_s: PRESS_S, end_s: PRESS_S }), [CLOAK], new Map([[BOSS_ACTOR, BOSS_GAME_ID]]),
    );
    expect(result).toEqual([]);
  });

  it('includes a hit landing at the exact millisecond of the press', () => {
    // A hit at the exact press ms must count: rebuilding the bound from seconds overshoots (2.007 * 1000 = 2007.0000000000002).
    const PRESS_MS = 2007;
    const HIT_DAMAGE = 500;
    const [press] = timed([{ ...cast(CLOAK_OF_SHADOWS, 0), timestamp: PRESS_MS }], 0);
    const hit = { ...damageTaken(BOSS_HIT, 0, HIT_DAMAGE, { source: BOSS_ACTOR }), timestamp: PRESS_MS };
    assert.exists(press);
    const result = svc['findParseDefensiveWindows'](
      timed([hit], 0), cloakUses({ start_s: press.atS, end_s: FIGHT_DUR_S }), [CLOAK], new Map([[BOSS_ACTOR, BOSS_GAME_ID]]),
    );
    expect(result).toHaveLength(1);
    assert.exists(result[0]);
    expect(result[0].window_damage).toBe(HIT_DAMAGE);
  });
});

describe('windowDamageBreakdown', () => {
  // hit = [timestampMs, damage, abilityId, sourceId]
  type Hit = [number, number, number, number | null];
  it('sums damage per ability id, highest first, ignoring id 0', () => {
    const hits: Hit[] = [
      [0, 500, BOSS_HIT, BOSS_ACTOR], [0, 200, ADD_HIT, ADD_ACTOR], [0, 100, BOSS_HIT, BOSS_ACTOR], [0, 999, 0, null],
    ];
    expect(svc['windowDamageBreakdown'](hits)).toEqual([{ spell_id: BOSS_HIT, damage: 600 }, { spell_id: ADD_HIT, damage: 200 }]);
  });

  it('keeps only the top 6 damage sources (boundary)', () => {
    const TOP_N = 6;
    const SOURCE_COUNT = 7; // one more than the cap
    const hits: Hit[] = Array.from({ length: SOURCE_COUNT }, (_, i) => [0, (i + 1) * 100, BOSS_HIT + i, BOSS_ACTOR]);
    expect(svc['windowDamageBreakdown'](hits)).toHaveLength(TOP_N);
  });

  it('folds distinct synthetic ids that normalize together into one summed row', () => {
    const SYNTH_A = -3, SYNTH_B = -7;  // distinct negatives, both normalize to the synthetic catch-all
    const DMG_A = 300, DMG_B = 200;
    const hits: Hit[] = [[0, DMG_A, SYNTH_A, null], [0, DMG_B, SYNTH_B, null]];
    expect(svc['windowDamageBreakdown'](hits)).toEqual([{ spell_id: WCL_SYNTHETIC_SOURCE_FALLBACK_ID, damage: DMG_A + DMG_B }]);
  });
});

describe('clusterDamageStats', () => {
  it('reports avg/stddev/min/max over the window damages, rounded', () => {
    const LOW = 700;
    const HIGH = 900;
    expect(svc['clusterDamageStats']([LOW, HIGH])).toEqual({ dmg_avg: 800, dmg_stddev: Math.round(Math.sqrt(20000)), dmg_min: LOW, dmg_max: HIGH });
  });
});

describe('clusterAbilityBreakdown', () => {
  const member = (abilities: { spell_id: number; damage: number }[], parseIndex = 0): ParseDefWindow => ({
    time_s: 10, window_length_s: 5, window_damage: 700, parse_index: parseIndex,
    defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, ref_game_id: BOSS_GAME_ID, ability_breakdown: abilities,
  });

  it('keeps an ability present in a majority of parses with avg/min/max', () => {
    const out = svc['clusterAbilityBreakdown']([
      member([{ spell_id: BOSS_HIT, damage: 400 }], 0), member([{ spell_id: BOSS_HIT, damage: 600 }], 1),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ spell_id: BOSS_HIT, avg_damage: 500, min_damage: 400, max_damage: 600 });
  });

  it('drops an ability below the parse-majority share (boundary)', () => {
    // 1 of 3 parses carries ADD_HIT -> 0.33 < 0.5 majority -> dropped.
    const out = svc['clusterAbilityBreakdown']([
      member([{ spell_id: BOSS_HIT, damage: 500 }], 0), member([{ spell_id: BOSS_HIT, damage: 500 }], 1),
      member([{ spell_id: ADD_HIT, damage: 500 }], 2),
    ]);
    expect(out.map(ability => ability.spell_id)).toEqual([BOSS_HIT]);
  });

  it('gates by DISTINCT parses, not window entries (1 of 4 does not surface)', () => {
    // 4 distinct parses share BOSS_HIT; only parse 0 carries ADD_HIT -> 0.25 < 0.5 majority -> dropped.
    const out = svc['clusterAbilityBreakdown']([
      member([{ spell_id: BOSS_HIT, damage: 500 }, { spell_id: ADD_HIT, damage: 100 }], 0),
      member([{ spell_id: BOSS_HIT, damage: 500 }], 1),
      member([{ spell_id: BOSS_HIT, damage: 500 }], 2),
      member([{ spell_id: BOSS_HIT, damage: 500 }], 3),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ spell_id: BOSS_HIT });
  });

  it('counts a parse contributing an ability across two of its windows once, summing its damage', () => {
    const FIRST_S = 400, SECOND_S = 300;  // one parse's two windows in the cluster
    const OTHER = 500;
    const EXPECTED_AVG = Math.round((FIRST_S + SECOND_S + OTHER) / 2);  // mean over 2 parses' summed damage
    const out = svc['clusterAbilityBreakdown']([
      member([{ spell_id: BOSS_HIT, damage: FIRST_S }], 0),
      member([{ spell_id: BOSS_HIT, damage: SECOND_S }], 0),
      member([{ spell_id: BOSS_HIT, damage: OTHER }], 1),
    ]);
    expect(out[0]).toMatchObject({ spell_id: BOSS_HIT, avg_damage: EXPECTED_AVG, min_damage: OTHER, max_damage: FIRST_S + SECOND_S });
  });
});

describe('clusterDefensiveWindows', () => {
  const window = (timeS: number, parseIndex: number): ParseDefWindow => ({
    time_s: timeS, window_length_s: 5, window_damage: 700, parse_index: parseIndex,
    defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, ref_game_id: BOSS_GAME_ID, ability_breakdown: [{ spell_id: BOSS_HIT, damage: 500 }],
  });

  it('emits a per-defensive cluster present in a majority of distinct parses, with majority ref enemy', () => {
    const out = svc['clusterDefensiveWindows']([window(10, 0), window(11, 1)], 2);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ time_s: 10.5, defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, dmg_avg: 700, ref_game_id: BOSS_GAME_ID });
    assert.exists(out[0]);
    expect(out[0].ability_breakdown[0]).toMatchObject({ spell_id: BOSS_HIT, avg_damage: 500 });
  });

  it('keeps a window in exactly half the parses, drops one just below (majority boundary)', () => {
    const five = [window(10, 0), window(11, 1), window(10, 2), window(12, 3), window(11, 4)];
    expect(svc['clusterDefensiveWindows'](five, 10)).toHaveLength(1);
    const four = [window(10, 0), window(11, 1), window(10, 2), window(12, 3)];
    expect(svc['clusterDefensiveWindows'](four, 10)).toHaveLength(0);
  });

  it('surfaces a consensus window regardless of how little damage was taken', () => {
    const low = [window(10, 0), window(11, 1)];
    expect(svc['clusterDefensiveWindows'](low, 2)).toHaveLength(1);
  });
});

describe('aggregateDefensiveBenchmarks', () => {
  it('builds per-defensive benchmarks with total vs used sample counts', () => {
    const FIRST_A_S = 10, FIRST_B_S = 20;
    const parseA: ParseDefensiveSummary[] = [{ name: 'Cloak of Shadows', cast_times_s: [FIRST_A_S], first_cast_s: FIRST_A_S, fight_duration_s: FIGHT_DUR_S, hold_windows: [], cast_pattern: 'on_cooldown' }];
    const parseB: ParseDefensiveSummary[] = [{ name: 'Cloak of Shadows', cast_times_s: [FIRST_B_S], first_cast_s: FIRST_B_S, fight_duration_s: FIGHT_DUR_S, hold_windows: [], cast_pattern: 'on_cooldown' }];
    const parseC: ParseDefensiveSummary[] = []; // this parse never used Cloak
    const TOTAL_PARSES = 3, USERS = 2;
    const out = svc['aggregateDefensiveBenchmarks']([parseA, parseB, parseC], [CLOAK]);
    assert.exists(out['Cloak of Shadows']);
    expect(out['Cloak of Shadows'].sample_count).toBe(TOTAL_PARSES);   // total
    assert.exists(out['Cloak of Shadows']);
    expect(out['Cloak of Shadows'].used_sample_count).toBe(USERS);     // users-only
  });
});

const reportShape = {
  enemies: [{ id: 9, name: 'Boss', gameID: 6666 }],
  abilities: [{ gameID: 700, name: 'Boss Hit', icon: 'hit.jpg' }, { gameID: CLOAK_OF_SHADOWS, name: 'Cloak of Shadows', icon: 'cloak' }],
};

const wclFake = {
  // getRankings returns the raw WCL envelope ({ rankings }); the transform unwraps it.
  getRankings: async () => ({ rankings: parseRankings(2) }),
  getReport: reportsByCode(reportShape),
  getAllEvents: async (_code: string, _fightId: number, dataType: string) => {
    if (dataType === 'Buffs') return [applyBuff(CLOAK_OF_SHADOWS, 30), removeBuff(CLOAK_OF_SHADOWS, 35)];
    if (dataType === 'Casts') return [cast(CLOAK_OF_SHADOWS, 30)];
    return [damageTaken(700, 32, 1000, { source: 9 })]; // DamageTaken
  },
  getAbilities: abilityLookup({ 700: { icon: 'hit', name: 'Boss Hit' }, [CLOAK_OF_SHADOWS]: { icon: 'cloak', name: 'Cloak of Shadows' } }),
};
const plansFake = planLoader(specPlan({ defensives: [CLOAK] }));

describe('DefensiveTransformService (live, in-browser)', () => {
  it('computes a clustered defensive bench from the top parses', async () => {
    TestBed.configureTestingModule({ providers: provideApiFakes({ wcl: wclFake, plans: plansFake }) });
    const bench = await TestBed.inject(DefensiveTransformService).getBench('SubtletyRogue', 1);
    expect(bench.ok).toBe(true);
    if (!bench.ok) return;
    expect(bench.value.sample_count).toBe(2);
    expect(bench.value.encounter_name).toBe('Boss');
    expect(bench.value.cd_spell_ids).toEqual({ 'Cloak of Shadows': CLOAK_OF_SHADOWS });
    expect(bench.value.defensives[0]).toMatchObject({ name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS });
    expect(bench.value.defensive_windows).toHaveLength(1);
    expect(bench.value.defensive_windows[0]).toMatchObject({ defensive_name: 'Cloak of Shadows', dmg_avg: 1000, ref_game_id: 6666 });
    expect(bench.value.ability_icons[700]).toEqual({ icon: 'hit', name: 'Boss Hit' });
  });

  it('finds the window of a defensive whose buff the log carries under another id of its name', async () => {
    const BLUR_PLAN = { name: 'Blur', spell_id: BLUR, cooldown: 60 };
    const blurWcl = {
      ...wclFake,
      getReport: reportsByCode({ ...reportShape, abilities: [...reportShape.abilities, { gameID: BLUR, name: 'Blur', icon: '' }, { gameID: BLUR_BUFF, name: 'Blur', icon: '' }] }),
      getAllEvents: async (_code: string, _fightId: number, dataType: string) => {
        if (dataType === 'Buffs') return [applyBuff(BLUR_BUFF, 30), removeBuff(BLUR_BUFF, 40)];
        if (dataType === 'Casts') return [cast(BLUR, 30)];
        return [damageTaken(700, 32, 1000, { source: 9 })];
      },
    };
    TestBed.configureTestingModule({ providers: provideApiFakes({ wcl: blurWcl, plans: planLoader(specPlan({ defensives: [BLUR_PLAN] })) }) });
    const bench = await TestBed.inject(DefensiveTransformService).getBench('HavocDemonHunter', 1);
    assert(bench.ok);
    expect(bench.value.defensive_windows).toHaveLength(1);
    expect(bench.value.defensive_windows[0]).toMatchObject({ defensive_name: 'Blur', dmg_avg: 1000 });
  });

  it('reports missing when the spec\'s plan has no defensives', async () => {
    TestBed.configureTestingModule({
      providers: provideApiFakes({ wcl: wclFake, plans: planLoader(specPlan()) }),
    });
    const bench = await TestBed.inject(DefensiveTransformService).getBench('SubtletyRogue', 1);
    expect(bench.ok).toBe(false);
    if (!bench.ok) expect(bench.error.kind).toBe('missing');
  });
});
