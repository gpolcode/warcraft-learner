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
/** An id SimC's code names with no record in the class spell data (a racial) carries no cooldown or duration, so only aura reads may use it. */
const AURA_READ = /^(?:target\.)?(?:buff|debuff|dot)\./;

type EffectOf = (token: string, effect: number) => number | undefined;
const healthGate = (talent: string, op: string, pct: number | undefined): string | null => (pct === undefined ? null : `${talent}&target.health.pct${op}${pct}`);
/** Names SimC computes in class code, each as the same test over names a log answers, with its threshold from the spell data. */
const EXPRESSIONS: Record<string, (effect: EffectOf) => string | null> = {
  soul_fragments: () => 'buff.soul_fragments.stack',
  'soul_fragments.active': () => 'buff.soul_fragments.stack',
  // Fragments still spawning count towards SimC's total but sit on no aura yet, so the total reads as the ones already out.
  'soul_fragments.total': () => 'buff.soul_fragments.stack',
  'scorch_execute.active': effect => healthGate('talent.scorch', '<=', effect('scorch', 2)),
  'firestarter.active': effect => healthGate('talent.firestarter', '>=', effect('firestarter', 1)),
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
      const text = expression(effect);
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
    const cooldowns = this.cooldowns(lines, byToken);
    const defensives = this.defensives(records, byToken);
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
      const spell = this.spellOf(token, byToken, sources, names);
      return spell ? [[token, spell]] : [];
    }));
    const derived = { lines: lines ?? [], variables: read?.variables ?? [], spells, talents: this.talents(names, sources.tree), cooldowns, defensives };
    return { ...derived, key: bytesToHex(sha256(utf8ToBytes(JSON.stringify(derived)))).slice(0, KEY_LENGTH) };
  }

  /** A name the spell data does not hold, SimC's code declares: `voidfall_spending` is spell 1256302, `ca_inc` whichever of two buttons the build takes. */
  private spellOf(token: string, byToken: Map<string, SpellRecord[]>, sources: { records: SpellRecord[]; code: string }, names: string[]): PlanSpell | null {
    const named = byToken.get(token);
    if (named) return this.planSpell(named);
    const declared = this.simcNames.resolve(token, sources.code);
    if (!declared) return null;
    const records = [
      ...sources.records.filter(record => declared.ids.includes(record.id)),
      ...declared.tokens.flatMap(name => byToken.get(this.dumps.tokenize(name)) ?? []),
    ];
    if (records.length) return this.planSpell(records);
    const auraOnly = names.filter(name => this.spellTokens(name).includes(token)).every(name => AURA_READ.test(name));
    return declared.ids.length && auraOnly ? { ...this.planSpell([]), name: this.spoken(token), ids: declared.ids } : null;
  }

  private spoken(token: string): string {
    return token.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
    };
  }

  /** The talent entries each `talent.x`, `hero_tree.x` and `apex.N` of the list names, by the tree's own names tokenized the way SimC does. */
  private talents(names: string[], tree: TalentTree | null): Record<string, PlanTalent> {
    const keys = new Set(names.flatMap(name => TALENT_NAME.exec(name)?.[0] ?? []));
    return Object.fromEntries([...keys].flatMap(key => {
      const entries = this.talentEntries(key, tree);
      return entries[0] ? [[key, { name: entries[0].name, entries: entries.map(entry => entry.id) }]] : [];
    }));
  }

  private talentEntries(key: string, tree: TalentTree | null): TalentName[] {
    const [kind, token = ''] = key.split('.');
    if (kind === 'apex') return (tree?.apex ?? []).slice(Number(token) - 1, Number(token));
    return (kind === 'talent' ? tree?.talents : tree?.heroTrees)?.filter(entry => this.dumps.tokenize(entry.name) === token) ?? [];
  }

  private cooldowns(lines: PlanLine[] | null, byToken: Map<string, SpellRecord[]>): PlanCooldown[] {
    const tokens = lines ? new Set(lines.map(line => line.action)) : byToken.keys();
    return [...tokens].flatMap(token => {
      const records = byToken.get(token) ?? [];
      const button = greatest(records, record => record.cooldown);
      const major = records.some(record => record.major) || (!!lines && (button?.cooldown ?? 0) >= MAJOR_COOLDOWN_S);
      if (!button?.cooldown || !major || records.some(record => record.defensive)) return [];
      return [this.button(button, records)];
    }).map((cooldown, index) => (lines ? { ...cooldown, opener_priority: index + 1 } : cooldown));
  }

  private defensives(records: SpellRecord[], byToken: Map<string, SpellRecord[]>): PlanDefensive[] {
    return [...new Set(records.filter(record => record.defensive).map(record => record.token))].flatMap(token => {
      const named = byToken.get(token) ?? [];
      const button = greatest(named, record => record.cooldown);
      return button?.cooldown ? [this.button(button, named)] : [];
    });
  }

  private button(record: SpellRecord, named: SpellRecord[]): PlanCooldown {
    return { name: record.name, spell_id: record.id, cooldown: record.cooldown, talent_gated: named.some(entry => entry.talented) };
  }
}
