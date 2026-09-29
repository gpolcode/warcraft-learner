import { describe, it, expect } from 'vitest';
import { CharacterGear, WclCombatantInfo, WclGearItem } from '../wcl/wcl.models';
import { GEAR_DATA_SOURCE, GearBench } from './gear-data-source';
import { featureService } from '../../../../../testing/service-harness';
import { Result, Results } from '../../../shared/util-http/result';
import { GearComparisonView, GearFeatureService } from './gear-feature-service';
import { GameNames } from './gear-extract-service';
import { EnchantItemDataService, EnchantItems } from '../http/enchant-item-data-service';
import { TestBed } from '@angular/core/testing';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: GEAR_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(GearFeatureService);
TestBed.resetTestingModule();

const STANDARD_KEY = 'v3:11.1,22.1';
const GAZE = { id: 100, name: 'A', icon: 'inv_a' };
const PUZZLE_BOX = { id: 200, name: 'B', icon: 'inv_b' };
const STANDARD_PAIR = [{ items: [GAZE, PUZZLE_BOX], pct: 70 }];
const STANDARD_TRINKETS = [{ slot: 12, id: GAZE.id, name: GAZE.name }, { slot: 13, id: PUZZLE_BOX.id, name: PUZZLE_BOX.name }];

// WCL's enchant alias names only the effect (stat text for an armor kit); Raidbots maps the enchant to the item WCL names in game.
const LEGS_SLOT = 6;
const MAIN_HAND_SLOT = 15;
const ARMOR_KIT_ENCHANT = 8159;
const ARMOR_KIT_ITEM = 244641;
const ARMOR_KIT_EFFECT = '+41 Agility/Strength & +115 Stamina';
const ARMOR_KIT_NAME = "Forest Hunter's Armor Kit";
const RING_ENCHANT = 7967;
const RING_ENCHANT_ITEM = 243957;
const SOPHIC_ENCHANT = 8041;
const SOPHIC_EFFECT = 'Sophic Devotion';
const RAIDBOTS_MAP: EnchantItems = { [ARMOR_KIT_ENCHANT]: ARMOR_KIT_ITEM, [RING_ENCHANT]: RING_ENCHANT_ITEM };

const WCL_GAME_NAMES: GameNames = {
  [`i${ARMOR_KIT_ITEM}`]: { id: ARMOR_KIT_ITEM, name: ARMOR_KIT_NAME },
  [`e${ARMOR_KIT_ENCHANT}`]: { id: ARMOR_KIT_ENCHANT, name: ARMOR_KIT_EFFECT },
  [`e${SOPHIC_ENCHANT}`]: { id: SOPHIC_ENCHANT, name: SOPHIC_EFFECT },
};

// WCL's gameData batch answers only the aliases the query asked for.
function answerGameNames(itemIds: number[], enchantIds: number[]): GameNames {
  const asked = [...itemIds.map(id => `i${id}`), ...enchantIds.map(id => `e${id}`)];
  return Object.fromEntries(asked.flatMap(alias => {
    const named = WCL_GAME_NAMES[alias];
    return named ? [[alias, named]] : [];
  }));
}

function benchWith(overrides: Partial<GearBench> = {}): GearBench {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', sample_count: 10,
    talent_builds: [{ key: STANDARD_KEY, pct: 80, report_code: 'abc', fight_id: 2, player_name: 'Top', source_id: 5, diff: [] }],
    trinket_sets: STANDARD_PAIR,
    enchants: { 15: [{ id: 8041, name: 'Sophic', icon: '', item_id: null, pct: 90 }] },
    ...overrides,
  };
}

// Reconstructs a raw CombatantInfo event; a non-blank name is baked onto the gear item, so only a blank one is filled from getGameNames.
function toRawEvent(gear: CharacterGear): WclCombatantInfo {
  const items: WclGearItem[] = [];
  for (const trinket of gear.trinkets ?? []) items[trinket.slot] = { id: trinket.id, name: trinket.name };
  for (const enchant of gear.enchants ?? []) {
    items[enchant.slot] = { ...(items[enchant.slot] ?? { id: 1, name: 'x' }), permanentEnchant: enchant.id, permanentEnchantName: enchant.name };
  }
  const body = (gear.talent_key ?? '').replace(/^v3:/, '');
  const talentTree = body ? body.split(',').map(pick => {
    const [id, rank] = pick.split('.').map(Number);
    return { id, rank };
  }) : [];
  return { sourceID: 10, gear: items, talentTree };
}

describe('benchToStats', () => {
  it('extracts the gear stats block from a bench', () => {
    expect(svc['benchToStats'](benchWith())).toEqual({
      talent_builds: [{ key: STANDARD_KEY, pct: 80, report_code: 'abc', fight_id: 2, player_name: 'Top', source_id: 5, diff: [] }],
      trinket_sets: STANDARD_PAIR,
      enchants: { 15: [{ id: 8041, name: 'Sophic', icon: '', item_id: null, pct: 90 }] },
    });
  });
});

