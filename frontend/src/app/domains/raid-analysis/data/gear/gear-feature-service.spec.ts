import { describe, it, expect, assert } from 'vitest';
import { CharacterGear, WclCombatantInfo, WclGearItem } from '../wcl/wcl.models';
import { GEAR_DATA_SOURCE, GearBench, GearParseMeasures } from './gear-data-source';
import { featureService } from '../../../../../testing/service-harness';
import { Result, Results } from '../../../shared/util-http/result';
import { GearFeatureService } from './gear-feature-service';
import { TestBed } from '@angular/core/testing';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { benchSources } from '../../../../../testing/builders/bench-sources';
import { SpecTalents } from './talent.models';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: GEAR_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(GearFeatureService);
TestBed.resetTestingModule();

const STANDARD_KEY = 'v3:11.1,22.1';
const SPEC_TALENTS: SpecTalents = { 11: { name: 'Core', icon: 'core' }, 22: { name: 'Shared', icon: 'shared' }, 33: { name: 'Rare', icon: 'rare' } };
const GAZE = { id: 100, name: 'A', icon: 'inv_a' };
const PUZZLE_BOX = { id: 200, name: 'B', icon: 'inv_b' };
const STANDARD_PAIR = [{ items: [GAZE, PUZZLE_BOX], pct: 70 }];
const STANDARD_TRINKETS = [{ slot: 12, id: GAZE.id, name: GAZE.name }, { slot: 13, id: PUZZLE_BOX.id, name: PUZZLE_BOX.name }];

const SOPHIC_ON_MAIN_HAND: Record<number, number> = { 15: 8041 };
const NO_ENCHANT: Record<number, number> = {};
const OTHER_KEY = 'v3:11.1,33.1';
/** Ten top logs: nine on the standard build, seven on the standard pair, nine with Sophic on the main hand. */
const TOP_LOGS: GearParseMeasures[] = Array.from({ length: 10 }, (_unused, i) => ({
  talent_key: i < 9 ? STANDARD_KEY : OTHER_KEY,
  trinket_ids: i < 7 ? [GAZE.id, PUZZLE_BOX.id] : [GAZE.id],
  enchant_ids: i < 9 ? SOPHIC_ON_MAIN_HAND : NO_ENCHANT,
}));

function benchWith(overrides: Partial<GearBench> = {}): GearBench {
  return {
    spec: 'SubtletyRogue', encounter_id: 1, encounter_name: 'Boss', metric: 'dps', sample_count: 10, sources: benchSources(10),
    talent_builds: [{ key: STANDARD_KEY, pct: 80, report_code: 'abc', fight_id: 2, player_name: 'Top', source_id: 5, diff: [] }],
    trinket_sets: STANDARD_PAIR,
    enchants: { 15: [{ id: 8041, name: 'Sophic', icon: '', item_id: null, pct: 90 }] },
    talent_nodes: [{ entry_id: 11, rank: 1, count: 10 }, { entry_id: 22, rank: 1, count: 9 }, { entry_id: 33, rank: 1, count: 1 }],
    talent_sample_count: 10, talent_names: SPEC_TALENTS, per_parse: TOP_LOGS,
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
      .toEqual(Results.unusableLog('This log has no combatant info.', 'gear.combatant-info'));
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
  it('lists the agreed enchants with their share and marks no row as the player\'s', () => {
    const view = svc['buildBenchGearView'](benchWith());
    expect(view.comparison).toBe(false);
    expect(view.benchEnchantRows).toEqual([{ slotName: 'Main Hand', enchant: { name: 'Sophic', itemId: null, icon: '' }, share: '9 of 10 top logs' }]);
    expect(view.talentBuilds[0]).toMatchObject({ pct: 80, label: 'Most common build' });
    expect(view.trinketSets[0]).toEqual({ pct: 70, isPlayer: false, label: 'Most common pair', items: [GAZE, PUZZLE_BOX] });
    expect(view.trinketVerdict).toBeNull();
    expect(view.enchantRows).toEqual([]);
  });

  it('says why no enchant is listed when no slot reaches half of the top logs', () => {
    const view = svc['buildBenchGearView'](benchWith({ per_parse: TOP_LOGS.map((log, i) => ({ ...log, enchant_ids: i < 4 ? SOPHIC_ON_MAIN_HAND : NO_ENCHANT })) }));
    expect(view.enchantEmpty).toBe('No enchant data. No slot where at least half of the 10 top logs use one enchant.');
  });

  it('counts the top logs in the empty states', () => {
    const view = svc['buildBenchGearView'](benchWith({ talent_builds: [], trinket_sets: [], enchants: {}, per_parse: TOP_LOGS.map(log => ({ ...log, enchant_ids: {} })) }));
    expect([view.talentEmpty, view.trinketEmpty, view.enchantEmpty]).toEqual([
      'No talent data. None of the 10 top logs has a readable talent tree.',
      'No trinket data. None of the 10 top logs carries a trinket.',
      'No enchant data. None of the 10 top logs carries an enchant.',
    ]);
  });
});

