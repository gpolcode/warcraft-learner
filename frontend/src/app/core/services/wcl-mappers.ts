/**
 * Pure mapping/transformation functions for WCL API responses.
 *
 * These functions have no side effects and no Angular/HTTP dependencies.
 * They belong here and not inside the transport service so the API contract
 * can evolve independently of the application models.
 */
import type { CharacterGear } from '../models/wcl.models';

// ---------------------------------------------------------------------------
// Internal WCL response shapes (not part of the application model)
// ---------------------------------------------------------------------------

export interface WclGearItem {
  id?: number | string;
  name?: string;
  icon?: string;
  permanentEnchant?: number | string;
  permanentEnchantName?: string;
}

export interface WclRankEntry {
  startTime?: number;
  spec?: string;
  class?: number;
  report?: { code?: string };
  gear?: WclGearItem[];
}

export interface PlayerDetailEntry {
  id: number;
  type: string;
  name: string;
  specs?: Array<{ spec: string }>;
}
export type PlayerDetailGroups = Record<string, PlayerDetailEntry[]>;

/** One raw `characterRankings` entry (the fields the burst transform needs). */
export interface WclRawRanking {
  name?: string;
  report?: { code?: string; fightID?: number };
}

/** A mapped top parse: which report + fight + player to refetch. */
export interface ParseRanking {
  player: string;
  report_code: string;
  fight_id: number;
}

// ---------------------------------------------------------------------------
// WCL class-ID → spec-folder-name map
// ---------------------------------------------------------------------------

/** WCL numeric class ID → class name used in the spec folder path. */
export const CLASS_NAMES: Record<number, string> = {
  1: 'DeathKnight', 2: 'Druid', 3: 'Hunter', 4: 'Mage', 5: 'Monk',
  6: 'Paladin', 7: 'Priest', 8: 'Rogue', 9: 'Shaman', 10: 'Warlock',
  11: 'Warrior', 12: 'DemonHunter', 13: 'Evoker',
};

/** WCL spec folder name → [WCL className, WCL specName] for the rankings query. */
export const SPEC_TO_WCL: Record<string, [string, string]> = {
  RetributionPaladin: ['Paladin', 'Retribution'], HolyPaladin: ['Paladin', 'Holy'], ProtectionPaladin: ['Paladin', 'Protection'],
  FireMage: ['Mage', 'Fire'], ArcaneMage: ['Mage', 'Arcane'], FrostMage: ['Mage', 'Frost'],
  HavocDemonHunter: ['DemonHunter', 'Havoc'], VengeanceDemonHunter: ['DemonHunter', 'Vengeance'],
  FuryWarrior: ['Warrior', 'Fury'], ArmsWarrior: ['Warrior', 'Arms'], ProtectionWarrior: ['Warrior', 'Protection'],
  UnholyDeathKnight: ['DeathKnight', 'Unholy'], FrostDeathKnight: ['DeathKnight', 'Frost'], BloodDeathKnight: ['DeathKnight', 'Blood'],
  BalanceDruid: ['Druid', 'Balance'], FeralDruid: ['Druid', 'Feral'], GuardianDruid: ['Druid', 'Guardian'], RestorationDruid: ['Druid', 'Restoration'],
  BeastMasteryHunter: ['Hunter', 'BeastMastery'], MarksmanshipHunter: ['Hunter', 'Marksmanship'], SurvivalHunter: ['Hunter', 'Survival'],
  BrewmasterMonk: ['Monk', 'Brewmaster'], WindwalkerMonk: ['Monk', 'Windwalker'], MistweaverMonk: ['Monk', 'Mistweaver'],
  DisciplinePriest: ['Priest', 'Discipline'], HolyPriest: ['Priest', 'Holy'], ShadowPriest: ['Priest', 'Shadow'],
  AssassinationRogue: ['Rogue', 'Assassination'], OutlawRogue: ['Rogue', 'Outlaw'], SubtletyRogue: ['Rogue', 'Subtlety'],
  ElementalShaman: ['Shaman', 'Elemental'], EnhancementShaman: ['Shaman', 'Enhancement'], RestorationShaman: ['Shaman', 'Restoration'],
  AfflictionWarlock: ['Warlock', 'Affliction'], DemonologyWarlock: ['Warlock', 'Demonology'], DestructionWarlock: ['Warlock', 'Destruction'],
  DevastationEvoker: ['Evoker', 'Devastation'], PreservationEvoker: ['Evoker', 'Preservation'], AugmentationEvoker: ['Evoker', 'Augmentation'],
};

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

