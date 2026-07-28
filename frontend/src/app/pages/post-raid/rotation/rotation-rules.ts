// Separate from rotation.service.ts so the ingest transform measures top parses with the same code the runtime judges the player with.
import { median, deviation } from 'd3-array';
import { round } from '../../../shared/analysis/analysis-math';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import {
  RulebookRule, RuleCondition,
  CastWithoutPriorCondition, HoldCooldownForAnchorCondition, CastOutsideBuffCondition,
  AuraUptimeBelowCondition, OpeningSequenceCondition,
  CastAtTargetCountCondition, ResourceAtCastCondition, ProcWastedCondition, FillerInBuffCondition,
  SpendAtStacksCondition, AuraClippedCondition, FillerBelowHealthCondition,
} from '../../../core/models/rulebook.models';
import { WclEvent } from '../../../core/models/wcl.models';
import {
  AuraWindows, AuraStacks, TargetedAuraSpans, AuraSpan,
  buildAuraWindows, buildAuraStacks, buildTargetedAuraSpans, isInsideAura, isUnderAura, stacksAt, auraUptimePct,
} from '../../../shared/analysis/aura-windows';

export type Severity = AnalysisFinding['severity'];

/** Enemies damaged this soon after a cast count as engaged for it; an AoE ability lands well inside a GCD or two. */
const TARGET_COUNT_WINDOW_S = 3;

/** WCL flattens one actor's pools onto the event; 1 means they belong to the caster. */
const RESOURCE_ACTOR_SOURCE = 1;

/** The other half of the same field: 2 means the snapshot describes whoever was hit. */
const RESOURCE_ACTOR_TARGET = 2;

/** How far back a cast may read its target's last health snapshot, since health is sampled on hits rather than casts. Health falls fast in execute range, so this stays short. */
const HEALTH_SAMPLE_WINDOW_S = 2;

/** A re-application this soon AFTER a cast is that cast landing: measured deltas run 0-28ms, so this covers projectile flight without reaching the next proc. */
const HARD_CAST_WINDOW_S = 0.25;

/** A magnitude the encounter supplies in place of a number nobody should author. */
export interface RuleThreshold {
  /** Median across the parses it could be measured on. */
  value: number;
  /** Tolerance half-width, so parse-to-parse jitter is not coached. */
  band: number;
}

/** Floor on the band as a share of the median, so a tightly clustered field still tolerates jitter. */
const THRESHOLD_BAND_MIN_FRAC = 0.1;

/** A threshold needs this share of the sampled parses to be measurable, matching the other consensus gates. */
const THRESHOLD_SAMPLE_FRAC = 0.5;

export interface BenchedRule {
  rule: RulebookRule;
  /** Null when the kind needs no magnitude, or when too few parses could supply one. */
  threshold: RuleThreshold | null;
  /** Parses the magnitude could be measured on. */
  sample_count: number;
}

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

/** Everything the rule evaluators read, derived once per pull. */
export interface RuleContext {
  castTimes: CastTimes;
  castEvents: WclEvent[];
  fStart: number;
  fightDurationS: number;
  /** Fight start to the player's first death, so a corpse is never coached for what it could not maintain. */
  aliveDurationS: number;
  selfAuras: AuraWindows;
  targetAuras: AuraWindows;
  damage: WclEvent[];
  /** Built on first read: only three of the twelve kinds want these, and a pull pays a full extra pass over its streams for each. */
  readonly selfStacks: AuraStacks;
  readonly selfAuraSpans: TargetedAuraSpans;
  readonly targetAuraSpans: TargetedAuraSpans;
}

function lazy<T>(build: () => T): () => T {
  let value: T | undefined;
  return () => (value ??= build());
}

export interface RuleInputs {
  casts: WclEvent[];
  buffs: WclEvent[];
  debuffs: WclEvent[];
  damage: WclEvent[];
  /** The player's own `death` events. */
  deaths: WclEvent[];
  fStart: number;
  fEnd: number;
}

