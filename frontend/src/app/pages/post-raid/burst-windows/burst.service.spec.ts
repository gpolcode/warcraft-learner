import { TestBed } from '@angular/core/testing';
import { BurstFeatureService } from './burst.service';
import { BURST_DATA_SOURCE, BurstBench, BurstDataSource } from './burst-data-source';

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
