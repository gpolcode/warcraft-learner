import { Injectable, inject } from '@angular/core';
import { greatest, group, mode, rollup } from 'd3-array';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import type { RuleCondition, PlanCooldown, PlanDefensive } from '../plan/plan.models';
import type { WclEvent } from '../wcl/wcl.models';
import { AplLine, SimcAplService } from './simc-apl-service';
import { AplRuleService } from './apl-rule-service';
import { SpellDumpService, SpellRecord } from './spell-dump-service';

/** A button pressed from the APL with a cooldown this long is a major cooldown even without Blizzard's label. */
const MAJOR_COOLDOWN_S = 60;
const KEY_LENGTH = 16;

export type SpellScope = 'cast' | 'self' | 'target';

export interface PlanSpell {
  name: string;
  /** Every record SimC's spell data holds under the name; each log picks the one it shows. */
  ids: number[];
}

/** What a spec's benches judge, read from SimulationCraft's rotation and Blizzard's spell labels. */
export interface SpecPlan {
  /** Spell ids are 0 and spell names are SimC tokens until `resolveRule` names them from one log. */
  rules: RuleCondition[];
  cooldowns: PlanCooldown[];
  defensives: PlanDefensive[];
  spells: Record<string, PlanSpell | undefined>;
  /** Changes exactly when a derived part changes, so ingest re-benches an encounter only then. */
  key: string;
}

/** Builds a spec's plan from its SimC action priority list and class spell dump, and fits it to each log's own spell ids. */
@Injectable({ providedIn: 'root' })
export class SpecPlanService {
  private readonly dumps = inject(SpellDumpService);
  private readonly apl = inject(SimcAplService);
  private readonly aplRules = inject(AplRuleService);

  /** A null list is a spec SimulationCraft writes no APL for: it gets cooldowns and defensives from the labels alone. */
  build(sources: { apl: string | null; dump: string; specLabel: string }): SpecPlan {
    const own = this.ownRecords(this.dumps.readDump(sources.dump), sources.specLabel, new Set(sources.apl?.match(/\w+/g)));
    return this.assemble(sources.apl === null ? null : this.apl.readApl(sources.apl), own);
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

  /** The plan as one log played it: each button under the id that log cast it with. */
  inLog(plan: SpecPlan, ids: Record<string, number>): SpecPlan {
    const castAs = <T extends { name: string; spell_id: number }>(button: T): T => ({ ...button, spell_id: ids[button.name] ?? button.spell_id });
    return { ...plan, cooldowns: plan.cooldowns.map(castAs), defensives: plan.defensives.map(castAs) };
  }

  /** The plan as the top logs played it: each button under the id most of them cast it with, and a button none cast left out. */
  inTopLogs(plan: SpecPlan, perLog: Record<string, number>[]): SpecPlan {
    const castAs = <T extends { name: string; spell_id: number }>(button: T): T[] => {
      const cast = perLog.flatMap(ids => ids[button.name] ?? []);
      return cast.length ? [{ ...button, spell_id: mode(cast) }] : [];
    };
    return { ...plan, cooldowns: plan.cooldowns.flatMap(castAs), defensives: plan.defensives.flatMap(castAs) };
  }

  /** The rule under one log's ids and in-game names; null when a spell it needs never shows in that log. */
  resolveRule(plan: SpecPlan, rule: RuleCondition, idIn: (ids: number[], scope: SpellScope) => number | null): RuleCondition | null {
    const resolved: Record<string, unknown> = { ...rule };
    for (const [key, value] of this.spellFields(rule)) {
      const scope = this.scopeOf(rule, key);
      const found = [value].flat().flatMap(token => {
        const spell = plan.spells[token];
        const id = spell ? idIn(spell.ids, scope) : null;
        return spell && id ? [{ id, name: spell.name }] : [];
      });
      if (!found.length && !key.startsWith('except_')) return null;
      const list = Array.isArray(value);
      resolved[key] = list ? found.map(spell => spell.name) : found[0]?.name;
      resolved[key.replace(/_name(s?)$/, '_id$1')] = list ? found.map(spell => spell.id) : found[0]?.id;
    }
    return resolved as unknown as RuleCondition;
  }

  /** Every `*_name` field names a spell but `resource_name`, which names a pool. */
  private spellFields(rule: RuleCondition): [string, string | string[]][] {
    return Object.entries(rule).filter((entry): entry is [string, string | string[]] => /_names?$/.test(entry[0]) && entry[0] !== 'resource_name');
  }

  private scopeOf(rule: RuleCondition, key: string): SpellScope {
    if (/^(except_)?buff_/.test(key)) return 'self';
    return key.startsWith('aura_') && 'on' in rule ? rule.on : 'cast';
  }

  private spell(plan: SpecPlan, name: string): PlanSpell | undefined {
    return plan.spells[this.dumps.tokenize(name)];
  }

  private assemble(lines: AplLine[] | null, records: SpellRecord[]): SpecPlan {
    const byToken = group(records, record => record.token);
    const rules = lines ? this.aplRules.derive(lines, byToken) : [];
    const cooldowns = this.cooldowns(lines, byToken);
    const defensives = this.defensives(records, byToken);
    const tokens = new Set([
      ...rules.flatMap(rule => this.spellFields(rule).flatMap(([, value]) => [value].flat())),
      ...[...cooldowns, ...defensives].map(button => this.dumps.tokenize(button.name)),
    ]);
    const spells = Object.fromEntries([...tokens].flatMap(token => {
      const named = byToken.get(token) ?? [];
      return named[0] ? [[token, { name: named[0].name, ids: named.map(record => record.id) }]] : [];
    }));
    const derived = { rules, cooldowns, defensives, spells };
    return { ...derived, key: bytesToHex(sha256(utf8ToBytes(JSON.stringify(derived)))).slice(0, KEY_LENGTH) };
  }

  /** APL buttons Blizzard labels major or that hold a long cooldown, in APL order; with no APL, the labelled ones alone. */
  private cooldowns(lines: AplLine[] | null, byToken: Map<string, SpellRecord[]>): PlanCooldown[] {
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
