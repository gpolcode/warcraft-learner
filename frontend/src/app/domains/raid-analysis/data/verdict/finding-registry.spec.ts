import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { EVISCERATE } from '../../../../../testing/spell-ids';
import { pullModel } from '../../../../../testing/builders/pull-model';
import { CooldownUseJudgeService } from '../rotation/cooldown-use-judge-service';
import { ListFindingService } from '../rotation/priority-list/list-finding-service';
import { bench, cdBench } from '../rotation/rotation-harness';
import { CadenceJudgeService } from '../rotation/cadence-judge-service';
import { READY_TIME_FAMILY, ReadyTimeJudgeService } from '../rotation/ready-time-judge-service';
import { DowntimeJudgeService } from '../rotation/downtime-judge-service';
import { BloodlustJudgeService } from '../rotation/bloodlust-judge-service';
import { BurstJudgeService } from '../burst-windows/burst-judge-service';
import type { BurstWindow } from '../analysis/analysis.models';
import { DefensiveJudgeService } from '../defensive/defensive-judge-service';
import { defBench } from '../defensive/defensive-harness';
import type { RotationParseMeasures } from '../rotation/rotation-data-source';
import { GearJudgeService } from '../gear/gear-judge-service';
import type { GearParseMeasures } from '../gear/gear-data-source';
import { FindingFamily } from './finding-family.models';
import { FINDING_REGISTRY } from './finding-registry';
import { VERDICT_CHOICES } from './verdict-choices';

/** Ten top logs that open at 5s, press again at 95s and idle 30s of the pull. */
const TOP_LOGS: RotationParseMeasures[] = Array.from({ length: 10 }, () =>
  ({ idle_s: [[100, 130]], lust_s: null, phase_starts: [], cd_casts_s: { 'Shadow Blades': [5, 95] }, buttons: {} }));
/** Ten top logs whose raid lusted at 2:00 and who pressed Shadow Blades 5s into it. */
const MID_LUST_S = 120;
const LUST_TOP_LOGS: RotationParseMeasures[] = Array.from({ length: 10 }, () =>
  ({ idle_s: null, lust_s: MID_LUST_S, phase_starts: [], cd_casts_s: { 'Shadow Blades': [MID_LUST_S + 5] }, buttons: {} }));
/** The plan's Shadow Blades: a 90s cooldown. */
const SHADOW_BLADES = { name: 'Shadow Blades', cooldown: 90 };
const HELD_TO_130 = { '2': { target_s: 130, delay_s: 30, band_s: 5, effective_cd_s: 90, count: 8, total_samples: 10 } };
const PULL_S = 300;
/** A window the player dealt nothing in, and five top logs that dealt twice their average there. */
const BURST: BurstWindow = {
  time_s: 10, window_length_s: 20, dmg_avg: 1000, dmg_min: 1000, dmg_max: 1000, dmg_stddev: 0, common_cds: [], ability_breakdown: [],
  members: Array.from({ length: 5 }, (_unused, parse) => ({ parse, time_s: 10, window_length_s: 20, damage: 1000 })),
};

/** Ten top logs that each pressed the defensive at 5s and again at 95s. */
const DEFENSIVE_TOP_LOGS = Array.from({ length: 10 }, () => ({ Cloak: [5, 95] }));
/** Ten top logs that had Cloak up in a window they took 1000 in. */
const DEFENSIVE_WINDOW: BurstWindow = { ...BURST, defensive_name: 'Cloak' };
/** Ten top logs with a defensive up through the window, each taking 1000 in its first second. */
const COVERED_TOP_LOGS = Array.from({ length: 10 }, () => ({
  def_casts_s: {}, def_up_s: { Cloak: [[DEFENSIVE_WINDOW.time_s, DEFENSIVE_WINDOW.time_s + DEFENSIVE_WINDOW.window_length_s] as [number, number]] },
  taken_per_s: Array.from({ length: PULL_S }, (_unused, second) => second === DEFENSIVE_WINDOW.time_s ? 1000 : 0), dead_s: [],
}));

const MAIN_HAND = 15;
const SOPHIC = { id: 8041, name: 'Sophic Devotion' };
/** Ten top logs on one build, one trinket pair and Sophic on the main hand. */
const GEAR_TOP_LOGS: GearParseMeasures[] = Array.from({ length: 10 }, () =>
  ({ talent_key: 'v3:11.1', trinket_ids: [1, 2], enchant_ids: { [MAIN_HAND]: SOPHIC.id } }));
const GEAR_TOP_ENCHANTS = { [MAIN_HAND]: [{ ...SOPHIC, icon: '', item_id: null, pct: 100 }] };
const gearRows = (enchants: { slot: number; id: number; name: string }[]) =>
  TestBed.inject(GearJudgeService).enchantRows({ enchants }, GEAR_TOP_ENCHANTS, GEAR_TOP_LOGS, String);

