import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { CharacterGear } from '../../../core/models/wcl.models';
import {
  GearTransformService, toParseGear, aggregateParseGear, ParseGear,
} from './gear-transform.service';

/* ----------------------------- pure functions ----------------------------- */

describe('toParseGear', () => {
  it('reduces a found CharacterGear to its talent/trinket/enchant fingerprint', () => {
    const gear: CharacterGear = {
      found: true, talent_key: 'v2:1,2',
      trinkets: [{ slot: 12, id: 100, name: 'A' }],
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    };
    expect(toParseGear(gear)).toEqual({
      talent_key: 'v2:1,2',
      trinkets: [{ slot: 12, id: 100, name: 'A' }],
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    });
  });

  it('returns null for absent gear', () => {
    expect(toParseGear(null)).toBeNull();
    expect(toParseGear({ found: false })).toBeNull();
  });
});

describe('aggregateParseGear', () => {
  const parse = (overrides: Partial<ParseGear>): ParseGear => ({
    talent_key: 'v2:1,2', trinkets: [], enchants: [], ...overrides,
  });

  it('rolls talent builds, trinkets per slot, and enchants into pct distributions', () => {
    const parses: ParseGear[] = [
      parse({ talent_key: 'v2:A', trinkets: [{ slot: 12, id: 100, name: 'A' }], enchants: [{ slot: 15, id: 8041, name: 'Soph' }] }),
      parse({ talent_key: 'v2:A', trinkets: [{ slot: 12, id: 100, name: 'A' }], enchants: [{ slot: 15, id: 8041, name: 'Soph' }] }),
      parse({ talent_key: 'v2:B', trinkets: [{ slot: 12, id: 200, name: 'B' }], enchants: [] }),
      parse({ talent_key: 'v2:A', trinkets: [{ slot: 13, id: 300, name: 'C' }], enchants: [{ slot: 15, id: 9000, name: 'Other' }] }),
    ];
    const stats = aggregateParseGear(parses);

    expect(stats.talent_builds[0]).toMatchObject({ key: 'v2:A', pct: 75 });
    expect(stats.talent_builds[1]).toMatchObject({ key: 'v2:B', pct: 25 });
    // slot 12: id 100 in 2/4 = 50%, id 200 in 1/4 = 25%
    expect(stats.trinkets[12]).toEqual([
      { id: 100, name: 'A', pct: 50 },
      { id: 200, name: 'B', pct: 25 },
    ]);
    expect(stats.trinkets[13]).toEqual([{ id: 300, name: 'C', pct: 25 }]);
    // slot 15: 8041 in 2/4 = 50%, 9000 in 1/4 = 25%
    expect(stats.enchants[15]).toEqual([
      { id: 8041, name: 'Soph', pct: 50 },
      { id: 9000, name: 'Other', pct: 25 },
    ]);
  });

  it('ignores non-trinket slots and zero ids', () => {
    const stats = aggregateParseGear([
      parse({ trinkets: [{ slot: 5, id: 1, name: 'X' }, { slot: 12, id: 0, name: '' }] }),
    ]);
    expect(stats.trinkets).toEqual({});
  });

  it('returns empty aggregates for no parses', () => {
    expect(aggregateParseGear([])).toEqual({ talent_builds: [], trinkets: {}, enchants: {} });
  });
});

/* ----------------------------- service (end to end, fake client) ----------------------------- */

function reportFor(playerId: number, playerName: string, fightId: number) {
  return {
    title: 't',
    fights: [{ id: fightId, name: 'Boss', startTime: 0, endTime: 300_000, kill: true, encounterID: 1, friendlyPlayers: [] }],
    masterData: { actors: [{ id: playerId, name: playerName, subType: 'Rogue', server: '' }], abilities: [] },
  };
}

const playerGear = (id: number): CharacterGear => ({
  found: true, talent_key: 'v2:A',
  trinkets: [{ slot: 12, id, name: 'A' }],
  enchants: [{ slot: 15, id: 8041, name: 'Soph' }],
});

const wclFake = {
  getRankings: async () => [
    { player: 'P1', report_code: 'r1', fight_id: 1 },
    { player: 'P2', report_code: 'r2', fight_id: 2 },
  ],
  getReport: async (code: string) => (code === 'r1' ? reportFor(10, 'P1', 1) : reportFor(20, 'P2', 2)),
  getCombatantGear: async (code: string) => (code === 'r1' ? playerGear(100) : playerGear(100)),
};

describe('GearTransformService (live, in-browser)', () => {
  it('computes a gear bench aggregated from the top parses', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
        { provide: DataFileApiService, useValue: {} as unknown as DataFileApiService },
      ],
    });
    const bench = await TestBed.inject(GearTransformService).getGearBench('SubtletyRogue', 1);
    expect(bench).not.toBeNull();
    expect(bench!.sample_count).toBe(2);
    expect(bench!.encounter_name).toBe('Boss');
    expect(bench!.talent_builds[0]).toMatchObject({ key: 'v2:A', pct: 100 });
    expect(bench!.trinkets[12]).toEqual([{ id: 100, name: 'A', pct: 100 }]);
    expect(bench!.enchants[15]).toEqual([{ id: 8041, name: 'Soph', pct: 100 }]);
  });

  it('returns null when there are no rankings', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: { getRankings: async () => [] } as unknown as WclApiService },
        { provide: DataFileApiService, useValue: {} as unknown as DataFileApiService },
      ],
    });
    expect(await TestBed.inject(GearTransformService).getGearBench('SubtletyRogue', 1)).toBeNull();
  });
});
