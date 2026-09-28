import { Injectable, inject } from '@angular/core';
import { greatest, group, max, mode, rollup } from 'd3-array';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import type { PlanCooldown, PlanDefensive, PlanLine, PlanSpell, PlanTalent, PriorityList } from '../plan/plan.models';
import type { WclEvent } from '../wcl/wcl.models';
import type { TalentName, TalentTree } from '../http/talent-data-service';
import { AplRead, SimcAplService } from './simc-apl-service';
import { SimcNameService } from './simc-name-service';
import { SpellDumpService, SpellRecord } from './spell-dump-service';

/** A button pressed from the APL with a cooldown this long is a major cooldown even without Blizzard's label. */
const MAJOR_COOLDOWN_S = 60;
const KEY_LENGTH = 16;

const SPELL_NAME = /^(?:target\.)?(?:buff|debuff|dot|cooldown|action|active_dots?|prev|prev_off_gcd|pet)\.(\w+)|^prev_gcd\.\d+\.(\w+)/;
const TALENT_NAME = /^(talent|hero_tree|apex)\.\w+/;
const AURA_NAME = /^(?:target\.)?(?:buff|debuff|dot)\.(\w+)/;
const TIERED_TALENT = /^(\w+)_(\d+)$/;
type EffectOf = (token: string, effect: number) => number | undefined;
/** Whether the spec's own spell data holds the name. */
type Own = (token: string) => boolean;
const healthGate = (talent: string, op: string, pct: number | undefined): string | null => (pct === undefined ? null : `${talent}&target.health.pct${op}${pct}`);
const up = (token: string): string => `buff.${token}.up`;
const anyUp = (tokens: string[]): string | null => (tokens.length ? tokens.map(up).join('|') : null);
/** Names SimC computes in class code, each as the same test over names a log answers, with its threshold from the spell data. */
const EXPRESSIONS: Record<string, (effect: EffectOf, own: Own) => string | null> = {
  soul_fragments: () => 'buff.soul_fragments.stack',
  'soul_fragments.active': () => 'buff.soul_fragments.stack',
  // Fragments still spawning count towards SimC's total but sit on no aura yet, so the total reads as the ones already out.
  'soul_fragments.total': () => 'buff.soul_fragments.stack',
  'scorch_execute.active': effect => healthGate('talent.scorch', '<=', effect('scorch', 2)),
  'firestarter.active': effect => healthGate('talent.firestarter', '>=', effect('firestarter', 1)),
  // SimC counts every rogue stealth, but a buff the spec cannot have would read as unknown rather than down.
  'stealthed.rogue': (_, own) => anyUp(['stealth', 'vanish', 'subterfuge', 'shadow_dance'].filter(own)),
  rtb_buffs: () => ['broadside', 'buried_treasure', 'grand_melee', 'ruthless_precision', 'skull_and_crossbones', 'true_bearing'].map(up).join('+'),
  demonic_art: () => anyUp(['demonic_art_overlord', 'demonic_art_mother_of_chaos', 'demonic_art_pit_lord']),
  // Scorch and Fire Blast hit as they cast, so only the three that travel are ever in flight.
  hot_streak_spells_in_flight: () => ['fireball', 'pyroblast', 'phoenix_flames'].map(token => `action.${token}.in_flight_count`).join('+'),
};

/** A `pet.x` is out while the button that summons it lasts, named for the pet itself or with one of these. */
export const SUMMON_PREFIXES = ['', 'summon_', 'invoke_'];

export interface SpecPlan extends PriorityList {
  cooldowns: PlanCooldown[];
  defensives: PlanDefensive[];
  /** Changes exactly when a derived part changes, so ingest re-benches an encounter only then. */
  key: string;
}

@Injectable({ providedIn: 'root' })
export class SpecPlanService {
  private readonly dumps = inject(SpellDumpService);
  private readonly apl = inject(SimcAplService);
  private readonly simcNames = inject(SimcNameService);

  /** A null list is a spec SimulationCraft writes no APL for: it gets cooldowns and defensives from the labels alone. */
  build(sources: { apl: string | null; dump: string; specLabel: string; talents: TalentTree | null; code: string }): SpecPlan {
    const records = this.dumps.readDump(sources.dump);
    const own = this.ownRecords(records, sources.specLabel, new Set(sources.apl?.match(/\w+/g)));
    const read = sources.apl === null ? null : this.apl.readApl(sources.apl, this.expressions(group(own, record => record.token)));
    return this.assemble(read, own, { records, code: sources.code, tree: sources.talents });
  }

