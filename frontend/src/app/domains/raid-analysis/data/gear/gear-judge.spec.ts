import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CharacterGear } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { GearParseMeasures } from './gear-data-source';
import { ENCHANT_CHOICE_FAMILY, ENCHANT_MISSING_FAMILY, GearJudgeService, TALENT_BUILD_FAMILY, TRINKET_PAIR_FAMILY } from './gear-judge-service';
import { GearComparisonService } from './gear-comparison-service';
import { TalentKeyService } from './talent-key-service';

const judge = TestBed.inject(GearJudgeService);
const slotName = (slot: number): string => TestBed.inject(GearComparisonService).slotName(slot);

const TOP_LOGS = 10;
const MAIN_HAND = 15;
const RING_1 = 10;
const RING_2 = 11;
const SOPHIC = { id: 8041, name: 'Sophic Devotion' };
/** A second quality rank of Sophic Devotion: another id under the same item name. */
const SOPHIC_RANK_2 = { id: 8042, name: 'Sophic Devotion' };
const BURNING = { id: 8039, name: 'Burning Devotion' };
const MASTERY = { id: 7969, name: "Enchant Ring - Zul'jin's Mastery" };
const ALACRITY = { id: 8025, name: "Enchant Ring - Silvermoon's Alacrity" };
const HASTE = { id: 8021, name: 'Enchant Ring - Thalassian Haste' };

const MOST_COMMON = 'v3:11.1,22.2';
const SECOND_BUILD = 'v3:12.1,22.2';
const UNBENCHED_BUILD = 'v3:99.1,22.2';
const RANKED_BUILDS = [
  { key: MOST_COMMON, label: 'Most common build' },
  { key: SECOND_BUILD, label: '2nd most common build' },
];

const GAZE = 249343;
const PUZZLE_BOX = 193701;
const VOLATILE = 999999;
const TOP_PAIR = `${PUZZLE_BOX}-${GAZE}`;
const SECOND_PAIR = `${PUZZLE_BOX}-${VOLATILE}`;
const RANKED_PAIRS = [{ key: TOP_PAIR, label: 'Most common pair' }, { key: SECOND_PAIR, label: '2nd most common pair' }];

function parse(over: Partial<GearParseMeasures> = {}): GearParseMeasures {
  return { talent_key: '', trinket_ids: [], enchant_ids: {}, ...over };
}

/** `count` top logs each carrying the same picks. */
function logs(count: number, over: Partial<GearParseMeasures> = {}): GearParseMeasures[] {
  return Array.from({ length: count }, () => parse(over));
}

function listed(...enchants: { id: number; name: string }[]): EncounterGearStats['enchants'][number] {
  return enchants.map(enchant => ({ ...enchant, icon: '', item_id: null, pct: 0 }));
}

function item(enchant: { name: string }) {
  return { name: enchant.name, itemId: null, icon: '' };
}

function wearing(...enchants: { slot: number; id: number; name: string }[]): CharacterGear {
  return { enchants };
}

describe('GearJudgeService measures', () => {
  it('reads the talent key through the same parse ingest bakes', () => {
    const tree = [{ id: 22, rank: 2 }, { id: 11, rank: 1 }];

    expect(judge.measureTalentKey(tree)).toBe(TestBed.inject(TalentKeyService).talentKeyFromTree(tree));
  });

  it('keys a trinket pair the same whichever slot each trinket sits in', () => {
    expect(judge.trinketKey(judge.measureTrinkets([{ id: GAZE }, { id: PUZZLE_BOX }]))).toBe(TOP_PAIR);
    expect(judge.trinketKey(judge.measureTrinkets([{ id: PUZZLE_BOX }, { id: GAZE }]))).toBe(TOP_PAIR);
  });

  it('separates a pair from one trinket worn alone, and keys no trinket as empty', () => {
    expect(judge.trinketKey(judge.measureTrinkets([{ id: GAZE }]))).not.toBe(TOP_PAIR);
    expect(judge.trinketKey(judge.measureTrinkets([]))).toBe('');
  });

  it('keys enchants by slot and drops a slot whose enchant id is 0', () => {
    expect(judge.measureEnchants([{ slot: MAIN_HAND, id: SOPHIC.id }, { slot: RING_1, id: 0 }])).toEqual({ [MAIN_HAND]: SOPHIC.id });
  });
});

