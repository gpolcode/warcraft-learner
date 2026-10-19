import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CharacterGear } from '../wcl/wcl.models';
import { EncounterGearStats } from '../encounter/encounter.models';
import { GearBench, GearParseMeasures } from './gear-data-source';
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

/** A real tree's shape: about 76 picks, of which 72 every top log takes and 4 vary. */
const SHARED_TALENTS = 72;
const CORE = Array.from({ length: SHARED_TALENTS - 1 }, (_, i) => 1000 + i);
/** The one shared talent with two ranks, taken at rank 2. */
const RANKED_TALENT = 1999;
/** Flex talents: each top log takes four of these, so no flex node reaches the shared share. */
const FLEX = [2001, 2002, 2003, 2004, 2005, 2006];
/** Taken by 9 of 10 top logs: exactly the shared share. */
const NINE_OF_TEN = 3001;
/** Taken by 8 of 10 top logs: under the shared share. */
const EIGHT_OF_TEN = 3002;
/** Taken by no top log. */
const OFF_TREE = 4001;

function key(picks: readonly (readonly [number, number])[]): string {
  return `v3:${[...picks].sort((a, b) => a[0] - b[0]).map(([entry, rank]) => `${entry}.${rank}`).join(',')}`;
}

/** Ten top logs on the core and the ranked talent, rotating through the flex talents; the first 9 add NINE_OF_TEN, the first 8 EIGHT_OF_TEN. */
function topKeys(count = TOP_LOGS): string[] {
  return Array.from({ length: count }, (_, i) => key([
    ...CORE.map(entry => [entry, 1] as const),
    [RANKED_TALENT, 2],
    ...[0, 1, 2, 3].map(offset => [FLEX[(i + offset) % FLEX.length] ?? 0, 1] as const),
    ...i < 9 ? [[NINE_OF_TEN, 1] as const] : [],
    ...i < 8 ? [[EIGHT_OF_TEN, 1] as const] : [],
  ]));
}

/** The reference the page and a fold read: the node counts ingest bakes, over the logs with a readable tree. */
function nodeReference(keys: readonly string[]) {
  return judge.talentReference({ talent_nodes: judge.talentNodes(keys), talent_sample_count: judge.readableTrees(keys) });
}

/** A player on the first top log's build with `change` applied to its picks. */
function playerKey(change: (picks: [number, number][]) => [number, number][] = picks => picks): string {
  const picks = (topKeys()[0] ?? '').split(':')[1]?.split(',').map(pick => pick.split('.').map(Number) as [number, number]) ?? [];
  return key(change(picks));
}

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

describe('GearJudgeService.talentNodes', () => {
  const SHARED_ENTRY = 650;
  const RANKED_ENTRY = 651;

  it('counts each entry at each rank over the logs, splitting one entry taken at two ranks', () => {
    expect(judge.talentNodes([`v3:${SHARED_ENTRY}.1,${RANKED_ENTRY}.1`, `v3:${SHARED_ENTRY}.1,${RANKED_ENTRY}.2`])).toEqual([
      { entry_id: SHARED_ENTRY, rank: 1, count: 2 },
      { entry_id: RANKED_ENTRY, rank: 1, count: 1 },
      { entry_id: RANKED_ENTRY, rank: 2, count: 1 },
    ]);
  });

  it('counts nothing for an unreadable tree or a key of another version, and leaves both out of the readable trees', () => {
    expect(judge.talentNodes(['', 'v2:11,22'])).toEqual([]);
    expect(judge.readableTrees(['', 'v2:11,22', `v3:${SHARED_ENTRY}.1`])).toBe(1);
  });
});

