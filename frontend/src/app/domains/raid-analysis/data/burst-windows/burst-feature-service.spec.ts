import { assert, describe, it, expect } from 'vitest';
import { BurstWindow, PlayerBurstWindow } from '../analysis/analysis.models';
import { Result, Results } from '../../../shared/util-http/result';
import { BURST_DATA_SOURCE, BurstBench } from './burst-data-source';
import { featureService } from '../../../../../testing/service-harness';
import { BurstFeatureService } from './burst-feature-service';
import { wclReport } from '../../../../../testing/builders/wcl-fixtures';
import { SHADOW_BLADES, SHADOW_BLADES_DAMAGE, THE_HUNT, THE_HUNT_LANDING } from '../../../../../testing/spell-ids';
import { cast, damage } from '../../../../../testing/builders/events';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { TestBed } from '@angular/core/testing';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { benchSources } from '../../../../../testing/builders/bench-sources';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

const wclProjections = TestBed.inject(WclProjectionsService);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: BURST_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(BurstFeatureService);
TestBed.resetTestingModule();

/** Fixture events build against a fight-start of 0, so stamping is a pass-through to seconds. */
const timed: WclProjectionsService['withRelativeS'] = (events, startMs) => wclProjections.withRelativeS(events, startMs);

function first<T>(items: readonly T[]): T {
  const [head] = items;
  assert.exists(head);
  return head;
}

function okValue<T>(result: Result<T>): T {
  if (!result.ok) assert.fail(`expected an ok result, got a ${result.error.kind} error`);
  return result.value;
}

describe('splitCommonCds', () => {
  it('routes known names to spell ids and unknown names to labels', () => {
    expect(svc['splitCommonCds'](['Shadow Blades', 'Mystery'], { 'Shadow Blades': SHADOW_BLADES }))
      .toEqual({ spellIds: [SHADOW_BLADES], labels: ['Mystery'] });
  });

  it('is empty for no cds', () => {
    expect(svc['splitCommonCds']([], {})).toEqual({ spellIds: [], labels: [] });
  });
});

describe('burstMapAnchor', () => {
  it('carries the window seek time', () => {
    const window = { time_s: 12, window_length_s: 18, common_cds: ['Shadow Blades', 'Mystery'] } as BurstWindow;
    expect(svc['burstMapAnchor'](window)).toEqual({ timeS: 12, windowLengthS: 18 });
  });
});

describe('burstClipAnchor', () => {
  it('carries the window span and a stable indexed key', () => {
    const window = { time_s: 12, window_length_s: 18 } as BurstWindow;
    expect(svc['burstClipAnchor'](window, 2)).toEqual({ timeS: 12, windowLengthS: 18, key: 'burst-2' });
  });
});

