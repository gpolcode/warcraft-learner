import { describe, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Results } from '../../../shared/util-http/result';
import { EnchantItemDataService } from './enchant-item-data-service';

// Pure dump indexing only: the prototype instance skips the HttpClient wiring the indexing never touches.
const enchantItemData = Object.create(EnchantItemDataService.prototype) as EnchantItemDataService;

const DUMP_URL = 'https://www.raidbots.com/static/data/live/enchantments.json';
const DUMP_REPRO_ID = 'enchant-item-data.dump';
const HTTP_FORBIDDEN = 403;

const ARMOR_KIT_ENCHANT = 8159;
const ARMOR_KIT_ITEM = 244641;
const HELM_ENCHANT = 8017;
const HELM_ITEM = 244007;
const RUNE_ENCHANT = 3368;

const DUMP = [
  { id: ARMOR_KIT_ENCHANT, displayName: '41 Agi/Str & 115 Sta', itemId: ARMOR_KIT_ITEM, itemName: "Forest Hunter's Armor Kit" },
  { id: HELM_ENCHANT, displayName: 'Enchant Helm - Empowered Rune of Avoidance 2', itemId: HELM_ITEM },
  { id: RUNE_ENCHANT, displayName: 'Rune of the Fallen Crusader' },
  { displayName: 'no id', itemId: 1 },
];

function setup(): { service: EnchantItemDataService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [EnchantItemDataService, provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(EnchantItemDataService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

describe('indexEnchantItems', () => {
  it('maps each enchant id to its item id and skips entries with no item or no id', () => {
    expect(enchantItemData['indexEnchantItems'](DUMP)).toEqual({
      [ARMOR_KIT_ENCHANT]: ARMOR_KIT_ITEM,
      [HELM_ENCHANT]: HELM_ITEM,
    });
  });
});

describe('EnchantItemDataService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); });

  it('resolves the enchant-to-item map from the dump', async () => {
    const { service, httpMock } = setup();
    const pending = service.getEnchantItems();
    httpMock.expectOne(DUMP_URL).flush(DUMP);
    const result = await pending;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value[ARMOR_KIT_ENCHANT]).toBe(ARMOR_KIT_ITEM);
  });

  it('is transient when the dump is unreachable', async () => {
    const { service, httpMock } = setup();
    const failed = service.getEnchantItems();
    httpMock.expectOne(DUMP_URL).error(new ProgressEvent('error'));
    expect(await failed).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('is permanent when Raidbots refuses the dump', async () => {
    const { service, httpMock } = setup();
    const failed = service.getEnchantItems();
    httpMock.expectOne(DUMP_URL).flush('nope', { status: HTTP_FORBIDDEN, statusText: 'Forbidden' });
    const result = await failed;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'permanent', id: DUMP_REPRO_ID });
  });

  it('is permanent when the dump answers 200 with a body that is not an enchant list', async () => {
    const { service, httpMock } = setup();
    const failed = service.getEnchantItems();
    httpMock.expectOne(DUMP_URL).flush({ error: 'maintenance' });
    const result = await failed;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'permanent', id: DUMP_REPRO_ID });
  });
});
