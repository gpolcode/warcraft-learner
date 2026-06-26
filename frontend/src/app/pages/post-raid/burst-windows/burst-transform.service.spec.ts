import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { BurstTransformService } from './burst-transform.service';

// A report with one boss fight + one named player + one damage ability.
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

// Two top parses, each: Shadow Blades cast at 0:10 -> a [10,30]s window with damage inside.
const wclFake = {
  getRankings: async () => [
    { player: 'P1', report_code: 'r1', fight_id: 1 },
    { player: 'P2', report_code: 'r2', fight_id: 2 },
  ],
  getReport: async (code: string) => (code === 'r1' ? reportFor(10, 'P1', 1) : reportFor(20, 'P2', 2)),
  getAllEvents: async (_code: string, _fightId: number, dataType: string) =>
    dataType === 'Casts'
      ? [{ type: 'cast', timestamp: 10_000, abilityGameID: 121471 }]
      : [{ type: 'damage', timestamp: 12_000, abilityGameID: 279043, amount: 1000 }],
};

const filesFake = {
  getRulebook: async () => ({
    spec: 'SubtletyRogue',
    major_cooldowns: [{ name: 'Shadow Blades', spell_id: 121471, cooldown: 90, duration: 20 }],
    defensives: [],
  }),
};

function setup(): BurstTransformService {
  TestBed.configureTestingModule({
    providers: [
      { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
      { provide: DataFileApiService, useValue: filesFake as unknown as DataFileApiService },
    ],
  });
  return TestBed.inject(BurstTransformService);
}

describe('BurstTransformService (live, in-browser)', () => {
  it('computes a clustered burst bench from the top parses via the shared pipeline', async () => {
    const bench = await setup().getBurstBench('SubtletyRogue', 1);
    expect(bench).not.toBeNull();
    expect(bench!.sample_count).toBe(2);
    expect(bench!.encounter_name).toBe('Boss');
    expect(bench!.cd_spell_ids).toEqual({ 'Shadow Blades': 121471 });
    expect(bench!.windows).toHaveLength(1);
    expect(bench!.windows[0].time_s).toBe(10);
    expect(bench!.windows[0].common_cds).toContain('Shadow Blades');
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
