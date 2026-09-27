import { describe, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Results } from '../../../shared/util-http/result';
import { SimcDataService } from './simc-data-service';

const SIMC_RAW = 'https://raw.githubusercontent.com/simulationcraft/simc/HEAD';
const HTTP_NOT_FOUND = 404;

function setup(): { service: SimcDataService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  return { service: TestBed.inject(SimcDataService), httpMock: TestBed.inject(HttpTestingController) };
}

describe('SimcDataService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); });

  it('reads a spec\'s list under its lowercased class slug and spec label, spaces as underscores', async () => {
    const { service, httpMock } = setup();
    const pending = service.getApl('Hunter', 'Beast Mastery');
    httpMock.expectOne(`${SIMC_RAW}/ActionPriorityLists/default/hunter_beast_mastery.simc`).flush('actions=kill_command');
    expect(await pending).toEqual(Results.ok('actions=kill_command'));
  });

  it('reads a class\'s spell dump under its lowercased class slug', async () => {
    const { service, httpMock } = setup();
    const pending = service.getSpellDump('DeathKnight');
    httpMock.expectOne(`${SIMC_RAW}/SpellDataDump/deathknight.txt`).flush('Name : Death Coil (id=47541)');
    expect((await pending).ok).toBe(true);
  });

  it('reads SimC\'s engine code under its own path, and names a class\'s modules beside the code every class shares', async () => {
    const { service, httpMock } = setup();
    expect(service.sourcePaths('Paladin')).toEqual([
      'class_modules/paladin/sc_paladin.cpp', 'class_modules/paladin/sc_paladin_protection.cpp', 'class_modules/paladin/sc_paladin_retribution.cpp', 'player/player.cpp',
    ]);
    const pending = service.getSource('player/player.cpp');
    httpMock.expectOne(`${SIMC_RAW}/engine/player/player.cpp`).flush('buffs.shadowmeld = make_buff( this, "shadowmeld", find_spell( 58984 ) );');
    expect((await pending).ok).toBe(true);
  });

  it('reads a list SimC does not write as missing', async () => {
    const { service, httpMock } = setup();
    const pending = service.getApl('Evoker', 'Preservation');
    httpMock.expectOne(`${SIMC_RAW}/ActionPriorityLists/default/evoker_preservation.simc`)
      .flush('404: Not Found', { status: HTTP_NOT_FOUND, statusText: 'Not Found' });
    expect(await pending).toMatchObject({ error: { kind: 'missing' } });
  });
});
