import { describe, it, expect } from 'vitest';
import { WclApiService } from '../wcl/wcl-api-service';
import { FixtureRanking, parseRankings } from '../../../../../testing/builders/wcl-fixtures';
import { MIN_SAMPLE_COUNT, TopParseSelectionService } from './top-parse-selection-service';
import { parseRanking } from '../../../../../testing/builders/bench-sources';
import type { RankingMetric } from '../wcl/wcl.models';
import { TestBed } from '@angular/core/testing';

const topParses = TestBed.inject(TopParseSelectionService);

const SPEC = 'SubtletyRogue';
const HEALER_SPEC = 'HolyPriest';
const ONE_SHORT = MIN_SAMPLE_COUNT - 1;
const ENCOUNTER_ID = 3144;
const NEWEST_PARTITION = 3;
const PREVIOUS_PARTITION = 2;
/** The sampled top 10 plus 10 spare, the depth the module owns. */
const POOL_DEPTH = 20;

function wclFake(rankingsFor: (partition: number | null) => FixtureRanking[]): {
  api: WclApiService; asked: (number | null)[]; metrics: RankingMetric[];
} {
  const asked: (number | null)[] = [];
  const metrics: RankingMetric[] = [];
  const api = {
    getRankings: async (_spec: string, _encounterId: number, partition: number | null, metric: RankingMetric) => {
      asked.push(partition);
      metrics.push(metric);
      return { rankings: rankingsFor(partition) };
    },
  } as unknown as WclApiService;
  return { api, asked, metrics };
}

describe('resolveTopParses', () => {
  it('falls back past a newest partition one log short of the floor, with the older rows mapped to their rankings', async () => {
    const { api, asked } = wclFake(partition => parseRankings(partition === NEWEST_PARTITION ? ONE_SHORT : MIN_SAMPLE_COUNT));

    const selection = await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID, [NEWEST_PARTITION, PREVIOUS_PARTITION]);

    expect(asked).toEqual([NEWEST_PARTITION, PREVIOUS_PARTITION]);
    expect(selection[0]).toEqual(parseRanking({ rank: 1 }));
    expect(selection).toHaveLength(MIN_SAMPLE_COUNT);
  });

  it('stops at a newest partition holding exactly the floor, leaving the older ones unqueried', async () => {
    const { api, asked } = wclFake(() => parseRankings(MIN_SAMPLE_COUNT));

    const selection = await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID, [NEWEST_PARTITION, PREVIOUS_PARTITION]);

    expect(asked).toEqual([NEWEST_PARTITION]);
    expect(selection).toHaveLength(MIN_SAMPLE_COUNT);
  });

  it('keeps the newest non-empty pool when no partition reaches the floor, so the bench can say how few it had', async () => {
    const { api } = wclFake(partition => (partition === NEWEST_PARTITION ? [] : parseRankings(ONE_SHORT)));

    const selection = await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID, [NEWEST_PARTITION, PREVIOUS_PARTITION]);

    expect(selection).toHaveLength(ONE_SHORT);
  });

  it('ranks a healer on healing and every other spec on damage', async () => {
    const healer = wclFake(() => parseRankings(MIN_SAMPLE_COUNT));
    const damage = wclFake(() => parseRankings(MIN_SAMPLE_COUNT));

    await topParses.resolveTopParses(healer.api, HEALER_SPEC, ENCOUNTER_ID);
    await topParses.resolveTopParses(damage.api, SPEC, ENCOUNTER_ID);

    expect(healer.metrics).toEqual(['hps']);
    expect(damage.metrics).toEqual(['dps']);
  });

  it('makes one unpartitioned attempt when no partition is named, which is WCL\'s own default', async () => {
    const { api, asked } = wclFake(() => parseRankings(MIN_SAMPLE_COUNT));

    const selection = await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID);

    expect(asked).toEqual([null]);
    expect(selection).toHaveLength(MIN_SAMPLE_COUNT);
  });

  it('resolves an empty pool when every partition is empty', async () => {
    const { api } = wclFake(() => []);

    expect(await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID, [NEWEST_PARTITION, PREVIOUS_PARTITION])).toEqual([]);
  });

  it('keeps a ranking list that exactly fills the pool depth', async () => {
    const { api } = wclFake(() => parseRankings(POOL_DEPTH));

    const selection = await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID);

    expect(selection).toHaveLength(POOL_DEPTH);
  });

  it('cuts one ranked parse past the pool depth, so the pool never outgrows the depth it reports', async () => {
    const ONE_OVER_DEPTH = POOL_DEPTH + 1;
    const { api } = wclFake(() => parseRankings(ONE_OVER_DEPTH));

    const selection = await topParses.resolveTopParses(api, SPEC, ENCOUNTER_ID);

    expect(selection).toHaveLength(POOL_DEPTH);
    expect(selection.map(row => row.report_code).at(-1)).toBe(`r${POOL_DEPTH}`);
  });
});
