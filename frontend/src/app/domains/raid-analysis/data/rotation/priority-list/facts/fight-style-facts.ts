import { Injectable } from '@angular/core';
import type { FactReader, FactStream, Range } from '../priority-list.models';

const RAID = /^fight_style\.(casting)?patchwerk$/;
const DUNGEON = /^fight_style\.(dungeonroute|dungeonslice)$/;

/** The app reads raid bosses only, which SimC's Patchwerk styles stand for, so a dungeon style is never the one being played. */
@Injectable({ providedIn: 'root' })
export class FightStyleFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return RAID.test(name) || DUNGEON.test(name);
  }

  read(name: string): Range {
    return RAID.test(name) ? [1, 1] : [0, 0];
  }
}
