import { assert, describe, it, expect } from 'vitest';
import { BurstWindow, PlayerBurstWindow, PlayerDefensive } from '../analysis/analysis.models';
import { DefensiveFeatureService } from './defensive-feature-service';
import { damageTaken } from '../../../../../testing/builders/events';
import { CLOAK_OF_SHADOWS } from '../../../../../testing/spell-ids';
import { BOSS_HIT_SPELL_ID, benchWith, timed } from './defensive-harness';
import { benchSources } from '../../../../../testing/builders/bench-sources';
import { ComparisonWindow } from '../analysis/window-comparison.models';
import { TestBed } from '@angular/core/testing';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { DEFENSIVE_DATA_SOURCE } from './defensive-data-source';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: DEFENSIVE_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(DefensiveFeatureService);
TestBed.resetTestingModule();

function first<T>(items: readonly T[]): T {
  const [head] = items;
  assert.exists(head);
  return head;
}

describe('computePlayerDefensiveWindows', () => {
  const WIN_START_S = 10;
  const WIN_LEN_S = 5;
  const top: BurstWindow[] = [
    { time_s: WIN_START_S, window_length_s: WIN_LEN_S, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, members: [], common_cds: [], ability_breakdown: [] },
  ];

  it('sums the damage the player took in the window, with no cast count to report', () => {
    const AMOUNT = 400, ABSORBED = 150;
    const SECOND_SOURCE_ID = BOSS_HIT_SPELL_ID + 1, SECOND_HIT = 100;
    const out = svc['computePlayerDefensiveWindows'](top, timed([
      damageTaken(BOSS_HIT_SPELL_ID, WIN_START_S + 2, AMOUNT, { absorbed: ABSORBED }),
      damageTaken(SECOND_SOURCE_ID, WIN_START_S + 4, SECOND_HIT),
    ], 0));
    expect(first(out).window_damage).toBe(AMOUNT + ABSORBED + SECOND_HIT);
    const breakdown = first(out).ability_breakdown;
    assert.exists(breakdown);
    expect(first(breakdown)).toEqual({ spell_id: BOSS_HIT_SPELL_ID, damage: AMOUNT + ABSORBED });
  });

  it('lists the six heaviest damage sources and drops the rest', () => {
    const SOURCE_COUNT = 8;
    const KEPT_SOURCES = 6;
    const PER_SOURCE_DAMAGE = 100;
    const hits = Array.from({ length: SOURCE_COUNT }, (_, i) =>
      damageTaken(BOSS_HIT_SPELL_ID + i, WIN_START_S + 1, (i + 1) * PER_SOURCE_DAMAGE));
    const breakdown = first(svc['computePlayerDefensiveWindows'](top, timed(hits, 0))).ability_breakdown;
    assert.exists(breakdown);
    expect(breakdown).toHaveLength(KEPT_SOURCES);
    expect(first(breakdown).damage).toBe(SOURCE_COUNT * PER_SOURCE_DAMAGE);
  });
});

describe('defensiveMapAnchor', () => {
  it('carries seek time and the dominant enemy game id', () => {
    const window = { time_s: 30, window_length_s: 5, defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, ref_game_id: 6666 } as BurstWindow;
    expect(svc['defensiveMapAnchor'](window)).toEqual({ timeS: 30, refGameId: 6666, windowLengthS: 5 });
  });

  it('falls back to a null ref when absent', () => {
    const window = { time_s: 5, window_length_s: 5 } as BurstWindow;
    expect(svc['defensiveMapAnchor'](window)).toEqual({ timeS: 5, refGameId: null, windowLengthS: 5 });
  });
});

describe('defensiveClipAnchor', () => {
  it('carries the window span and a stable indexed key', () => {
    const window = { time_s: 30, window_length_s: 5 } as BurstWindow;
    expect(svc['defensiveClipAnchor'](window, 1)).toEqual({ timeS: 30, windowLengthS: 5, key: 'defensive-1' });
  });
});

describe('defensiveFindingClipAnchor', () => {
  it('is a point anchor at the cast time, keyed by the exact second', () => {
    expect(svc.defensiveFindingClipAnchor(30.2)).toEqual({ timeS: 30.2, windowLengthS: 0, key: 'defensive-find-30.2' });
  });

  it('keeps two findings within the same second on distinct clip keys', () => {
    expect(svc.defensiveFindingClipAnchor(30.2).key).not.toBe(svc.defensiveFindingClipAnchor(30.6).key);
  });
});

describe('computePlayerDefensiveWindows judged figure', () => {
  it('takes the window damage from the measure ingest bakes, its last instant included', () => {
    const top: BurstWindow[] = [{ time_s: 10, window_length_s: 5, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, members: [], common_cds: [], ability_breakdown: [] }];
    const AT_END = 300;
    expect(first(svc['computePlayerDefensiveWindows'](top, timed([damageTaken(BOSS_HIT_SPELL_ID, 15, AT_END)], 0))).window_damage).toBe(AT_END);
  });
});

