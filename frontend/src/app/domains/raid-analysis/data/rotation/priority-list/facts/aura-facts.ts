import { Injectable, inject } from '@angular/core';
import { AuraWindowsService, AuraSpan, StackTimeline } from '../../../analysis/aura-windows-service';
import type { PlanSpell } from '../../../plan/plan.models';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, Range } from '../priority-list.models';

/** The log stamps what a cast applies, refreshes or consumes up to a few ms ahead of the cast itself: Envenom's own buff 1 ms, the Stealth a Garrote breaks 13 ms. */
export const CAST_EFFECTS_LEAD_S = 0.02;
/** WCL stamps events to the millisecond. */
const LOG_TICK_S = 0.001;
/** What an aura the player cannot have reads as; its other fields stay unknown. */
const ABSENT: Record<string, Range | undefined> = { up: [0, 0], remains: [0, 0], stack: [0, 0], active_dots: [0, 0] };
const STATED: Record<string, ((spell: PlanSpell | undefined) => number | undefined) | undefined> = { duration: spell => spell?.duration, max_stack: spell => spell?.max_stacks };

/** Up going INTO a cast: an aura the cast itself applies is not up for it, one the cast consumes is. */
interface AuraAt {
  appliedS: number;
  /** When the aura finally dropped; null when it outlived the log. */
  endS: number | null;
}

interface Reading {
  spans: readonly AuraSpan[];
  aura: AuraAt | null;
  readS: number;
  moment: CastMoment;
  stacks: () => StackTimeline;
  duration: number;
  maxStacks: number;
}

const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);

@Injectable({ providedIn: 'root' })
export class AuraFacts implements FactReader {
  private readonly auraWindows = inject(AuraWindowsService);
  readonly kind = 'aura';
  private readonly fields: Record<string, ((reading: Reading, ctx: FactContext) => Range) | undefined> = {
    up: ({ aura }) => flag(!!aura),
    remains: ({ aura, duration, moment }, ctx) => this.remains(aura, duration, moment.atS, ctx.fightDurationS),
    stack: ({ stacks, aura, maxStacks, readS }) => this.stacks(stacks(), !!aura, maxStacks, readS),
    last_trigger: ({ spans, readS, moment }) => {
      const last = spans.filter(span => span.startS < readS).pop();
      return last ? [moment.atS - last.startS, moment.atS - last.startS] : UNKNOWN;
    },
  };

  streams({ target }: FactPath): FactStream[] {
    return target ? ['enemyAuras', 'damage'] : [];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    const spell = ctx.list.spells[path.subject];
    const stated = STATED[path.field];
    if (stated) return this.stated(stated(spell));
    const id = ctx.auraId(path.subject, path.target ? 'target' : 'self');
    if (id !== null) return this.logged(path, moment, ctx, id, spell);
    return this.untaken(path.subject, ctx) ? ABSENT[path.field] ?? UNKNOWN : UNKNOWN;
  }

  /** The spell data writes 0 where it states no duration or cap, so 0 reads as unknown, not as none. */
  private stated(value: number | undefined): Range {
    return value ? [value, value] : UNKNOWN;
  }

  private logged(path: FactPath, moment: CastMoment, ctx: FactContext, id: number, spell: PlanSpell | undefined): Range {
    const readS = this.readS(moment, ctx);
    if (path.field === 'active_dots') return this.stated([...ctx.targetSpans(id).values()].filter(spans => this.auraAt(spans, readS)).length);
    const on = this.on(path, moment, ctx, id);
    if (!on) return UNKNOWN;
    const reading: Reading = { ...on, aura: this.auraAt(on.spans, readS), readS, moment, duration: spell?.duration ?? 0, maxStacks: spell?.max_stacks ?? 0 };
    return this.fields[path.field]?.(reading, ctx) ?? UNKNOWN;
  }

  private on(path: FactPath, { target }: CastMoment, ctx: FactContext, id: number): Pick<Reading, 'spans' | 'stacks'> | null {
    if (!path.target) return { spans: ctx.selfSpans(id), stacks: () => ctx.selfStacks(id) };
    return target === null ? null : { spans: ctx.targetSpans(id).get(target) ?? [], stacks: () => ctx.targetStacks(id, target) };
  }

  /** SimC tracks some auras no game aura backs (`buff.roll_the_bones`), so one the log never shows is unknown rather than down, unless only an untaken talent grants it. */
  private untaken(token: string, ctx: FactContext): boolean {
    const talent = ctx.list.talents[`talent.${token}`];
    const picked = ctx.talents;
    return !!talent && !!picked && talent.entries.every(entry => !picked.get(entry));
  }

  /** The instant whose auras a cast was pressed into: before its own effects, yet after an earlier press's, which a macro can fire inside the lead. */
  private readS({ atS, index }: CastMoment, ctx: FactContext): number {
    let earlier = index - 1;
    while ((ctx.casts[earlier]?.atS ?? -Infinity) >= atS) earlier--;
    return Math.max(atS - CAST_EFFECTS_LEAD_S, (ctx.casts[earlier]?.atS ?? -Infinity) + LOG_TICK_S);
  }

  /** A refresh ends one span and starts the next, so the aura ends where the last span of the chain does. */
  private auraAt(spans: readonly AuraSpan[], atS: number): AuraAt | null {
    const index = spans.findIndex(span => span.startS < atS && (span.endS == null || atS <= span.endS));
    const current = spans[index];
    if (!current) return null;
    let last = current;
    for (const next of spans.slice(index + 1)) {
      if (!last.endedByRefresh) break;
      last = next;
    }
    return { appliedS: current.startS, endS: last.endS };
  }

  /** The log shows when the aura dropped and the spell data when it was due to; a consumed or extended aura sits between the two. */
  private remains(aura: AuraAt | null, duration: number, atS: number, fightEndS: number): Range {
    if (!aura) return [0, 0];
    const actual: Range = aura.endS == null ? [fightEndS - atS, Infinity] : [aura.endS - atS, aura.endS - atS];
    if (!duration) return actual;
    const due = aura.appliedS + duration - atS;
    return [Math.min(actual[0], due), Math.max(actual[1], due)];
  }

  /** A timeline that starts mid-aura knows nothing before its first event, so an up aura then holds anywhere from one stack to its cap. */
  private stacks(timeline: StackTimeline, up: boolean, maxStacks: number, atS: number): Range {
    if (!up) return [0, 0];
    const count = this.auraWindows.stacksAt(timeline, atS);
    if (count === null || count === 0) return [1, maxStacks || Infinity];
    return [count, count];
  }
}
