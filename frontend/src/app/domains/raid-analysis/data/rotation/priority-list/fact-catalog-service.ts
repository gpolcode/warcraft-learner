import { Injectable, inject } from '@angular/core';
import { POOL_TYPES } from '../../simc/spell-dump-service';
import { FACT_READERS } from './fact-readers';
import { SUMMON_PREFIXES, FactKind, FactPath, FactReader, FactStream, FieldRow, FieldWords } from './priority-list.models';

type Head = (rest: string[]) => Partial<FactPath>;

/** The kind each field of `action.x.<field>` reads; SimC's `action.x.remains` and `action.x.duration` are the cooldown's. */
const ACTION_FIELDS: Record<string, FactKind | undefined> = {
  remains: 'cooldown', remains_expected: 'cooldown', remains_guess: 'cooldown', ready: 'cooldown', up: 'cooldown', usable: 'cooldown', usable_in: 'cooldown',
  charges: 'cooldown', charges_fractional: 'cooldown', full_recharge_time: 'cooldown', duration: 'cooldown', cooldown: 'cooldown', max_charges: 'cooldown',
  recharge_time: 'cooldown', cooldown_react: 'cooldown',
  last_used: 'press', in_flight: 'press', in_flight_count: 'press', in_flight_remains: 'press', in_flight_to_target: 'press', placed: 'press',
  executing: 'press', execute_remains: 'press', channeling: 'press', cast_time: 'press', execute_time: 'press', gcd: 'press',
  cost: 'pool', energize_amount: 'pool',
  pmultiplier: 'aura', persistent_multiplier: 'aura', active_dots: 'aura',
};
/** A bare field is the line's own button's: `refreshable` on a Rupture line is Rupture's dot, `charges` its cooldown. */
const OWN_FIELDS: Record<string, FactKind | undefined> = {
  ...ACTION_FIELDS, remains: 'aura', duration: 'aura', ticking: 'aura', refreshable: 'aura', ticks_remain: 'aura', tick_time: 'aura', ticks: 'aura',
  'gcd.max': 'press', 'gcd.remains': 'press', combo_strike: 'press',
};
const FIGHT_NAMES = new Set(['time', 'in_combat', 'fight_remains', 'expected_combat_length', 'time_to_die', 'time_to_bloodlust', 'active_enemies', 'enemies', 'desired_targets', 'is_boss', 'in_boss_encounter']);
const TIME_TO_PCT = /^time_to_pct_(\d+)$/;
const TRINKET_ARG_FIELDS = new Set(['is', 'has_buff', 'has_stat']);
/** SimC reads `proc.<stat>.<field>`, `buff.<stat>.<field>` and `stat.<stat>.<field>` alike. */
const TRINKET_PROC_HEADS = new Set(['proc', 'buff', 'stat']);

const aura = (target: boolean): Head => ([token = '', ...field]) => ({ kind: 'aura', subject: token, spell: true, field: field.join('.') || 'up', target });
const spread: Head = ([token = '']) => ({ kind: 'aura', subject: token, spell: true, field: 'active_dots', target: true });
const press = (field: string): Head => ([token = '']) => ({ kind: 'press', subject: token, spell: true, field });
const talent = (kind: string): Head => ([token = '', field = 'enabled']) => ({ kind: 'build', subject: `${kind}.${token}`, field });
const gear = (field: string): Head => ([subject = '']) => ({ kind: 'gear', subject, field });
const weapon = (hand: string): Head => ([kind = '']) => ({ kind: 'gear', subject: hand, field: 'weapon', arg: kind });
const trinketField = ([first = '', second = '', ...more]: string[]): Partial<FactPath> => {
  if (TRINKET_ARG_FIELDS.has(first)) return { field: first, arg: second };
  if (TRINKET_PROC_HEADS.has(first)) return { field: `proc.${more.join('.')}`, arg: second };
  return { field: [first, second, ...more].filter(Boolean).join('.') };
};
const trinket = (slot: string): Head => rest => ({ kind: 'gear', subject: slot, ...trinketField(rest) });

