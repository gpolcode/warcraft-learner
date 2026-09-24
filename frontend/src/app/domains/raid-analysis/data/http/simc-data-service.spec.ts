import { describe, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Results } from '../../../shared/util-http/result';
import { SimcDataService } from './simc-data-service';

const SIMC_RAW = 'https://raw.githubusercontent.com/simulationcraft/simc/midnight';
const HTTP_NOT_FOUND = 404;

function setup(): { service: SimcDataService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return { service: TestBed.inject(SimcDataService), httpMock: TestBed.inject(HttpTestingController) };
}

describe('SimcDataService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); });

  it('reads a spec\'s profile under its class and spec labels, spaces as underscores', async () => {
    const { service, httpMock } = setup();
    const pending = service.getProfile('Death Knight', 'Unholy');
    httpMock.expectOne(`${SIMC_RAW}/profiles/MID2/MID2_Death_Knight_Unholy.simc`).flush('actions=festering_strike');
    expect(await pending).toEqual(Results.ok('actions=festering_strike'));
  });

  it('reads a class\'s spell dump under its lowercased class slug', async () => {
    const { service, httpMock } = setup();
    const pending = service.getSpellDump('DeathKnight');
    httpMock.expectOne(`${SIMC_RAW}/SpellDataDump/deathknight.txt`).flush('Name : Death Coil (id=47541)');
    expect((await pending).ok).toBe(true);
  });

  it('reads a profile SimC does not ship as missing', async () => {
    const { service, httpMock } = setup();
    const pending = service.getProfile('Evoker', 'Augmentation');
    httpMock.expectOne(`${SIMC_RAW}/profiles/MID2/MID2_Evoker_Augmentation.simc`)
      .flush('404: Not Found', { status: HTTP_NOT_FOUND, statusText: 'Not Found' });
    expect(await pending).toMatchObject({ error: { kind: 'missing' } });
  });
});
