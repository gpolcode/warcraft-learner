import { POOL_TYPES } from '../../simc/spell-dump-service';
import { TABLE } from './fact-table';
import { SUMMON_PREFIXES, FactKind, FactPath, FieldRow } from './priority-list.models';

type Head = (rest: string[]) => Pick<FactPath, 'kind' | 'subject' | 'field'> & Partial<FactPath>;

/** A name on the target reads the same aura or button as one without the prefix; the target's own facts keep it as part of their field. */
const TARGET = /^target\.(?=(?:buff|debuff|dot|active_dots?|cooldown|action)\.)/;
/** Which kind answers a bare field or an `action.x` field: `remains` is the button's own dot, `charges` its cooldown, `cast_time` its press, `cost` its pool. */
const OWN_KINDS: FactKind[] = ['aura', 'cooldown', 'press', 'pool'];
const ACTION_KINDS: FactKind[] = ['cooldown', 'press', 'pool', 'aura'];

const aura = (target: boolean): Head => ([subject = '', ...field]) => ({ kind: 'aura', subject, field: field.join('.') || 'up', target });
const spread: Head = ([subject = '']) => ({ kind: 'aura', subject, field: 'active_dots', target: true });
const press = (field: string): Head => ([subject = '']) => ({ kind: 'press', subject, field });
const build = (head: string): Head => ([token = '', field = 'enabled']) => ({ kind: 'build', subject: `${head}.${token}`, field, n: Number(token) || 1 });
const HEADS: Record<string, Head | undefined> = {
  buff: aura(false), debuff: aura(true), dot: aura(true), active_dot: spread, active_dots: spread,
  cooldown: ([subject = '', ...field]) => ({ kind: 'cooldown', subject, field: field.join('.') }),
  action: ([subject = '', ...rest]) => {
    const field = rest.join('.');
    return { kind: ACTION_KINDS.find(kind => TABLE[kind][field]) ?? 'cooldown', subject, field };
  },
  talent: build('talent'), hero_tree: build('hero_tree'), apex: build('apex'),
  variable: ([subject = '']) => ({ kind: 'build', subject, field: 'variable' }),
  prev: press('prev'), prev_off_gcd: press('prev_off_gcd'),
  prev_gcd: ([n = '1', subject = '']) => ({ kind: 'press', subject, field: 'prev_gcd', n: Number(n) }),
  pet: ([subject = '', field = '']) => ({ kind: 'press', subject, field: `pet.${field}` }),
};

/** The grammar every SimC name shares: `[target.] head . subject . field`, a bare field being the line's own button's. */
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

  /** A name without a head is the fight's own, the line's button's own field, or, outside the catalog, read as the fight's and answered by nobody. */
  private static bare(name: string, head: string, action: string): Pick<FactPath, 'kind' | 'subject' | 'field'> & Partial<FactPath> {
    if (TABLE.fight[name] ?? TABLE.fight[head]) return { kind: 'fight', subject: '', field: TABLE.fight[name] ? name : head };
    const own = OWN_KINDS.find(kind => TABLE[kind][name]);
    return own ? { kind: own, subject: action, field: name, target: own === 'aura' } : { kind: 'fight', subject: '', field: name };
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

  /** The spell tokens a name reads, a pet's being every button that may summon it. */
  static spellTokens(name: string): string[] {
    const { kind, subject, field } = FactPaths.path(name, '');
    if (!subject || kind === 'build' || kind === 'fight' || POOL_TYPES[subject] !== undefined) return [];
    return field.startsWith('pet.') ? SUMMON_PREFIXES.map(prefix => prefix + subject) : [subject];
  }
}
