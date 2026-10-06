import { Injectable, inject } from '@angular/core';
import { TRINKET_SLOTS } from '../../../gear/gear-extract-service';
import type { PlanItem, PlanSpell } from '../../../plan/plan.models';
import { SpellDumpService } from '../../../simc/spell-dump-service';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, GearPiece, Range } from '../priority-list.models';
import { CooldownFacts } from './cooldown-facts';

const COOLDOWN = 'cooldown.';
const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
/** What the list knows of an item's use, from SimC's item data baked at ingest for the trinkets the top logs wore. */
const KNOWN: Record<string, ((item: PlanItem, use: PlanSpell | undefined) => Range) | undefined> = {
  has_use_buff: item => flag(item.use_buff),
  has_use_damage: item => flag(item.use_damage),
  has_cooldown: (_, use) => flag(!!use?.cooldown),
  cast_time: (_, use) => (use ? [use.cast_time, use.cast_time] : UNKNOWN),
};

/** What the player wore and brought, from the combatant info with the names the report fills in, and what the list knows each trinket's use does. */
@Injectable({ providedIn: 'root' })
export class GearFacts implements FactReader {
  private readonly dumps = inject(SpellDumpService);
  private readonly cooldowns = inject(CooldownFacts);
  readonly kind = 'gear';

  streams(): FactStream[] {
    return ['gear'];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (path.field === 'potion') return ctx.castTimes(path.subject).length ? [1, 1] : UNKNOWN;
    if (!ctx.gear.length) return UNKNOWN;
    if (path.field === 'equipped') return flag(ctx.gear.some(piece => this.named(piece, path.subject, ctx)));
    const piece = this.piece(path, ctx);
    if (!piece) return UNKNOWN;
    if (path.field === 'is') return flag(this.named(piece, path.subject, ctx));
    if (path.field === 'ilvl') return piece.itemLevel ? [piece.itemLevel, piece.itemLevel] : UNKNOWN;
    return this.known(path, moment, ctx, piece);
  }

  /** A trinket's use reads as any button's: its cooldown is rebuilt from the casts of its use spell. */
  private known(path: FactPath, moment: CastMoment, ctx: FactContext, piece: GearPiece): Range {
    const item = Object.values(ctx.list.items ?? {}).find(entry => entry.id === piece.id);
    if (!item) return UNKNOWN;
    const use = item.use ? ctx.list.spells[item.use] : undefined;
    if (!path.field.startsWith(COOLDOWN)) return KNOWN[path.field]?.(item, use) ?? UNKNOWN;
    return item.use ? this.cooldowns.read({ ...path, kind: 'cooldown', subject: item.use, field: path.field.slice(COOLDOWN.length) }, moment, ctx) : UNKNOWN;
  }

  /** An item's name tokenized the way SimC writes it, or the list's own entry for the token. */
  private named(piece: GearPiece, token: string, ctx: FactContext): boolean {
    return this.dumps.tokenize(piece.name) === token || ctx.list.items?.[token]?.id === piece.id;
  }

  /** `trinket.1` and `trinket.2` are the two slots, `trinket.<name>` whichever holds the item; `this_trinket` depends on the line SimC is on, so it names none. */
  private piece(path: FactPath, ctx: FactContext): GearPiece | null {
    const slot = TRINKET_SLOTS[path.n - 1];
    if (slot !== undefined) return ctx.gear.find(piece => piece.slot === slot) ?? null;
    return ctx.gear.find(piece => (TRINKET_SLOTS as readonly number[]).includes(piece.slot) && this.named(piece, path.subject, ctx)) ?? null;
  }
}
