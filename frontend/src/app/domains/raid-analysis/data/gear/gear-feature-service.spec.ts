import { describe, it, expect } from 'vitest';
import { CharacterGear, WclCombatantInfo, WclGearItem } from '../wcl/wcl.models';
import { GEAR_DATA_SOURCE, GearBench } from './gear-data-source';
import { featureService } from '../../../../../testing/service-harness';
import { Result, Results } from '../../../shared/util-http/result';
import { GearFeatureService } from './gear-feature-service';
import { TestBed } from '@angular/core/testing';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: GEAR_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(GearFeatureService);
TestBed.resetTestingModule();

const STANDARD_KEY = 'v3:11.1,22.1';
const GAZE = { id: 100, name: 'A', icon: 'inv_a' };
const PUZZLE_BOX = { id: 200, name: 'B', icon: 'inv_b' };
const STANDARD_PAIR = [{ items: [GAZE, PUZZLE_BOX], pct: 70 }];
const STANDARD_TRINKETS = [{ slot: 12, id: GAZE.id, name: GAZE.name }, { slot: 13, id: PUZZLE_BOX.id, name: PUZZLE_BOX.name }];

function benchWith(overrides: Partial<GearBench> = {}): GearBench {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', sample_count: 10,
    talent_builds: [{ key: STANDARD_KEY, pct: 80, report_code: 'abc', fight_id: 2, player_name: 'Top', source_id: 5, diff: [] }],
    trinket_sets: STANDARD_PAIR,
    enchants: { 15: [{ id: 8041, name: 'Sophic', icon: '', item_id: null, pct: 90 }] },
    ...overrides,
  };
}

// Reconstructs a raw CombatantInfo event; names are baked onto the gear items, so getGameNames is not consulted.
function toRawEvent(gear: CharacterGear): WclCombatantInfo {
  const items: WclGearItem[] = [];
  for (const trinket of gear.trinkets ?? []) items[trinket.slot] = { id: trinket.id, name: trinket.name };
  for (const enchant of gear.enchants ?? []) {
    items[enchant.slot] = { ...(items[enchant.slot] ?? { id: 1, name: 'x' }), permanentEnchant: enchant.id, permanentEnchantName: enchant.name };
  }
  const body = (gear.talent_key ?? '').replace(/^v3:/, '');
  const talentTree = body ? body.split(',').map(pick => {
    const [id, rank] = pick.split('.').map(Number);
    return { id, rank };
  }) : [];
  return { sourceID: 10, gear: items, talentTree };
}

describe('benchToStats', () => {
  it('extracts the gear stats block from a bench', () => {
    expect(svc['benchToStats'](benchWith())).toEqual({
      talent_builds: [{ key: STANDARD_KEY, pct: 80, report_code: 'abc', fight_id: 2, player_name: 'Top', source_id: 5, diff: [] }],
      trinket_sets: STANDARD_PAIR,
      enchants: { 15: [{ id: 8041, name: 'Sophic', icon: '', item_id: null, pct: 90 }] },
    });
  });
});

describe('buildCharacterGear', () => {
  it('is a permanent error when the log has no combatant info', () => {
    expect(svc['buildCharacterGear'](null, {}))
      .toEqual(Results.permanent('No combatant info in this log.', 'gear.combatant-info'));
  });

  it('builds the gear fingerprint when the event carries gear', () => {
    const event = toRawEvent({
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    });
    const result = svc['buildCharacterGear'](event, {});
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({ talent_key: STANDARD_KEY });
  });
});