describe('buildCharacterGear', () => {
  it('is a permanent error when the log has no combatant info', () => {
    expect(svc['buildCharacterGear'](null, {}, {}))
      .toEqual(Results.permanent('No combatant info in this log.', 'gear.combatant-info'));
  });

  it('builds the gear fingerprint when the event carries gear', () => {
    const event = toRawEvent({
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    });
    const result = svc['buildCharacterGear'](event, {}, {});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({ talent_key: STANDARD_KEY });
  });
});

describe('gameNameIds', () => {
  it('looks up a mapped enchant by its item beside the trinkets, and an unmapped one by its enchant id', () => {
    expect(svc['gameNameIds']([GAZE, PUZZLE_BOX], [{ id: ARMOR_KIT_ENCHANT }, { id: SOPHIC_ENCHANT }], RAIDBOTS_MAP))
      .toEqual({ itemIds: [GAZE.id, PUZZLE_BOX.id, ARMOR_KIT_ITEM], enchantIds: [SOPHIC_ENCHANT] });
  });

  it('asks once for an enchant worn on both rings, mapped or not', () => {
    const bothRings = [{ id: RING_ENCHANT }, { id: RING_ENCHANT }];
    expect(svc['gameNameIds']([], bothRings, RAIDBOTS_MAP)).toEqual({ itemIds: [RING_ENCHANT_ITEM], enchantIds: [] });
    expect(svc['gameNameIds']([], bothRings, {})).toEqual({ itemIds: [], enchantIds: [RING_ENCHANT] });
  });

  it('looks up every enchant by its enchant id when the Raidbots map is empty', () => {
    expect(svc['gameNameIds']([GAZE], [{ id: ARMOR_KIT_ENCHANT }, { id: SOPHIC_ENCHANT }], {}))
      .toEqual({ itemIds: [GAZE.id], enchantIds: [ARMOR_KIT_ENCHANT, SOPHIC_ENCHANT] });
  });
});

describe('nameEnchantsByItem', () => {
  const kitItemNamed: GameNames = { [`i${ARMOR_KIT_ITEM}`]: { id: ARMOR_KIT_ITEM, name: ARMOR_KIT_NAME } };
  const kit = { slot: LEGS_SLOT, id: ARMOR_KIT_ENCHANT, name: ARMOR_KIT_EFFECT };
  const sophic = { slot: MAIN_HAND_SLOT, id: SOPHIC_ENCHANT, name: SOPHIC_EFFECT };

  it('names an enchant by the item Raidbots maps it to', () => {
    expect(svc['nameEnchantsByItem']([kit], RAIDBOTS_MAP, kitItemNamed)).toEqual([{ ...kit, name: ARMOR_KIT_NAME }]);
  });

  it('keeps the effect text of an enchant Raidbots maps to no item', () => {
    expect(svc['nameEnchantsByItem']([sophic], RAIDBOTS_MAP, kitItemNamed)).toEqual([sophic]);
  });

  it('keeps the effect text of a mapped enchant whose item WCL leaves unnamed', () => {
    expect(svc['nameEnchantsByItem']([kit], RAIDBOTS_MAP, {})).toEqual([kit]);
  });
});

describe('buildBenchGearView', () => {
  const stats = svc['benchToStats'](benchWith());

  it('comparison off, bench rows populated with no row marked as the player\'s', () => {
    const view = svc['buildBenchGearView'](stats);
    expect(view.comparison).toBe(false);
    expect(view.benchEnchantRows).toEqual([{ slotName: 'Main Hand', enchant: { name: 'Sophic', itemId: null, icon: '' } }]);
    expect(view.talentBuilds[0]).toMatchObject({ pct: 80, label: 'Most common build' });
    expect(view.trinketSets[0]).toEqual({ pct: 70, isPlayer: false, label: 'Most common pair', items: [GAZE, PUZZLE_BOX] });
    expect(view.trinketStatus).toEqual({ status: 'unknown', note: 'No trinket data.' });
    // The comparison rows stay empty in bench-only mode (no player to compare).
    expect(view.enchantRows).toEqual([]);
  });
});

describe('buildGearView', () => {
  const stats = svc['benchToStats'](benchWith());
  const matchingPlayer: CharacterGear = {
    talent_key: STANDARD_KEY,
    trinkets: STANDARD_TRINKETS,
    enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
  };

  it('turns comparison mode on once there is a player to compare', () => {
    expect(svc['buildGearView'](matchingPlayer, stats).comparison).toBe(true);
  });

  it('marks a player matching the bench on plan in talents, trinkets and enchants', () => {
    const view = svc['buildGearView'](matchingPlayer, stats);
    expect(view.talentStatus.status).toBe('ok');
    expect(view.trinketStatus).toEqual({ status: 'ok', note: 'Most common pair.' });
    expect(view.enchantStatus).toBe('ok');
  });

  it('marks the bench trinket pair the player is running as theirs', () => {
    expect(svc['buildGearView'](matchingPlayer, stats).trinketSets[0]).toMatchObject({ isPlayer: true });
  });

  it('flags a trinket pair on no bench row as uncommon', () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: [{ slot: 12, id: 999, name: 'Off Meta' }],
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    };
    const view = svc['buildGearView'](player, stats);
    expect(view.trinketStatus).toEqual({ status: 'warn', note: 'Uncommon pair. 70% use the most common one.' });
    expect(view.trinketSets.some(row => row.isPlayer)).toBe(false);
  });

  it('warns on both the section and the row when a high-consensus enchant is missing', () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [],
    };
    const view = svc['buildGearView'](player, stats);
    expect(view.enchantStatus).toBe('warn');
    expect(view.enchantRows.some(row => row.status === 'warn')).toBe(true);
  });
});

