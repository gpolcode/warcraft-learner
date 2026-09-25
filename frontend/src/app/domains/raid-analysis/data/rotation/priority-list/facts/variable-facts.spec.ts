import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../../testing/builders/events';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { VariableFacts } from './variable-facts';

const CAST_S = 10;
const variables = TestBed.inject(VariableFacts);
const ctx = factContext(priorityList(), { casts: [cast(1, CAST_S)] });

describe('VariableFacts', () => {
  it('reads a variable as the replay left it at the cast', () => {
    const moment = { ...castAt(ctx, CAST_S), variables: new Map([['pool', [1, 1] as const]]) };
    expect(variables.read('variable.pool', moment)).toEqual([1, 1]);
  });

  it('reads a variable the replay never set as unknown', () => {
    expect(variables.read('variable.pool', castAt(ctx, CAST_S))).toEqual([-Infinity, Infinity]);
  });
});
