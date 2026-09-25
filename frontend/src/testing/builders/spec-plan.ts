import { PlanCooldown, PlanDefensive, PlanSpell } from '../../app/domains/raid-analysis/data/plan/plan.models';
import type { SpecPlan } from '../../app/domains/raid-analysis/data/simc/spec-plan-service';
import type { SpecPlanLoaderService } from '../../app/domains/raid-analysis/data/simc/spec-plan-loader-service';
import { Result, Results } from '../../app/domains/shared/util-http/result';

type CooldownSeed = Pick<PlanCooldown, 'name' | 'spell_id' | 'cooldown'> & Partial<PlanCooldown>;
type DefensiveSeed = Pick<PlanDefensive, 'name' | 'spell_id' | 'cooldown'> & Partial<PlanDefensive>;

export const PLAN_KEY = 'plan-key';

export function specPlan(partial: {
  cooldowns?: CooldownSeed[];
  defensives?: DefensiveSeed[];
  spells?: Record<string, PlanSpell>;
} & Partial<Pick<SpecPlan, 'lines' | 'talents'>> = {}): SpecPlan {
  return {
    lines: partial.lines ?? [],
    talents: partial.talents ?? {},
    cooldowns: partial.cooldowns ?? [],
    defensives: partial.defensives ?? [],
    spells: partial.spells ?? {},
    key: PLAN_KEY,
  };
}

export function planSpell(name: string, ids: number[], over: Partial<PlanSpell> = {}): PlanSpell {
  return { name, ids, cooldown: 0, charges: 1, duration: 0, gcd: 1.5, cast_time: 0, max_stacks: 0, costs: [], ...over };
}

export function planLoader(plan: SpecPlan | Result<SpecPlan>): SpecPlanLoaderService {
  const result = 'ok' in plan ? plan : Results.ok(plan);
  return { planFor: async () => result } as unknown as SpecPlanLoaderService;
}
