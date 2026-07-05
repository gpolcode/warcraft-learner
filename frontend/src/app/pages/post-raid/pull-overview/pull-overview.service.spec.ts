import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { WclEvent, WclFight, WclReport } from '../../../core/models/wcl.models';
import {
  PullOverviewFeatureService,
  dpsFromTable, abilityNameMap, lethalHitAmount, buildDeathRows, wipeTimeS,
} from './pull-overview.service';

// --- readable fixture constants -------------------------------------------------
const PLAYER_ID = 5;
const OTHER_PLAYER = 9;
const KILLER_ID = 88;

const OVERWHELMING_BLAST = 214001;
const FROST_BOMB = 198002;

const FIGHT_START_MS = 1_000_000; // report-absolute start of the pull
const MS_PER_S = 1000;

const FIGHT_DURATION_S = 132; // 2:12
const PLAYER_TOTAL = 163_680_000; // total damage -> 1.24M dps over the pull
const EXPECTED_DPS = PLAYER_TOTAL / FIGHT_DURATION_S;

const DEATH_1_AT_S = 41;
const DEATH_2_AT_S = 93;
const BLAST_UNMITIGATED = 214_000;
const BLAST_AMOUNT = 30_000; // post-mitigation; the row shows the unmitigated hit
const BOMB_AMOUNT = 198_000;

function deathEvent(targetID: number, atS: number, killingAbilityGameID: number): WclEvent {
  return { type: 'death', timestamp: FIGHT_START_MS + atS * MS_PER_S, abilityGameID: 0, targetID, sourceID: KILLER_ID, killingAbilityGameID };
}

function dtEvent(abilityGameID: number, atS: number, amount: number, unmitigatedAmount?: number): WclEvent {
  const event: WclEvent = { type: 'damage', timestamp: FIGHT_START_MS + atS * MS_PER_S, abilityGameID, targetID: PLAYER_ID, amount };
  if (unmitigatedAmount != null) event.unmitigatedAmount = unmitigatedAmount;
  return event;
}

function fight(over: Partial<WclFight> = {}): WclFight {
  return {
    id: 6, name: 'Boss', startTime: FIGHT_START_MS, endTime: FIGHT_START_MS + FIGHT_DURATION_S * MS_PER_S,
    kill: false, encounterID: 3183, attempt: 3, duration_s: FIGHT_DURATION_S, friendlyPlayers: [], fightPercentage: 41,
    ...over,
  };
}

function report(): WclReport {
  return {
    title: 'log', startTime: 0, fights: [fight()],
    masterData: {
      actors: [],
      abilities: [
        { gameID: OVERWHELMING_BLAST, name: 'Overwhelming Blast', icon: '' },
        { gameID: FROST_BOMB, name: 'Frost Bomb', icon: '' },
      ],
    },
  };
}

describe('dpsFromTable', () => {
  const blob = { data: { entries: [{ id: OTHER_PLAYER, total: 999 }, { id: PLAYER_ID, total: PLAYER_TOTAL }] } };

  it('divides the player entry total by the pull length', () => {
    expect(dpsFromTable(blob, PLAYER_ID, FIGHT_DURATION_S)).toBe(EXPECTED_DPS);
  });

  it('parses a JSON-string blob the same as an object blob', () => {
    expect(dpsFromTable(JSON.stringify(blob), PLAYER_ID, FIGHT_DURATION_S)).toBe(EXPECTED_DPS);
  });

  it('returns 0 for a missing player, a null blob, or a zero-length pull', () => {
    expect(dpsFromTable(blob, 404, FIGHT_DURATION_S)).toBe(0);
    expect(dpsFromTable(null, PLAYER_ID, FIGHT_DURATION_S)).toBe(0);
    expect(dpsFromTable(blob, PLAYER_ID, 0)).toBe(0);
  });
});

describe('abilityNameMap', () => {
  it('keys ability names by game id', () => {
    const names = abilityNameMap(report());
    expect(names.get(OVERWHELMING_BLAST)).toBe('Overwhelming Blast');
    expect(names.get(FROST_BOMB)).toBe('Frost Bomb');
  });
});

describe('lethalHitAmount', () => {
  it('takes the matching-ability hit at or before the death, preferring the unmitigated amount', () => {
    const dt = [dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S, BLAST_AMOUNT, BLAST_UNMITIGATED)];
    expect(lethalHitAmount(dt, OVERWHELMING_BLAST, FIGHT_START_MS + DEATH_1_AT_S * MS_PER_S)).toBe(BLAST_UNMITIGATED);
  });

  it('picks the latest matching hit before the death, ignoring later or other-ability hits', () => {
    const deathTs = FIGHT_START_MS + DEATH_1_AT_S * MS_PER_S;
    const dt = [
      dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S - 20, 10),
      dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S, BLAST_AMOUNT, BLAST_UNMITIGATED),
      dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S + 5, 99), // after the death - ignored
      dtEvent(FROST_BOMB, DEATH_1_AT_S, 42), // other ability - ignored
    ];
    expect(lethalHitAmount(dt, OVERWHELMING_BLAST, deathTs)).toBe(BLAST_UNMITIGATED);
  });

  it('falls back to the recorded amount when there is no unmitigated value, and 0 when nothing matches', () => {
    const dt = [dtEvent(FROST_BOMB, DEATH_2_AT_S, BOMB_AMOUNT)];
    expect(lethalHitAmount(dt, FROST_BOMB, FIGHT_START_MS + DEATH_2_AT_S * MS_PER_S)).toBe(BOMB_AMOUNT);
    expect(lethalHitAmount([], OVERWHELMING_BLAST, FIGHT_START_MS)).toBe(0);
  });
});

