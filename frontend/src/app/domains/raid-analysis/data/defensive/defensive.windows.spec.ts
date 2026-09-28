import { assert, describe, it, expect } from 'vitest';
import { BurstWindow, PlayerBurstWindow, PlayerDefensive } from '../analysis/analysis.models';
import { DefensiveFeatureService } from './defensive-feature-service';
import { damageTaken, death, resurrect } from '../../../../../testing/builders/events';
import { CLOAK_OF_SHADOWS } from '../../../../../testing/spell-ids';
import { BOSS_HIT_SPELL_ID, timed } from './defensive-harness';
import { TestBed } from '@angular/core/testing';
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
    { time_s: WIN_START_S, window_length_s: WIN_LEN_S, dmg_avg: 0, dmg_min: 0, dmg_max: 0, dmg_stddev: 0, common_cds: [], ability_breakdown: [] },
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

describe('defensiveWindowStatus', () => {
  // Status is driven by damage TAKEN vs the band, not by coverage. Band edge = topMax + stddev.
  const TOP_MAX = 1200;
  const STDDEV = 100;
  const BAND_EDGE = TOP_MAX + STDDEV;        // 1300 - damage above this is bad
  const WITHIN_BAND = TOP_MAX;               // 1200 - within/below the band
  const ABOVE_BAND = BAND_EDGE + 1;          // 1301 - strictly above the band

  it.each([
    { name: 'is muted and unannotated when the window was not reached', player: WITHIN_BAND, notReached: true, covered: true, dead: false, status: 'muted', icon: 'schedule', note: '' },
    { name: 'is muted and unannotated when the player took no damage in the window', player: null, notReached: false, covered: true, dead: false, status: 'muted', icon: 'help_outline', note: '' },
    { name: 'is good with a covered note when damage taken is within the band and the defensive was pressed', player: WITHIN_BAND, notReached: false, covered: true, dead: false, status: 'good', icon: 'check_circle', note: 'covered' },
    { name: 'is good, noting no defensive used, when damage taken is within the band and none was pressed', player: WITHIN_BAND, notReached: false, covered: false, dead: false, status: 'good', icon: 'check_circle', note: 'no defensive used' },
    { name: 'is good, not bad, at the exact band edge', player: BAND_EDGE, notReached: false, covered: true, dead: false, status: 'good', icon: 'check_circle', note: 'covered' },
    { name: 'is bad, noting the defensive was used wrongly, when damage taken is above the band and it was pressed', player: ABOVE_BAND, notReached: false, covered: true, dead: false, status: 'bad', icon: 'error', note: 'defensive used wrongly' },
    { name: 'is bad, noting the defensive was needed and unused, when damage taken is above the band and none was pressed', player: ABOVE_BAND, notReached: false, covered: false, dead: false, status: 'bad', icon: 'error', note: 'defensive needed, unused' },
    { name: 'is bad, noting the death, when the player was dead in the window even with damage taken inside the band', player: WITHIN_BAND, notReached: false, covered: true, dead: true, status: 'bad', icon: 'error', note: 'dead' },
    { name: 'is bad, noting the death, when the player was dead through the whole window and took no damage', player: null, notReached: false, covered: false, dead: true, status: 'bad', icon: 'error', note: 'dead' },
    { name: 'stays muted when the window was not reached, even with the player dead', player: null, notReached: true, covered: false, dead: true, status: 'muted', icon: 'schedule', note: '' },
  ])('$name', ({ player, notReached, covered, dead, status, icon, note }) => {
    expect(svc['defensiveWindowStatus'](player, TOP_MAX, STDDEV, notReached, covered, dead)).toEqual({ status, icon, note });
  });
});

