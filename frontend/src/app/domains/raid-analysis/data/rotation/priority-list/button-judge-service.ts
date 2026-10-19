import { inject, Injectable } from '@angular/core';
import { DecisionRuleService } from '../../verdict/decision-rule-service';
import { FindingFamily } from '../../verdict/finding-family.models';
import { Evidence } from '../../verdict/tone.models';
import { VERDICT_CHOICES } from '../../verdict/verdict-choices';
import type { RotationParseMeasures } from '../rotation-data-source';
import type { AliveSpan } from '../../analysis/analysis-math';
import { ButtonCounts, EnemyStratum, ListCheckService, LogReading, StratumCounts } from './list-check-service';

export const ROTATION_BUTTON_FAMILY: FindingFamily = {
  id: 'rotation.button',
  label: 'Button choices',
  version: 3,
  tier: 'amber',
  claim: 'You missed more of a button\'s moments than top raiders miss of theirs.',
  construct: 'One verdict per decision before the judged end: a press is right when its line holds and no higher owned button was due, charged to the pressed button; an idle stretch past the reaction allowance with a button due, and an off-GCD button held from one decision to the next while due, count as a miss of that button, once per stretch between its presses. A hardcast is read at its begincast, an aura that changed within the reaction allowance leaves a press unjudged unless a line holds anyway, trinket lines are off-GCD buttons, and the enemy count is the top logs\' encounter timeline, unknown where the player\'s hits fall outside it. The reference miss rate is weighted to the player\'s moments per enemy-count stratum.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on damage', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Every press and skip before the judged end',
  availability: ['A damage spec with a priority list', 'At least one moment the log settled'],
  raidDecisions: { relative: ['Enemy count, read from the top logs\' encounter timeline'], gated: [], excluded: [] },
  rule: 'excess-rate',
  costClass: 'low',
  uncertaintyShown: 'Right moments of all moments, with the top logs\' miss rate and their count',
  copy: { message: 'You got {right} of {moments} moments right. {n} top logs miss about 1 in {odds}.', remedy: null },
  injectedMistakes: ['press-off-list'],
  limits: [
    'Conditions the log does not show',
    'Channels, which read as idle',
    'Potion and pooling lines',
    'A talent button the log shows no talent tree for, which counts only once pressed',
  ],
};

/** The button check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class ButtonJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly checks = inject(ListCheckService);

  /** Null when the log settled none of the button's moments before `endS`; `alive` drops the decisions that passed while dead. */
  measure(reading: LogReading, action: string, endS: number, alive?: readonly AliveSpan[]): ButtonCounts | null {
    return this.checks.rightCounts(this.checks.within(reading, endS, alive), action);
  }

  /** Each top log that had the button's moments, in the order of the bench's sources. */
  reference(perParse: readonly RotationParseMeasures[], action: string): ButtonCounts[] {
    return perParse.flatMap(parse => parse.buttons[action] ?? []);
  }

  judge(counts: ButtonCounts, reference: readonly ButtonCounts[]): Evidence {
    const referenceMoments = reference.reduce((sum, top) => sum + top.moments, 0);
    return this.rules.excessRate({
      misses: counts.moments - counts.right, moments: counts.moments,
      referenceMisses: this.expectedRate(counts, reference) * referenceMoments, referenceMoments,
      n: reference.length,
    });
  }

  /** The top logs' miss rate in each enemy-count stratum, weighted by the player's moments there, so a pull with more add waves is held to the top logs' rate on add waves; a stratum the top logs have no moments in, or a side without strata, takes the pooled rate. */
  expectedRate(counts: ButtonCounts, reference: readonly ButtonCounts[]): number {
    const rate = (picked: readonly (StratumCounts | ButtonCounts | undefined)[]): number | null => {
      const moments = picked.reduce((sum, top) => sum + (top?.moments ?? 0), 0);
      return moments ? picked.reduce((sum, top) => sum + (top ? top.moments - top.right : 0), 0) / moments : null;
    };
    const pooled = rate(reference) ?? 0;
    const strata = Object.entries(counts.strata ?? {}) as [EnemyStratum, StratumCounts][];
    if (!strata.length || reference.some(top => !top.strata)) return pooled;
    const weighted = strata.reduce((sum, [stratum, own]) => sum + own.moments * (rate(reference.map(top => top.strata?.[stratum])) ?? pooled), 0);
    const moments = strata.reduce((sum, [, own]) => sum + own.moments, 0);
    return moments ? weighted / moments : pooled;
  }
}
