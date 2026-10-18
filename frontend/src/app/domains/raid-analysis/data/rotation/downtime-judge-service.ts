import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { AliveSpan, castDowntimeS, castEfficiencyPct, fmtApart, spansS } from '../analysis/analysis-math';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { RotationParseMeasures } from './rotation-data-source';

export const DOWNTIME_FAMILY: FindingFamily = {
  id: 'rotation.downtime',
  label: 'Casting time',
  version: 1,
  tier: 'amber',
  claim: 'You spent a larger share of your alive time not casting than top raiders spend of theirs.',
  construct: 'Share of alive time not inside a gap between casts longer than the bench\'s 90th percentile gap of top logs.',
  pendingRebuild: 'Idle time beyond the GCD or cast time over alive time',
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Alive time before the judged end',
  availability: ['At least two casts in the pull'],
  raidDecisions: { relative: [], gated: [], excluded: ['Movement and intermissions the boss forces'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average share, with their count',
  copy: { message: 'You were casting {pct} of {over}, idle {excess} more than the average of {n} top logs. Aim for {target} or more.', remedy: 'Fill {excess} of gaps.' },
  injectedMistakes: ['idle-5-gcds'],
  limits: ['Movement and target loss the log does not show', 'Cast times and the GCD inside each gap'],
};

export interface CastingTime {
  idleS: number;
  aliveS: number;
  pct: number;
}

/** The Downtime card's check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class DowntimeJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** Null under two casts or with no alive time; ingest passes a top log's whole pull as its one span. */
  measure(castTimesS: readonly number[], thresholdS: number, spans: readonly AliveSpan[]): CastingTime | null {
    const aliveS = spansS(spans);
    if (castTimesS.length < 2 || aliveS <= 0) return null;
    const idleS = castDowntimeS(castTimesS, thresholdS, spans);
    return { idleS, aliveS, pct: castEfficiencyPct(idleS, aliveS) };
  }

  /** Each top log's share, for the logs with two casts or more. */
  reference(perParse: readonly RotationParseMeasures[]): number[] {
    return perParse.flatMap(parse => parse.efficiency_pct ?? []);
  }

  /** The effect floor is seconds of idle time, read in the player's own alive time. */
  judge(casting: CastingTime, reference: readonly number[]): Evidence {
    const floor = 100 * VERDICT_CHOICES.effectFloors.timingS / casting.aliveS;
    return this.rules.interval({ observed: casting.pct, reference, side: 'below', floor });
  }

  /** Null when the evidence grades nothing; the fix quotes only the idle time past the top logs' average. */
  finding(casting: CastingTime, reference: readonly number[], fightDurationS: number, caps?: FamilyCaps): AnalysisFinding | null {
    const evidence = this.judge(casting, reference);
    const severity = this.tones.tone(DOWNTIME_FAMILY, evidence, caps);
    if (!this.tones.graded(severity) || evidence.target === null) return null;
    const topPct = reference.reduce((sum, value) => sum + value, 0) / reference.length;
    const excessS = (casting.idleS - (100 - topPct) / 100 * casting.aliveS).toFixed(0);
    const over = casting.aliveS < fightDurationS ? 'your alive time' : 'the fight';
    const [pct, target] = fmtApart(casting.pct, evidence.target);
    return {
      family: DOWNTIME_FAMILY.id, severity, category: 'cast_efficiency',
      label: 'Low cast efficiency',
      measured: { value: `${pct}%`, unit: `top ${topPct.toFixed(0)}%, ${evidence.n} top logs` },
      message: `You were casting ${pct}% of ${over}, idle ${excessS}s more than the average of ${evidence.n} top logs. Aim for ${target}% or more.`,
      details: { remedy: `Fill ${excessS}s of gaps.` }, occurrences: [],
    };
  }
}
