import type { ParseRanking } from '../../app/domains/raid-analysis/data/wcl/wcl.models';

/** A ranked parse at `rank`, its facts held at one value so a spec overrides only the field it is about. */
export function parseRanking(over: Partial<ParseRanking> = {}): ParseRanking {
  const rank = over.rank ?? 1;
  return {
    player: `P${rank}`, server: '', report_code: `r${rank}`, fight_id: rank, rank,
    amount: 250_000, duration_s: 300, item_level: 720, started_at_s: 1_790_000_000,
    ...over,
  };
}

/** `count` top parses ranked 1 to `count`, the shape every sampled bench header bakes. */
export function benchSources(count: number): ParseRanking[] {
  return Array.from({ length: count }, (_unused, offset) => parseRanking({ rank: offset + 1 }));
}
