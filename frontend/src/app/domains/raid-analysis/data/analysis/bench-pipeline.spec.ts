import { describe, it, expect } from 'vitest';
import { WclApiService } from '../wcl/wcl-api-service';
import type { DataFileApiService } from '../data-files/data-file-api-service';
import { WclTransportError } from '../wcl/wcl-transport';
import { Rulebook } from '../rulebook/rulebook.models';
import { Result, Results } from '../../../shared/util-http/result';
import { TopParseSelection } from '../wcl/wcl.models';
import { SHADOW_BLADES, CLOAK_OF_SHADOWS } from '../../../../../testing/spell-ids';
import { rulebook } from '../../../../../testing/builders/rulebook';
import { FixtureRanking, abilityLookup, parseRankings, wclReport, reportsByCode } from '../../../../../testing/builders/wcl-fixtures';
import { AbilityIcons, WclProjectionsService } from './wcl-projections-service';
import { BenchHeader, BenchRecipe, BenchPipelineService } from './bench-pipeline-service';
import { TestBed } from '@angular/core/testing';

const wclProjections = TestBed.inject(WclProjectionsService);
const benchPipeline = TestBed.inject(BenchPipelineService);

const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3144;
const QUERY = { spec: SPEC, encounterId: ENCOUNTER_ID };
const BOSS_NAME = 'Boss';
const NO_RANKINGS_MESSAGE = 'No top parses for this encounter.';
const TOO_FEW_MESSAGE = 'No fetchable top parses for this encounter.';
const NO_PLAN_MESSAGE = 'No rulebook cooldowns for this spec.';
const BENCH_ERROR_ID = 'recipe.bench';
const CANDIDATE_POOL_COUNT = 20;
const SAMPLE_TARGET = 10;

interface WclOverrides {
  rankings?: FixtureRanking[];
  getRankings?: (spec: string, encounterId: number, partition: number | null) => Promise<unknown>;
  getReport?: (code: string) => Promise<unknown>;
  getAbilities?: (ids: number[]) => Promise<unknown>;
}

function wclFake(over: WclOverrides = {}): WclApiService {
  return {
    getRankings: over.getRankings ?? (async () => ({ rankings: over.rankings ?? parseRankings(CANDIDATE_POOL_COUNT) })),
    getReport: over.getReport ?? reportsByCode(),
    getAbilities: over.getAbilities ?? abilityLookup(),
  } as unknown as WclApiService;
}

function filesFake(read: Result<Rulebook>): DataFileApiService {
  return { getRulebook: async () => read } as unknown as DataFileApiService;
}

interface CodeBench extends BenchHeader { codes: string[] }

function codeRecipe(over: Partial<BenchRecipe<string, CodeBench>> = {}): BenchRecipe<string, CodeBench> {
  return {
    logSource: 'CodeRecipe',
    errorId: BENCH_ERROR_ID,
    sampleTarget: SAMPLE_TARGET,
    minSamples: 1,
    noRankingsMessage: NO_RANKINGS_MESSAGE,
    tooFewParsesMessage: accepted => `${TOO_FEW_MESSAGE} (${accepted})`,
    parse: ({ ranking }) => Promise.resolve(ranking.report_code),
    bench: ({ parses }) => ({ codes: parses }),
    ...over,
  };
}

function benched(codes: string[]): CodeBench {
  return { spec: SPEC, encounter_id: ENCOUNTER_ID, encounter_name: BOSS_NAME, sample_count: codes.length, codes };
}