describe('buildDefensiveWindows', () => {
  // Composition only: the coverage rule and the death fact are specced on DefensiveJudgeService.
  const TOP_N = 10;
  const window: BurstWindow = {
    time_s: 30, window_length_s: 5, dmg_avg: 1000, dmg_min: 1000, dmg_max: 1000, dmg_stddev: 0,
    defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, ref_game_id: 6666, common_cds: ['Cloak of Shadows'],
    members: Array.from({ length: TOP_N }, (_unused, parse) => ({ parse, time_s: 30, window_length_s: 5, damage: 1000 })),
    ability_breakdown: [{ spell_id: BOSS_HIT_SPELL_ID, avg_damage: 600, min_damage: 400, max_damage: 800 }],
  };
  const abilities = {
    [CLOAK_OF_SHADOWS]: { icon: 'cloak', name: 'Cloak of Shadows' },
    [BOSS_HIT_SPELL_ID]: { icon: 'hit', name: 'Boss Hit' },
  };
  const FIGHT_DURATION_S = 300;
  const WHOLE = pullModel({ fightDurationS: FIGHT_DURATION_S });
  const build = (over: Partial<Parameters<DefensiveFeatureService['buildDefensiveWindows']>[0]>) => svc['buildDefensiveWindows']({
    topWindows: [window], playerWindows: [], playerDefensives: [], model: WHOLE, abilities, topLogs: TOP_N, ...over,
  });

  it('pairs each window with player damage taken at the same index and reads coverage from the player\'s uses', () => {
    const player: PlayerBurstWindow[] = [{ window_damage: 1150, ability_breakdown: [{ spell_id: BOSS_HIT_SPELL_ID, damage: 700 }] }];
    const playerDef: PlayerDefensive[] = [{ name: 'Cloak of Shadows', uses: 1, windows: [{ start_s: 30, end_s: 35 }] }];
    const { windows, anchors, clipAnchors } = build({ playerWindows: player, playerDefensives: playerDef });
    const defensiveWindow = first(windows);
    expect(defensiveWindow.overview.playerPct).toBe(1150);
    expect(defensiveWindow).toMatchObject({ status: 'neutral', family: 'defensive.window', note: '' });
    expect(defensiveWindow.message).toBe('You had Cloak of Shadows up. 10 of 10 top raiders had it up here.');
    expect(defensiveWindow.spells).toEqual([{ id: CLOAK_OF_SHADOWS, icon: 'cloak', name: 'Cloak of Shadows' }]);
    expect(first(defensiveWindow.detailRows)).toMatchObject({ spellId: BOSS_HIT_SPELL_ID, label: 'Boss Hit', icon: 'hit', playerPct: 700, topAvg: 600 });
    expect(anchors[0]).toEqual({ timeS: 30, refGameId: 6666, windowLengthS: 5 });
    expect(clipAnchors[0]).toEqual({ timeS: 30, windowLengthS: 5, key: 'defensive-0' });
  });

  it('names the defensive as a plain label when the bench window has no spell id', () => {
    const { windows } = build({ topWindows: [{ ...window, spell_id: undefined }] });
    expect(first(windows).spells).toEqual([]);
    expect(first(windows).labels).toEqual(['Cloak of Shadows']);
  });

  it('flags an uncovered window amber when the damage is above the top logs\' median, for a non-tank only', () => {
    const player: PlayerBurstWindow[] = [{ window_damage: 1500, ability_breakdown: [] }];
    expect(first(build({ playerWindows: player }).windows).status).toBe('amber');
    expect(first(build({ playerWindows: player, model: pullModel({ fightDurationS: FIGHT_DURATION_S, role: 'tank' }) }).windows).status).toBe('blue');
  });

  it('mutes a window the player was dead through as dead', () => {
    const deadThroughIt = pullModel({ fightDurationS: FIGHT_DURATION_S, deadSpans: [[20, FIGHT_DURATION_S]] });
    const { windows, folded } = build({ playerWindows: [{ window_damage: 0, ability_breakdown: [] }], model: deadThroughIt });
    expect(first(windows)).toMatchObject({ status: 'muted', unjudged: 'dead', note: '' });
    expect(folded.dead).toBe(1);
  });

  it('states a death inside the window as a red fact rather than muting it, and folds nothing for it', () => {
    const DIED_S = 32;
    const diedInIt = pullModel({ fightDurationS: FIGHT_DURATION_S, deadSpans: [[DIED_S, FIGHT_DURATION_S]] });
    const { windows, folded } = build({ playerWindows: [{ window_damage: 2000, ability_breakdown: [] }], model: diedInIt });
    expect(first(windows)).toMatchObject({ status: 'red', unjudged: null, family: 'defensive.dead_in_window', message: 'You died at 00:32 in this window.' });
    expect(folded.dead).toBe(0);
  });
});

describe('windowsEmpty', () => {
  const window = (members: number): BurstWindow => ({
    time_s: 30, window_length_s: 5, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, common_cds: [], ability_breakdown: [],
    members: Array.from({ length: members }, (_unused, parse) => ({ parse, time_s: 30, window_length_s: 5, damage: 0 })),
  });
  const shown = (status: string) => ({ status } as ComparisonWindow);

  it('says the top logs share no window when the bench has none', () => {
    expect(svc['windowsEmpty'](benchWith({ sources: benchSources(10) }), [])).toBe('No defensive window to compare. The defensives of the 10 top logs do not line up in time.');
  });

  it('counts the windows checked, leaving out a muted one', () => {
    const bench = benchWith({ sources: benchSources(10), defensive_windows: [window(10), window(10)] });
    expect(svc['windowsEmpty'](bench, [shown('blue'), shown('muted')])).toBe('Nothing flagged. 1 of 2 windows checked against the 10 top logs.');
  });

  it('says nothing once a window is flagged', () => {
    const bench = benchWith({ sources: benchSources(10), defensive_windows: [window(10)] });
    expect(svc['windowsEmpty'](bench, [shown('amber')])).toBe('');
  });
});
