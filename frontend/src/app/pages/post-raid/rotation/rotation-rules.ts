/**
 * Functional core of the rulebook rule engine: pure evaluation of a rule's `condition` against one
 * pull. Colocated rather than shared because it is rotation-slice domain logic, and separate from
 * `rotation.service.ts` so the ingest transform can judge top parses with the same code the runtime
 * judges the player with.
 */
import { AnalysisFinding } from '../../../core/models/analysis.models';
import {
  RulebookRule, RuleCondition,
  CastWithoutPriorCondition, HoldCooldownForAnchorCondition, CastOutsideBuffCondition,
  AuraUptimeBelowCondition, OpeningSequenceCondition,
  CastAtTargetCountCondition, ResourceAtCastCondition, ProcWastedCondition,
} from '../../../core/models/rulebook.models';
import { WclEvent } from '../../../core/models/wcl.models';
import { AuraWindows, buildAuraWindows, isInsideAura, auraUptimePct } from '../../../shared/analysis/aura-windows';

export type Severity = AnalysisFinding['severity'];

export type CastTimes = Record<number, number[]>;

export function buildCastTimes(casts: WclEvent[], fStart: number): CastTimes {
  const castTimes: CastTimes = {};
  for (const cast of casts) {
    if (cast.type === 'cast' && cast.abilityGameID) {
      (castTimes[cast.abilityGameID] ??= []).push((cast.timestamp - fStart) / 1000);
    }
  }
  return castTimes;
}

/** `lead` is the judged cast minus the required one: positive when the required cast came first. */
function withinWindow(lead: number, win: number, position: 'before' | 'after' | 'either'): boolean {
  if (position === 'either') return Math.abs(lead) <= win;
  return position === 'before' ? lead >= 0 && lead <= win : lead <= 0 && -lead <= win;
}