/** One scenario per family that runs its producer on a pull with the family's mistake in it; it witnesses that some producer emits the family. */
const PRODUCING_SCENARIOS: Record<string, () => Promise<readonly { family?: string | null }[]>> = {
  'rotation.button': async () => TestBed.inject(ListFindingService).rows(
    bench({ buttons: [{ action: 'eviscerate', spell_id: EVISCERATE, right: { lo: 1, avg: 1, hi: 1 } }] }),
    { casts: new Map([['eviscerate', [{ atS: 10, verdict: 'off', line: 0, lines: [] }]]]), order: [], ids: new Map() },
    pullModel(),
  ),
  'rotation.ready_time': async () => {
    const judges = TestBed.inject(ReadyTimeJudgeService);
    const casts = TOP_LOGS.map(parse => parse.cd_casts_s);
    const cooldown = judges.readyCooldown(SHADOW_BLADES, casts, SHADOW_BLADES.name);
    const ready = judges.measure([5], [[0, PULL_S]], cooldown, {});
    const reference = judges.reference(casts, casts.map(() => PULL_S), SHADOW_BLADES.name, cooldown, {}, [[0, PULL_S]]);
    return [ready ? judges.finding(READY_TIME_FAMILY, { remedy: String }, SHADOW_BLADES.name, { ready, reference, cooldown, fightDurationS: PULL_S }) ?? {} : {}];
  },
  'rotation.never_used': async () =>
    [TestBed.inject(CooldownUseJudgeService).finding(SHADOW_BLADES, [], cdBench(), pullModel(), TOP_LOGS.map(parse => parse.cd_casts_s), true) ?? {}],
  'rotation.hold': async () => TestBed.inject(CadenceJudgeService).holdFindings('Shadow Blades', [0, 100], HELD_TO_130),
  'rotation.downtime': async () => {
    const judges = TestBed.inject(DowntimeJudgeService);
    const casting = judges.measure([[10, PULL_S]], [[0, PULL_S]]);
    return [casting ? judges.finding(casting, judges.reference(TOP_LOGS, TOP_LOGS.map(() => PULL_S)), PULL_S) ?? {} : {}];
  },
  'rotation.bloodlust': async () => TestBed.inject(BloodlustJudgeService).findings('Shadow Blades', [], MID_LUST_S, LUST_TOP_LOGS),
  'rotation.bloodlust_timing': async () => TestBed.inject(BloodlustJudgeService).findings('Shadow Blades', [MID_LUST_S + 40], MID_LUST_S, LUST_TOP_LOGS),
  'burst.window': async () => [TestBed.inject(BurstJudgeService).verdict(
    BURST, { damage: 0, amplification: 0, startS: 10, lengthS: 20 }, Array.from({ length: 5 }, () => 2),
  )],
  'defensive.uses': async () => [TestBed.inject(DefensiveJudgeService).usesFinding(
    'Cloak', [], defBench({ sample_count: 10, used_sample_count: 10, uses_per_min: { avg: 1.4, stddev: 0.1 }, avg_gap_s: 40 }), pullModel(), DEFENSIVE_TOP_LOGS, false,
  ) ?? {}],
  'defensive.ready_time': async () => [TestBed.inject(DefensiveJudgeService).readyTimeFinding(
    { name: 'Cloak', cooldown: 90 }, [5], pullModel({ fightDurationS: PULL_S }), { perParse: DEFENSIVE_TOP_LOGS, killsS: DEFENSIVE_TOP_LOGS.map(() => PULL_S) }, {},
  ) ?? {}],
  'defensive.hold': async () => TestBed.inject(DefensiveJudgeService).holdFindings('Cloak', [0, 100], HELD_TO_130),
  'defensive.window': async () => {
    const judge = TestBed.inject(DefensiveJudgeService);
    const reference = judge.reference(DEFENSIVE_WINDOW, COVERED_TOP_LOGS, COVERED_TOP_LOGS.map(() => PULL_S));
    return [judge.windowVerdict(DEFENSIVE_WINDOW, { damage: 2000, cover: [], tank: false }, reference)];
  },
  'defensive.dead_in_window': async () => [TestBed.inject(DefensiveJudgeService).deathVerdict(15)],
  'gear.talent_build': async () => {
    const judge = TestBed.inject(GearJudgeService);
    return [judge.talentVerdict('v3:12.1', [{ key: 'v3:11.1', label: 'Most common build' }], judge.talentReference(GEAR_TOP_LOGS)) ?? {}];
  },
  'gear.trinket_pair': async () => {
    const judge = TestBed.inject(GearJudgeService);
    return [judge.trinketVerdict('1-3', [{ key: '1-2', label: 'Most common pair' }], judge.trinketReference(GEAR_TOP_LOGS)) ?? {}];
  },
  'gear.enchant_missing': async () => gearRows([]),
  'gear.enchant': async () => gearRows([{ slot: MAIN_HAND, id: 8039, name: 'Burning Devotion' }]),
};

