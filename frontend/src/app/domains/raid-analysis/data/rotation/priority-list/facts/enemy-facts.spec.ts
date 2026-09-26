import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast, damage } from '../../../../../../../testing/builders/events';
import { castAt, factContext, priorityList } from '../priority-list-harness';
import { EnemyFacts } from './enemy-facts';

const CAST_S = 10;
/** The enemy-count reader's own window: enemies damaged this long after the cast count. */
const WINDOW_S = 3;
const BOSS = 1;
const ADD = 2;
const enemies = TestBed.inject(EnemyFacts);

const count = (hits: [number, number][]) => {
  const ctx = factContext(priorityList(), { casts: [cast(1, CAST_S)], damage: hits.map(([target, atS]) => damage(1, atS, 1, { target })) });
  return enemies.read('active_enemies', castAt(ctx, CAST_S), 'x', ctx);
};

describe('EnemyFacts', () => {
  it('counts every enemy damaged in the window after the cast', () => {
    expect(count([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S]])).toEqual([2, 2]);
  });

  it('leaves out an enemy first damaged just past the window', () => {
    expect(count([[BOSS, CAST_S], [ADD, CAST_S + WINDOW_S + 0.1]])).toEqual([1, 1]);
  });

  it('reads at least one enemy when the window shows no damage', () => {
    expect(count([])).toEqual([1, Infinity]);
  });
});