/** Normalize a WCL gear icon ("inv_x.jpg") to the bare filename used by zamimg. */
export function iconFile(icon?: string): string {
  return (icon ?? '').replace(/\.jpg$/i, '');
}

/**
 * Build the player-id -> spec-string map from a `playerDetails` response.
 * Also populates `name_<id>` entries for player-name lookups.
 */
export function buildSpecMap(groups: PlayerDetailGroups): Record<number | string, string> {
  const map: Record<number | string, string> = {};
  for (const role of ['dps', 'healers', 'tanks', 'unknown']) {
    for (const player of (groups[role] ?? [])) {
      const className = (player.type ?? '').replace(/ /g, '');
      const spec = ((player.specs ?? [])[0]?.spec ?? '').replace(/ /g, '');
      if (spec && className) map[player.id] = spec + className;
      if (player.name) map[`name_${player.id}`] = player.name;
    }
  }
  return map;
}

/** Extract trinkets and enchants from a ranking's combatant info. */
export function extractGear(entry: WclRankEntry): {
  trinkets: NonNullable<CharacterGear['trinkets']>;
  enchants: NonNullable<CharacterGear['enchants']>;
} {
  const trinkets: NonNullable<CharacterGear['trinkets']> = [];
  const enchants: NonNullable<CharacterGear['enchants']> = [];

  (entry.gear ?? []).forEach((item, slotIndex) => {
    if (item?.id == null) return;
    const itemId = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id;

    if (slotIndex === 12 || slotIndex === 13) {
      trinkets.push({ slot: slotIndex, id: itemId, name: item.name ?? '', icon: iconFile(item.icon) });
    }

    const enchant = item.permanentEnchant;
    if (enchant) {
      const enchantId = typeof enchant === 'string' ? parseInt(enchant, 10) : enchant;
      enchants.push({ slot: slotIndex, id: enchantId, name: item.permanentEnchantName ?? '' });
    }
  });

  return { trinkets, enchants };
}

/**
 * Build a `v2:`-prefixed talent key from a CombatantInfo `talentTree` array.
 * The key is the sorted (string order, no dedup) nodeIDs, matching the
 * representation that ingestion builds from the same source.
 */
export function talentKeyFromTree(tree: Array<{ nodeID?: number }> | undefined): string {
  if (!tree?.length) return '';
  const ids = tree.filter(n => n.nodeID != null).map(n => String(n.nodeID));
  if (!ids.length) return '';
  return 'v2:' + ids.sort().join(',');
}

// WCL replaces a privacy-anonymized parse's player name with "Character <id>-<id>",
// which can never match a report actor (real names are letters only), so the parse
// is unfetchable. Drop these before mapping.
const ANONYMIZED_NAME = /^Character \d+-\d+$/;
export function isAnonymizedPlayerName(name: string): boolean {
  return ANONYMIZED_NAME.test(name);
}

/** Map raw rankings to the top `count` fetchable parses (report + fight + player). */
export function mapRankings(rawRankings: WclRawRanking[], count: number): ParseRanking[] {
  return rawRankings
    .filter(ranking => ranking.report?.code && !isAnonymizedPlayerName(ranking.name ?? ''))
    .slice(0, count)
    .map(ranking => ({
      player: ranking.name ?? '',
      report_code: ranking.report?.code ?? '',
      fight_id: ranking.report?.fightID ?? 0,
    }));
}

/** Decode HTML entities in a string returned by WCL's gameData queries. */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
