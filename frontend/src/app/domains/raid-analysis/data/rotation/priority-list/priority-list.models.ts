import type { PriorityList } from '../../plan/plan.models';
import type { TimedEvent } from '../../analysis/wcl-projections-service';
import type { AuraSpan, AuraSpansByTarget, StackTimeline } from '../../analysis/aura-windows-service';

/** A fact's value as the log bounds it: a point where the log states it, a span where it only narrows it, everything where it cannot say. */
export type Range = readonly [lo: number, hi: number];

export const UNKNOWN: Range = [-Infinity, Infinity];

export type Truth = 'true' | 'false' | 'unknown';

/** The `damage` rows carry each hit target's health, so a fact reading target health asks for `damage`. */
export type FactStream = 'enemyAuras' | 'damage' | 'resources' | 'gear';

/** Time-ordered, so a window is a slice rather than a scan. */
export type DamageRow = readonly [atS: number, target: string];

export type HealthRow = readonly [atS: number, share: number];

/** In the game's own units. */
export type ResourceRow = readonly [atS: number, before: number, left: number, max: number, castIndex: number];

/** A gain past the cap counts only up to it; a drain is negative. */
export type ResourceChange = readonly [atS: number, amount: number];

export type AddSpan = readonly [startS: number, endS: number];

/** `slot` is the index in WCL's gear array, which is positional. */
export interface GearPiece {
  slot: number;
  id: number;
  name: string;
  itemLevel: number;
}

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
  gear: readonly GearPiece[];
  /** Every id the list's name holds, or the report names it with where the spell data lacks it, since a cast under any is the same button. */
  castIds: (token: string) => ReadonlySet<number>;
  castTimes: (token: string) => readonly number[];
  /** When each hit of the name landed, ticks aside, so a projectile reads as in the air until its first. */
  landings: (token: string) => readonly number[];
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

/** The button that summons a pet is named for the pet itself or with one of these. */
export const SUMMON_PREFIXES = ['', 'summon_', 'invoke_'];

export type FactKind = 'aura' | 'cooldown' | 'pool' | 'press' | 'fight' | 'build' | 'gear';

export interface FactPath {
  kind: FactKind;
  /** The spell, pool, talent or variable the field is read of; the line's own button for a bare field. */
  subject: string;
  field: string;
  target: boolean;
  /** The number in the name: 2 for `prev_gcd.2.x`, the slot for `trinket.1.x`, 0 for a gear name with no slot, else 1. */
  n: number;
}

/** `left` is time left on something up, `away` time until something is back; a flag shows its two states, the rest a number with a unit. */
export type Frame = 'flag' | 'left' | 'away' | 'count' | 'percent' | 'seconds' | 'amount';

/** `words` are a flag's `on|off` states, else a label with `{x}` for the subject; `is` derives the field as SimC text or a constant; a row with neither `is` nor a reader is deliberate: its sentence reads, its value stays unknown. */
export type FieldRow = readonly [frame: Frame, words: string, is?: string | number];

export interface FactReader {
  readonly kind: FactKind;
  streams(path: FactPath): readonly FactStream[];
  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range;
}
