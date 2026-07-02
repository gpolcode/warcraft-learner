/**
 * View-model rows for the contextual "Sources" section: the top parses an analysis was
 * benchmarked against, and the guides its coaching rulebook was built from. Both credit
 * the work behind the feedback and link out so a user can open them. The rows are baked
 * ready-to-render into the credits bench (see `credits-data-source.ts`).
 */

/** One top parse the encounter's benchmarks drew from, with a WCL deep-link to the log. */
export interface TopParseCredit {
  /** 1-based rank in the top-parse set (its order in the WCL leaderboard). */
  rank: number;
  player: string;
  report_code: string;
  fight_id: number;
  /** WCL report deep-link, opened in a new tab. */
  link: string;
}

/** One guide a spec's rulebook was generated from, with a human label and its URL. */
export interface RulebookSource {
  url: string;
  /** 'web' | 'youtube' | 'simc' - the scraped guide kind. */
  guide_type: string;
  /** Cheap derived label (domain for web, host + id for YouTube, SimulationCraft for simc). */
  label: string;
}
