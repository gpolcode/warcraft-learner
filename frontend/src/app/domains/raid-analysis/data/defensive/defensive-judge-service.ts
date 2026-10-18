import { inject, Injectable } from '@angular/core';
import { median } from 'd3-array';
import { AnalysisFinding, BurstWindow, DefensiveWindow } from '../analysis/analysis.models';
import { AliveSpan, fmtApart, fmtClock, round, spansS } from '../analysis/analysis-math';
import { DeadSpan } from '../analysis/death-timeline-service';
import { PullModel } from '../analysis/pull-model-service';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { CadenceBenchmark, CdHoldTargets } from '../encounter/encounter.models';
import { CadenceJudgeService, CastsByName } from '../rotation/cadence-judge-service';
import { CooldownUseJudgeService } from '../rotation/cooldown-use-judge-service';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps, Tone } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const DEFENSIVE_LIMITS = ['Which mechanic a defensive was saved for', 'Assignments: soaks, debuff targets, the active tank', 'Externals and healing the player received'];
const CADENCE_REBUILD = 'Unused ready time of the defensive';
const COVERAGE_REBUILD = 'Coverage by any defensive active at the hit, damage as context';
/** A use touching the window this close to either edge still covered it: an aura logs a moment off the hit it was pressed for. */
const COVER_SLACK_S = 3;