export function buildRuleContext(input: RuleInputs): RuleContext {
  const fightDurationS = (input.fEnd - input.fStart) / 1000;
  const deathTimes = input.deaths.map(event => (event.timestamp - input.fStart) / 1000);
  const selfStacks = lazy(() => buildAuraStacks(input.buffs, input.fStart));
  const selfAuraSpans = lazy(() => buildTargetedAuraSpans(input.buffs, input.fStart));
  const targetAuraSpans = lazy(() => buildTargetedAuraSpans(input.debuffs, input.fStart));
  return {
    castTimes: buildCastTimes(input.casts, input.fStart),
    castEvents: input.casts,
    fStart: input.fStart,
    fightDurationS,
    aliveDurationS: deathTimes.length ? Math.min(...deathTimes) : fightDurationS,
    selfAuras: buildAuraWindows(input.buffs, input.fStart),
    targetAuras: buildAuraWindows(input.debuffs, input.fStart),
    damage: input.damage,
    get selfStacks() { return selfStacks(); },
    get selfAuraSpans() { return selfAuraSpans(); },
    get targetAuraSpans() { return targetAuraSpans(); },
  };
}

/** The threshold shifted to the forgiving side, so the field's own spread is never itself a finding. */
function lenient(threshold: RuleThreshold, direction: 'up' | 'down'): number {
  return direction === 'up' ? threshold.value + threshold.band : Math.max(0, threshold.value - threshold.band);
}

/** `lead` is the judged cast minus the required one: positive when the required cast came first. */
function withinWindow(lead: number, win: number, position: 'before' | 'after' | 'either'): boolean {
  if (position === 'either') return Math.abs(lead) <= win;
  return position === 'before' ? lead >= 0 && lead <= win : lead <= 0 && -lead <= win;
}

