import { Injectable } from '@angular/core';
import { sum } from 'd3-array';
import { UNKNOWN, CastMoment, FactContext, FactKind, FactPath, FactReader, FactStream, FieldRow, Range } from '../priority-list.models';
import { Words } from '../list-words';

interface BuildState {
  moment: CastMoment;
  ctx: FactContext;
}

/** The ranks the player holds over the talent's entries; null for a log without a talent tree, or a talent the tree does not name. */
const rank = ({ ctx }: BuildState, path: FactPath): { rank: number; points: number } | null => {
  const talent = ctx.list.talents[path.subject];
  const picked = ctx.talents;
  return talent && picked ? { rank: sum(talent.entries, entry => picked.get(entry) ?? 0), points: talent.points ?? 1 } : null;
};
const ranked = (read: (rank: number, points: number) => number) => (state: BuildState, path: FactPath): Range => {
  const held = rank(state, path);
  return held ? [read(held.rank, held.points), read(held.rank, held.points)] : UNKNOWN;
};

const FIELDS: Record<string, FieldRow<BuildState> | undefined> = {
  enabled: { value: ranked((held, points) => Number(held >= points)), words: { frame: 'flag', states: ['Picked', 'Not picked'], flag: (noun, holds) => `${holds ? 'with' : 'without'} ${noun}` } },
  rank: { value: ranked(held => held), words: { frame: 'count', unit: 'ranks' } },
  variable: {
    value: ({ moment }, path) => moment.variables?.get(path.subject) ?? UNKNOWN,
    words: {
      frame: 'amount', unit: '', states: ['Holds', 'Does not hold'],
      flag: (noun, holds) => `${holds ? 'when' : 'unless'} ${noun} holds`,
      at: (noun, op, n) => `with ${noun} ${Words.lessMore(op)} ${n}`,
    },
  },
};

/** The player's build and the list's own variables: settled before the pull, or replayed to the cast. */
@Injectable({ providedIn: 'root' })
export class BuildFacts implements FactReader {
  readonly kinds: FactKind[] = ['build', 'variable'];
  readonly fields = FIELDS;

  streams(): FactStream[] {
    return [];
  }

  read(path: FactPath, moment: CastMoment, ctx: FactContext): Range {
    return FIELDS[path.field]?.value?.({ moment, ctx }, path) ?? UNKNOWN;
  }
}