describe('benchFromTopParses', () => {
  it('hands the recipe every accepted parse in acceptance order, named by the first fight', async () => {
    const CANDIDATES = 2;
    const result = await benchPipeline.benchFromTopParses(wclFake({ rankings: parseRankings(CANDIDATES) }), QUERY, codeRecipe());
    expect(result).toEqual(Results.ok(benched(['r1', 'r2'])));
  });

  it('stops fetching once the recipe\'s sample target is met', async () => {
    const TARGET = 2;
    const fetched: string[] = [];
    const reports = reportsByCode();
    const wcl = wclFake({
      getReport: async (code: string) => { fetched.push(code); return reports(code); },
    });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe({ sampleTarget: TARGET }));
    expect(result).toEqual(Results.ok(benched(['r1', 'r2'])));
    expect(fetched).toEqual(['r1', 'r2']);
  });

  it('backfills past a report WCL will not serve', async () => {
    const TARGET = 2;
    const PRIVATE_CODE = 'r1';
    const wcl = wclFake({ getReport: reportsByCode({ privateCode: PRIVATE_CODE }) });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe({ sampleTarget: TARGET }));
    expect(result).toEqual(Results.ok(benched(['r2', 'r3'])));
  });

  it('backfills past a candidate the recipe itself rejects', async () => {
    const TARGET = 2;
    const REJECTED_CODE = 'r2';
    const recipe = codeRecipe({
      sampleTarget: TARGET,
      parse: ({ ranking }) => Promise.resolve(ranking.report_code === REJECTED_CODE ? null : ranking.report_code),
    });
    const result = await benchPipeline.benchFromTopParses(wclFake(), QUERY, recipe);
    expect(result).toEqual(Results.ok(benched(['r1', 'r3'])));
  });

  it('backfills past a report the ranked player is absent from', async () => {
    const TARGET = 1;
    const ANONYMOUS_CODE = 'r1';
    const reports = reportsByCode();
    const wcl = wclFake({
      getReport: async (code: string) => (code === ANONYMOUS_CODE ? wclReport({ actors: [] }) : reports(code)),
    });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe({ sampleTarget: TARGET }));
    expect(result).toEqual(Results.ok(benched(['r2'])));
  });

  it('backfills past a report that never ran the ranked fight', async () => {
    const TARGET = 1;
    const OTHER_FIGHT_CODE = 'r1';
    const UNRANKED_FIGHT_ID = 99;
    const reports = reportsByCode();
    const wcl = wclFake({
      getReport: async (code: string) => (code === OTHER_FIGHT_CODE ? wclReport({ fightId: UNRANKED_FIGHT_ID }) : reports(code)),
    });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe({ sampleTarget: TARGET }));
    expect(result).toEqual(Results.ok(benched(['r2'])));
  });

  it('reports an empty ranking pool as missing, without touching a report', async () => {
    const result = await benchPipeline.benchFromTopParses(wclFake({ rankings: [] }), QUERY, codeRecipe());
    expect(result).toEqual(Results.missing(NO_RANKINGS_MESSAGE));
  });

  it('benches a pool that exactly meets the recipe\'s floor', async () => {
    const FLOOR = 2;
    const result = await benchPipeline.benchFromTopParses(
      wclFake({ rankings: parseRankings(FLOOR) }), QUERY, codeRecipe({ minSamples: FLOOR }));
    expect(result).toEqual(Results.ok(benched(['r1', 'r2'])));
  });

  it('reports a pool one parse short of the floor as missing, counting the usable parses', async () => {
    const FLOOR = 2;
    const USABLE = FLOOR - 1;
    const result = await benchPipeline.benchFromTopParses(
      wclFake({ rankings: parseRankings(USABLE) }), QUERY, codeRecipe({ minSamples: FLOOR }));
    expect(result).toEqual(Results.missing(`${TOO_FEW_MESSAGE} (${USABLE})`));
  });

  it('surfaces a WCL outage as transient, so the recipe reports an outage rather than a repro id', async () => {
    const SERVER_UNREACHABLE_STATUS = 503;
    const outage = new WclTransportError(`WCL API error (${SERVER_UNREACHABLE_STATUS})`, SERVER_UNREACHABLE_STATUS);
    const wcl = wclFake({ getRankings: async () => { throw outage; } });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe());
    expect(result).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('tags a WCL failure with the recipe\'s repro id instead of a silent empty bench', async () => {
    const wcl = wclFake({ getRankings: async () => { throw new Error('WCL exploded'); } });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'permanent', id: BENCH_ERROR_ID });
  });
});

describe('benchFromTopParses top-parse selection', () => {
  const POOL_SIZE = 3;
  const HANDED_POOL: TopParseSelection = wclProjections.toParseRankings(parseRankings(POOL_SIZE), POOL_SIZE);

  it('benches the pool it was handed, leaving the rankings query to whoever resolved it', async () => {
    const asked: (number | null)[] = [];
    const wcl = wclFake({
      getRankings: async (_spec, _encounterId, partition) => { asked.push(partition); return { rankings: [] }; },
    });

    const result = await benchPipeline.benchFromTopParses(
      wcl, { ...QUERY, selection: HANDED_POOL }, codeRecipe({ sampleTarget: POOL_SIZE }));

    expect(result).toEqual(Results.ok(benched(['r1', 'r2', 'r3'])));
    expect(asked).toEqual([]);
  });

  it('takes the front of a handed pool for a recipe that benches a shallower one', async () => {
    const SHALLOW_POOL = POOL_SIZE - 1;
    const recipe = codeRecipe({ sampleTarget: POOL_SIZE, candidatePoolCount: SHALLOW_POOL });

    const result = await benchPipeline.benchFromTopParses(wclFake(), { ...QUERY, selection: HANDED_POOL }, recipe);

    expect(result).toEqual(Results.ok(benched(['r1', 'r2'])));
  });

  it('resolves the pool itself when handed none, which is how a recipe read outside ingestion benches', async () => {
    const asked: (number | null)[] = [];
    const wcl = wclFake({
      getRankings: async (_spec, _encounterId, partition) => { asked.push(partition); return { rankings: parseRankings(1) }; },
    });

    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, codeRecipe());

    expect(result).toEqual(Results.ok(benched(['r1'])));
    expect(asked).toEqual([null]);
  });
});

interface IdentityBench { spec: string; encounter_id: number; encounter_name: string; codes: string[] }

