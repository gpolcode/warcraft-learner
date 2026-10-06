import { Injectable, inject } from '@angular/core';
import { TRINKET_SLOTS } from '../../../gear/gear-extract-service';
import { SpellDumpService } from '../../../simc/spell-dump-service';
import { UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords, GearPiece, Range } from '../priority-list.models';
import { Words } from '../list-words';
import { COOLDOWN_FIELDS } from './cooldown-facts';

interface GearState {
  gear: readonly GearPiece[];
  /** The trinket the name is about; null for one the slot does not name. */
  piece: GearPiece | null;
  token: (name: string) => string;
  ctx: FactContext;
}

const flag = (holds: boolean): Range => (holds ? [1, 1] : [0, 0]);
const EQUIPPED: readonly [string, string] = ['Equipped', 'Not equipped'];
const withOrWithout = (holds: boolean): string => (holds ? 'with' : 'without');
const PROC_WORDS: Record<string, FieldWords | undefined> = {
  duration: { frame: 'seconds', unit: 's of proc', at: (noun, op, n) => `with ${Words.possessive(noun)} proc lasting ${Words.lessMore(op)} ${Words.secs(n)}` },
  remains: { frame: 'left', unit: 's of proc left', at: (noun, op, n) => `with ${Words.lessMore(op)} ${Words.secs(n)} of the ${noun} proc left` },
  up: { frame: 'flag', states: ['Proc up', 'Proc down'], flag: (noun, holds) => `while the ${noun} proc is ${holds ? 'up' : 'down'}` },
  default_value: { frame: 'amount', label: 'proc value' },
  cooldown_remains: { frame: 'away', unit: 's to proc', at: (noun, op, n) => `when the ${noun} proc is ${Words.lessMore(op)} ${Words.secs(n)} away` },
};

const FIELDS: Record<string, FieldRow<GearState> | undefined> = {
  equipped: {
    value: ({ gear, token }, path) => flag(gear.some(piece => token(piece.name) === path.subject)),
    words: { frame: 'flag', states: EQUIPPED, flag: (noun, holds) => `${withOrWithout(holds)} ${noun} equipped` },
  },
  is: {
    value: ({ piece, token }, path) => (piece ? flag(token(piece.name) === path.arg) : UNKNOWN),
    words: { frame: 'flag', states: EQUIPPED, flag: (noun, holds, path) => `${withOrWithout(holds)} ${Words.spaced(path.arg)} as ${noun}` },
  },
  ilvl: { value: ({ piece }) => (piece?.itemLevel ? [piece.itemLevel, piece.itemLevel] : UNKNOWN), words: { frame: 'amount', label: 'item level', unit: 'item level' } },
  potion: {
    value: ({ ctx }, path) => (ctx.castTimes(path.subject).length ? [1, 1] : UNKNOWN),
    words: { frame: 'flag', states: ['Used', 'Not used'], flag: (noun, holds) => `${withOrWithout(holds)} a ${noun} potion` },
  },
  has_use_buff: { words: { frame: 'flag', states: ['On-use buff', 'No on-use buff'], flag: (noun, holds) => `${withOrWithout(holds)} an on-use buff on ${noun}` } },
  has_use_damage: { words: { frame: 'flag', states: ['On-use damage', 'No on-use damage'], flag: (noun, holds) => `${withOrWithout(holds)} on-use damage on ${noun}` } },
  has_cooldown: { words: { frame: 'flag', states: ['Has a cooldown', 'No cooldown'], flag: (noun, holds) => `${holds ? 'when' : 'unless'} ${noun} has a cooldown` } },
  has_buff: { words: { frame: 'flag', states: ['Yes', 'No'], flag: (noun, holds, path) => `${withOrWithout(holds)} a ${Words.spaced(path.arg)} buff on ${noun}` } },
  has_stat: { words: { frame: 'flag', states: ['Yes', 'No'], flag: (noun, holds, path) => `${withOrWithout(holds)} ${Words.spaced(path.arg)} on ${noun}` } },
  cast_time: { words: { frame: 'seconds', label: 'use cast time', unit: 's' } },
  set_bonus: { words: { frame: 'flag', states: EQUIPPED, flag: (noun, holds) => `${withOrWithout(holds)} the ${noun} set bonus` } },
  weapon: { words: { frame: 'flag', states: ['Yes', 'No'], flag: (noun, holds, path) => `${withOrWithout(holds)} a ${Words.spaced(path.arg)} ${noun}` } },
  ...Object.fromEntries(Object.entries(COOLDOWN_FIELDS).flatMap(([field, row]) => (row ? [[`cooldown.${field}`, { words: row.words }]] : []))),
  ...Object.fromEntries(Object.entries(PROC_WORDS).flatMap(([field, words]) => (words ? [[`proc.${field}`, { words }]] : []))),
};

/** What the player wore and brought, from the combatant info and the names the report fills in for it. */
@Injectable({ providedIn: 'root' })
export class GearFacts implements FactReader {
  private readonly dumps = inject(SpellDumpService);
  readonly kinds: FactKind[] = ['gear'];
  readonly fields = FIELDS;

  streams(): FactStream[] {
    return ['gear'];
  }

  read(path: FactPath, _moment: CastMoment, ctx: FactContext): Range {
    const row = FIELDS[path.field];
    if (!row?.value || (!ctx.gear.length && path.field !== 'potion')) return UNKNOWN;
    const token = (name: string): string => this.dumps.tokenize(name);
    return row.value({ gear: ctx.gear, piece: this.piece(path, ctx.gear, token), token, ctx }, path);
  }

  /** `trinket.1` and `trinket.2` are the two slots, `trinket.<name>` whichever holds the item; `this_trinket` depends on the line SimC is on, so it names none. */
  private piece(path: FactPath, gear: readonly GearPiece[], token: (name: string) => string): GearPiece | null {
    const slot = TRINKET_SLOTS[path.n - 1];
    if (slot !== undefined) return gear.find(piece => piece.slot === slot) ?? null;
    return gear.find(piece => (TRINKET_SLOTS as readonly number[]).includes(piece.slot) && token(piece.name) === path.subject) ?? null;
  }
}
