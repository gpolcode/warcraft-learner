import { assert, describe, it, expect } from 'vitest';
import { GearComparisonService } from './gear-comparison-service';
import { SpecTalents } from './talent.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { CharacterGear } from '../wcl/wcl.models';
import { TestBed } from '@angular/core/testing';

const gearComparison = TestBed.inject(GearComparisonService);

function stats(partial: Partial<EncounterGearStats> = {}): EncounterGearStats {
  return { talent_builds: [], trinket_sets: [], enchants: {}, ...partial };
}

function gear(partial: Partial<CharacterGear> = {}): CharacterGear {
  return { ...partial };
}

const SOPHIC_ITEM = { name: 'Sophic Devotion', itemId: null, icon: '' };
const ARMOR_KIT_ITEM_ID = 244641;

describe('buildBenchEnchantRows', () => {
  it('shows the consensus enchant as an item with no link when the bench resolved no item', () => {
    const rows = gearComparison.buildBenchEnchantRows(stats({
      enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 80 }] },
    }));
    expect(rows).toEqual([{ slotName: 'Main Hand', enchant: SOPHIC_ITEM }]);
  });

  it('links the item and shows its icon when the bench carries them', () => {
    const rows = gearComparison.buildBenchEnchantRows(stats({
      enchants: { 6: [{ id: 8159, name: "Forest Hunter's Armor Kit", icon: 'inv_kit', item_id: ARMOR_KIT_ITEM_ID, pct: 100 }] },
    }));
    expect(rows).toEqual([{ slotName: 'Legs', enchant: { name: "Forest Hunter's Armor Kit", itemId: ARMOR_KIT_ITEM_ID, icon: 'inv_kit' } }]);
  });

  it('falls back to Enchant #id when the bench enchant name is empty', () => {
    // WCL does not populate permanentEnchantName; ingest writes empty strings until gameData.enchant(id) resolves them on the next ingest run.
    const rows = gearComparison.buildBenchEnchantRows(stats({
      enchants: { 15: [{ id: 8041, name: '', pct: 90 }] },
    }));
    expect(rows).toEqual([{ slotName: 'Main Hand', enchant: { name: 'Enchant #8041', itemId: null, icon: '' } }]);
  });

  it('skips slots below the consensus share of top parsers', () => {
    const rows = gearComparison.buildBenchEnchantRows(stats({
      enchants: { 15: [{ id: 8041, name: 'Rune', pct: 49 }] },
    }));
    expect(rows).toHaveLength(0);
  });

  it('includes slots at or above the consensus share of top parsers', () => {
    const rows = gearComparison.buildBenchEnchantRows(stats({
      enchants: {
        15: [{ id: 8041, name: 'Rune A', pct: 50 }],
        16: [{ id: 8039, name: 'Rune B', pct: 60 }],
      },
    }));
    expect(rows).toHaveLength(2);
    expect(rows.map(r => r.slotName)).toEqual(['Main Hand', 'Off Hand']);
  });

  it('returns an empty array when stats or enchants are absent', () => {
    expect(gearComparison.buildBenchEnchantRows(null)).toEqual([]);
    expect(gearComparison.buildBenchEnchantRows(stats({ enchants: {} }))).toEqual([]);
  });

  it('sorts slots by slot number', () => {
    const rows = gearComparison.buildBenchEnchantRows(stats({
      enchants: {
        16: [{ id: 8039, name: 'B', pct: 60 }],
        0:  [{ id: 8017, name: 'A', pct: 70 }],
        4:  [{ id: 7987, name: 'C', pct: 100 }],
      },
    }));
    expect(rows.map(r => r.slotName)).toEqual(['Head', 'Chest', 'Off Hand']);
  });
});

const GAZE = { id: 249343, name: 'Gaze of the Alnseer', icon: 'gaze' };
const PUZZLE_BOX = { id: 193701, name: "Algeth'ar Puzzle Box", icon: 'box' };
const VOLATILE = { id: 999999, name: 'Volatile Phoenix Fire', icon: 'phoenix' };

const TRINKET_STATS = stats({
  trinket_sets: [
    { items: [PUZZLE_BOX, GAZE], pct: 50 },
    { items: [PUZZLE_BOX, VOLATILE], pct: 30 },
    { items: [GAZE, VOLATILE], pct: 15 },
  ],
});

