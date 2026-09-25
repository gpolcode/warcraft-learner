import { Injectable } from '@angular/core';
import type { FactReader, FactStream, Range } from '../priority-list.models';

const DUNGEON = /^fight_style\.(dungeonroute|dungeonslice)$/;

/** The app reads raid bosses only, so a dungeon fight style is never the one being played. */
@Injectable({ providedIn: 'root' })
export class FightStyleFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return DUNGEON.test(name);
  }

  read(): Range {
    return [0, 0];
  }
}
