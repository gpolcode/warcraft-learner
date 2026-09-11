import { Injectable } from '@angular/core';
import type { SpellEffect, SpellRecord, SpellResource, SpellTalentEntry } from './simc.models';

const NAME_LINE = /^Name\s+:\s(.*?)(?: \(desc=[^)]*\))? \(id=(\d+)\)(?: \[([^\]]*)\])?/;
const FIELD_LINE = /^([A-Z][A-Za-z ]+?)\s+:\s?(.*)$/;
const EFFECT_LINE = /^#\d+\s+\(id=\d+\)\s+:\s(.*)$/;
const EFFECT_DETAIL = /^\s{10,}(.*)$/;
const TIME_SPAN = /(-?\d+(?:\.\d+)?)\s(seconds|minutes|hours|second|minute|hour)/;
const CHARGES = /^(\d+)\s\((\d+(?:\.\d+)?)\s(seconds|minutes|hours)\scooldown\)/;
const STACKS = /(\d+)\smaximum/;
const RESOURCE = /^(?:(\d+(?:\.\d+)?)(?:\s-\s(\d+(?:\.\d+)?))?)\s.*?\((\d+)\)/;
const TALENT = /^(.*?)\s\[.*?tree=(class|spec|hero)/;
const NUMBERED = /^(.*?)\s\(\d+\)(?::|$)/;
const EXECUTE_HEALTH = /(?:below|less than|under)\s(?:(\d+)|\$s(\d))%\s(?:of\s(?:their\s)?)?health/i;
const EFFECT_TARGET = /Target:\s([A-Za-z ]+?)\s\(\d+\)/;
const EFFECT_BASE_VALUE = /Base Value:\s(-?\d+(?:\.\d+)?)/;

const SECONDS_PER: Record<string, number> = { second: 1, seconds: 1, minute: 60, minutes: 60, hour: 3600, hours: 3600 };

interface ParseState {
  records: SpellRecord[];
  current: SpellRecord | null;
  effect: SpellEffect | null;
}

@Injectable({ providedIn: 'root' })
export class SpellDataDumpService {

  parse(text: string): SpellRecord[] {
    const state: ParseState = { records: [], current: null, effect: null };
    // A description's own line breaks arrive as bare carriage returns, which `.` never matches; stripping them keeps every field line matchable.
    for (const line of text.split('\n')) this.consume(state, line.replace(/\r/g, ''));
    return state.records;
  }

  private consume(state: ParseState, line: string): void {
    const name = NAME_LINE.exec(line);
    if (name) {
      state.current = this.emptyRecord(Number(name[2]), name[1] ?? '', name[3] ?? '');
      state.records.push(state.current);
      state.effect = null;
      return;
    }
    if (state.current) this.consumeRecordLine(state, state.current, line);
  }

  private consumeRecordLine(state: ParseState, record: SpellRecord, line: string): void {
    const effectLine = EFFECT_LINE.exec(line);
    if (effectLine) {
      state.effect = this.effectOf(effectLine[1] ?? '');
      record.effects.push(state.effect);
      return;
    }
    const detail = EFFECT_DETAIL.exec(line);
    if (detail && state.effect) { this.applyEffectDetail(state.effect, detail[1] ?? ''); return; }
    const field = FIELD_LINE.exec(line);
    if (field) { state.effect = null; this.applyField(record, field[1] ?? '', field[2] ?? ''); }
  }

  private emptyRecord(id: number, name: string, flags: string): SpellRecord {
    return {
      id, name, passive: flags.includes('Passive'), hidden: flags.includes('Hidden'),
      className: null, talent: null, cooldownS: null, rechargeS: null, durationS: null, maxStacks: null,
      resources: [], gcd: false, castTimeS: null, executeHealthPct: null, effects: [],
    };
  }

  private seconds(text: string): number | null {
    const match = TIME_SPAN.exec(text);
    if (!match) return null;
    return Number(match[1]) * (SECONDS_PER[match[2] ?? ''] ?? 1);
  }

  private applyField(record: SpellRecord, field: string, value: string): void {
    if (this.applyTiming(record, field, value)) return;
    switch (field) {
      case 'Class': record.className = value.trim(); break;
      case 'Talent Entry': record.talent = this.talentOf(value); break;
      case 'Stacks': record.maxStacks = this.stacksOf(value); break;
      case 'Resource': { const resource = this.resourceOf(value); if (resource) record.resources.push(resource); break; }
      default: this.applyText(record, field, value);
    }
  }

  private applyText(record: SpellRecord, field: string, value: string): void {
    if (field === 'Attributes' && value.includes('Passive (6)')) record.passive = true;
    if (field === 'Description' || field === 'Tooltip') record.executeHealthPct ??= this.executeHealthOf(record, value);
  }

  private applyTiming(record: SpellRecord, field: string, value: string): boolean {
    switch (field) {
      case 'Cooldown': record.cooldownS = this.seconds(value); return true;
      case 'Duration': record.durationS = this.seconds(value); return true;
      case 'Cast Time': record.castTimeS = this.seconds(value); return true;
      case 'GCD': record.gcd = true; return true;
      case 'Charges': record.rechargeS = this.rechargeOf(value); return true;
      default: return false;
    }
  }

  /** A tooltip writes the threshold as `$s2%`, the second effect's base value, so the effects must already be read. */
  private executeHealthOf(record: SpellRecord, description: string): number | null {
    const match = EXECUTE_HEALTH.exec(description);
    if (!match) return null;
    if (match[1] !== undefined) return Number(match[1]);
    const effect = record.effects[Number(match[2]) - 1];
    return effect?.baseValue ?? null;
  }

  private talentOf(value: string): SpellTalentEntry | null {
    const match = TALENT.exec(value);
    if (!match) return null;
    return { owner: match[1] ?? '', tree: match[2] as SpellTalentEntry['tree'] };
  }

  private rechargeOf(value: string): number | null {
    const match = CHARGES.exec(value);
    return match ? Number(match[2]) * (SECONDS_PER[match[3] ?? ''] ?? 1) : null;
  }

  private stacksOf(value: string): number | null {
    const match = STACKS.exec(value);
    return match ? Number(match[1]) : null;
  }

  /** `35 Energy (3) (id=148)` and `1 - 5 Combo Points (4)`: the amount is the cost, the parenthesised number the WCL power type. */
  private resourceOf(value: string): SpellResource | null {
    const match = RESOURCE.exec(value);
    if (!match) return null;
    return { amount: Number(match[1]), powerType: Number(match[3]) };
  }

  /** `Apply Aura (6) | Periodic Damage (3): nature every 2 seconds` is a type and a subtype, each named before its number. */
  private label(text: string): string {
    return NUMBERED.exec(text)?.[1] ?? text.trim();
  }

  private effectOf(text: string): SpellEffect {
    const [head = '', sub] = text.split(' | ');
    return { type: this.label(head), subtype: sub === undefined ? null : this.label(sub), target: 'other', baseValue: null };
  }

  private applyEffectDetail(effect: SpellEffect, text: string): void {
    const target = EFFECT_TARGET.exec(text);
    if (target) {
      const label = target[1] ?? '';
      effect.target = label === 'Self' ? 'self' : label.includes('Enemy') ? 'enemy' : 'other';
    }
    const base = EFFECT_BASE_VALUE.exec(text);
    if (base) effect.baseValue = Number(base[1]);
  }

  /** SimC's action token for a spell name: lower case, runs of anything but letters and digits become one underscore. */
  token(name: string): string {
    return name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
}