describe('trinketSetKey', () => {
  it('is the same key whichever slot each trinket of a pair sits in', () => {
    expect(gearComparison.trinketSetKey([{ id: GAZE.id }, { id: PUZZLE_BOX.id }]))
      .toBe(gearComparison.trinketSetKey([{ id: PUZZLE_BOX.id }, { id: GAZE.id }]));
  });

  it('separates a pair from either trinket worn alone, and is empty for no trinkets', () => {
    const pair = gearComparison.trinketSetKey([{ id: GAZE.id }, { id: PUZZLE_BOX.id }]);
    expect(gearComparison.trinketSetKey([{ id: GAZE.id }])).not.toBe(pair);
    expect(gearComparison.trinketSetKey([])).toBe('');
  });
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
    const playerKey = gearComparison.trinketSetKey([{ id: GAZE.id }, { id: PUZZLE_BOX.id }]);
    expect(gearComparison.buildTrinketSets(TRINKET_STATS, playerKey).map(row => row.isPlayer))
      .toEqual([true, false, false]);
  });

  it('marks no row when the player key is empty or matches no bench pair', () => {
    const unbenchedKey = gearComparison.trinketSetKey([{ id: VOLATILE.id }]);
    expect(gearComparison.buildTrinketSets(TRINKET_STATS, '').some(row => row.isPlayer)).toBe(false);
    expect(gearComparison.buildTrinketSets(TRINKET_STATS, unbenchedKey).some(row => row.isPlayer)).toBe(false);
  });

  it('returns an empty array when stats or trinket sets are absent', () => {
    expect(gearComparison.buildTrinketSets(null, '')).toEqual([]);
    expect(gearComparison.buildTrinketSets(stats({ trinket_sets: [] }), '')).toEqual([]);
  });
});

describe('trinketStatusOf (a player pair matched against the top pairs)', () => {
  it('notes a match to the most common pair', () => {
    const playerKey = gearComparison.trinketSetKey([{ id: PUZZLE_BOX.id }, { id: GAZE.id }]);
    expect(gearComparison.trinketStatusOf(TRINKET_STATS, playerKey))
      .toEqual({ status: 'ok', note: 'Most common pair.' });
  });

  it('notes a match to a lower-ranked top pair by its rank', () => {
    const playerKey = gearComparison.trinketSetKey([{ id: PUZZLE_BOX.id }, { id: VOLATILE.id }]);
    expect(gearComparison.trinketStatusOf(TRINKET_STATS, playerKey))
      .toEqual({ status: 'info', note: '2nd most common pair. 30% use this pair.' });
  });

  it('marks a pair matching none of the top pairs as uncommon', () => {
    const playerKey = gearComparison.trinketSetKey([{ id: VOLATILE.id }]);
    expect(gearComparison.trinketStatusOf(TRINKET_STATS, playerKey))
      .toEqual({ status: 'warn', note: 'Uncommon pair. 50% use the most common one.' });
  });

  it('is unknown without a player pair or without bench pairs', () => {
    const playerKey = gearComparison.trinketSetKey([{ id: GAZE.id }]);
    expect(gearComparison.trinketStatusOf(TRINKET_STATS, '')).toEqual({ status: 'unknown', note: 'No trinket data.' });
    expect(gearComparison.trinketStatusOf(stats({ trinket_sets: [] }), playerKey))
      .toEqual({ status: 'unknown', note: 'No trinket data.' });
  });
});

