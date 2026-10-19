import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { damage } from '../../../../../../testing/builders/events';
import { EnemyTimelineService } from './enemy-timeline-service';
import { factContext, priorityList } from './priority-list-harness';
import { ENEMY_STEP_S } from './priority-list.models';

const timelines = TestBed.inject(EnemyTimelineService);
const FIGHT_S = 9;

describe('EnemyTimelineService.series', () => {
  it('counts the enemies hit in each step, a hit exactly on a step\'s start opening the next', () => {
    const hits = [damage(1, 0, 1, { target: 1 }), damage(1, 1, 1, { target: 2 }), damage(1, ENEMY_STEP_S, 1, { target: 1 })];
    expect(timelines.series(factContext(priorityList(), { damage: hits, fightDurationS: FIGHT_S }))).toEqual([2, 1, null]);
  });

  it('leaves a step the player hit nothing in unknown', () => {
    expect(timelines.series(factContext(priorityList(), { fightDurationS: FIGHT_S }))).toEqual([null, null, null]);
  });
});

describe('EnemyTimelineService.timeline', () => {
  it('spans the middle of the top logs\' counts in each step', () => {
    // Nine logs hit two enemies and one hit eight; the tenth percentile and ninetieth sit at 2 and under 3.
    const series = [...Array.from({ length: 9 }, () => [2]), [8]];
    expect(timelines.timeline(series)).toEqual([[2, 3]]);
  });

  it('says a step once three top logs hit anything in it, and nothing at two', () => {
    expect(timelines.timeline([[2, 1], [2, 1], [2, null]])).toEqual([[2, 2], null]);
  });

  it('bakes no timeline when no step reaches three top logs', () => {
    expect(timelines.timeline([[2], [2]])).toBeNull();
  });
});