describe('buildBenchGearView', () => {
  const stats = svc['benchToStats'](benchWith());

  it('comparison off, bench rows populated with no row marked as the player\'s', () => {
    const view = svc['buildBenchGearView'](stats);
    expect(view.comparison).toBe(false);
    expect(view.benchEnchantRows).toEqual([{ slotName: 'Main Hand', enchant: { name: 'Sophic', itemId: null, icon: '' } }]);
    expect(view.talentBuilds[0]).toMatchObject({ pct: 80, label: 'Most common build' });
    expect(view.trinketSets[0]).toEqual({ pct: 70, isPlayer: false, label: 'Most common pair', items: [GAZE, PUZZLE_BOX] });
    expect(view.trinketStatus).toEqual({ status: 'unknown', note: 'No trinket data.' });
    // The comparison rows stay empty in bench-only mode (no player to compare).
    expect(view.enchantRows).toEqual([]);
  });
});

describe('buildGearView', () => {
  const stats = svc['benchToStats'](benchWith());

  it('comparison mode: player matching bench is on-plan (ok)', () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    };
    const view = svc['buildGearView'](player, stats);
    expect(view.comparison).toBe(true);
    expect(view.talentStatus.status).toBe('ok');
    expect(view.trinketStatus).toEqual({ status: 'ok', note: 'Most common pair.' });
    expect(view.trinketSets[0]).toMatchObject({ isPlayer: true });
    expect(view.enchantStatus).toBe('ok');
  });

  it('comparison mode: a pair off the bench pairs is flagged uncommon', () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: [{ slot: 12, id: 999, name: 'Off Meta' }],
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    };
    const view = svc['buildGearView'](player, stats);
    expect(view.trinketStatus).toEqual({ status: 'warn', note: 'Uncommon pair. 70% use the most common one.' });
    expect(view.trinketSets.some(row => row.isPlayer)).toBe(false);
  });

  it('comparison mode: missing high-consensus enchant flags a warning', () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [],
    };
    const view = svc['buildGearView'](player, stats);
    expect(view.enchantStatus).toBe('warn');
    expect(view.enchantRows.some(row => row.status === 'warn')).toBe(true);
  });
});

describe('emptyGearView', () => {
  it('is a bench-off placeholder with no rows', () => {
    expect(svc.emptyGearView()).toEqual({
      comparison: false,
      talentBuilds: [], talentStatus: { status: 'unknown', note: 'No talent data.' },
      trinketSets: [], trinketStatus: { status: 'unknown', note: 'No trinket data.' },
      enchantRows: [], enchantStatus: 'ok', benchEnchantRows: [],
    });
  });
});

function configure(bench: Result<GearBench>, gear: CharacterGear | null): GearFeatureService {
  const wclFake = {
    getCombatantInfo: async (): Promise<WclCombatantInfo[]> => (gear ? [toRawEvent(gear)] : []),
    getGameNames: async () => ({}),
  };
  return featureService(GEAR_DATA_SOURCE, GearFeatureService, bench, wclFake);
}

describe('GearFeatureService', () => {
  it('loadBenchView builds the bench-only view', async () => {
    const result = await configure(Results.ok(benchWith()), null).loadBenchView('SubtletyRogue', 1);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.comparison).toBe(false);
    expect(result.value.trinketSets).toHaveLength(1);
  });

  it('loadBenchView propagates a missing bench unchanged', async () => {
    const result = await configure(Results.missing('Not yet ingested.'), null).loadBenchView('SubtletyRogue', 1);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });

  it('loadComparisonView merges fetched player gear with the bench', async () => {
    const player: CharacterGear = {
      talent_key: STANDARD_KEY,
      trinkets: STANDARD_TRINKETS,
      enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
    };
    const result = await configure(Results.ok(benchWith()), player).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.comparison).toBe(true);
    expect(result.value.talentStatus.status).toBe('ok');
  });

  it('loadComparisonView surfaces a permanent error when the player has no combatant info', async () => {
    const result = await configure(Results.ok(benchWith()), null).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result).toEqual(Results.permanent('No combatant info in this log.', 'gear.combatant-info'));
  });

  it('loadComparisonView propagates a missing bench before fetching player gear', async () => {
    const result = await configure(Results.missing('Not yet ingested.'), null).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });
});
