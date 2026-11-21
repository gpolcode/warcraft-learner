import { describe, it, expect } from 'vitest';
import { BenchStripCaption } from './bench-strip';
import type { BenchStrip } from '../data/analysis/bench-strip-service';
import { mountDom } from '../../../../testing/component-harness';

// Benched at noon UTC on 18 Oct 2026, so every time zone reads the same day.
const BENCHED_AT_S = 1_792_324_800;

const TEN_LOGS: BenchStrip = {
  count: 10, healing: false,
  ranks: { lo: 1, hi: 12 }, itemLevels: { lo: 718, hi: 724 }, killS: { lo: 298, hi: 372 }, benchedAtS: BENCHED_AT_S,
};

function sentences(strip: BenchStrip): string[] {
  return mountDom(BenchStripCaption, { strip }).textAll(':scope > span');
}

describe('BenchStripCaption', () => {
  it('names how many top logs, their ranks, item levels and kill times, then when they were benched', () => {
    expect(sentences(TEN_LOGS)).toEqual([
      'Compared with 10 top logs, ranks 1 to 12, item level 718 to 724, kill times 4:58 to 6:12.',
      'Benched 18 Oct 2026.',
    ]);
  });

  it('says a healer\'s top logs are ranked on healing', () => {
    expect(sentences({ ...TEN_LOGS, healing: true })[0]).toBe(
      'Compared with 10 top logs ranked on healing, ranks 1 to 12, item level 718 to 724, kill times 4:58 to 6:12.');
  });

  it('prints one value where every top log shares it, and leaves out a fact no ranking carried', () => {
    const one: BenchStrip = { count: 1, healing: false, ranks: { lo: 3, hi: 3 }, itemLevels: null, killS: { lo: 300, hi: 300 }, benchedAtS: null };
    expect(sentences(one)).toEqual(['Compared with 1 top log, rank 3, kill time 5:00.']);
  });
});
