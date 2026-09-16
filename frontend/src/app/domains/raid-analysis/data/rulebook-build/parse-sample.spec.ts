import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ParseSampleService } from './parse-sample-service';
import { WclApiService } from '../wcl/wcl-api-service';
import type { ParseRanking } from '../wcl/wcl.models';
import { TOP_PARSE_COUNT } from '../analysis/bench-pipeline-service';
import { applyBuff, applyDebuff, cast, damage } from '../../../../../testing/builders/events';
import { BACKSTAB, RUPTURE, SHADOW_DANCE_AURA } from '../../../../../testing/spell-ids';

const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3129;
const PLAYER_ID = 7;
const FIGHT_ID = 3;
const FIGHT_START_S = 1;
const FIGHT_START_MS = FIGHT_START_S * 1000;
const FIGHT_DURATION_S = 300;
const FIGHT_END_MS = FIGHT_START_MS + FIGHT_DURATION_S * 1000;
const BUFF_AT_S = 4;
/** One ranking past the parse count plus the one that cannot bind, so the cap shows. */
const RANKING_COUNT = TOP_PARSE_COUNT + 2;

/** The first ranking names an actor two report actors share, so it cannot bind. */
const RANKINGS: ParseRanking[] = Array.from({ length: RANKING_COUNT }, (_, position) => ({
  player: position === 0 ? 'Ambiguous' : `Raider${position}`, server: 'Ravencrest', report_code: `code-${position}`, fight_id: FIGHT_ID,
}));
const QUERY = { spec: SPEC, encounterId: ENCOUNTER_ID, selection: RANKINGS };

function fakeWcl(): WclApiService {
  return {
    getReport: async (code: string) => ({
      title: code, startTime: 0,
      fights: [{ id: FIGHT_ID, name: 'Boss', startTime: FIGHT_START_MS, endTime: FIGHT_END_MS }],
      masterData: { actors: [
        { id: PLAYER_ID, name: code.endsWith('-0') ? 'Ambiguous' : `Raider${code.split('-')[1] ?? ''}`, subType: 'Rogue', server: 'Ravencrest' },
        { id: PLAYER_ID + 1, name: 'Ambiguous', subType: 'Rogue', server: 'Ravencrest' },
      ], abilities: [] },
    }),
    getAllEvents: async (_code: string, _fight: number, dataType: string, _start: number, _end: number, sourceId?: number, _resources?: boolean, hostility?: string) => {
      if (dataType === 'Casts') return [cast(BACKSTAB, 2), damage(BACKSTAB, 2.5, 100)];
      if (dataType === 'Buffs') return [applyBuff(SHADOW_DANCE_AURA, BUFF_AT_S)];
      if (sourceId !== undefined || hostility !== 'Enemies') return [];
      return [
        { ...applyDebuff(RUPTURE, 5), sourceID: PLAYER_ID },
        { ...applyDebuff(RUPTURE, 6), sourceID: PLAYER_ID + 1 },
      ];
    },
  } as unknown as WclApiService;
}

const sampler = (): ParseSampleService => TestBed.inject(ParseSampleService);

describe('ParseSampleService.sample', () => {
  it('keeps as many bindable parses as the benches measure, dropping the actor it cannot bind', async () => {
    const samples = await sampler().sample(fakeWcl(), QUERY, true);
    expect(samples).toHaveLength(TOP_PARSE_COUNT);
  });

  it('keeps only cast events in the cast stream and stamps fight-relative seconds', async () => {
    const [sample] = await sampler().sample(fakeWcl(), QUERY, true);
    expect(sample?.fightDurationS).toBe(FIGHT_DURATION_S);
    expect(sample?.casts.map(event => event.type)).toEqual(['cast']);
    expect(sample?.buffs[0]?.atS).toBe(BUFF_AT_S - FIGHT_START_S);
  });

  it('reads the player\'s dots off the raid-wide enemy stream and drops the other raiders\' debuffs', async () => {
    const [sample] = await sampler().sample(fakeWcl(), QUERY, true);
    expect(sample?.debuffs.map(event => event.sourceID)).toEqual([PLAYER_ID]);
  });

  it('leaves the enemy stream unfetched for a spec whose rules never read it', async () => {
    const [sample] = await sampler().sample(fakeWcl(), QUERY, false);
    expect(sample?.debuffs).toEqual([]);
  });

  it('samples nothing from an encounter with no rankings', async () => {
    expect(await sampler().sample(fakeWcl(), { ...QUERY, selection: [] }, true)).toEqual([]);
  });
});