describe('deadSpans', () => {
  const PLAYER_ID = 10;
  const FIGHT_END_S = 300;
  const DIED_S = 40;
  const BACK_S = 70;

  it('runs a death with no resurrect after it to the fight end', () => {
    expect(svc['deadSpans'](timed([death(PLAYER_ID, DIED_S)], 0), [], FIGHT_END_S)).toEqual([[DIED_S, FIGHT_END_S]]);
  });

  it('ends a death at the resurrect after it', () => {
    const spans = svc['deadSpans'](timed([death(PLAYER_ID, DIED_S)], 0), timed([resurrect(PLAYER_ID, BACK_S)], 0), FIGHT_END_S);
    expect(spans).toEqual([[DIED_S, BACK_S]]);
  });

  it('does not end a death at a resurrect in the same instant, which lands before it', () => {
    const spans = svc['deadSpans'](timed([death(PLAYER_ID, DIED_S)], 0), timed([resurrect(PLAYER_ID, DIED_S)], 0), FIGHT_END_S);
    expect(spans).toEqual([[DIED_S, FIGHT_END_S]]);
  });

  it('pairs each of two deaths with the resurrect that followed it', () => {
    const SECOND_DIED_S = 200;
    const spans = svc['deadSpans'](
      timed([death(PLAYER_ID, SECOND_DIED_S), death(PLAYER_ID, DIED_S)], 0), timed([resurrect(PLAYER_ID, BACK_S)], 0), FIGHT_END_S,
    );
    expect(spans).toEqual([[DIED_S, BACK_S], [SECOND_DIED_S, FIGHT_END_S]]);
  });
});

describe('deadInWindow', () => {
  const WIN_START_S = 30;
  const WIN_LEN_S = 5;
  const WIN_END_S = WIN_START_S + WIN_LEN_S;
  const window = { time_s: WIN_START_S, window_length_s: WIN_LEN_S } as BurstWindow;
  const JUST = 0.1;

  it('is true for a death inside the window', () => {
    expect(svc['deadInWindow'](window, [[WIN_START_S + 1, WIN_END_S + 60]])).toBe(true);
  });

  it('is true for a death before the window the player was not back from until inside it', () => {
    expect(svc['deadInWindow'](window, [[WIN_START_S - 20, WIN_START_S + JUST]])).toBe(true);
  });

  it('is false for a death at the exact window end, which the window no longer counts', () => {
    expect(svc['deadInWindow'](window, [[WIN_END_S, WIN_END_S + 60]])).toBe(false);
    expect(svc['deadInWindow'](window, [[WIN_END_S - JUST, WIN_END_S + 60]])).toBe(true);
  });

  it('is false for a resurrect at the exact window start', () => {
    expect(svc['deadInWindow'](window, [[WIN_START_S - 20, WIN_START_S]])).toBe(false);
  });

  it('is false with no deaths', () => {
    expect(svc['deadInWindow'](window, [])).toBe(false);
  });
});

