import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { ok, missing } from '../../../core/result';
import { NorthernSkyTransformService, cooldownCastTimes, consensusCastTimes } from './northern-sky-transform.service';
import { SHADOW_BLADES, SHADOW_DANCE, EVASION } from '../../../../testing/spell-ids';
import { cast } from '../../../../testing/builders/events';
import { rulebook } from '../../../../testing/builders/rulebook';

describe('cooldownCastTimes', () => {
  it('collects a cooldown\'s cast times in fight-relative seconds, sorted, ignoring other ids', () => {
    const casts = [cast(SHADOW_BLADES, 30), cast(SHADOW_BLADES, 10), cast(SHADOW_DANCE, 5)];
    expect(cooldownCastTimes(casts, SHADOW_BLADES, 0)).toEqual([10, 30]);
  });
});

describe('consensusCastTimes', () => {
  // sampleCount 2 -> minParses = max(2, ceil(0.5 * 2)) = 2.
  it('emits the median of the first use when a majority of parses reached it', () => {
    const casts = [{ time_s: 10, parse: 0 }, { time_s: 12, parse: 1 }];
    expect(consensusCastTimes(casts, 2)).toEqual([11]);
  });

  it('drops a use ordinal too few parses reached', () => {
    // Only parse 0 has any cast, so the 1st-use ordinal holds one parse (< 2) and is dropped.
    expect(consensusCastTimes([{ time_s: 10, parse: 0 }, { time_s: 12, parse: 0 }], 2)).toEqual([]);
  });

  it('aligns by ordinal: a parse\'s extra early use without majority support is dropped', () => {
    // Ordinal 0: median(10, 14) = 12. Ordinal 1: only parse 0's 12s, below the majority, dropped.
    const casts = [{ time_s: 10, parse: 0 }, { time_s: 12, parse: 0 }, { time_s: 14, parse: 1 }];
    expect(consensusCastTimes(casts, 2)).toEqual([12]);
  });

  it('emits one median per ordinal both parses reached, ascending', () => {
    // 1st uses (10, 11) -> 10.5; 2nd uses (90, 92) -> 91.
    const casts = [
      { time_s: 10, parse: 0 }, { time_s: 11, parse: 1 },
      { time_s: 90, parse: 0 }, { time_s: 92, parse: 1 },
    ];
    expect(consensusCastTimes(casts, 2)).toEqual([10.5, 91]);
  });

  it('surfaces a reactive ability a majority use at spread times (would not time-cluster)', () => {
    // sampleCount 3 -> minParses = max(2, ceil(1.5)) = 2. No two casts are near each other, but
    // all three parses use it once, so the 1st-use ordinal still yields a consensus time.
    const casts = [{ time_s: 30, parse: 0 }, { time_s: 120, parse: 1 }, { time_s: 200, parse: 2 }];
    expect(consensusCastTimes(casts, 3)).toEqual([120]);
  });
});

function reportFor(playerId: number, playerName: string, fightId: number) {
  return {
    title: 't',
    fights: [{ id: fightId, name: 'Boss', startTime: 0, endTime: 300_000, kill: true, encounterID: 1, friendlyPlayers: [] }],
    masterData: { actors: [{ id: playerId, name: playerName, subType: 'Rogue', server: '' }], abilities: [] },
  };
}

// Both top parses cast Shadow Blades at 10s, Shadow Dance at 40s, and Evasion (defensive) at 70s.
const wclFake = {
  getRankings: async () => ({
    rankings: [{ name: 'P1', report: { code: 'r1', fightID: 1 } }, { name: 'P2', report: { code: 'r2', fightID: 2 } }],
  }),
  getReport: async (code: string) => (code === 'r1' ? reportFor(10, 'P1', 1) : reportFor(20, 'P2', 2)),
  getAllEvents: async () => [cast(SHADOW_BLADES, 10), cast(SHADOW_DANCE, 40), cast(EVASION, 70)],
  getAbilities: async (ids: number[]) => Object.fromEntries(ids.map(id => [id, { id, icon: `icon_${id}`, name: `name_${id}` }])),
};
const filesFake = {
  getRulebook: async () => ok(rulebook({
    spec: 'SubtletyRogue',
    cooldowns: [
      { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 180 },
      { name: 'Shadow Dance', spell_id: SHADOW_DANCE, cooldown: 60 },
    ],
    defensives: [{ name: 'Evasion', spell_id: EVASION, cooldown: 120 }],
  })),
};

describe('NorthernSkyTransformService (live, in-browser)', () => {
  it('bakes the consensus timeline for cooldowns and defensives, and the icons', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
        { provide: DataFileApiService, useValue: filesFake as unknown as DataFileApiService },
      ],
    });
    const bench = await TestBed.inject(NorthernSkyTransformService).getBench('SubtletyRogue', 1);
    expect(bench.ok).toBe(true);
    if (!bench.ok) return;
    expect(bench.value.sample_count).toBe(2);
    expect(bench.value.encounter_name).toBe('Boss');
    expect(bench.value.abilities).toEqual([
      { spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: `icon_${SHADOW_BLADES}`, kind: 'cooldown', cast_times_s: [10] },
      { spell_id: SHADOW_DANCE, name: 'Shadow Dance', icon: `icon_${SHADOW_DANCE}`, kind: 'cooldown', cast_times_s: [40] },
      { spell_id: EVASION, name: 'Evasion', icon: `icon_${EVASION}`, kind: 'defensive', cast_times_s: [70] },
    ]);
  });

  it('returns missing when the spec rulebook has no cooldowns or defensives', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
        { provide: DataFileApiService, useValue: { getRulebook: async () => ok(rulebook({ spec: 'SubtletyRogue', cooldowns: [] })) } as unknown as DataFileApiService },
      ],
    });
    expect(await TestBed.inject(NorthernSkyTransformService).getBench('SubtletyRogue', 1)).toEqual(missing('Not yet ingested.'));
  });
});
