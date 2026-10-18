import { inject, Injectable } from '@angular/core';
import { median } from 'd3-array';
import { AnalysisFinding } from '../analysis/analysis.models';
import { AliveSpan, fmtApart, fmtClock, overlapS, spansS } from '../analysis/analysis-math';
import { CdHoldTargets } from '../encounter/encounter.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { CastsByName } from './cadence-judge-service';

/** Absorbs float error when a stretch's alive overlap is compared with its length. */
const SPAN_TOLERANCE_S = 1e-9;
const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss that used the cooldown, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };

export const READY_TIME_FAMILY: FindingFamily = {
  id: 'rotation.ready_time',
  label: 'Unused ready time',
  version: 1,
  tier: 'red',
  claim: 'A major cooldown sat ready and unpressed for at least one cooldown\'s worth of your alive time, longer than top raiders leave it over the same time.',
  construct: 'Share of alive time before the judged end in which every charge of one plan cooldown was ready and unpressed, on the stored cooldown or the faster one the top logs show, leaving out a wait a hold target explains or one that crosses a death.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'The player\'s alive spans before the judged end, each top log read over the same spans cut at its kill',
  availability: ['Used by at least half of the top logs', 'At least one use in the pull'],
  raidDecisions: { relative: [], gated: ['Holds most top logs make for a later window'], excluded: ['Bloodlust timing'] },
  rule: 'mechanistic',
  costClass: 'high',
  uncertaintyShown: 'Your ready time and the top logs\' average over the same time, with their count',
  copy: {
    message: '{cd} sat ready and unpressed for {ready} of the {alive} you were alive, the longest from {from} to {to}. {n} top logs leave it ready {avg} on average in that time.',
    remedy: 'Press {cd} as soon as it is ready.',
  },
  injectedMistakes: ['drop-major-cooldown-cast', 'delay-cooldown-30s'],
  limits: ['Why a cooldown was held', 'Cooldown resets and charges the log does not show', 'A wait that crosses a death'],
};

/** The cooldown as the measure runs it: one charge comes back every `rechargeS`. */
export interface ReadyCooldown {
  rechargeS: number;
  charges: number;
}

export interface ReadyTime {
  readyS: number;
  aliveS: number;
  share: number;
  /** The longest alive stretch the cooldown sat ready, for the sentence. */
  longest: { fromS: number; toS: number } | null;
}

/** Wording that differs between an offensive cooldown and a defensive. */
export interface ReadyVoice {
  remedy: (name: string) => string;
}

interface Stretch {
  fromS: number;
  toS: number;
  /** The use that ended it; null for the stretch running to the end. */
  pressS: number | null;
}

