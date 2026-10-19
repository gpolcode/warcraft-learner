import { inject, Injectable } from '@angular/core';
import { CharacterGear, WclTalentNode } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { FamilyCaps, Tone, TONE_LEVELS } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { getOrInsert } from '../analysis/analysis-math';
import { RING_SLOTS } from './gear-extract-service';
import { GearBench, GearParseMeasures, TalentNodeCount } from './gear-data-source';
import { TalentKeyService } from './talent-key-service';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const GEAR_LIMITS = ['Item level and what the player owns', 'Fight-specific swaps made between pulls'];

export const TALENT_BUILD_FAMILY: FindingFamily = {
  id: 'gear.talent_build',
  label: 'Talent build',
  version: 2,
  tier: 'blue',
  claim: 'k of n top raiders take a talent at a rank; yours does not.',
  construct: 'Each talent node, as entry and rank, that at least the shared share of the top logs with a readable tree take, against the player\'s picks; one test per shared node.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic logs for the spec and boss with a readable talent tree', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'The pull\'s combatant info',
  availability: ['A readable talent tree in the pull', 'The same talent key version as the top logs', 'At least one node the shared share of the top logs take'],
  raidDecisions: { relative: [], gated: [], excluded: [] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who take each talent',
  copy: { message: 'You differ on {d} of the {s} talents at least {k} of {n} top raiders share.', remedy: null },
  injectedMistakes: ['swap-talent-node'],
  limits: [...GEAR_LIMITS, 'Talents chosen for a raid assignment', 'Talents that fill one slot under several entries'],
};

export const TRINKET_PAIR_FAMILY: FindingFamily = {
  id: 'gear.trinket_pair',
  label: 'Trinket pair',
  version: 1,
  tier: 'blue',
  claim: 'k of n top raiders use the most common trinket pair; yours differs from it.',
  construct: 'The worn trinkets as a multiset of item ids, against the most common pair among the top logs wearing trinkets.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic logs for the spec and boss wearing trinkets', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'The pull\'s combatant info',
  availability: ['Trinkets in the pull\'s combatant info'],
  raidDecisions: { relative: [], gated: [], excluded: [] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who use the pair',
  copy: { message: '{label}. {j} of {n} top raiders use it. {k} of {n} use the most common one.', remedy: null },
  injectedMistakes: [],
  limits: GEAR_LIMITS,
};

export const ENCHANT_MISSING_FAMILY: FindingFamily = {
  id: 'gear.enchant_missing',
  label: 'Missing enchants',
  version: 1,
  tier: 'amber',
  claim: 'A slot at least half of the top raiders enchant with one enchant has no enchant.',
  construct: 'Whether the slot carries an enchant, backed by the game rule that an empty enchantable slot loses its stats once the leading enchant reaches the gate share.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'The pull\'s combatant info, slot by slot',
  availability: ['Gear in the pull\'s combatant info', 'At least one top log enchants the slot'],
  raidDecisions: { relative: [], gated: [], excluded: [] },
  rule: 'fact',
  costClass: 'low',
  uncertaintyShown: 'k of n top raiders who use the leading enchant',
  copy: { message: '{k} of {n} top raiders use it. Apply it.', remedy: null },
  injectedMistakes: ['remove-enchant'],
  limits: GEAR_LIMITS,
};

export const ENCHANT_CHOICE_FAMILY: FindingFamily = {
  id: 'gear.enchant',
  label: 'Enchant choices',
  version: 1,
  tier: 'blue',
  claim: 'k of n top raiders use another enchant in this slot.',
  construct: 'The slot\'s enchant, enchant ids sharing a name counted as one, against the leading enchant among all top logs.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'The pull\'s combatant info, slot by slot; the two rings compare as a pair',
  availability: ['Gear in the pull\'s combatant info', 'At least one top log enchants the slot'],
  raidDecisions: { relative: [], gated: [], excluded: [] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who use the leading enchant',
  copy: { message: '{k} of {n} top raiders use it.', remedy: null },
  injectedMistakes: [],
  limits: GEAR_LIMITS,
};

/** How many reference logs carry each key, and how many logs could carry one. */
export interface PickReference {
  counts: ReadonlyMap<string, number>;
  n: number;
}

/** The top logs' talent nodes, each counted over the `n` logs with a readable tree. */
export interface NodeReference {
  nodes: readonly TalentNodeCount[];
  n: number;
}

/** A shared node the player does not take at its rank: `k` of the reference's n take it; `playerRank` is null when the player skips the talent. */
export interface MissedNode {
  entryId: number;
  rank: number;
  k: number;
  playerRank: number | null;
}

/** One of the player's picks that few top logs take: `k` of the reference's n. */
export interface RarePick {
  entryId: number;
  rank: number;
  k: number;
}

/** One trinket check, or the talent check's summary; `onPlan` when the player uses the most common choice or takes every shared talent. */
export interface GearVerdict {
  family: string;
  tone: Tone;
  onPlan: boolean;
  note: string;
  n: number;
}

/** The consensus enchant as the item that applies it; `itemId` is null where the bench resolved no item. */
export interface EnchantItem {
  name: string;
  itemId: number | null;
  icon: string;
}

/** One slot's leading enchant among the top logs: `k` of `n` logs use it. */
export interface EnchantLeader {
  slot: number;
  identity: string;
  item: EnchantItem;
  k: number;
  n: number;
}

export interface EnchantRow {
  slotName: string;
  /** Null on a slot that matches the top logs. */
  family: string | null;
  tone: Tone;
  onPlan: boolean;
  name: string;
  note: string | null;
  top: EnchantItem | null;
  n: number;
}

export interface TalentVerdict extends GearVerdict {
  /** The nodes the top logs share, each one test of the family. */
  shared: number;
  missed: MissedNode[];
  instead: RarePick[];
}

type TopEnchants = EncounterGearStats['enchants'];
interface RankedChoice { key: string; label: string }

/** Talents, trinkets and enchants judged as pure functions over one log's measures, so ingest can judge a top log as the player. */
@Injectable({ providedIn: 'root' })
export class GearJudgeService {
  private readonly talentKeys = inject(TalentKeyService);
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  measureTalentKey(tree: WclTalentNode[] | undefined): string {
    return this.talentKeys.talentKeyFromTree(tree);
  }

  measureTrinkets(trinkets: readonly { id: number }[]): number[] {
    return trinkets.map(trinket => trinket.id).sort((a, b) => a - b);
  }

  measureEnchants(enchants: readonly { slot: number; id: number }[]): Record<number, number> {
    return Object.fromEntries(enchants.filter(enchant => enchant.id).map(enchant => [enchant.slot, enchant.id]));
  }

  /** Two parses wearing the same trinkets in opposite slots share one key. */
  trinketKey(ids: readonly number[]): string {
    return ids.join('-');
  }

  /** Ingest bakes `talent_nodes` through this, and the harness recounts a fold through it, so the page and the fold count one way. */
  talentNodes(keys: readonly string[]): TalentNodeCount[] {
    const counts = new Map<string, TalentNodeCount>();
    for (const pick of keys.flatMap(key => this.talentKeys.parseTalentKey(key))) {
      const node = getOrInsert(counts, `${pick.entryId}.${pick.rank}`, () => ({ entry_id: pick.entryId, rank: pick.rank, count: 0 }));
      node.count += 1;
    }
    return [...counts.values()].sort((a, b) => a.entry_id - b.entry_id || a.rank - b.rank);
  }

  readableTrees(keys: readonly string[]): number {
    return keys.filter(key => this.talentKeys.parseTalentKey(key).length).length;
  }

  // A bench before the node counts were baked reads n = 0, so it compares nothing.
  talentReference(bench: Pick<GearBench, 'talent_nodes' | 'talent_sample_count'>): NodeReference {
    const stored: Partial<GearBench> = bench;
    return { nodes: stored.talent_nodes ?? [], n: stored.talent_sample_count ?? 0 };
  }

  /** The nodes at least the shared share of the reference take; one entry holds at most one, since the share is over half. */
  sharedNodes(reference: NodeReference): TalentNodeCount[] {
    if (!reference.n) return [];
    return reference.nodes.filter(node => node.count / reference.n >= VERDICT_CHOICES.talentNodeShare);
  }

  /** The tone of each shared node for the player's build, one test each; empty when the pull or the bench has nothing to compare. */
  nodeTones(playerKey: string, reference: NodeReference, caps?: FamilyCaps): { node: TalentNodeCount; missed: boolean; tone: Tone }[] {
    const picks = this.playerRanks(playerKey);
    if (!picks.size) return [];
    return this.sharedNodes(reference).map(node => {
      const missed = picks.get(node.entry_id) !== node.rank;
      const evidence = this.rules.consensus({ differs: missed, k: node.count, n: reference.n, paired: false });
      return { node, missed, tone: missed ? this.tones.tone(TALENT_BUILD_FAMILY, evidence, caps) : this.tones.neutral() };
    });
  }

  trinketReference(perParse: readonly GearParseMeasures[]): PickReference {
    return this.pickReference(perParse.map(parse => this.trinketKey(parse.trinket_ids)));
  }

  /** Null when the pull has no readable tree, its key is of another version, or no node reaches the shared share. */
  talentVerdict(playerKey: string, reference: NodeReference, caps?: FamilyCaps): TalentVerdict | null {
    const judged = this.nodeTones(playerKey, reference, caps);
    if (!judged.length) return null;
    const ranks = this.playerRanks(playerKey);
    const missed = judged.filter(entry => entry.missed).map(({ node }) =>
      ({ entryId: node.entry_id, rank: node.rank, k: node.count, playerRank: ranks.get(node.entry_id) ?? null }));
    const tone = judged.map(entry => entry.tone).reduce((strongest, next) => this.stronger(next, strongest), this.tones.neutral());
    const atLeast = Math.ceil(VERDICT_CHOICES.talentNodeShare * reference.n);
    const share = atLeast === reference.n ? `${atLeast} of ${atLeast}` : `at least ${atLeast} of ${reference.n}`;
    const note = missed.length
      ? `You differ on ${missed.length} of the ${judged.length} talents ${share} top raiders share.`
      : `You take all ${judged.length} talents ${share} top raiders share.`;
    return {
      family: TALENT_BUILD_FAMILY.id, tone, onPlan: !missed.length, note, n: reference.n,
      shared: judged.length, missed, instead: this.rarePicks(playerKey, reference, atLeast, missed),
    };
  }

  trinketVerdict(playerKey: string, ranked: readonly RankedChoice[], reference: PickReference, caps?: FamilyCaps): GearVerdict | null {
    if (!ranked.length || !playerKey) return null;
    return this.choiceVerdict(TRINKET_PAIR_FAMILY, playerKey, ranked, reference, { noun: 'pair', caps });
  }

  /** Every slot any top log enchants, led by the enchant most of them use, ids sharing a name counted as one. */
  enchantLeaders(top: TopEnchants, perParse: readonly GearParseMeasures[]): EnchantLeader[] {
    const identityOf = this.enchantIdentities(top);
    const slots = new Set(perParse.flatMap(parse => Object.keys(parse.enchant_ids).map(Number)));
    return [...slots].sort((a, b) => a - b).flatMap(slot => {
      const listed = top[slot] ?? [];
      // Listed identities go first so a tie keeps the bench's own order.
      const counts = new Map<string, number>(listed.map(enchant => [identityOf(enchant.id), 0]));
      for (const parse of perParse) {
        const id = parse.enchant_ids[slot];
        if (id) counts.set(identityOf(id), (counts.get(identityOf(id)) ?? 0) + 1);
      }
      const [identity, k] = [...counts.entries()].reduce((best, entry) => entry[1] > best[1] ? entry : best);
      const shown = listed.find(enchant => identityOf(enchant.id) === identity);
      if (!shown || !k) return [];
      return [{ slot, identity, item: this.enchantItem(shown), k, n: perParse.length }];
    });
  }

  /** The leaders a bench-only view lists: at least the gate share of the top logs agree. */
  agreedLeaders(leaders: readonly EnchantLeader[]): EnchantLeader[] {
    return leaders.filter(leader => leader.n >= VERDICT_CHOICES.minReferenceN && this.passesGate(leader));
  }

  enchantRows(
    gear: CharacterGear, top: TopEnchants, perParse: readonly GearParseMeasures[], slotName: (slot: number) => string, caps?: FamilyCaps,
  ): EnchantRow[] {
    const leaders = this.enchantLeaders(top, perParse);
    const identityOf = this.enchantIdentities(top);
    const worn = this.measureEnchants(gear.enchants ?? []);
    const ringPairOnPlan = this.wearsLeadingRingPair(worn, leaders, identityOf);
    const slots = new Set([...leaders.map(leader => leader.slot), ...Object.keys(worn).map(Number)]);
    return [...slots].sort((a, b) => a - b).map(slot => {
      const leader = ringPairOnPlan && this.isRing(slot) ? undefined : leaders.find(entry => entry.slot === slot);
      const id = worn[slot];
      return this.enchantRow(slotName(slot), id === undefined ? null : identityOf(id), this.wornName(gear, slot, id), leader, caps);
    }).filter(row => row !== null);
  }

  private wornName(gear: CharacterGear, slot: number, id: number | undefined): string {
    const named = gear.enchants?.find(enchant => enchant.slot === slot)?.name;
    if (named) return named;
    return id ? `Enchant #${id}` : '';
  }

  private enchantRow(slotName: string, worn: string | null, name: string, leader: EnchantLeader | undefined, caps?: FamilyCaps): EnchantRow | null {
    if (!leader || worn === leader.identity) {
      return worn === null ? null : { slotName, family: null, tone: this.tones.neutral(), onPlan: true, name, note: null, top: null, n: leader?.n ?? 0 };
    }
    const agreement = this.rules.consensus({ differs: true, k: leader.k, n: leader.n, paired: false });
    if (worn === null) {
      const gated = leader.n >= VERDICT_CHOICES.minReferenceN && this.passesGate(leader);
      const tone = this.tones.tone(ENCHANT_MISSING_FAMILY, this.rules.fact({ holds: true, backing: gated ? 'game-rule' : agreement }), caps);
      return this.flaggedEnchant(slotName, 'Not enchanted', ENCHANT_MISSING_FAMILY, tone, leader);
    }
    return this.flaggedEnchant(slotName, name, ENCHANT_CHOICE_FAMILY, this.tones.tone(ENCHANT_CHOICE_FAMILY, agreement, caps), leader);
  }

  private flaggedEnchant(slotName: string, name: string, family: FindingFamily, tone: Tone, leader: EnchantLeader): EnchantRow {
    return {
      slotName, family: family.id, tone, onPlan: false, name,
      note: `${this.shareOf(leader.k, leader.n)} use it.${tone === 'amber' ? ' Apply it.' : ''}`,
      top: leader.item, n: leader.n,
    };
  }

  private passesGate(leader: EnchantLeader): boolean {
    return leader.k / leader.n >= VERDICT_CHOICES.enchantLeaderShare;
  }

  // The player's picks that the mirror of the shared share of the top logs take at most, leaving out the talents a missed node already names.
  private rarePicks(playerKey: string, reference: NodeReference, atLeast: number, missed: readonly MissedNode[]): RarePick[] {
    const counts = new Map(reference.nodes.map(node => [`${node.entry_id}.${node.rank}`, node.count]));
    const named = new Set(missed.map(node => node.entryId));
    return this.talentKeys.parseTalentKey(playerKey)
      .map(pick => ({ ...pick, k: counts.get(`${pick.entryId}.${pick.rank}`) ?? 0 }))
      .filter(pick => pick.k <= reference.n - atLeast && !named.has(pick.entryId));
  }

  private playerRanks(playerKey: string): Map<number, number> {
    return new Map(this.talentKeys.parseTalentKey(playerKey).map(pick => [pick.entryId, pick.rank]));
  }

  private stronger(a: Tone, b: Tone): Tone {
    return TONE_LEVELS.findIndex(level => level === a) > TONE_LEVELS.findIndex(level => level === b) ? a : b;
  }

  private choiceVerdict(
    family: FindingFamily, playerKey: string, ranked: readonly RankedChoice[], reference: PickReference, copy: { noun: string; caps?: FamilyCaps },
  ): GearVerdict {
    const [leader] = ranked;
    const k = reference.counts.get(leader?.key ?? '') ?? 0;
    const differs = playerKey !== leader?.key;
    const evidence = this.rules.consensus({ differs, k, n: reference.n, paired: false });
    const tone = differs ? this.tones.tone(family, evidence, copy.caps) : this.tones.neutral();
    const rank = ranked.findIndex(choice => choice.key === playerKey);
    const label = rank >= 0 ? ranked[rank]?.label ?? '' : `Uncommon ${copy.noun}`;
    return { family: family.id, tone, onPlan: !differs, note: `${label}.${this.choiceCounts(reference, playerKey, k, rank)}`, n: reference.n };
  }

  private choiceCounts(reference: PickReference, playerKey: string, k: number, rank: number): string {
    const n = reference.n;
    if (!n) return '';
    if (rank === 0) return ` ${this.shareOf(k, n)} use it.`;
    if (rank > 0) return ` ${this.shareOf(reference.counts.get(playerKey) ?? 0, n)} use it. ${k} of ${n} use the most common one.`;
    return ` ${this.shareOf(k, n)} use the most common one.`;
  }

  private shareOf(k: number, n: number): string {
    return `${k} of ${n} top raiders`;
  }

  private pickReference(keys: readonly string[]): PickReference {
    const counts = new Map<string, number>();
    const present = keys.filter(key => key);
    for (const key of present) counts.set(key, (counts.get(key) ?? 0) + 1);
    return { counts, n: present.length };
  }

  // Quality ranks of one enchant are separate ids under one item name, so the name is the identity wherever the bench knows it.
  private enchantIdentities(top: TopEnchants): (id: number) => string {
    const names = new Map(Object.values(top).flat().filter(enchant => enchant.name).map(enchant => [enchant.id, enchant.name]));
    return id => names.get(id) ?? `#${id}`;
  }

  // Top raiders wear the two leading ring enchants in either order, so the pair compares as a multiset.
  private wearsLeadingRingPair(worn: Record<number, number>, leaders: readonly EnchantLeader[], identityOf: (id: number) => string): boolean {
    const wornIds = RING_SLOTS.map(slot => worn[slot]).filter(id => id !== undefined);
    const leading = RING_SLOTS.map(slot => leaders.find(leader => leader.slot === slot)?.identity).filter(identity => identity !== undefined);
    return wornIds.length === RING_SLOTS.length && wornIds.map(identityOf).sort().join('|') === [...leading].sort().join('|');
  }

  private isRing(slot: number): boolean {
    return (RING_SLOTS as readonly number[]).includes(slot);
  }

  private enchantItem(enchant: TopEnchants[number][number]): EnchantItem {
    return { name: enchant.name || `Enchant #${enchant.id}`, itemId: enchant.item_id, icon: enchant.icon };
  }
}
