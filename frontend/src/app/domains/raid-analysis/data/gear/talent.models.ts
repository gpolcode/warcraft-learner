export interface TalentEntry {
  name: string;
  icon: string;
  /** Absent for hero-tree picks, which have no spell behind them. */
  spellId?: number;
}

export type SpecTalents = Record<string, TalentEntry>;

type TalentDiffKind = 'added' | 'dropped' | 'rank';

export interface TalentDiff {
  kind: TalentDiffKind;
  talent: TalentEntry;
  rank?: number;
  standardRank?: number;
}
