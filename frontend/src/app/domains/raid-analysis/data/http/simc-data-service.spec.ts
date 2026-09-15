import { describe, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SimcDataService } from './simc-data-service';

const TIER = { branch: 'midnight', dir: 'MID2' };
const PROFILE_URL = 'https://raw.githubusercontent.com/simulationcraft/simc/midnight/profiles/MID2/MID2_Death_Knight_Frost.simc';
const DUMP_URL = 'https://raw.githubusercontent.com/simulationcraft/simc/midnight/SpellDataDump/deathknight.txt';
const HTTP_NOT_FOUND = 404;
const PROFILE_TEXT = 'actions=obliterate';

function setup(): { service: SimcDataService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({ providers: [SimcDataService, provideHttpClient(), provideHttpClientTesting()] });
  return { service: TestBed.inject(SimcDataService), httpMock: TestBed.inject(HttpTestingController) };
}

describe('SimcDataService.parseTier', () => {
  it('splits branch and directory and rejects anything else', () => {
    const { service } = setup();
    expect(service.parseTier('midnight/MID2')).toEqual(TIER);
    expect(service.parseTier('MID2')).toBeNull();
    expect(service.parseTier('a/b/c')).toBeNull();
    expect(service.parseTier(null)).toBeNull();
  });
});

describe('SimcDataService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); });

  it('fetches a profile by its underscored class and spec labels', async () => {
    const { service, httpMock } = setup();
    const pending = service.getProfile(TIER, 'Death Knight', 'Frost');
    httpMock.expectOne(PROFILE_URL).flush(PROFILE_TEXT);
    expect(await pending).toEqual({ ok: true, value: PROFILE_TEXT });
  });

  it('reports a missing profile as missing rather than as a failure', async () => {
    const { service, httpMock } = setup();
    const pending = service.getProfile(TIER, 'Death Knight', 'Frost');
    httpMock.expectOne(PROFILE_URL).flush('', { status: HTTP_NOT_FOUND, statusText: 'Not Found' });
    const result = await pending;
    expect(!result.ok && result.error.kind).toBe('missing');
  });

  it('fetches the class dump by the lower-cased class slug', async () => {
    const { service, httpMock } = setup();
    const pending = service.getSpellDataDump(TIER, 'DeathKnight');
    httpMock.expectOne(DUMP_URL).flush('Name : Obliterate (id=49020)');
    expect((await pending).ok).toBe(true);
  });
});
