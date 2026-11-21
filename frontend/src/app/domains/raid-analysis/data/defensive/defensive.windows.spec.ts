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
import { DefensiveJudgeService } from './defensive-judge-service';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: DEFENSIVE_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(DefensiveFeatureService);
TestBed.resetTestingModule();
const judge = TestBed.inject(DefensiveJudgeService);
const FIGHT_S = 300;

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
    const hits = timed([
      damageTaken(BOSS_HIT_SPELL_ID, WIN_START_S + 2, AMOUNT, { absorbed: ABSORBED }),
      damageTaken(SECOND_SOURCE_ID, WIN_START_S + 4, SECOND_HIT),
    ], 0);
    const out = svc['computePlayerDefensiveWindows'](top, hits, judge.takenSeries(hits, FIGHT_S));
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
    const timedHits = timed(hits, 0);
    const breakdown = first(svc['computePlayerDefensiveWindows'](top, timedHits, judge.takenSeries(timedHits, FIGHT_S))).ability_breakdown;
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
    const hits = timed([damageTaken(BOSS_HIT_SPELL_ID, 15, AT_END)], 0);
    expect(first(svc['computePlayerDefensiveWindows'](top, hits, judge.takenSeries(hits, FIGHT_S))).window_damage).toBe(AT_END);
  });
});

describe('buildDefensiveWindows', () => {
  // Composition only: the coverage rule and the death fact are specced on DefensiveJudgeService.
  const TOP_N = 10;
  const TOP_DAMAGE = 1000;
  const window: BurstWindow = {
    time_s: 30, window_length_s: 5, dmg_avg: 1000, dmg_min: 1000, dmg_max: 1000, dmg_stddev: 0,
    defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, ref_game_id: 6666, common_cds: ['Cloak of Shadows'],
    members: [], ability_breakdown: [{ spell_id: BOSS_HIT_SPELL_ID, avg_damage: 600, min_damage: 400, max_damage: 800 }],
  };
  const abilities = {
    [CLOAK_OF_SHADOWS]: { icon: 'cloak', name: 'Cloak of Shadows' },
    [BOSS_HIT_SPELL_ID]: { icon: 'hit', name: 'Boss Hit' },
  };
  /** All of a log's window damage lands at its start. */
  const takenOf = (damage: number): number[] => Array.from({ length: FIGHT_S }, (_unused, second) => second === window.time_s ? damage : 0);
  /** Every top log had Evasion up at the window and took the same damage there. */
  const top = {
    sources: benchSources(TOP_N),
    per_parse: Array.from({ length: TOP_N }, () => ({ def_casts_s: {}, def_up_s: { Evasion: [[29, 36] as [number, number]] }, taken_per_s: takenOf(TOP_DAMAGE), dead_s: [] })),
  };
  const WHOLE = pullModel({ fightDurationS: FIGHT_S });
  const build = (over: Partial<Parameters<DefensiveFeatureService['buildDefensiveWindows']>[0]>) => svc['buildDefensiveWindows']({
    topWindows: [window], playerWindows: [], playerDefensives: [], model: WHOLE, abilities, takenPerS: takenOf(0), top, ...over,
  });

  it('reads coverage from any of the player\'s defensives, and the headline from the damage taken against every top log\'s', () => {
    const PLAYER_DAMAGE = 1150;
    const player: PlayerBurstWindow[] = [{ window_damage: PLAYER_DAMAGE, ability_breakdown: [{ spell_id: BOSS_HIT_SPELL_ID, damage: 700 }] }];
    const playerDef: PlayerDefensive[] = [{ name: 'Cloak of Shadows', cooldown: 120, uses: 1, windows: [{ start_s: 30, end_s: 35 }] }];
    const { windows, anchors, clipAnchors } = build({ playerWindows: player, playerDefensives: playerDef, takenPerS: takenOf(PLAYER_DAMAGE) });
    const defensiveWindow = first(windows);
    expect(defensiveWindow.overview).toMatchObject({ playerPct: PLAYER_DAMAGE, topAvg: TOP_DAMAGE, topMin: TOP_DAMAGE, topMax: TOP_DAMAGE });
    expect(defensiveWindow).toMatchObject({ status: 'neutral', family: 'defensive.window', note: '' });
    expect(defensiveWindow.message).toBe('You had Cloak of Shadows up at 00:30. 10 of 10 top raiders had one up.');
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
    const above = takenOf(TOP_DAMAGE + 1);
    expect(first(build({ takenPerS: above }).windows).status).toBe('amber');
    expect(first(build({ takenPerS: above, model: pullModel({ fightDurationS: FIGHT_S, role: 'tank' }) }).windows).status).toBe('blue');
  });

  it('keeps every window a comparison on a bench baked before coverage', () => {
    const { windows } = build({ takenPerS: takenOf(TOP_DAMAGE + 1), top: { sources: benchSources(TOP_N), per_parse: [] } });
    expect(first(windows)).toMatchObject({ status: 'neutral', message: 'No top log carries its defensives for this window, so it is not judged.' });
    expect(first(windows).overview.topAvg).toBe(window.dmg_avg);
  });

  it('mutes a window the player was dead through as dead', () => {
    const deadThroughIt = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[20, FIGHT_S]] });
    const { windows, folded } = build({ playerWindows: [{ window_damage: 0, ability_breakdown: [] }], model: deadThroughIt });
    expect(first(windows)).toMatchObject({ status: 'muted', unjudged: 'dead', note: '' });
    expect(folded.dead).toBe(1);
  });

  it('states a death inside the window as a red fact rather than muting it, and folds nothing for it', () => {
    const DIED_S = 32;
    const diedInIt = pullModel({ fightDurationS: FIGHT_S, deadSpans: [[DIED_S, FIGHT_S]] });
    const { windows, folded } = build({ playerWindows: [{ window_damage: 2000, ability_breakdown: [] }], model: diedInIt });
    expect(first(windows)).toMatchObject({ status: 'red', unjudged: null, family: 'defensive.dead_in_window', message: 'You died at 00:32 in this window.' });
    expect(folded.dead).toBe(0);
  });
});

