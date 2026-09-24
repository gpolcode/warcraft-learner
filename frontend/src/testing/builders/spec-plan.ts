import { RulebookCooldown, RulebookDefensive, RuleCondition } from '../../app/domains/raid-analysis/data/rulebook/rulebook.models';
import type { PlanSpell, SpecPlan } from '../../app/domains/raid-analysis/data/simc/spec-plan-service';
import type { SpecPlanLoaderService } from '../../app/domains/raid-analysis/data/simc/spec-plan-loader-service';
import { Result, Results } from '../../app/domains/shared/util-http/result';

type CooldownSeed = Pick<RulebookCooldown, 'name' | 'spell_id' | 'cooldown'> & Partial<RulebookCooldown>;
type DefensiveSeed = Pick<RulebookDefensive, 'name' | 'spell_id' | 'cooldown'> & Partial<RulebookDefensive>;

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
    defensives: (partial.defensives ?? []).map((d) => ({ duration: 5, ...d })),
    spells: partial.spells ?? {},
    key: PLAN_KEY,
    hasProfile: true,
    unreadableLines: 0,
  };
}

export function planLoader(plan: SpecPlan | Result<SpecPlan>): SpecPlanLoaderService {
  const result = 'ok' in plan ? plan : Results.ok(plan);
  return { planFor: async () => result } as unknown as SpecPlanLoaderService;
}
