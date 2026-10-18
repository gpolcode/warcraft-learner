import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BenchStripService } from './bench-strip-service';
import type { BenchHeader } from './bench-pipeline-service';
import { parseRanking } from '../../../../../testing/builders/bench-sources';

const strips = TestBed.inject(BenchStripService);

const BENCHED_AT_S = 1_792_324_800;
const FAST_KILL_S = 298;
const SLOW_KILL_S = 372;
const LOW_ITEM_LEVEL = 718.4;
const HIGH_ITEM_LEVEL = 723.6;
const LOW_AMOUNT = 241_000;
const HIGH_AMOUNT = 258_000;

function header(over: Partial<BenchHeader> = {}): BenchHeader {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', metric: 'dps', ingested_at_s: BENCHED_AT_S,
    sample_count: 2,
    sources: [
      parseRanking({ rank: 1, duration_s: SLOW_KILL_S, item_level: HIGH_ITEM_LEVEL, amount: HIGH_AMOUNT }),
      parseRanking({ rank: 4, duration_s: FAST_KILL_S, item_level: LOW_ITEM_LEVEL, amount: LOW_AMOUNT }),
    ],
    ...over,
  };
}

describe('BenchStripService', () => {
  it('spans the ranks, whole item levels and kill times of the top logs, with the count and the bench date', () => {
    expect(strips.strip(header())).toEqual({
      count: 2, healing: false,
      ranks: { lo: 1, hi: 4 }, itemLevels: { lo: 718, hi: 724 }, killS: { lo: FAST_KILL_S, hi: SLOW_KILL_S }, benchedAtS: BENCHED_AT_S,
    });
  });

  it('marks a bench ranked on healing', () => {
    expect(strips.strip(header({ metric: 'hps' }))?.healing).toBe(true);
  });

  it('draws no strip for a bench an older ingest wrote without its sources', () => {
    const { sources: _dropped, ...older } = header();
    expect(strips.strip(older as BenchHeader)).toBeNull();
    expect(strips.amountRange(older as BenchHeader)).toBeNull();
  });

  it('leaves a fact out where no top log\'s ranking carried it, and the date where ingest stamped none', () => {
    const bare = header({ sources: [parseRanking({ item_level: null, duration_s: null })], ingested_at_s: undefined });
    expect(strips.strip(bare)).toMatchObject({ itemLevels: null, killS: null, benchedAtS: null });
  });

  it('spans the ranked figure over the top logs that carried one', () => {
    const oneBlank = header({ sources: [...header().sources, parseRanking({ rank: 7, amount: null })] });
    expect(strips.amountRange(oneBlank)).toEqual({ lo: LOW_AMOUNT, hi: HIGH_AMOUNT });
  });
});
