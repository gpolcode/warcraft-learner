import { Injectable } from '@angular/core';
import { max } from 'd3-array';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const TALENT = /^(talent\.\w+|hero_tree\.\w+|apex\.\d+)(?:\.(enabled|rank))?$/;

@Injectable({ providedIn: 'root' })
export class TalentFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return TALENT.test(name);
  }

  read(name: string, _moment: CastMoment, _action: string, ctx: FactContext): Range {
    const [, key = '', field] = TALENT.exec(name) ?? [];
    const talent = ctx.list.talents[key];
    if (!talent || !ctx.talents) return UNKNOWN;
    const picked = ctx.talents;
    const rank = max(talent.entries, entry => picked.get(entry) ?? 0) ?? 0;
    const value = field === 'rank' ? rank : Number(rank > 0);
    return [value, value];
  }
}