export const DEFENSIVE_USES_FAMILY: FindingFamily = {
  id: 'defensive.uses',
  label: 'Defensive uses',
  version: 1,
  tier: 'amber',
  claim: 'You pressed a defensive fewer times over your alive time than top raiders press it over the same time.',
  construct: 'Uses of one plan defensive inside the judged span, against the top logs\' uses per alive minute capped by their cadence fit.',
  pendingRebuild: CADENCE_REBUILD,
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

export const DEFENSIVE_FIRST_USE_FAMILY: FindingFamily = {
  id: 'defensive.first_use',
  label: 'First defensive',
  version: 1,
  tier: 'amber',
  claim: 'You first used a defensive later than top raiders first use it.',
  construct: 'Pull time of the first use of one plan defensive, a use before the pull counting as 0.',
  pendingRebuild: CADENCE_REBUILD,
  reference: TOP_LOG_REFERENCE,
  alignment: 'Pull clock, the stretch from the pull to the first use alive and before the judged end',
  availability: ['Used by at least half of the top logs', 'At least one use in the pull', 'Pressed on the player, not as an external'],
  raidDecisions: { relative: [], gated: [], excluded: ['External assignments'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average first use, with their count',
  copy: { message: 'You first used {cd} at {first}. {n} top logs use it by {target}.', remedy: 'Use {cd} earlier.' },
  injectedMistakes: ['delay-cooldown-30s'],
  limits: DEFENSIVE_LIMITS,
};

export const DEFENSIVE_GAP_FAMILY: FindingFamily = {
  id: 'defensive.gap',
  label: 'Defensive gaps',
  version: 1,
  tier: 'amber',
  claim: 'Your longest wait between uses of a defensive was longer than top raiders\' longest wait.',
  construct: 'Longest stretch between two uses of one plan defensive wholly inside alive time, leaving out a use a hold target explains.',
  pendingRebuild: CADENCE_REBUILD,
  reference: TOP_LOG_REFERENCE,
  alignment: 'Alive time before the judged end',
  availability: ['At least two uses in the pull', 'At least two uses in each top log counted', 'Pressed on the player, not as an external'],
  raidDecisions: { relative: [], gated: ['Holds most top logs make for a later mechanic'], excluded: ['External assignments'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average longest wait, with their count',
  copy: { message: '{cd} sat {gap} before your use at {at}, your longest wait. {n} top logs wait {avg} at most on average.', remedy: 'Use {cd} sooner after it is ready.' },
  injectedMistakes: ['delay-cooldown-30s'],
  limits: DEFENSIVE_LIMITS,
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
  version: 1,
  tier: 'amber',
  claim: 'You had no defensive up in a window most top raiders cover, and took more damage there than half of the top raiders who covered it.',
  construct: 'Whether the window\'s defensive was up within 3 s of the window, with damage taken in the window as the second condition.',
  pendingRebuild: COVERAGE_REBUILD,
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on its metric; covered are those whose use formed the window', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Pull clock; the window wholly inside alive time before the judged end',
  availability: ['The window lies wholly inside alive time before the judged end', 'Damage only for a non-tank on a window the top logs take damage in'],
  raidDecisions: { relative: [], gated: [], excluded: ['Assignments: soaks, debuff targets, the active tank'] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who had it up',
  copy: { message: 'You did not have {cd} up. You took more damage here than half of the {k} top raiders who had it up. {k} of {n} top raiders had it up here.', remedy: null },
  injectedMistakes: ['strip-defensive'],
  limits: [...DEFENSIVE_LIMITS, 'A different defensive the player had up instead'],
};

export const DEAD_IN_WINDOW_FAMILY: FindingFamily = {
  id: 'defensive.dead_in_window',
  label: 'Deaths in windows',
  version: 1,
  tier: 'red',
  claim: 'You died in a window top raiders cover with a defensive.',
  construct: 'The player\'s death inside the window, attributed to the first window that holds it.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
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
  icon: string;
  message: string;
  n: number;
}

interface WindowReference {
  /** Top logs whose own use of the window's defensive formed it. */
  k: number;
  n: number;
  medianDamage: number;
  /** Every covered top log took no damage there, so damage says nothing about the window. */
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
    const severity = external ? this.tones.neutral() : this.tones.tone(DEFENSIVE_USES_FAMILY, this.judgeUses(uses, expected, reference), caps);
    const n = reference.length;
    const aliveS = spansS(model.aliveSpans);
    const over = aliveS < model.fightDurationS ? `in ${fmtClock(aliveS)} of alive time` : `on a ${fmtClock(model.fightDurationS)} fight`;
    const topLogs = n ? `${n} top logs` : 'Top raiders';
    const onOthers = external ? ', each on another raider' : '';
    return {
      family: DEFENSIVE_USES_FAMILY.id, severity, category: 'lost_cooldown', cd_name: name,
      measured: { value: `${uses} / ${expected}`, unit: n ? `use(s), ${n} top logs` : 'use(s)' },
      message: `You pressed ${name} ${uses} ${uses === 1 ? 'time' : 'times'} ${over}${onOthers}. ${topLogs} average ${expected} in that time.`,
      ...this.graded(severity) ? { details: { remedy: `Use ${name} ${expected - uses}x more.` } } : {}, occurrences: [],
    };
  }

  /** Null when the evidence grades nothing. */
  firstUseFinding(name: string, useTimesS: readonly number[], perParse: readonly CastsByName[], caps?: FamilyCaps): AnalysisFinding | null {
    const firstS = this.cadence.measureOpener(useTimesS);
    if (firstS === null) return null;
    const reference = this.cadence.referenceOpeners(perParse, name);
    const evidence = this.cadence.judgeOpener(firstS, reference);
    const severity = this.tones.tone(DEFENSIVE_FIRST_USE_FAMILY, evidence, caps);
    if (!this.tones.graded(severity) || evidence.target === null) return null;
    const avgS = this.average(reference);
    const [at, by] = this.cadence.clocksApart(firstS, evidence.target);
    return {
      family: DEFENSIVE_FIRST_USE_FAMILY.id, severity,
      category: 'cooldown_delay', cd_name: name, timestamp_s: firstS, span: { fromS: 0, toS: firstS },
      measured: { value: `+${(firstS - avgS).toFixed(0)}s`, unit: `top ${fmtClock(avgS)}, ${evidence.n} top logs` },
      message: `You first used ${name} at ${at}. ${evidence.n} top logs use it by ${by}.`,
      details: { remedy: `Use ${name} earlier.` }, occurrences: [],
    };
  }

  /** One row per defensive, on its longest wait; null when the evidence grades nothing. */
  gapFinding(
    name: string, useTimesS: readonly number[], spans: readonly AliveSpan[], perParse: readonly CastsByName[], holds: CdHoldTargets, caps?: FamilyCaps,
  ): AnalysisFinding | null {
    const gap = this.cadence.measureGap(useTimesS, spans, holds);
    if (!gap) return null;
    const reference = this.cadence.referenceGaps(perParse, name, holds);
    const evidence = this.cadence.judgeGap(gap.gapS, reference);
    const severity = this.tones.tone(DEFENSIVE_GAP_FAMILY, evidence, caps);
    if (!this.tones.graded(severity) || evidence.target === null) return null;
    const avgS = this.average(reference);
    const [gapText, targetText] = fmtApart(gap.gapS, evidence.target);
    return {
      family: DEFENSIVE_GAP_FAMILY.id, severity,
      category: 'cooldown_delay', cd_name: name, timestamp_s: gap.toS, span: { fromS: gap.fromS, toS: gap.toS },
      measured: { value: `${gapText}s`, unit: `top ${avgS.toFixed(0)}s, ${evidence.n} top logs` },
      message: `${name} sat ${gapText}s before your use at ${fmtClock(gap.toS)}, your longest wait. `
        + `The longest wait of ${evidence.n} top logs averages ${avgS.toFixed(0)}s. Aim for ${targetText}s or less.`,
      details: { remedy: `Use ${name} sooner after it is ready.` }, occurrences: [],
    };
  }

  /** A count of top raiders as a fact, never an order, so the rows carry no remedy. */
  holdFindings(name: string, useTimesS: readonly number[], holds: CdHoldTargets, caps?: FamilyCaps): AnalysisFinding[] {
    return Object.values(holds).flatMap(target => {
      const castS = this.cadence.measureHold(useTimesS, target);
      if (castS === null) return [];
      return [{
        family: DEFENSIVE_HOLD_FAMILY.id, severity: this.tones.tone(DEFENSIVE_HOLD_FAMILY, this.cadence.judgeHold(target), caps),
        category: 'cooldown_hold', timestamp_s: castS, span: { fromS: castS, toS: target.target_s },
        measured: { value: fmtClock(castS), unit: `hold to ${fmtClock(target.target_s)}` },
        message: `${target.count} of ${target.total_samples} top raiders hold ${name} for ${fmtClock(target.target_s)}. You pressed it at ${fmtClock(castS)}, so it was not ready then.`,
        details: { cd_name: name }, occurrences: [],
      }];
    });
  }

  /** Damage taken in the window, its end kept as ingest keeps the hit on an aura's last instant. */
  measureDamage(damageTaken: readonly TimedEvent[], startS: number, endS: number): number {
    return damageTaken
      .filter(event => event.type === 'damage' && event.atS >= startS && event.atS <= endS)
      .reduce((sum, event) => sum + Math.max(0, (event.amount ?? 0) + (event.absorbed ?? 0)), 0);
  }

  /** `uses` are the player's uses of the window's own defensive. */
  measureCovered(window: BurstWindow, uses: readonly DefensiveWindow[]): boolean {
    const lo = window.time_s - COVER_SLACK_S;
    const hi = window.time_s + window.window_length_s + COVER_SLACK_S;
    return uses.some(use => use.start_s <= hi && use.end_s >= lo);
  }

  /** `n` is the bench's accepted top logs; the members are the ones covered. */
  reference(window: BurstWindow, n: number): WindowReference {
    const stored: Partial<BurstWindow> = window;
    const members = stored.members ?? [];
    const damages = members.map(member => member.damage);
    return {
      k: new Set(members.map(member => member.parse)).size,
      n,
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

  windowVerdict(window: BurstWindow, pull: WindowPull, n: number, caps?: FamilyCaps): DefensiveWindowVerdict {
    const reference = this.reference(window, n);
    const evidence = this.judgeWindow(pull, reference);
    const status = this.tones.tone(DEFENSIVE_WINDOW_FAMILY, evidence, caps);
    const name = window.defensive_name ?? 'the defensive';
    const base = { family: DEFENSIVE_WINDOW_FAMILY.id, status, icon: WINDOW_ICON[status] ?? WINDOW_ICON['neutral'] ?? '', n: reference.n };
    const tooFew = this.tooFew(reference);
    if (tooFew) return { ...base, message: tooFew };
    const count = `${reference.k} of ${reference.n} top raiders had it up here.`;
    if (pull.covered) return { ...base, message: `You had ${name} up. ${count}` };
    const graded = status === 'amber' || status === 'red';
    const damage = graded ? ` You took more damage here than half of the ${reference.k} top raiders who had it up.` : '';
    return { ...base, message: `You did not have ${name} up.${damage} ${count}` };
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
      family: DEAD_IN_WINDOW_FAMILY.id, status: this.tones.tone(DEAD_IN_WINDOW_FAMILY, evidence, caps), icon: 'skull', n: evidence.n,
      message: `You died at ${fmtClock(diedS)} in this window.`,
    };
  }

  private tooFew(reference: WindowReference): string | null {
    if (reference.k === 0) return 'No top log carries its own use for this window, so it is not judged.';
    if (reference.n >= VERDICT_CHOICES.minReferenceN) return null;
    return `Only ${reference.n} top ${reference.n === 1 ? 'log backs' : 'logs back'} this window, too few to judge.`;
  }

  private graded(severity: Tone): boolean {
    return severity === 'red' || severity === 'amber';
  }

  private average(values: readonly number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
}
