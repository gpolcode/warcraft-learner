import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { WclEvent } from '../../../core/models/wcl.models';
import {
  BurstTransformService, cdTimings, findParseWindows, clusterParseWindows, cdSpellIds, ParseWindow,
  toParseRankings,
} from './burst-transform.service';

function cast(spellId: number, atS: number): WclEvent {
  return { type: 'cast', timestamp: atS * 1000, abilityGameID: spellId };
}
function damage(spellId: number, atS: number, amount: number): WclEvent {
  return { type: 'damage', timestamp: atS * 1000, abilityGameID: spellId, amount };
}
/** A flat damage stream: `amount` at every second in [0, seconds). */
function uniformDamage(spellId: number, seconds: number, amount: number): WclEvent[] {
  return Array.from({ length: seconds }, (_, i) => damage(spellId, i, amount));
}

/* ----------------------------- pure functions ----------------------------- */

describe('toParseRankings', () => {
  it('maps raw rankings to fetchable parses and caps at count', () => {
    const raw = [
      { name: 'P1', report: { code: 'r1', fightID: 1 } },
      { name: 'P2', report: { code: 'r2', fightID: 2 } },
      { name: 'P3', report: { code: 'r3', fightID: 3 } },
    ];
    expect(toParseRankings(raw, 2)).toEqual([
      { player: 'P1', report_code: 'r1', fight_id: 1 },
      { player: 'P2', report_code: 'r2', fight_id: 2 },
    ]);
  });

  it('drops anonymized "Character N-N" names and rows without a report code', () => {
    const raw = [
      { name: 'Character 123-456', report: { code: 'r1', fightID: 1 } },
      { name: 'Real', report: { fightID: 2 } },
      { name: 'Keep', report: { code: 'r3', fightID: 3 } },
    ];
    expect(toParseRankings(raw, 10)).toEqual([{ player: 'Keep', report_code: 'r3', fight_id: 3 }]);
  });
});

describe('cdSpellIds', () => {
  it('maps cooldown + defensive names to spell ids, skipping missing ids', () => {
    expect(cdSpellIds(
      [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }, { name: 'NoId', spell_id: 0, cooldown: 60 }],
      [{ name: 'Cloak', spell_id: 31224, cooldown: 120 }],
    )).toEqual({ 'Shadow Blades': 121471, 'Cloak': 31224 });
  });
});

describe('cdTimings', () => {
  it('collects per-cooldown cast times in fight-relative seconds (no duration read)', () => {
    const timings = cdTimings([cast(121471, 30), cast(121471, 10), cast(999, 5)], [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }], 0);
    expect(timings).toEqual([{ name: 'Shadow Blades', castTimesS: [10, 30] }]);
  });
});

