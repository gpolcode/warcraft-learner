import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ok } from '../../../core/result';
import { SHADOW_BLADES, SHADOW_DANCE } from '../../../../testing/spell-ids';
import { NORTHERN_SKY_DATA_SOURCE, NorthernSkyBench } from './northern-sky-data-source';
import { NorthernSkyFeatureService, buildNorthernSkyNote } from './northern-sky.service';

// Blizzard specialization id for Subtlety Rogue, baked into the bench for the note tag.
const SUBTLETY_SPEC_ID = 261;
const ENCOUNTER_ID = 3009;

function bench(over: Partial<NorthernSkyBench> = {}): NorthernSkyBench {
  return {
    spec: 'SubtletyRogue', spec_id: SUBTLETY_SPEC_ID, encounter_id: ENCOUNTER_ID, encounter_name: 'Boss',
    sample_count: 5, cooldowns: [], ...over,
  };
}

const HEADER = `EncounterID:${ENCOUNTER_ID};Name:Boss;Difficulty:Mythic`;

describe('buildNorthernSkyNote', () => {
  it('emits the Mythic header alone when nothing is selected', () => {
    const model = bench({ cooldowns: [{ spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: '', cast_times_s: [10] }] });
    expect(buildNorthernSkyNote(model, new Set())).toBe(HEADER);
  });

  it('emits one line per cast time, tagged with the spec id, with no phase field', () => {
    const model = bench({ cooldowns: [{ spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: '', cast_times_s: [10, 40] }] });
    expect(buildNorthernSkyNote(model, new Set([SHADOW_BLADES]))).toBe([
      HEADER,
      `time:10;tag:${SUBTLETY_SPEC_ID};spellid:${SHADOW_BLADES};text:Shadow Blades`,
      `time:40;tag:${SUBTLETY_SPEC_ID};spellid:${SHADOW_BLADES};text:Shadow Blades`,
    ].join('\n'));
  });

  it('interleaves lines from different cooldowns in chronological order', () => {
    const model = bench({ cooldowns: [
      { spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: '', cast_times_s: [40] },
      { spell_id: SHADOW_DANCE, name: 'Shadow Dance', icon: '', cast_times_s: [10] },
    ] });
    expect(buildNorthernSkyNote(model, new Set([SHADOW_BLADES, SHADOW_DANCE]))).toBe([
      HEADER,
      `time:10;tag:${SUBTLETY_SPEC_ID};spellid:${SHADOW_DANCE};text:Shadow Dance`,
      `time:40;tag:${SUBTLETY_SPEC_ID};spellid:${SHADOW_BLADES};text:Shadow Blades`,
    ].join('\n'));
  });

  it('omits a deselected cooldown', () => {
    const model = bench({ cooldowns: [
      { spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: '', cast_times_s: [10] },
      { spell_id: SHADOW_DANCE, name: 'Shadow Dance', icon: '', cast_times_s: [20] },
    ] });
    expect(buildNorthernSkyNote(model, new Set([SHADOW_BLADES]))).toBe([
      HEADER,
      `time:10;tag:${SUBTLETY_SPEC_ID};spellid:${SHADOW_BLADES};text:Shadow Blades`,
    ].join('\n'));
  });
});

describe('NorthernSkyFeatureService', () => {
  it('returns the bench from its data source', async () => {
    const model = bench({ cooldowns: [{ spell_id: SHADOW_BLADES, name: 'Shadow Blades', icon: '', cast_times_s: [10] }] });
    TestBed.configureTestingModule({
      providers: [{ provide: NORTHERN_SKY_DATA_SOURCE, useValue: { getBench: async () => ok(model) } }],
    });
    const result = await TestBed.inject(NorthernSkyFeatureService).getExport('SubtletyRogue', ENCOUNTER_ID);
    expect(result).toEqual(ok(model));
  });
});
