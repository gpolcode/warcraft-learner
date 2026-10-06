import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Results } from '../../../shared/util-http/result';
import { SimcDataService } from '../http/simc-data-service';
import { ItemDataService } from './item-data-service';

const SPYMASTERS_WEB = 220202;
const WEB_USE = 444959;
const WEB_EQUIP = 444958;
const SACBROOD = 219314;
const SACBROOD_EQUIP = 443541;
const UNLISTED = 999999;
const WEB_CD_S = 20;
const WEB_DURATION_S = 20;
/** The rows as `item_effect.inc` writes them: effect id, spell, item, index, trigger (0 on use, 1 on equip), cooldown fields, then the item's name. */
const EFFECTS = `
static constexpr std::array<item_effect_t, 3> __item_effect_data { {
  { 184102, ${WEB_EQUIP}, ${SPYMASTERS_WEB},   0,   1,    0,      -1,      -1 }, // Spymaster's Web
  { 184103, ${WEB_USE}, ${SPYMASTERS_WEB},   1,   0,    0,      -1,      -1 }, // Spymaster's Web
  { 183893, ${SACBROOD_EQUIP}, ${SACBROOD},   0,   1,    0,      -1,      -1 }, // Ara-Kara Sacbrood
} };
`;
const DUMP = [
  `Name             : Spymaster's Web (id=${WEB_USE}) `,
  `Duration         : ${WEB_DURATION_S} seconds`,
  `Cooldown         : ${WEB_CD_S} seconds`,
  'Effects          :',
  '#1 (id=1141654)  : Apply Aura (6) | Attribute (29)',
  '                   Base Value: 0 | Scaled Value: 0 | Stat: Int | Target: Self (1)',
  '',
  `Name             : Spymaster's Web (id=${WEB_EQUIP}) [Passive] `,
  'Effects          :',
  '#1 (id=1141651)  : Apply Aura (6) | Dummy (4)',
  '                   Base Value: 0 | Target: Self (1)',
  '',
].join('\n');

const service = (effects = EFFECTS, dump = DUMP, fetches: string[] = []) => {
  TestBed.configureTestingModule({ providers: [{
    provide: SimcDataService,
    useValue: {
      getItemEffects: async () => { fetches.push('effects'); return effects ? Results.ok(effects) : Results.permanent('down', 'simc.item-effects'); },
      getSpellDump: async (name: string) => { fetches.push(name); return Results.ok(dump); },
    },
  }] });
  return TestBed.inject(ItemDataService);
};

describe('ItemDataService', () => {
  it('reads an item\'s use as the spell its on-use effect casts, with what the dump says of it', async () => {
    const table = await service().items([SPYMASTERS_WEB]);
    expect(table.items[SPYMASTERS_WEB]).toEqual({ name: "Spymaster's Web", use: `item_${SPYMASTERS_WEB}`, use_buff: true, use_damage: false });
    expect(table.spells[`item_${SPYMASTERS_WEB}`]).toMatchObject({ name: "Spymaster's Web", ids: [WEB_USE], cooldown: WEB_CD_S, duration: WEB_DURATION_S, gcd: 0 });
  });

  it('reads an item with equip effects only as one with no use, and leaves out an item the data does not list', async () => {
    const table = await service().items([SACBROOD, UNLISTED]);
    expect(table.items[SACBROOD]).toEqual({ name: 'Ara-Kara Sacbrood', use: null, use_buff: false, use_damage: false });
    expect(table.items[UNLISTED]).toBeUndefined();
    expect(table.spells).toEqual({});
  });

  it('reads the item effects and the non-class dump once for the session', async () => {
    const fetches: string[] = [];
    const items = service(EFFECTS, DUMP, fetches);
    await items.items([SPYMASTERS_WEB]);
    await items.items([SPYMASTERS_WEB, SACBROOD]);
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
    expect(await items.items([SPYMASTERS_WEB])).toEqual({ items: {}, spells: {} });
    await items.items([SPYMASTERS_WEB]);
    expect(fetches).toEqual(['effects', 'effects']);
  });
});