describe('GearJudgeService.talentVerdict', () => {
  /** Six top logs on the most common build, three on the second, one elsewhere. */
  const reference = judge.talentReference([
    ...logs(6, { talent_key: MOST_COMMON }), ...logs(3, { talent_key: SECOND_BUILD }), parse({ talent_key: UNBENCHED_BUILD.replace('99', '98') }),
  ]);

  it('reads on plan with the count when the player uses the most common build', () => {
    expect(judge.talentVerdict(MOST_COMMON, RANKED_BUILDS, reference)).toMatchObject({
      family: TALENT_BUILD_FAMILY.id, tone: 'neutral', onPlan: true, n: TOP_LOGS,
      note: 'Most common build. 6 of 10 top raiders use it.',
    });
  });

  it('names a lower-ranked build with both counts, in blue', () => {
    expect(judge.talentVerdict(SECOND_BUILD, RANKED_BUILDS, reference)).toMatchObject({
      tone: 'blue', onPlan: false,
      note: '2nd most common build. 3 of 10 top raiders use it. 6 of 10 use the most common one.',
    });
  });

  it('calls a build outside the list uncommon, in blue', () => {
    expect(judge.talentVerdict(UNBENCHED_BUILD, RANKED_BUILDS, reference)).toMatchObject({
      tone: 'blue', note: 'Uncommon build. 6 of 10 top raiders use the most common one.',
    });
  });

  it('stays blue when every top log shares the most common build', () => {
    expect(judge.talentVerdict(UNBENCHED_BUILD, RANKED_BUILDS, judge.talentReference(logs(TOP_LOGS, { talent_key: MOST_COMMON })))?.tone)
      .toBe('blue');
  });

  it('is a comparison under five top logs with a readable tree', () => {
    const four = judge.talentReference([...logs(4, { talent_key: MOST_COMMON }), ...logs(6)]);

    expect(judge.talentVerdict(UNBENCHED_BUILD, RANKED_BUILDS, four)?.tone).toBe('neutral');
  });

  it('is blue from five top logs with a readable tree', () => {
    const five = judge.talentReference(logs(5, { talent_key: MOST_COMMON }));

    expect(judge.talentVerdict(UNBENCHED_BUILD, RANKED_BUILDS, five)?.tone).toBe('blue');
  });

  it('prints no count on a bench without per-log builds', () => {
    expect(judge.talentVerdict(UNBENCHED_BUILD, RANKED_BUILDS, judge.talentReference([]))).toMatchObject({
      tone: 'neutral', note: 'Uncommon build.', n: 0,
    });
  });

  it('judges nothing without a player key, without bench builds, or across key versions', () => {
    expect(judge.talentVerdict('', RANKED_BUILDS, reference)).toBeNull();
    expect(judge.talentVerdict(MOST_COMMON, [], reference)).toBeNull();
    expect(judge.talentVerdict('v2:11,22', RANKED_BUILDS, reference)).toBeNull();
  });
});

