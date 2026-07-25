/**
 * Rulebook rule validation: reports authored rules whose condition cannot check what their own
 * text prescribes. Reporting only - a defective rule is still ingested, because a rule that reads
 * wrong to this pass may still be right, and the author decides.
 */
import type { HoldCooldownForAnchorCondition, RulebookRule } from '../core/models/rulebook.models';

/** One authored rule whose condition disagrees with its own text or is structurally impossible. */
export interface RuleDefect {
  spec: string;
  rule: string;
  problem: string;
}

// A hold rule tells the player to withhold a cooldown; this vocabulary describes casting two together.
const PAIRING_WORDS = ['stack', 'sync', 'pair', 'together'];

/** True when the action prescribes casting a held spell before the anchor, which is what the rule flags. */
function actionPutsHeldBeforeAnchor(action: string, cond: HoldCooldownForAnchorCondition): boolean {
  const beforeAt = action.indexOf(' before ');
  if (beforeAt < 0 || action.indexOf(cond.anchor_spell_name, beforeAt) < 0) return false;
  return cond.spell_names.some(spellName => {
    const heldAt = action.indexOf(spellName);
    return heldAt >= 0 && heldAt < beforeAt;
  });
}

export function validateRulebookRules(spec: string, rules: RulebookRule[]): RuleDefect[] {
  const defects: RuleDefect[] = [];
  for (const rule of rules) {
    const cond = rule.condition;
    if (!cond) continue;
    const name = rule.description ?? cond.kind;
    const action = rule.action ?? '';

    if (cond.kind === 'cast_without_prior') {
      if (cond.spell_id === cond.required_spell_id) {
        defects.push({ spec, rule: name, problem: `${cond.spell_name} is required to accompany itself` });
      }
      continue;
    }

    if (cond.spell_ids.includes(cond.anchor_spell_id)) {
      defects.push({ spec, rule: name, problem: `${cond.anchor_spell_name} is held for itself` });
      continue;
    }
    const pairing = PAIRING_WORDS.find(word => `${name} ${action}`.toLowerCase().includes(word));
    if (pairing) {
      defects.push({ spec, rule: name, problem: `reads as a pairing ("${pairing}"), not a hold, so it flags the cast its action prescribes` });
      continue;
    }
    if (actionPutsHeldBeforeAnchor(action, cond)) {
      defects.push({ spec, rule: name, problem: `the action asks for a cast before ${cond.anchor_spell_name}, which is what this rule flags` });
    }
  }
  return defects;
}
