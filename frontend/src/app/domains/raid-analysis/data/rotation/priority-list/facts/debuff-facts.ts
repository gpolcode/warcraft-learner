import { Injectable, inject } from '@angular/core';
import type { PlanSpell } from '../../../plan/plan.models';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';
import { AuraAt, AuraReadingService } from './aura-reading-service';

const DEBUFF = /^(?:target\.)?(?:dot|debuff)\.(\w+)\.(up|down|ticking|remains|refreshable|stack|react|duration|active_dots)$/;
const SPREAD = /^active_dot\.(\w+)$/;
/** A bare name reads the line's own button's aura: `refreshable` on a Rupture line is Rupture's. */
const OWN = /^(ticking|refreshable|remains|duration)$/;
/** A refresh inside the aura's last 30% keeps the remainder: the game's pandemic window, which SimC's `refreshable` reads. */
const PANDEMIC_PCT = 30;

@Injectable({ providedIn: 'root' })
export class DebuffFacts implements FactReader {
  private readonly auras = inject(AuraReadingService);
  readonly streams: FactStream[] = ['enemyAuras', 'damage'];

  matches(name: string): boolean {
    return DEBUFF.test(name) || SPREAD.test(name) || OWN.test(name);
  }

  read(name: string, moment: CastMoment, action: string, ctx: FactContext): Range {
    const [token, field] = this.parts(name, action);
    const spell = ctx.list.spells[token];
    if (!spell) return UNKNOWN;
    if (field === 'duration') return spell.duration ? [spell.duration, spell.duration] : UNKNOWN;
    const id = ctx.auraId(token, 'target');
    // As with buffs, an aura the log never shows may be SimC's own bookkeeping rather than a game debuff.
    if (id === null) return UNKNOWN;
    if (field === 'active_dots') return this.spread(ctx, id, moment.atS);
    if (!moment.target) return UNKNOWN;
    const aura = this.auras.auraAt(ctx.targetSpans(id).get(moment.target) ?? [], moment.atS);
    if (field === 'stack' || field === 'react') return this.auras.stacks(ctx.targetStacks(id, moment.target), !!aura, spell.max_stacks, moment.atS);
    return this.onTarget(field, aura, spell, moment.atS, ctx.fightDurationS);
  }

  private onTarget(field: string, aura: AuraAt | null, spell: PlanSpell, atS: number, fightEndS: number): Range {
    const remains = this.auras.remains(aura, spell.duration, atS, fightEndS);
    if (field === 'remains') return remains;
    if (field === 'refreshable') return this.refreshable(!!aura, remains, spell.duration);
    return (field === 'down') === !aura ? [1, 1] : [0, 0];
  }

  private parts(name: string, action: string): [string, string] {
    const [, token = '', field = ''] = DEBUFF.exec(name) ?? [];
    if (token) return [token, field];
    const spread = SPREAD.exec(name)?.[1];
    return spread ? [spread, 'active_dots'] : [action, name];
  }

  private spread(ctx: FactContext, id: number, atS: number): Range {
    const count = [...ctx.targetSpans(id).values()].filter(spans => this.auras.auraAt(spans, atS)).length;
    return [count, count];
  }

  private refreshable(up: boolean, [lo, hi]: Range, duration: number): Range {
    if (!up) return [1, 1];
    if (!duration) return UNKNOWN;
    const window = (duration * PANDEMIC_PCT) / 100;
    return hi < window ? [1, 1] : lo >= window ? [0, 0] : [0, 1];
  }
}