const HEADS: Record<string, Head | undefined> = {
  buff: aura(false), debuff: aura(true), dot: aura(true), active_dot: spread, active_dots: spread,
  cooldown: ([token = '', ...field]) => ({ kind: 'cooldown', subject: token, spell: true, field: field.join('.') }),
  action: ([token = '', ...rest]) => ({ kind: ACTION_FIELDS[rest.join('.')] ?? null, subject: token, spell: true, field: rest.join('.') }),
  pet: ([token = '', field = '']) => ({ kind: 'press', subject: token, spell: true, field: `pet.${field}` }),
  prev: press('prev'), prev_off_gcd: press('prev_off_gcd'),
  prev_gcd: ([n = '', token = '']) => ({ kind: 'press', subject: token, spell: true, field: 'prev_gcd', n: Number(n) }),
  talent: talent('talent'), hero_tree: talent('hero_tree'),
  apex: ([n = '']) => ({ kind: 'build', subject: `apex.${n}`, field: 'enabled', n: Number(n) }),
  variable: ([name = '']) => ({ kind: 'variable', subject: name, field: 'variable' }),
  raid_event: ([type = '', field = '']) => ({ kind: 'fight', subject: type, field: `raid_event.${field}` }),
  fight_style: ([style = '']) => ({ kind: 'fight', subject: style, field: 'fight_style' }),
  spell_targets: ([token = '']) => ({ kind: 'fight', subject: token, spell: !!token, field: 'spell_targets' }),
  health: ([field = '']) => ({ kind: 'fight', field: field ? `health.${field}` : 'health' }),
  time_to_die: () => ({ kind: 'fight', field: 'time_to_die' }),
  equipped: gear('equipped'), set_bonus: gear('set_bonus'), potion: gear('potion'), consumable: gear('potion'),
  main_hand: weapon('main_hand'), off_hand: weapon('off_hand'),
  trinket: ([slot = '', ...rest]) => ({ ...trinket(slot)(rest), n: Number(slot) || 0 }),
  this_trinket: trinket('this'), other_trinket: trinket('other'),
};

/** SimC's names as its own factories read them, and the reader that answers each kind. */
@Injectable({ providedIn: 'root' })
export class FactCatalogService {
  private readonly readers = inject(FACT_READERS);

  /** `action` is the line's button, which a bare field such as `refreshable` is about. */
  path(name: string, action: string): FactPath {
    const target = name.startsWith('target.');
    const bare = target ? name.slice('target.'.length) : name;
    const [head = '', ...rest] = bare.split('.');
    const base: FactPath = { kind: null, subject: '', spell: false, field: bare, arg: '', target, n: 0 };
    const lead = HEADS[head];
    if (lead) return { ...base, ...lead(rest) };
    if (POOL_TYPES[head] !== undefined) return { ...base, kind: 'pool', subject: head, field: rest.join('.') || 'amount' };
    return { ...base, ...this.bare(bare, action) };
  }

  /** A name with no leading kind: a pool, the line's own button's field, or the fight itself. */
  private bare(name: string, action: string): Partial<FactPath> {
    if (name === 'cp_max_spend') return { kind: 'pool', subject: 'combo_points', field: 'max' };
    const own = OWN_FIELDS[name];
    if (own) return { kind: own, subject: action, spell: true, ...(own === 'aura' ? { target: true } : {}) };
    const pct = TIME_TO_PCT.exec(name);
    if (pct) return { kind: 'fight', field: 'time_to_pct', n: Number(pct[1]) };
    return FIGHT_NAMES.has(name) ? { kind: 'fight' } : {};
  }

  reader(kind: FactKind | null): FactReader | null {
    return this.readers.find(reader => kind !== null && reader.kinds.includes(kind)) ?? null;
  }

  row(path: FactPath): FieldRow<never> | undefined {
    return this.reader(path.kind)?.fields[path.field];
  }

  /** Undefined for a name outside the catalog, which phrases by its own words. */
  words(path: FactPath): FieldWords | undefined {
    const row = this.row(path);
    return typeof row?.words === 'function' ? row.words(path) : row?.words;
  }

  streams(name: string): readonly FactStream[] {
    const path = this.path(name, '');
    return this.reader(path.kind)?.streams(path) ?? [];
  }

  /** The spell tokens a name reads, a pet's by the button that summons it. */
  spellTokens(name: string): string[] {
    const path = this.path(name, '');
    if (!path.spell || !path.subject) return [];
    return path.field.startsWith('pet.') ? SUMMON_PREFIXES.map(prefix => prefix + path.subject) : [path.subject];
  }

  /** A talent, hero tree or apex term says whose build a line is, not when to press. */
  isBuild(name: string): boolean {
    return this.path(name, '').kind === 'build';
  }

  /** A term on the encounter's state rather than the player's; the player's own health is the player's. */
  isSituation(name: string): boolean {
    const path = this.path(name, '');
    return path.kind === 'fight' && (path.target || !path.field.startsWith('health'));
  }
}
