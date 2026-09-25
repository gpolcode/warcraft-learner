import type { PriorityList } from '../../plan/plan.models';
import type { TimedEvent } from '../../analysis/wcl-projections-service';
import type { AuraSpan, AuraSpansByTarget, StackTimeline } from '../../analysis/aura-windows-service';

/** A fact's value as the log bounds it: a point where the log states it, a span where it only narrows it, everything where it cannot say. */
export type Range = readonly [lo: number, hi: number];

export const UNKNOWN: Range = [-Infinity, Infinity];

export type Truth = 'true' | 'false' | 'unknown';

/** `targetHealth` asks for the damage rows' heavier resource-bearing form. */
export type FactStream = 'enemyAuras' | 'damage' | 'targetHealth' | 'resources';

/** Time-ordered, so a window is a slice rather than a scan. */
export type DamageRow = readonly [atS: number, target: string];

export type HealthRow = readonly [atS: number, share: number];

/** In the game's own units. */
export type ResourceRow = readonly [atS: number, before: number, left: number, max: number, castIndex: number];

/** A gain past the cap counts only up to it; a drain is negative. */
export type ResourceChange = readonly [atS: number, amount: number];

export type AddSpan = readonly [startS: number, endS: number];

export interface CastMoment {
  atS: number;
  event: TimedEvent;
  /** The cast's place in the context's `casts`, so the casts before it are a slice. */
  index: number;
  target: string | null;
  variables?: ReadonlyMap<string, Range>;
}

export interface FactContext {
  list: PriorityList;
  fightDurationS: number;
  kill: boolean;
  casts: readonly TimedEvent[];
  begincasts: readonly TimedEvent[];
  /** Picked talent entries and their ranks; null for a log with no talent tree. */
  talents: ReadonlyMap<number, number> | null;
  /** Every id the list's name holds, since a cast under any of them is the same button. */
  castIds: (token: string) => ReadonlySet<number>;
  castTimes: (token: string) => readonly number[];
  /** The aura id this log shows most for the name, so a same-named passive never stands in for the buff; null when it shows none. */
  auraId: (token: string, on: 'self' | 'target') => number | null;
  selfSpans: (spellId: number) => readonly AuraSpan[];
  selfStacks: (spellId: number) => StackTimeline;
  targetSpans: (spellId: number) => AuraSpansByTarget;
  targetStacks: (spellId: number, target: string) => StackTimeline;
  damageIndex: () => readonly DamageRow[];
  targetHealth: (target: string) => readonly HealthRow[];
  /** Null when the log carries no enemy health to tell adds from the boss. */
  addSpans: () => readonly AddSpan[] | null;
  resourcePool: (resourceType: number) => readonly ResourceRow[];
  resourceChanges: (resourceType: number) => readonly ResourceChange[];
  /** The global cooldown a cast id spends by the list's spell data, null for an id the list never names. */
  gcd: (spellId: number) => number | null;
  /** Observed cast time over the base one, from every hardcast the list's spell data times. */
  hasteFactors: () => readonly (readonly [atS: number, factor: number])[];
}

export interface FactReader {
  readonly streams: readonly FactStream[];
  matches(name: string): boolean;
  /** `action` is the line's button, which a bare name like `refreshable` or `cast_time` reads. */
  read(name: string, moment: CastMoment, action: string, ctx: FactContext): Range;
}
