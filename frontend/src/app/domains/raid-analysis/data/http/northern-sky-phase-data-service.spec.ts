import { describe, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Results } from '../../../shared/util-http/result';
import { NorthernSkyPhaseDataService } from './northern-sky-phase-data-service';

// Pure parsing only: the prototype instance skips the HttpClient wiring the parsing never touches.
const phaseData = Object.create(NorthernSkyPhaseDataService.prototype) as NorthernSkyPhaseDataService;

const ADDON_ROOT = 'https://raw.githubusercontent.com/Reloe/NorthernSkyRaidTools/main/NorthernSkyRaidTools';
const TOC_URL = `${ADDON_ROOT}/NorthernSkyRaidTools.toc`;
const MANIFEST_URL = `${ADDON_ROOT}/BossTimelines/BossTimelines.xml`;
const PHASED_ID = 3445;
const SINGLE_PHASE_ID = 3379;
const HTTP_FORBIDDEN = 403;

function timeline(encounterId: number, phases: string): string {
  return `local heroicData = {
    phases = { [1] = {start = 0}, [2] = {start = 999} },
}
local mythicData = {
    phases = { ${phases} },
    abilities = { {name = "Whatever", phase = 1, times = {1, 2}} },
}
NSI.BossTimelines[${encounterId}] = {
    Heroic = heroicData,
    Mythic = mythicData,
}`;
}

const PHASED_TIMELINE = timeline(PHASED_ID, '[1] = {start = 0}, [1.5] = {start = 197.89}, [2] = {start = 56}');
const SINGLE_PHASE_TIMELINE = timeline(SINGLE_PHASE_ID, '[1] = {start = 0}, [2] = {start = 550}');
const REARMING_ALERT = `local encID = ${PHASED_ID}\nfunction M() self:StartReminders(self.Phase) end`;
const STATIC_ALERT = `local encID = ${SINGLE_PHASE_ID}\nfunction M() self:FireCallback("x") end`;

const TOC = `NorthernSkyRaidTools.lua
BossTimelines\\BossTimelines.xml
EncounterAlerts/Alerts.lua
EncounterAlerts/MidnightS2/EntombedSentinels.lua
EncounterAlerts/MidnightS2/NymrissaWavecaller.lua
EncounterAlerts\\Locales\\enUS.lua`;
const MANIFEST = `<Ui>
  <Script file="BossTimelines.lua"/>
  <Script file="MidnightS2/EntombedSentinels.lua"/>
  <Script file="MidnightS2/NymrissaWavecaller.lua"/>
</Ui>`;

