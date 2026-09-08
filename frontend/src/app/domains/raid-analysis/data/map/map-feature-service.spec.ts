import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclEvent, WclFight } from '../wcl/wcl.models';
import { EncounterPositions } from '../encounter/positioning.models';
import { Result, Results } from '../../../shared/util-http/result';
import { MAP_DATA_SOURCE, MapData } from './map-data-source';
import { DataSource } from '../data-source/data-source';
import { featureService } from '../../../../../testing/service-harness';
import { MapFeatureService, FACING_OFFSET_RAD, ActorTimeline, MapLiveOverlay } from './map-feature-service';
import { ParseTimelines } from './map-draw-service';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { whenStable } from '../../../../../testing/when-stable';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';

const wclProjections = TestBed.inject(WclProjectionsService);
TestBed.resetTestingModule();
TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: MAP_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(MapFeatureService);
TestBed.resetTestingModule();

/** Fixture events build against a fight-start of 0, so stamping is a pass-through to seconds. */
const timed: WclProjectionsService['withRelativeS'] = (events, startMs) => wclProjections.withRelativeS(events, startMs);

function posEvent(
  fields: { ts: number; source?: number; target?: number; resourceActor?: number; x: number; y: number; facing?: number; mapID?: number },
): WclEvent {
  return {
    type: 'cast', timestamp: fields.ts, abilityGameID: 1,
    sourceID: fields.source, targetID: fields.target, resourceActor: fields.resourceActor,
    x: fields.x, y: fields.y, facing: fields.facing, mapID: fields.mapID,
  };
}

describe('buildActorTimelines', () => {
  it('attributes the flattened position to the source by default (resourceActor 1)', () => {
    const timelines = svc['buildActorTimelines'](timed([posEvent({ ts: 1000, source: 7, x: 200, y: 400 })], 0));
    const tl = timelines.get(7);
    assert.exists(tl);
    expect(tl.samples).toEqual([{ t: 1, x: 2, y: 4, facing: undefined, mapID: undefined }]);
  });

  it('attributes the position to the target when resourceActor is 2', () => {
    const timelines = svc['buildActorTimelines'](timed([posEvent({ ts: 0, source: 7, target: 9, resourceActor: 2, x: 100, y: 0 })], 0));
    expect([...timelines.keys()]).toEqual([9]);
  });

  it('scales x/y to yards and facing milliradians to radians, sorted by time', () => {
    const timelines = svc['buildActorTimelines'](timed([
      posEvent({ ts: 3000, source: 1, x: 300, y: 0, facing: 1000 }),
      posEvent({ ts: 1000, source: 1, x: 100, y: 0, facing: 2000 }),
    ], 0));
    const playerTimeline = timelines.get(1);
    assert.exists(playerTimeline);
    const samples = playerTimeline.samples;
    expect(samples.map(s => s.t)).toEqual([1, 3]);
    expect(samples[0]).toMatchObject({ x: 1, facing: 2 });
  });

  it('skips events without a position', () => {
    const noPos: WclEvent = { type: 'cast', timestamp: 0, abilityGameID: 1, sourceID: 5 };
    expect(svc['buildActorTimelines'](timed([noPos], 0)).size).toBe(0);
  });
});