describe('findParseWindows', () => {
  // A contiguous clump (dmg at 10,11,12,13) on a long fight forms one dense run, trimmed
  // to the bins that actually carry damage, so it measures [10s, 14s).
  it('detects and measures a damage-density clump as a single window', () => {
    const clump = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    const windows = findParseWindows(clump, 0, 300_000, [], [], new Map());
    expect(windows).toHaveLength(1);
    expect(windows[0]).toMatchObject({ time_s: 10, window_length_s: 4, window_damage: 4000 });
    expect(windows[0].ability_breakdown[0]).toMatchObject({ spell_id: 279043, damage: 4000 });
  });

  it('returns no window for sparse uniform low damage', () => {
    // 100/s for 10s is perfectly flat: no bin's rolling rate clears the density threshold.
    expect(findParseWindows(uniformDamage(279043, 10, 100), 0, 10_000, [], [], new Map())).toHaveLength(0);
  });

  it('returns [] for no damage, zero total, or a non-positive fight length', () => {
    expect(findParseWindows([], 0, 300_000, [], [], new Map())).toEqual([]);
    expect(findParseWindows([damage(279043, 10, 0)], 0, 300_000, [], [], new Map())).toEqual([]);
    expect(findParseWindows([damage(279043, 10, 1000)], 0, 0, [], [], new Map())).toEqual([]);
  });

  // Threshold = max(1.6 * meanRollRate, 0.66-quantile of the rate distribution). With
  // total damage fixed at 1000 over 100 bins and the rate distribution mostly zero,
  // the quantile term is 0, so threshold = 1.6 * (1000 / 100) * 3 = 48 exactly. An
  // isolated spike's rolling rate equals its own value; comparison is strict `>=`. The
  // window then trims to the spike's own bin (t=10).
  it('keeps a clump whose rolling rate is exactly at the density threshold', () => {
    // Spike of 48 at t=10 (rate 48 == threshold) + a far anchor holding the rest of the 1000.
    const windows = findParseWindows([damage(1, 10, 48), damage(2, 50, 952)], 0, 100_000, [], [], new Map());
    expect(windows.some(window => window.time_s === 10)).toBe(true);
  });

  it('drops a clump whose rolling rate is just below the density threshold', () => {
    // Spike of 47 (rate 47 < 48); only the anchor window survives.
    const windows = findParseWindows([damage(1, 10, 47), damage(2, 50, 953)], 0, 100_000, [], [], new Map());
    expect(windows.some(window => window.time_s === 10)).toBe(false);
  });

  // Two isolated spikes leave a sub-threshold gap of (q - p - 3) bins between their
  // dense runs. MERGE_GAP_BINS = 2 bridges a gap of up to 2 bins.
  it('bridges two dense runs separated by 2 sub-threshold bins into one window', () => {
    // Spikes 5 bins apart (t=10, t=15) -> gap of 2 bins -> merged, trimmed to [10s, 16s).
    const windows = findParseWindows([damage(1, 10, 1000), damage(2, 15, 1000)], 0, 100_000, [], [], new Map());
    expect(windows).toHaveLength(1);
    expect(windows[0]).toMatchObject({ time_s: 10, window_length_s: 6, window_damage: 2000 });
  });

  it('keeps two dense runs separated by 3 sub-threshold bins as separate windows', () => {
    // Spikes 6 bins apart (t=10, t=16) -> gap of 3 bins -> not merged; each trims to its bin.
    const windows = findParseWindows([damage(1, 10, 1000), damage(2, 16, 1000)], 0, 100_000, [], [], new Map());
    expect(windows).toHaveLength(2);
    expect(windows[0]).toMatchObject({ time_s: 10, window_length_s: 1 });
    expect(windows[1]).toMatchObject({ time_s: 16, window_length_s: 1 });
  });

  it('drops a dense window carrying less than 3% of fight damage', () => {
    // Dense spike of 1000 at t=10 next to a 100000 anchor: 1000 / 101000 < 3% -> dropped.
    const windows = findParseWindows([damage(1, 10, 1000), damage(2, 500, 100_000)], 0, 1_000_000, [], [], new Map());
    expect(windows.some(window => window.time_s === 10)).toBe(false);
  });

  it('keeps a dense window carrying at least 3% of fight damage', () => {
    // 600 of 10600 total = 5.66% >= 3% -> kept.
    const windows = findParseWindows([damage(1, 10, 600), damage(2, 50, 10_000)], 0, 100_000, [], [], new Map());
    expect(windows.some(window => window.time_s === 10 && window.window_damage === 600)).toBe(true);
  });

  it('excludes a hit exactly on the window end (half-open)', () => {
    // Clump 10..13 -> window [10s, 14s). A small probe at exactly 14s is too small to
    // extend the dense run, so the window geometry is fixed and the 14s hit is excluded.
    const base = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    const windows = findParseWindows([...base, damage(555, 14, 10)], 0, 300_000, [], [], new Map());
    expect(windows).toHaveLength(1);
    expect(windows[0]).toMatchObject({ window_length_s: 4, window_damage: 4000 });
    expect(windows[0].ability_breakdown.map(ability => ability.spell_id)).not.toContain(555);
  });

  it('includes a hit just inside the window end', () => {
    const base = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    const windows = findParseWindows([...base, damage(555, 13.999, 10)], 0, 300_000, [], [], new Map());
    expect(windows[0]).toMatchObject({ window_length_s: 4, window_damage: 4010 });
    expect(windows[0].ability_breakdown.map(ability => ability.spell_id)).toContain(555);
  });

  it('attributes a cooldown whose cast lands inside the window', () => {
    // Window is [10s, 14s); a Shadow Blades cast at 10s is inside.
    const clump = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    const timings = cdTimings([cast(121471, 10)], [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }], 0);
    const windows = findParseWindows(clump, 0, 300_000, timings, [cast(121471, 10)], new Map());
    expect(windows[0].active_cds).toEqual(['Shadow Blades']);
  });

  it('does not attribute a cooldown cast outside the window (boundary cast at endS excluded)', () => {
    const clump = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    // A cast at 14s sits exactly on the half-open window end -> not attributed.
    const timings = cdTimings([cast(121471, 14)], [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90 }], 0);
    const windows = findParseWindows(clump, 0, 300_000, timings, [cast(121471, 14)], new Map());
    expect(windows[0].active_cds).toEqual([]);
  });

  it('marks an ability with no matching cast event as passive', () => {
    // Eviscerate deals the clump damage but was never cast (only Shadow Blades was).
    const names = new Map([[121471, 'Shadow Blades'], [279043, 'Eviscerate']]);
    const clump = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    const windows = findParseWindows(clump, 0, 300_000, [], [cast(121471, 10)], names);
    expect(windows[0].ability_breakdown[0]).toMatchObject({ spell_id: 279043, is_passive: true });
  });

  it('marks an actively cast ability as not passive', () => {
    const names = new Map([[279043, 'Eviscerate']]);
    const clump = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000), damage(279043, 13, 1000)];
    const windows = findParseWindows(clump, 0, 300_000, [], [cast(279043, 10)], names);
    expect(windows[0].ability_breakdown[0]).toMatchObject({ spell_id: 279043, is_passive: false });
  });
});