describe('playerCoveredWindow', () => {
  const window = { time_s: 30, window_length_s: 5 } as BurstWindow;
  const withSpans = (spans: { start_s: number; end_s: number }[]): PlayerDefensive =>
    ({ name: 'Cloak of Shadows', uses: spans.length, windows: spans });

  it('is true when a player span overlaps the window plus slack', () => {
    expect(svc['playerCoveredWindow'](window, withSpans([{ start_s: 33, end_s: 38 }]))).toBe(true);
  });

  it('covers a span reaching the slack edge, not one just short of it', () => {
    // window [30,35], slack 3 -> covers [27,38]; a span ending at 27 reaches the edge.
    expect(svc['playerCoveredWindow'](window, withSpans([{ start_s: 10, end_s: 27 }]))).toBe(true);
    expect(svc['playerCoveredWindow'](window, withSpans([{ start_s: 10, end_s: 26 }]))).toBe(false);
  });

  it('is false with no player defensive', () => {
    expect(svc['playerCoveredWindow'](window, undefined)).toBe(false);
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

describe('buildDefensiveWindows', () => {
  const window: BurstWindow = {
    time_s: 30, window_length_s: 5, dmg_avg: 1000, dmg_min: 800, dmg_max: 1200, dmg_stddev: 100,
    defensive_name: 'Cloak of Shadows', spell_id: CLOAK_OF_SHADOWS, ref_game_id: 6666, common_cds: ['Cloak of Shadows'],
    ability_breakdown: [{ spell_id: BOSS_HIT_SPELL_ID, avg_damage: 600, min_damage: 400, max_damage: 800 }],
  };
  const abilities = {
    [CLOAK_OF_SHADOWS]: { icon: 'cloak', name: 'Cloak of Shadows' },
    [BOSS_HIT_SPELL_ID]: { icon: 'hit', name: 'Boss Hit' },
  };
  const FIGHT_DURATION_S = 300;

  it('pairs each window with player damage taken at the same index', () => {
    const player: PlayerBurstWindow[] = [{ window_damage: 1150, ability_breakdown: [{ spell_id: BOSS_HIT_SPELL_ID, damage: 700 }] }];
    // Covered the window (span 30-35); 1150 is within the band (max 1200 + stddev 100 = 1300) -> good, annotated covered.
    const playerDef: PlayerDefensive[] = [{ name: 'Cloak of Shadows', uses: 1, windows: [{ start_s: 30, end_s: 35 }] }];
    const { windows, anchors, clipAnchors } = svc['buildDefensiveWindows']({ topWindows: [window], playerWindows: player, playerDefensives: playerDef, deadSpans: [], fightDurationS: FIGHT_DURATION_S, abilities });
    const defensiveWindow = first(windows);
    expect(defensiveWindow.overview.playerPct).toBe(1150);
    expect(defensiveWindow.status).toBe('good');
    expect(defensiveWindow.note).toBe('covered');
    expect(defensiveWindow.spells).toEqual([{ id: CLOAK_OF_SHADOWS, icon: 'cloak', name: 'Cloak of Shadows' }]);
    expect(first(defensiveWindow.detailRows)).toMatchObject({ spellId: BOSS_HIT_SPELL_ID, label: 'Boss Hit', icon: 'hit', playerPct: 700, topAvg: 600 });
    expect(anchors[0]).toEqual({ timeS: 30, refGameId: 6666, windowLengthS: 5 });
    expect(clipAnchors[0]).toEqual({ timeS: 30, windowLengthS: 5, key: 'defensive-0' });
  });

  it('names the defensive as a plain label when the bench window has no spell id', () => {
    const unbakedWindow: BurstWindow = { ...window, spell_id: undefined };
    const { windows } = svc['buildDefensiveWindows']({ topWindows: [unbakedWindow], playerWindows: [], playerDefensives: [], deadSpans: [], fightDurationS: FIGHT_DURATION_S, abilities });
    expect(first(windows).spells).toEqual([]);
    expect(first(windows).labels).toEqual(['Cloak of Shadows']);
  });

  it('marks an above-band window bad, annotated as needing an unused defensive', () => {
    // 1500 > band edge (max 1200 + stddev 100 = 1300); no covering defensive -> bad.
    const player: PlayerBurstWindow[] = [{ window_damage: 1500, ability_breakdown: [] }];
    const { windows } = svc['buildDefensiveWindows']({ topWindows: [window], playerWindows: player, playerDefensives: [], deadSpans: [], fightDurationS: FIGHT_DURATION_S, abilities });
    expect(first(windows).status).toBe('bad');
    expect(first(windows).note).toBe('defensive needed, unused');
  });

  it('marks a window the player was dead through bad, annotated dead, even with no damage taken', () => {
    const DIED_S = 20;
    const player: PlayerBurstWindow[] = [{ window_damage: 0, ability_breakdown: [] }];
    const { windows } = svc['buildDefensiveWindows']({ topWindows: [window], playerWindows: player, playerDefensives: [], deadSpans: [[DIED_S, FIGHT_DURATION_S]], fightDurationS: FIGHT_DURATION_S, abilities });
    expect(first(windows).status).toBe('bad');
    expect(first(windows).note).toBe('dead');
  });

  it('keeps an uncovered within-band window good, annotated no defensive used', () => {
    // 900 is within the band; not pressing a defensive when damage stayed acceptable is not a miss.
    const player: PlayerBurstWindow[] = [{ window_damage: 900, ability_breakdown: [] }];
    const { windows } = svc['buildDefensiveWindows']({ topWindows: [window], playerWindows: player, playerDefensives: [], deadSpans: [], fightDurationS: FIGHT_DURATION_S, abilities });
    expect(first(windows).status).toBe('good');
    expect(first(windows).note).toBe('no defensive used');
  });
});
