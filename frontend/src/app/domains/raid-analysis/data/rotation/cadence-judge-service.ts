import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { fmtClock } from '../analysis/analysis-math';
import { CdHoldTargets } from '../encounter/encounter.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const COOLDOWN_LIMITS = ['Why a cooldown was held', 'Cooldown resets and charges the log does not show'];

export const COOLDOWN_HOLD_FAMILY: FindingFamily = {
  id: 'rotation.hold',
  label: 'Cooldown holds',
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

/** One top log's uses of every plan button it is judged on, by name, as a bench's `per_parse` bakes them. */
export type CastsByName = Readonly<Record<string, readonly number[]>>;

/** The hold check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class CadenceJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** The early use that left the cooldown running at the target, or null when a use lands inside the band or none blocks it. */
  measureHold(castTimesS: readonly number[], target: CdHoldTargets[string]): number | null {
    if (castTimesS.some(castS => Math.abs(castS - target.target_s) <= target.band_s)) return null;
    return castTimesS.filter(castS => castS < target.target_s - target.band_s && castS + target.effective_cd_s > target.target_s).at(-1) ?? null;
  }

  judgeHold(target: CdHoldTargets[string]): Evidence {
    return this.rules.consensus({ differs: true, k: target.count, n: target.total_samples, paired: false });
  }

  /** A count of top raiders as a fact, never an order, so the rows carry no remedy. */
  holdFindings(name: string, castTimesS: readonly number[], holds: CdHoldTargets, caps?: FamilyCaps): AnalysisFinding[] {
    return Object.values(holds).flatMap(target => {
      const castS = this.measureHold(castTimesS, target);
      if (castS === null) return [];
      const evidence = this.judgeHold(target);
      return [{
        family: COOLDOWN_HOLD_FAMILY.id, severity: this.tones.tone(COOLDOWN_HOLD_FAMILY, evidence, caps), rank: this.tones.rank(COOLDOWN_HOLD_FAMILY, evidence),
        category: 'cooldown_hold', timestamp_s: castS, span: { fromS: castS, toS: target.target_s },
        measured: { value: fmtClock(castS), unit: `hold to ${fmtClock(target.target_s)}` },
        message: `${target.count} of ${target.total_samples} top raiders hold ${name} for ${fmtClock(target.target_s)}. You pressed it at ${fmtClock(castS)}, so it was not ready then.`,
        details: { cd_name: name }, occurrences: [],
      }];
    });
  }
}
