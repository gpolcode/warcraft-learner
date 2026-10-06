import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  ALGETHAR_PUZZLE, ALGETHAR_PUZZLE_BOX, ARAKARA_SACBROOD, ARAKARA_SACBROOD_EQUIP, BOLSTERING_LIGHT, SIGNET_EQUIP, SIGNET_OF_THE_PRIORY,
  SPYMASTERS_WEB, SPYMASTERS_WEB_EQUIP, SPYMASTERS_WEB_USE,
} from '../../../../../testing/spell-ids';
import { Results } from '../../../shared/util-http/result';
import { SimcDataService } from '../http/simc-data-service';
import { TRINKET_SLOTS } from '../gear/gear-extract-service';
import type { GearPiece } from '../rotation/priority-list/priority-list.models';
import { ItemDataService } from './item-data-service';

const URN = 230000;
const URN_USE = 460000;
const UNLISTED = 999999;
const WEB_CD_S = 20;
const WEB_DURATION_S = 20;
const PUZZLE_GCD_S = 1;
const PUZZLE_CAST_S = 2;
/** The rows as `item_effect.inc` writes them: effect id, spell, item, index, trigger (0 on use, 1 on equip), cooldown fields, then the spell's name, which is the item's only sometimes. */
const EFFECTS = `
static constexpr std::array<item_effect_t, 7> __item_effect_data { {
  { 184102, ${SPYMASTERS_WEB_EQUIP}, ${SPYMASTERS_WEB},   0,   1,    0,      -1,      -1 }, // Spymaster's Web
  { 184103, ${SPYMASTERS_WEB_USE}, ${SPYMASTERS_WEB},   1,   0,    0,      -1,      -1 }, // Spymaster's Web
  { 183886, ${BOLSTERING_LIGHT}, ${SIGNET_OF_THE_PRIORY},   0,   0,    0,      -1,      -1 }, // Bolstering Light
  { 185842, ${SIGNET_EQUIP}, ${SIGNET_OF_THE_PRIORY},   1,   1,    0,      -1,      -1 }, // Signet of the Priory
  { 170101, ${ALGETHAR_PUZZLE}, ${ALGETHAR_PUZZLE_BOX},   0,   0,    0,      -1,      -1 }, // Algeth'ar Puzzle
  { 183893, ${ARAKARA_SACBROOD_EQUIP}, ${ARAKARA_SACBROOD},   0,   1,    0,      -1,      -1 }, // Ara-Kara Sacbrood
  { 190000, ${URN_USE}, ${URN},   0,   0,    0,      -1,      -1 }, // Sealed Chaos Urn
} };
`;
const DUMP = [
  `Name             : Spymaster's Web (id=${SPYMASTERS_WEB_USE}) `,
  `Duration         : ${WEB_DURATION_S} seconds`,
  `Cooldown         : ${WEB_CD_S} seconds`,
  'Effects          :',
  '#1 (id=1141654)  : Apply Aura (6) | Attribute (29)',
  '                   Base Value: 0 | Scaled Value: 0 | Stat: Int | Target: Self (1)',
  '',
  `Name             : Spymaster's Web (id=${SPYMASTERS_WEB_EQUIP}) [Passive] `,
  'Effects          :',
  '#1 (id=1141651)  : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 0 | Target: Self (1)',
  '',
  `Name             : Bolstering Light (id=${BOLSTERING_LIGHT}) `,
  'Cooldown         : 120 seconds',
  'Effects          :',
  '#1 (id=1200000)  : Apply Aura (6) | Mod Rating (189)',
  '                   Base Value: 0 | Scaled Value: 0 | Target: Self (1)',
  '',
  `Name             : Algeth'ar Puzzle (id=${ALGETHAR_PUZZLE}) `,
  `Cast Time        : ${PUZZLE_CAST_S} seconds`,
  `GCD              : ${PUZZLE_GCD_S} seconds`,
  'Cooldown         : 120 seconds',
  'Effects          :',
  '#1 (id=1200001)  : Dummy (3)',
  '                   Base Value: 0 | Target: Self (1)',
  '',
  `Name             : Sealed Chaos Urn (id=${URN_USE}) `,
  'Cooldown         : 90 seconds',
  'Effects          :',
  '#1 (id=1200002)  : School Damage (2)',
  '                   Base Value: 0 | Scaled Value: 1000 | Target: Enemy (6)',
  '',
].join('\n');