describe('buildDeathRows', () => {
  const names = abilityNameMap(report());

  it('projects the player deaths oldest-first with 1-based index, relative time, ability and amount', () => {
    const deaths = [
      deathEvent(PLAYER_ID, DEATH_2_AT_S, FROST_BOMB),
      deathEvent(PLAYER_ID, DEATH_1_AT_S, OVERWHELMING_BLAST),
      deathEvent(OTHER_PLAYER, DEATH_1_AT_S, OVERWHELMING_BLAST), // a raidmate - excluded
    ];
    const dt = [
      dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S, BLAST_AMOUNT, BLAST_UNMITIGATED),
      dtEvent(FROST_BOMB, DEATH_2_AT_S, BOMB_AMOUNT),
    ];
    expect(buildDeathRows(deaths, dt, PLAYER_ID, FIGHT_START_MS, names)).toEqual([
      { index: 1, timeS: DEATH_1_AT_S, ability: 'Overwhelming Blast', amount: BLAST_UNMITIGATED },
      { index: 2, timeS: DEATH_2_AT_S, ability: 'Frost Bomb', amount: BOMB_AMOUNT },
    ]);
  });

  it('leaves the ability empty and amount 0 when the death carried no killing ability', () => {
    const deaths = [deathEvent(PLAYER_ID, DEATH_1_AT_S, 0)];
    expect(buildDeathRows(deaths, [], PLAYER_ID, FIGHT_START_MS, names)).toEqual([
      { index: 1, timeS: DEATH_1_AT_S, ability: '', amount: 0 },
    ]);
  });
});

describe('wipeTimeS', () => {
  const WIPE_D1_S = 20;
  const WIPE_D2_S = 35;
  const WIPE_D3_S = 50; // the raid loses its 3rd player here

  it('marks the wipe at the 3rd raid death, regardless of event order', () => {
    const deaths = [deathEvent(1, WIPE_D3_S, 0), deathEvent(2, WIPE_D1_S, 0), deathEvent(3, WIPE_D2_S, 0)];
    expect(wipeTimeS(deaths, FIGHT_START_MS, FIGHT_DURATION_S)).toBe(WIPE_D3_S);
  });

  it('falls back to the fight end when fewer than 3 players died', () => {
    const deaths = [deathEvent(1, WIPE_D1_S, 0), deathEvent(2, WIPE_D2_S, 0)];
    expect(wipeTimeS(deaths, FIGHT_START_MS, FIGHT_DURATION_S)).toBe(FIGHT_DURATION_S);
    expect(wipeTimeS([], FIGHT_START_MS, FIGHT_DURATION_S)).toBe(FIGHT_DURATION_S);
  });
});

// --- end-to-end through the feature service (fake WclApiService) ----------------
interface FakeCalls { dataTypes: string[] }

function makeService(over: { fight?: Partial<WclFight>; deaths?: WclEvent[]; damageTaken?: WclEvent[] } = {}): {
  service: PullOverviewFeatureService; calls: FakeCalls;
} {
  const calls: FakeCalls = { dataTypes: [] };
  const wcl = {
    getReport: async () => report(),
    getDamageDoneTable: async () => ({ data: { entries: [{ id: PLAYER_ID, total: PLAYER_TOTAL }] } }),
    getAllEvents: async (_c: string, _f: number, dataType: string) => {
      calls.dataTypes.push(dataType);
      if (dataType === 'Deaths') return over.deaths ?? [];
      return over.damageTaken ?? [];
    },
  };
  TestBed.configureTestingModule({ providers: [{ provide: WclApiService, useValue: wcl as unknown as WclApiService }] });
  return { service: TestBed.inject(PullOverviewFeatureService), calls };
}

describe('PullOverviewFeatureService.loadView', () => {
  const RAID_D2_AT_S = 45;
  const RAID_D3_AT_S = 50; // the raid's 3rd death - the wipe moment

  it('summarizes a wipe: player deaths listed, wipe timed at the raid\'s 3rd death', async () => {
    const { service, calls } = makeService({
      deaths: [
        deathEvent(PLAYER_ID, DEATH_1_AT_S, OVERWHELMING_BLAST),
        deathEvent(OTHER_PLAYER, RAID_D2_AT_S, FROST_BOMB),
        deathEvent(OTHER_PLAYER + 1, RAID_D3_AT_S, FROST_BOMB),
      ],
      damageTaken: [dtEvent(OVERWHELMING_BLAST, DEATH_1_AT_S, BLAST_AMOUNT, BLAST_UNMITIGATED)],
    });
    const view = await service.loadView('r', PLAYER_ID, fight());

    expect(view.result).toBe('wipe');
    expect(view.bossPercentage).toBe(41);
    expect(view.durationS).toBe(FIGHT_DURATION_S);
    expect(view.dps).toBe(EXPECTED_DPS);
    expect(view.deaths).toEqual([{ index: 1, timeS: DEATH_1_AT_S, ability: 'Overwhelming Blast', amount: BLAST_UNMITIGATED }]);
    expect(view.outcomeTimeS).toBe(RAID_D3_AT_S);
    expect(calls.dataTypes).toContain('DamageTaken');
  });

  it('marks a clean kill at the fight end and skips the DamageTaken fetch when the player did not die', async () => {
    const { service, calls } = makeService({ deaths: [deathEvent(OTHER_PLAYER, DEATH_1_AT_S, OVERWHELMING_BLAST)] });
    const view = await service.loadView('r', PLAYER_ID, fight({ kill: true, fightPercentage: 0 }));

    expect(view.result).toBe('kill');
    expect(view.deaths).toEqual([]);
    expect(view.outcomeTimeS).toBe(FIGHT_DURATION_S);
    expect(calls.dataTypes).not.toContain('DamageTaken');
  });
});
