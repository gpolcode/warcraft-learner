import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../wcl/wcl-api-service';
import { WclEvent, WclFight, WclReport, WclTableBlob } from '../wcl/wcl.models';
import { Result, Results } from '../../../shared/util-http/result';
import { PullOverviewFeatureService, PullOverviewView } from './pull-overview-feature-service';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { wclReport } from '../../../../../testing/builders/wcl-fixtures';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { death } from '../../../../../testing/builders/events';

const wclProjections = TestBed.inject(WclProjectionsService);
const timed = (events: WclEvent[]) => wclProjections.withRelativeS(events, 0);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
] });
const svc = TestBed.inject(PullOverviewFeatureService);
TestBed.resetTestingModule();

const PLAYER_ID = 5;
const OTHER_PLAYER = 9;
const ABSENT_PLAYER_ID = 77; // a player with no row in the damage table (e.g. a healer)

// A null/failed damage table blob is a permanent load failure, not a measured 0.
const MISSING_TABLE_ERROR = Results.permanent('Damage table missing for this pull.', 'pull-overview.damage-table');

const OVERWHELMING_BLAST = 214001;
const FROST_BOMB = 198002;

const MS_PER_S = 1000;

const FIGHT_DURATION_S = 132; // 2:12
const PLAYER_TOTAL = 163_680_000; // total damage -> 1.24M dps over the pull
const EXPECTED_DPS = PLAYER_TOTAL / FIGHT_DURATION_S;

const DEATH_1_AT_S = 41;
const DEATH_2_AT_S = 93;

const BOSS_PERCENTAGE = 41;

function okValue<T>(result: Result<T>): T {
  if (!result.ok) assert.fail(`expected an ok result, got a ${result.error.kind} error`);
  return result.value;
}

function fight(over: Partial<WclFight> = {}): WclFight {
  return {
    id: 6, name: 'Boss', startTime: 0, endTime: FIGHT_DURATION_S * MS_PER_S,
    kill: false, encounterID: 3183, attempt: 3, duration_s: FIGHT_DURATION_S, friendlyPlayers: [], fightPercentage: BOSS_PERCENTAGE,
    ...over,
  };
}

function report(): WclReport {
  return wclReport({
    fights: [fight()],
    actors: [],
    abilities: [
      { gameID: OVERWHELMING_BLAST, name: 'Overwhelming Blast', icon: '' },
      { gameID: FROST_BOMB, name: 'Frost Bomb', icon: '' },
    ],
  });
}

describe('dpsFromTable', () => {
  const blob = { data: { entries: [{ id: OTHER_PLAYER, total: 999 }, { id: PLAYER_ID, total: PLAYER_TOTAL }] } };

  it('divides the player entry total by the pull length', () => {
    expect(svc['dpsFromTable'](blob, PLAYER_ID, FIGHT_DURATION_S)).toEqual(Results.ok(EXPECTED_DPS));
  });

  it('parses a JSON-string blob the same as an object blob', () => {
    expect(svc['dpsFromTable'](JSON.stringify(blob), PLAYER_ID, FIGHT_DURATION_S)).toEqual(Results.ok(EXPECTED_DPS));
  });

  it('reports a null blob as a failed load, so the player never shows a bogus measured 0', () => {
    expect(svc['dpsFromTable'](null, PLAYER_ID, FIGHT_DURATION_S)).toEqual(MISSING_TABLE_ERROR);
  });

  it('reports an unparseable string blob as a failed load, not a measured 0', () => {
    expect(svc['dpsFromTable']('{ not json', PLAYER_ID, FIGHT_DURATION_S)).toEqual(MISSING_TABLE_ERROR);
  });

  it('reports a valid-JSON blob without a data.entries array as a failed load, not a measured 0', () => {
    expect(svc['dpsFromTable']({ data: {} }, PLAYER_ID, FIGHT_DURATION_S)).toEqual(MISSING_TABLE_ERROR);
  });

  it('reports a real 0 for a player absent from a valid table (a healer with no damage entry)', () => {
    expect(svc['dpsFromTable'](blob, ABSENT_PLAYER_ID, FIGHT_DURATION_S)).toEqual(Results.ok(0));
  });

  it('reports a real 0 for a zero-length pull - an empty pull measures no damage, not a failure', () => {
    expect(svc['dpsFromTable'](blob, PLAYER_ID, 0)).toEqual(Results.ok(0));
  });
});

describe('abilityNameMap', () => {
  it('keys ability names by game id', () => {
    const names = svc['abilityNameMap'](report());
    expect(names.get(OVERWHELMING_BLAST)).toBe('Overwhelming Blast');
    expect(names.get(FROST_BOMB)).toBe('Frost Bomb');
  });
});

