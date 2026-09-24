import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LiveRulebookService } from './live-rulebook-service';
import { EncounterRulebookService, type EncounterRulebookInputs } from './encounter-rulebook-service';
import { SimcDataService } from '../http/simc-data-service';
import { TalentDataService } from '../http/talent-data-service';
import { CurrentRaidsService } from '../ingest/current-raids-service';
import { TopParseSelectionService } from '../analysis/top-parse-selection-service';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { Results, type Result } from '../../../shared/util-http/result';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { TopParseSelection } from '../wcl/wcl.models';
import type { SpecMeta } from '../data-files/spec-meta.models';
import { rulebook } from '../../../../../testing/builders/rulebook';

const SPEC = 'SubtletyRogue';
const META: SpecMeta = {
  spec: SPEC, className: 'Rogue', specName: 'Subtlety', classLabel: 'Rogue', specLabel: 'Subtlety', classIcon: 'class_rogue',
};
const TIER = { branch: 'midnight', dir: 'MID2' };
const NEXUS_KING = 3129;
const DIMENSIUS = 3131;
const APL = 'actions=backstab';
const DUMP = '';
const SELECTION: TopParseSelection = [{ player: 'Raider', server: 'Ravencrest', report_code: 'r1', fight_id: 1 }];
const DERIVED = rulebook({ spec: SPEC });
const WCL = {} as WclApiService;
/** One action list and one class dump: what preparing a spec's sources costs. */
const SOURCE_FETCHES = ['apl', 'dump'];

function setup(apl: Result<string> = Results.ok(APL), selection: TopParseSelection = SELECTION) {
  const fetched: string[] = [];
  const derived: EncounterRulebookInputs[] = [];
  const warnings: string[] = [];
  TestBed.configureTestingModule({
    providers: [
      { provide: SimcDataService, useValue: {
        getApl: async () => { fetched.push('apl'); return apl; },
        getSpellDataDump: async () => { fetched.push('dump'); return Results.ok(DUMP); },
      } },
      { provide: TalentDataService, useValue: { getTalents: async () => Results.ok({}) } },
      { provide: CurrentRaidsService, useValue: { discoverSpecMetas: async () => [META] } },
      { provide: TopParseSelectionService, useValue: { resolveTopParses: async () => selection } },
      { provide: EncounterRulebookService, useValue: {
        derive: async (_wcl: WclApiService, inputs: EncounterRulebookInputs) => { derived.push(inputs); return { rulebook: DERIVED, gaps: [] }; },
      } },
      { provide: LoggerService, useValue: { logWarn: (context: string) => warnings.push(context) } },
    ],
  });
  return { rulebooks: TestBed.inject(LiveRulebookService), fetched, derived, warnings };
}

describe('LiveRulebookService.rulebookFor', () => {
  it('derives one rulebook for every bench of one analysis', async () => {
    const { rulebooks, fetched, derived } = setup();
    const asked = await Promise.all(Array.from({ length: 4 }, () => rulebooks.rulebookFor(WCL, SPEC, NEXUS_KING, TIER)));
    expect(asked).toEqual([DERIVED, DERIVED, DERIVED, DERIVED]);
    expect(fetched).toEqual(SOURCE_FETCHES);
    expect(derived).toHaveLength(1);
  });

  it('reads a spec\'s sources once and derives per encounter', async () => {
    const { rulebooks, fetched, derived } = setup();
    await rulebooks.rulebookFor(WCL, SPEC, NEXUS_KING, TIER);
    await rulebooks.rulebookFor(WCL, SPEC, DIMENSIUS, TIER);
    expect(fetched).toEqual(SOURCE_FETCHES);
    expect(derived.map(inputs => inputs.encounterId)).toEqual([NEXUS_KING, DIMENSIUS]);
  });

  it('derives from the spec\'s prepared sources and the encounter\'s own top parses', async () => {
    const { rulebooks, derived } = setup();
    await rulebooks.rulebookFor(WCL, SPEC, NEXUS_KING, TIER);
    expect(derived[0]?.sources.spec).toEqual(META);
    expect(derived[0]?.selection).toBe(SELECTION);
  });

  it('reads no rules for a spec SimulationCraft writes no action list for, and says nothing about it', async () => {
    const { rulebooks, derived, warnings } = setup(Results.missing('no action list'));
    expect(await rulebooks.rulebookFor(WCL, SPEC, NEXUS_KING, TIER)).toBeNull();
    expect(derived).toEqual([]);
    expect(warnings).toEqual([]);
  });

  it('warns when a source cannot be read', async () => {
    const { rulebooks, warnings } = setup(Results.transient('GitHub is unreachable right now.'));
    expect(await rulebooks.rulebookFor(WCL, SPEC, NEXUS_KING, TIER)).toBeNull();
    expect(warnings).toEqual([`LiveRulebookService ${SPEC}`]);
  });

  it('reads no rules for an encounter with no ranked parses', async () => {
    const { rulebooks, derived } = setup(Results.ok(APL), []);
    expect(await rulebooks.rulebookFor(WCL, SPEC, NEXUS_KING, TIER)).toBeNull();
    expect(derived).toEqual([]);
  });
});
