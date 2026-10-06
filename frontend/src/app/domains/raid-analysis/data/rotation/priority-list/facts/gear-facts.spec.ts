import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import type { PriorityList } from '../../../plan/plan.models';
import type { WclAbility, WclEvent } from '../../../wcl/wcl.models';
import { ConditionEvalService } from '../condition-eval-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { GearPiece, Range, UNKNOWN } from '../priority-list.models';

const CAST_S = 10;
const SPYMASTERS_WEB = 220202;
const WEB_USE = 444959;
const WEB_CD_S = 20;
const PUZZLE_BOX = 193701;
const RING = 200000;
const LIQUID_LUSTER = 431932;
const WEB_ILVL = 639;
/** The combatant info's slots: rings at 10 and 11, trinkets at 12 and 13. */
const WORN: GearPiece[] = [
  { slot: 10, id: RING, name: "Seal of Diurna's Chosen", itemLevel: 626 },
  { slot: 12, id: SPYMASTERS_WEB, name: "Spymaster's Web", itemLevel: WEB_ILVL },
  { slot: 13, id: PUZZLE_BOX, name: "Algeth'ar Puzzle Box", itemLevel: 626 },
];
/** What ingest baked of the trinkets the top logs wore. */
const KNOWN_ITEMS = priorityList({
  spells: { item_220202: planSpell("Spymaster's Web", [WEB_USE], { cooldown: WEB_CD_S, gcd: 0, cast_time: 0 }) },
  items: {
    spymasters_web: { id: SPYMASTERS_WEB, name: "Spymaster's Web", use: 'item_220202', use_buff: true, use_damage: false },
    algethar_puzzle_box: { id: PUZZLE_BOX, name: "Algeth'ar Puzzle Box", use: null, use_buff: false, use_damage: false },
  },
});
const USED_WEB = [cast(WEB_USE, CAST_S - 5), cast(1, CAST_S)];
const POTION: WclAbility[] = [{ gameID: LIQUID_LUSTER, name: 'Liquid Luster', icon: '' }];
const evaluator = TestBed.inject(ConditionEvalService);

interface Read {
  reads: string;
  name: string;
  expected: Range;
  worn?: GearPiece[];
  casts?: WclEvent[];
  list?: PriorityList;
  abilities?: WclAbility[];
}

const read = ({ name, worn = WORN, casts = [cast(1, CAST_S)], list = priorityList(), abilities = [] }: Read): Range => {
  const ctx = factContext(list, { casts, gear: worn, abilities });
  return evaluator.read(name, castAt(ctx, CAST_S), 'x', ctx);
};

describe('GearFacts', () => {
  it.each<Read>([
    { reads: 'an item as equipped by its name tokenized the way SimC does, apostrophes dropped', name: 'equipped.spymasters_web', expected: [1, 1] },
    { reads: 'a ring as equipped the same', name: 'equipped.seal_of_diurnas_chosen', expected: [1, 1] },
    { reads: 'an item not worn as not equipped', name: 'equipped.treacherous_transmitter', expected: [0, 0] },
    { reads: 'an item whose name the log left blank by the id the list knows it under', name: 'equipped.spymasters_web', worn: [{ ...WORN[1], name: '' } as GearPiece], list: KNOWN_ITEMS, expected: [1, 1] },
    { reads: 'which item the first trinket slot holds', name: 'trinket.1.is.spymasters_web', expected: [1, 1] },
    { reads: 'that item as not in the second slot', name: 'trinket.2.is.spymasters_web', expected: [0, 0] },
    { reads: 'the second slot\'s own item', name: 'trinket.2.is.algethar_puzzle_box', expected: [1, 1] },
    { reads: 'a trinket named by its item', name: 'trinket.algethar_puzzle_box.ilvl', expected: [626, 626] },
    { reads: 'a trinket\'s item level', name: 'trinket.1.ilvl', expected: [WEB_ILVL, WEB_ILVL] },
    { reads: 'a slot left empty as unknown', name: 'trinket.2.ilvl', worn: WORN.slice(0, 2), expected: UNKNOWN },
    { reads: 'the trinket a line is about as unknown, since which one depends on the line SimC is on', name: 'this_trinket.has_use_buff', list: KNOWN_ITEMS, expected: UNKNOWN },
    { reads: 'a potion as the one brought once the log shows it used', name: 'potion.liquid_luster', casts: [cast(LIQUID_LUSTER, 5), cast(1, CAST_S)], abilities: POTION, expected: [1, 1] },
    { reads: 'the same under SimC\'s consumable name', name: 'consumable.liquid_luster', casts: [cast(LIQUID_LUSTER, 5), cast(1, CAST_S)], abilities: POTION, expected: [1, 1] },
    { reads: 'a potion as unknown while the log shows none used', name: 'potion.liquid_luster', expected: UNKNOWN },
    { reads: 'an item as unknown for a log without combatant gear', name: 'equipped.spymasters_web', worn: [], expected: UNKNOWN },
    { reads: 'an on-use buff from what the list knows of the item', name: 'trinket.1.has_use_buff', list: KNOWN_ITEMS, expected: [1, 1] },
    { reads: 'a cooldown from the use spell the list knows', name: 'trinket.1.has_cooldown', list: KNOWN_ITEMS, expected: [1, 1] },
    { reads: 'no on-use damage where the use buffs', name: 'trinket.1.has_use_damage', list: KNOWN_ITEMS, expected: [0, 0] },
    { reads: 'no on-use buff on an item with no use', name: 'trinket.2.has_use_buff', list: KNOWN_ITEMS, expected: [0, 0] },
    { reads: 'no cooldown on an item with no use', name: 'trinket.2.has_cooldown', list: KNOWN_ITEMS, expected: [0, 0] },
    { reads: 'what an item does on use as unknown when no top log wore it', name: 'trinket.1.has_use_buff', expected: UNKNOWN },
    { reads: 'a trinket\'s cooldown off its use spell\'s casts, as any button\'s', name: 'trinket.1.cooldown.remains', list: KNOWN_ITEMS, casts: USED_WEB, expected: [WEB_CD_S - 5, WEB_CD_S - 5] },
    { reads: 'that trinket as on cooldown', name: 'trinket.1.cooldown.ready', list: KNOWN_ITEMS, casts: USED_WEB, expected: [0, 0] },
    { reads: 'the cooldown\'s length from the use spell', name: 'trinket.1.cooldown.duration', list: KNOWN_ITEMS, casts: USED_WEB, expected: [WEB_CD_S, WEB_CD_S] },
    { reads: 'the use\'s cast time', name: 'trinket.1.cast_time', list: KNOWN_ITEMS, casts: USED_WEB, expected: [0, 0] },
    { reads: 'the cooldown of an item with no use as unknown', name: 'trinket.2.cooldown.remains', list: KNOWN_ITEMS, casts: USED_WEB, expected: UNKNOWN },
    { reads: 'a set bonus as unknown, which the item data does not describe', name: 'set_bonus.mid2_4pc', list: KNOWN_ITEMS, expected: UNKNOWN },
    { reads: 'a proc as unknown, which the item data does not describe', name: 'trinket.1.proc.any_dps.duration', list: KNOWN_ITEMS, expected: UNKNOWN },
  ])('reads $reads', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
