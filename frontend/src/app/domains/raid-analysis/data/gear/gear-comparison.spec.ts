import { assert, describe, it, expect } from 'vitest';
import { GearComparisonService } from './gear-comparison-service';
import { GearJudgeService } from './gear-judge-service';
import { SpecTalents } from './talent.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { TestBed } from '@angular/core/testing';

const gearComparison = TestBed.inject(GearComparisonService);
const judge = TestBed.inject(GearJudgeService);

function stats(partial: Partial<EncounterGearStats> = {}): EncounterGearStats {
  return { talent_builds: [], trinket_sets: [], enchants: {}, ...partial };
}

const SOPHIC_ITEM = { name: 'Sophic Devotion', itemId: null, icon: '' };

describe('buildBenchEnchantRows', () => {
  const leader = (slot: number, k: number, n: number) => ({ slot, identity: SOPHIC_ITEM.name, item: SOPHIC_ITEM, k, n });

  it('lists a leader at least half the top logs use, with its share', () => {
    expect(gearComparison.buildBenchEnchantRows([leader(15, 5, 10)]))
      .toEqual([{ slotName: 'Main Hand', enchant: SOPHIC_ITEM, share: '5 of 10 top logs' }]);
  });

  it('leaves out a leader under half the top logs', () => {
    expect(gearComparison.buildBenchEnchantRows([leader(15, 4, 10)])).toEqual([]);
  });
});

describe('emptyNote', () => {
  it('names the count of top logs that carry none', () => {
    expect(gearComparison.emptyNote('trinket', 10, 'carries a trinket')).toBe('No trinket data. None of the 10 top logs carries a trinket.');
  });

  it('names no count on a bench without per-log picks', () => {
    expect(gearComparison.emptyNote('trinket', 0, 'carries a trinket')).toBe('No trinket data.');
  });
});

const GAZE = { id: 249343, name: 'Gaze of the Alnseer', icon: 'gaze' };
const PUZZLE_BOX = { id: 193701, name: "Algeth'ar Puzzle Box", icon: 'box' };
const VOLATILE = { id: 999999, name: 'Volatile Phoenix Fire', icon: 'phoenix' };

const key = (trinkets: { id: number }[]): string => judge.trinketKey(judge.measureTrinkets(trinkets));

const TRINKET_STATS = stats({
  trinket_sets: [
    { items: [PUZZLE_BOX, GAZE], pct: 50 },
    { items: [PUZZLE_BOX, VOLATILE], pct: 30 },
    { items: [GAZE, VOLATILE], pct: 15 },
  ],
});

describe('buildTrinketSets', () => {
  it('labels each pair by its rank among the top pairs, most common first', () => {
    const rows = gearComparison.buildTrinketSets(TRINKET_STATS, '');
    expect(rows.map(row => row.label))
      .toEqual(['Most common pair', '2nd most common pair', '3rd most common pair']);
    expect(rows.map(row => row.pct)).toEqual([50, 30, 15]);
    assert.exists(rows[0]);
    expect(rows[0].items).toEqual([PUZZLE_BOX, GAZE]);
  });

  it('marks the row the player uses, whichever slot order they wear it in', () => {
    const playerKey = key([{ id: GAZE.id }, { id: PUZZLE_BOX.id }]);
    expect(gearComparison.buildTrinketSets(TRINKET_STATS, playerKey).map(row => row.isPlayer))
      .toEqual([true, false, false]);
  });

  it('marks no row when the player key is empty or matches no bench pair', () => {
    const unbenchedKey = key([{ id: VOLATILE.id }]);
    expect(gearComparison.buildTrinketSets(TRINKET_STATS, '').some(row => row.isPlayer)).toBe(false);
    expect(gearComparison.buildTrinketSets(TRINKET_STATS, unbenchedKey).some(row => row.isPlayer)).toBe(false);
  });

  it('returns an empty array when stats or trinket sets are absent', () => {
    expect(gearComparison.buildTrinketSets(null, '')).toEqual([]);
    expect(gearComparison.buildTrinketSets(stats({ trinket_sets: [] }), '')).toEqual([]);
  });
});