describe('clusterParseWindows', () => {
  const window = (timeS: number, isPassive = false): ParseWindow => ({
    time_s: timeS, window_length_s: 6, window_damage: 1000, active_cds: ['Shadow Blades'],
    ability_breakdown: [{ spell_id: 279043, damage: 600, casts: 2, is_passive: isPassive }],
  });

  it('emits a cluster present in enough parses, with common cds + ability stats', () => {
    const out = clusterParseWindows([window(10), window(11)], 2);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ time_s: 10.5, common_cds: ['Shadow Blades'], dmg_avg: 1000, window_length_s: 6 });
    expect(out[0].ability_breakdown[0]).toMatchObject({ spell_id: 279043, avg_damage: 600, count: 2 });
  });

  it('does not emit avg_targets', () => {
    expect(clusterParseWindows([window(10), window(11)], 2)[0]).not.toHaveProperty('avg_targets');
  });

  // Majority gate: survive only when a cluster holds at least max(2, 0.5 * sampleCount)
  // member parses. With sampleCount = 10 the floor is 5.
  it('keeps a cluster present in a majority of parses', () => {
    const five = [window(10), window(11), window(12), window(13), window(14)];
    expect(clusterParseWindows(five, 10)).toHaveLength(1);
  });

  it('drops a cluster present in fewer than the majority of parses', () => {
    const four = [window(10), window(11), window(12), window(13)];
    expect(clusterParseWindows(four, 10)).toHaveLength(0);
  });

  it('marks a clustered ability passive only when every member never cast it', () => {
    expect(clusterParseWindows([window(10, true), window(11, true)], 2)[0].ability_breakdown[0])
      .toMatchObject({ is_passive: true });
    // One member did cast it -> the clustered ability is not passive.
    expect(clusterParseWindows([window(10, true), window(11, false)], 2)[0].ability_breakdown[0])
      .toMatchObject({ is_passive: false });
  });
});

/* ----------------------------- service (end to end, fake client) ----------------------------- */