const worn = (id: number, name: string): GearPiece => ({ slot: TRINKET_SLOTS[0], id, name, itemLevel: 0 });
const WEB = worn(SPYMASTERS_WEB, "Spymaster's Web");
const SIGNET = worn(SIGNET_OF_THE_PRIORY, 'Signet of the Priory');
const PUZZLE_BOX = worn(ALGETHAR_PUZZLE_BOX, "Algeth'ar Puzzle Box");
const SACBROOD = worn(ARAKARA_SACBROOD, 'Ara-Kara Sacbrood');

const service = (effects = EFFECTS, dump = DUMP, fetches: string[] = []) => {
  TestBed.configureTestingModule({ providers: [{
    provide: SimcDataService,
    useValue: {
      getItemEffects: async () => { fetches.push('effects'); return effects ? Results.ok(effects) : Results.permanent('down', 'simc.item-effects'); },
      getSpellDump: async (name: string) => { fetches.push(name); return dump ? Results.ok(dump) : Results.permanent('down', 'simc.spell-dump'); },
    },
  }] });
  return TestBed.inject(ItemDataService);
};

describe('ItemDataService', () => {
  it('reads an item\'s use as the spell its on-use row casts, with what the dump says of it, under the worn item\'s token', async () => {
    const table = await service().items([WEB]);
    expect(table.items['spymasters_web']).toEqual({ id: SPYMASTERS_WEB, name: "Spymaster's Web", use: `item_${SPYMASTERS_WEB}`, use_buff: true, use_damage: null });
    expect(table.spells[`item_${SPYMASTERS_WEB}`]).toMatchObject({ name: "Spymaster's Web", ids: [SPYMASTERS_WEB_USE], cooldown: WEB_CD_S, duration: WEB_DURATION_S, gcd: 0 });
  });

  it('keys and names the item after the worn piece, not after the spell its row comments', async () => {
    const table = await service().items([SIGNET]);
    expect(table.items['signet_of_the_priory']).toMatchObject({ name: 'Signet of the Priory', use: `item_${SIGNET_OF_THE_PRIORY}`, use_buff: true });
    expect(table.spells[`item_${SIGNET_OF_THE_PRIORY}`]).toMatchObject({ name: 'Signet of the Priory', ids: [BOLSTERING_LIGHT] });
  });

  it('reads a use that deals damage of its own as on-use damage, and its buff as unknown, since a use may grant one through a spell it triggers', async () => {
    const table = await service().items([worn(URN, 'Sealed Chaos Urn')]);
    expect(table.items['sealed_chaos_urn']).toMatchObject({ use_buff: null, use_damage: true });
  });

  it('reads the use\'s own global cooldown and cast time, which not every trinket skips', async () => {
    const table = await service().items([PUZZLE_BOX]);
    expect(table.spells[`item_${ALGETHAR_PUZZLE_BOX}`]).toMatchObject({ gcd: PUZZLE_GCD_S, cast_time: PUZZLE_CAST_S });
  });

  it('reads an item with equip effects only as one with no use, and leaves out an item the data does not list or the report left nameless', async () => {
    const table = await service().items([SACBROOD, worn(UNLISTED, 'Unlisted'), { ...WEB, name: '' }]);
    expect(table.items['arakara_sacbrood']).toEqual({ id: ARAKARA_SACBROOD, name: 'Ara-Kara Sacbrood', use: null, use_buff: false, use_damage: false });
    expect(Object.keys(table.items)).toEqual(['arakara_sacbrood']);
    expect(table.spells).toEqual({});
  });

  it('reads the item effects and the non-class dump once for the session', async () => {
    const fetches: string[] = [];
    const items = service(EFFECTS, DUMP, fetches);
    await items.items([WEB]);
    await items.items([WEB, SACBROOD]);
    expect(fetches).toEqual(['effects', 'nonclass']);
  });

  it('leaves the dump unread for items without a use', async () => {
    const fetches: string[] = [];
    await service(EFFECTS, DUMP, fetches).items([SACBROOD]);
    expect(fetches).toEqual(['effects']);
  });

  it('resolves nothing while the item effects fail to load, and asks again on the next pull', async () => {
    const fetches: string[] = [];
    const items = service('', DUMP, fetches);
    expect(await items.items([WEB])).toEqual({ items: {}, spells: {} });
    await items.items([WEB]);
    expect(fetches).toEqual(['effects', 'effects']);
  });

  it('leaves out an item whose use the dump fails to describe, so it reads as unknown rather than as one with no use, and asks again on the next pull', async () => {
    const fetches: string[] = [];
    const items = service(EFFECTS, '', fetches);
    expect(Object.keys((await items.items([WEB, SACBROOD])).items)).toEqual(['arakara_sacbrood']);
    await items.items([WEB]);
    expect(fetches).toEqual(['effects', 'nonclass', 'nonclass']);
  });
});
