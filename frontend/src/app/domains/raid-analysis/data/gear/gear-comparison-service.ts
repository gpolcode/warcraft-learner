import { inject, Injectable } from '@angular/core';
import { CharacterGear } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { SpecTalents, TalentEntry, TalentDiff } from './talent.models';
import { TalentPick } from './talent-key-service';
import { TalentKeyService } from './talent-key-service';

@Injectable({ providedIn: 'root' })
export class GearComparisonService {
  private readonly talentKeys = inject(TalentKeyService);

  private slotName(slot: number): string { return SLOT_NAMES[slot] ?? `Slot ${slot}`; }

  private enchantLabel(enchant: { id: number; name: string } | undefined): string {
    return enchant ? (enchant.name || `Enchant #${enchant.id}`) : '';
  }

  private enchantRowFor(name: string, player: PlayerEnchant | undefined, top: TopEnchant | undefined): EnchantRow | null {
    const topName = this.enchantLabel(top);
    if (!player) {
      if (!top || top.pct < ENCHANT_CONSENSUS_PCT) return null;
      return { slotName: name, status: 'warn', name: 'Not enchanted',
        note: `Most top raiders run ${topName}. Apply it.` };
    }
    const playerName = this.enchantLabel(player);
    if (top && player.id !== top.id) {
      return { slotName: name, status: 'info', name: playerName,
        note: `Most top raiders run ${topName}.` };
    }
    return { slotName: name, status: 'ok', name: playerName, note: null };
  }

  /** Flags slots the player left un-enchanted that top parsers consider mandatory, and surfaces where the player differs from the consensus enchant. */
  buildEnchantRows(gear: CharacterGear, stats: EncounterGearStats | null): EnchantRow[] {
    const topEnch = stats?.enchants ?? {};
    const playerEnch = gear.enchants ?? [];
    if (!Object.keys(topEnch).length && !playerEnch.length) return [];
    const slots = new Set<number>();
    for (const k of Object.keys(topEnch)) slots.add(Number(k));
    for (const e of playerEnch) slots.add(e.slot);

    return [...slots]
      .sort((a, b) => a - b)
      .map(slot => this.enchantRowFor(this.slotName(slot), playerEnch.find(e => e.slot === slot), topEnch[slot]?.[0]))
      .filter(row => row !== null);
  }

  enchantStatusOf(rows: EnchantRow[]): GearStatus {
    return rows.some(r => r.status === 'warn') ? 'warn' : 'ok';
  }

