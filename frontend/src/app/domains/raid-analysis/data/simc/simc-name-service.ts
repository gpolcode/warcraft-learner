import { Injectable } from '@angular/core';

/** What SimC's code declares a list name as: spell ids outright, or other names to look up in the spell data. */
export interface SimcName {
  ids: number[];
  tokens: string[];
}

/** A declaration names its spell within the statement that holds the name's literal. */
const STATEMENT_REACH = 400;
const FIND_SPELL = /find_spell\(\s*(\d+)\s*\)/;
const MEMBER = /(?:\w+->)?((?:\w+\.)+\w+)\b(?!\s*\()/;
const SPELL_ID = /\b(\d{4,})\b/g;
const QUOTED = /"([^"]+)"/g;
const MEMBER_DEPTH = 2;

@Injectable({ providedIn: 'root' })
export class SimcNameService {
  /** Resolves a name SimC's code gives an aura, dot or action rather than taking it from the spell's own: `voidfall_spending`, `rend_dot`, `ca_inc`. */
  resolve(token: string, source: string): SimcName | null {
    return this.alias(token, source) ?? this.declared(token, source);
  }

  /** `ca_inc` is whichever of Celestial Alignment and Incarnation the build takes, so it reads as either. */
  private alias(token: string, source: string): SimcName | null {
    const match = new RegExp(`str_compare_ci\\(\\s*splits\\[\\s*1\\s*\\],\\s*"${token}"\\s*\\)([\\s\\S]*?)return`).exec(source);
    return match ? { ids: [], tokens: [...new Set([...(match[1] ?? '').matchAll(QUOTED)].map(([, name = '']) => name))] } : null;
  }

  private declared(token: string, source: string): SimcName | null {
    const literal = `"${token}"`;
    for (let at = source.indexOf(literal); at >= 0; at = source.indexOf(literal, at + 1)) {
      const statement = source.slice(at + literal.length, at + literal.length + STATEMENT_REACH).split(';')[0] ?? '';
      const found = FIND_SPELL.exec(statement);
      if (found) return { ids: [Number(found[1])], tokens: [] };
      const member = MEMBER.exec(statement)?.[1];
      const resolved = member ? this.member(member, source, 0) : null;
      if (resolved) return resolved;
    }
    return null;
  }

  /** `spell.rend_dot = find_spell( 388539 )`, `talent_spell_lookup( talent.x, 1256302 )`, or `find_talent_spell( ..., "Avatar" )`. */
  private member(path: string, source: string, depth: number): SimcName | null {
    const rhs = new RegExp(`(?<![\\w.])${path.replace(/\./g, '\\.')}\\s*=\\s*([^;]+);`).exec(source)?.[1];
    if (!rhs) return null;
    const ids = [...rhs.matchAll(SPELL_ID)].map(([, id]) => Number(id));
    if (ids.length) return { ids: ids.slice(-1), tokens: [] };
    const names = [...rhs.matchAll(QUOTED)].map(([, name = '']) => name);
    if (names.length) return { ids: [], tokens: names.slice(-1) };
    const next = MEMBER.exec(rhs)?.[1];
    return next && depth < MEMBER_DEPTH ? this.member(next, source, depth + 1) : null;
  }
}