describe('buildEnchantRows (comparison, real player gear)', () => {
  // The comparison builder is only ever called with a real player's gear; the bench-only /pre plan uses buildBenchEnchantRows instead, so a not-yet-loaded player never renders "Not enchanted".

  it('flags a high-consensus slot the real player left un-enchanted', () => {
    const rows = gearComparison.buildEnchantRows(
      gear({ enchants: [] }),
      stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }] } }),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      slotName: 'Main Hand', status: 'warn', name: 'Not enchanted',
      note: 'Most top raiders run it. Apply it.', top: SOPHIC_ITEM,
    });
  });

  it('stays silent on an un-enchanted slot below the consensus share', () => {
    const rows = gearComparison.buildEnchantRows(
      gear({ enchants: [] }),
      stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 49 }] } }),
    );
    expect(rows).toEqual([]);
  });

  it('marks a slot on-plan when the player runs the consensus enchant', () => {
    const rows = gearComparison.buildEnchantRows(
      gear({ enchants: [{ slot: 15, id: 8041, name: 'Sophic Devotion' }] }),
      stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }] } }),
    );
    expect(rows[0]).toMatchObject({ status: 'ok', name: 'Sophic Devotion', note: null, top: null });
  });

  it('carries the consensus enchant when the player runs a different one', () => {
    const rows = gearComparison.buildEnchantRows(
      gear({ enchants: [{ slot: 15, id: 8039, name: 'Burning Devotion' }] }),
      stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }] } }),
    );
    expect(rows[0]).toMatchObject({
      status: 'info', name: 'Burning Devotion', note: 'Most top raiders run it.', top: SOPHIC_ITEM,
    });
  });

  it('returns an empty array when the player has no enchants and there is no bench data', () => {
    expect(gearComparison.buildEnchantRows(gear({ enchants: [] }), stats({ enchants: {} }))).toEqual([]);
  });

  it('returns a row for a player enchant on a slot with no bench data', () => {
    const rows = gearComparison.buildEnchantRows(
      gear({ enchants: [{ slot: 9, id: 7, name: 'Handguard' }] }),
      stats({ enchants: {} }),
    );
    expect(rows[0]).toMatchObject({ status: 'ok', name: 'Handguard', note: null, top: null });
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

describe('talentStatusOf', () => {
  const topBuilds = stats({
    talent_builds: [
      { key: BASELINE, pct: 62, report_code: 'abc', fight_id: 1, player_name: 'Top', source_id: 1, diff: [] },
    ],
  });

  it('is unknown when the player has no talent key', () => {
    expect(gearComparison.talentStatusOf(topBuilds, '')).toEqual({ status: 'unknown', note: 'No talent data.' });
  });

  it('is ok when the player key matches the most common build', () => {
    expect(gearComparison.talentStatusOf(topBuilds, BASELINE)).toEqual({ status: 'ok', note: 'Most common build.' });
  });

  it('is unknown when the player key version prefix does not match the bench build key format', () => {
    expect(gearComparison.talentStatusOf(topBuilds, 'v2:11,22')).toEqual({ status: 'unknown', note: 'No talent data.' });
  });

  it('is warn when the player key is a comparable version but off the most common build', () => {
    expect(gearComparison.talentStatusOf(topBuilds, 'v3:11.1,33.1')).toEqual({
      status: 'warn', note: 'Uncommon build. 62% use the most common one.',
    });
  });
});

describe('talentStatusOf (a player build matched against the top builds)', () => {
  const MOST_COMMON = 'v3:11.1,22.2';
  const SECOND_BUILD = 'v3:12.1,22.2';
  const THIRD_BUILD = 'v3:11.1,22.1';
  const FOURTH_BUILD = 'v3:12.1,22.1';
  const UNBENCHED_BUILD = 'v3:99.1,22.2';

  function talentBuild(
    partial: Partial<EncounterGearStats['talent_builds'][number]> = {},
  ): EncounterGearStats['talent_builds'][number] {
    return { key: MOST_COMMON, pct: 50, report_code: 'ABC123', fight_id: 1, player_name: 'Player', source_id: 1, diff: [], ...partial };
  }

  const topStats = stats({
    talent_builds: [
      talentBuild({ key: MOST_COMMON, pct: 50 }),
      talentBuild({ key: SECOND_BUILD, pct: 30 }),
      talentBuild({ key: THIRD_BUILD, pct: 15 }),
    ],
  });

  it('notes a match to the most common build', () => {
    expect(gearComparison.talentStatusOf(topStats, MOST_COMMON)).toEqual({ status: 'ok', note: 'Most common build.' });
  });

  it('notes a match to a lower-ranked top build by its rank', () => {
    expect(gearComparison.talentStatusOf(topStats, SECOND_BUILD)).toEqual({
      status: 'info',
      note: '2nd most common build. 30% use this build.',
    });
  });

  it('ranks a build past the named ordinals by its position', () => {
    const deepStats = stats({
      talent_builds: [...topStats.talent_builds, talentBuild({ key: FOURTH_BUILD, pct: 5 })],
    });
    expect(gearComparison.talentStatusOf(deepStats, FOURTH_BUILD)).toEqual({
      status: 'info',
      note: '4th most common build. 5% use this build.',
    });
  });

  it('marks a build matching none of the top builds as uncommon', () => {
    expect(gearComparison.talentStatusOf(topStats, UNBENCHED_BUILD)).toEqual({
      status: 'warn',
      note: 'Uncommon build. 50% use the most common one.',
    });
  });
});