  /** Top-parse talent builds with a link to an example parse using each one. */
  buildTalentBuilds(stats: EncounterGearStats | null, playerKey: string): TalentBuildRow[] {
    const builds = stats?.talent_builds ?? [];
    if (!builds.length) return [];
    return builds.map((b, i) => ({
      pct: b.pct,
      isPlayer: !!playerKey && b.key === playerKey,
      // Deep-link to the example parse: select the fight, the summary tab, and the player (`source` = their actor id within that report).
      link: `https://www.warcraftlogs.com/reports/${b.report_code}?fight=${b.fight_id}&type=summary&source=${b.source_id}`,
      playerName: b.player_name,
      label: i === 0 ? 'Most common build' : `Alt build ${i}`,
      // Benches from the prior ingest have no diff field on disk.
      added: (b.diff ?? []).filter(d => d.kind === 'added').map(d => d.talent),
      dropped: (b.diff ?? []).filter(d => d.kind === 'dropped').map(d => d.talent),
      ranks: (b.diff ?? []).filter(d => d.kind === 'rank'),
    }));
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

  talentStatusOf(topStats: EncounterGearStats | null, playerKey: string): { status: GearStatus; note: string } {
    const builds = topStats?.talent_builds ?? [];
    const [topBuild] = builds;
    if (!topBuild) return { status: 'unknown', note: 'No talent data.' };
    if (playerKey.split(':')[0] !== topBuild.key.split(':')[0]) {
      return { status: 'unknown', note: 'No talent data.' };
    }
    if (topBuild.key === playerKey) {
      return { status: 'ok', note: 'Standard build.' };
    }
    const altIndex = builds.findIndex(b => b.key === playerKey);
    const altBuild = altIndex > 0 ? builds[altIndex] : undefined;
    if (altBuild) {
      return { status: 'info', note: `Alt build ${altIndex}. ${altBuild.pct}% use this build.` };
    }
    return { status: 'warn', note: `Off-meta build. ${topBuild.pct}% use the standard one.` };
  }

  /** Sorted-id identity of a worn trinket combination, so two parses using the same trinkets in opposite slots share one key. */
  trinketSetKey(trinkets: { id: number }[]): string {
    return trinkets.map(trinket => trinket.id).sort((a, b) => a - b).join('-');
  }

  /** The trinket combinations top parsers use, most common first. */
  buildTrinketSets(stats: EncounterGearStats | null, playerKey: string): TrinketSetRow[] {
    return (stats?.trinket_sets ?? []).map((set, i) => ({
      pct: set.pct,
      isPlayer: !!playerKey && this.trinketSetKey(set.items) === playerKey,
      label: i === 0 ? 'Most common pair' : `Alt pair ${i}`,
      items: set.items,
    }));
  }

  trinketStatusOf(stats: EncounterGearStats | null, playerKey: string): { status: GearStatus; note: string } {
    const sets = stats?.trinket_sets ?? [];
    const [topSet] = sets;
    if (!topSet || !playerKey) return { status: 'unknown', note: 'No trinket data.' };
    if (this.trinketSetKey(topSet.items) === playerKey) {
      return { status: 'ok', note: 'Standard pair.' };
    }
    const altIndex = sets.findIndex(set => this.trinketSetKey(set.items) === playerKey);
    const altSet = altIndex > 0 ? sets[altIndex] : undefined;
    if (altSet) {
      return { status: 'info', note: `Alt pair ${altIndex}. ${altSet.pct}% use this pair.` };
    }
    return { status: 'warn', note: `Off-meta pair. ${topSet.pct}% use the standard one.` };
  }

  /** Shows the consensus enchant per slot for the boss-study view; omits slots below the top-parse consensus share. */
  buildBenchEnchantRows(stats: EncounterGearStats | null): BenchEnchantRow[] {
    const topEnch = stats?.enchants ?? {};
    return Object.keys(topEnch)
      .map(Number)
      .sort((a, b) => a - b)
      .reduce<BenchEnchantRow[]>((acc, slot) => {
        const top = topEnch[slot]?.[0];
        if (top && top.pct >= ENCHANT_CONSENSUS_PCT) {
          acc.push({ slotName: this.slotName(slot), name: top.name || `Enchant #${top.id}` });
        }
        return acc;
      }, []);
  }
}

export type GearStatus = 'ok' | 'warn' | 'info' | 'unknown';

/** A slot counts as consensus-enchanted, and an un-enchanted one warns, at this top-parse share. */
const ENCHANT_CONSENSUS_PCT = 50;

const SLOT_NAMES: Record<number, string> = {
  0:'Head', 1:'Neck', 2:'Shoulder', 3:'Shirt', 4:'Chest', 5:'Waist', 6:'Legs',
  7:'Feet', 8:'Wrists', 9:'Hands', 10:'Ring 1', 11:'Ring 2',
  12:'Trinket 1', 13:'Trinket 2', 14:'Back', 15:'Main Hand', 16:'Off Hand',
};

export interface EnchantRow {
  slotName: string;
  status: GearStatus;
  name: string;
  note: string | null;
}

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

// The comparison builders below take a real `CharacterGear` (never null); the bench-only view uses the dedicated `buildBench*` builders instead, so a not-yet-loaded player never renders "Not enchanted".

type TopEnchant = EncounterGearStats['enchants'][number][number];
type PlayerEnchant = NonNullable<CharacterGear['enchants']>[number];

interface TalentSpend {
  talent: TalentEntry;
  points: number;
  entryIds: Set<number>;
}

export interface BenchEnchantRow {
  slotName: string;
  name: string;
}
