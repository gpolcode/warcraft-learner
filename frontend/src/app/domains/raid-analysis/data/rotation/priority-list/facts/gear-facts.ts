import { Injectable, inject } from '@angular/core';
import { TRINKET_SLOTS } from '../../../gear/gear-extract-service';
import type { PlanItem, PlanSpell } from '../../../plan/plan.models';
import { SpellDumpService } from '../../../simc/spell-dump-service';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, GearPiece, Range } from '../priority-list.models';
import { CooldownFacts } from './cooldown-facts';

const COOLDOWN = 'cooldown.';
const FIELDS = new Set(['potion', 'equipped', 'is', 'ilvl']);
const flag = (holds: boolean | null): Range => (holds === null ? UNKNOWN : holds ? [1, 1] : [0, 0]);
/** Baked at ingest for the trinkets the top logs wore, so any other item reads as unknown; an item with no use has no use buff or damage, whatever its dump says. */
const KNOWN: Record<string, ((item: PlanItem, use: PlanSpell | undefined) => Range) | undefined> = {
  has_use_buff: item => (item.use === null ? [0, 0] : flag(item.use_buff)),
  has_use_damage: item => (item.use === null ? [0, 0] : flag(item.use_damage)),
  has_cooldown: (_, use) => flag(!!use?.cooldown),
  cast_time: (_, use) => (use ? [use.cast_time, use.cast_time] : UNKNOWN),
};

@Injectable({ providedIn: 'root' })
export class GearFacts implements FactReader {
  private readonly dumps = inject(SpellDumpService);
  private readonly cooldowns = inject(CooldownFacts);
  readonly kind = 'gear';

  streams(): FactStream[] {
    return ['gear'];
  }

  answers({ field }: FactPath): boolean {
    return FIELDS.has(field) || field in KNOWN || field.startsWith(COOLDOWN);
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (path.field === 'potion') return ctx.castTimes(path.subject).length ? [1, 1] : UNKNOWN;
    if (!ctx.gear.length) return UNKNOWN;
    if (path.field === 'equipped') return this.equipped(path.subject, ctx);
    const piece = this.piece(path, ctx);
    if (!piece) return UNKNOWN;
    if (path.field === 'is') return flag(this.named(piece, path.subject, ctx));
    if (path.field === 'ilvl') return piece.itemLevel ? [piece.itemLevel, piece.itemLevel] : UNKNOWN;
    return this.known(path, moment, ctx, piece);
  }

  /** A piece nobody could name may be the item asked about, so it leaves `equipped` unknown rather than false. */
  private equipped(token: string, ctx: FactContext): Range {
    const matches = ctx.gear.map(piece => this.named(piece, token, ctx));
    return matches.includes(true) ? [1, 1] : matches.includes(null) ? UNKNOWN : [0, 0];
  }

  /** A trinket's use reads as any button's: its cooldown is rebuilt from the casts of its use spell. */
  private known(path: FactPath, moment: CastMoment, ctx: FactContext, piece: GearPiece): Range {
    const item = Object.values(ctx.list.items ?? {}).find(entry => entry.id === piece.id);
    if (!item) return UNKNOWN;
    const use = item.use ? ctx.list.spells[item.use] : undefined;
    if (!path.field.startsWith(COOLDOWN)) return KNOWN[path.field]?.(item, use) ?? UNKNOWN;
    return item.use ? this.cooldowns.read({ ...path, kind: 'cooldown', subject: item.use, field: path.field.slice(COOLDOWN.length) }, moment, ctx) : UNKNOWN;
  }

  /** Null for a piece whose name the report left blank and whose id the list has no entry for. */
  private named(piece: GearPiece, token: string, ctx: FactContext): boolean | null {
    if (ctx.list.items?.[token]?.id === piece.id) return true;
    return piece.name ? this.dumps.tokenize(piece.name) === token : null;
  }

  /** `trinket.1` and `trinket.2` are the two slots, `trinket.<name>` whichever holds the item; `this_trinket` depends on the line SimC is on, so it names none. */
  private piece(path: FactPath, ctx: FactContext): GearPiece | null {
    const slot = TRINKET_SLOTS[path.n - 1];
    if (slot !== undefined) return ctx.gear.find(piece => piece.slot === slot) ?? null;
    return ctx.gear.find(piece => (TRINKET_SLOTS as readonly number[]).includes(piece.slot) && this.named(piece, path.subject, ctx) === true) ?? null;
  }
}
