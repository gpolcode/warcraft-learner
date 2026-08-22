import { assert, describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { getEncounters, getRankingsLite, rankingsFromPartition } from './wcl-fetchers';
import { BudgetExceededError } from './wcl-client';
import type { WclQueryClient } from './wcl-client';
import type { SpecWclMap } from './wcl-mappers';
import { MYTHIC_DIFFICULTY, type WclRawRanking } from '../core/models/wcl.models';
import type { CurrentRaid } from '../core/models/encounter.models';

const SPEC_WCL: SpecWclMap = {
  FireMage: ['Mage', 'Fire'],
  RetributionPaladin: ['Paladin', 'Retribution'],
  FuryWarrior: ['Warrior', 'Fury'],
  SubtletyRogue: ['Rogue', 'Subtlety'],
};

const HEROIC_DIFFICULTY = 4;
const NORMAL_DIFFICULTY = 3;

interface FakeHandlers {
  query?: (gql: string, vars?: object) => unknown;
  assertBudget?: (margin: number) => void;
}

function fakeClient(handlers: FakeHandlers): WclQueryClient {
  return {
    async query(gql: string, vars?: object) { return (handlers.query?.(gql, vars) ?? {}) as never; },
    async assertBudget(margin: number) { handlers.assertBudget?.(margin); },
  };
}

const NOW_S = 1_760_000_000;
const DAY_S = 24 * 60 * 60;
const DAY_MS = DAY_S * 1000;

// WCL dates a ranking in milliseconds, so a fixture pull `ageDays` old is stamped in them too.
const ranks = (count: number, ageDays = 1): WclRawRanking[] =>
  Array.from({ length: count }, (_unused, index) => ({
    name: `P${index}`, report: { code: `r${index}`, fightID: index }, startTime: NOW_S * 1000 - ageDays * DAY_MS,
  }));

describe('getEncounters', () => {
  // The retire tests assert on the warning; the spy also keeps the runner output clean.
  let warnSpy: MockInstance<typeof console.warn>;
  beforeEach(() => { warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined); });
  afterEach(() => { warnSpy.mockRestore(); });

  const ABYSS = 53, SPOREFALL = 50, DUMMY = 52, FINISHED = 46;

  const finishedZone = { id: FINISHED, name: 'VS / DR / MQD', frozen: false, encounters: [{ id: 3176, name: 'Imperator' }, { id: 3177, name: 'Vorasius' }] };

  // Modeled on the real Midnight worldData, which really does run two raids at once alongside a still-ranked finished tier.
  const expansions = [{
    id: 7, name: 'Midnight', zones: [
      finishedZone,
      { id: SPOREFALL, name: 'Sporefall', frozen: false, encounters: [{ id: 3159, name: 'Rotmire' }] },
      { id: DUMMY, name: 'Dummy Dome', frozen: false, encounters: [{ id: 3591, name: 'Sinister Single' }] },
      { id: ABYSS, name: 'The Venomous Abyss', frozen: false, encounters: [{ id: 3470, name: "Nek'zali" }, { id: 3445, name: 'Sentinels' }] },
      { id: 54, name: 'The Venomous Abyss', frozen: true, encounters: [{ id: 3480, name: 'Frozen copy' }] },
      { id: 47, name: 'Mythic+ Season 1', frozen: false, encounters: [{ id: 112526, name: 'Dungeon' }] },
      { id: 510, name: 'The Venomous Abyss Complete Raid', frozen: false, encounters: [{ id: 3191, name: 'Aggregate' }] },
    ],
  }];

  const STALE_DAYS = 30;
  const rankingsByEncounter: Record<number, WclRawRanking[]> = {
    3470: ranks(10), 3445: ranks(10), 3159: ranks(10), 3191: ranks(10), 112526: ranks(10),
    3176: ranks(10, STALE_DAYS), 3177: ranks(10, STALE_DAYS), 3591: [],
  };

  function contentClient(overrides: Partial<FakeHandlers> = {}, probed?: number[]): WclQueryClient {
    return fakeClient({
      query: (gql, vars) => {
        if (gql.includes('expansions')) return { worldData: { expansions } };
        const encounterID = (vars as { encounterID: number }).encounterID;
        probed?.push(encounterID);
        return { worldData: { encounter: { name: 'Boss', characterRankings: { rankings: rankingsByEncounter[encounterID] ?? [] } } } };
      },
      ...overrides,
    });
  }

  const raid = (zoneId: number, zoneName: string, adoptedAtS = NOW_S): CurrentRaid =>
    ({ zone_id: zoneId, zone_name: zoneName, adopted_at_s: adoptedAtS });

  describe('with no raid on record', () => {
    it('adopts only the newest live raid, leaving the tiers behind it that WCL still ranks non-frozen', async () => {
      const { encounters, protectedIds, zones, reset } = await getEncounters(contentClient(), SPEC_WCL, [], NOW_S);
      expect(zones).toEqual([raid(ABYSS, 'The Venomous Abyss')]);
      expect(encounters.map(encounter => encounter.id)).toEqual([3470, 3445]);
      expect([...protectedIds].sort((a, b) => a - b)).toEqual([3445, 3470]);
      expect(reset).toBe(true);
    });

    it('stops at the newest live raid, never reaching the tiers below it', async () => {
      const probed: number[] = [];
      await getEncounters(contentClient({}, probed), SPEC_WCL, [], NOW_S);
      expect([...new Set(probed)]).toEqual([3470]);
    });

    it('passes over a newer zone nobody is raiding and takes the live one below it', async () => {
      const zones = [
        { id: 61, name: 'Not Open Yet', frozen: false, encounters: [{ id: 9200, name: 'Unraided' }] },
        { id: 60, name: 'New Raid', frozen: false, encounters: [{ id: 9100, name: 'First Boss' }] },
      ];
      const client = fakeClient({
        query: (gql, vars) => {
          if (gql.includes('expansions')) return { worldData: { expansions: [{ id: 7, name: 'Midnight', zones }] } };
          const encounterID = (vars as { encounterID: number }).encounterID;
          return { worldData: { encounter: { name: 'Boss', characterRankings: { rankings: encounterID === 9100 ? ranks(10) : [] } } } };
        },
      });
      const { zones: current } = await getEncounters(client, SPEC_WCL, [], NOW_S);
      expect(current.map(entry => entry.zone_id)).toEqual([60]);
    });

    it('detects a just-opened raid with Heroic parses but no Mythic kills yet', async () => {
      const difficultiesTried: number[] = [];
      const client = fakeClient({
        query: (gql, vars) => {
          if (gql.includes('expansions')) {
            return { worldData: { expansions: [{ id: 7, name: 'Midnight', zones: [{ id: 60, name: 'New Raid', frozen: false, encounters: [{ id: 9100, name: 'First Boss' }] }] }] } };
          }
          const difficulty = (vars as { difficulty: number }).difficulty;
          difficultiesTried.push(difficulty);
          return { worldData: { encounter: { name: 'First Boss', characterRankings: { rankings: difficulty === HEROIC_DIFFICULTY ? ranks(10) : [] } } } };
        },
      });
      const { encounters } = await getEncounters(client, SPEC_WCL, [], NOW_S);
      expect(encounters.map(encounter => encounter.id)).toEqual([9100]);
      expect(difficultiesTried).toEqual([MYTHIC_DIFFICULTY, HEROIC_DIFFICULTY]);
    });

    it('adopts nothing when a zone\'s only parses are privacy-anonymized (the "Dummy Dome" case)', async () => {
      const anonymized: WclRawRanking[] = Array.from({ length: 8 }, (_unused, index) => ({
        name: `Character 13600${index}-1163300${index}`, report: { code: `r${index}`, fightID: index }, startTime: NOW_S * 1000,
      }));
      const client = fakeClient({
        query: (gql) => {
          if (gql.includes('expansions')) {
            return { worldData: { expansions: [{ id: 7, name: 'Midnight', zones: [{ id: DUMMY, name: 'Dummy Dome', frozen: false, encounters: [{ id: 3591, name: 'Sinister Single' }] }] }] } };
          }
          return { worldData: { encounter: { name: 'Sinister Single', characterRankings: { rankings: anonymized } } } };
        },
      });
      expect((await getEncounters(client, SPEC_WCL, [], NOW_S)).encounters).toHaveLength(0);
    });

    it('adopts nothing from a zone whose parses are all older than a lockout', async () => {
      const client = fakeClient({
        query: (gql) => {
          if (gql.includes('expansions')) {
            return { worldData: { expansions: [{ id: 7, name: 'Midnight', zones: [{ id: 60, name: 'Quiet Raid', frozen: false, encounters: [{ id: 9001, name: 'Boss' }] }] }] } };
          }
          return { worldData: { encounter: { name: 'Boss', characterRankings: { rankings: ranks(10, STALE_DAYS) } } } };
        },
      });
      expect((await getEncounters(client, SPEC_WCL, [], NOW_S)).encounters).toHaveLength(0);
    });
  });

  describe('with a raid already on record', () => {
    it('keeps it without probing anything at or below it, so no run re-decides a raid the dataset holds', async () => {
      const probed: number[] = [];
      const { encounters, zones, reset } = await getEncounters(
        contentClient({}, probed), SPEC_WCL, [raid(ABYSS, 'The Venomous Abyss')], NOW_S);
      expect(zones).toEqual([raid(ABYSS, 'The Venomous Abyss')]);
      expect(encounters.map(encounter => encounter.id)).toEqual([3470, 3445]);
      expect(reset).toBe(false);
      // No zone sits above the record, so the run spends nothing on the probe at all.
      expect(probed).toEqual([]);
    });

    it('lets a raid released alongside it join, keeping both', async () => {
      const DAYS_OLD = 3;
      const sameWave = raid(SPOREFALL, 'Sporefall', NOW_S - DAYS_OLD * DAY_S);
      const { zones, protectedIds, reset } = await getEncounters(contentClient(), SPEC_WCL, [sameWave], NOW_S);
      expect(zones).toEqual([raid(ABYSS, 'The Venomous Abyss'), sameWave]);
      expect([...protectedIds].sort((a, b) => a - b)).toEqual([3159, 3445, 3470]);
      expect(reset).toBe(true);
    });

    it('retires a raid from an earlier release wave when a new one takes over (boundary: inside the wave is kept)', async () => {
      const lastTier = raid(SPOREFALL, 'Sporefall', NOW_S - 31 * DAY_S);
      const { zones, protectedIds, reset } = await getEncounters(contentClient(), SPEC_WCL, [lastTier], NOW_S);
      expect(zones).toEqual([raid(ABYSS, 'The Venomous Abyss')]);
      expect([...protectedIds].sort((a, b) => a - b)).toEqual([3445, 3470]);
      expect(reset).toBe(true);
    });

    it('keeps an old raid while nothing new ships, so age alone never retires one', async () => {
      const ancient = raid(ABYSS, 'The Venomous Abyss', NOW_S - 400 * DAY_S);
      const { zones, reset } = await getEncounters(contentClient(), SPEC_WCL, [ancient], NOW_S);
      expect(zones).toEqual([ancient]);
      expect(reset).toBe(false);
    });

    it('retires a recorded raid WCL has frozen or dropped, and stops protecting its encounters', async () => {
      const RETIRED = 44;
      const { zones, protectedIds, reset } = await getEncounters(
        contentClient(), SPEC_WCL, [raid(ABYSS, 'The Venomous Abyss'), raid(RETIRED, 'Manaforge Omega')], NOW_S);
      expect(zones.map(entry => entry.zone_id)).toEqual([ABYSS]);
      expect([...protectedIds].sort((a, b) => a - b)).toEqual([3445, 3470]);
      expect(reset).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('getEncounters'), expect.stringContaining('Manaforge Omega'));
    });

    it('propagates a BudgetExceededError raised while probing', async () => {
      const client = contentClient({ assertBudget: () => { throw new BudgetExceededError('low'); } });
      await expect(getEncounters(client, SPEC_WCL, [], NOW_S)).rejects.toThrow(BudgetExceededError);
    });
  });
});