  private expressions(byToken: Map<string, SpellRecord[]>): Map<string, string> {
    const effect: EffectOf = (token, index) => (byToken.get(token) ?? []).map(record => record.effects[index - 1]).find(value => value !== undefined);
    return new Map(Object.entries(EXPRESSIONS).flatMap(([name, expression]) => {
      const text = expression(effect, token => byToken.has(token));
      return text ? [[name, text] as const] : [];
    }));
  }

  /** A name only other specs' talents carry belongs to them, untalented records under it included, unless this spec's APL names it. */
  private ownRecords(records: SpellRecord[], specLabel: string, aplWords: Set<string>): SpellRecord[] {
    const talentedHere = rollup(records.filter(record => record.specs), named => named.some(record => record.specs?.includes(specLabel)), record => record.token);
    const ownName = (token: string): boolean => aplWords.has(token) || talentedHere.get(token) !== false;
    return records.filter(record => ownName(record.token) && (!record.specs || record.specs.includes(specLabel)));
  }

  /** The id each button was cast under in one log, keyed by name; a button the log never cast is absent. */
  castIds(plan: SpecPlan, casts: WclEvent[]): Record<string, number> {
    const counts = rollup(casts.filter(event => event.type === 'cast'), events => events.length, event => event.abilityGameID);
    const ids: Record<string, number> = {};
    for (const { name, spell_id } of [...plan.cooldowns, ...plan.defensives]) {
      const cast = greatest(this.spell(plan, name)?.ids ?? [spell_id], id => counts.get(id) ?? 0);
      if (cast !== undefined && counts.has(cast)) ids[name] = cast;
    }
    return ids;
  }

  inLog(plan: SpecPlan, ids: Record<string, number>): SpecPlan {
    const castAs = <T extends { name: string; spell_id: number }>(button: T): T => ({ ...button, spell_id: ids[button.name] ?? button.spell_id });
    return { ...plan, cooldowns: plan.cooldowns.map(castAs), defensives: plan.defensives.map(castAs) };
  }

  /** A button none of the top logs cast is left out. */
  inTopLogs(plan: SpecPlan, perLog: Record<string, number>[]): SpecPlan {
    const castAs = <T extends { name: string; spell_id: number }>(button: T): T[] => {
      const cast = perLog.flatMap(ids => ids[button.name] ?? []);
      return cast.length ? [{ ...button, spell_id: mode(cast) }] : [];
    };
    return { ...plan, cooldowns: plan.cooldowns.flatMap(castAs), defensives: plan.defensives.flatMap(castAs) };
  }

  private spell(plan: SpecPlan, name: string): PlanSpell | undefined {
    return plan.spells[this.dumps.tokenize(name)];
  }

  private assemble(read: AplRead | null, records: SpellRecord[], sources: { records: SpellRecord[]; code: string; tree: TalentTree | null }): SpecPlan {
    const lines = read?.lines ?? null;
    const byToken = group(records, record => record.token);
    const cooldowns = this.cooldowns(lines, byToken, sources.tree);
    const defensives = this.defensives(records, byToken, sources.tree);
    const texts = [...(lines ?? []).flatMap(line => line.terms ?? []), ...(read?.variables ?? []).flatMap(({ value, value_else, condition, terms }) => [value, value_else, condition, ...(terms ?? [])])];
    const names = texts.flatMap(text => {
      const node = text === undefined ? null : this.apl.parse(text);
      return node ? this.apl.identifiers(node) : [];
    });
    const tokens = new Set([
      ...(lines ?? []).map(line => line.action),
      ...names.flatMap(name => this.spellTokens(name)),
      ...[...cooldowns, ...defensives].map(button => this.dumps.tokenize(button.name)),
    ]);
    const spells = Object.fromEntries([...tokens].flatMap(token => {
      const spell = this.spellOf(token, byToken, sources);
      return spell ? [[token, spell]] : [];
    }));
    const derived = { lines: lines ?? [], variables: read?.variables ?? [], spells, talents: this.talents(names, sources.tree), cooldowns, defensives };
    return { ...derived, key: bytesToHex(sha256(utf8ToBytes(JSON.stringify(derived)))).slice(0, KEY_LENGTH) };
  }

  /** A name the spell data does not hold, SimC's code declares: `voidfall_spending` is spell 1256302, `ca_inc` whichever of two buttons the build takes; a racial it declares no record for is left to the log's own names. */
  private spellOf(token: string, byToken: Map<string, SpellRecord[]>, sources: { records: SpellRecord[]; code: string }): PlanSpell | null {
    const named = byToken.get(token);
    if (named) return this.planSpell(named);
    const declared = this.simcNames.resolve(token, sources.code);
    if (!declared) return null;
    const records = [
      ...sources.records.filter(record => declared.ids.includes(record.id)),
      ...declared.tokens.flatMap(name => byToken.get(this.dumps.tokenize(name)) ?? []),
    ];
    return records.length ? this.planSpell(records) : null;
  }

