import { Injectable } from '@angular/core';
import { SUMMON_PREFIXES } from '../../../simc/spec-plan-service';
import { UNKNOWN, CastMoment, FactContext, FactReader, FactStream, Range } from '../priority-list.models';

const PET = /^pet\.(\w+)\.(active|remains)$/;

@Injectable({ providedIn: 'root' })
export class PetFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return PET.test(name);
  }

  read(name: string, { atS }: CastMoment, _action: string, ctx: FactContext): Range {
    const [, pet = '', field] = PET.exec(name) ?? [];
    const summon = SUMMON_PREFIXES.map(prefix => prefix + pet).find(token => ctx.list.spells[token]?.duration);
    if (!summon) return UNKNOWN;
    const last = ctx.castTimes(summon).filter(castS => castS < atS).pop();
    const left = last === undefined ? 0 : Math.max(0, last + (ctx.list.spells[summon]?.duration ?? 0) - atS);
    return field === 'remains' ? [left, left] : left > 0 ? [1, 1] : [0, 0];
  }
}
