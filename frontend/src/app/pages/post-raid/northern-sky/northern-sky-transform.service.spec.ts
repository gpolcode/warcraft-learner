import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { ok, missing } from '../../../core/result';
import { NorthernSkyTransformService, cooldownCastTimes, consensusCastTimes } from './northern-sky-transform.service';
import { SHADOW_BLADES, SHADOW_DANCE } from '../../../../testing/spell-ids';
import { cast } from '../../../../testing/builders/events';
import { rulebook } from '../../../../testing/builders/rulebook';

// Blizzard specialization id for Subtlety Rogue - the value baked as `spec_id` for the note tag.
const SUBTLETY_SPEC_ID = 261;

describe('cooldownCastTimes', () => {
  it('collects a cooldown\'s cast times in fight-relative seconds, sorted, ignoring other ids', () => {
    const casts = [cast(SHADOW_BLADES, 30), cast(SHADOW_BLADES, 10), cast(SHADOW_DANCE, 5)];
    expect(cooldownCastTimes(casts, SHADOW_BLADES, 0)).toEqual([10, 30]);
  });
});

describe('consensusCastTimes', () => {
  // sampleCount 2 -> minParses = max(2, ceil(0.5 * 2)) = 2.
  it('keeps a use two distinct parses share, emitting the median time', () => {
    const casts = [{ time_s: 10, parse: 0 }, { time_s: 12, parse: 1 }];
    expect(consensusCastTimes(casts, 2)).toEqual([11]);
  });

  it('drops a use only one parse made, even when a second cast is nearby', () => {
    // Both casts belong to parse 0, so the cluster holds one distinct parse (< 2) and is dropped.
    expect(consensusCastTimes([{ time_s: 10, parse: 0 }, { time_s: 12, parse: 0 }], 2)).toEqual([]);
  });

  it('counts a parse once and takes its earliest cast when it double-casts in the window', () => {
    // parse 0 casts at 10 and 12 (earliest 10), parse 1 at 14 -> median(10, 14) = 12.
    const casts = [{ time_s: 10, parse: 0 }, { time_s: 12, parse: 0 }, { time_s: 14, parse: 1 }];
    expect(consensusCastTimes(casts, 2)).toEqual([12]);
  });

  it('emits separate uses for clusters beyond the merge window, ascending', () => {
    // Two far-apart uses (~10s and ~90s), each shared by both parses.
    const casts = [
      { time_s: 10, parse: 0 }, { time_s: 11, parse: 1 },
      { time_s: 90, parse: 0 }, { time_s: 92, parse: 1 },
    ];
    expect(consensusCastTimes(casts, 2)).toEqual([10.5, 91]);
  });
});

function reportFor(playerId: number, playerName: string, fightId: number) {
  return {
    title: 't',
    fights: [{ id: fightId, name: 'Boss', startTime: 0, endTime: 300_000, kill: true, encounterID: 1, friendlyPlayers: [] }],
    masterData: { actors: [{ id: playerId, name: playerName, subType: 'Rogue', server: '' }], abilities: [] },
  };
}

// Both top parses cast Shadow Blades at 10s and Shadow Dance at 40s, so each is a two-parse consensus use.
const wclFake = {
  getRankings: async () => ({
    rankings: [{ name: 'P1', report: { code: 'r1', fightID: 1 } }, { name: 'P2', report: { code: 'r2', fightID: 2 } }],
  }),
  getReport: async (code: string) => (code === 'r1' ? reportFor(10, 'P1', 1) : reportFor(20, 'P2', 2)),
  getAllEvents: async () => [cast(SHADOW_BLADES, 10), cast(SHADOW_DANCE, 40)],
  getAbilities: async (ids: number[]) => Object.fromEntries(ids.map(id => [id, { id, icon: `icon_${id}`, name: `name_${id}` }])),
};
const filesFake = {
  getRulebook: async () => ok(rulebook({
    spec: 'SubtletyRogue',
    cooldowns: [
      { name: 'Shadow Blades', spell_id: SHADOW_BLADES, cooldown: 180 },
      { name: 'Shadow Dance', spell_id: SHADOW_DANCE, cooldown: 60 },
    ],
  })),
};

describe('NorthernSkyTransformService (live, in-browser)', () => {
  it('bakes the per-cooldown consensus timeline, the spec id, and the icons from the top parses', async () => {
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
    expect(bench.value.spec_id).toBe(SUBTLETY_SPEC_ID);
    expect(bench.value.encounter_name).toBe('Boss');
    expect(bench.value.cooldowns).toEqual([
      { spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: `icon_${SHADOW_BLADES}`, cast_times_s: [10] },
      { spell_id: SHADOW_DANCE, name: 'Shadow Dance', icon: `icon_${SHADOW_DANCE}`, cast_times_s: [40] },
    ]);
  });

  it('returns missing when the spec rulebook has no cooldowns', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: WclApiService, useValue: wclFake as unknown as WclApiService },
        { provide: DataFileApiService, useValue: { getRulebook: async () => ok(rulebook({ spec: 'SubtletyRogue', cooldowns: [] })) } as unknown as DataFileApiService },
      ],
    });
    expect(await TestBed.inject(NorthernSkyTransformService).getBench('SubtletyRogue', 1)).toEqual(missing('Not yet ingested.'));
  });
});
