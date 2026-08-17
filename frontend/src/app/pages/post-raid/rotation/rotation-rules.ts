// Separate from rotation.service.ts so the ingest transform measures top parses with the same code the runtime judges the player with.
export type {
  Severity, RuleBand, BenchedRule, RuleJudging, RuleStream, RuleSample,
} from './rotation-rules/engine-core';
export type { CastTimes, RuleContext, RuleInputs } from './rotation-rules/rule-context';

export { buildCastTimes, buildRuleContext } from './rotation-rules/rule-context';
export {
  MIN_MEASURED_PARSES, RULE_TYPE_LABEL,
  rulesNeed, judgeableRules, ruleJudging, sampleRule, ruleBand, benchedRules,
  evaluateCondition, ruleApplicable, evaluateRules, ruleLabel, rulesFollowed,
} from './rotation-rules/engine';

export { evaluateCastWithoutPrior } from './rotation-rules/kinds/cast-without-prior';
export { evaluateHoldForAnchor } from './rotation-rules/kinds/hold-cooldown-for-anchor';
export { evaluateCastOutsideBuff } from './rotation-rules/kinds/cast-outside-buff';
export { evaluateAuraUptimeBelow } from './rotation-rules/kinds/aura-uptime-below';
export { evaluateOpeningSequence } from './rotation-rules/kinds/opening-sequence';
export { evaluateCastAtTargetCount } from './rotation-rules/kinds/cast-at-target-count';
export { evaluateResourceAtCast } from './rotation-rules/kinds/resource-at-cast';
export { evaluateProcWasted } from './rotation-rules/kinds/proc-wasted';
export { evaluateFillerInBuff } from './rotation-rules/kinds/filler-in-buff';
export { evaluateSpendAtStacks } from './rotation-rules/kinds/spend-at-stacks';
export { evaluateAuraClipped } from './rotation-rules/kinds/aura-clipped';
export { evaluateFillerBelowHealth } from './rotation-rules/kinds/filler-below-health';