function setup(): { service: NorthernSkyPhaseDataService; httpMock: HttpTestingController } {
  TestBed.configureTestingModule({
    providers: [NorthernSkyPhaseDataService, provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    service: TestBed.inject(NorthernSkyPhaseDataService),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

// The per-file reads are only issued once the two manifests resolve, so expecting them needs a turn of the microtask queue first.
async function flushManifests(httpMock: HttpTestingController): Promise<void> {
  httpMock.expectOne(TOC_URL).flush(TOC);
  httpMock.expectOne(MANIFEST_URL).flush(MANIFEST);
  await Promise.resolve();
}

async function flushAddon(httpMock: HttpTestingController, phasedAlert = REARMING_ALERT, otherAlert = STATIC_ALERT): Promise<void> {
  await flushManifests(httpMock);
  httpMock.expectOne(`${ADDON_ROOT}/EncounterAlerts/MidnightS2/EntombedSentinels.lua`).flush(phasedAlert);
  httpMock.expectOne(`${ADDON_ROOT}/EncounterAlerts/MidnightS2/NymrissaWavecaller.lua`).flush(otherAlert);
  httpMock.expectOne(`${ADDON_ROOT}/BossTimelines/MidnightS2/EntombedSentinels.lua`).flush(PHASED_TIMELINE);
  httpMock.expectOne(`${ADDON_ROOT}/BossTimelines/MidnightS2/NymrissaWavecaller.lua`).flush(SINGLE_PHASE_TIMELINE);
}

describe('rearmingEncounterIds', () => {
  it('keeps an encounter whose module re-arms reminders and drops one that never does', () => {
    expect(phaseData['rearmingEncounterIds']([REARMING_ALERT, STATIC_ALERT])).toEqual(new Set([PHASED_ID]));
  });

  it('ignores a file carrying no encounter id', () => {
    expect(phaseData['rearmingEncounterIds']([''])).toEqual(new Set());
  });
});

describe('mythicPhases', () => {
  it('reads the Mythic table, not the Heroic one, in ascending start order', () => {
    expect(phaseData['mythicPhases'](PHASED_TIMELINE)).toEqual({
      encounterId: PHASED_ID,
      phases: [{ phase: 1, start_s: 0 }, { phase: 2, start_s: 56 }, { phase: 1.5, start_s: 197.89 }],
    });
  });

  it('is null for a file that registers no boss timeline', () => {
    expect(phaseData['mythicPhases']('local mythicData = { phases = { [1] = {start = 0} } }')).toBeNull();
  });
});

describe('indexPhases', () => {
  it('keeps only encounters that both re-arm and declare Mythic phases', () => {
    const indexed = phaseData['indexPhases']([PHASED_TIMELINE, SINGLE_PHASE_TIMELINE], [REARMING_ALERT, STATIC_ALERT]);
    expect(Object.keys(indexed)).toEqual([String(PHASED_ID)]);
  });

  it('drops a re-arming encounter whose timeline never loaded', () => {
    expect(phaseData['indexPhases'](['', SINGLE_PHASE_TIMELINE], [REARMING_ALERT, STATIC_ALERT])).toEqual({});
  });
});

describe('NorthernSkyPhaseDataService', () => {
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); });

  it('resolves the phased encounters from the addon manifests', async () => {
    const { service, httpMock } = setup();
    const pending = service.getPhases();
    await flushAddon(httpMock);
    const result = await pending;
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value[PHASED_ID]).toEqual([{ phase: 1, start_s: 0 }, { phase: 2, start_s: 56 }, { phase: 1.5, start_s: 197.89 }]);
  });

  it('reads the addon once however many benches ask for it', async () => {
    const { service, httpMock } = setup();
    const first = service.getPhases();
    const second = service.getPhases();
    await flushAddon(httpMock);
    expect(await second).toEqual(await first);
  });

  it('re-reads the addon on the next ask after a failed read', async () => {
    const { service, httpMock } = setup();
    const failed = service.getPhases();
    httpMock.expectOne(TOC_URL).error(new ProgressEvent('error'));
    httpMock.expectOne(MANIFEST_URL).flush(MANIFEST);
    expect((await failed).ok).toBe(false);
    const retried = service.getPhases();
    await flushAddon(httpMock);
    expect((await retried).ok).toBe(true);
  });

  it('is transient when one listed file drops mid-read, rather than baking that boss pull-relative', async () => {
    const { service, httpMock } = setup();
    const pending = service.getPhases();
    await flushManifests(httpMock);
    httpMock.expectOne(`${ADDON_ROOT}/EncounterAlerts/MidnightS2/EntombedSentinels.lua`).flush(REARMING_ALERT);
    httpMock.expectOne(`${ADDON_ROOT}/EncounterAlerts/MidnightS2/NymrissaWavecaller.lua`).flush(STATIC_ALERT);
    httpMock.expectOne(`${ADDON_ROOT}/BossTimelines/MidnightS2/EntombedSentinels.lua`).error(new ProgressEvent('error'));
    httpMock.expectOne(`${ADDON_ROOT}/BossTimelines/MidnightS2/NymrissaWavecaller.lua`).flush(SINGLE_PHASE_TIMELINE);
    expect(await pending).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('drops the boss whose file the .toc misspells rather than the whole table', async () => {
    const { service, httpMock } = setup();
    const pending = service.getPhases();
    await flushManifests(httpMock);
    httpMock.expectOne(`${ADDON_ROOT}/EncounterAlerts/MidnightS2/EntombedSentinels.lua`).flush(REARMING_ALERT);
    httpMock.expectOne(`${ADDON_ROOT}/EncounterAlerts/MidnightS2/NymrissaWavecaller.lua`).flush('missing', { status: 404, statusText: 'Not Found' });
    httpMock.expectOne(`${ADDON_ROOT}/BossTimelines/MidnightS2/EntombedSentinels.lua`).flush(PHASED_TIMELINE);
    httpMock.expectOne(`${ADDON_ROOT}/BossTimelines/MidnightS2/NymrissaWavecaller.lua`).flush(SINGLE_PHASE_TIMELINE);
    const result = await pending;
    expect(result.ok).toBe(true);
    if (result.ok) expect(Object.keys(result.value)).toEqual([String(PHASED_ID)]);
  });

  it('is missing when no encounter both re-arms and declares phases, the load itself having succeeded', async () => {
    const { service, httpMock } = setup();
    const pending = service.getPhases();
    await flushAddon(httpMock, STATIC_ALERT);
    expect(await pending).toEqual(Results.missing('No Northern Sky phase tables.'));
  });

  it('is transient when the addon source is unreachable', async () => {
    const { service, httpMock } = setup();
    const failed = service.getPhases();
    httpMock.expectOne(TOC_URL).error(new ProgressEvent('error'));
    httpMock.expectOne(MANIFEST_URL).flush(MANIFEST);
    expect(await failed).toEqual(Results.transient('WCL is unreachable right now.'));
  });

  it('is permanent when the addon host refuses the manifest', async () => {
    const { service, httpMock } = setup();
    const failed = service.getPhases();
    httpMock.expectOne(TOC_URL).flush('nope', { status: HTTP_FORBIDDEN, statusText: 'Forbidden' });
    httpMock.expectOne(MANIFEST_URL).flush(MANIFEST);
    const result = await failed;
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatchObject({ kind: 'permanent', id: 'northern-sky.phases' });
  });
});