describe('buildBurstView', () => {
  const TOP_DAMAGE = 1000;
  /** Five top logs that each dealt 1000: with no spread, the 5s floor at 10 damage a second puts the edge at 950. */
  const RATE_PER_S = 10;
  const EDGE = TOP_DAMAGE - VERDICT_CHOICES.effectFloors.timingS * RATE_PER_S;
  const members = Array.from({ length: VERDICT_CHOICES.minReferenceN }, (_unused, parse) =>
    ({ parse, time_s: 10, window_length_s: 20, damage: TOP_DAMAGE }));
  const window: BurstWindow = {
    time_s: 10, window_length_s: 20, dmg_avg: 1000, dmg_min: 800, dmg_max: 1200, dmg_stddev: 100,
    members, common_cds: ['Shadow Blades'],
    ability_breakdown: [
      { spell_id: SHADOW_BLADES_DAMAGE, avg_damage: 600, min_damage: 400, max_damage: 800, avg_casts: 2 },
    ],
  };
  const abilities = { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' }, [SHADOW_BLADES_DAMAGE]: { icon: 'evis', name: 'Eviscerate' } };
  const bench = (windows: BurstWindow[]): BurstBench => ({
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Test', metric: 'dps', sample_count: 5, sources: benchSources(5),
    cd_spell_ids: { 'Shadow Blades': SHADOW_BLADES }, ability_icons: abilities, windows,
  });
  const dealt = (windowDamage: number): { windows: PlayerBurstWindow[]; ratePerS: number } =>
    ({ windows: [{ window_damage: windowDamage, ability_breakdown: [{ spell_id: SHADOW_BLADES_DAMAGE, damage: 550, casts: 2 }] }], ratePerS: RATE_PER_S });

  it('pairs each window with the player damage at the same index', () => {
    const view = svc['buildBurstView'](bench([window]), dealt(950), pullModel());
    expect(view.windows).toHaveLength(1);
    const burstWindow = first(view.windows);
    expect(burstWindow.overview.playerPct).toBe(950);
    expect(burstWindow.spells).toEqual([{ id: SHADOW_BLADES, icon: 'sb', name: 'Shadow Blades' }]);
    expect(burstWindow.detailRows[0]).toMatchObject({ spellId: SHADOW_BLADES_DAMAGE, label: 'Eviscerate', icon: 'evis', playerPct: 550, topAvg: 600 });
    expect(view.anchors[0]).toEqual({ timeS: 10, windowLengthS: 20 });
    expect(view.clipAnchors[0]).toEqual({ timeS: 10, windowLengthS: 20, key: 'burst-0' });
  });

  it('flags amber a window one point under the edge, with the burst family and the top log count', () => {
    const burstWindow = first(svc['buildBurstView'](bench([window]), dealt(EDGE - 1), pullModel()).windows);

    expect(burstWindow).toMatchObject({ family: 'burst.window', status: 'amber', statusIcon: 'warning_amber', benchOnly: false });
    expect(burstWindow.message).toBe('You dealt 949 here, less than the 5 top logs that had this window. Aim for 950 or more.');
  });

  it('compares without color a window exactly at the edge', () => {
    expect(first(svc['buildBurstView'](bench([window]), dealt(EDGE), pullModel()).windows))
      .toMatchObject({ family: 'burst.window', status: 'neutral', statusIcon: 'compare_arrows' });
  });

  it('says nothing is flagged, with counts, when no window is amber', () => {
    const fewTopLogs = { ...window, members: members.slice(1) };
    const atEdge = { windows: [{ window_damage: EDGE }, { window_damage: EDGE }], ratePerS: RATE_PER_S };
    const view = svc['buildBurstView'](bench([window, fewTopLogs]), atEdge, pullModel());

    expect(view.empty).toBe('Nothing flagged. 1 of 2 windows checked against the 5 top logs.');
  });

  it('gives no empty state when a window is amber', () => {
    expect(svc['buildBurstView'](bench([window]), dealt(EDGE - 1), pullModel()).empty).toBe('');
  });

  it('says why there is nothing to compare when the top logs share no window', () => {
    expect(svc['buildBurstView'](bench([]), null, null).empty)
      .toBe('No burst window to compare. The biggest bursts of the 5 top logs do not line up in time.');
  });

  it('flags a detail row passive when the bench ability is passive', () => {
    const passiveWindow: BurstWindow = {
      ...window,
      ability_breakdown: [
        { spell_id: SHADOW_BLADES_DAMAGE, avg_damage: 600, min_damage: 400, max_damage: 800, avg_casts: 0, is_passive: true },
      ],
    };
    const view = svc['buildBurstView'](bench([passiveWindow]), null, null);
    expect(first(first(view.windows).detailRows).passive).toBe(true);
    // The default (non-passive) bench ability stays passive=false.
    const benchWindow = first(svc['buildBurstView'](bench([window]), null, null).windows);
    expect(first(benchWindow.detailRows).passive).toBe(false);
  });

  it('marks a bench-only window as a neutral comparison with no player overlay, naming its top logs', () => {
    const view = svc['buildBurstView'](bench([window]), null, null);
    const burstWindow = first(view.windows);
    expect(burstWindow).toMatchObject({ status: 'neutral', statusIcon: 'insights', benchOnly: true, message: '5 top logs had this window.' });
    expect(burstWindow.overview.playerPct).toBeNull();
    expect(view.judged).toBeNull();
    expect(view.empty).toBe('');
  });

  it('mutes a window the player was dead for instead of reading the death as zero damage, and names the death in the caption', () => {
    // Dead from 15s, inside the 10..30 window, and back at 40s.
    const DIED_S = 15;
    const BACK_S = 40;
    const deadInIt = pullModel({ deadSpans: [[DIED_S, BACK_S]] });
    const view = svc['buildBurstView'](bench([window]), dealt(0), deadInIt);
    expect(first(view.windows)).toMatchObject({ status: 'muted', unjudged: 'dead', message: '' });
    expect(view.judged?.folded.dead).toBe(1);
    expect(view.judged?.deadSpans).toEqual([{ fromS: DIED_S, toS: BACK_S }]);
  });
});

describe('findPlayerBurstWindows', () => {
  const window: BurstWindow = {
    time_s: 10, window_length_s: 20, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, members: [], common_cds: [], ability_breakdown: [],
  };
  const HIT_S = 12, CAST_S = 11, HIT_DAMAGE = 400, CAST_COUNT = 1, FIGHT_S = 300;

  it('judges the damage ingest measures, leaving out an event that is not a hit', () => {
    const out = svc['findPlayerBurstWindows'](
      [window],
      timed([damage(SHADOW_BLADES_DAMAGE, HIT_S, HIT_DAMAGE), { ...damage(SHADOW_BLADES_DAMAGE, HIT_S, HIT_DAMAGE), type: 'absorbed' }], 0),
      [], new Map(), FIGHT_S,
    );
    expect(first(out).window_damage).toBe(HIT_DAMAGE);
  });

  it('bridges the damage id to the cast id through the report ability names', () => {
    const out = svc['findPlayerBurstWindows'](
      [window],
      timed([damage(SHADOW_BLADES_DAMAGE, HIT_S, HIT_DAMAGE)], 0),
      timed([cast(SHADOW_BLADES, CAST_S)], 0),
      // The two ids share one name, which is the only bridge between a cast and the damage it deals.
      new Map([[SHADOW_BLADES_DAMAGE, 'Shadow Blades'], [SHADOW_BLADES, 'Shadow Blades']]),
      FIGHT_S,
    );
    const breakdown = first(out).ability_breakdown;
    assert.exists(breakdown);
    expect(first(breakdown)).toMatchObject({ spell_id: SHADOW_BLADES_DAMAGE, casts: CAST_COUNT });
  });

  it('stands an unnamed ability up under its own id, so its casts still count', () => {
    const out = svc['findPlayerBurstWindows'](
      [window],
      timed([damage(SHADOW_BLADES, HIT_S, HIT_DAMAGE)], 0),
      timed([cast(SHADOW_BLADES, CAST_S)], 0),
      new Map(),
      FIGHT_S,
    );
    const breakdown = first(out).ability_breakdown;
    assert.exists(breakdown);
    expect(first(breakdown)).toMatchObject({ spell_id: SHADOW_BLADES, casts: CAST_COUNT });
  });
});

const BENCH_WINDOW_START_S = 10;
const BENCH_WINDOW_LENGTH_S = 20;
const PLAYER_WINDOW_DAMAGE = 950;
const PLAYER_CAST_S = BENCH_WINDOW_START_S + 1;
const PLAYER_HIT_S = BENCH_WINDOW_START_S + 2;

const wclFake = {
  getReport: async () => wclReport({
    actors: [], abilities: [{ gameID: SHADOW_BLADES_DAMAGE, name: 'Eviscerate', icon: 'inv' }],
  }),
  getAllEvents: async (_code: string, _fightId: number, dataType: string) =>
    dataType === 'Casts'
      ? [cast(SHADOW_BLADES, PLAYER_CAST_S)]
      : [damage(SHADOW_BLADES_DAMAGE, PLAYER_HIT_S, PLAYER_WINDOW_DAMAGE)],
};

function withBench(bench: Result<BurstBench>, wcl: unknown = wclFake): BurstFeatureService {
  return featureService(BURST_DATA_SOURCE, BurstFeatureService, bench, wcl);
}

const benchFixture: BurstBench = {
  spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Test', metric: 'dps', sample_count: 5, sources: benchSources(5),
  cd_spell_ids: { 'Shadow Blades': SHADOW_BLADES },
  ability_icons: { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' }, [SHADOW_BLADES_DAMAGE]: { icon: 'evis', name: 'Eviscerate' } },
  windows: [{
    time_s: BENCH_WINDOW_START_S, window_length_s: BENCH_WINDOW_LENGTH_S,
    dmg_avg: 1000, dmg_min: 800, dmg_max: 1200, dmg_stddev: 100,
    members: [], common_cds: ['Shadow Blades'],
    ability_breakdown: [{ spell_id: SHADOW_BLADES_DAMAGE, avg_damage: 600, min_damage: 400, max_damage: 800, avg_casts: 2 }],
  }],
};

describe('BurstFeatureService', () => {
  const BENCH_ANCHOR = { timeS: BENCH_WINDOW_START_S, windowLengthS: BENCH_WINDOW_LENGTH_S };

  const benchOnlyView = async () => okValue(await withBench(Results.ok(benchFixture)).loadBenchView('SubtletyRogue', 1));
  const playerView = async () => okValue(await withBench(Results.ok(benchFixture)).loadPlayerView('SubtletyRogue', 1, 'rep', 1, 10));

  it('names who the bench windows were compared with', async () => {
    expect((await benchOnlyView()).bench?.count).toBe(benchFixture.sample_count);
  });

  it('names who the player\'s windows were compared with', async () => {
    expect((await playerView()).bench?.count).toBe(benchFixture.sample_count);
  });

  it('compares nothing for a healer, reads neither the bench nor the log, and says why', async () => {
    const HEALER_SPEC = 'HolyPaladin';
    const untouched = withBench(Results.missing('Not yet ingested.'), {});

    const view = okValue(await untouched.loadPlayerView(HEALER_SPEC, 1, 'rep', 1, 10));

    expect(view.windows).toEqual([]);
    expect(untouched.notComparedReason(HEALER_SPEC)).toBe(
      'Top raiders on your spec are ranked on healing, so there are no burst windows to compare your damage with.');
    expect(okValue(await untouched.loadBenchView(HEALER_SPEC, 1)).windows).toEqual([]);
  });

  it('compares a damage spec\'s windows, giving no reason', () => {
    expect(withBench(Results.ok(benchFixture)).notComparedReason('SubtletyRogue')).toBeNull();
  });

  it('propagates the data-source error when the bench read fails', async () => {
    const result = await withBench(Results.missing('Not yet ingested.')).loadBenchView('SubtletyRogue', 1);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });

  it('returns an ok bench view when the bench file exists', async () => {
    const result = await withBench(Results.ok(benchFixture)).loadBenchView('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
  });

  it('shows one window per bench window with no player damage overlaid', async () => {
    const view = await benchOnlyView();
    expect(view.windows).toHaveLength(1);
    expect(first(view.windows).overview.playerPct).toBeNull();
  });

  it('marks a bench-only window as a comparison with no color', async () => {
    expect(first((await benchOnlyView()).windows)).toMatchObject({ status: 'neutral', benchOnly: true });
  });

  it('anchors the bench view on each window start and length', async () => {
    expect((await benchOnlyView()).anchors[0]).toEqual(BENCH_ANCHOR);
  });

  it('overlays the player damage read from the log on the bench window', async () => {
    const view = await playerView();
    expect(view.windows).toHaveLength(1);
    expect(first(view.windows).overview.playerPct).toBe(PLAYER_WINDOW_DAMAGE);
  });

  it('compares a window from a bench without per-log damage, never coloring it', async () => {
    expect(first((await playerView()).windows)).toMatchObject({ status: 'neutral', family: 'burst.window' });
  });

  it('reads a bench an older ingest wrote, with no members on its windows, as comparisons', async () => {
    const { members: _dropped, ...unbaked } = first(benchFixture.windows);
    const older = { ...benchFixture, windows: [unbaked] } as unknown as BurstBench;
    const view = okValue(await withBench(Results.ok(older)).loadPlayerView('SubtletyRogue', 1, 'rep', 1, 10));

    expect(first(view.windows).status).toBe('neutral');
    expect(first(view.windows).message).toContain('No top log carries its own damage');
  });

  it('labels a player detail row with the bench ability name', async () => {
    expect(first(first((await playerView()).windows).detailRows).label).toBe('Eviscerate');
  });

  it('counts a press the player\'s log casts under two ids once, by the press folds the bench carries', async () => {
    const LANDING_S = PLAYER_CAST_S + 0.3;
    const THE_HUNT_S = 30;
    const huntBench: BurstBench = {
      ...benchFixture,
      press_folds: [{ name: 'The Hunt', spell_id: THE_HUNT, window_s: THE_HUNT_S }],
      windows: benchFixture.windows.map(window => ({ ...window, ability_breakdown: [{ spell_id: THE_HUNT_LANDING, avg_damage: 600, min_damage: 400, max_damage: 800, avg_casts: 1 }] })),
    };
    const wcl = {
      getReport: async () => wclReport({
        actors: [], abilities: [{ gameID: THE_HUNT, name: 'The Hunt', icon: '' }, { gameID: THE_HUNT_LANDING, name: 'The Hunt', icon: '' }],
      }),
      getAllEvents: async (_code: string, _fightId: number, dataType: string) => {
        if (dataType === 'Casts') return [cast(THE_HUNT, PLAYER_CAST_S), cast(THE_HUNT_LANDING, LANDING_S)];
        return dataType === 'DamageDone' ? [damage(THE_HUNT_LANDING, PLAYER_HIT_S, PLAYER_WINDOW_DAMAGE)] : [];
      },
    };
    const view = okValue(await withBench(Results.ok(huntBench), wcl).loadPlayerView('HavocDemonHunter', 1, 'rep', 1, 10));
    expect(first(first(view.windows).detailRows).playerCasts).toBe(1);
  });

  it('reads the casts and damage with resources, the form the rotation card reads, so one fetch serves both', async () => {
    const reads: { dataType: string; includeResources: boolean }[] = [];
    const recording = {
      ...wclFake,
      getAllEvents: async (code: string, fightId: number, dataType: string, _s: number, _e: number, _p: number, includeResources = false) => {
        reads.push({ dataType, includeResources });
        return wclFake.getAllEvents(code, fightId, dataType);
      },
    };
    await withBench(Results.ok(benchFixture), recording).loadPlayerView('SubtletyRogue', 1, 'rep', 1, 10);
    expect(reads).toContainEqual({ dataType: 'Casts', includeResources: true });
    expect(reads).toContainEqual({ dataType: 'DamageDone', includeResources: true });
  });

  it('anchors the player view on each window start and length', async () => {
    expect((await playerView()).anchors[0]).toEqual(BENCH_ANCHOR);
  });

  it('wires the shared pull context with the bench-only view and the burst repro id', async () => {
    const MISSING_FIGHT_ID = 999;
    const FAILING_CODE = 'boom';
    // TestBed configures once per test, so one service with one refused report code covers both branches.
    const service = withBench(Results.ok(benchFixture), {
      ...wclFake,
      getReport: async (code: string) => { if (code === FAILING_CODE) throw new Error('WCL down'); return wclFake.getReport(); },
    });

    const onMissingFight = await service.loadPlayerView('SubtletyRogue', 1, 'rep', MISSING_FIGHT_ID, 10);
    expect(onMissingFight).toEqual(await service.loadBenchView('SubtletyRogue', 1));

    const onFailure = await service.loadPlayerView('SubtletyRogue', 1, FAILING_CODE, 1, 10);
    expect(onFailure.ok).toBe(false);
    if (!onFailure.ok) expect(onFailure.error).toMatchObject({ kind: 'permanent', id: 'burst.player-view' });
  });
});
