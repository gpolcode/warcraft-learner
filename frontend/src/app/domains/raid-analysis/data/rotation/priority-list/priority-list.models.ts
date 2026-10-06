import type { PriorityList } from '../../plan/plan.models';
import type { TimedEvent } from '../../analysis/wcl-projections-service';
import type { AuraSpan, AuraSpansByTarget, StackTimeline } from '../../analysis/aura-windows-service';

/** A fact's value as the log bounds it: a point where the log states it, a span where it only narrows it, everything where it cannot say. */
export type Range = readonly [lo: number, hi: number];

export const UNKNOWN: Range = [-Infinity, Infinity];

/** A `pet.x` is out while the button that summons it lasts, named for the pet itself or with one of these. */
export const SUMMON_PREFIXES = ['', 'summon_', 'invoke_'];

export type Truth = 'true' | 'false' | 'unknown';

/** The `damage` rows carry each hit target's health, so a fact reading target health asks for `damage`. */
export type FactStream = 'enemyAuras' | 'damage' | 'resources' | 'gear';

/** The kinds of state a SimC name reads, one reader each: `buff.x.up` and `dot.x.remains` are both aura reads. */
export type FactKind = 'aura' | 'cooldown' | 'pool' | 'fight' | 'press' | 'gear' | 'build' | 'variable';

/** A SimC name as its own factories read it, `[target.] kind . subject . field`. */
export interface FactPath {
  /** Null for a name outside the catalog, which still phrases by its words and reads as unknown. */
  kind: FactKind | null;
  /** The spell, item, pool, talent, variable, event or trinket slot the name is about; '' for one about the fight itself. */
  subject: string;
  /** Set when `subject` is a spell token, so the plan can fetch its spell data. */
  spell: boolean;
  field: string;
  /** A trailing name the field compares against: the item of `trinket.1.is.x`, the stat of `has_buff.mastery`. */
  arg: string;
  /** Read on the cast's target, as `debuff.`, `dot.` and `target.` names are. */
  target: boolean;
  /** `prev_gcd.2`, `apex.3`, `time_to_pct_20`. */
  n: number;
}

export type Op = '<' | '<=' | '>' | '>=' | '=' | '!=';

/** The sentence shape a field's value takes: a flag holds or fails, the rest measure something in a unit. */
export type Frame = 'flag' | 'left' | 'away' | 'count' | 'percent' | 'seconds' | 'amount';

/** How a field reads in words, beside the noun the name is about. */
export interface FieldWords {
  frame: Frame;
  /** A flag's state, on then off: `['Up', 'Down']`. A measure carrying states reads as one when tested alone. */
  states?: readonly [string, string];
  /** The unit after a measure's number, `stacks` or `s left`; a function reads the subject's own words, as a pool's does. */
  unit?: string | ((subject: string) => string);
  /** What a measure is, said after the noun: `cast time`. */
  label?: string;
  /** The term's own sentence where the frame's reads badly; `holds` false names the negation. */
  flag?: (noun: string, holds: boolean, path: FactPath) => string;
  at?: (noun: string, op: Op, n: string, path: FactPath) => string;
}

export interface FieldRow<S> {
  /** The field over the reader's state; absent for a field no log answers, which reads as unknown yet keeps its words. */
  value?: (state: S, path: FactPath) => Range;
  /** Reads the spell data alone, so it answers even for an aura the log never shows. */
  data?: true;
  /** A function where the words depend on the path, as an aura's do on whose it is. */
  words: FieldWords | ((path: FactPath) => FieldWords);
}

/** Time-ordered, so a window is a slice rather than a scan. */
export type DamageRow = readonly [atS: number, target: string];

export type HealthRow = readonly [atS: number, share: number];

/** In the game's own units. */
export type ResourceRow = readonly [atS: number, before: number, left: number, max: number, castIndex: number];

/** A gain past the cap counts only up to it; a drain is negative. */
export type ResourceChange = readonly [atS: number, amount: number];

export type AddSpan = readonly [startS: number, endS: number, target: string];

/** One worn item, by the combatant info's slot. */
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

export interface FactReader {
  readonly kinds: readonly FactKind[];
  /** By field; a field outside them reads as unknown and phrases by its own words. */
  readonly fields: Readonly<Record<string, FieldRow<never> | undefined>>;
  streams(path: FactPath): readonly FactStream[];
  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range;
}