describe('buildGearView', () => {
  const matchingPlayer: CharacterGear = {
    talent_key: STANDARD_KEY,
    trinkets: STANDARD_TRINKETS,
    enchants: [{ slot: 15, id: 8041, name: 'Sophic' }],
  };

  it('turns comparison mode on once there is a player to compare', () => {
    expect(svc['buildGearView'](matchingPlayer, benchWith()).comparison).toBe(true);
  });

  it('reads a player matching the bench on plan in talents, trinkets and enchants, with the counts', () => {
    const view = svc['buildGearView'](matchingPlayer, benchWith());
    expect(view.talentVerdict).toMatchObject({ onPlan: true, note: 'You take all 2 talents at least 9 of 10 top raiders share.' });
    expect(view.talentDiff).toBeNull();
    expect(view.trinketVerdict).toMatchObject({ onPlan: true, note: 'Most common pair. 7 of 10 top raiders use it.' });
    expect(view.enchantRows.every(row => row.onPlan)).toBe(true);
    expect(view.enchantsClean).toBe('Nothing flagged. 1 enchant checked against 10 top logs.');
  });

  it('marks the bench trinket pair the player is running as theirs', () => {
    expect(svc['buildGearView'](matchingPlayer, benchWith()).trinketSets[0]).toMatchObject({ isPlayer: true });
  });

  it('counts the top logs on the most common pair when the player wears another', () => {
    const view = svc['buildGearView']({ ...matchingPlayer, trinkets: [{ slot: 12, id: 999, name: 'Off Meta' }] }, benchWith());
    expect(view.trinketVerdict).toMatchObject({ tone: 'blue', note: 'Uncommon pair. 7 of 10 top raiders use the most common one.' });
    expect(view.trinketSets.some(row => row.isPlayer)).toBe(false);
  });

  it('counts the shared talents the player skips in blue and names each one in the diff with its count', () => {
    const view = svc['buildGearView']({ ...matchingPlayer, talent_key: OTHER_KEY }, benchWith());

    expect(view.talentVerdict).toMatchObject({ tone: 'blue', note: 'You differ on 1 of the 2 talents at least 9 of 10 top raiders share.' });
    expect(view.talentDiff).toEqual({
      missing: [{ talent: SPEC_TALENTS[22], share: '9 of 10 top logs' }], ranks: [], instead: [{ talent: SPEC_TALENTS[33], share: '1 of 10 top logs' }],
    });
  });

  it('names a talent by its id on a bench without baked talent names', () => {
    const { talent_names: _names, ...older } = benchWith();
    const view = svc['buildGearView']({ ...matchingPlayer, talent_key: OTHER_KEY }, older as GearBench);

    expect(view.talentDiff?.missing[0]?.talent.name).toBe('Talent #22');
  });

  it('flags a missing enchant most top logs use in amber', () => {
    const view = svc['buildGearView']({ ...matchingPlayer, enchants: [] }, benchWith());
    expect(view.enchantRows).toMatchObject([{ tone: 'amber', note: '9 of 10 top raiders use it. Apply it.' }]);
  });

  it('judges nothing in color on a bench without per-log picks', () => {
    const view = svc['buildGearView']({ ...matchingPlayer, talent_key: OTHER_KEY, enchants: [] }, benchWith({ per_parse: [], talent_nodes: [], talent_sample_count: 0 }));
    expect([view.talentVerdict, view.enchantRows.length]).toEqual([null, 0]);
  });
});

describe('emptyGearView', () => {
  it('is a bench-off placeholder with no rows', () => {
    expect(svc.emptyGearView()).toEqual({
      comparison: false,
      talentBuilds: [], talentVerdict: null, talentDiff: null, talentEmpty: 'No talent data.',
      trinketSets: [], trinketVerdict: null, trinketEmpty: 'No trinket data.',
      enchantRows: [], benchEnchantRows: [], enchantEmpty: 'No enchant data.', enchantsClean: '', bench: null, notGraded: [],
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
    expect(result.value.talentVerdict?.onPlan).toBe(true);
  });

  it('loadComparisonView names the diff\'s talents from the bench', async () => {
    const player: CharacterGear = { talent_key: OTHER_KEY, trinkets: STANDARD_TRINKETS, enchants: [{ slot: 15, id: 8041, name: 'Sophic' }] };
    const result = await configure(Results.ok(benchWith()), player).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    assert(result.ok);

    expect(result.value.talentDiff?.missing.map(row => row.talent.name)).toEqual([SPEC_TALENTS[22]?.name]);
  });

  it('loadComparisonView surfaces a permanent error when the player has no combatant info', async () => {
    const result = await configure(Results.ok(benchWith()), null).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result).toEqual(Results.unusableLog('This log has no combatant info.', 'gear.combatant-info'));
  });

  it('loadComparisonView propagates a missing bench before fetching player gear', async () => {
    const result = await configure(Results.missing('Not yet ingested.'), null).loadComparisonView('SubtletyRogue', 1, 'r1', 3, 10);
    expect(result).toEqual(Results.missing('Not yet ingested.'));
  });
});
