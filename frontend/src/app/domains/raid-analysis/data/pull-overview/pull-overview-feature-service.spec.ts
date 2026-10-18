import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../wcl/wcl-api-service';
import { RankingMetric, WclEvent, WclFight, WclReport, WclTableBlob } from '../wcl/wcl.models';
import { Result, Results } from '../../../shared/util-http/result';
import { PullOverviewFeatureService, PullOverviewView } from './pull-overview-feature-service';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { wclReport } from '../../../../../testing/builders/wcl-fixtures';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { death, resurrect } from '../../../../../testing/builders/events';
import { parseRanking } from '../../../../../testing/builders/bench-sources';
import { GEAR_DATA_SOURCE, GearBench } from '../gear/gear-data-source';

const wclProjections = TestBed.inject(WclProjectionsService);
const timed = (events: WclEvent[]) => wclProjections.withRelativeS(events, 0);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: GEAR_DATA_SOURCE, useValue: {} },
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

describe('totalFromTable', () => {
  const blob = { data: { entries: [{ id: OTHER_PLAYER, total: 999 }, { id: PLAYER_ID, total: PLAYER_TOTAL }] } };

  it('reads the player entry\'s total', () => {
    expect(svc['totalFromTable'](blob, PLAYER_ID, 'dps')).toEqual(Results.ok(PLAYER_TOTAL));
  });

  it('parses a JSON-string blob the same as an object blob', () => {
    expect(svc['totalFromTable'](JSON.stringify(blob), PLAYER_ID, 'dps')).toEqual(Results.ok(PLAYER_TOTAL));
  });

  it('reports a null blob as a failed load, so the player never shows a bogus measured 0', () => {
    expect(svc['totalFromTable'](null, PLAYER_ID, 'dps')).toEqual(MISSING_TABLE_ERROR);
  });

  it('names the healing table when a healer\'s table is missing', () => {
    expect(svc['totalFromTable'](null, PLAYER_ID, 'hps')).toEqual(Results.permanent('Healing table missing for this pull.', 'pull-overview.damage-table'));
  });

  it('reports an unparseable string blob as a failed load, not a measured 0', () => {
    expect(svc['totalFromTable']('{ not json', PLAYER_ID, 'dps')).toEqual(MISSING_TABLE_ERROR);
  });

  it('reports a valid-JSON blob without a data.entries array as a failed load, not a measured 0', () => {
    expect(svc['totalFromTable']({ data: {} }, PLAYER_ID, 'dps')).toEqual(MISSING_TABLE_ERROR);
  });

  it('reports a real 0 for a player absent from a valid table', () => {
    expect(svc['totalFromTable'](blob, ABSENT_PLAYER_ID, 'dps')).toEqual(Results.ok(0));
  });
});