describe('emptyGearView', () => {
  it('is a bench-off placeholder with no rows', () => {
    expect(svc.emptyGearView()).toEqual({
      comparison: false,
      talentBuilds: [], talentStatus: { status: 'unknown', note: 'No talent data.' },
      trinketSets: [], trinketStatus: { status: 'unknown', note: 'No trinket data.' },
      enchantRows: [], enchantStatus: 'ok', benchEnchantRows: [],
    });
  });
});

interface NameLookup { itemIds: number[]; enchantIds: number[] }

function configure(
  bench: Result<GearBench>, gear: CharacterGear | null,
  { enchantItems = Results.ok({}), nameLookups = [] }: { enchantItems?: Result<EnchantItems>; nameLookups?: NameLookup[] } = {},
): GearFeatureService {
  const wclFake = {
    getCombatantInfo: async (): Promise<WclCombatantInfo[]> => (gear ? [toRawEvent(gear)] : []),
    getGameNames: async (itemIds: number[], enchantIds: number[]) => {
      nameLookups.push({ itemIds, enchantIds });
      return answerGameNames(itemIds, enchantIds);
    },
  };
  const raidbotsFake = { getEnchantItems: async () => enchantItems };
  return featureService(GEAR_DATA_SOURCE, GearFeatureService, bench, wclFake, [{ provide: EnchantItemDataService, useValue: raidbotsFake }]);
}

// WCL never fills permanentEnchantName, so each enchant name comes from the game-name lookup.
const LOGGED_PLAYER: CharacterGear = {
  talent_key: STANDARD_KEY,
  trinkets: STANDARD_TRINKETS,
  enchants: [{ slot: LEGS_SLOT, id: ARMOR_KIT_ENCHANT, name: '' }, { slot: MAIN_HAND_SLOT, id: SOPHIC_ENCHANT, name: '' }],
};

const enchantNames = (view: Result<GearComparisonView>): string[] => (view.ok ? view.value.enchantRows.map(row => row.name) : []);

describe('GearFeatureService', () => {
  it('loadBenchView builds the bench-only view', async () => {
    const result = await configure(Results.ok(benchWith()), null).loadBenchView('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.comparison).toBe(false);
    expect(result.value.trinketSets).toHaveLength(1);
  });

  it('loadBenchView propagates a missing bench unchanged', async () => {
    const result = await configure(Results.missing('Not yet ingested.'), null).loadBenchView('SubtletyRogue', 1);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });

  it('loadComparisonView merges fetched player gear with the bench', async () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    };
    const result = await configure(Results.ok(benchWith()), player).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.comparison).toBe(true);
    expect(result.value.talentStatus.status).toBe('ok');
  });

  it('loadComparisonView names the player\'s enchants by their Raidbots item, asking WCL for effect text only where no item maps', async () => {
    const nameLookups: NameLookup[] = [];
    const service = configure(Results.ok(benchWith()), LOGGED_PLAYER, { enchantItems: Results.ok(RAIDBOTS_MAP), nameLookups });

    const view = await service.loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);

    expect(nameLookups).toEqual([{ itemIds: [GAZE.id, PUZZLE_BOX.id, ARMOR_KIT_ITEM], enchantIds: [SOPHIC_ENCHANT] }]);
    expect(enchantNames(view)).toEqual([ARMOR_KIT_NAME, SOPHIC_EFFECT]);
  });

  it('loadComparisonView keeps every enchant on its WCL effect text when the Raidbots read fails', async () => {
    const service = configure(Results.ok(benchWith()), LOGGED_PLAYER, { enchantItems: Results.transient('Raidbots is unreachable right now.') });

    const view = await service.loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);

    expect(view.ok).toBe(true);
    expect(enchantNames(view)).toEqual([ARMOR_KIT_EFFECT, SOPHIC_EFFECT]);
  });

  it('loadComparisonView surfaces a permanent error when the player has no combatant info', async () => {
    const result = await configure(Results.ok(benchWith()), null).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result).toEqual(Results.permanent('No combatant info in this log.', 'gear.combatant-info'));
  });

  it('loadComparisonView propagates a missing bench before fetching player gear', async () => {
    const result = await configure(Results.missing('Not yet ingested.'), null).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });
});