describe('benchFromTopParses header', () => {
  it('bakes no sample count for a recipe exporting one named parse', async () => {
    const recipe: BenchRecipe<string, IdentityBench> = {
      logSource: 'IdentityRecipe',
      errorId: BENCH_ERROR_ID,
      sampleTarget: 1,
      noRankingsMessage: NO_RANKINGS_MESSAGE,
      header: 'identity',
      parse: ({ ranking }) => Promise.resolve(ranking.report_code),
      bench: ({ parses }) => ({ codes: parses }),
    };
    const result = await benchPipeline.benchFromTopParses(wclFake(), QUERY, recipe);
    expect(result).toEqual(Results.ok({ spec: SPEC, encounter_id: ENCOUNTER_ID, encounter_name: BOSS_NAME, codes: ['r1'] }));
  });
});

const PLANNED_COOLDOWN = 'Shadow Blades';
const PLANNED_RULEBOOK = rulebook({ cooldowns: [{ name: PLANNED_COOLDOWN, spell_id: SHADOW_BLADES, cooldown: 90 }] });

function planRecipe(
  dataFiles: DataFileApiService, over: Partial<BenchRecipe<string, CodeBench, string>> = {},
): BenchRecipe<string, CodeBench, string> {
  return {
    logSource: 'PlanRecipe',
    errorId: BENCH_ERROR_ID,
    sampleTarget: 1,
    noRankingsMessage: NO_RANKINGS_MESSAGE,
    rulebook: {
      dataFiles,
      plan: read => read.major_cooldowns[0]?.name ?? null,
      missingMessage: NO_PLAN_MESSAGE,
    },
    parse: ({ ranking }, plan) => Promise.resolve(`${plan}/${ranking.report_code}`),
    bench: ({ parses }, plan) => ({ codes: [...parses, `bench/${plan}`] }),
    ...over,
  };
}

describe('benchFromTopParses rulebook step', () => {
  it('stops with the recipe\'s own message when the rulebook plans nothing, before any WCL call', async () => {
    const wcl = wclFake({ getRankings: async () => { throw new Error('WCL must not be asked'); } });
    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, planRecipe(filesFake(Results.ok(rulebook()))));
    expect(result).toEqual(Results.missing(NO_PLAN_MESSAGE));
  });

  it('propagates a failed rulebook read unchanged, so a spec with no data file reads as its own error', async () => {
    const NOT_INGESTED = 'Not yet ingested.';
    const result = await benchPipeline.benchFromTopParses(wclFake(), QUERY, planRecipe(filesFake(Results.missing(NOT_INGESTED))));
    expect(result).toEqual(Results.missing(NOT_INGESTED));
  });

  it('hands the plan to every parse and to the bench callback', async () => {
    const result = await benchPipeline.benchFromTopParses(wclFake(), QUERY, planRecipe(filesFake(Results.ok(PLANNED_RULEBOOK))));
    expect(result).toEqual(Results.ok({
      spec: SPEC, encounter_id: ENCOUNTER_ID, encounter_name: BOSS_NAME, sample_count: 1,
      codes: [`${PLANNED_COOLDOWN}/r1`, `bench/${PLANNED_COOLDOWN}`],
    }));
  });
});

interface IconBench extends BenchHeader { spell_ids: number[]; ability_icons: AbilityIcons }

function iconRecipe(): BenchRecipe<string, IconBench> {
  return {
    logSource: 'IconRecipe',
    errorId: BENCH_ERROR_ID,
    sampleTarget: 1,
    noRankingsMessage: NO_RANKINGS_MESSAGE,
    iconSpellIds: bench => bench.spell_ids,
    parse: ({ ranking }) => Promise.resolve(ranking.report_code),
    bench: () => ({ spell_ids: [SHADOW_BLADES, CLOAK_OF_SHADOWS] }),
  };
}

describe('benchFromTopParses icon step', () => {
  it('bakes an icon for every spell id the recipe reads off its own bench', async () => {
    const asked: number[][] = [];
    const abilities = abilityLookup();
    const wcl = wclFake({ getAbilities: async (ids: number[]) => { asked.push(ids); return abilities(ids); } });

    const result = await benchPipeline.benchFromTopParses(wcl, QUERY, iconRecipe());

    expect(asked).toEqual([[SHADOW_BLADES, CLOAK_OF_SHADOWS]]);
    expect(result).toEqual(Results.ok({
      spec: SPEC, encounter_id: ENCOUNTER_ID, encounter_name: BOSS_NAME, sample_count: 1,
      spell_ids: [SHADOW_BLADES, CLOAK_OF_SHADOWS],
      ability_icons: {
        [SHADOW_BLADES]: { icon: `icon_${SHADOW_BLADES}`, name: `name_${SHADOW_BLADES}` },
        [CLOAK_OF_SHADOWS]: { icon: `icon_${CLOAK_OF_SHADOWS}`, name: `name_${CLOAK_OF_SHADOWS}` },
      },
    }));
  });
});

describe('spellIdsByName', () => {
  it('maps cooldown + defensive names to spell ids, skipping missing ids', () => {
    expect(benchPipeline.spellIdsByName([
      { name: PLANNED_COOLDOWN, spell_id: SHADOW_BLADES },
      { name: 'NoId', spell_id: 0 },
      { name: 'Cloak', spell_id: CLOAK_OF_SHADOWS },
    ])).toEqual({ [PLANNED_COOLDOWN]: SHADOW_BLADES, 'Cloak': CLOAK_OF_SHADOWS });
  });
});
