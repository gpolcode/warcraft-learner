import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../../testing/builders/spec-plan';
import type { PriorityList } from '../../../plan/plan.models';
import type { WclEvent } from '../../../wcl/wcl.models';
import { FactCatalogService } from '../fact-catalog-service';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { GearPiece, UNKNOWN } from '../priority-list.models';
import { GearFacts } from './gear-facts';

const CAST_S = 10;
const SPYMASTERS_WEB = 220202;
const WEB_USE = 444959;
const WEB_CD_S = 20;
const PUZZLE_BOX = 193701;
const RING = 200000;
const LIQUID_LUSTER = 431932;
const WEB_ILVL = 639;
/** What ingest baked of the trinkets the top logs wore. */
const KNOWN_ITEMS = priorityList({
  spells: { item_220202: planSpell("Spymaster's Web", [WEB_USE], { cooldown: WEB_CD_S, gcd: 0, cast_time: 0 }) },
  items: {
    [SPYMASTERS_WEB]: { name: "Spymaster's Web", use: 'item_220202', use_buff: true, use_damage: false },
    [PUZZLE_BOX]: { name: "Algeth'ar Puzzle Box", use: null, use_buff: false, use_damage: false },
  },
});
/** The combatant info's slots: rings at 10 and 11, trinkets at 12 and 13. */
const WORN: GearPiece[] = [
  { slot: 10, id: RING, name: 'Seal of Diurna\'s Chosen', itemLevel: 626 },
  { slot: 12, id: SPYMASTERS_WEB, name: 'Spymaster\'s Web', itemLevel: WEB_ILVL },
  { slot: 13, id: PUZZLE_BOX, name: 'Algeth\'ar Puzzle Box', itemLevel: 626 },
];
const gear = TestBed.inject(GearFacts);
const catalog = TestBed.inject(FactCatalogService);

const read = (name: string, worn: GearPiece[] = WORN, casts: WclEvent[] = [cast(1, CAST_S)], list: PriorityList = priorityList()) => {
  const ctx = factContext(list, { casts, gear: worn });
  return gear.read(catalog.path(name, 'x'), castAt(ctx, CAST_S), ctx);
};
const known = (name: string, casts: WclEvent[] = [cast(1, CAST_S)]) => read(name, WORN, casts, KNOWN_ITEMS);

describe('GearFacts', () => {
  it('reads an item as equipped by its name tokenized the way SimC does, apostrophes dropped', () => {
    expect(read('equipped.spymasters_web')).toEqual([1, 1]);
    expect(read('equipped.seal_of_diurnas_chosen')).toEqual([1, 1]);
    expect(read('equipped.treacherous_transmitter')).toEqual([0, 0]);
  });

  it('reads which item each trinket slot holds, and the slot an item sits in', () => {
    expect(read('trinket.1.is.spymasters_web')).toEqual([1, 1]);
    expect(read('trinket.2.is.spymasters_web')).toEqual([0, 0]);
    expect(read('trinket.2.is.algethar_puzzle_box')).toEqual([1, 1]);
    expect(read('trinket.algethar_puzzle_box.ilvl')).toEqual([626, 626]);
  });

  it('reads a trinket\'s item level, and unknown for a slot left empty', () => {
    expect(read('trinket.1.ilvl')).toEqual([WEB_ILVL, WEB_ILVL]);
    expect(read('trinket.2.ilvl', WORN.slice(0, 2))).toEqual(UNKNOWN);
  });

  it('reads the trinket a line is about as unknown, since which one depends on the line SimC is on', () => {
    expect(read('this_trinket.is.spymasters_web')).toEqual(UNKNOWN);
  });

  it('reads a potion as the one brought once the log shows it used, and unknown while it shows none', () => {
    const ctx = factContext(priorityList(), { abilities: [{ gameID: LIQUID_LUSTER, name: 'Liquid Luster', icon: '' }], casts: [cast(LIQUID_LUSTER, 5), cast(1, CAST_S)], gear: WORN });
    expect(gear.read(catalog.path('potion.liquid_luster', 'x'), castAt(ctx, CAST_S), ctx)).toEqual([1, 1]);
    expect(read('potion.liquid_luster')).toEqual(UNKNOWN);
  });

  it('reads every gear fact as unknown for a log without combatant gear', () => {
    expect(read('equipped.spymasters_web', [])).toEqual(UNKNOWN);
    expect(read('trinket.1.ilvl', [])).toEqual(UNKNOWN);
  });

  it('reads what an item does on use from what the list knows of it, and unknown for an item no top log wore', () => {
    expect(known('trinket.1.has_use_buff')).toEqual([1, 1]);
    expect(known('trinket.1.has_cooldown')).toEqual([1, 1]);
    expect(known('trinket.1.has_use_damage')).toEqual([0, 0]);
    expect(known('trinket.2.has_use_buff')).toEqual([0, 0]);
    expect(known('trinket.2.has_cooldown')).toEqual([0, 0]);
    expect(read('trinket.1.has_use_buff')).toEqual(UNKNOWN);
  });

  it('reads a trinket\'s cooldown off its use spell\'s casts, as any button\'s', () => {
    const used = [cast(WEB_USE, CAST_S - 5), cast(1, CAST_S)];
    expect(known('trinket.1.cooldown.remains', used)).toEqual([WEB_CD_S - 5, WEB_CD_S - 5]);
    expect(known('trinket.1.cooldown.ready', used)).toEqual([0, 0]);
    expect(known('trinket.1.cooldown.duration', used)).toEqual([WEB_CD_S, WEB_CD_S]);
    expect(known('trinket.1.cast_time', used)).toEqual([0, 0]);
    expect(known('trinket.2.cooldown.remains', used)).toEqual(UNKNOWN);
  });

  it('reads a set bonus and a proc as unknown, which the item data does not describe', () => {
    expect(known('set_bonus.mid2_4pc')).toEqual(UNKNOWN);
    expect(known('trinket.1.proc.any_dps.duration')).toEqual(UNKNOWN);
  });
});
