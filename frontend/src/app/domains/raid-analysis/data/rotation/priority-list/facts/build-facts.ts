import { Injectable } from '@angular/core';
import { sum } from 'd3-array';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, Range } from '../priority-list.models';

@Injectable({ providedIn: 'root' })
export class BuildFacts implements FactReader {
  readonly kind = 'build';

  streams(): FactStream[] {
    return [];
  }

  answers({ field }: FactPath): boolean {
    return field === 'enabled' || field === 'rank' || field === 'variable';
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    if (path.field === 'variable') return moment.variables?.get(path.subject) ?? UNKNOWN;
    const talent = ctx.list.talents[path.subject];
    const picked = ctx.talents;
    if (!talent || !picked) return UNKNOWN;
    const rank = sum(talent.entries, entry => picked.get(entry) ?? 0);
    const value = path.field === 'rank' ? rank : Number(rank >= (talent.points ?? 1));
    return [value, value];
  }
}