const BASELINE = 'v3:11.1,22.2';
const TALENTS: SpecTalents = {
  11: { name: 'Alpha', icon: 'icon_a', spellId: 111 },
  12: { name: 'Alt Alpha', icon: 'icon_alt', spellId: 112 },
  22: { name: 'Beta', icon: 'icon_b', spellId: 222 },
  33: { name: 'Gamma', icon: 'icon_c', spellId: 333 },
  44: { name: 'Hero Tree', icon: '' },
  55: { name: 'Tiered', icon: 'icon_t', spellId: 551 },
  56: { name: 'Tiered', icon: 'icon_t', spellId: 552 },
  57: { name: 'Tiered', icon: 'icon_t', spellId: 553 },
  66: { name: 'Twin', icon: 'icon_w', spellId: 661 },
  67: { name: 'Twin', icon: 'icon_w', spellId: 662 },
};
const TIERED_2_POINTS = 'v3:11.1,22.2,55.1,56.1';
const TIERED_3_POINTS = 'v3:11.1,22.2,55.1,56.2';
const TIERED_4_POINTS = 'v3:11.1,22.2,55.1,56.2,57.1';

describe('buildTalentDiff (a lower-ranked build vs the most common build)', () => {
  it('is empty when the build matches the most common one', () => {
    expect(gearComparison.buildTalentDiff(BASELINE, BASELINE, TALENTS)).toEqual([]);
  });

  it('reports a swapped slot as the added talent plus the dropped one', () => {
    expect(gearComparison.buildTalentDiff('v3:12.1,22.2', BASELINE, TALENTS)).toEqual([
      { kind: 'added', talent: TALENTS[12] },
      { kind: 'dropped', talent: TALENTS[11] },
    ]);
  });

  it('reports a talent the most common build fills and this one drops', () => {
    expect(gearComparison.buildTalentDiff('v3:11.1', BASELINE, TALENTS)).toEqual([
      { kind: 'dropped', talent: TALENTS[22] },
    ]);
  });

  it('reports a talent only this build adds', () => {
    expect(gearComparison.buildTalentDiff('v3:11.1,22.2,33.1', BASELINE, TALENTS)).toEqual([
      { kind: 'added', talent: TALENTS[33] },
    ]);
  });

  it('reports a rank difference where the talent is in both builds', () => {
    expect(gearComparison.buildTalentDiff('v3:11.1,22.1', BASELINE, TALENTS)).toEqual([
      { kind: 'rank', talent: TALENTS[22], rank: 1, standardRank: 2 },
    ]);
  });

  it('carries a hero-tree pick, which has no spell behind it', () => {
    expect(gearComparison.buildTalentDiff('v3:11.1,22.2,44.1', BASELINE, TALENTS)).toEqual([
      { kind: 'added', talent: { name: 'Hero Tree', icon: '' } },
    ]);
  });

  it('falls back to the entry id when the talents file does not name it', () => {
    expect(gearComparison.buildTalentDiff('v3:11.1,22.2,99.1', BASELINE, TALENTS)).toEqual([
      { kind: 'added', talent: { name: 'Talent #99', icon: '' } },
    ]);
  });

  it('reports a tiered slot both builds run as the points each spends on it', () => {
    expect(gearComparison.buildTalentDiff(TIERED_4_POINTS, TIERED_3_POINTS, TALENTS)).toEqual([
      { kind: 'rank', talent: TALENTS[55], rank: 4, standardRank: 3 },
    ]);
    expect(gearComparison.buildTalentDiff(TIERED_2_POINTS, TIERED_4_POINTS, TALENTS)).toEqual([
      { kind: 'rank', talent: TALENTS[55], rank: 2, standardRank: 4 },
    ]);
  });

  it('is empty when both builds spend the same points on a tiered slot', () => {
    expect(gearComparison.buildTalentDiff(TIERED_4_POINTS, TIERED_4_POINTS, TALENTS)).toEqual([]);
  });

  it('lists a talent its slot reports under several entries once', () => {
    expect(gearComparison.buildTalentDiff(TIERED_4_POINTS, BASELINE, TALENTS)).toEqual([
      { kind: 'added', talent: TALENTS[55] },
    ]);
  });

  it('reports an alike-named slot swapped at equal points as the added talent plus the dropped one', () => {
    expect(gearComparison.buildTalentDiff('v3:11.1,22.2,67.1', 'v3:11.1,22.2,66.1', TALENTS)).toEqual([
      { kind: 'added', talent: TALENTS[67] },
      { kind: 'dropped', talent: TALENTS[66] },
    ]);
  });

  it('is empty without a talents file, or when either build is unreadable', () => {
    expect(gearComparison.buildTalentDiff('v3:12.1', BASELINE, null)).toEqual([]);
    expect(gearComparison.buildTalentDiff('', BASELINE, TALENTS)).toEqual([]);
    expect(gearComparison.buildTalentDiff('v2:1,2', BASELINE, TALENTS)).toEqual([]);
  });
});