describe('GearJudgeService.trinketVerdict', () => {
  const reference = judge.trinketReference([
    ...logs(5, { trinket_ids: [PUZZLE_BOX, GAZE].sort((a, b) => a - b) }), ...logs(3, { trinket_ids: [PUZZLE_BOX, VOLATILE] }), ...logs(2),
  ]);

  it('counts only the top logs wearing trinkets', () => {
    expect(reference.n).toBe(8);
  });

  it('reads on plan when the player wears the most common pair', () => {
    expect(judge.trinketVerdict(TOP_PAIR, RANKED_PAIRS, reference)).toMatchObject({
      family: TRINKET_PAIR_FAMILY.id, tone: 'neutral', onPlan: true, note: 'Most common pair. 5 of 8 top raiders use it.',
    });
  });

  it('names a lower-ranked pair with both counts, in blue', () => {
    expect(judge.trinketVerdict(SECOND_PAIR, RANKED_PAIRS, reference)).toMatchObject({
      tone: 'blue', note: '2nd most common pair. 3 of 8 top raiders use it. 5 of 8 use the most common one.',
    });
  });

  it('calls a pair outside the list uncommon, in blue', () => {
    expect(judge.trinketVerdict(`${GAZE}`, RANKED_PAIRS, reference)).toMatchObject({
      tone: 'blue', note: 'Uncommon pair. 5 of 8 top raiders use the most common one.',
    });
  });

  it('judges nothing without a player pair or without bench pairs', () => {
    expect(judge.trinketVerdict('', RANKED_PAIRS, reference)).toBeNull();
    expect(judge.trinketVerdict(TOP_PAIR, [], reference)).toBeNull();
  });
});

describe('GearJudgeService.enchantLeaders', () => {
  it('counts enchant ids sharing a name as one enchant', () => {
    const perParse = [
      ...logs(3, { enchant_ids: { [MAIN_HAND]: SOPHIC.id } }),
      ...logs(3, { enchant_ids: { [MAIN_HAND]: SOPHIC_RANK_2.id } }),
      ...logs(4, { enchant_ids: { [MAIN_HAND]: BURNING.id } }),
    ];

    expect(judge.enchantLeaders({ [MAIN_HAND]: listed(BURNING, SOPHIC, SOPHIC_RANK_2) }, perParse)).toEqual([
      { slot: MAIN_HAND, identity: SOPHIC.name, item: item(SOPHIC), k: 6, n: TOP_LOGS },
    ]);
  });

  it('keeps the bench order on a tie', () => {
    const perParse = [...logs(5, { enchant_ids: { [MAIN_HAND]: SOPHIC.id } }), ...logs(5, { enchant_ids: { [MAIN_HAND]: BURNING.id } })];

    expect(judge.enchantLeaders({ [MAIN_HAND]: listed(BURNING, SOPHIC) }, perParse)[0]?.identity).toBe(BURNING.name);
  });

  it('names an enchant the bench left unnamed by its id', () => {
    const perParse = logs(TOP_LOGS, { enchant_ids: { [MAIN_HAND]: SOPHIC.id } });

    expect(judge.enchantLeaders({ [MAIN_HAND]: listed({ id: SOPHIC.id, name: '' }) }, perParse)[0]?.item.name).toBe(`Enchant #${SOPHIC.id}`);
  });
});

describe('GearJudgeService.agreedLeaders', () => {
  const top = { [MAIN_HAND]: listed(SOPHIC) };

  it('keeps a leader exactly half of the top logs use', () => {
    const perParse = [...logs(5, { enchant_ids: { [MAIN_HAND]: SOPHIC.id } }), ...logs(5)];

    expect(judge.agreedLeaders(judge.enchantLeaders(top, perParse))).toHaveLength(1);
  });

  it('drops a leader under half of the top logs', () => {
    const perParse = [...logs(4, { enchant_ids: { [MAIN_HAND]: SOPHIC.id } }), ...logs(6)];

    expect(judge.agreedLeaders(judge.enchantLeaders(top, perParse))).toEqual([]);
  });

  it('drops a leader every one of four top logs use', () => {
    expect(judge.agreedLeaders(judge.enchantLeaders(top, logs(4, { enchant_ids: { [MAIN_HAND]: SOPHIC.id } })))).toEqual([]);
  });
});