export function evaluateCastWithoutPrior(
  cond: CastWithoutPriorCondition, castTimes: CastTimes, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const win = cond.window_s ?? 5;
  const exception = cond.exception;
  const position = cond.position ?? 'before';
  const primary = [...(castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b);
  const required = castTimes[cond.required_spell_id] ?? [];
  const violations: number[] = [];
  for (const time of primary) {
    if (required.some(rt => withinWindow(time - rt, win, position))) continue;
    if (exception) {
      const context = castTimes[exception.context_spell_id] ?? [];
      const contextWindow = exception.context_window_s ?? 20;
      const covered = exception.position === 'before'
        ? context.some(ct => time - ct >= 0 && time - ct <= contextWindow)
        : context.some(ct => ct - time >= 0 && ct - time <= contextWindow);
      if (covered) continue;
    }
    violations.push(time);
  }
  if (!violations.length) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(violations[0] * 1000),
    label: `${cond.spell_name} without ${cond.required_spell_name}`,
    message: `${cond.spell_name} without ${cond.required_spell_name}: ${violations.length} of ${primary.length} cast(s).`,
    measured: { value: `${violations.length} / ${primary.length}`, unit: 'cast(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

export function evaluateHoldForAnchor(
  cond: HoldCooldownForAnchorCondition, castTimes: CastTimes, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const holdWindowS = cond.hold_window_s ?? 15;
  const anchorTimes = [...(castTimes[cond.anchor_spell_id] ?? [])].sort((a, b) => a - b).slice(1);
  const violations = cond.spell_ids.flatMap((spellId, i) => {
    const spellName = cond.spell_names?.[i] ?? String(spellId);
    return anchorTimes.flatMap(anchorTime =>
      (castTimes[spellId] ?? [])
        .filter(castTime => castTime >= anchorTime - holdWindowS && castTime < anchorTime)
        .map(castTime => ({ spellName, castTime })),
    );
  });
  if (!violations.length) return null;
  const firstCastS = violations.reduce((min, violation) => Math.min(min, violation.castTime), Infinity);
  const spellNames = [...new Set(violations.map(violation => violation.spellName))].join('/');
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(firstCastS * 1000),
    label: `${spellNames} held before ${cond.anchor_spell_name}`,
    message: `${spellNames} used in the ${holdWindowS}s hold window before ${cond.anchor_spell_name}: ${violations.length} charge(s).`,
    measured: { value: `${violations.length}`, unit: 'charge(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

/** Enemies damaged this soon after a cast count as engaged for it; an AoE ability lands well inside a GCD or two. */
const TARGET_COUNT_WINDOW_S = 3;

/** WCL flattens one actor's pools onto the event; 1 means they belong to the caster. */
const RESOURCE_ACTOR_SOURCE = 1;

/** The optional event streams a rule reads beyond the always-fetched casts and buffs. */
export type RuleStream = 'enemyAuras' | 'damage';

/** Exhaustive by design: a new condition kind cannot compile until it declares the streams it reads. */
function streamsFor(cond: RuleCondition): RuleStream[] {
  switch (cond.kind) {
    case 'aura_uptime_below': return cond.on === 'target' ? ['enemyAuras'] : [];
    case 'cast_at_target_count': return ['damage'];
    case 'cast_without_prior':
    case 'hold_cooldown_for_anchor':
    case 'cast_outside_buff':
    case 'opening_sequence':
    case 'resource_at_cast':
    case 'proc_wasted': return [];
  }
}

export function rulesNeed(rules: RulebookRule[], stream: RuleStream): boolean {
  return rules.some(rule => streamsFor(rule.condition).includes(stream));
}

/** Guards the engine against a rulebook file that does not conform: the schema requires a condition, unregenerated files predate it. */
export function judgeableRules(rules: RulebookRule[]): RulebookRule[] {
  return rules.filter(rule => rule.condition != null);
}

/** Everything the rule evaluators read, derived once per player view. */
export interface RuleContext {
  castTimes: CastTimes;
  castEvents: WclEvent[];
  fStart: number;
  fightDurationS: number;
  selfAuras: AuraWindows;
  targetAuras: AuraWindows;
  damage: WclEvent[];
}

export interface RuleInputs {
  casts: WclEvent[];
  buffs: WclEvent[];
  debuffs: WclEvent[];
  damage: WclEvent[];
  fStart: number;
  fEnd: number;
}

export function buildRuleContext(input: RuleInputs): RuleContext {
  return {
    castTimes: buildCastTimes(input.casts, input.fStart),
    castEvents: input.casts,
    fStart: input.fStart,
    fightDurationS: (input.fEnd - input.fStart) / 1000,
    selfAuras: buildAuraWindows(input.buffs, input.fStart),
    targetAuras: buildAuraWindows(input.debuffs, input.fStart),
    damage: input.damage,
  };
}

export function evaluateCastOutsideBuff(
  cond: CastOutsideBuffCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const primary = [...(ctx.castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b);
  const violations = primary.filter(time =>
    isInsideAura(ctx.selfAuras, cond.buff_spell_id, time * 1000) !== (cond.require === 'inside'));
  if (!violations.length) return null;
  const relation = cond.require === 'inside' ? 'without' : 'during';
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(violations[0] * 1000),
    label: `${cond.spell_name} ${relation} ${cond.buff_spell_name}`,
    message: `${cond.spell_name} ${relation} ${cond.buff_spell_name}: ${violations.length} of ${primary.length} cast(s).`,
    measured: { value: `${violations.length} / ${primary.length}`, unit: 'cast(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

export function evaluateAuraUptimeBelow(
  cond: AuraUptimeBelowCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const windows = cond.on === 'target' ? ctx.targetAuras : ctx.selfAuras;
  const pct = auraUptimePct(windows, cond.aura_spell_id, ctx.fightDurationS * 1000);
  // Zero uptime reads as a build that skips the aura rather than a mistake, which the app does not guess at.
  if (pct <= 0 || pct >= cond.min_pct) return null;
  return {
    severity, category: 'rule_violation',
    label: `${cond.aura_spell_name} uptime`,
    message: `${cond.aura_spell_name} up ${Math.round(pct)}% of the fight, expected ${cond.min_pct}%.`,
    measured: { value: `${Math.round(pct)} / ${cond.min_pct}`, unit: '% uptime' },
    details: remedy ? { remedy } : undefined,
  };
}

export function evaluateOpeningSequence(
  cond: OpeningSequenceCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const all = Object.values(ctx.castTimes).flat();
  if (!all.length) return null;
  const pullS = Math.min(...all);
  const deadlineS = pullS + cond.window_s;
  let cursor = pullS;
  let matched = 0;
  for (const spellId of cond.spell_ids) {
    const next = (ctx.castTimes[spellId] ?? [])
      .filter(time => time >= cursor && time <= deadlineS)
      .sort((a, b) => a - b)[0];
    if (next == null) break;
    cursor = next;
    matched++;
  }
  if (matched === cond.spell_ids.length) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(pullS * 1000),
    label: `Opener: ${cond.spell_names.join(' > ')}`,
    message: `Opener reached ${matched} of ${cond.spell_ids.length} steps in the first ${cond.window_s}s; ${cond.spell_names[matched]} did not follow in order.`,
    measured: { value: `${matched} / ${cond.spell_ids.length}`, unit: 'step(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

/**
 * Distinct enemies the player damaged in the window opened by a cast. Every damaged enemy counts,
 * not only the ones the judged ability struck, because both bounds describe the fight state that
 * should drive the choice - scoping to the ability would make `max_targets` unfireable.
 */
function targetsAtCast(damage: WclEvent[], fStart: number, castTimeS: number): number {
  const fromMs = fStart + castTimeS * 1000;
  const toMs = fromMs + TARGET_COUNT_WINDOW_S * 1000;
  const targets = new Set<string>();
  for (const event of damage) {
    if (event.timestamp < fromMs || event.timestamp > toMs) continue;
    if (event.targetID != null) targets.add(`${event.targetID}:${event.targetInstance ?? 0}`);
  }
  return targets.size;
}

export function evaluateCastAtTargetCount(
  cond: CastAtTargetCountCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const judged = [...(ctx.castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b)
    .map(timeS => ({ timeS, targets: targetsAtCast(ctx.damage, ctx.fStart, timeS) }))
    .filter(({ targets }) => targets > 0);
  if (!judged.length) return null;
  const isUnder = ({ targets }: { targets: number }) => cond.min_targets != null && targets < cond.min_targets;
  const violations = judged.filter(entry =>
    isUnder(entry) || (cond.max_targets != null && entry.targets > cond.max_targets));
  if (!violations.length) return null;
  const underCount = violations.filter(isUnder).length;
  const bound = underCount >= violations.length - underCount
    ? `under ${cond.min_targets}` : `over ${cond.max_targets}`;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(violations[0].timeS * 1000),
    label: `${cond.spell_name} at ${bound} targets`,
    message: `${cond.spell_name} cast at ${bound} targets: ${violations.length} of ${judged.length} cast(s).`,
    measured: { value: `${violations.length} / ${judged.length}`, unit: 'cast(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

export function evaluateResourceAtCast(
  cond: ResourceAtCastCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const judged: { timeS: number; amount: number }[] = [];
  for (const event of ctx.castEvents) {
    if (event.type !== 'cast' || event.abilityGameID !== cond.spell_id) continue;
    if (event.resourceActor != null && event.resourceActor !== RESOURCE_ACTOR_SOURCE) continue;
    const pool = event.classResources?.find(resource => resource.type === cond.resource_type);
    if (!pool) continue;
    judged.push({ timeS: (event.timestamp - ctx.fStart) / 1000, amount: pool.amount });
  }
  if (!judged.length) return null;
  const violations = judged.filter(({ amount }) =>
    (cond.min_amount != null && amount < cond.min_amount)
    || (cond.max_amount != null && amount > cond.max_amount));
  if (!violations.length) return null;
  const belowMin = violations.filter(({ amount }) => cond.min_amount != null && amount < cond.min_amount);
  const bound = belowMin.length >= violations.length - belowMin.length
    ? `below ${cond.min_amount}` : `above ${cond.max_amount}`;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(violations[0].timeS * 1000),
    label: `${cond.spell_name} at ${bound} ${cond.resource_name}`,
    message: `${cond.spell_name} cast ${bound} ${cond.resource_name}: ${violations.length} of ${judged.length} cast(s).`,
    measured: { value: `${violations.length} / ${judged.length}`, unit: 'cast(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

export function evaluateProcWasted(
  cond: ProcWastedCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  // An open span was still up at the pull's end, so nothing was wasted yet.
  const spans = (ctx.selfAuras.get(cond.buff_spell_id) ?? []).filter(([, end]) => end != null);
  if (!spans.length) return null;
  const spendTimes = cond.spend_spell_ids.flatMap(spellId => ctx.castTimes[spellId] ?? []);
  const wasted = spans.filter(([startMs, endMs]) =>
    !spendTimes.some(time => time * 1000 >= startMs && time * 1000 <= (endMs as number)));
  if (!wasted.length) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(wasted[0][0]),
    label: `${cond.buff_spell_name} wasted`,
    message: `${cond.buff_spell_name} expired unspent ${wasted.length} of ${spans.length} time(s).`,
    measured: { value: `${wasted.length} / ${spans.length}`, unit: 'proc(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

/** Short chip label for a rulebook rule `type`, matching the tone of `CAT_LABEL`. */
export const RULE_TYPE_LABEL: Record<string, string> = {
  cooldown_pairing: 'pairing',
  cd_hold: 'cd hold',
  opener: 'opener',
  rotation: 'rotation',
  aoe_switch: 'aoe',
};

// `low` shares the `info` tier: the finding table renders three, and no deployed rule is `low`.
const RULE_SEVERITY: Record<string, Severity> = {
  critical: 'critical', high: 'warning', medium: 'info', low: 'info',
};

export function ruleSeverity(priority?: string): Severity {
  return RULE_SEVERITY[priority ?? ''] ?? 'warning';
}

export function evaluateCondition(
  cond: RuleCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  switch (cond.kind) {
    case 'cast_without_prior': return evaluateCastWithoutPrior(cond, ctx.castTimes, severity, remedy);
    case 'hold_cooldown_for_anchor': return evaluateHoldForAnchor(cond, ctx.castTimes, severity, remedy);
    case 'cast_outside_buff': return evaluateCastOutsideBuff(cond, ctx, severity, remedy);
    case 'aura_uptime_below': return evaluateAuraUptimeBelow(cond, ctx, severity, remedy);
    case 'opening_sequence': return evaluateOpeningSequence(cond, ctx, severity, remedy);
    case 'cast_at_target_count': return evaluateCastAtTargetCount(cond, ctx, severity, remedy);
    case 'resource_at_cast': return evaluateResourceAtCast(cond, ctx, severity, remedy);
    case 'proc_wasted': return evaluateProcWasted(cond, ctx, severity, remedy);
  }
}

/** Whether the pull gave the player any chance to break the rule; without this a rule reads as followed on a fight it never came up in. */
export function ruleApplicable(cond: RuleCondition, ctx: RuleContext): boolean {
  const castCount = (spellId: number) => ctx.castTimes[spellId]?.length ?? 0;
  switch (cond.kind) {
    case 'cast_without_prior': return castCount(cond.spell_id) > 0;
    case 'hold_cooldown_for_anchor':
      return castCount(cond.anchor_spell_id) > 1 && cond.spell_ids.some(spellId => castCount(spellId) > 0);
    case 'cast_outside_buff': return castCount(cond.spell_id) > 0;
    case 'aura_uptime_below':
      return auraUptimePct(cond.on === 'target' ? ctx.targetAuras : ctx.selfAuras,
        cond.aura_spell_id, ctx.fightDurationS * 1000) > 0;
    case 'opening_sequence': return cond.spell_ids.some(spellId => castCount(spellId) > 0);
    case 'cast_at_target_count':
      return (ctx.castTimes[cond.spell_id] ?? []).some(timeS => targetsAtCast(ctx.damage, ctx.fStart, timeS) > 0);
    case 'resource_at_cast':
      return ctx.castEvents.some(event => event.type === 'cast' && event.abilityGameID === cond.spell_id
        && (event.resourceActor == null || event.resourceActor === RESOURCE_ACTOR_SOURCE)
        && !!event.classResources?.some(resource => resource.type === cond.resource_type));
    case 'proc_wasted': return (ctx.selfAuras.get(cond.buff_spell_id) ?? []).some(([, end]) => end != null);
  }
}

export function evaluateRules(rules: RulebookRule[], ctx: RuleContext): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  for (const rule of rules) {
    const finding = evaluateCondition(rule.condition, ctx, ruleSeverity(rule.priority), rule.action);
    // One authored name in both states, so a rule does not read as two different rules.
    if (finding) findings.push({ ...finding, rule_type: rule.type, label: rule.description ?? finding.label });
  }
  return findings;
}

export function ruleLabel(cond: RuleCondition, description?: string): string {
  if (description) return description;
  switch (cond.kind) {
    case 'cast_without_prior': return `${cond.spell_name} with ${cond.required_spell_name}`;
    case 'hold_cooldown_for_anchor': return `${cond.spell_names.join('/')} held for ${cond.anchor_spell_name}`;
    case 'cast_outside_buff': return `${cond.spell_name} ${cond.require} ${cond.buff_spell_name}`;
    case 'aura_uptime_below': return `${cond.aura_spell_name} uptime`;
    case 'opening_sequence': return `Opener: ${cond.spell_names.join(' > ')}`;
    case 'cast_at_target_count': return `${cond.spell_name} target count`;
    case 'resource_at_cast': return `${cond.spell_name} at ${cond.resource_name}`;
    case 'proc_wasted': return `${cond.buff_spell_name} spent`;
  }
}

export function rulesFollowed(rules: RulebookRule[], ctx: RuleContext): string[] {
  const followed: string[] = [];
  for (const rule of rules) {
    const cond = rule.condition;
    if (!ruleApplicable(cond, ctx)) continue;
    if (!evaluateCondition(cond, ctx, ruleSeverity(rule.priority))) followed.push(ruleLabel(cond, rule.description));
  }
  return followed;
}

/** A cooldown's lost/unused + first-cast checks run only when at least this share of top parses used it. */

/** One rule's outcome on one pull, which is what ingest aggregates into consensus. */
export interface RuleOutcome {
  applicable: boolean;
  followed: boolean;
}

/** A rulebook rule plus what the encounter's top parses did with it. */
export interface BenchedRule {
  rule: RulebookRule;
  /** Share (%) of applicable top parses that followed it; null when no parse could be judged. */
  followed_pct: number | null;
  /** Top parses the rule was applicable on. */
  sample_count: number;
}

/** Share (%) of applicable top parses that must follow a gated rule before it is shown. */
export const RULE_CONSENSUS_PCT = 50;

/**
 * Whether the encounter's top parses decide if a rule applies to it. Gated kinds carry a number or an
 * order whose right answer shifts with the fight, so a strat the field plays differently must not be
 * flagged; the ungated pair has nothing encounter-specific to be wrong about.
 */
function consensusGated(cond: RuleCondition): boolean {
  switch (cond.kind) {
    case 'aura_uptime_below':
    case 'cast_at_target_count':
    case 'opening_sequence':
    case 'hold_cooldown_for_anchor':
    case 'cast_without_prior':
    case 'resource_at_cast': return true;
    case 'cast_outside_buff':
    case 'proc_wasted': return false;
  }
}

/** Judges every rule against one pull, for ingest to aggregate across the top parses. */
export function judgeRules(rules: RulebookRule[], ctx: RuleContext): RuleOutcome[] {
  return rules.map(rule => {
    const applicable = ruleApplicable(rule.condition, ctx);
    return { applicable, followed: applicable && !evaluateCondition(rule.condition, ctx, 'warning') };
  });
}

/** Aggregates one rule's outcomes across parses; null share means no parse could be judged. */
export function ruleConsensus(outcomes: RuleOutcome[]): { followed_pct: number | null; sample_count: number } {
  const applicable = outcomes.filter(outcome => outcome.applicable);
  if (!applicable.length) return { followed_pct: null, sample_count: 0 };
  const followed = applicable.filter(outcome => outcome.followed).length;
  return { followed_pct: (followed / applicable.length) * 100, sample_count: applicable.length };
}

/** The rules worth showing on this encounter: judgeable, and for gated kinds followed by most of the field. */
export function consensusRules(benched: BenchedRule[]): RulebookRule[] {
  return benched
    .filter(entry => entry.rule.condition != null)
    .filter(entry => !consensusGated(entry.rule.condition)
      || (entry.followed_pct != null && entry.followed_pct >= RULE_CONSENSUS_PCT))
    .map(entry => entry.rule);
}