  private spellTokens(name: string): string[] {
    const [, token, prior] = SPELL_NAME.exec(name) ?? [];
    if (prior) return [prior];
    if (!token) return [];
    return name.startsWith('pet.') ? SUMMON_PREFIXES.map(prefix => prefix + token) : [token];
  }

  /** One spell over every record its name holds: a button's cooldown sits on one record and its buff's duration on another. */
  private planSpell(named: SpellRecord[]): PlanSpell {
    const most = (field: 'cooldown' | 'charges' | 'duration' | 'gcd' | 'castTime' | 'maxStacks'): number => max(named, record => record[field]) ?? 0;
    const costs = rollup(named.flatMap(record => record.costs), same => max(same, cost => cost.amount) ?? 0, cost => cost.type);
    return {
      name: named[0]?.name ?? '', ids: named.map(record => record.id),
      cooldown: most('cooldown'), charges: most('charges'), duration: most('duration'), gcd: most('gcd'),
      cast_time: most('castTime'), max_stacks: most('maxStacks'),
      costs: [...costs].map(([type, amount]) => ({ type, amount })),
      energize: named.map(record => record.energize).find(energize => energize !== null) ?? null,
    };
  }

  /** The talent entries each `talent.x`, `hero_tree.x` and `apex.N` of the list names, and each aura it names after a talent, by the tree's own names tokenized the way SimC does. */
  private talents(names: string[], tree: TalentTree | null): Record<string, PlanTalent> {
    const found = new Map<string, { entries: TalentName[]; points?: number }>();
    for (const token of names.flatMap(name => AURA_NAME.exec(name)?.[1] ?? [])) found.set(`talent.${token}`, { entries: this.named(tree, 'talents', token) });
    for (const key of names.flatMap(name => TALENT_NAME.exec(name)?.[0] ?? [])) found.set(key, this.talentEntries(key, tree));
    return Object.fromEntries([...found].flatMap(([key, { entries, points }]) =>
      entries[0] ? [[key, { name: entries[0].name, entries: entries.map(entry => entry.id), ...(points ? { points } : {}) }]] : []));
  }

  /** `talent.hand_of_frost_4` is the fourth rank in the tiered node of that name, counted over its tiers. */
  private talentEntries(key: string, tree: TalentTree | null): { entries: TalentName[]; points?: number } {
    const kind = key.slice(0, key.indexOf('.'));
    const token = key.slice(kind.length + 1);
    if (kind === 'apex') return { entries: tree?.apex.slice(Number(token) - 1, Number(token)) ?? [] };
    const own = this.named(tree, kind === 'talent' ? 'talents' : 'heroTrees', token);
    const tiered = TIERED_TALENT.exec(token);
    if (own.length || !tiered) return { entries: own };
    return { entries: this.named(tree, 'apex', tiered[1] ?? ''), points: Number(tiered[2]) };
  }

  private named(tree: TalentTree | null, bucket: 'talents' | 'heroTrees' | 'apex', name: string): TalentName[] {
    return tree?.[bucket].filter(entry => this.dumps.tokenize(entry.name) === name) ?? [];
  }

  private cooldowns(lines: PlanLine[] | null, byToken: Map<string, SpellRecord[]>, tree: TalentTree | null): PlanCooldown[] {
    const tokens = lines ? new Set(lines.map(line => line.action)) : byToken.keys();
    return [...tokens].flatMap(token => {
      const records = byToken.get(token) ?? [];
      const button = greatest(records, record => record.cooldown);
      const major = records.some(record => record.major) || (!!lines && (button?.cooldown ?? 0) >= MAJOR_COOLDOWN_S);
      if (!button?.cooldown || !major || records.some(record => record.defensive)) return [];
      return [this.button(button, records, tree)];
    }).map((cooldown, index) => (lines ? { ...cooldown, opener_priority: index + 1 } : cooldown));
  }

  private defensives(records: SpellRecord[], byToken: Map<string, SpellRecord[]>, tree: TalentTree | null): PlanDefensive[] {
    return [...new Set(records.filter(record => record.defensive).map(record => record.token))].flatMap(token => {
      const named = byToken.get(token) ?? [];
      const button = greatest(named, record => record.cooldown);
      return button?.cooldown ? [this.button(button, named, tree)] : [];
    });
  }

  private button(record: SpellRecord, named: SpellRecord[], tree: TalentTree | null): PlanCooldown {
    const talented = named.some(entry => entry.talented);
    const entries = talented ? this.named(tree, 'talents', record.token).map(entry => entry.id) : [];
    return {
      name: record.name, spell_id: record.id, cooldown: record.cooldown, talent_gated: talented,
      ...(entries.length ? { talent_entries: entries } : {}),
    };
  }
}