describe('buildDeathRows', () => {
  const names = svc['abilityNameMap'](report());

  it('projects the player deaths oldest-first with 1-based index, relative time and ability', () => {
    const deaths = [
      death(PLAYER_ID, DEATH_2_AT_S, FROST_BOMB),
      death(PLAYER_ID, DEATH_1_AT_S, OVERWHELMING_BLAST),
      death(OTHER_PLAYER, DEATH_1_AT_S, OVERWHELMING_BLAST), // a raidmate - excluded
    ];
    expect(svc['buildDeathRows'](timed(deaths), PLAYER_ID, names)).toEqual([
      { index: 1, timeS: DEATH_1_AT_S, ability: 'Overwhelming Blast' },
      { index: 2, timeS: DEATH_2_AT_S, ability: 'Frost Bomb' },
    ]);
  });

  it('leaves the ability empty when the death carried no killing ability', () => {
    const deaths = [death(PLAYER_ID, DEATH_1_AT_S)];
    expect(svc['buildDeathRows'](timed(deaths), PLAYER_ID, names)).toEqual([
      { index: 1, timeS: DEATH_1_AT_S, ability: '' },
    ]);
  });
});

interface FakeCalls { dataTypes: string[] }

function makeService(over: {
  fight?: Partial<WclFight>; deaths?: WclEvent[];
  table?: WclTableBlob | null;
} = {}): {
  service: PullOverviewFeatureService; calls: FakeCalls;
} {
  const calls: FakeCalls = { dataTypes: [] };
  const defaultTable: WclTableBlob = { data: { entries: [{ id: PLAYER_ID, total: PLAYER_TOTAL }] } };
  const wcl = {
    getReport: async () => report(),
    getDamageDoneTable: async () => ('table' in over ? over.table : defaultTable),
    getAllEvents: async (_c: string, _f: number, dataType: string) => {
      calls.dataTypes.push(dataType);
      return dataType === 'Deaths' ? (over.deaths ?? []) : [];
    },
    getResurrects: async () => [],
  };
  TestBed.configureTestingModule({ providers: [{ provide: WclApiService, useValue: wcl as unknown as WclApiService }] });
  return { service: TestBed.inject(PullOverviewFeatureService), calls };
}

describe('PullOverviewFeatureService.loadView', () => {
  const RAID_D2_AT_S = 60;
  const RAID_D3_AT_S = 90; // player@41 + 2 others, spread out - 3 dead at once, no window

  async function wipedPull(): Promise<{ view: PullOverviewView; calls: FakeCalls }> {
    const { service, calls } = makeService({
      deaths: [
        death(PLAYER_ID, DEATH_1_AT_S, OVERWHELMING_BLAST),
        death(OTHER_PLAYER, RAID_D2_AT_S, FROST_BOMB),
        death(OTHER_PLAYER + 1, RAID_D3_AT_S, FROST_BOMB),
      ],
    });
    return { view: okValue(await service.loadView('r', PLAYER_ID, fight())), calls };
  }

  it('reports a wipe with the boss percentage, pull length and player dps', async () => {
    const { view } = await wipedPull();
    expect(view.result).toBe('wipe');
    expect(view.bossPercentage).toBe(BOSS_PERCENTAGE);
    expect(view.durationS).toBe(FIGHT_DURATION_S);
    expect(view.dps).toBe(EXPECTED_DPS);
  });

  it('lists the player deaths and leaves the raidmates out', async () => {
    const { view } = await wipedPull();
    expect(view.deaths).toEqual([{ index: 1, timeS: DEATH_1_AT_S, ability: 'Overwhelming Blast' }]);
  });

  it('times the wipe at the third concurrent death', async () => {
    const { view } = await wipedPull();
    expect(view.outcomeTimeS).toBe(RAID_D3_AT_S);
  });

  it('names the killing blow off the death event, so a death costs no damage-taken read', async () => {
    const { calls } = await wipedPull();
    expect(calls.dataTypes).not.toContain('DamageTaken');
  });

  it('marks a clean kill at the fight end', async () => {
    const { service } = makeService({ deaths: [death(OTHER_PLAYER, DEATH_1_AT_S, OVERWHELMING_BLAST)] });
    const result = await service.loadView('r', PLAYER_ID, fight({ kill: true, fightPercentage: 0 }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const view = result.value;
    expect(view.result).toBe('kill');
    expect(view.deaths).toEqual([]);
    expect(view.outcomeTimeS).toBe(FIGHT_DURATION_S);
  });

  it('fails the load when the damage table is missing, so the pull is not scored a bogus 0 DPS', async () => {
    const { service } = makeService({
      table: null,
      deaths: [death(OTHER_PLAYER, DEATH_1_AT_S, OVERWHELMING_BLAST)],
    });
    const result = await service.loadView('r', PLAYER_ID, fight({ kill: true, fightPercentage: 0 }));

    expect(result).toEqual(MISSING_TABLE_ERROR);
  });
});