describe('perSecond', () => {
  it('divides the total by the span', () => {
    expect(svc['perSecond'](PLAYER_TOTAL, FIGHT_DURATION_S)).toBe(EXPECTED_DPS);
  });

  it('reports a real 0 over an empty span, which measures nothing rather than failing', () => {
    expect(svc['perSecond'](PLAYER_TOTAL, 0)).toBe(0);
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

interface FakeCalls { dataTypes: string[]; tables: string[] }

const SPEC = 'SubtletyRogue';
const HEALER_SPEC = 'RestorationShaman';
const ENCOUNTER_ID = 3183;
const TOP_LOW = 241_000;
const TOP_HIGH = 258_000;

function gearBench(metric: RankingMetric): Result<GearBench> {
  return Results.ok({
    spec: SPEC, encounter_id: ENCOUNTER_ID, encounter_name: 'Boss', metric, sample_count: 2,
    sources: [parseRanking({ rank: 1, amount: TOP_HIGH }), parseRanking({ rank: 2, amount: TOP_LOW })],
    talent_builds: [], talent_nodes: [], talent_sample_count: 0, trinket_sets: [], enchants: {}, per_parse: [],
  });
}

function makeService(over: {
  fight?: Partial<WclFight>; deaths?: WclEvent[]; resurrects?: WclEvent[];
  table?: WclTableBlob | null; bench?: Result<GearBench>;
} = {}): {
  service: PullOverviewFeatureService; calls: FakeCalls;
} {
  const calls: FakeCalls = { dataTypes: [], tables: [] };
  const defaultTable: WclTableBlob = { data: { entries: [{ id: PLAYER_ID, total: PLAYER_TOTAL }] } };
  const wcl = {
    getReport: async () => report(),
    getTable: async (_c: string, _f: number, dataType: string) => {
      calls.tables.push(dataType);
      return 'table' in over ? over.table : defaultTable;
    },
    getAllEvents: async (_c: string, _f: number, dataType: string) => {
      calls.dataTypes.push(dataType);
      return dataType === 'Deaths' ? (over.deaths ?? []) : [];
    },
    getResurrects: async () => over.resurrects ?? [],
  };
  const bench = over.bench ?? Results.missing('Not yet ingested.');
  TestBed.configureTestingModule({ providers: [
    { provide: WclApiService, useValue: wcl as unknown as WclApiService },
    { provide: GEAR_DATA_SOURCE, useValue: { getBench: () => Promise.resolve(bench) } },
  ] });
  return { service: TestBed.inject(PullOverviewFeatureService), calls };
}

const pullOf = (spec: string = SPEC) => ({ spec, encounterId: ENCOUNTER_ID, reportCode: 'r', playerId: PLAYER_ID });

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
    return { view: okValue(await service.loadView(pullOf(), fight())), calls };
  }

  it('reports a wipe with the boss percentage, pull length and player dps', async () => {
    const { view } = await wipedPull();
    expect(view.result).toBe('wipe');
    expect(view.bossPercentage).toBe(BOSS_PERCENTAGE);
    expect(view.durationS).toBe(FIGHT_DURATION_S);
    expect(view.amount).toBe(EXPECTED_DPS);
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
    const result = await service.loadView(pullOf(), fight({ kill: true, fightPercentage: 0 }));

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
    const result = await service.loadView(pullOf(), fight({ kill: true, fightPercentage: 0 }));

    expect(result).toEqual(MISSING_TABLE_ERROR);
  });

  it('measures a healer on healing, the figure their top logs are ranked on', async () => {
    const { service, calls } = makeService();

    const view = okValue(await service.loadView(pullOf(HEALER_SPEC), fight({ kill: true })));

    expect(view.metric).toBe('hps');
    expect(calls.tables).toEqual(['Healing']);
  });

  it('adds the figure over the player\'s alive time when they died, counting a battle res back to life', async () => {
    const RESURRECT_AT_S = 61;
    const DEAD_S = RESURRECT_AT_S - DEATH_1_AT_S;
    const { service } = makeService({
      deaths: [death(PLAYER_ID, DEATH_1_AT_S, OVERWHELMING_BLAST)], resurrects: [resurrect(PLAYER_ID, RESURRECT_AT_S)],
    });

    const view = okValue(await service.loadView(pullOf(), fight({ kill: true })));

    expect(view.aliveAmount).toBe(PLAYER_TOTAL / (FIGHT_DURATION_S - DEAD_S));
  });

  it('gives no alive figure to a player who never died', async () => {
    const { service } = makeService();

    expect(okValue(await service.loadView(pullOf(), fight({ kill: true }))).aliveAmount).toBeNull();
  });

  it('spans the top logs\' ranked figures as the reference', async () => {
    const { service } = makeService({ bench: gearBench('dps') });

    expect(okValue(await service.loadView(pullOf(), fight())).reference).toEqual({ lo: TOP_LOW, hi: TOP_HIGH });
  });

  it('draws no reference from a bench ranked on another figure', async () => {
    const { service } = makeService({ bench: gearBench('dps') });

    expect(okValue(await service.loadView(pullOf(HEALER_SPEC), fight())).reference).toBeNull();
  });

  it('draws no reference without a bench', async () => {
    const { service } = makeService();

    expect(okValue(await service.loadView(pullOf(), fight())).reference).toBeNull();
  });
});
