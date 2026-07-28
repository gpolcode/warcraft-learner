import { WclEvent } from '../../core/models/wcl.models';
import { getOrInsert } from './analysis-math';

/** Map<spell_id, [[startMs, endMs | null], ...]> in fight-relative milliseconds. An open end means the aura outlived the fight. */
export type AuraWindows = Map<number, [number, number | null][]>;

/** Builds spans from an apply/remove stream; handles buffs and debuffs, so one call covers `Buffs` or `Debuffs` events. */
export function buildAuraWindows(events: WclEvent[], fightStartMs: number): AuraWindows {
  const windows: AuraWindows = new Map();
  for (const event of events) {
    const spellId = event.abilityGameID;
    if (spellId == null) continue;
    const timeMs = event.timestamp - fightStartMs;
    if (event.type === 'applybuff' || event.type === 'applydebuff') {
      getOrInsert(windows, spellId, () => []).push([timeMs, null]);
    } else if (event.type === 'removebuff' || event.type === 'removedebuff') {
      const spans = windows.get(spellId) ?? [];
      for (let i = spans.length - 1; i >= 0; i--) {
        if (spans[i][1] == null) { spans[i][1] = timeMs; break; }
      }
    }
  }
  return windows;
}

/** End-inclusive: a consuming cast shares the removal millisecond 38% of the time, so excluding it misreads correct play. */
export function isInsideAura(windows: AuraWindows, spellId: number, timeMs: number): boolean {
  return (windows.get(spellId) ?? []).some(([start, end]) => timeMs >= start && (end == null || timeMs <= end));
}

/** Map<spell_id, [[atMs, stacks], ...]> in fight-relative milliseconds, ordered, recording every change to the count. */
export type AuraStacks = Map<number, [number, number][]>;

/** A bare apply carries no count and means one; every stack event carries the new total. */
export function buildAuraStacks(events: WclEvent[], fightStartMs: number): AuraStacks {
  const stacks: AuraStacks = new Map();
  for (const event of events) {
    const spellId = event.abilityGameID;
    if (spellId == null) continue;
    const timeMs = event.timestamp - fightStartMs;
    const at = (count: number) => getOrInsert(stacks, spellId, () => []).push([timeMs, count]);
    if (event.type === 'applybuff' || event.type === 'applydebuff') at(event.stack ?? 1);
    else if (event.type.endsWith('buffstack') || event.type.endsWith('debuffstack')) at(event.stack ?? 0);
    else if (event.type === 'removebuff' || event.type === 'removedebuff') at(0);
  }
  return stacks;
}

/** The count in force going INTO that moment: WCL logs a consuming cast and the stack it spends on one timestamp, so a same-millisecond change belongs to the cast rather than preceding it. */
export function stacksAt(stacks: AuraStacks, spellId: number, timeMs: number): number {
  let count = 0;
  for (const [at, value] of stacks.get(spellId) ?? []) {
    if (at >= timeMs) break;
    count = value;
  }
  return count;
}

/** Half-open on the opening edge: the cast that grants a state shares its applybuff timestamp, and it was cast to enter the state rather than under it. */
export function isUnderAura(windows: AuraWindows, spellId: number, timeMs: number): boolean {
  return (windows.get(spellId) ?? []).some(([start, end]) => timeMs > start && (end == null || timeMs <= end));
}

/** One unbroken application on one target. `endedByRefresh` separates a re-application from an expiry, which read the same in the stream. */
export interface AuraSpan {
  startMs: number;
  endMs: number | null;
  endedByRefresh: boolean;
}

/** Map<spell_id, Map<`targetID:targetInstance`, spans>>, since a clip is only visible per target. */
export type TargetedAuraSpans = Map<number, Map<string, AuraSpan[]>>;

/** Keyed per target because copies of one NPC share a targetID and only the instance separates them. */
export function buildTargetedAuraSpans(events: WclEvent[], fightStartMs: number): TargetedAuraSpans {
  const spans: TargetedAuraSpans = new Map();
  for (const event of events) {
    const spellId = event.abilityGameID;
    if (spellId == null) continue;
    const timeMs = event.timestamp - fightStartMs;
    const perTarget = getOrInsert(spans, spellId, () => new Map<string, AuraSpan[]>());
    const list = getOrInsert(perTarget, `${event.targetID ?? 0}:${event.targetInstance ?? 0}`, () => []);
    const open = list.length && list[list.length - 1].endMs == null ? list[list.length - 1] : null;
    if (event.type === 'applybuff' || event.type === 'applydebuff') {
      if (!open) list.push({ startMs: timeMs, endMs: null, endedByRefresh: false });
    } else if (event.type === 'refreshbuff' || event.type === 'refreshdebuff') {
      if (open) { open.endMs = timeMs; open.endedByRefresh = true; }
      list.push({ startMs: timeMs, endMs: null, endedByRefresh: false });
    } else if (event.type === 'removebuff' || event.type === 'removedebuff') {
      if (open) open.endMs = timeMs;
    }
  }
  return spans;
}

/** Percentage of the fight the aura was up. Overlapping spans are merged, so multi-target debuffs read as "up somewhere", which is what a maintain rule means. */
export function auraUptimePct(windows: AuraWindows, spellId: number, fightDurationMs: number): number {
  if (fightDurationMs <= 0) return 0;
  const spans = (windows.get(spellId) ?? [])
    .map(([start, end]): [number, number] => [Math.max(0, start), Math.min(fightDurationMs, end ?? fightDurationMs)])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);
  let covered = 0;
  let cursor = -1;
  for (const [start, end] of spans) {
    const from = Math.max(start, cursor);
    if (end > from) { covered += end - from; cursor = end; }
  }
  return (covered / fightDurationMs) * 100;
}
