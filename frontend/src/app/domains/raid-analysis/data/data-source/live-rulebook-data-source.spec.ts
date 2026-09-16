import { describe, it, expect } from 'vitest';
import { LiveRulebookDataSource } from './live-rulebook-data-source';
import type { RulebookDataSource } from './data-source';
import type { LiveRulebookService } from '../rulebook-build/live-rulebook-service';
import type { WclApiService } from '../wcl/wcl-api-service';
import type { Rulebook } from '../rulebook/rulebook.models';
import type { SimcTier } from '../simc/simc.models';
import { Results } from '../../../shared/util-http/result';
import { rulebook } from '../../../../../testing/builders/rulebook';

const SPEC = 'SubtletyRogue';
const NEXUS_KING = 3129;
const TIER: SimcTier = { branch: 'midnight', dir: 'MID2' };
const BENCH = { spec: SPEC };
const DERIVED = rulebook({ spec: SPEC });

function source(tier: SimcTier | null) {
  const received: (Rulebook | null)[] = [];
  let asks = 0;
  const transform: RulebookDataSource<typeof BENCH> = {
    getBench: async (_spec, _encounterId, _selection, book) => { received.push(book); return Results.ok(BENCH); },
  };
  const rulebooks = { rulebookFor: async () => { asks += 1; return DERIVED; } } as unknown as LiveRulebookService;
  return { data: new LiveRulebookDataSource(transform, rulebooks, {} as WclApiService, tier), received, asks: () => asks };
}

describe('LiveRulebookDataSource.getBench', () => {
  it('hands the encounter\'s derived rulebook to the transform', async () => {
    const { data, received } = source(TIER);
    expect(await data.getBench(SPEC, NEXUS_KING)).toEqual(Results.ok(BENCH));
    expect(received).toEqual([DERIVED]);
  });

  it('benches on the log alone when the run names no tier to derive against', async () => {
    const { data, received, asks } = source(null);
    await data.getBench(SPEC, NEXUS_KING);
    expect(received).toEqual([null]);
    expect(asks()).toBe(0);
  });
});
