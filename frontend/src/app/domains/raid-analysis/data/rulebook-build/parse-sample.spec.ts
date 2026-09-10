import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ParseSampleService } from './parse-sample-service';
import { WclApiService } from '../wcl/wcl-api-service';
import type { ParseRanking } from '../wcl/wcl.models';
import { applyBuff, applyDebuff, cast, damage } from '../../../../../testing/builders/events';
import { BACKSTAB, RUPTURE, SHADOW_DANCE_AURA } from '../../../../../testing/spell-ids';

const PLAYER_ID = 7;
const FIGHT_ID = 3;
const FIGHT_START_MS = 1_000;
const FIGHT_END_MS = 301_000;
const FIGHT_DURATION_S = 300;
const ENCOUNTER_ID = 1;
/** More rankings than the sampler keeps, so the cap shows. */
const RANKING_COUNT = 12;
const KEPT = 10;

/** The first ranking names an actor two report actors share, so it cannot bind. */
const RANKINGS: ParseRanking[] = Array.from({ length: RANKING_COUNT }, (_, position) => ({
  player: position === 0 ? 'Ambiguous' : `Raider${position}`, server: 'Ravencrest', report_code: `code-${position}`, fight_id: FIGHT_ID,
}));

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
      if (dataType === 'Buffs') return [applyBuff(SHADOW_DANCE_AURA, 4)];
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
    const samples = await sampler().sample(fakeWcl(), RANKINGS, ENCOUNTER_ID, true);
    expect(samples).toHaveLength(KEPT);
    expect(samples.map(sample => sample.reportCode)).not.toContain('code-0');
    expect(samples.every(sample => sample.encounterId === ENCOUNTER_ID)).toBe(true);
  });

  it('keeps only cast events in the cast stream and stamps fight-relative seconds', async () => {
    const [sample] = await sampler().sample(fakeWcl(), RANKINGS, ENCOUNTER_ID, true);
    expect(sample?.fightDurationS).toBe(FIGHT_DURATION_S);
    expect(sample?.casts.map(event => event.type)).toEqual(['cast']);
    expect(sample?.buffs[0]?.atS).toBe(4 - FIGHT_START_MS / 1000);
  });

  it('reads the player\'s dots off the raid-wide enemy stream and drops the other raiders\' debuffs', async () => {
    const [sample] = await sampler().sample(fakeWcl(), RANKINGS, ENCOUNTER_ID, true);
    expect(sample?.debuffs.map(event => event.sourceID)).toEqual([PLAYER_ID]);
  });

  it('leaves the enemy stream unfetched for a spec whose rules never read it', async () => {
    const [sample] = await sampler().sample(fakeWcl(), RANKINGS, ENCOUNTER_ID, false);
    expect(sample?.debuffs).toEqual([]);
  });
});
