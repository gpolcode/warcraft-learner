import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { AliveSpan, fmtApart, fmtClock, overlapS } from '../analysis/analysis-math';
import { CdHoldTargets } from '../encounter/encounter.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { RotationParseMeasures } from './rotation-data-source';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const COOLDOWN_LIMITS = ['Why a cooldown was held', 'Cooldown resets and charges the log does not show'];
/** A top log is alive for its whole pull, and its casts never pass its own end. */
const WHOLE_PULL: readonly AliveSpan[] = [[0, Number.POSITIVE_INFINITY]];
/** Absorbs float error when a gap's alive overlap is compared with its length. */
const SPAN_TOLERANCE_S = 1e-9;

export const LATE_OPENER_FAMILY: FindingFamily = {
  id: 'rotation.late_opener',
  version: 1,
  tier: 'amber',
  claim: 'You opened with a major cooldown later than top raiders open with it.',
  construct: 'Pull time of the first use of one plan cooldown, a use before the pull counting as 0.',
  pendingRebuild: 'Unused ready time of the cooldown',
  reference: TOP_LOG_REFERENCE,
  alignment: 'Pull clock, the stretch from the pull to the first use alive and before the judged end',
  availability: ['Used by at least half of the top logs', 'At least one use in the pull'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average first use, with their count',
  copy: { message: 'You opened with {cd} at {first}. {n} top logs open with it by {target}.', remedy: 'Open with {cd} earlier.' },
  injectedMistakes: ['delay-cooldown-30s'],
  limits: COOLDOWN_LIMITS,
};

export const COOLDOWN_GAP_FAMILY: FindingFamily = {
  id: 'rotation.cooldown_gap',
  version: 1,
  tier: 'amber',
  claim: 'Your longest wait between uses of a major cooldown was longer than top raiders\' longest wait.',
  construct: 'Longest stretch between two uses of one plan cooldown wholly inside alive time, leaving out a use a hold target explains.',
  pendingRebuild: 'Unused ready time of the cooldown',
  reference: TOP_LOG_REFERENCE,
  alignment: 'Alive time before the judged end',
  availability: ['At least two uses in the pull', 'At least two uses in each top log counted'],
  raidDecisions: { relative: [], gated: ['Holds most top logs make for a later window'], excluded: ['Bloodlust timing'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average longest wait, with their count',
  copy: { message: '{cd} sat {gap} before your cast at {at}, your longest wait. {n} top logs wait {avg} at most on average.', remedy: 'Press {cd} sooner off cooldown.' },
  injectedMistakes: ['delay-cooldown-30s'],
  limits: COOLDOWN_LIMITS,
};

export const COOLDOWN_HOLD_FAMILY: FindingFamily = {
  id: 'rotation.hold',
  version: 1,
  tier: 'blue',
  claim: 'k of n top raiders hold a major cooldown for a moment on the pull clock; you pressed it earlier, so it was not ready then.',
  construct: 'A use before the hold target\'s band whose cooldown still runs at the target, with no use inside the band.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'Pull clock, the stretch from the early use to the target alive and before the judged end',
  availability: ['A hold most top logs make for the same moment'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing'] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who hold it',
  copy: { message: '{k} of {n} top raiders hold {cd} for {target}. You pressed it at {at}, so it was not ready then.', remedy: null },
  injectedMistakes: [],
  limits: COOLDOWN_LIMITS,
};

interface Gap {
  gapS: number;
  fromS: number;
  toS: number;
}

/** The opener, gap and hold checks, split so ingest can judge a top log as the player through the same measures. */
@Injectable({ providedIn: 'root' })
export class CadenceJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  measureOpener(castTimesS: readonly number[]): number | null {
    return castTimesS[0] ?? null;
  }

  /** Each top log's first use, for the logs that used it, in the order of the bench's sources. */
  referenceOpeners(perParse: readonly RotationParseMeasures[], name: string): number[] {
    return perParse.flatMap(parse => {
      const firstS = this.measureOpener(parse.cd_casts_s[name] ?? []);
      return firstS === null ? [] : [firstS];
    });
  }

  judgeOpener(firstS: number, reference: readonly number[]): Evidence {
    return this.rules.interval({ observed: firstS, reference, side: 'above', floor: VERDICT_CHOICES.effectFloors.openerS });
  }

  /** Null when the evidence grades nothing. */
  openerFinding(name: string, castTimesS: readonly number[], perParse: readonly RotationParseMeasures[]): AnalysisFinding | null {
    const firstS = this.measureOpener(castTimesS);
    if (firstS === null) return null;
    const reference = this.referenceOpeners(perParse, name);
    const evidence = this.judgeOpener(firstS, reference);
    if (evidence.level === 'neutral' || evidence.target === null) return null;
    const avgS = reference.reduce((sum, value) => sum + value, 0) / reference.length;
    const [at, by] = this.clocksApart(firstS, evidence.target);
    return {
      family: LATE_OPENER_FAMILY.id, severity: this.tones.tone(LATE_OPENER_FAMILY, evidence),
      category: 'cooldown_delay', cd_name: name, timestamp_s: firstS, span: { fromS: 0, toS: firstS },
      measured: { value: `+${(firstS - avgS).toFixed(0)}s`, unit: `top ${fmtClock(avgS)}, ${evidence.n} top logs` },
      message: `You opened with ${name} at ${at}. ${evidence.n} top logs open with it by ${by}.`,
      details: { remedy: `Open with ${name} earlier.` }, occurrences: [],
    };
  }

  /** Null under two uses; a gap that crosses time the player was not alive, or ends on a use a hold target explains, is left out. */
  measureGap(castTimesS: readonly number[], spans: readonly AliveSpan[], holds: CdHoldTargets): Gap | null {
    let longest: Gap | null = null;
    for (let i = 1; i < castTimesS.length; i++) {
      const fromS = castTimesS[i - 1];
      const toS = castTimesS[i];
      if (fromS === undefined || toS === undefined) continue;
      const gapS = toS - fromS;
      if (overlapS(spans, fromS, toS) + SPAN_TOLERANCE_S < gapS || this.heldFor(toS, holds)) continue;
      if (!longest || gapS > longest.gapS) longest = { gapS, fromS, toS };
    }
    return longest;
  }

  /** Each top log's longest wait, for the logs with two uses or more, in the order of the bench's sources. */
  referenceGaps(perParse: readonly RotationParseMeasures[], name: string, holds: CdHoldTargets): number[] {
    return perParse.flatMap(parse => {
      const gap = this.measureGap(parse.cd_casts_s[name] ?? [], WHOLE_PULL, holds);
      return gap ? [gap.gapS] : [];
    });
  }

  judgeGap(gapS: number, reference: readonly number[]): Evidence {
    return this.rules.interval({ observed: gapS, reference, side: 'above', floor: VERDICT_CHOICES.effectFloors.timingS });
  }

  /** One row per cooldown, on its longest wait; null when the evidence grades nothing. */
  gapFinding(
    name: string, castTimesS: readonly number[], spans: readonly AliveSpan[],
    perParse: readonly RotationParseMeasures[], holds: CdHoldTargets,
  ): AnalysisFinding | null {
    const gap = this.measureGap(castTimesS, spans, holds);
    if (!gap) return null;
    const reference = this.referenceGaps(perParse, name, holds);
    const evidence = this.judgeGap(gap.gapS, reference);
    if (evidence.level === 'neutral' || evidence.target === null) return null;
    const avgS = reference.reduce((sum, value) => sum + value, 0) / reference.length;
    const [gapText, targetText] = fmtApart(gap.gapS, evidence.target);
    return {
      family: COOLDOWN_GAP_FAMILY.id, severity: this.tones.tone(COOLDOWN_GAP_FAMILY, evidence),
      category: 'cooldown_delay', cd_name: name, timestamp_s: gap.toS, span: { fromS: gap.fromS, toS: gap.toS },
      measured: { value: `${gapText}s`, unit: `top ${avgS.toFixed(0)}s, ${evidence.n} top logs` },
      message: `${name} sat ${gapText}s before your cast at ${fmtClock(gap.toS)}, your longest wait. `
        + `The longest wait of ${evidence.n} top logs averages ${avgS.toFixed(0)}s. Aim for ${targetText}s or less.`,
      details: { remedy: `Press ${name} sooner off cooldown.` }, occurrences: [],
    };
  }

  /** The early use that left the cooldown running at the target, or null when a use lands inside the band or none blocks it. */
  measureHold(castTimesS: readonly number[], target: CdHoldTargets[string]): number | null {
    if (castTimesS.some(castS => Math.abs(castS - target.target_s) <= target.band_s)) return null;
    return castTimesS.filter(castS => castS < target.target_s - target.band_s && castS + target.effective_cd_s > target.target_s).at(-1) ?? null;
  }

  judgeHold(target: CdHoldTargets[string]): Evidence {
    return this.rules.consensus({ differs: true, k: target.count, n: target.total_samples, paired: false });
  }

  /** A count of top raiders as a fact, never an order, so the rows carry no remedy. */
  holdFindings(name: string, castTimesS: readonly number[], holds: CdHoldTargets): AnalysisFinding[] {
    return Object.values(holds).flatMap(target => {
      const castS = this.measureHold(castTimesS, target);
      if (castS === null) return [];
      return [{
        family: COOLDOWN_HOLD_FAMILY.id, severity: this.tones.tone(COOLDOWN_HOLD_FAMILY, this.judgeHold(target)),
        category: 'cooldown_hold', timestamp_s: castS, span: { fromS: castS, toS: target.target_s },
        measured: { value: fmtClock(castS), unit: `hold to ${fmtClock(target.target_s)}` },
        message: `${target.count} of ${target.total_samples} top raiders hold ${name} for ${fmtClock(target.target_s)}. You pressed it at ${fmtClock(castS)}, so it was not ready then.`,
        details: { cd_name: name }, occurrences: [],
      }];
    });
  }

  /** Two moments a second apart share a clock string, so they fall back to seconds. */
  private clocksApart(valueS: number, edgeS: number): [string, string] {
    if (fmtClock(valueS) !== fmtClock(edgeS)) return [fmtClock(valueS), fmtClock(edgeS)];
    const [value, edge] = fmtApart(valueS, edgeS);
    return [`${value}s`, `${edge}s`];
  }

  private heldFor(castS: number, holds: CdHoldTargets): boolean {
    return Object.values(holds).some(target => Math.abs(castS - target.target_s) <= target.band_s);
  }
}
