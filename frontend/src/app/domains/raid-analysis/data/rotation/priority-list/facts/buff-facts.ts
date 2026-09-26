import { Injectable, inject } from '@angular/core';
import type { PlanSpell } from '../../../plan/plan.models';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';
import { AuraAt, AuraReadingService } from './aura-reading-service';

const BUFF = /^buff\.(\w+)\.(up|down|react|stack|remains|duration|max_stack|at_max_stacks)$/;

@Injectable({ providedIn: 'root' })
export class BuffFacts implements FactReader {
  private readonly auras = inject(AuraReadingService);
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return BUFF.test(name);
  }

  read(name: string, { atS }: CastMoment, _action: string, ctx: FactContext): Range {
    const [, token = '', field = ''] = BUFF.exec(name) ?? [];
    const spell = ctx.list.spells[token];
    const id = ctx.auraId(token, 'self');
    // SimC tracks some buffs no game aura backs (`buff.roll_the_bones`), so one the log never shows is unknown rather than down.
    return this.spellData(field, spell) ?? (id === null ? UNKNOWN : this.logged(field, id, spell, atS, ctx));
  }

  private logged(field: string, id: number, spell: PlanSpell | undefined, atS: number, ctx: FactContext): Range {
    const aura = this.auras.auraAt(ctx.selfSpans(id), atS);
    if (field === 'up' || field === 'down') return (field === 'up') === !!aura ? [1, 1] : [0, 0];
    if (field === 'remains') return this.auras.remains(aura, spell?.duration ?? 0, atS, ctx.fightDurationS);
    return this.stackField(field, this.stacks(ctx, id, aura, spell, atS), spell?.max_stacks ?? 0);
  }

  private spellData(field: string, spell: PlanSpell | undefined): Range | null {
    const value = field === 'duration' ? spell?.duration : field === 'max_stack' ? spell?.max_stacks : null;
    if (value === null) return null;
    return value ? [value, value] : UNKNOWN;
  }

  private stacks(ctx: FactContext, id: number, aura: AuraAt | null, spell: PlanSpell | undefined, atS: number): Range {
    return this.auras.stacks(ctx.selfStacks(id), !!aura, spell?.max_stacks ?? 0, atS);
  }

  /** `react` counts stacks, so a flag reads it as up and a comparison as a count. */
  private stackField(field: string, [lo, hi]: Range, maxStacks: number): Range {
    if (field === 'react' || field === 'stack') return [lo, hi];
    if (!maxStacks) return UNKNOWN;
    return lo >= maxStacks ? [1, 1] : hi < maxStacks ? [0, 0] : [0, 1];
  }
}
