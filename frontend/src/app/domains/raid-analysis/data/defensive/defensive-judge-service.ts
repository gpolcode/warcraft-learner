import { inject, Injectable } from '@angular/core';
import { median } from 'd3-array';
import { AnalysisFinding, BurstWindow, DefensiveWindow } from '../analysis/analysis.models';
import { fmtClock, round, spansS } from '../analysis/analysis-math';
import { DeadSpan, DeathTimelineService } from '../analysis/death-timeline-service';
import { BurstJudgeService } from '../burst-windows/burst-judge-service';
import { AuraSpan, DefensiveParseMeasures } from './defensive-data-source';
import { PullModel } from '../analysis/pull-model-service';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { CadenceBenchmark, CdHoldTargets } from '../encounter/encounter.models';
import { CadenceJudgeService, CastsByName } from '../rotation/cadence-judge-service';
import { CooldownUseJudgeService } from '../rotation/cooldown-use-judge-service';
import { ReadyTimeJudgeService, ReadyVoice } from '../rotation/ready-time-judge-service';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps, RowRank, Tone } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const DEFENSIVE_LIMITS = ['Which mechanic a defensive was saved for', 'Assignments: soaks, debuff targets, the active tank', 'Externals and healing the player received'];
const DEFENSIVE_VOICE: ReadyVoice = { remedy: name => `Use ${name} more often while it is ready.` };
/** A use touching the window this close to either edge still covered it: an aura logs a moment off the hit it was pressed for. */
const COVER_SLACK_S = 3;

export const DEFENSIVE_USES_FAMILY: FindingFamily = {
  id: 'defensive.uses',
  label: 'Defensive uses',
  version: 1,
  tier: 'amber',
  claim: 'You pressed a defensive fewer times over your alive time than top raiders press it over the same time.',
  construct: 'Uses of one plan defensive inside the judged span, against the top logs\' uses per alive minute capped by their cadence fit.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'Alive time before the judged end',
  availability: ['Talent taken, where the defensive is a talent', 'Used by at least half of the top logs', 'At least one expected use over the alive time', 'Pressed on the player, not as an external'],
  raidDecisions: { relative: [], gated: [], excluded: ['External assignments'] },
  rule: 'count',
  costClass: 'medium',
  uncertaintyShown: 'Uses and expected uses, with the count of top logs',
  copy: { message: 'You pressed {cd} {uses} times {over}. {n} top logs average {expected} in that time.', remedy: 'Use {cd} {missing}x more.' },
  injectedMistakes: ['strip-defensive'],
  limits: DEFENSIVE_LIMITS,
};

export const DEFENSIVE_READY_TIME_FAMILY: FindingFamily = {
  id: 'defensive.ready_time',
  label: 'Defensive ready time',
  version: 1,
  tier: 'amber',
  claim: 'A defensive sat ready and unused for at least one cooldown\'s worth of your alive time, longer than top raiders leave it over the same time.',
  construct: 'Share of alive time before the judged end in which every charge of one plan defensive was ready and unused, on the stored cooldown or the faster one the top logs show, leaving out a wait a hold target explains or one that crosses a death.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic logs for the spec and boss that used the defensive, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'The player\'s alive spans before the judged end, each top log read over the same spans cut at its kill',
  availability: ['Used by at least half of the top logs', 'At least one use in the pull', 'Pressed on the player, not as an external'],
  raidDecisions: { relative: [], gated: ['Holds most top logs make for a later mechanic'], excluded: ['External assignments'] },
  rule: 'mechanistic',
  costClass: 'medium',
  uncertaintyShown: 'Your ready time and the top logs\' average over the same time, with their count',
  copy: {
    message: '{cd} sat ready and unpressed for {ready} of the {alive} you were alive, the longest from {from} to {to}. {n} top logs leave it ready {avg} on average in that time.',
    remedy: 'Use {cd} more often while it is ready.',
  },
  injectedMistakes: ['delay-cooldown-30s'],
  limits: [...DEFENSIVE_LIMITS, 'A wait that crosses a death'],
};

