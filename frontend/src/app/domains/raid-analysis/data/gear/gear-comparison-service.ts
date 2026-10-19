import { inject, Injectable } from '@angular/core';
import { EncounterGearStats } from '../encounter/encounter.models';
import { SpecTalents, TalentEntry, TalentDiff } from './talent.models';
import { TalentPick } from './talent-key-service';
import { TalentKeyService } from './talent-key-service';
import { EnchantItem, EnchantLeader, GearJudgeService, TalentVerdict } from './gear-judge-service';
import { ENVIRONMENT } from '../../../../../environments/environment-token';

@Injectable({ providedIn: 'root' })
export class GearComparisonService {
  private readonly talentKeys = inject(TalentKeyService);
  private readonly judge = inject(GearJudgeService);
  private readonly environment = inject(ENVIRONMENT);

  slotName(slot: number): string { return SLOT_NAMES[slot] ?? `Slot ${slot}`; }

  rankLabel(index: number, noun: string): string {
    return `${RANK_PREFIXES[index] ?? `${index + 1}th most common`} ${noun}`;
  }

  buildTalentBuilds(stats: EncounterGearStats | null, playerKey: string): TalentBuildRow[] {
    const builds = stats?.talent_builds ?? [];
    if (!builds.length) return [];
    return builds.map((b, i) => ({
      pct: b.pct,
      isPlayer: !!playerKey && b.key === playerKey,
      // Deep-link to the example parse: select the fight, the summary tab, and the player (`source` = their actor id within that report).
      link: `${this.environment.wclReportUrl}/${b.report_code}?fight=${b.fight_id}&type=summary&source=${b.source_id}`,
      playerName: b.player_name,
      label: this.rankLabel(i, 'build'),
      added: (b.diff ?? []).filter(d => d.kind === 'added').map(d => d.talent),
      dropped: (b.diff ?? []).filter(d => d.kind === 'dropped').map(d => d.talent),
      ranks: (b.diff ?? []).filter(d => d.kind === 'rank'),
    }));
  }

  /** The player's differences from the shared talents, each with how many top logs take it; null when nothing differs. */
  buildTalentNodeDiff(verdict: TalentVerdict | null, talents: SpecTalents | null): TalentNodeDiff | null {
    if (!verdict || verdict.onPlan) return null;
    const named = (entryId: number, k: number): TalentNodeRow => ({ talent: this.talentOf(talents ?? {}, entryId), share: `${k} of ${verdict.n} top logs` });
    return {
      missing: verdict.missed.filter(node => node.playerRank === null).map(node => named(node.entryId, node.k)),
      ranks: verdict.missed.flatMap(node => node.playerRank === null ? [] : [{ ...named(node.entryId, node.k), rank: node.playerRank, standardRank: node.rank }]),
      instead: verdict.instead.map(pick => named(pick.entryId, pick.k)),
    };
  }

  private talentOf(talents: SpecTalents, entryId: number): TalentEntry {
    return talents[entryId] ?? { name: `Talent #${entryId}`, icon: '' };
  }

  // A tiered slot reports one entry per rank tier, all named alike, so points belong to the talent, not to any one entry.
  private spendByTalent(picks: TalentPick[], talents: SpecTalents): Map<string, TalentSpend> {
    const spend = new Map<string, TalentSpend>();
    for (const pick of picks) {
      const talent = this.talentOf(talents, pick.entryId);
      const existing = spend.get(talent.name);
      if (existing) {
        existing.points += pick.rank;
        existing.entryIds.add(pick.entryId);
      } else {
        spend.set(talent.name, { talent, points: pick.rank, entryIds: new Set([pick.entryId]) });
      }
    }
    return spend;
  }

  private sameEntries(a: Set<number>, b: Set<number>): boolean {
    return a.size === b.size && [...a].every(entryId => b.has(entryId));
  }

  buildTalentDiff(
    buildKey: string, baselineKey: string, talents: SpecTalents | null,
  ): TalentDiff[] {
    if (!talents) return [];
    const buildPicks = this.talentKeys.parseTalentKey(buildKey);
    const basePicks = this.talentKeys.parseTalentKey(baselineKey);
    if (!buildPicks.length || !basePicks.length) return [];

    const build = this.spendByTalent(buildPicks, talents);
    const baseline = this.spendByTalent(basePicks, talents);
    const diffs: TalentDiff[] = [];
    for (const [name, picked] of build) {
      const standard = baseline.get(name);
      if (!standard) {
        diffs.push({ kind: 'added', talent: picked.talent });
      } else if (standard.points !== picked.points) {
        diffs.push({ kind: 'rank', talent: picked.talent, rank: picked.points, standardRank: standard.points });
      } else if (!this.sameEntries(picked.entryIds, standard.entryIds)) {
        // Same points on different entries of an alike-named choice slot: a swap, not a points change.
        diffs.push({ kind: 'added', talent: picked.talent }, { kind: 'dropped', talent: standard.talent });
      }
    }
    for (const [name, standard] of baseline) {
      if (!build.has(name)) diffs.push({ kind: 'dropped', talent: standard.talent });
    }
    return diffs;
  }

  buildTrinketSets(stats: EncounterGearStats | null, playerKey: string): TrinketSetRow[] {
    return (stats?.trinket_sets ?? []).map((set, i) => ({
      pct: set.pct,
      isPlayer: !!playerKey && this.judge.trinketKey(this.judge.measureTrinkets(set.items)) === playerKey,
      label: this.rankLabel(i, 'pair'),
      items: set.items,
    }));
  }

  buildBenchEnchantRows(leaders: readonly EnchantLeader[]): BenchEnchantRow[] {
    return this.judge.agreedLeaders(leaders).map(leader =>
      ({ slotName: this.slotName(leader.slot), enchant: leader.item, share: `${leader.k} of ${leader.n} top logs` }));
  }

  /** The section's empty state, with the count of top logs behind it. */
  emptyNote(noun: string, n: number, carried: string): string {
    return n ? `No ${noun} data. None of the ${n} top logs ${carried}.` : `No ${noun} data.`;
  }
}

const RANK_PREFIXES = ['Most common', '2nd most common', '3rd most common'];

const SLOT_NAMES: Record<number, string> = {
  0:'Head', 1:'Neck', 2:'Shoulder', 3:'Shirt', 4:'Chest', 5:'Waist', 6:'Legs',
  7:'Feet', 8:'Wrists', 9:'Hands', 10:'Ring 1', 11:'Ring 2',
  12:'Trinket 1', 13:'Trinket 2', 14:'Back', 15:'Main Hand', 16:'Off Hand',
};

export interface TalentBuildRow {
  pct: number;
  isPlayer: boolean;
  link: string;
  playerName: string;
  label: string;
  added: TalentEntry[];
  dropped: TalentEntry[];
  ranks: TalentDiff[];
}

export interface TrinketSetRow {
  pct: number;
  isPlayer: boolean;
  label: string;
  items: { id: number; name: string; icon: string }[];
}

/** A talent with how many of the top logs take it at the shared rank, or at the player's own rank for a pick taken instead. */
interface TalentNodeRow {
  talent: TalentEntry;
  share: string;
  rank?: number;
  standardRank?: number;
}

export interface TalentNodeDiff {
  missing: TalentNodeRow[];
  ranks: TalentNodeRow[];
  instead: TalentNodeRow[];
}

interface TalentSpend {
  talent: TalentEntry;
  points: number;
  entryIds: Set<number>;
}

export interface BenchEnchantRow {
  slotName: string;
  enchant: EnchantItem;
  share: string;
}