describe('listReferenceEnemies', () => {
  const positions: EncounterPositions = {
    spec: 'X', encounter_id: 1, encounter_name: 'E', interval_s: 1.5, sample_count: 2,
    parses: [
      { report_code: 'a', fight_id: 1, player_name: 'P', duration_s: 10, interval_s: 1.5, player: [],
        // Add listed before Boss so insertion order is not already boss-first: the sort must do real work.
        enemies: [
          { game_id: 200, name: 'Add', is_boss: false, samples: [] },
          { game_id: 100, name: 'Boss', is_boss: true, samples: [] },
        ] },
      { report_code: 'b', fight_id: 2, player_name: 'Q', duration_s: 10, interval_s: 1.5, player: [],
        enemies: [{ game_id: 200, name: 'Add', is_boss: false, samples: [] }] },
    ],
  };

  it('dedupes enemies by gameId and sorts the boss first', () => {
    expect(svc.listReferenceEnemies(positions)).toEqual([
      { gameId: 100, name: 'Boss', isBoss: true },
      { gameId: 200, name: 'Add', isBoss: false },
    ]);
  });

  it('promotes isBoss when any parse marks the gameId as boss', () => {
    assert.exists(positions.parses[0]);
    assert.exists(positions.parses[1]);
    const mixed: EncounterPositions = {
      ...positions,
      parses: [
        { ...positions.parses[0], enemies: [{ game_id: 200, name: 'Add', is_boss: false, samples: [] }] },
        { ...positions.parses[1], enemies: [{ game_id: 200, name: 'Add', is_boss: true, samples: [] }] },
      ],
    };
    expect(svc.listReferenceEnemies(mixed)).toEqual([{ gameId: 200, name: 'Add', isBoss: true }]);
  });
});

describe('buildLiveOverlay', () => {
  const positions: EncounterPositions = {
    spec: 'X', encounter_id: 1, encounter_name: 'E', interval_s: 1.5, sample_count: 1,
    parses: [{ report_code: 'a', fight_id: 1, player_name: 'P', duration_s: 10, interval_s: 1.5, player: [],
      enemies: [{ game_id: 100, name: 'Boss', is_boss: true, samples: [] }] }],
  };

  it('maps the ingested boss gameId to the live actor id and keys enemies by gameId', () => {
    const events = timed([posEvent({ ts: 0, source: 5, x: 100, y: 0 })], 0);
    const overlay = svc['buildLiveOverlay']({ positions, events, playerId: 5, enemies: [{ id: 42, name: 'Boss', gameID: 100 }] });
    expect(overlay).not.toBeNull();
    assert.exists(overlay);
    expect(overlay.bossActorId).toBe(42);
    assert.exists(overlay);
    expect(overlay.refActorByGameId.get(100)).toBe(42);
    assert.exists(overlay);
    expect(overlay.playerId).toBe(5);
  });

  it('returns null when the player has no position samples', () => {
    const events = timed([posEvent({ ts: 0, source: 99, x: 1, y: 1 })], 0);
    expect(svc['buildLiveOverlay']({ positions, events, playerId: 5, enemies: [] })).toBeNull();
  });
});

describe('resolveLiveReference', () => {
  const positions: EncounterPositions = {
    spec: 'X', encounter_id: 1, encounter_name: 'E', interval_s: 1.5, sample_count: 1,
    parses: [{ report_code: 'a', fight_id: 1, player_name: 'P', duration_s: 10, interval_s: 1.5, player: [],
      enemies: [
        { game_id: 100, name: 'Boss', is_boss: true, samples: [] },
        { game_id: 200, name: 'Add', is_boss: false, samples: [] },
      ] }],
  };

  it('maps the ingested boss gameId to this pull boss actor and keys all enemies by gameId', () => {
    const ref = svc['resolveLiveReference'](positions, [{ id: 42, name: 'Boss', gameID: 100 }, { id: 7, name: 'Add', gameID: 200 }]);
    expect(ref.bossActorId).toBe(42);
    expect(ref.refActorByGameId.get(100)).toBe(42);
    expect(ref.refActorByGameId.get(200)).toBe(7);
  });

  it('has a null boss actor when the live pull has no matching boss gameId', () => {
    const ref = svc['resolveLiveReference'](positions, [{ id: 7, name: 'Add', gameID: 200 }]);
    expect(ref.bossActorId).toBeNull();
    expect(ref.refActorByGameId.get(200)).toBe(7);
  });
});

/** Every fixture timeline holds one sample at this second, so a lookup there lands exactly on it. */
const SCRUB_S = 4;
const ORIGIN_YD = 0;
const PARSE_PLAYER_ID = -1;
const PARSE_REF_ID = -2;
const LIVE_PLAYER_ID = 5;
const LIVE_BOSS_ACTOR_ID = 42;
const LIVE_ADD_ACTOR_ID = 7;
const BOSS_GAME_ID = 100;
const ADD_GAME_ID = 200;
const ABSENT_GAME_ID = 999;
const PRECISION = 6;

