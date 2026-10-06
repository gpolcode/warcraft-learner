import { POOL_TYPES } from '../../simc/spell-dump-service';
import { TABLE } from './fact-table';
import { SUMMON_PREFIXES, FactKind, FactPath, FieldRow } from './priority-list.models';

type Head = (rest: string[]) => Pick<FactPath, 'kind' | 'subject' | 'field'> & Partial<FactPath>;

/** Stripped only ahead of a head that reads the same aura or button either way; `target.health.pct` is a fight field of its own. */
const TARGET = /^target\.(?=(?:buff|debuff|dot|active_dots?|cooldown|action)\.)/;
/** SimC resolves a button's own field dot-first, so `remains` and `duration` are its dot, `charges` its cooldown, `cast_time` its press, `cost` its pool. */
const OWN_KINDS: FactKind[] = ['aura', 'cooldown', 'press', 'pool'];

const aura = (target: boolean): Head => ([subject = '', ...field]) => ({ kind: 'aura', subject, field: field.join('.') || 'up', target });
const spread: Head = ([subject = '']) => ({ kind: 'aura', subject, field: 'active_dots', target: true });
const press = (field: string): Head => ([subject = '']) => ({ kind: 'press', subject, field });
const build = (head: string): Head => ([token = '', field = 'enabled']) => ({ kind: 'build', subject: `${head}.${token}`, field, n: Number(token) || 1 });
/** The segment after these names the item or stat asked about, not more field: `trinket.1.is.X`, `trinket.1.has_buff.haste`. */
const ARGS = new Set(['is', 'has_buff', 'has_stat', 'proc', 'buff']);
const gear = (n: number, subject: string, [field = '', ...rest]: string[]): ReturnType<Head> =>
  (ARGS.has(field) ? { kind: 'gear', n, subject: rest[0] ?? '', field: rest.length > 1 ? `${field}.${rest[rest.length - 1]}` : field } : { kind: 'gear', n, subject, field: [field, ...rest].join('.') });
const item = (field: string): Head => ([subject = '']) => ({ kind: 'gear', subject, field, n: 0 });
const HEADS: Record<string, Head | undefined> = {
  buff: aura(false), debuff: aura(true), dot: aura(true), active_dot: spread, active_dots: spread,
  cooldown: ([subject = '', ...field]) => ({ kind: 'cooldown', subject, field: field.join('.') }),
  action: ([subject = '', ...rest]) => {
    const field = rest.join('.');
    const kind = OWN_KINDS.find(own => TABLE[own][field]) ?? 'unread';
    return { kind, subject, field, target: kind === 'aura' };
  },
  talent: build('talent'), hero_tree: build('hero_tree'), apex: build('apex'),
  variable: ([subject = '']) => ({ kind: 'build', subject, field: 'variable' }),
  prev: press('prev'), prev_off_gcd: press('prev_off_gcd'),
  prev_gcd: ([n = '1', subject = '']) => ({ kind: 'press', subject, field: 'prev_gcd', n: Number(n) }),
  pet: ([subject = '', field = '']) => ({ kind: 'press', subject, field: `pet.${field}` }),
  trinket: ([slot = '', ...rest]) => (Number(slot) ? gear(Number(slot), '', rest) : gear(0, slot, rest)),
  this_trinket: rest => gear(0, 'this_trinket', rest), other_trinket: rest => gear(0, 'other_trinket', rest),
  equipped: item('equipped'), set_bonus: item('set_bonus'), potion: item('potion'), consumable: item('consumable'), main_hand: item('main_hand'), off_hand: item('off_hand'),
};

export class FactPaths {
  private constructor() {}

  /** `bound` is the row being derived, whose kind's fields read its own subject. */
  static path(name: string, action: string, bound?: FactPath): FactPath {
    if (bound && TABLE[bound.kind][name]) return { ...bound, field: name };
    const stripped = name.replace(TARGET, '');
    const [head = '', ...rest] = stripped.split('.');
    const base = { subject: '', target: stripped !== name, n: 1 };
    const parsed = HEADS[head]?.(rest);
    if (parsed) return { ...base, ...parsed };
    if (POOL_TYPES[head] !== undefined) return { ...base, kind: 'pool', subject: head, field: rest.join('.') || 'amount' };
    return { ...base, ...FactPaths.bare(name, head, action) };
  }

  private static bare(name: string, head: string, action: string): Pick<FactPath, 'kind' | 'subject' | 'field'> & Partial<FactPath> {
    if (TABLE.fight[name] ?? TABLE.fight[head]) return { kind: 'fight', subject: '', field: TABLE.fight[name] ? name : head };
    const own = OWN_KINDS.find(kind => TABLE[kind][name]);
    return own ? { kind: own, subject: action, field: name, target: own === 'aura' } : { kind: 'unread', subject: '', field: name };
  }

  static row(path: FactPath): FieldRow | undefined {
    return TABLE[path.kind][path.field];
  }

  /** A talent, hero tree or apex term says whose build a line is, not when to press. */
  static build(path: FactPath): boolean {
    return path.kind === 'build' && path.field !== 'variable';
  }

  /** Reads the encounter's state rather than the player's; `health.pct` is the player's own health. */
  static situation(path: FactPath): boolean {
    return path.kind === 'fight' && !path.field.startsWith('health');
  }

  static spellTokens(name: string): string[] {
    const { kind, subject, field } = FactPaths.path(name, '');
    if (!subject || kind === 'build' || kind === 'fight' || kind === 'gear' || POOL_TYPES[subject] !== undefined) return [];
    return field.startsWith('pet.') ? SUMMON_PREFIXES.map(prefix => prefix + subject) : [subject];
  }
}
