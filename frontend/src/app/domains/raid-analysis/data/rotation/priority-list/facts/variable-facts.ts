import { Injectable } from '@angular/core';
import { UNKNOWN, CastMoment, FactReader, FactStream, Range } from '../priority-list.models';

const VARIABLE = /^variable\.(\w+)$/;

@Injectable({ providedIn: 'root' })
export class VariableFacts implements FactReader {
  readonly streams: FactStream[] = [];

  matches(name: string): boolean {
    return VARIABLE.test(name);
  }

  read(name: string, moment: CastMoment): Range {
    return moment.variables?.get(VARIABLE.exec(name)?.[1] ?? '') ?? UNKNOWN;
  }
}