function standingAt(id: number, x: number, y: number, mapID?: number): ActorTimeline {
  return { id, samples: [{ t: SCRUB_S, x, y, mapID }] };
}

/** The reference sits at the origin without a facing, so world +x reads as forward and -y as right. */
function parseWherePlayerStood(fwd: number, right: number): ParseTimelines {
  return { player: standingAt(PARSE_PLAYER_ID, fwd, -right), ref: standingAt(PARSE_REF_ID, ORIGIN_YD, ORIGIN_YD) };
}

function liveWith(timelines: ActorTimeline[]): MapLiveOverlay {
  return {
    timelines: new Map(timelines.map(timeline => [timeline.id, timeline])),
    playerId: LIVE_PLAYER_ID,
    bossActorId: LIVE_BOSS_ACTOR_ID,
    refActorByGameId: new Map([[BOSS_GAME_ID, LIVE_BOSS_ACTOR_ID], [ADD_GAME_ID, LIVE_ADD_ACTOR_ID]]),
  };
}

describe('parseTimelinesFor', () => {
  it('has no parse timelines without a loaded bench', () => {
    expect(svc.parseTimelinesFor(null, { kind: 'boss' })).toEqual([]);
  });
});

describe('liveRefIdOf', () => {
  const live = liveWith([]);

  it('resolves the boss selector to this pull boss actor', () => {
    expect(svc.liveRefIdOf(live, { kind: 'boss' })).toBe(LIVE_BOSS_ACTOR_ID);
  });

  it('resolves an enemy selector to the live actor for that gameId', () => {
    expect(svc.liveRefIdOf(live, { kind: 'enemy', gameId: ADD_GAME_ID })).toBe(LIVE_ADD_ACTOR_ID);
  });

  it('is null for an enemy selector no live actor matches', () => {
    expect(svc.liveRefIdOf(live, { kind: 'enemy', gameId: ABSENT_GAME_ID })).toBeNull();
  });

  it('is null without a live overlay', () => {
    expect(svc.liveRefIdOf(null, { kind: 'boss' })).toBeNull();
  });
});

describe('liveTrailAt', () => {
  const WINDOW_PAD_S = 5;
  const TRAIL_STEP_S = 0.5;

  it('has no trail without a live overlay', () => {
    expect(svc.liveTrailAt(null, LIVE_BOSS_ACTOR_ID, SCRUB_S, WINDOW_PAD_S, WINDOW_PAD_S, TRAIL_STEP_S)).toEqual([]);
  });
});

describe('readoutAt', () => {
  const NEAR_FWD_YD = 2;
  const NEAR_RIGHT_YD = 1;
  const FAR_FWD_YD = 4;
  const FAR_RIGHT_YD = 3;
  const CENTROID_FWD_YD = 3; // mean of NEAR_FWD_YD and FAR_FWD_YD
  const CENTROID_RIGHT_YD = 2; // mean of NEAR_RIGHT_YD and FAR_RIGHT_YD
  const PLAYER_MAP_ID = 1;
  const OTHER_MAP_ID = 2;

  it('centres the ranked players on the mean of where they stood', () => {
    const timelines = [parseWherePlayerStood(NEAR_FWD_YD, NEAR_RIGHT_YD), parseWherePlayerStood(FAR_FWD_YD, FAR_RIGHT_YD)];
    const readout = svc.readoutAt(timelines, null, null, SCRUB_S);
    expect(readout.benchNow).toHaveLength(timelines.length);
    expect(readout.centroid?.fwd).toBeCloseTo(CENTROID_FWD_YD, PRECISION);
    expect(readout.centroid?.right).toBeCloseTo(CENTROID_RIGHT_YD, PRECISION);
  });

  it('has no centre when no parse stands at the scrubbed time', () => {
    expect(svc.readoutAt([], null, null, SCRUB_S).centroid).toBeNull();
  });

  it('places the live player ahead of the reference they share a map with', () => {
    const live = liveWith([
      standingAt(LIVE_PLAYER_ID, NEAR_FWD_YD, ORIGIN_YD, PLAYER_MAP_ID),
      standingAt(LIVE_BOSS_ACTOR_ID, ORIGIN_YD, ORIGIN_YD, PLAYER_MAP_ID),
    ]);
    expect(svc.readoutAt([], live, LIVE_BOSS_ACTOR_ID, SCRUB_S).player?.fwd).toBeCloseTo(NEAR_FWD_YD, PRECISION);
  });

  it('has no live player when the reference stands on another map', () => {
    const live = liveWith([
      standingAt(LIVE_PLAYER_ID, NEAR_FWD_YD, ORIGIN_YD, PLAYER_MAP_ID),
      standingAt(LIVE_BOSS_ACTOR_ID, ORIGIN_YD, ORIGIN_YD, OTHER_MAP_ID),
    ]);
    expect(svc.readoutAt([], live, LIVE_BOSS_ACTOR_ID, SCRUB_S).player).toBeNull();
  });
});

