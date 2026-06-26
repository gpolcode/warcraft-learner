import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BurstWindow, PlayerBurstWindow } from '../../../core/models/analysis.models';
import { BURST_DATA_SOURCE, BurstBench, BurstDataSource } from './burst-data-source';
import {
  BurstFeatureService,
  burstWindowStatus, splitCommonCds, burstMapAnchor, buildBurstView,
} from './burst.service';

/* ----------------------------- pure functions ----------------------------- */

describe('burstWindowStatus', () => {
  // topAvg 1000, topMin 800, stddev 100 -> bad below 700, warn below 900.
  it.each([
    { name: 'not reached -> muted', player: 950 as number | null, notReached: true, status: 'muted', icon: 'schedule' },
    { name: 'missing player data -> muted', player: null, notReached: false, status: 'muted', icon: 'help_outline' },
    { name: 'far below min -> bad', player: 650, notReached: false, status: 'bad', icon: 'error' },
    { name: 'below avg band -> warn', player: 850, notReached: false, status: 'warn', icon: 'warning_amber' },
    { name: 'within range -> good', player: 1000, notReached: false, status: 'good', icon: 'check_circle' },
  ])('$name', ({ player, notReached, status, icon }) => {
    expect(burstWindowStatus(player, 1000, 800, 100, notReached)).toEqual({ status, icon });
  });
});

describe('splitCommonCds', () => {
  it('routes known names to spell ids and unknown names to labels', () => {
    expect(splitCommonCds(['Shadow Blades', 'Mystery'], { 'Shadow Blades': 121471 }))
      .toEqual({ spellIds: [121471], labels: ['Mystery'] });
  });

  it('is empty for no cds', () => {
    expect(splitCommonCds([], {})).toEqual({ spellIds: [], labels: [] });
  });
});

describe('burstMapAnchor', () => {
  it('builds the seek time, label and known spell ids', () => {
    const window = { time_s: 12, window_length_s: 18, common_cds: ['Shadow Blades', 'Mystery'] } as BurstWindow;
    expect(burstMapAnchor(window, { 'Shadow Blades': 121471 })).toEqual({
      timeS: 12, label: 'Shadow Blades, Mystery', spellIds: [121471],
    });
  });

  it('falls back to a generic label when a window has no cds', () => {
    const window = { time_s: 5, window_length_s: 8, common_cds: [] } as unknown as BurstWindow;
    expect(burstMapAnchor(window, {})).toEqual({ timeS: 5, label: 'Burst window', spellIds: [] });
  });
});

describe('buildBurstView', () => {
  const window: BurstWindow = {
    time_s: 10, window_length_s: 20, dmg_avg: 1000, dmg_min: 800, dmg_max: 1200, dmg_stddev: 100,
    common_cds: ['Shadow Blades'],
    ability_breakdown: [
      { spell_id: 279043, avg_damage: 600, min_damage: 400, max_damage: 800, count: 5, avg_casts: 2 },
    ],
  };

  it('pairs each window with the player damage at the same index', () => {
    const player: PlayerBurstWindow[] = [
      { time_s: 10, window_damage: 950, ability_breakdown: [{ spell_id: 279043, damage: 550, casts: 2 }] },
    ];
    const view = buildBurstView([window], player, 300, { 'Shadow Blades': 121471 }, () => 'Shadow Blades');
    expect(view.windows).toHaveLength(1);
    expect(view.windows[0].overview.playerPct).toBe(950);
    expect(view.windows[0].spellIds).toEqual([121471]);
    expect(view.windows[0].detailRows[0]).toMatchObject({ spellId: 279043, label: 'Shadow Blades', playerPct: 550, topAvg: 600 });
    expect(view.anchors[0]).toEqual({ timeS: 10, label: 'Shadow Blades', spellIds: [121471] });
  });

  it('mutes and drops player data for a window the fight never reached', () => {
    const view = buildBurstView([window], [], 5, {}, id => `Spell ${id}`);
    expect(view.windows[0].status).toBe('muted');
    expect(view.windows[0].overview.playerPct).toBeNull();
  });
});

/* ----------------------------- feature service ---------------------------- */

function withBench(bench: BurstBench | null): BurstFeatureService {
  const source: BurstDataSource = { getBurstBench: () => Promise.resolve(bench) };
  TestBed.configureTestingModule({ providers: [{ provide: BURST_DATA_SOURCE, useValue: source }] });
  return TestBed.inject(BurstFeatureService);
}

describe('BurstFeatureService', () => {
  it('returns an empty view when the bench file is absent', async () => {
    const service = withBench(null);
    const view = await service.loadView('SubtletyRogue', 1, 300, [], {});
    expect(view).toEqual({ windows: [], anchors: [] });
  });

  it('assembles the view-model from the bench, merging player damage and baked names', async () => {
    const bench: BurstBench = {
      spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Test', sample_count: 5,
      cd_spell_ids: { 'Shadow Blades': 121471 },
      windows: [{
        time_s: 10, window_length_s: 20, dmg_avg: 1000, dmg_min: 800, dmg_max: 1200, dmg_stddev: 100,
        common_cds: ['Shadow Blades'],
        ability_breakdown: [{ spell_id: 279043, avg_damage: 600, min_damage: 400, max_damage: 800, count: 5, avg_casts: 2 }],
      }],
    };
    const service = withBench(bench);
    const view = await service.loadView(
      'SubtletyRogue', 1, 300,
      [{ time_s: 10, window_damage: 950, ability_breakdown: [{ spell_id: 279043, damage: 550, casts: 2 }] }],
      { 279043: { icon: 'ability_rogue_shadowblades', name: 'Shadow Blades' } },
    );
    expect(view.windows).toHaveLength(1);
    expect(view.windows[0].overview.playerPct).toBe(950);
    expect(view.windows[0].detailRows[0].label).toBe('Shadow Blades');
    expect(view.anchors[0]).toEqual({ timeS: 10, label: 'Shadow Blades', spellIds: [121471] });
  });
});
