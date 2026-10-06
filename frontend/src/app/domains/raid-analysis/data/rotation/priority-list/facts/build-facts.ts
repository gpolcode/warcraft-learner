import { Injectable } from '@angular/core';
import { sum } from 'd3-array';
import { UNKNOWN, CastMoment, FactContext, FactPath, FactReader, FactStream, Range } from '../priority-list.models';

/** Talents, hero trees and apex tiers from the log's talent tree; variables as the replay left them at the cast. */
@Injectable({ providedIn: 'root' })
export class BuildFacts implements FactReader {
  readonly kind = 'build';

  streams(): FactStream[] {
    return [];
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