describe('windowsEmpty', () => {
  const window: BurstWindow = { time_s: 30, window_length_s: 5, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, common_cds: [], ability_breakdown: [], members: [] };
  const covered = { def_casts_s: {}, def_up_s: { Evasion: [[29, 36] as [number, number]] }, taken_per_s: [], dead_s: [] };
  const shown = (status: string) => ({ status } as ComparisonWindow);
  const TOP_N = 10;
  const withLogs = (windows: BurstWindow[]) => benchWith({
    sources: benchSources(TOP_N), defensive_windows: windows, per_parse: Array.from({ length: TOP_N }, () => ({ ...covered, taken_per_s: Array.from({ length: FIGHT_S }, () => 0) })),
  });

  it('says the top logs share no window when the bench has none', () => {
    expect(svc['windowsEmpty'](benchWith({ sources: benchSources(TOP_N) }), [])).toBe('No defensive window to compare. The defensives of the 10 top logs do not line up in time.');
  });

  it('counts the windows checked, leaving out a muted one', () => {
    expect(svc['windowsEmpty'](withLogs([window, window]), [shown('blue'), shown('muted')])).toBe('Nothing flagged. 1 of 2 windows checked against the 10 top logs.');
  });

  it('counts no window checked on a bench baked before coverage', () => {
    const bench = benchWith({ sources: benchSources(TOP_N), defensive_windows: [window] });
    expect(svc['windowsEmpty'](bench, [shown('neutral')])).toBe('Nothing flagged. 0 of 1 window checked against the 10 top logs.');
  });

  it('says nothing once a window is flagged', () => {
    expect(svc['windowsEmpty'](withLogs([window]), [shown('amber')])).toBe('');
  });
});
