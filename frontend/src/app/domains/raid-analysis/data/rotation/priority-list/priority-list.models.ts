import type { PriorityList } from '../../plan/plan.models';
import type { TimedEvent } from '../../analysis/wcl-projections-service';
import type { AuraSpan, AuraSpansByTarget, StackTimeline } from '../../analysis/aura-windows-service';

/** A fact's value as the log bounds it: a point where the log states it, a span where it only narrows it, everything where it cannot say. */
export type Range = readonly [lo: number, hi: number];

export const UNKNOWN: Range = [-Infinity, Infinity];

export type Truth = 'true' | 'false' | 'unknown';

/** What a list's facts read beyond the always-fetched casts, buffs and combatant info. `targetHealth` asks for the damage rows' heavier resource-bearing form. */
export type FactStream = 'enemyAuras' | 'damage' | 'targetHealth' | 'resources';

/** Damage rows as `[atS, targetKey]`, time-ordered so a window is a slice rather than a scan. */
export type DamageRow = readonly [number, string];

/** One enemy's health as `[atS, share of max]`, time-ordered. */
export type HealthRow = readonly [number, number];

/** One cast's pool as `[atS, amount before the cost, amount the cast left behind, max, the cast's index]`, in the game's own units, time-ordered. */
export type ResourceRow = readonly [number, number, number, number, number];

/** One change to a pool between casts, `[atS, amount]`, in the game's own units: a gain past the cap counts only up to it, a drain is negative. */
export type ResourceChange = readonly [number, number];

/** The moment a line is read at: a cast of the player's, with the enemy it was aimed at. */
export interface CastMoment {
  atS: number;
  event: TimedEvent;
  /** The cast's place in the context's `casts`, so the casts before it are a slice. */
  index: number;
  /** The enemy's damage-index key; the last enemy the player aimed at for a cast with none, null before the first. */
  target: string | null;
}

/** Everything one log says that a list's facts read, each index built on first use. */
export interface FactContext {
  list: PriorityList;
  fightDurationS: number;
  /** A wipe never shows when the boss would have died, so the fight's end bounds the clock only from below. */
  kill: boolean;
  /** Completed casts, time-ordered. */
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
  resourcePool: (resourceType: number) => readonly ResourceRow[];
  resourceChanges: (resourceType: number) => readonly ResourceChange[];
  /** The global cooldown a cast id spends by the list's spell data, null for an id the list never names. */
  gcd: (spellId: number) => number | null;
  /** Observed cast time over the base one, `[atS, factor]`, from every hardcast the list's spell data times. */
  hasteFactors: () => readonly (readonly [number, number])[];
}

export interface FactReader {
  readonly streams: readonly FactStream[];
  matches(name: string): boolean;
  /** `action` is the line's button, which a bare name like `refreshable` or `cast_time` reads. */
  read(name: string, moment: CastMoment, action: string, ctx: FactContext): Range;
}
