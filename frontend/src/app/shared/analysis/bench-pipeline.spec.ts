import { describe, it, expect } from 'vitest';
import { WclApiService } from '../../core/services/wcl-api';
import { WclRawRanking } from '../../core/models/wcl.models';
import { ok, missing } from '../../core/result';
import { BenchSlice, benchFromTopParses } from './bench-pipeline';

const SPEC = 'SubtletyRogue';
const ENCOUNTER_ID = 3144;
const QUERY = { spec: SPEC, encounterId: ENCOUNTER_ID };
const BOSS_NAME = 'Boss';
const NO_RANKINGS_MESSAGE = 'No top parses for this encounter.';
const TOO_FEW_MESSAGE = 'No fetchable top parses for this encounter.';
const BENCH_ERROR_ID = 'slice.bench';
const CANDIDATE_POOL_COUNT = 20;
const SAMPLE_TARGET = 10;
const FIGHT_MS = 300_000;

/** Candidate `i` ranks player `Pi` on report `ri`, fight `i`, so a report code names the parse it serves. */
function rankingsFor(count: number): WclRawRanking[] {
  return Array.from({ length: count }, (_, index) => ({ name: `P${index + 1}`, report: { code: `r${index + 1}`, fightID: index + 1 } }));
}

function reportFor(index: number) {
  return {
    title: 't',
    fights: [{ id: index, name: BOSS_NAME, startTime: 0, endTime: FIGHT_MS, kill: true, encounterID: ENCOUNTER_ID, friendlyPlayers: [] }],
    masterData: { actors: [{ id: index * 10, name: `P${index}`, subType: 'Rogue', server: '' }], abilities: [] },
  };
}

const codeOf = (report: string): number => Number(report.slice(1));

function wclFake(
  over: { rankings?: WclRawRanking[]; getRankings?: () => Promise<unknown>; getReport?: (code: string) => Promise<unknown> } = {},
): WclApiService {
  return {
    getRankings: over.getRankings ?? (async () => ({ rankings: over.rankings ?? rankingsFor(CANDIDATE_POOL_COUNT) })),
    getReport: over.getReport ?? (async (code: string) => reportFor(codeOf(code))),
  } as unknown as WclApiService;
}

/** The slice under composition bakes the report code of every accepted parse, so acceptance order and backfill are both readable off the bench. */
interface CodeBench { encounterName: string; codes: string[] }

function codeSlice(over: Partial<BenchSlice<string, CodeBench>> = {}): BenchSlice<string, CodeBench> {
  return {
    logSource: 'CodeSlice',
    errorId: BENCH_ERROR_ID,
    candidatePoolCount: CANDIDATE_POOL_COUNT,
    sampleTarget: SAMPLE_TARGET,
    minSamples: 1,
    noRankingsMessage: NO_RANKINGS_MESSAGE,
    tooFewParsesMessage: accepted => `${TOO_FEW_MESSAGE} (${accepted})`,
    parse: ({ ranking }) => Promise.resolve(ranking.report_code),
    bench: ({ encounterName, parses }) => ({ encounterName, codes: parses }),
    ...over,
  };
}

