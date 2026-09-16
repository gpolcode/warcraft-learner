import { Rulebook, RulebookCooldown, RulebookDefensive, RulebookRule } from '../../app/domains/raid-analysis/data/rulebook/rulebook.models';

type CooldownSeed = Pick<RulebookCooldown, 'name' | 'spell_id' | 'cooldown'> & Partial<RulebookCooldown>;
type DefensiveSeed = Pick<RulebookDefensive, 'name' | 'spell_id' | 'cooldown'> & Partial<RulebookDefensive>;

export function rulebook(partial: {
  spec?: string;
  cooldowns?: CooldownSeed[];
  defensives?: DefensiveSeed[];
  rules?: RulebookRule[];
} = {}): Rulebook {
  return {
    spec: partial.spec ?? 'TestSpec',
    major_cooldowns: partial.cooldowns ?? [],
    defensives: (partial.defensives ?? []).map((d) => ({ duration: 5, ...d })),
    rules: partial.rules ?? [],
  };
}