const blank = (text: string): boolean => text.trim() === '';

const CONFORMANCE: readonly { problem: string; fails: (family: FindingFamily) => boolean }[] = [
  { problem: 'version below 1', fails: family => !Number.isInteger(family.version) || family.version < 1 },
  {
    problem: 'blank text field',
    fails: family => [family.id, family.label, family.claim, family.construct, family.alignment, family.uncertaintyShown, family.copy.message,
      family.reference.population].some(blank),
  },
  { problem: 'reference under the minimum n', fails: family => family.reference.minN < VERDICT_CHOICES.minReferenceN },
  { problem: 'no availability mask', fails: family => !family.availability.length },
  { problem: 'no limits', fails: family => !family.limits.length },
  { problem: 'red tier below the high cost class', fails: family => family.tier === 'red' && family.costClass !== 'high' },
  { problem: 'graded tier with no injected mistake', fails: family => ['red', 'amber'].includes(family.tier) && !family.injectedMistakes.length },
];

const problemsOf = (family: FindingFamily): string[] =>
  CONFORMANCE.filter(check => check.fails(family)).map(check => check.problem);

const family = (over: Partial<FindingFamily> = {}): FindingFamily => ({
  id: 'lost_cooldown', label: 'Cooldown uses', version: 1, tier: 'red',
  claim: 'You pressed a major cooldown fewer times than top raiders do over the same alive time.',
  construct: 'Casts of one cooldown over alive, pre-wipe time.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic kills for the spec and boss', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Alive time',
  availability: ['talent taken'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing'] },
  rule: 'count', costClass: 'high',
  uncertaintyShown: 'Expected uses from 10 top logs',
  copy: { message: 'You pressed {cd} {uses} times. Top raiders press it {expected} times.', remedy: null },
  injectedMistakes: ['drop-major-cooldown-cast'],
  limits: ['Why a cooldown was held'],
  ...over,
});

describe('FINDING_REGISTRY', () => {
  it('gives every family a unique id', () => {
    const ids = FINDING_REGISTRY.map(entry => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('fills every field of every family', () => {
    const incomplete = FINDING_REGISTRY.filter(entry => problemsOf(entry).length);

    expect(incomplete.map(entry => entry.id)).toEqual([]);
  });

  it('has a producer emitting every family', async () => {
    const unused: string[] = [];
    for (const entry of FINDING_REGISTRY) {
      const findings = await PRODUCING_SCENARIOS[entry.id]?.() ?? [];
      if (!findings.some(finding => finding.family === entry.id)) unused.push(entry.id);
    }

    expect(unused).toEqual([]);
  });

  it('keeps no producing scenario for a family outside the registry', () => {
    const ids = new Set(FINDING_REGISTRY.map(entry => entry.id));

    expect(Object.keys(PRODUCING_SCENARIOS).filter(id => !ids.has(id))).toEqual([]);
  });
});

describe('the registry conformance check', () => {
  it('passes a complete family', () => {
    expect(problemsOf(family())).toEqual([]);
  });

  it('fails a family at version 0', () => {
    expect(problemsOf(family({ version: 0 }))).toEqual(['version below 1']);
  });

  it('fails a family with a blank claim', () => {
    expect(problemsOf(family({ claim: ' ' }))).toEqual(['blank text field']);
  });

  it('fails a family with a blank label', () => {
    expect(problemsOf(family({ label: '' }))).toEqual(['blank text field']);
  });

  it('fails a reference one log under the minimum', () => {
    expect(problemsOf(family({ reference: { population: 'Top Mythic kills', minN: VERDICT_CHOICES.minReferenceN - 1 } })))
      .toEqual(['reference under the minimum n']);
  });

  it('fails a family with no availability mask or no limits', () => {
    expect(problemsOf(family({ availability: [], limits: [] }))).toEqual(['no availability mask', 'no limits']);
  });

  it('fails a red family on a medium cost class', () => {
    expect(problemsOf(family({ costClass: 'medium' }))).toEqual(['red tier below the high cost class']);
  });

  it('passes an amber family on a medium cost class', () => {
    expect(problemsOf(family({ tier: 'amber', costClass: 'medium' }))).toEqual([]);
  });

  it('fails a graded family with no injected mistake', () => {
    expect(problemsOf(family({ tier: 'amber', injectedMistakes: [] }))).toEqual(['graded tier with no injected mistake']);
  });

  it('passes a blue family with no injected mistake', () => {
    expect(problemsOf(family({ tier: 'blue', injectedMistakes: [] }))).toEqual([]);
  });
});