export const DEFENSIVE_HOLD_FAMILY: FindingFamily = {
  id: 'defensive.hold',
  label: 'Defensive holds',
  version: 1,
  tier: 'blue',
  claim: 'k of n top raiders hold a defensive for a moment on the pull clock; you pressed it earlier, so it was not ready then.',
  construct: 'A use before the hold target\'s band whose cooldown still runs at the target, with no use inside the band.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'Pull clock, the stretch from the early use to the target alive and before the judged end',
  availability: ['A hold most top logs make for the same moment', 'Pressed on the player, not as an external'],
  raidDecisions: { relative: [], gated: [], excluded: ['External assignments'] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who hold it',
  copy: { message: '{k} of {n} top raiders hold {cd} for {target}. You pressed it at {at}, so it was not ready then.', remedy: null },
  injectedMistakes: [],
  limits: DEFENSIVE_LIMITS,
};

export const DEFENSIVE_WINDOW_FAMILY: FindingFamily = {
  id: 'defensive.window',
  label: 'Defensive windows',
  version: 2,
  tier: 'amber',
  claim: 'You had no defensive up in a window most top raiders had one up in, and took more damage there than half of them.',
  construct: 'Whether any plan defensive\'s own aura was up within 3 s of the window, with damage taken in the window\'s whole seconds as the second condition.',
  pendingRebuild: null,
  reference: {
    population: 'Top Mythic logs for the spec and boss, ranked on its metric, whose kill reaches the window and who are alive through it',
    minN: VERDICT_CHOICES.minReferenceN,
  },
  alignment: 'Pull clock; the window wholly inside alive time before the judged end, each top log alive through it',
  availability: ['The window lies wholly inside alive time before the judged end', 'Damage only for a non-tank on a window the top logs take damage in'],
  raidDecisions: { relative: [], gated: [], excluded: ['Assignments: soaks, debuff targets, the active tank'] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who had a defensive up',
  copy: {
    message: 'No defensive was up at {at}. You took more damage here than half of the top raiders. {k} of {n} top raiders had one up.',
    remedy: null,
  },
  injectedMistakes: ['strip-defensive', 'uncover-window'],
  limits: [...DEFENSIVE_LIMITS, 'Immunities and mitigation that open no aura on the player'],
};

export const DEAD_IN_WINDOW_FAMILY: FindingFamily = {
  id: 'defensive.dead_in_window',
  label: 'Deaths in windows',
  version: 2,
  tier: 'red',
  claim: 'You died in a window top raiders cover with a defensive.',
  construct: 'The player\'s death inside the window, attributed to the first window that holds it.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on its metric, whose kill reaches the window', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Pull clock; the player alive when the window opens, the death before the judged end',
  availability: ['The player alive at the window\'s start'],
  raidDecisions: { relative: [], gated: [], excluded: ['Deaths after the judged end'] },
  rule: 'fact',
  costClass: 'high',
  uncertaintyShown: 'The death time',
  copy: { message: 'You died at {at} in this window.', remedy: null },
  injectedMistakes: ['die-in-window'],
  limits: ['Who or what killed the player'],
};

/** What one defensive window says about the pull; `family` marks a check made through the verdict contract. */
export interface DefensiveWindowVerdict {
  family: string;
  status: Tone;
  /** Absent where no rule judged it. */
  rank?: RowRank;
  icon: string;
  message: string;
  n: number;
}

export interface WindowReference {
  /** Top logs with any defensive up at the window. */
  k: number;
  n: number;
  damages: number[];
  medianDamage: number;
  /** No top log took damage there, so damage says nothing about the window. */
  immune: boolean;
}

export interface WindowPull {
  damage: number;
  covered: boolean;
  tank: boolean;
}

const WINDOW_ICON: Record<string, string> = { amber: 'warning_amber', blue: 'shield', neutral: 'compare_arrows' };

/** The Defensives and Defensive windows cards' checks, split so ingest can judge a top log as the player through the same measures. */
@Injectable({ providedIn: 'root' })
export class DefensiveJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);
  private readonly cadence = inject(CadenceJudgeService);
  private readonly cooldownUses = inject(CooldownUseJudgeService);
  private readonly readyTime = inject(ReadyTimeJudgeService);
  private readonly bursts = inject(BurstJudgeService);
  private readonly deaths = inject(DeathTimelineService);

  /** Ascending pull seconds; ingest bakes these into `per_parse[].def_casts_s`. */
  measureUseTimes(uses: readonly DefensiveWindow[]): number[] {
    return uses.map(use => round(use.start_s)).sort((a, b) => a - b);
  }

  /** A use that opened no self aura landed on another raider. */
  isExternal(uses: readonly DefensiveWindow[]): boolean {
    return uses.length > 0 && uses.every(use => use.end_s <= use.start_s);
  }

  /** Each top log's uses, in the order of the bench's sources. */
  referenceUses(perParse: readonly CastsByName[], name: string): number[] {
    return perParse.map(casts => casts[name]?.length ?? 0);
  }

  judgeUses(uses: number, expected: number, reference: readonly number[]): Evidence {
    return this.rules.count({ uses, expected, n: reference.length, users: reference.filter(count => count > 0).length });
  }

  /** Null at or above the expected uses; an external is a context row, since who receives it is an assignment. */
  usesFinding(
    name: string, useTimesS: readonly number[], bench: CadenceBenchmark, model: PullModel,
    perParse: readonly CastsByName[], external: boolean, caps?: FamilyCaps,
  ): AnalysisFinding | null {
    const { uses, expected } = this.cooldownUses.measure(useTimesS, model.aliveSpans, bench);
    if (uses >= expected) return null;
    const reference = this.referenceUses(perParse, name);
    const evidence = this.judgeUses(uses, expected, reference);
    const severity = external ? this.tones.neutral() : this.tones.tone(DEFENSIVE_USES_FAMILY, evidence, caps);
    const n = reference.length;
    const aliveS = spansS(model.aliveSpans);
    const over = aliveS < model.fightDurationS ? `in ${fmtClock(aliveS)} of alive time` : `on a ${fmtClock(model.fightDurationS)} fight`;
    const topLogs = n ? `${n} top logs` : 'Top raiders';
    const onOthers = external ? ', each on another raider' : '';
    return {
      family: DEFENSIVE_USES_FAMILY.id, severity, ...external ? {} : { rank: this.tones.rank(DEFENSIVE_USES_FAMILY, evidence) }, category: 'lost_cooldown', cd_name: name,
      measured: { value: `${uses} / ${expected}`, unit: n ? `use(s), ${n} top logs` : 'use(s)' },
      message: `You pressed ${name} ${uses} ${uses === 1 ? 'time' : 'times'} ${over}${onOthers}. ${topLogs} average ${expected} in that time.`,
      ...this.graded(severity) ? { details: { remedy: `Use ${name} ${expected - uses}x more.` } } : {}, occurrences: [],
    };
  }

  /** One row per defensive, when the rule flags its ready time. */
  readyTimeFinding(
    defensive: { name: string; cooldown: number; charges?: number }, useTimesS: readonly number[], model: PullModel,
    top: { perParse: readonly CastsByName[]; killsS: readonly (number | null)[] }, holds: CdHoldTargets, caps?: FamilyCaps,
  ): AnalysisFinding | null {
    const cooldown = this.readyTime.readyCooldown(defensive, top.perParse, defensive.name);
    const ready = this.readyTime.measure(useTimesS, model.aliveSpans, cooldown, holds);
    if (!ready) return null;
    const reference = this.readyTime.reference(top.perParse, top.killsS, defensive.name, cooldown, holds, model.aliveSpans);
    return this.readyTime.finding(DEFENSIVE_READY_TIME_FAMILY, DEFENSIVE_VOICE, defensive.name, { ready, reference, cooldown, fightDurationS: model.fightDurationS, caps });
  }

  /** A count of top raiders as a fact, never an order, so the rows carry no remedy. */
  holdFindings(name: string, useTimesS: readonly number[], holds: CdHoldTargets, caps?: FamilyCaps): AnalysisFinding[] {
    return Object.values(holds).flatMap(target => {
      const castS = this.cadence.measureHold(useTimesS, target);
      if (castS === null) return [];
      const evidence = this.cadence.judgeHold(target);
      return [{
        family: DEFENSIVE_HOLD_FAMILY.id, severity: this.tones.tone(DEFENSIVE_HOLD_FAMILY, evidence, caps), rank: this.tones.rank(DEFENSIVE_HOLD_FAMILY, evidence),
        category: 'cooldown_hold', timestamp_s: castS, span: { fromS: castS, toS: target.target_s },
        measured: { value: fmtClock(castS), unit: `hold to ${fmtClock(target.target_s)}` },
        message: `${target.count} of ${target.total_samples} top raiders hold ${name} for ${fmtClock(target.target_s)}. You pressed it at ${fmtClock(castS)}, so it was not ready then.`,
        details: { cd_name: name }, occurrences: [],
      }];
    });
  }

  /** Damage taken in the window, its end kept as ingest keeps the hit on an aura's last instant; the baked window statistics read it. */
  measureDamage(damageTaken: readonly TimedEvent[], startS: number, endS: number): number {
    return damageTaken
      .filter(event => event.type === 'damage' && event.atS >= startS && event.atS <= endS)
      .reduce((sum, event) => sum + Math.max(0, (event.amount ?? 0) + (event.absorbed ?? 0)), 0);
  }

  /** Ingest bakes it into `per_parse[].taken_per_s`; the page builds the player's from the same events. */
  takenSeries(damageTaken: readonly TimedEvent[], fightLenS: number): number[] {
    return this.bursts.series(damageTaken, fightLenS);
  }

  /** The whole seconds the window touches, its last instant included. */
  measureTaken(perS: readonly number[], window: Pick<BurstWindow, 'time_s' | 'window_length_s'>): number {
    const fromS = Math.max(0, Math.floor(window.time_s));
    const toS = Math.min(perS.length - 1, Math.floor(window.time_s + window.window_length_s));
    return perS.slice(fromS, toS + 1).reduce((sum, value) => sum + value, 0);
  }

  /** A use that opened no aura covers no one but its target, so only aura spans count; ingest bakes these into `per_parse[].def_up_s`. */
  coverSpans(defensives: readonly { name: string; windows: readonly DefensiveWindow[] }[]): Record<string, AuraSpan[]> {
    return Object.fromEntries(defensives.map(defensive => [
      defensive.name,
      defensive.windows.filter(use => use.end_s > use.start_s).map((use): AuraSpan => [round(use.start_s), round(use.end_s)]),
    ]));
  }

  /** The defensives up at the window, by name; empty is uncovered. */
  measureCover(window: Pick<BurstWindow, 'time_s' | 'window_length_s'>, up: Readonly<Record<string, readonly AuraSpan[]>>): string[] {
    const lo = window.time_s - COVER_SLACK_S;
    const hi = window.time_s + window.window_length_s + COVER_SLACK_S;
    return Object.entries(up).filter(([, spans]) => spans.some(([fromS, toS]) => fromS <= hi && toS >= lo)).map(([name]) => name);
  }

  /** Every top log that carries its auras, reaches the window's end and is alive through it, measured as the player is. */
  reference(window: BurstWindow, perParse: readonly DefensiveParseMeasures[], killsS: readonly (number | null)[]): WindowReference {
    const endS = window.time_s + window.window_length_s;
    const logs = perParse.flatMap((parse, index) => {
      const killS = killsS[index];
      if (!parse.def_up_s || !parse.taken_per_s || killS == null || killS < endS) return [];
      if (this.deaths.deadWithin(parse.dead_s ?? [], window.time_s, endS)) return [];
      return [{ covered: this.measureCover(window, parse.def_up_s).length > 0, damage: this.measureTaken(parse.taken_per_s, window) }];
    });
    const damages = logs.map(log => log.damage);
    return {
      k: logs.filter(log => log.covered).length,
      n: logs.length,
      damages,
      medianDamage: median(damages) ?? 0,
      immune: damages.every(damage => damage <= 0),
    };
  }

  /** Tanks and windows the top logs take no damage in are judged on coverage alone, so they stay a count. */
  judgeWindow(pull: WindowPull, reference: WindowReference): Evidence {
    const damageCounts = !pull.tank && !reference.immune;
    return this.rules.consensus({
      differs: !pull.covered && reference.k > 0, k: reference.k, n: reference.n,
      paired: damageCounts && pull.damage > reference.medianDamage, pairedOnly: true,
    });
  }

  /** `cover` is the player's defensives up at the window. */
  windowVerdict(window: BurstWindow, pull: { damage: number; cover: readonly string[]; tank: boolean }, reference: WindowReference, caps?: FamilyCaps): DefensiveWindowVerdict {
    const evidence = this.judgeWindow({ damage: pull.damage, covered: pull.cover.length > 0, tank: pull.tank }, reference);
    const status = this.tones.tone(DEFENSIVE_WINDOW_FAMILY, evidence, caps);
    const base = { family: DEFENSIVE_WINDOW_FAMILY.id, status, rank: this.tones.rank(DEFENSIVE_WINDOW_FAMILY, evidence), icon: WINDOW_ICON[status] ?? WINDOW_ICON['neutral'] ?? '', n: reference.n };
    const tooFew = this.tooFew(reference);
    if (tooFew) return { ...base, message: tooFew };
    const at = fmtClock(window.time_s);
    const count = `${reference.k} of ${reference.n} top raiders had one up.`;
    if (pull.cover.length) return { ...base, message: `You had ${pull.cover.join(' and ')} up at ${at}. ${count}` };
    const graded = status === 'amber' || status === 'red';
    const damage = graded ? ' You took more damage here than half of the top raiders.' : '';
    return { ...base, message: `No defensive was up at ${at}.${damage} ${count}` };
  }

  /** Each death the player was alive into goes to the first window holding it, so it renders once; window index to death time. */
  deathHomes(windows: readonly BurstWindow[], deadSpans: readonly DeadSpan[]): Map<number, number> {
    const homes = new Map<number, number>();
    for (const [diedS] of deadSpans) {
      const index = windows.findIndex(window => window.time_s < diedS && diedS < window.time_s + window.window_length_s);
      if (index >= 0 && !homes.has(index)) homes.set(index, diedS);
    }
    return homes;
  }

  deathVerdict(diedS: number, caps?: FamilyCaps): DefensiveWindowVerdict {
    const evidence = this.rules.fact({ holds: true, backing: 'game-rule' });
    return {
      family: DEAD_IN_WINDOW_FAMILY.id, status: this.tones.tone(DEAD_IN_WINDOW_FAMILY, evidence, caps), rank: this.tones.rank(DEAD_IN_WINDOW_FAMILY, evidence),
      icon: 'skull', n: evidence.n,
      message: `You died at ${fmtClock(diedS)} in this window.`,
    };
  }

  private tooFew(reference: WindowReference): string | null {
    if (reference.n === 0) return 'No top log carries its defensives for this window, so it is not judged.';
    if (reference.n < VERDICT_CHOICES.minReferenceN) {
      return `Only ${reference.n} top ${reference.n === 1 ? 'log is' : 'logs are'} alive through this window, too few to judge.`;
    }
    return reference.k === 0 ? `None of the ${reference.n} top raiders had a defensive up here.` : null;
  }

  private graded(severity: Tone): boolean {
    return severity === 'red' || severity === 'amber';
  }
}
