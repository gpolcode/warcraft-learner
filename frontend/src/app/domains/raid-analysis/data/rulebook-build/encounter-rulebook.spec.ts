import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EncounterRulebookService } from './encounter-rulebook-service';
import { ParseSampleService, type ParseSampleQuery } from './parse-sample-service';
import { RulebookBuildService, type RulebookBuild } from './rulebook-build-service';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { ParseSample, RulebookSources } from './rulebook-build.models';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { parseSample } from '../../../../../testing/builders/parse-sample';
import { rulebook } from '../../../../../testing/builders/rulebook';

const ENCOUNTER_ID = 3129;
const SPEC: SpecMeta = { spec: 'SubtletyRogue', className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety', classIcon: 'class_rogue' };
const SELECTION = [{ player: 'Raider', server: 'Ravencrest', report_code: 'r1', fight_id: 1 }];
const SAMPLES = [parseSample()];
const BUILT: RulebookBuild = { rulebook: rulebook({ spec: SPEC.spec }), gaps: [] };
const WCL = {} as WclApiService;

function sources(referencedHeads: string[]): RulebookSources {
  return { spec: SPEC, apl: { actions: [], gaps: [], referencedHeads }, records: [], talents: {}, key: 'k', gaps: [] };
}

function derive(referencedHeads: string[]) {
  const sampled: { query: ParseSampleQuery; enemyAuras: boolean }[] = [];
  const built: { sources: RulebookSources; samples: ParseSample[] }[] = [];
  const real = TestBed.inject(RulebookBuildService);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: ParseSampleService, useValue: { sample: async (_wcl: WclApiService, query: ParseSampleQuery, enemyAuras: boolean) => { sampled.push({ query, enemyAuras }); return SAMPLES; } } },
      { provide: RulebookBuildService, useValue: {
        readsEnemyAuras: (apl: RulebookSources['apl']) => real.readsEnemyAuras(apl),
        build: (from: RulebookSources, samples: ParseSample[]) => { built.push({ sources: from, samples }); return BUILT; },
      } },
    ],
  });
  const inputs = { sources: sources(referencedHeads), encounterId: ENCOUNTER_ID, selection: SELECTION };
  return { sampled, built, result: TestBed.inject(EncounterRulebookService).derive(WCL, inputs) };
}

describe('EncounterRulebookService.derive', () => {
  it('samples the encounter\'s own top parses and builds the rules from them', async () => {
    const { sampled, built, result } = derive(['buff']);
    expect(await result).toBe(BUILT);
    expect(sampled).toEqual([{ query: { spec: SPEC.spec, encounterId: ENCOUNTER_ID, selection: SELECTION }, enemyAuras: false }]);
    expect(built[0]?.samples).toBe(SAMPLES);
  });

  it('asks for the enemy aura stream only when the resolved APL reads a dot', async () => {
    const { sampled, result } = derive(['dot']);
    await result;
    expect(sampled[0]?.enemyAuras).toBe(true);
  });
});
