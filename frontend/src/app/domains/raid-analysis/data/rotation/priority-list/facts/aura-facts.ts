import { Injectable, inject } from '@angular/core';
import type { PlanSpell } from '../../../plan/plan.models';
import type { AuraSpan } from '../../../analysis/aura-windows-service';
import { UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords, Range } from '../priority-list.models';
import { Words } from '../list-words';
import { AuraAt, AuraReadingService } from './aura-reading-service';

interface AuraState {
  aura: AuraAt | null;
  spell: PlanSpell | undefined;
  /** The aura's own time-ordered spans, for what happened before the moment. */
  spans: readonly AuraSpan[];
  atS: number;
  remains: () => Range;
  stacks: () => Range;
  /** The enemies the aura is on. */
  spread: () => Range;
}

/** A refresh inside the aura's last 30% keeps the remainder: the game's pandemic window, which SimC's `refreshable` reads. */
const PANDEMIC_PCT = 30;
const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const at = (value: number): Range => [value, value];
const stated = (value: number | undefined): Range => (value ? [value, value] : UNKNOWN);
const NONE: Range = [0, 0];

const UP: FieldWords = { frame: 'flag', states: ['Up', 'Down'] };
const DOWN: FieldWords = { frame: 'flag', states: ['Down', 'Up'] };
const ON_TARGET: FieldWords = { frame: 'flag', states: ['On the target', 'Not on the target'] };
const OFF_TARGET: FieldWords = { frame: 'flag', states: ['Not on the target', 'On the target'] };
/** A stack count tested alone reads as the aura being up. */
const STACKS: FieldWords = { frame: 'count', unit: 'stacks', states: UP.states };
const TARGET_STACKS: FieldWords = { ...STACKS, states: ON_TARGET.states };
const whose = (self: FieldWords, target: FieldWords) => (path: FactPath): FieldWords => (path.target ? target : self);
const since = (event: string): FieldWords => ({
  frame: 'seconds', unit: `s since ${event}`, at: (noun, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} since ${noun} last ${event}`,
});

const refreshable = (state: AuraState): Range => {
  if (!state.aura) return [1, 1];
  const duration = state.spell?.duration ?? 0;
  if (!duration) return UNKNOWN;
  const window = (duration * PANDEMIC_PCT) / 100;
  const [lo, hi] = state.remains();
  return hi < window ? [1, 1] : lo >= window ? [0, 0] : [0, 1];
};
const atMaxStacks = (state: AuraState): Range => {
  const cap = state.spell?.max_stacks ?? 0;
  const [lo, hi] = state.stacks();
  if (!cap) return UNKNOWN;
  return lo >= cap ? [1, 1] : hi < cap ? [0, 0] : [0, 1];
};
/** Seconds since the aura last did `edge`: `startS` for a trigger, `endS` for a drop. */
const sinceLast = (edge: 'startS' | 'endS') => (state: AuraState): Range => {
  const last = state.spans.flatMap(span => (span[edge] != null && span[edge] <= state.atS ? [span[edge]] : [])).pop();
  return last === undefined ? UNKNOWN : at(state.atS - last);
};

const FIELDS: Record<string, FieldRow<AuraState> | undefined> = {
  up: { value: state => flag(!!state.aura), words: whose(UP, ON_TARGET) },
  ticking: { value: state => flag(!!state.aura), words: ON_TARGET },
  down: { value: state => flag(!state.aura), words: whose(DOWN, OFF_TARGET) },
  stack: { value: state => state.stacks(), words: whose(STACKS, TARGET_STACKS) },
  remains: { value: state => state.remains(), words: { frame: 'left', label: 'time left' } },
  duration: { value: state => stated(state.spell?.duration), data: true, words: { frame: 'seconds', label: 'duration' } },
  max_stack: { value: state => stated(state.spell?.max_stacks), data: true, words: { frame: 'amount', label: 'stack cap', unit: 'stacks' } },
  at_max_stacks: { value: atMaxStacks, words: { frame: 'flag', states: ['At max stacks', 'Under max stacks'] } },
  refreshable: {
    value: refreshable,
    words: { frame: 'flag', states: ['Under 30% left', 'Over 30% left'], flag: (noun, holds) => (holds ? `once ${noun} is in its last 30%` : `while ${noun} has over 30% left`) },
  },
  active_dots: { value: state => state.spread(), words: { frame: 'count', unit: 'enemies', at: (noun, op, n) => `while ${noun} is on ${Words.bound(op, n)} enemies` } },
  last_trigger: { value: sinceLast('startS'), words: since('triggered') },
  last_expire: { value: sinceLast('endS'), words: since('dropped') },
  ticks_remain: { words: { frame: 'count', unit: 'ticks left' } },
  ticks: { words: { frame: 'count', unit: 'ticks' } },
  tick_time: { words: { frame: 'seconds', label: 'tick time' } },
  value: { words: { frame: 'amount', label: 'value' } },
  pmultiplier: { words: { frame: 'amount', label: 'snapshot' } },
};

/** A buff on the player, or a dot or debuff on the cast's target. */
@Injectable({ providedIn: 'root' })
export class AuraFacts implements FactReader {
  private readonly auras = inject(AuraReadingService);
  readonly kinds: FactKind[] = ['aura'];
  readonly fields = FIELDS;

  streams(path: FactPath): FactStream[] {
    return path.target ? ['enemyAuras', 'damage'] : [];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    const row = FIELDS[path.field];
    if (!row?.value) return UNKNOWN;
    const spell = ctx.list.spells[path.subject];
    const id = ctx.auraId(path.subject, path.target ? 'target' : 'self');
    if (id === null) return this.unlogged(row.value, row.data, path, spell, moment, ctx);
    if (path.target && path.field !== 'active_dots' && !moment.target) return UNKNOWN;
    return row.value(this.state(path, id, spell, moment, ctx), path);
  }

  /** SimC tracks some auras no game aura backs (`buff.roll_the_bones`), so one the log never shows is unknown rather than down, unless only an untaken talent grants it. */
  private unlogged(
    value: NonNullable<FieldRow<AuraState>['value']>, data: true | undefined, path: FactPath, spell: PlanSpell | undefined, moment: CastMoment, ctx: FactContext,
  ): Range {
    if (!data && !this.auras.untaken(path.subject, ctx)) return UNKNOWN;
    return value({ aura: null, spell, spans: [], atS: moment.atS, remains: () => NONE, stacks: () => NONE, spread: () => NONE }, path);
  }

  private state(path: FactPath, id: number, spell: PlanSpell | undefined, moment: CastMoment, ctx: FactContext): AuraState {
    const readS = this.auras.readS(moment, ctx);
    const target = moment.target ?? '';
    const spans = path.target ? ctx.targetSpans(id).get(target) ?? [] : ctx.selfSpans(id);
    const aura = this.auras.auraAt(spans, readS);
    return {
      aura, spell, spans, atS: moment.atS,
      remains: () => this.auras.remains(aura, spell?.duration ?? 0, moment.atS, ctx.fightDurationS),
      stacks: () => this.auras.stacks(path.target ? ctx.targetStacks(id, target) : ctx.selfStacks(id), !!aura, spell?.max_stacks ?? 0, readS),
      spread: () => at([...ctx.targetSpans(id).values()].filter(onOne => this.auras.auraAt(onOne, readS)).length),
    };
  }
}