describe('GearJudgeService.enchantRows', () => {
  const top = { [MAIN_HAND]: listed(SOPHIC, BURNING, SOPHIC_RANK_2) };
  const using = (count: number, enchant: { id: number }): GearParseMeasures[] => logs(count, { enchant_ids: { [MAIN_HAND]: enchant.id } });
  const rows = (gear: CharacterGear, perParse: GearParseMeasures[]) => judge.enchantRows(gear, top, perParse, slotName);

  it('flags a missing enchant amber, with an order, behind a leader exactly half the top logs use', () => {
    expect(rows(wearing(), [...using(5, SOPHIC), ...logs(5)])).toEqual([{
      slotName: 'Main Hand', family: ENCHANT_MISSING_FAMILY.id, tone: 'amber', onPlan: false, name: 'Not enchanted',
      note: '5 of 10 top raiders use it. Apply it.', top: item(SOPHIC), n: TOP_LOGS,
    }]);
  });

  it('counts a missing enchant in blue behind a leader under half the top logs', () => {
    expect(rows(wearing(), [...using(4, SOPHIC), ...using(3, BURNING), ...logs(3)])[0]).toMatchObject({
      family: ENCHANT_MISSING_FAMILY.id, tone: 'blue', note: '4 of 10 top raiders use it.',
    });
  });

  it('shows a missing enchant as a comparison under five top logs', () => {
    expect(rows(wearing(), using(4, SOPHIC))[0]).toMatchObject({ tone: 'neutral', note: '4 of 4 top raiders use it.' });
  });

  it('counts a different enchant in blue, even when every top log agrees', () => {
    expect(rows(wearing({ slot: MAIN_HAND, ...BURNING }), using(TOP_LOGS, SOPHIC))[0]).toMatchObject({
      family: ENCHANT_CHOICE_FAMILY.id, tone: 'blue', onPlan: false, name: BURNING.name, note: '10 of 10 top raiders use it.', top: item(SOPHIC),
    });
  });

  it('reads another quality rank of the leading enchant as on plan', () => {
    expect(rows(wearing({ slot: MAIN_HAND, ...SOPHIC_RANK_2 }), using(TOP_LOGS, SOPHIC))).toEqual([{
      slotName: 'Main Hand', family: null, tone: 'neutral', onPlan: true, name: SOPHIC_RANK_2.name, note: null, top: null, n: TOP_LOGS,
    }]);
  });

  it('reads an enchant on a slot no top log enchants as on plan', () => {
    expect(rows(wearing({ slot: 9, id: 7, name: 'Handguard' }), [])).toMatchObject([{ slotName: 'Hands', onPlan: true, n: 0 }]);
  });

  it('names an unnamed player enchant by its id', () => {
    expect(rows(wearing({ slot: MAIN_HAND, id: BURNING.id, name: '' }), using(TOP_LOGS, SOPHIC))[0]?.name).toBe(`Enchant #${BURNING.id}`);
  });

  it('has no row when neither the player nor any top log enchants', () => {
    expect(rows(wearing(), logs(TOP_LOGS))).toEqual([]);
  });
});

describe('GearJudgeService.enchantRows (the two rings as a pair)', () => {
  const top = { [RING_1]: listed(MASTERY, ALACRITY), [RING_2]: listed(ALACRITY, MASTERY) };
  /** Mastery leads Ring 1 and Alacrity leads Ring 2 on every top log. */
  const perParse = logs(TOP_LOGS, { enchant_ids: { [RING_1]: MASTERY.id, [RING_2]: ALACRITY.id } });
  const rings = (ring1: { id: number; name: string } | null, ring2: { id: number; name: string } | null) => judge.enchantRows(wearing(
    ...(ring1 ? [{ slot: RING_1, ...ring1 }] : []), ...(ring2 ? [{ slot: RING_2, ...ring2 }] : []),
  ), top, perParse, slotName);

  it('reads both rings on plan when the player wears the leading pair swapped', () => {
    expect(rings(ALACRITY, MASTERY).map(row => row.onPlan)).toEqual([true, true]);
  });

  it('reads each ring against its own slot when one ring wears another enchant', () => {
    expect(rings(MASTERY, HASTE).map(row => [row.onPlan, row.family])).toEqual([[true, null], [false, ENCHANT_CHOICE_FAMILY.id]]);
  });

  it('reads each ring against its own slot when one ring is not enchanted', () => {
    expect(rings(null, MASTERY).map(row => [row.name, row.tone])).toEqual([['Not enchanted', 'amber'], [MASTERY.name, 'blue']]);
  });
});
