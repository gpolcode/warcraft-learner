import { describe, it, expect } from 'vitest';
import { WclCombatantInfo, WclGearItem } from '../wcl/wcl.models';
import { RING_SLOTS, TRINKET_SLOTS, GearExtractService } from './gear-extract-service';
import { TestBed } from '@angular/core/testing';

const gearExtract = TestBed.inject(GearExtractService);

// Ring and trinket slots are the WCL quirk indices 10/11 and 12/13; an enchant can sit on any slot - 15 is Main Hand.
const RING_1_SLOT = 10;
const RING_2_SLOT = 11;
const TRINKET_1_SLOT = 12;
const TRINKET_2_SLOT = 13;
const NON_TRINKET_SLOT = 5;
const ENCHANTED_SLOT = 15;
const TRINKET_A_ID = 200;
const TRINKET_B_ID = 201;
const ENCHANT_ID = 8041;
// WCL emits {id: 0} for an unfilled gear slot.
const EMPTY_SLOT_ID = 0;

describe('RING_SLOTS', () => {
  it('is the two WCL ring slot indices, in slot order', () => {
    expect([...RING_SLOTS]).toEqual([RING_1_SLOT, RING_2_SLOT]);
  });
});

describe('TRINKET_SLOTS', () => {
  it('is the two WCL trinket slot indices, in slot order', () => {
    expect([...TRINKET_SLOTS]).toEqual([TRINKET_1_SLOT, TRINKET_2_SLOT]);
  });
});

describe('iconFile', () => {
  it('strips a trailing .jpg (case-insensitive)', () => {
    expect(gearExtract.iconFile('inv_trinket.jpg')).toBe('inv_trinket');
    expect(gearExtract.iconFile('inv_trinket.JPG')).toBe('inv_trinket');
  });

  it('returns empty for an absent icon and leaves a non-.jpg name untouched', () => {
    expect(gearExtract.iconFile(undefined)).toBe('');
    expect(gearExtract.iconFile('inv_trinket')).toBe('inv_trinket');
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes the five WCL gameData entities', () => {
    expect(gearExtract.decodeHtmlEntities('A &amp; B &lt;x&gt; &quot;q&quot; &#39;s')).toBe('A & B <x> "q" \'s');
  });

  it('leaves a string with no entities unchanged', () => {
    expect(gearExtract.decodeHtmlEntities('Sophic Devotion')).toBe('Sophic Devotion');
  });

  it('decodes each entity once, so an escaped entity survives as text', () => {
    expect(gearExtract.decodeHtmlEntities('&amp;lt;')).toBe('&lt;');
    expect(gearExtract.decodeHtmlEntities('&amp;amp;')).toBe('&amp;');
  });
});

describe('enchantItem', () => {
  // Raidbots maps the kit's enchant to the kit item; WCL names the item in game, HTML-escaped.
  const ARMOR_KIT_ENCHANT = 8159;
  const ARMOR_KIT_ITEM = 244641;
  const ARMOR_KIT_ICON = 'inv_armor_kit';
  const raidbotsMap = { [ARMOR_KIT_ENCHANT]: ARMOR_KIT_ITEM };
  const itemNamed = (name: string) => ({ [`i${ARMOR_KIT_ITEM}`]: { id: ARMOR_KIT_ITEM, name, icon: `${ARMOR_KIT_ICON}.jpg` } });

  it('is the item Raidbots maps the enchant to, with its decoded WCL name and icon file', () => {
    expect(gearExtract.enchantItem(ARMOR_KIT_ENCHANT, raidbotsMap, itemNamed('Forest Hunter&#39;s Armor Kit')))
      .toEqual({ id: ARMOR_KIT_ITEM, name: "Forest Hunter's Armor Kit", icon: ARMOR_KIT_ICON });
  });

  it('is null for an enchant Raidbots maps to no item', () => {
    expect(gearExtract.enchantItem(ENCHANT_ID, raidbotsMap, itemNamed("Forest Hunter's Armor Kit"))).toBeNull();
  });

  it('is null for a mapped enchant whose item WCL names blank or not at all', () => {
    expect(gearExtract.enchantItem(ARMOR_KIT_ENCHANT, raidbotsMap, itemNamed(''))).toBeNull();
    expect(gearExtract.enchantItem(ARMOR_KIT_ENCHANT, raidbotsMap, {})).toBeNull();
  });
});

describe('extractGear', () => {
  it('extracts trinkets from slots 12/13 (stripping .jpg, coercing string ids) and enchants from any slot', () => {
    const gear = Array<WclGearItem>(16).fill({});
    gear[TRINKET_1_SLOT] = { id: TRINKET_A_ID, name: 'Trinket A', icon: 'a.jpg' };
    gear[TRINKET_2_SLOT] = { id: String(TRINKET_B_ID), name: 'Trinket B', icon: 'b.jpg' };
    gear[ENCHANTED_SLOT] = { id: 1, name: 'Wep', permanentEnchant: String(ENCHANT_ID) };

    const { trinkets, enchants } = gearExtract.extractGear(gear);

    expect(trinkets).toEqual([
      { slot: TRINKET_1_SLOT, id: TRINKET_A_ID, name: 'Trinket A', icon: 'a' },
      { slot: TRINKET_2_SLOT, id: TRINKET_B_ID, name: 'Trinket B', icon: 'b' },
    ]);
    expect(enchants).toEqual([{ slot: ENCHANTED_SLOT, id: ENCHANT_ID, name: '' }]);
  });

  it('ignores items in non-trinket slots for the trinket list', () => {
    const gear = Array<WclGearItem>(16).fill({});
    gear[NON_TRINKET_SLOT] = { id: TRINKET_A_ID, name: 'Ring', icon: 'r.jpg' };

    expect(gearExtract.extractGear(gear).trinkets).toEqual([]);
  });

  it('skips items with no id and returns empty for an absent gear array', () => {
    const gear = Array<WclGearItem>(16).fill({});
    gear[TRINKET_1_SLOT] = { name: 'No id', icon: 'x.jpg' };

    expect(gearExtract.extractGear(gear).trinkets).toEqual([]);
    expect(gearExtract.extractGear(undefined)).toEqual({ trinkets: [], enchants: [] });
  });

  it('skips an empty trinket slot (WCL id 0), so a bare slot never reaches the bench', () => {
    const gear = Array<WclGearItem>(16).fill({});
    gear[TRINKET_1_SLOT] = { id: EMPTY_SLOT_ID, name: '', icon: '' };

    expect(gearExtract.extractGear(gear).trinkets).toEqual([]);
  });
});

describe('selectCombatantInfo', () => {
  const PLAYER_ID = 10;
  const OTHER_ID = 20;
  const forPlayer = (sourceID: number): WclCombatantInfo => ({ sourceID, gear: [] });

  it('picks the event matching the player sourceID', () => {
    const events = [forPlayer(OTHER_ID), forPlayer(PLAYER_ID)];
    expect(gearExtract.selectCombatantInfo(events, PLAYER_ID)).toBe(events[1]);
  });

  it('falls back to the first event when none matches the player', () => {
    const events = [forPlayer(OTHER_ID)];
    expect(gearExtract.selectCombatantInfo(events, PLAYER_ID)).toBe(events[0]);
  });

  it('returns null for an empty events array', () => {
    expect(gearExtract.selectCombatantInfo([], PLAYER_ID)).toBeNull();
  });
});