function reportFor(playerId: number, playerName: string, fightId: number) {
  return {
    title: 't',
    fights: [{ id: fightId, name: 'Boss', startTime: 0, endTime: 300_000, kill: true, encounterID: 1, friendlyPlayers: [] }],
    masterData: {
      actors: [{ id: playerId, name: playerName, subType: 'Rogue', server: '' }],
      abilities: [{ gameID: 279043, name: 'Eviscerate', icon: 'x' }],
    },
  };
}

// A damage-density clump at 10,11,12s overlaps the Shadow Blades cast at 10s, so each
// parse yields one measured window with Shadow Blades attributed inside it.
const clumpDamage = [damage(279043, 10, 1000), damage(279043, 11, 1000), damage(279043, 12, 1000)];
const wclFake = {
  getRankings: async () => [
    { name: 'P1', report: { code: 'r1', fightID: 1 } },
    { name: 'P2', report: { code: 'r2', fightID: 2 } },
  ],
  getReport: async (code: string) => (code === 'r1' ? reportFor(10, 'P1', 1) : reportFor(20, 'P2', 2)),
  getAllEvents: async (_code: string, _fightId: number, dataType: string) =>
    dataType === 'Casts' ? [cast(121471, 10)] : clumpDamage,
  // Resolves a real icon + name for every requested spell id (gameData.ability).
  getAbilities: async (ids: number[]) =>
    Object.fromEntries(ids.map(id => [id, { icon: `icon_${id}`, name: `name_${id}` }])),
};
const filesFake = {
  getRulebook: async () => ({
    spec: 'SubtletyRogue',
    major_cooldowns: [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90, duration: 20 }],
    defensives: [],
  }),
};

describe('BurstTransformService (live, in-browser)', () => {
  it('computes a clustered burst bench from the top parses', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
        { provide: DataFileApiService, useValue: filesFake as unknown as DataFileApiService },
      ],
    });
    const bench = await TestBed.inject(BurstTransformService).getBurstBench('SubtletyRogue', 1);
    expect(bench).not.toBeNull();
    expect(bench!.sample_count).toBe(2);
    expect(bench!.encounter_name).toBe('Boss');
    expect(bench!.cd_spell_ids).toEqual({ 'Shadow Blades': 121471 });
    expect(bench!.windows).toHaveLength(1);
    expect(bench!.windows[0].common_cds).toContain('Shadow Blades');
    // ability_icons is complete: header cooldown AND every window ability resolved by id.
    expect(bench!.ability_icons[121471]).toEqual({ icon: 'icon_121471', name: 'name_121471' });
    expect(bench!.ability_icons[279043]).toEqual({ icon: 'icon_279043', name: 'name_279043' });
  });

  it('backfills past a private (unfetchable) top parse to keep the sample count full', async () => {
    const candidates = Array.from({ length: 11 }, (_, i) => ({ name: `P${i + 1}`, report: { code: `r${i + 1}`, fightID: i + 1 } }));
    const backfillWcl = {
      ...wclFake,
      getRankings: async () => candidates,
      getReport: async (code: string) => {
        if (code === 'r5') throw new Error('You do not have permission to view this report.');
        const idx = Number(code.slice(1));
        return reportFor(idx * 10, `P${idx}`, idx);
      },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: backfillWcl as unknown as WclApiService },
        { provide: DataFileApiService, useValue: filesFake as unknown as DataFileApiService },
      ],
    });
    const bench = await TestBed.inject(BurstTransformService).getBurstBench('SubtletyRogue', 1);
    // 11 candidates, one private: the 11th backfills the skipped parse to a full 10.
    expect(bench!.sample_count).toBe(10);
  });

  it('returns null when the spec has no rulebook cooldowns', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
        { provide: DataFileApiService, useValue: { getRulebook: async () => null } as unknown as DataFileApiService },
      ],
    });
    expect(await TestBed.inject(BurstTransformService).getBurstBench('SubtletyRogue', 1)).toBeNull();
  });
});