describe('getRankingsLite', () => {
  it('throws on an unknown spec', async () => {
    await expect(getRankingsLite(fakeClient({}), 'NotASpec', 100, SPEC_WCL, 10, [], MYTHIC_DIFFICULTY)).rejects.toThrow('Unknown spec');
  });

  it('tries partitions newest-first and falls back when one is empty', async () => {
    const queried: (number | undefined)[] = [];
    const client = fakeClient({
      query: (_gql, vars) => {
        const partition = (vars as { partition?: number }).partition;
        queried.push(partition);
        const rankings = partition === 3 ? [] : [{ name: 'A', amount: 10, duration: 1000, report: { code: 'r1', fightID: 1 } }];
        return { worldData: { encounter: { name: 'Boss', characterRankings: { rankings } } } };
      },
    });
    const ranked = await getRankingsLite(client, 'SubtletyRogue', 100, SPEC_WCL, 10, [3, 2], MYTHIC_DIFFICULTY);
    expect(queried).toEqual([3, 2]);
    expect(ranked).toHaveLength(1);
    assert.exists(ranked[0]);
    expect(ranked[0].player).toBe('A');
  });

  it('passes the caller\'s difficulty through to the rankings query', async () => {
    const seen: (number | undefined)[] = [];
    const client = fakeClient({
      query: (_gql, vars) => {
        seen.push((vars as { difficulty?: number }).difficulty);
        return { worldData: { encounter: { name: 'Boss', characterRankings: { rankings: ranks(1) } } } };
      },
    });
    await getRankingsLite(client, 'SubtletyRogue', 100, SPEC_WCL, 10, [], NORMAL_DIFFICULTY);
    expect(seen).toEqual([NORMAL_DIFFICULTY]);
  });

  it('parses characterRankings when returned as a JSON string', async () => {
    const client = fakeClient({
      query: () => ({ worldData: { encounter: { name: 'Boss', characterRankings: JSON.stringify({ rankings: [{ name: 'A', report: { code: 'r', fightID: 1 } }] }) } } }),
    });
    const ranked = await getRankingsLite(client, 'SubtletyRogue', 100, SPEC_WCL, 10, [], MYTHIC_DIFFICULTY);
    assert.exists(ranked[0]);
    expect(ranked[0].player).toBe('A');
  });
});

