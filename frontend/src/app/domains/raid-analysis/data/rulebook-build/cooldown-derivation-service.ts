import { Injectable, inject } from '@angular/core';
import { median } from 'd3-array';
import type { ResolvedAction, SpellEffect, SpellRecord } from '../simc/simc.models';
import type { OpeningSequenceCondition } from '../rulebook/rulebook.models';
import { AbilityIndexService } from './ability-index-service';
import type { AbilityIndex } from './rulebook-build.models';

const DEFENSIVE_MIN_COOLDOWN_S = 15;
/** A button the top parses press for under this share of its possible uses is utility, not an output cooldown. */
const MIN_USAGE_SHARE = 0.3;
/** Effect subtypes that make a self-cast a defensive, in the dump's own words; a crowd-control immunity is utility, not mitigation. */
const DEFENSIVE_EFFECT = /Damage Taken%|Absorb Damage|School Immunity|Damage Immunity|Dodge%|Parry%|Periodic Heal%|Heal%|Increase Health|Max Health|Healing Received|Spell Reflection|Deflect/;
const NOT_DEFENSIVE = 'from Caster';
/** A percentage effect at zero is a hook for a talent to fill, not a defensive on its own; a flat absorb or a dodge is real at zero. */
const NEEDS_MAGNITUDE = /Damage Taken%|Heal%|Increase Health|Max Health|Healing Received/;
/** A cooldown first pressed inside this window in most sampled parses belongs to the opener. */
const OPENER_WINDOW_S = 30;
const OPENER_PARSE_SHARE = 0.6;
const MIN_OPENER_SAMPLES = 3;

export interface MajorCooldownEntry {
  record: SpellRecord;
  lines: ResolvedAction[];
  talentGated: boolean;
  openerPriority: number | null;
}

export interface DefensiveEntry {
  record: SpellRecord;
  /** The self effect that made it a defensive, for the coaching sentence. */
  effect: { subtype: string; baseValue: number | null };
}

@Injectable({ providedIn: 'root' })
export class CooldownDerivationService {
  private readonly abilities = inject(AbilityIndexService);

  /** Every APL action whose resolved record comes back in 30s or more, in priority order, with its opener slot read from the parses. */
  majorCooldowns(actions: ResolvedAction[], index: AbilityIndex): MajorCooldownEntry[] {
    const byId = new Map<number, MajorCooldownEntry>();
    for (const action of actions) {
      const record = this.abilities.cast(index, action.action);
      if (!record || !this.abilities.isMajorCooldown(record) || this.abilities.usageShare(index, record) < MIN_USAGE_SHARE) continue;
      const entry = byId.get(record.id) ?? { record, lines: [], talentGated: record.talent !== null, openerPriority: null };
      entry.lines.push(action);
      byId.set(record.id, entry);
    }
    const entries = [...byId.values()];
    const opener = this.openerOrder(entries.map(entry => entry.record), index);
    for (const entry of entries) entry.openerPriority = opener.get(entry.record.id) ?? null;
    return entries;
  }

  /** The order top parses press the major cooldowns in, keyed by id, for those pressed inside the opener window in most sampled parses. */
  private openerOrder(records: SpellRecord[], index: AbilityIndex): Map<number, number> {
    const { sampleCount, firstCastS } = index.observation;
    if (sampleCount < MIN_OPENER_SAMPLES) return new Map();
    const early = records.flatMap(record => {
      const times = (firstCastS.get(record.id) ?? []).filter(atS => atS <= OPENER_WINDOW_S);
      return times.length >= OPENER_PARSE_SHARE * sampleCount ? [{ id: record.id, atS: median(times) ?? 0 }] : [];
    }).sort((a, b) => a.atS - b.atS);
    return new Map(early.map((entry, position) => [entry.id, position + 1]));
  }

  openingSequence(cooldowns: MajorCooldownEntry[]): OpeningSequenceCondition | null {
    const ordered = cooldowns.filter(entry => entry.openerPriority !== null)
      .sort((a, b) => (a.openerPriority ?? 0) - (b.openerPriority ?? 0));
    if (ordered.length < 2) return null;
    return { kind: 'opening_sequence', spell_ids: ordered.map(entry => entry.record.id), spell_names: ordered.map(entry => entry.record.name) };
  }

  /** Class and spec buttons of 15s or more whose own effect reduces, absorbs, or heals what the player takes; a button the APL presses is rotation, not mitigation. */
  defensives(index: AbilityIndex, aplTokens: Set<string>): DefensiveEntry[] {
    const entries: DefensiveEntry[] = [];
    for (const [token, records] of index.byToken) {
      const record = this.abilities.cast(index, token);
      if (!record || !records.includes(record) || aplTokens.has(token)) continue;
      if ((this.abilities.effectiveCooldownS(record) ?? 0) < DEFENSIVE_MIN_COOLDOWN_S) continue;
      // The talent node granting a spell is a passive twin under the same name, so the other-spec check reads every record.
      if (records.some(candidate => this.abilities.talentOfAnotherSpec(candidate, index.specLabel))) continue;
      const effect = record.effects.find(candidate => this.defensiveEffect(candidate));
      if (effect?.subtype) entries.push({ record, effect: { subtype: effect.subtype, baseValue: effect.baseValue } });
    }
    return entries.sort((a, b) => (this.abilities.effectiveCooldownS(a.record) ?? 0) - (this.abilities.effectiveCooldownS(b.record) ?? 0));
  }

  private defensiveEffect(effect: SpellEffect): boolean {
    if (effect.type !== 'Apply Aura' || effect.subtype === null) return false;
    if (!DEFENSIVE_EFFECT.test(effect.subtype) || effect.subtype.includes(NOT_DEFENSIVE)) return false;
    if (NEEDS_MAGNITUDE.test(effect.subtype) && !effect.baseValue) return false;
    return effect.target === 'self' || effect.subtype.includes('Health');
  }
}
