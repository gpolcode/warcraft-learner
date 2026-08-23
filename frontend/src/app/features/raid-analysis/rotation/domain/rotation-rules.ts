// Separate from rotation.service.ts so the ingest transform measures top parses with the same code the runtime judges the player with.
import { Injectable } from '@angular/core';
import { buildRuleContext } from './rotation-rules/rule-context';
import {
  rulesNeed, judgeableRules, sampleRule, ruleBand, benchedRules, evaluateRules, rulesFollowed,
} from './rotation-rules/engine';

export type { RuleBand, BenchedRule, RuleSample } from './rotation-rules/engine-core';

export { MIN_MEASURED_PARSES, RULE_TYPE_LABEL, ruleBand } from './rotation-rules/engine';

@Injectable({ providedIn: 'root' })
export class RotationRuleEngineService {
  readonly buildRuleContext = buildRuleContext;
  readonly rulesNeed = rulesNeed;
  readonly judgeableRules = judgeableRules;
  readonly sampleRule = sampleRule;
  readonly ruleBand = ruleBand;
  readonly benchedRules = benchedRules;
  readonly evaluateRules = evaluateRules;
  readonly rulesFollowed = rulesFollowed;
}