/** The tightest lead each cast achieved on the required side, or null when a cast never paired at all. */
function leadPerCast(cond: CastWithoutPriorCondition, castTimes: CastTimes): (number | null)[] {
  const position = cond.position ?? 'before';
  const required = castTimes[cond.required_spell_id] ?? [];
  return [...(castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b).map(time => {
    const leads = required.map(rt => time - rt)
      .filter(lead => position === 'either' || (position === 'before' ? lead >= 0 : lead <= 0))
      .map(Math.abs);
    return leads.length ? Math.min(...leads) : null;
  });
}

export function evaluateCastWithoutPrior(
  cond: CastWithoutPriorCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const win = lenient(threshold, 'up');
  const position = cond.position ?? 'before';
  const castTimes = ctx.castTimes;
  const primary = [...(castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b);
  const required = castTimes[cond.required_spell_id] ?? [];
  const violations = primary.filter(time => !required.some(rt => withinWindow(time - rt, win, position)));
  if (!violations.length) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(violations[0] * 1000),
    label: `${cond.spell_name} without ${cond.required_spell_name}`,
    message: `${cond.spell_name} without ${cond.required_spell_name} inside ${Math.round(win)}s: ${violations.length} of ${primary.length} cast(s).`,
    measured: { value: `${violations.length} / ${primary.length}`, unit: 'cast(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

/** Non-opener anchor casts: the first is nothing to have held for. */
function holdAnchors(cond: HoldCooldownForAnchorCondition, castTimes: CastTimes): number[] {
  return [...(castTimes[cond.anchor_spell_id] ?? [])].sort((a, b) => a - b).slice(1);
}

export function evaluateHoldForAnchor(
  cond: HoldCooldownForAnchorCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const holdWindowS = lenient(threshold, 'down');
  const anchorTimes = holdAnchors(cond, ctx.castTimes);
  const violations = cond.spell_ids.flatMap((spellId, i) => {
    const spellName = cond.spell_names?.[i] ?? String(spellId);
    return anchorTimes.flatMap(anchorTime =>
      (ctx.castTimes[spellId] ?? [])
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
    message: `${spellNames} used in the ${Math.round(holdWindowS)}s the field keeps clear before ${cond.anchor_spell_name}: ${violations.length} charge(s).`,
    measured: { value: `${violations.length}`, unit: 'charge(s)' },
    details: remedy ? { remedy } : undefined,
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

function uptimePct(cond: AuraUptimeBelowCondition, ctx: RuleContext): number {
  const windows = cond.on === 'target' ? ctx.targetAuras : ctx.selfAuras;
  // Alive time, since the top parses this is measured against do not die and so give no relief for the dead stretch.
  return auraUptimePct(windows, cond.aura_spell_id, ctx.aliveDurationS * 1000);
}

export function evaluateAuraUptimeBelow(
  cond: AuraUptimeBelowCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const minPct = lenient(threshold, 'down');
  const pct = uptimePct(cond, ctx);
  // Zero uptime reads as a build that skips the aura rather than a mistake, which the app does not guess at.
  if (pct <= 0 || pct >= minPct) return null;
  return {
    severity, category: 'rule_violation',
    label: `${cond.aura_spell_name} uptime`,
    message: `${cond.aura_spell_name} up ${Math.round(pct)}% of the fight; the top parses hold ${Math.round(threshold.value)}%.`,
    measured: { value: `${Math.round(pct)} / ${Math.round(threshold.value)}`, unit: '% uptime' },
    details: remedy ? { remedy } : undefined,
  };
}

/** Steps completed in order within `windowS` of the pull, and the pull time itself. */
function openerProgress(
  cond: OpeningSequenceCondition, ctx: RuleContext, windowS: number,
): { pullS: number; matched: number; completedS: number | null } | null {
  const all = Object.values(ctx.castTimes).flat();
  if (!all.length) return null;
  const pullS = Math.min(...all);
  const deadlineS = pullS + windowS;
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
  return { pullS, matched, completedS: matched === cond.spell_ids.length ? cursor - pullS : null };
}

export function evaluateOpeningSequence(
  cond: OpeningSequenceCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const windowS = lenient(threshold, 'up');
  const progress = openerProgress(cond, ctx, windowS);
  if (!progress || progress.completedS != null) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(progress.pullS * 1000),
    label: `Opener: ${cond.spell_names.join(' > ')}`,
    message: `Opener reached ${progress.matched} of ${cond.spell_ids.length} steps in the ${Math.round(windowS)}s the top parses take.`,
    measured: { value: `${progress.matched} / ${cond.spell_ids.length}`, unit: 'step(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

/** Every enemy the player was damaging, since both bounds ask how many were up to be hit, not how many this ability struck. */
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

function targetCountsPerCast(cond: CastAtTargetCountCondition, ctx: RuleContext): { timeS: number; targets: number }[] {
  return [...(ctx.castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b)
    .map(timeS => ({ timeS, targets: targetsAtCast(ctx.damage, ctx.fStart, timeS) }))
    .filter(({ targets }) => targets > 0);
}

/** One value read off each cast, judged against the bound. Shared by every per-cast kind so they cannot drift apart in maths or in voice. */
interface BoundedCasts {
  values: { timeS: number; value: number }[];
  bound: 'min' | 'max';
  /** Snaps the limit before it is compared, for a scale that only has whole steps. */
  quantize?: (value: number) => number;
  /** Applied to both the limit and the field figure, so the two numbers in the copy always read on one scale. */
  format: (value: number) => string;
  label: (limit: string) => string;
  what: (limit: string) => string;
}

function evaluateBoundedPerCast(
  judged: BoundedCasts, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  if (!judged.values.length) return null;
  const quantize = judged.quantize ?? ((value: number) => value);
  const limit = quantize(lenient(threshold, judged.bound === 'min' ? 'down' : 'up'));
  const violations = judged.values.filter(({ value }) => judged.bound === 'min' ? value < limit : value > limit);
  if (!violations.length) return null;
  const shown = judged.format(limit);
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(violations[0].timeS * 1000),
    label: judged.label(shown),
    message: `${judged.what(shown)}, ${violations.length} of ${judged.values.length} cast(s). Top: ${judged.format(threshold.value)}.`,
    measured: { value: `${violations.length} / ${judged.values.length}`, unit: 'cast(s)' },
    details: remedy ? { remedy } : undefined,
  };
}

export function evaluateCastAtTargetCount(
  cond: CastAtTargetCountCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  return evaluateBoundedPerCast({
    values: targetCountsPerCast(cond, ctx).map(({ timeS, targets }) => ({ timeS, value: targets })),
    bound: cond.bound,
    // Rounded, since truncating a sub-target band away from a whole-target threshold costs a full target of slack and the rule then fires a target late.
    quantize: Math.round,
    format: value => String(Math.round(value)),
    label: limit => `${cond.spell_name} at ${cond.bound === 'min' ? 'under' : 'over'} ${limit} targets`,
    what: limit => `${cond.spell_name} cast at ${cond.bound === 'min' ? 'under' : 'over'} ${limit} targets`,
  }, threshold, severity, remedy);
}

/** A share of the pool's own cap, so one threshold stays meaningful across pools whose scales differ by orders of magnitude. */
function resourceFractionPerCast(cond: ResourceAtCastCondition, ctx: RuleContext): { timeS: number; frac: number }[] {
  const judged: { timeS: number; frac: number }[] = [];
  for (const event of ctx.castEvents) {
    if (event.type !== 'cast' || event.abilityGameID !== cond.spell_id) continue;
    if (event.resourceActor != null && event.resourceActor !== RESOURCE_ACTOR_SOURCE) continue;
    const pool = event.classResources?.find(resource => resource.type === cond.resource_type);
    if (!pool?.max) continue;
    judged.push({ timeS: (event.timestamp - ctx.fStart) / 1000, frac: pool.amount / pool.max });
  }
  return judged;
}

export function evaluateResourceAtCast(
  cond: ResourceAtCastCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const wording = cond.bound === 'min' ? 'below' : 'above';
  return evaluateBoundedPerCast({
    values: resourceFractionPerCast(cond, ctx).map(({ timeS, frac }) => ({ timeS, value: frac })),
    bound: cond.bound,
    format: value => `${Math.round(value * 100)}%`,
    label: limit => `${cond.spell_name} at ${wording} ${limit} ${cond.resource_name}`,
    what: limit => `${cond.spell_name} cast ${wording} ${limit} ${cond.resource_name}`,
  }, threshold, severity, remedy);
}

/** A proc still up when the pull ends has not been wasted, whether the log closed its span at the kill or left it open. */
function closedProcSpans(cond: ProcWastedCondition, ctx: RuleContext): [number, number | null][] {
  return (ctx.selfAuras.get(cond.buff_spell_id) ?? [])
    .filter(([, end]) => end != null && end < ctx.fightDurationS * 1000);
}

export function evaluateProcWasted(
  cond: ProcWastedCondition, ctx: RuleContext, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const spans = closedProcSpans(cond, ctx);
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

/** The filler casts a gate actually admitted, split into the coached spell and the ones it should displace. Shared by both filler kinds so the two can only differ in their gate. */
interface FillerSplit {
  coached: number[];
  alternatives: number[];
  total: number;
}

function splitFillers(
  coachedId: number, alternativeIds: number[], castTimesS: (spellId: number) => number[],
): FillerSplit {
  const coached = castTimesS(coachedId);
  const alternatives = alternativeIds.flatMap(castTimesS).sort((a, b) => a - b);
  return { coached, alternatives, total: coached.length + alternatives.length };
}

/** Share of the filler choice the coached spell won, or null when the pull never filled under that gate. */
function fillerShare(split: FillerSplit): number | null {
  return split.total ? split.coached.length / split.total : null;
}

function fillerFinding(
  split: FillerSplit, threshold: RuleThreshold, severity: Severity,
  spellName: string, where: string, remedy?: string,
): AnalysisFinding | null {
  const share = fillerShare(split);
  if (share == null || share >= lenient(threshold, 'down')) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: split.alternatives.length ? Math.round(split.alternatives[0] * 1000) : undefined,
    label: `${spellName} ${where}`,
    message: `${spellName} was ${Math.round(share * 100)}% of your fillers ${where}. Top: ${Math.round(threshold.value * 100)}%.`,
    measured: { value: `${Math.round(share * 100)} / ${Math.round(threshold.value * 100)}`, unit: '% of fillers' },
    details: remedy ? { remedy } : undefined,
  };
}

function fillerCastsInBuff(cond: FillerInBuffCondition, ctx: RuleContext): FillerSplit {
  return splitFillers(cond.spell_id, cond.alternative_spell_ids, spellId =>
    (ctx.castTimes[spellId] ?? []).filter(time =>
      isUnderAura(ctx.selfAuras, cond.buff_spell_id, time * 1000)
      && !suspendedAt(cond.except_buff_spell_ids, ctx, time * 1000)));
}

export function evaluateFillerInBuff(
  cond: FillerInBuffCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  return fillerFinding(fillerCastsInBuff(cond, ctx), threshold, severity,
    cond.spell_name, `in ${cond.buff_spell_name}`, remedy);
}

/** Casts made while a suspending state was up, which the rule has agreed not to judge. */
function suspendedAt(exceptIds: number[] | undefined, ctx: RuleContext, timeMs: number): boolean {
  return (exceptIds ?? []).some(spellId => isInsideAura(ctx.selfAuras, spellId, timeMs));
}

/** A stack count is only readable once the buff has been seen, so a pull on a build without it measures nothing. */
function stackCountsPerCast(cond: SpendAtStacksCondition, ctx: RuleContext): { timeS: number; stacks: number }[] {
  if (!ctx.selfStacks.has(cond.buff_spell_id)) return [];
  return [...(ctx.castTimes[cond.spell_id] ?? [])].sort((a, b) => a - b)
    .filter(timeS => !suspendedAt(cond.except_buff_spell_ids, ctx, timeS * 1000))
    .map(timeS => ({ timeS, stacks: stacksAt(ctx.selfStacks, cond.buff_spell_id, timeS * 1000) }));
}

export function evaluateSpendAtStacks(
  cond: SpendAtStacksCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  // Over the bar is overcapping, which is what a player sees; under it is spending cheap.
  const wording = cond.bound === 'min' ? 'under' : 'over';
  const tail = cond.bound === 'min' ? '' : ', overcapping';
  return evaluateBoundedPerCast({
    values: stackCountsPerCast(cond, ctx).map(({ timeS, stacks }) => ({ timeS, value: stacks })),
    bound: cond.bound,
    // Rounded for the same reason the target-count bound is: a sub-stack band against a whole-stack bar donates a full stack of slack.
    quantize: Math.round,
    format: value => String(Math.round(value)),
    label: limit => `${cond.spell_name} at ${wording} ${limit} ${cond.buff_spell_name}`,
    what: limit => `${cond.spell_name} cast at ${wording} ${limit} ${cond.buff_spell_name}${tail}`,
  }, threshold, severity, remedy);
}

type ClosedSpan = AuraSpan & { endMs: number };

/** Narrows in one place, so the spans that ran to an end are handled without asserting on every read. */
function closedSpans(perTarget: Map<string, AuraSpan[]>): ClosedSpan[] {
  return [...perTarget.values()].flat().filter((span): span is ClosedSpan => span.endMs != null);
}

function clipSpans(cond: AuraClippedCondition, ctx: RuleContext): Map<string, AuraSpan[]> {
  const source = cond.on === 'target' ? ctx.targetAuraSpans : ctx.selfAuraSpans;
  return source.get(cond.aura_spell_id) ?? new Map();
}

/** Only a re-application the player cast counts, since most refreshes in a log are procs rather than presses. */
function hardCastRefreshes(cond: AuraClippedCondition, ctx: RuleContext): ClosedSpan[] {
  const castTimes = ctx.castTimes[cond.cast_spell_id] ?? [];
  // One-sided: a cast after the refresh cannot have caused it.
  const cast = (atMs: number) => castTimes.some(time =>
    atMs - time * 1000 >= 0 && atMs - time * 1000 <= HARD_CAST_WINDOW_S * 1000);
  return closedSpans(clipSpans(cond, ctx))
    .filter(span => span.endedByRefresh && cast(span.endMs)
      && !suspendedAt(cond.except_buff_spell_ids, ctx, span.endMs));
}

/** Seconds the aura had been running when the player re-applied it, which needs no duration and so cannot be skewed by a death-truncated span or a pandemic-extended one. */
function elapsedAtRefresh(cond: AuraClippedCondition, ctx: RuleContext): { timeS: number; elapsedS: number }[] {
  return hardCastRefreshes(cond, ctx)
    .map(span => ({ timeS: span.endMs / 1000, elapsedS: (span.endMs - span.startMs) / 1000 }))
    .sort((a, b) => a.timeS - b.timeS);
}

export function evaluateAuraClipped(
  cond: AuraClippedCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  const judged = elapsedAtRefresh(cond, ctx);
  if (!judged.length) return null;
  const floor = lenient(threshold, 'down');
  const clipped = judged.filter(({ elapsedS }) => elapsedS < floor);
  if (!clipped.length) return null;
  return {
    severity, category: 'rule_violation',
    timestamp_ms: Math.round(clipped[0].timeS * 1000),
    label: `${cond.aura_spell_name} clipped`,
    message: `${cond.aura_spell_name} re-applied a median ${round(median(clipped.map(entry => entry.elapsedS)) ?? 0, 1)}s in, ${clipped.length} of ${judged.length} refresh(es). Top: ${round(threshold.value, 1)}s.`,
    measured: { value: `${clipped.length} / ${judged.length}`, unit: 'refresh(es)' },
    details: remedy ? { remedy } : undefined,
  };
}

const enemyKey = (event: WclEvent) => `${event.targetID ?? 0}:${event.targetInstance ?? 0}`;

/** Health rides on damage rows rather than casts, so a cast reads the latest snapshot of THE ENEMY IT NAMED - a tick on a dying add otherwise licenses an execute against a full-health boss. */
function targetHealthFracAt(ctx: RuleContext, cast: WclEvent): number | null {
  const key = enemyKey(cast);
  let latest: { atMs: number; frac: number } | null = null;
  for (const event of ctx.damage) {
    if (event.timestamp > cast.timestamp || event.timestamp < cast.timestamp - HEALTH_SAMPLE_WINDOW_S * 1000) continue;
    if (event.resourceActor !== RESOURCE_ACTOR_TARGET || enemyKey(event) !== key) continue;
    if (event.hitPoints == null || !event.maxHitPoints) continue;
    if (!latest || event.timestamp >= latest.atMs) latest = { atMs: event.timestamp, frac: event.hitPoints / event.maxHitPoints };
  }
  return latest?.frac ?? null;
}

/** The filler casts made under the execute threshold, split into the coached one and the ones it should displace. */
function fillersBelowHealth(cond: FillerBelowHealthCondition, ctx: RuleContext): FillerSplit {
  const gate = cond.health_pct / 100;
  return splitFillers(cond.spell_id, cond.alternative_spell_ids, spellId => ctx.castEvents
    .filter(event => {
      if (event.type !== 'cast' || event.abilityGameID !== spellId) return false;
      if (suspendedAt(cond.except_buff_spell_ids, ctx, event.timestamp - ctx.fStart)) return false;
      const frac = targetHealthFracAt(ctx, event);
      return frac != null && frac <= gate;
    })
    .map(event => (event.timestamp - ctx.fStart) / 1000));
}

export function evaluateFillerBelowHealth(
  cond: FillerBelowHealthCondition, ctx: RuleContext, threshold: RuleThreshold, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  return fillerFinding(fillersBelowHealth(cond, ctx), threshold, severity,
    cond.spell_name, `under ${cond.health_pct}% health`, remedy);
}

/** Short chip label for a rulebook rule `type`, matching the tone of `CAT_LABEL`. */
export const RULE_TYPE_LABEL: Record<string, string> = {
  cooldown_pairing: 'pairing',
  cd_hold: 'cd hold',
  opener: 'opener',
  rotation: 'rotation',
  aoe_switch: 'aoe',
};

/** The optional event streams a rule reads beyond the always-fetched casts and buffs. `targetHealth` rides on `damage`, asking for its heavier resource-bearing form. */
export type RuleStream = 'enemyAuras' | 'damage' | 'deaths' | 'targetHealth';

/** Exhaustive by design: a new condition kind cannot compile until it declares the streams it reads. */
function streamsFor(cond: RuleCondition): RuleStream[] {
  switch (cond.kind) {
    case 'aura_uptime_below': return cond.on === 'target' ? ['enemyAuras', 'deaths'] : ['deaths'];
    case 'aura_clipped': return cond.on === 'target' ? ['enemyAuras'] : [];
    case 'cast_at_target_count': return ['damage'];
    case 'filler_below_health': return ['damage', 'targetHealth'];
    case 'cast_without_prior':
    case 'hold_cooldown_for_anchor':
    case 'cast_outside_buff':
    case 'opening_sequence':
    case 'resource_at_cast':
    case 'proc_wasted':
    case 'filler_in_buff':
    case 'spend_at_stacks': return [];
  }
}

export function rulesNeed(rules: RulebookRule[], stream: RuleStream): boolean {
  return rules.some(rule => streamsFor(rule.condition).includes(stream));
}

/** A deployed rulebook file can still carry a rule with no condition, which the engine has nothing to judge. */
export function judgeableRules(rules: RulebookRule[]): RulebookRule[] {
  return rules.filter(rule => rule.condition != null);
}

/** Exhaustive, so a new kind must state where its magnitude comes from rather than silently defaulting to none. */
export function measureRule(cond: RuleCondition, ctx: RuleContext): number | null {
  switch (cond.kind) {
    case 'cast_without_prior': {
      // The widest lead the parse actually needed, so the window covers how loosely the field pairs them.
      const leads = leadPerCast(cond, ctx.castTimes).filter((lead): lead is number => lead != null);
      return leads.length ? Math.max(...leads) : null;
    }
    case 'hold_cooldown_for_anchor': {
      // The closest the parse came to spending before an anchor, which is the gap it kept clear.
      const anchors = holdAnchors(cond, ctx.castTimes);
      const gaps = anchors.flatMap(anchorTime => cond.spell_ids
        .flatMap(spellId => ctx.castTimes[spellId] ?? [])
        .filter(castTime => castTime < anchorTime)
        .map(castTime => anchorTime - castTime));
      return gaps.length ? Math.min(...gaps) : null;
    }
    case 'aura_uptime_below': {
      const pct = uptimePct(cond, ctx);
      return pct > 0 ? pct : null;
    }
    case 'opening_sequence': {
      // Measured against the whole pull, since the window being derived cannot gate its own measurement.
      const progress = openerProgress(cond, ctx, ctx.fightDurationS);
      return progress?.completedS ?? null;
    }
    case 'cast_at_target_count': {
      const counts = targetCountsPerCast(cond, ctx).map(entry => entry.targets);
      return counts.length ? median(counts) ?? null : null;
    }
    case 'resource_at_cast': {
      const fracs = resourceFractionPerCast(cond, ctx).map(entry => entry.frac);
      return fracs.length ? median(fracs) ?? null : null;
    }
    case 'filler_in_buff': return fillerShare(fillerCastsInBuff(cond, ctx));
    case 'spend_at_stacks': {
      // The cheapest spend the parse allowed, not its typical one: a median would put half the field's own casts on the wrong side of the bar.
      const counts = stackCountsPerCast(cond, ctx).map(entry => entry.stacks);
      if (!counts.length) return null;
      return cond.bound === 'min' ? Math.min(...counts) : Math.max(...counts);
    }
    case 'aura_clipped': {
      // The earliest the parse re-applied, which is the same forgiving extreme read from the other end.
      const elapsed = elapsedAtRefresh(cond, ctx).map(entry => entry.elapsedS);
      return elapsed.length ? Math.min(...elapsed) : null;
    }
    case 'filler_below_health': return fillerShare(fillersBelowHealth(cond, ctx));
    case 'cast_outside_buff':
    case 'proc_wasted': return null;
  }
}

/** Whether the encounter has to supply this kind's magnitude before it can judge anything. */
function needsThreshold(cond: RuleCondition): boolean {
  switch (cond.kind) {
    case 'cast_without_prior':
    case 'hold_cooldown_for_anchor':
    case 'aura_uptime_below':
    case 'opening_sequence':
    case 'cast_at_target_count':
    case 'resource_at_cast':
    case 'filler_in_buff':
    case 'spend_at_stacks':
    case 'aura_clipped':
    case 'filler_below_health': return true;
    case 'cast_outside_buff':
    case 'proc_wasted': return false;
  }
}

/** Null when too few parses could supply a magnitude, so a thin sample never sets the bar. */
export function ruleThreshold(
  samples: (number | null)[], parseCount: number,
): { threshold: RuleThreshold | null; sample_count: number } {
  const measured = samples.filter((sample): sample is number => sample != null);
  if (!measured.length || measured.length < parseCount * THRESHOLD_SAMPLE_FRAC) {
    return { threshold: null, sample_count: measured.length };
  }
  const value = median(measured) ?? 0;
  const band = Math.max(deviation(measured) ?? 0, Math.abs(value) * THRESHOLD_BAND_MIN_FRAC);
  return { threshold: { value, band }, sample_count: measured.length };
}

export function benchedRules(benched: BenchedRule[]): BenchedRule[] {
  return benched.filter(entry => entry.rule.condition != null
    && (!needsThreshold(entry.rule.condition) || entry.threshold != null));
}

export function evaluateCondition(
  cond: RuleCondition, ctx: RuleContext, threshold: RuleThreshold | null, severity: Severity, remedy?: string,
): AnalysisFinding | null {
  switch (cond.kind) {
    case 'cast_outside_buff': return evaluateCastOutsideBuff(cond, ctx, severity, remedy);
    case 'proc_wasted': return evaluateProcWasted(cond, ctx, severity, remedy);
    case 'cast_without_prior':
      return threshold && evaluateCastWithoutPrior(cond, ctx, threshold, severity, remedy);
    case 'hold_cooldown_for_anchor':
      return threshold && evaluateHoldForAnchor(cond, ctx, threshold, severity, remedy);
    case 'aura_uptime_below':
      return threshold && evaluateAuraUptimeBelow(cond, ctx, threshold, severity, remedy);
    case 'opening_sequence':
      return threshold && evaluateOpeningSequence(cond, ctx, threshold, severity, remedy);
    case 'cast_at_target_count':
      return threshold && evaluateCastAtTargetCount(cond, ctx, threshold, severity, remedy);
    case 'resource_at_cast':
      return threshold && evaluateResourceAtCast(cond, ctx, threshold, severity, remedy);
    case 'filler_in_buff':
      return threshold && evaluateFillerInBuff(cond, ctx, threshold, severity, remedy);
    case 'spend_at_stacks':
      return threshold && evaluateSpendAtStacks(cond, ctx, threshold, severity, remedy);
    case 'aura_clipped':
      return threshold && evaluateAuraClipped(cond, ctx, threshold, severity, remedy);
    case 'filler_below_health':
      return threshold && evaluateFillerBelowHealth(cond, ctx, threshold, severity, remedy);
  }
}

/** Whether the pull gave the player any chance to break the rule; without this a rule reads as followed on a fight it never came up in. */
export function ruleApplicable(cond: RuleCondition, ctx: RuleContext): boolean {
  const castCount = (spellId: number) => ctx.castTimes[spellId]?.length ?? 0;
  switch (cond.kind) {
    case 'cast_without_prior': return castCount(cond.spell_id) > 0;
    case 'hold_cooldown_for_anchor':
      return holdAnchors(cond, ctx.castTimes).length > 0 && cond.spell_ids.some(spellId => castCount(spellId) > 0);
    case 'cast_outside_buff': return castCount(cond.spell_id) > 0;
    case 'aura_uptime_below': return uptimePct(cond, ctx) > 0;
    case 'opening_sequence': return cond.spell_ids.some(spellId => castCount(spellId) > 0);
    case 'cast_at_target_count': return targetCountsPerCast(cond, ctx).length > 0;
    case 'resource_at_cast': return resourceFractionPerCast(cond, ctx).length > 0;
    case 'proc_wasted': return closedProcSpans(cond, ctx).length > 0;
    case 'filler_in_buff': return fillerCastsInBuff(cond, ctx).total > 0;
    case 'spend_at_stacks': return stackCountsPerCast(cond, ctx).length > 0;
    case 'aura_clipped': return elapsedAtRefresh(cond, ctx).length > 0;
    case 'filler_below_health': return fillersBelowHealth(cond, ctx).total > 0;
  }
}

export function evaluateRules(benched: BenchedRule[], ctx: RuleContext): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  for (const { rule, threshold } of benched) {
    // The gate rulesFollowed uses, so a rule the pull never tested lands in neither state instead of reading as broken.
    if (!ruleApplicable(rule.condition, ctx)) continue;
    const finding = evaluateCondition(rule.condition, ctx, threshold, rule.severity, rule.action);
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
    case 'filler_in_buff': return `${cond.spell_name} in ${cond.buff_spell_name}`;
    case 'spend_at_stacks': return `${cond.spell_name} at ${cond.buff_spell_name}`;
    case 'aura_clipped': return `${cond.aura_spell_name} clipped`;
    case 'filler_below_health': return `${cond.spell_name} under ${cond.health_pct}% health`;
  }
}

export function rulesFollowed(benched: BenchedRule[], ctx: RuleContext): string[] {
  const followed: string[] = [];
  for (const { rule, threshold } of benched) {
    const cond = rule.condition;
    if (!ruleApplicable(cond, ctx)) continue;
    if (!evaluateCondition(cond, ctx, threshold, rule.severity)) {
      followed.push(ruleLabel(cond, rule.description));
    }
  }
  return followed;
}