describe('GearJudgeService.talentVerdict', () => {
  const reference = nodeReference(topKeys());
  /** The 71 core talents, the ranked talent and NINE_OF_TEN. */
  const SHARED = SHARED_TALENTS + 1;

  it('reads on plan with the shared count when the player takes every shared talent', () => {
    expect(judge.talentVerdict(playerKey(), reference)).toMatchObject({
      family: TALENT_BUILD_FAMILY.id, tone: 'neutral', onPlan: true, n: TOP_LOGS, shared: SHARED, missed: [],
      note: `You take all ${SHARED} talents at least 9 of 10 top raiders share.`,
    });
  });

  it('counts a skipped shared talent and one at another rank as differences, in blue, with each one\'s count', () => {
    const verdict = judge.talentVerdict(playerKey(picks => [
      ...picks.filter(([entry]) => entry !== CORE[0]).map(([entry, rank]): [number, number] => [entry, entry === RANKED_TALENT ? 1 : rank]),
      [OFF_TREE, 1],
    ]), reference);

    expect(verdict).toMatchObject({
      tone: 'blue', onPlan: false,
      note: `You differ on 2 of the ${SHARED} talents at least 9 of 10 top raiders share.`,
      missed: [
        { entryId: CORE[0], rank: 1, k: TOP_LOGS, playerRank: null },
        { entryId: RANKED_TALENT, rank: 2, k: TOP_LOGS, playerRank: 1 },
      ],
    });
  });

  it('treats a talent 9 of 10 top logs take as shared', () => {
    expect(judge.talentVerdict(playerKey(picks => picks.filter(([entry]) => entry !== NINE_OF_TEN)), reference)?.missed)
      .toEqual([{ entryId: NINE_OF_TEN, rank: 1, k: 9, playerRank: null }]);
  });

  it('leaves a talent 8 of 10 top logs take out of the shared set', () => {
    expect(judge.talentVerdict(playerKey(picks => picks.filter(([entry]) => entry !== EIGHT_OF_TEN)), reference)?.onPlan).toBe(true);
  });

  it('lists the picks at most 1 of 10 top logs take instead, but not one 2 of 10 take', () => {
    const takenBy = (takers: number) => nodeReference(topKeys().map((top, i) => i < takers ? `${top},${OFF_TREE}.1` : top));
    const player = playerKey(picks => [...picks, [OFF_TREE, 1]]);

    expect(judge.talentVerdict(player, takenBy(1))?.instead).toEqual([{ entryId: OFF_TREE, rank: 1, k: 1 }]);
    expect(judge.talentVerdict(player, takenBy(2))?.instead).toEqual([]);
  });

  it('stays blue when every top log shares the talent the player skips', () => {
    expect(judge.talentVerdict(playerKey(picks => picks.filter(([entry]) => entry !== CORE[0])), reference)?.tone).toBe('blue');
  });

  it('names the share as all of them when the shared share rounds up to every top log', () => {
    const five = nodeReference(topKeys(5));
    /** All five also take EIGHT_OF_TEN. */
    const sharedByFive = SHARED + 1;

    expect(judge.talentVerdict(playerKey(picks => picks.filter(([entry]) => entry !== CORE[0])), five)).toMatchObject({
      tone: 'blue', note: `You differ on 1 of the ${sharedByFive} talents 5 of 5 top raiders share.`,
    });
  });

  it('is a comparison under five top logs with a readable tree', () => {
    const four = nodeReference([...topKeys(4), '', '']);

    expect(judge.talentVerdict(playerKey(picks => picks.filter(([entry]) => entry !== CORE[0])), four)?.tone).toBe('neutral');
  });

  it('judges nothing without a player tree, across key versions, or on a bench without node counts', () => {
    expect(judge.talentVerdict('', reference)).toBeNull();
    expect(judge.talentVerdict('v2:11,22', reference)).toBeNull();
    expect(judge.talentVerdict(playerKey(), judge.talentReference({} as GearBench))).toBeNull();
  });
});

describe('GearJudgeService.nodeTones', () => {
  it('gives one test per shared talent, blue only where the player differs', () => {
    const tones = judge.nodeTones(playerKey(picks => picks.filter(([entry]) => entry !== CORE[0])), nodeReference(topKeys()));

    expect(tones).toHaveLength(SHARED_TALENTS + 1);
    expect(tones.filter(entry => entry.tone === 'blue').map(entry => entry.node.entry_id)).toEqual([CORE[0]]);
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
