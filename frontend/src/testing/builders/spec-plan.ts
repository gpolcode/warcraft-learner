import { PlanCooldown, PlanDefensive, RuleCondition } from '../../app/domains/raid-analysis/data/plan/plan.models';
import type { PlanSpell, SpecPlan } from '../../app/domains/raid-analysis/data/simc/spec-plan-service';
import type { SpecPlanLoaderService } from '../../app/domains/raid-analysis/data/simc/spec-plan-loader-service';
import { Result, Results } from '../../app/domains/shared/util-http/result';

type CooldownSeed = Pick<PlanCooldown, 'name' | 'spell_id' | 'cooldown'> & Partial<PlanCooldown>;
type DefensiveSeed = Pick<PlanDefensive, 'name' | 'spell_id' | 'cooldown'> & Partial<PlanDefensive>;

export const PLAN_KEY = 'plan-key';

export function specPlan(partial: {
  cooldowns?: CooldownSeed[];
  defensives?: DefensiveSeed[];
  rules?: RuleCondition[];
  spells?: Record<string, PlanSpell>;
} = {}): SpecPlan {
  return {
    rules: partial.rules ?? [],
    cooldowns: partial.cooldowns ?? [],
    defensives: partial.defensives ?? [],
    spells: partial.spells ?? {},
    key: PLAN_KEY,
  };
}

export function planLoader(plan: SpecPlan | Result<SpecPlan>): SpecPlanLoaderService {
  const result = 'ok' in plan ? plan : Results.ok(plan);
  return { planFor: async () => result } as unknown as SpecPlanLoaderService;
}