describe('rankingsFromPartition', () => {
  const NEWEST = 3, PREVIOUS = 2;

  it('names the partition that answered, so every later read can be pinned to it', async () => {
    const tried: (number | null)[] = [];
    const result = await rankingsFromPartition([NEWEST, PREVIOUS], async partition => {
      tried.push(partition);
      return partition === NEWEST ? [] : ['a'];
    });
    expect(tried).toEqual([NEWEST, PREVIOUS]);
    expect(result).toEqual({ rows: ['a'], partition: PREVIOUS });
  });

  it('stops at the newest partition that has rows, leaving the older ones unqueried', async () => {
    const tried: (number | null)[] = [];
    const result = await rankingsFromPartition([NEWEST, PREVIOUS], async partition => {
      tried.push(partition);
      return ['a'];
    });
    expect(tried).toEqual([NEWEST]);
    expect(result.partition).toBe(NEWEST);
  });

  it('makes one unpartitioned attempt when the zone lists none, which is WCL\'s own default', async () => {
    const tried: (number | null)[] = [];
    const result = await rankingsFromPartition([], async partition => {
      tried.push(partition);
      return ['a'];
    });
    expect(tried).toEqual([null]);
    expect(result.partition).toBeNull();
  });

  it('reports no partition when every one of them is empty', async () => {
    expect(await rankingsFromPartition([NEWEST, PREVIOUS], async () => [])).toEqual({ rows: [], partition: null });
  });
});