describe('benchFromTopParses', () => {
  it('hands the slice every accepted parse in acceptance order, named by the first fight', async () => {
    const CANDIDATES = 2;
    const result = await benchFromTopParses(wclFake({ rankings: rankingsFor(CANDIDATES) }), QUERY, codeSlice());
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r1', 'r2'] }));
  });

  it('stops fetching once the slice\'s sample target is met', async () => {
    const TARGET = 2;
    const fetched: string[] = [];
    const wcl = wclFake({
      getReport: async (code: string) => { fetched.push(code); return reportFor(codeOf(code)); },
    });
    const result = await benchFromTopParses(wcl, QUERY, codeSlice({ sampleTarget: TARGET }));
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r1', 'r2'] }));
    expect(fetched).toEqual(['r1', 'r2']);
  });

  it('backfills past a report WCL will not serve', async () => {
    const TARGET = 2;
    const PRIVATE_CODE = 'r1';
    const wcl = wclFake({
      getReport: async (code: string) => {
        if (code === PRIVATE_CODE) throw new Error('You do not have permission to view this report.');
        return reportFor(codeOf(code));
      },
    });
    const result = await benchFromTopParses(wcl, QUERY, codeSlice({ sampleTarget: TARGET }));
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r2', 'r3'] }));
  });

  it('backfills past a candidate the slice itself rejects', async () => {
    const TARGET = 2;
    const REJECTED_CODE = 'r2';
    const slice = codeSlice({
      sampleTarget: TARGET,
      parse: ({ ranking }) => Promise.resolve(ranking.report_code === REJECTED_CODE ? null : ranking.report_code),
    });
    const result = await benchFromTopParses(wclFake(), QUERY, slice);
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r1', 'r3'] }));
  });

  it('backfills past a report the ranked player is absent from', async () => {
    const TARGET = 1;
    const ANONYMOUS_CODE = 'r1';
    const wcl = wclFake({
      getReport: async (code: string) => {
        const report = reportFor(codeOf(code));
        return code === ANONYMOUS_CODE ? { ...report, masterData: { ...report.masterData, actors: [] } } : report;
      },
    });
    const result = await benchFromTopParses(wcl, QUERY, codeSlice({ sampleTarget: TARGET }));
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r2'] }));
  });

  it('backfills past a report that never ran the ranked fight', async () => {
    const TARGET = 1;
    const OTHER_FIGHT_CODE = 'r1';
    const UNRANKED_FIGHT_ID = 99;
    const wcl = wclFake({
      getReport: async (code: string) => {
        if (code !== OTHER_FIGHT_CODE) return reportFor(codeOf(code));
        const report = reportFor(codeOf(code));
        return { ...report, fights: report.fights.map(fight => ({ ...fight, id: UNRANKED_FIGHT_ID })) };
      },
    });
    const result = await benchFromTopParses(wcl, QUERY, codeSlice({ sampleTarget: TARGET }));
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r2'] }));
  });

  it('reports an empty ranking pool as missing, without touching a report', async () => {
    const result = await benchFromTopParses(wclFake({ rankings: [] }), QUERY, codeSlice());
    expect(result).toEqual(missing(NO_RANKINGS_MESSAGE));
  });

  it('benches a pool that exactly meets the slice\'s floor', async () => {
    const FLOOR = 2;
    const result = await benchFromTopParses(
      wclFake({ rankings: rankingsFor(FLOOR) }), QUERY, codeSlice({ minSamples: FLOOR }));
    expect(result).toEqual(ok({ encounterName: BOSS_NAME, codes: ['r1', 'r2'] }));
  });

  it('reports a pool one parse short of the floor as missing, counting the usable parses', async () => {
    const FLOOR = 2;
    const USABLE = FLOOR - 1;
    const result = await benchFromTopParses(
      wclFake({ rankings: rankingsFor(USABLE) }), QUERY, codeSlice({ minSamples: FLOOR }));
    expect(result).toEqual(missing(`${TOO_FEW_MESSAGE} (${USABLE})`));
  });

  it('tags a WCL failure with the slice\'s repro id instead of a silent empty bench', async () => {
    const wcl = wclFake({ getRankings: async () => { throw new Error('WCL exploded'); } });
    const result = await benchFromTopParses(wcl, QUERY, codeSlice());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'permanent', id: BENCH_ERROR_ID });
  });

  it('samples the partition it was handed', async () => {
    const RESOLVED_PARTITION = 2;
    const asked: (number | null | undefined)[] = [];
    const wcl = {
      getRankings: async (_spec: string, _encounterId: number, partition?: number | null) => {
        asked.push(partition);
        return { rankings: [] };
      },
    } as unknown as WclApiService;
    await benchFromTopParses(wcl, { ...QUERY, partition: RESOLVED_PARTITION }, codeSlice());
    await benchFromTopParses(wcl, QUERY, codeSlice());
    expect(asked).toEqual([RESOLVED_PARTITION, undefined]);
  });
});
