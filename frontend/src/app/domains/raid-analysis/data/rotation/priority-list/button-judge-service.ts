import { inject, Injectable } from '@angular/core';
import { DecisionRuleService } from '../../verdict/decision-rule-service';
import { FindingFamily } from '../../verdict/finding-family.models';
import { Evidence } from '../../verdict/tone.models';
import { VERDICT_CHOICES } from '../../verdict/verdict-choices';
import type { RotationParseMeasures } from '../rotation-data-source';
import { ButtonCounts, ListCheckService, LogReading } from './list-check-service';

export const ROTATION_BUTTON_FAMILY: FindingFamily = {
  id: 'rotation.button',
  label: 'Button choices',
  version: 1,
  tier: 'amber',
  claim: 'You missed more of a button\'s moments than top raiders miss of theirs.',
  construct: 'Presses on a held line and skips when due, over the button\'s judged presses plus skips, before the judged end; unjudged presses left out.',
  pendingRebuild: 'Decision points read by the SimulationCraft reaction model',
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on damage', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Every press and skip before the judged end',
  availability: ['A damage spec with a priority list', 'At least one moment the log settled'],
  raidDecisions: { relative: [], gated: [], excluded: ['Enemy count from the raid\'s pulls'] },
  rule: 'excess-rate',
  costClass: 'low',
  uncertaintyShown: 'Right moments of all moments, with the top logs\' miss rate and their count',
  copy: { message: 'You got {right} of {moments} moments right. {n} top logs miss about 1 in {odds}.', remedy: null },
  injectedMistakes: ['press-off-list'],
  limits: ['Conditions the log does not show', 'Idle time with a button due', 'Item, potion and pooling lines'],
};

/** The button check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class ButtonJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly checks = inject(ListCheckService);

  /** Null when the log settled none of the button's moments before `endS`. */
  measure(reading: LogReading, action: string, endS: number): ButtonCounts | null {
    return this.checks.rightCounts(this.checks.within(reading, endS), action);
  }

  /** Each top log that had the button's moments, in the order of the bench's sources. */
  reference(perParse: readonly RotationParseMeasures[], action: string): ButtonCounts[] {
    return perParse.flatMap(parse => parse.buttons[action] ?? []);
  }

  judge(counts: ButtonCounts, reference: readonly ButtonCounts[]): Evidence {
    return this.rules.excessRate({
      misses: counts.moments - counts.right, moments: counts.moments,
      referenceMisses: reference.reduce((sum, top) => sum + top.moments - top.right, 0),
      referenceMoments: reference.reduce((sum, top) => sum + top.moments, 0),
      n: reference.length,
    });
  }
}
