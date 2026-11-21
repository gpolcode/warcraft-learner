import { Injectable } from '@angular/core';
import { extent } from 'd3-array';
import type { BenchHeader } from './bench-pipeline-service';
import type { ParseRanking } from '../wcl/wcl.models';

export interface ValueRange {
  lo: number;
  hi: number;
}

/** Who a card was compared with; a null range is a fact no top log's ranking carried. */
export interface BenchStrip {
  count: number;
  healing: boolean;
  ranks: ValueRange | null;
  itemLevels: ValueRange | null;
  killS: ValueRange | null;
  benchedAtS: number | null;
}

@Injectable({ providedIn: 'root' })
export class BenchStripService {
  /** Null for a bench an older ingest wrote, which names no sources until the next ingest re-benches it. */
  strip(bench: BenchHeader): BenchStrip | null {
    const stored: Partial<BenchHeader> = bench;
    const { sources } = stored;
    if (!sources) return null;
    return {
      count: bench.sample_count,
      healing: bench.metric === 'hps',
      ranks: this.range(sources.map(source => source.rank)),
      itemLevels: this.range(this.known(sources, 'item_level'), Math.round),
      killS: this.range(this.known(sources, 'duration_s')),
      benchedAtS: bench.ingested_at_s ?? null,
    };
  }

  /** The ranked figure over the top logs, every one a kill. */
  amountRange(bench: BenchHeader): ValueRange | null {
    const stored: Partial<BenchHeader> = bench;
    return stored.sources ? this.range(this.known(stored.sources, 'amount')) : null;
  }

  private known(sources: ParseRanking[], fact: 'item_level' | 'duration_s' | 'amount'): number[] {
    return sources.flatMap(source => source[fact] ?? []);
  }

  private range(values: number[], shape: (value: number) => number = value => value): ValueRange | null {
    const bounds = extent(values);
    if (bounds[0] === undefined) return null;
    const [lo, hi] = bounds;
    return { lo: shape(lo), hi: shape(hi) };
  }
}