describe('FACING_OFFSET_RAD', () => {
  it('is a -90 degree offset', () => {
    expect(FACING_OFFSET_RAD).toBeCloseTo(-Math.PI / 2, 10);
  });
});

function withResult(result: Result<MapData>): { service: MapFeatureService; calls: [string, number][] } {
  const calls: [string, number][] = [];
  const source: DataSource<MapData> = {
    getBench: (spec, enc) => { calls.push([spec, enc]); return Promise.resolve(result); },
  };
  TestBed.configureTestingModule({ providers: [{ provide: MAP_DATA_SOURCE, useValue: source }] });
  return { service: TestBed.inject(MapFeatureService), calls };
}

const sampleData: EncounterPositions = {
  spec: 'SubtletyRogue', encounter_id: 3144, encounter_name: 'Test', interval_s: 1.5, sample_count: 1,
  parses: [{ report_code: 'a', fight_id: 1, player_name: 'P', duration_s: 10, interval_s: 1.5, player: [],
    enemies: [{ game_id: 100, name: 'Boss', is_boss: true, samples: [] }] }],
};

describe('MapFeatureService', () => {
  it('loads the bench through the data source and exposes it as a signal', async () => {
    const { service, calls } = withResult(Results.ok(sampleData));
    const result = await service.loadBench('SubtletyRogue', 3144);
    expect(calls).toEqual([['SubtletyRogue', 3144]]);
    expect(result).toEqual(Results.ok(sampleData));
    expect(service.positions()).toBe(sampleData);
    expect(service.error()).toBeNull();
    expect(service.ready()).toBe(true);
  });

  it('is not ready and stays error-free when the bench is missing', async () => {
    const { service } = withResult(Results.missing('Not yet ingested.'));
    await service.loadBench('SubtletyRogue', 3144);
    expect(service.positions()).toBeNull();
    expect(service.live()).toBeNull();
    expect(service.ready()).toBe(false);
    // A missing bench drives the empty placeholder, so it never surfaces as an error.
    expect(service.error()).toBeNull();
  });

  it('surfaces a transient bench failure as an error rather than a silent empty map', async () => {
    const outage = Results.transient('WCL outage');
    const { service } = withResult(outage);
    const result = await service.loadBench('SubtletyRogue', 3144);
    expect(result).toEqual(outage);
    expect(service.positions()).toBeNull();
    expect(service.ready()).toBe(false);
    expect(service.error()?.kind).toBe('transient');
  });

  it('openAt sets the panel state and opens it', () => {
    const { service } = withResult(Results.ok(sampleData));
    service.openAt({ timeS: 42, reference: { kind: 'enemy', gameId: 200 } });
    expect(service.open()).toBe(true);
    expect(service.anchorTime()).toBe(42);
    expect(service.reference()).toEqual({ kind: 'enemy', gameId: 200 });
  });

  it('openAt defaults the reference to the boss', () => {
    const { service } = withResult(Results.ok(sampleData));
    service.openAt({ timeS: 5 });
    expect(service.reference()).toEqual({ kind: 'boss' });
  });

  it('close hides the panel but keeps the loaded bench', async () => {
    const { service } = withResult(Results.ok(sampleData));
    await service.loadBench('SubtletyRogue', 3144);
    service.openAt({ timeS: 1 });
    service.close();
    expect(service.open()).toBe(false);
    expect(service.positions()).toBe(sampleData);
  });

  it('clear drops everything', async () => {
    const { service } = withResult(Results.ok(sampleData));
    await service.loadBench('SubtletyRogue', 3144);
    service.openAt({ timeS: 1 });
    service.clear();
    expect(service.open()).toBe(false);
    expect(service.positions()).toBeNull();
    expect(service.live()).toBeNull();
    expect(service.error()).toBeNull();
  });
});