/** Unused ready time of one cooldown, measured the same way on the player and on every top log. */
@Injectable({ providedIn: 'root' })
export class ReadyTimeJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** The stored cooldown, or the fastest recharge the median top log's own uses prove, since talents and resets shorten many. */
  readyCooldown(button: { cooldown: number; charges?: number }, perParse: readonly CastsByName[], name: string): ReadyCooldown {
    const charges = Math.max(1, button.charges ?? 1);
    const proven = perParse.map(casts => this.fastestRecharge(casts[name] ?? [], charges)).filter(Number.isFinite);
    return { rechargeS: Math.min(button.cooldown, median(proven) ?? button.cooldown), charges };
  }

  /** Null when the spans hold no alive time. A use the model holds no charge for restarts the recharge, as a reset would; a wait that crosses a death is left out, since the press it would have had fell while dead. */
  measure(castTimesS: readonly number[], spans: readonly AliveSpan[], cooldown: ReadyCooldown, holds: CdHoldTargets): ReadyTime | null {
    const aliveS = spansS(spans);
    const endS = spans.at(-1)?.[1] ?? 0;
    if (aliveS <= 0) return null;
    const counted = this.fullStretches(castTimesS, endS, cooldown)
      .filter(stretch => stretch.pressS === null || !this.heldFor(stretch.pressS, holds))
      .map(stretch => ({ ...stretch, aliveS: overlapS(spans, stretch.fromS, stretch.toS) }))
      .filter(stretch => stretch.aliveS + SPAN_TOLERANCE_S >= stretch.toS - stretch.fromS);
    const readyS = counted.reduce((sum, stretch) => sum + stretch.aliveS, 0);
    const longest = counted.reduce<(typeof counted)[number] | null>((best, stretch) => stretch.aliveS > (best?.aliveS ?? 0) ? stretch : best, null);
    return { readyS, aliveS, share: readyS / aliveS, longest: longest ? { fromS: longest.fromS, toS: longest.toS } : null };
  }

  /** Each top log that used it, read over the player's spans cut at its own kill, in the order of the bench's sources. */
  reference(
    perParse: readonly CastsByName[], killsS: readonly (number | null)[], name: string,
    cooldown: ReadyCooldown, holds: CdHoldTargets, spans: readonly AliveSpan[],
  ): number[] {
    return perParse.flatMap((casts, index) => {
      const uses = casts[name] ?? [];
      if (!uses.length) return [];
      const killS = killsS[index] ?? Number.POSITIVE_INFINITY;
      const clipped = spans.flatMap(([fromS, toS]): AliveSpan[] => fromS < killS ? [[fromS, Math.min(toS, killS)]] : []);
      const ready = this.measure(uses, clipped, cooldown, holds);
      return ready ? [ready.share] : [];
    });
  }

  /** The game amount is one recharge of ready time; the floor is the timing floor, both as a share of alive time. */
  judge(ready: ReadyTime, reference: readonly number[], cooldown: ReadyCooldown): Evidence {
    return this.rules.mechanistic({
      observed: ready.share, reference,
      floor: VERDICT_CHOICES.effectFloors.timingS / ready.aliveS,
      gameAmount: cooldown.rechargeS / ready.aliveS,
    });
  }

  /** Null unless the rule flags the ready time; the row reads as a comparison until calibration grades it. */
  finding(
    family: FindingFamily, voice: ReadyVoice, name: string,
    input: { ready: ReadyTime; reference: readonly number[]; cooldown: ReadyCooldown; fightDurationS: number; caps?: FamilyCaps },
  ): AnalysisFinding | null {
    const { ready, reference, cooldown } = input;
    const evidence = this.judge(ready, reference, cooldown);
    if (evidence.level !== 'red' && evidence.level !== 'amber') return null;
    const severity = this.tones.tone(family, evidence, input.caps);
    const graded = this.tones.graded(severity) && evidence.target !== null;
    const avgS = reference.reduce((sum, share) => sum + share, 0) / reference.length * ready.aliveS;
    const over = ready.aliveS < input.fightDurationS ? `of the ${fmtClock(ready.aliveS)} you were alive` : `of the ${fmtClock(input.fightDurationS)} fight`;
    const longest = ready.longest ? `, the longest from ${fmtClock(ready.longest.fromS)} to ${fmtClock(ready.longest.toS)}` : '';
    const [readyText, targetText] = this.clocksApart(ready.readyS, (evidence.target ?? 0) * ready.aliveS);
    return {
      family: family.id, severity, category: 'lost_cooldown', cd_name: name,
      ...ready.longest ? { timestamp_s: ready.longest.fromS } : {},
      measured: { value: readyText, unit: `ready, top ${fmtClock(avgS)}, ${evidence.n} top logs` },
      message: `${name} sat ready and unpressed for ${readyText} ${over}${longest}. `
        + `${evidence.n} top logs leave it ready ${fmtClock(avgS)} on average in that time.${graded ? ` Aim for ${targetText} or less.` : ''}`,
      ...graded ? { details: { remedy: voice.remedy(name) } } : {}, occurrences: [],
    };
  }

  /** Each run of `k` uses inside `t` seconds proves a recharge of at most `t / (k - charges)`; Infinity when no run does. */
  private fastestRecharge(castTimesS: readonly number[], charges: number): number {
    let fastest = Number.POSITIVE_INFINITY;
    for (let from = 0; from < castTimesS.length; from++) {
      for (let to = from + charges; to < castTimesS.length; to++) {
        fastest = Math.min(fastest, ((castTimesS[to] ?? 0) - (castTimesS[from] ?? 0)) / (to - from + 1 - charges));
      }
    }
    return fastest;
  }

  /** The stretches in which every charge was ready, from the pull (all charges ready) to `endS`. */
  private fullStretches(castTimesS: readonly number[], endS: number, cooldown: ReadyCooldown): Stretch[] {
    const { rechargeS, charges: maxCharges } = cooldown;
    const stretches: Stretch[] = [];
    let charges = maxCharges;
    let fullFromS = 0;
    let nextS = Number.POSITIVE_INFINITY;
    const landUntil = (atS: number): void => {
      while (nextS <= atS) {
        charges++;
        if (charges >= maxCharges) { fullFromS = nextS; nextS = Number.POSITIVE_INFINITY; } else nextS += rechargeS;
      }
    };
    for (const castS of [...castTimesS].filter(timeS => timeS <= endS).sort((a, b) => a - b)) {
      landUntil(castS);
      if (charges >= maxCharges) stretches.push({ fromS: fullFromS, toS: castS, pressS: castS });
      if (charges === 0 || charges >= maxCharges) nextS = castS + rechargeS;
      charges = Math.max(0, charges - 1);
    }
    landUntil(endS);
    if (charges >= maxCharges && fullFromS < endS) stretches.push({ fromS: fullFromS, toS: endS, pressS: null });
    return stretches;
  }

  private heldFor(castS: number, holds: CdHoldTargets): boolean {
    return Object.values(holds).some(target => Math.abs(castS - target.target_s) <= target.band_s);
  }

  /** Two durations a second apart share a clock string, so they fall back to seconds. */
  private clocksApart(valueS: number, edgeS: number): [string, string] {
    if (fmtClock(valueS) !== fmtClock(edgeS)) return [fmtClock(valueS), fmtClock(edgeS)];
    const [value, edge] = fmtApart(valueS, edgeS);
    return [`${value}s`, `${edge}s`];
  }
}
