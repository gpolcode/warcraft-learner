import { Injectable } from '@angular/core';

export interface SpellRecord {
  id: number;
  name: string;
  /** The name as SimulationCraft writes it in an APL: `Odyn's Fury` is `odyns_fury`. */
  token: string;
  cooldown: number;
  /** 1 for a button without charges. */
  charges: number;
  /** An aura's base seconds; 0 for none or an endless one. */
  duration: number;
  /** 0 for a spell off the global cooldown. */
  gcd: number;
  castTime: number;
  /** What pressing it spends, per WCL power type, in the game's own units. */
  costs: SpellCost[];
  maxStacks: number;
  /** Blizzard's own `Major Cooldowns` label. */
  major: boolean;
  /** Blizzard's `Big Defensive` or `External Defensive` attribute. */
  defensive: boolean;
  talented: boolean;
  /** The specs a talent belongs to; null for a class-wide spell or class-tree talent. */
  specs: string[] | null;
}

export interface SpellCost {
  type: number;
  amount: number;
}

/** Reads the few fields a plan needs from SimulationCraft's per-class spell data dump. */
@Injectable({ providedIn: 'root' })
export class SpellDumpService {
  tokenize(name: string): string {
    return name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
  }

  readDump(text: string): SpellRecord[] {
    return text.split(/^(?=Name {2,}: )/m).flatMap(block => this.record(block) ?? []);
  }

  private record(block: string): SpellRecord | null {
    // SimC suffixes `(desc=Artifact)` to tell same-named records apart; the in-game name, and so the APL token, has none.
    const [, name, id] = /^Name +: (.+?)(?: \(desc=[^)]*\))? \(id=(\d+)\)/.exec(block) ?? [];
    if (!name || !id) return null;
    return {
      id: Number(id), name, token: this.tokenize(name),
      cooldown: this.cooldown(block),
      charges: Number(/^Charges +: (\d+) \(/m.exec(block)?.[1] ?? 1),
      duration: this.seconds(block, 'Duration'),
      gcd: this.seconds(block, 'GCD'),
      castTime: this.seconds(block, 'Cast Time'),
      costs: this.costs(block),
      maxStacks: Number(/^Stacks +: (?:\d+ initial, )?(\d+) maximum/m.exec(block)?.[1] ?? 0),
      major: block.includes(': 690: Major Cooldowns'),
      defensive: /(Big|External) Defensive \(\d+\)/.test(block),
      ...this.talent(block),
    };
  }

  private talent(block: string): Pick<SpellRecord, 'talented' | 'specs'> {
    const talent = /^Talent Entry +: (.+?) \[tree=(\w+)/m.exec(block);
    return { talented: !!talent, specs: talent ? this.talentSpecs(talent[1] ?? '', talent[2] ?? '') : null };
  }

  /** A charged button's recharge is its cooldown. */
  private cooldown(block: string): number {
    const charges = /^Charges +: \d+ \((\d+(?:\.\d+)?) seconds cooldown\)/m.exec(block);
    return Number((charges ?? /^Cooldown +: (\d+(?:\.\d+)?) seconds/m.exec(block))?.[1] ?? 0);
  }

  private seconds(block: string, field: string): number {
    return Number(new RegExp(`^${field} +: (\\d+(?:\\.\\d+)?) seconds`, 'm').exec(block)?.[1] ?? 0);
  }

  /** `1 - 5 Combo Points (4)` costs its minimum; a negative amount is a gain and a mana share is no pool a list names. */
  private costs(block: string): SpellCost[] {
    return [...block.matchAll(/^Resource +: (\d+)(?: - \d+)? [A-Z][A-Za-z ]+ \((\d+)\)/gm)]
      .map(([, amount, type]) => ({ type: Number(type), amount: Number(amount) }));
  }

  /** A spec-tree talent names its spec; a hero tree lists its specs in parentheses, `Colossus (Arms, Protection)`. */
  private talentSpecs(entry: string, tree: string): string[] | null {
    if (tree === 'spec') return [entry];
    const listed = /\((.+)\)$/.exec(entry)?.[1];
    return tree === 'hero' && listed ? listed.split(', ') : null;
  }
}