interface RecordedFetch { dataType: string; sourceId?: number; includeResources?: boolean; hostilityType?: string; }

// Resolving in one turn would let a wait pass here that a real fetch (transport, interceptor, parse) would not.
const FETCH_TURNS = 20;

/** Returns no events, so no overlay is built (overlay content is covered above). */
class RecordingWclApi {
  readonly calls: RecordedFetch[] = [];
  get getAllEventsCalls(): number { return this.calls.length; }
  getAllEvents(
    _code: string, _fightId: number, dataType: string, _start: number, _end: number,
    sourceId?: number, includeResources?: boolean, hostilityType?: string,
  ): Promise<WclEvent[]> {
    this.calls.push({ dataType, sourceId, includeResources, hostilityType });
    let settling = Promise.resolve<WclEvent[]>([]);
    for (let turn = 0; turn < FETCH_TURNS; turn++) settling = settling.then(events => events);
    return settling;
  }
}

/** A minimal fight; prepare only reads id / encounterID / startTime / endTime. */
const sampleFight = { id: 1, encounterID: 3144, startTime: 0, endTime: 10_000, name: 'Test', kill: true } as WclFight;

const PLAYER_ACTOR_ID = 5;

describe('MapFeatureService deferred overlay', () => {
  function setup(): { service: MapFeatureService; api: RecordingWclApi } {
    const api = new RecordingWclApi();
    return { service: featureService(MAP_DATA_SOURCE, MapFeatureService, Results.ok(sampleData), api), api };
  }

  it('prepare loads the bench but defers the event fetch until the panel opens', async () => {
    const { service, api } = setup();
    await service.prepare('code', sampleFight, 5, 'SubtletyRogue', []);

    // Bench is loaded (so map buttons can light up) but nothing has hit the wire yet.
    expect(service.positions()).toBe(sampleData);
    expect(service.ready()).toBe(true);
    expect(service.live()).toBeNull();
    expect(api.getAllEventsCalls).toBe(0);

    service.openAt({ timeS: 1 });
    await whenStable();
    expect(api.getAllEventsCalls).toBeGreaterThan(0); // opening the panel triggers the fetch
  });

  it('does not refetch the overlay when the panel is re-opened for the same pull', async () => {
    const { service, api } = setup();
    await service.prepare('code', sampleFight, 5, 'SubtletyRogue', []);

    service.openAt({ timeS: 1 });
    await whenStable();
    const afterFirstOpen = api.getAllEventsCalls;
    expect(afterFirstOpen).toBeGreaterThan(0);

    service.close();
    service.openAt({ timeS: 2 });
    await whenStable();
    expect(api.getAllEventsCalls).toBe(afterFirstOpen);
  });

  it('does not fetch when the map is never opened', async () => {
    const { service, api } = setup();
    await service.prepare('code', sampleFight, 5, 'SubtletyRogue', []);
    await whenStable();
    expect(api.getAllEventsCalls).toBe(0);
  });

  it('fetches player casts (Friendlies) + enemy casts (Enemies) on open, never DamageDone', async () => {
    const { service, api } = setup();
    await service.prepare('code', sampleFight, PLAYER_ACTOR_ID, 'SubtletyRogue', []);
    service.openAt({ timeS: 1 });
    await whenStable();

    const EXPECTED_FETCH_COUNT = 2; // player casts + enemy casts, nothing else
    expect(api.calls).toHaveLength(EXPECTED_FETCH_COUNT);
    // Player casts: own source, positions on, default (Friendlies) hostility.
    expect(api.calls).toContainEqual({ dataType: 'Casts', sourceId: PLAYER_ACTOR_ID, includeResources: true, hostilityType: undefined });
    // Enemy casts: explicit Enemies hostility, since the query defaults to Friendlies.
    expect(api.calls).toContainEqual({ dataType: 'Casts', sourceId: undefined, includeResources: true, hostilityType: 'Enemies' });
    // The boss and add trails come from those enemy casts, so nothing fetches DamageDone.
    expect(api.calls.some(call => call.dataType === 'DamageDone')).toBe(false);
  });

  it('surfaces a permanent error when the loaded overlay has no player position samples', async () => {
    const NO_POSITIONS_ID = 'map.no-player-positions'; // repro id the no-samples permanent carries
    const { service } = setup(); // RecordingWclApi returns [] events, so the player has no samples
    await service.prepare('code', sampleFight, PLAYER_ACTOR_ID, 'SubtletyRogue', []);
    service.openAt({ timeS: 1 });
    await whenStable();

    // The overlay loaded but yielded no "you" trail: surfaced as a failure, not a silent bench-only map.
    expect(service.live()).toBeNull();
    expect(service.overlayLoading()).toBe(false);
    const error = service.error();
    expect(error?.kind).toBe('permanent');
    if (error?.kind === 'permanent') expect(error.id).toBe(NO_POSITIONS_ID);
  });

  it('drops a stale bench load so a rapid selection switch keeps the latest positions', async () => {
    const STALE_ENCOUNTER = 111;
    const LATEST_ENCOUNTER = 222;
    const staleData: EncounterPositions = { ...sampleData, encounter_id: STALE_ENCOUNTER };
    const latestData: EncounterPositions = { ...sampleData, encounter_id: LATEST_ENCOUNTER };
    const stale: { resolve?: () => void } = {};
    const source: DataSource<MapData> = {
      getBench: (_spec, enc) => enc === STALE_ENCOUNTER
        ? new Promise<Result<MapData>>(res => { stale.resolve = () => { res(Results.ok(staleData)); }; })
        : Promise.resolve(Results.ok(latestData)),
    };
    TestBed.configureTestingModule({ providers: [{ provide: MAP_DATA_SOURCE, useValue: source }] });
    const service = TestBed.inject(MapFeatureService);
    const staleFight = { ...sampleFight, encounterID: STALE_ENCOUNTER };
    const latestFight = { ...sampleFight, encounterID: LATEST_ENCOUNTER };

    const stalePrepare = service.prepare('code', staleFight, 5, 'SubtletyRogue', []); // bench never resolves yet
    await service.prepare('code', latestFight, 5, 'SubtletyRogue', []); // supersedes, resolves now
    expect(service.positions()).toBe(latestData);

    assert.exists(stale.resolve);
    stale.resolve(); // the earlier selection finally resolves, out of order
    await stalePrepare;
    // The stale bench does not overwrite the current selection.
    expect(service.positions()).toBe(latestData);
  });

  it('surfaces a failed overlay fetch as an error rather than a silent empty map', async () => {
    const OVERLAY_ERROR_ID = 'map.overlay'; // repro id a permanent overlay failure carries
    const throwingApi = {
      getAllEvents: () => Promise.reject(new Error('overlay boom')),
    };
    const service = featureService(MAP_DATA_SOURCE, MapFeatureService, Results.ok(sampleData), throwingApi);
    await service.prepare('code', sampleFight, PLAYER_ACTOR_ID, 'SubtletyRogue', []);
    service.openAt({ timeS: 1 });
    await whenStable();

    // The bench loaded fine, but the player's own trail fetch failed: no live overlay, spinner clears, failure surfaces.
    expect(service.live()).toBeNull();
    expect(service.overlayLoading()).toBe(false);
    const error = service.error();
    expect(error?.kind).toBe('permanent');
    if (error?.kind === 'permanent') expect(error.id).toBe(OVERLAY_ERROR_ID);
  });
});
