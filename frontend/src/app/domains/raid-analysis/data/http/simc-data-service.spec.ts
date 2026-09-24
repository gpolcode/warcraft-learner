import { describe, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SimcDataService } from './simc-data-service';
import { Results } from '../../../shared/util-http/result';

const TIER = { branch: 'midnight', dir: 'MID2' };
const APL_ROOT = 'https://raw.githubusercontent.com/simulationcraft/simc/midnight/ActionPriorityLists/default';
const APL_URL = `${APL_ROOT}/deathknight_frost.simc`;
const MULTI_WORD_APL_URL = `${APL_ROOT}/hunter_beast_mastery.simc`;
const DUMP_URL = 'https://raw.githubusercontent.com/simulationcraft/simc/midnight/SpellDataDump/deathknight.txt';
const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;
const APL_TEXT = 'actions=obliterate';
const DUMP_TEXT = 'SimulationCraft 1210-01 for World of Warcraft 12.1.0.69587 Live';
const APL_REPRO_ID = 'simc.apl';

function setup(): { service: SimcDataService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({ providers: [SimcDataService, provideHttpClient(), provideHttpClientTesting()] });
  return { service: TestBed.inject(SimcDataService), httpMock: TestBed.inject(HttpTestingController) };
}

describe('SimcDataService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); });

  it('fetches the default action priority list of one spec', async () => {
    const { service, httpMock } = setup();
    const pending = service.getApl(TIER, 'DeathKnight', 'Frost');
    httpMock.expectOne(APL_URL).flush(APL_TEXT);
    expect(await pending).toEqual(Results.ok(APL_TEXT));
  });

  it('names the file after the class module, so a two-word spec reads as one underscored token', async () => {
    const { service, httpMock } = setup();
    const pending = service.getApl(TIER, 'Hunter', 'Beast Mastery');
    httpMock.expectOne(MULTI_WORD_APL_URL).flush(APL_TEXT);
    expect(await pending).toEqual(Results.ok(APL_TEXT));
  });

  it('is missing for a spec SimulationCraft writes no list for, the load itself having succeeded', async () => {
    const { service, httpMock } = setup();
    const pending = service.getApl(TIER, 'DeathKnight', 'Frost');
    httpMock.expectOne(APL_URL).flush('', { status: HTTP_NOT_FOUND, statusText: 'Not Found' });
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'missing' });
  });

  it('is transient when GitHub is unreachable', async () => {
    const { service, httpMock } = setup();
    const failed = service.getApl(TIER, 'DeathKnight', 'Frost');
    httpMock.expectOne(APL_URL).error(new ProgressEvent('error'));
    expect(await failed).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('is permanent when GitHub refuses the list, so a refusal never reads as a spec without one', async () => {
    const { service, httpMock } = setup();
    const failed = service.getApl(TIER, 'DeathKnight', 'Frost');
    httpMock.expectOne(APL_URL).flush('nope', { status: HTTP_FORBIDDEN, statusText: 'Forbidden' });
    const result = await failed;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'permanent', id: APL_REPRO_ID });
  });

  it('fetches the class dump by the lower-cased class slug', async () => {
    const { service, httpMock } = setup();
    const pending = service.getSpellDataDump(TIER, 'DeathKnight');
    httpMock.expectOne(DUMP_URL).flush(DUMP_TEXT);
    expect(await pending).toEqual(Results.ok(DUMP_TEXT));
  });
});
