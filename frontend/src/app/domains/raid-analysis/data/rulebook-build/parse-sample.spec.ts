import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NgHttpCachingService } from 'ng-http-caching';
import { ParseSampleService } from './parse-sample-service';
import { WclApiService } from '../wcl/wcl-api-service';
import type { IngestEncounter } from '../ingest/ingest.models';
import { applyBuff, cast, damage } from '../../../../../testing/builders/events';
import { BACKSTAB, SHADOW_DANCE_AURA } from '../../../../../testing/spell-ids';

const SPEC = 'SubtletyRogue';
const PARTITION = 2;
const PLAYER_ID = 7;
const FIGHT_ID = 3;
const FIGHT_START_MS = 1_000;
const FIGHT_END_MS = 301_000;
const FIGHT_DURATION_S = 300;
/** More bosses than the sampler keeps, and more parses on the richest boss than it takes from any one. */
const BOSSES = 4;
const KEPT_BOSSES = 3;
const PER_BOSS = 5;
const RICH_BOSS_RANKINGS = 7;

const encounter = (id: number): IngestEncounter => ({ id, name: `Boss ${id}`, zone: 'Raid', zoneId: 1, partitionIds: [PARTITION] });
const ENCOUNTERS = Array.from({ length: BOSSES }, (_, position) => encounter(position + 1));

/** Boss 1 has the most rankings, boss 4 none, so bosses 1 to 3 are sampled. */
function rankingsFor(encounterId: number): { name: string; server: { name: string }; report: { code: string; fightID: number } }[] {
  const count = encounterId === 1 ? RICH_BOSS_RANKINGS : encounterId === BOSSES ? 0 : PER_BOSS - 1;
  return Array.from({ length: count }, (_, position) => ({
    name: position === 0 ? 'Ambiguous' : `Raider${position}`, server: { name: 'Ravencrest' }, report: { code: `code${encounterId}-${position}`, fightID: FIGHT_ID },
  }));
}

function fakeWcl(): WclApiService {
  return {
    getRankings: async (_spec: string, encounterId: number) => ({ rankings: rankingsFor(encounterId) }),
    getReport: async (code: string) => ({
      title: code, startTime: 0,
      fights: [{ id: FIGHT_ID, name: 'Boss', startTime: FIGHT_START_MS, endTime: FIGHT_END_MS }],
      masterData: { actors: [
        { id: PLAYER_ID, name: code.endsWith('-0') ? 'Ambiguous' : `Raider${code.split('-')[1] ?? ''}`, subType: 'Rogue', server: 'Ravencrest' },
        { id: PLAYER_ID + 1, name: 'Ambiguous', subType: 'Rogue', server: 'Ravencrest' },
      ], abilities: [] },
    }),
    getAllEvents: async (_code: string, _fight: number, dataType: string) => {
      if (dataType === 'Casts') return [cast(BACKSTAB, 2), damage(BACKSTAB, 2.5, 100)];
      if (dataType === 'Buffs') return [applyBuff(SHADOW_DANCE_AURA, 4)];
      return [];
    },
  } as unknown as WclApiService;
}

function sampler(): ParseSampleService {
  TestBed.configureTestingModule({ providers: [{ provide: NgHttpCachingService, useValue: { clearCache: () => undefined } }] });
  return TestBed.inject(ParseSampleService);
}

describe('ParseSampleService.sample', () => {
  it('samples the most-ranked bosses, up to five bindable parses each, dropping the actor it cannot bind', async () => {
    const samples = await sampler().sample(fakeWcl(), SPEC, ENCOUNTERS);
    const perBoss = new Map<number, number>();
    for (const sample of samples) perBoss.set(sample.encounterId, (perBoss.get(sample.encounterId) ?? 0) + 1);
    expect([...perBoss.keys()].sort()).toEqual([1, 2, 3].slice(0, KEPT_BOSSES));
    expect(perBoss.get(1)).toBe(PER_BOSS);
    expect(perBoss.get(2)).toBe(PER_BOSS - 2);
  });

  it('keeps only cast events in the cast stream and stamps fight-relative seconds', async () => {
    const [sample] = await sampler().sample(fakeWcl(), SPEC, ENCOUNTERS);
    expect(sample?.fightDurationS).toBe(FIGHT_DURATION_S);
    expect(sample?.casts.map(event => event.type)).toEqual(['cast']);
    expect(sample?.buffs[0]?.atS).toBe(4 - FIGHT_START_MS / 1000);
  });
});
