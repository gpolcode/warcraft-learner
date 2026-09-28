import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DeathTimelineService } from './death-timeline-service';
import { WclProjectionsService } from './wcl-projections-service';
import { WclEvent } from '../wcl/wcl.models';
import { death, resurrect } from '../../../../../testing/builders/events';

const deathTimeline = TestBed.inject(DeathTimelineService);
const wclProjections = TestBed.inject(WclProjectionsService);
const timed = (events: WclEvent[]) => wclProjections.withRelativeS(events, 0);

const PLAYER_ID = 10;
const OTHER_PLAYER_ID = 11;
const THIRD_PLAYER_ID = 12;
const FOURTH_PLAYER_ID = 13;

describe('deadSpans', () => {
  const FIGHT_END_S = 300;
  const DIED_S = 40;
  const BACK_S = 70;

  it('runs a death with no resurrect after it to the fight end', () => {
    const spans = deathTimeline.deadSpans(timed([death(PLAYER_ID, DIED_S)]), [], FIGHT_END_S);
    expect(spans.get(PLAYER_ID)).toEqual([[DIED_S, FIGHT_END_S]]);
  });

  it('ends a death at the resurrect after it', () => {
    const spans = deathTimeline.deadSpans(timed([death(PLAYER_ID, DIED_S)]), timed([resurrect(PLAYER_ID, BACK_S)]), FIGHT_END_S);
    expect(spans.get(PLAYER_ID)).toEqual([[DIED_S, BACK_S]]);
  });

  it('does not end a death at a resurrect in the same instant, which lands before it', () => {
    const spans = deathTimeline.deadSpans(timed([death(PLAYER_ID, DIED_S)]), timed([resurrect(PLAYER_ID, DIED_S)]), FIGHT_END_S);
    expect(spans.get(PLAYER_ID)).toEqual([[DIED_S, FIGHT_END_S]]);
  });

  it('pairs each of two deaths with the resurrect that followed it', () => {
    const SECOND_DIED_S = 200;
    const spans = deathTimeline.deadSpans(
      timed([death(PLAYER_ID, SECOND_DIED_S), death(PLAYER_ID, DIED_S)]), timed([resurrect(PLAYER_ID, BACK_S)]), FIGHT_END_S,
    );
    expect(spans.get(PLAYER_ID)).toEqual([[DIED_S, BACK_S], [SECOND_DIED_S, FIGHT_END_S]]);
  });

  it('keeps each player\'s spans apart, so a raidmate\'s resurrect does not bring the player back', () => {
    const spans = deathTimeline.deadSpans(
      timed([death(PLAYER_ID, DIED_S), death(OTHER_PLAYER_ID, DIED_S)]), timed([resurrect(OTHER_PLAYER_ID, BACK_S)]), FIGHT_END_S,
    );
    expect(spans.get(PLAYER_ID)).toEqual([[DIED_S, FIGHT_END_S]]);
    expect(spans.get(OTHER_PLAYER_ID)).toEqual([[DIED_S, BACK_S]]);
  });
});

describe('firstDeadAtOnceS', () => {
  const WIPE_DEATHS = 3;

  it('marks the instant 3 players are dead at once, however far apart the deaths fall', () => {
    const FIRST_S = 20;
    const SECOND_S = 100;
    const THIRD_S = 200;
    const deaths = timed([death(PLAYER_ID, FIRST_S), death(OTHER_PLAYER_ID, SECOND_S), death(THIRD_PLAYER_ID, THIRD_S)]);
    expect(deathTimeline.firstDeadAtOnceS(deaths, [], WIPE_DEATHS)).toBe(THIRD_S);
  });

  it('drops a resurrected player from the count, so it waits for a later death', () => {
    const P1_DIED_S = 20;
    const P2_DIED_S = 30;
    const P1_BACK_S = 35;
    const P3_DIED_S = 40; // only players 2 and 3 are down here
    const P4_DIED_S = 50;
    const deaths = timed([
      death(PLAYER_ID, P1_DIED_S), death(OTHER_PLAYER_ID, P2_DIED_S), death(THIRD_PLAYER_ID, P3_DIED_S), death(FOURTH_PLAYER_ID, P4_DIED_S),
    ]);
    expect(deathTimeline.firstDeadAtOnceS(deaths, timed([resurrect(PLAYER_ID, P1_BACK_S)]), WIPE_DEATHS)).toBe(P4_DIED_S);
  });

  it('counts a resurrect in the third death\'s own instant first, so that death does not reach 3', () => {
    const FIRST_S = 20;
    const SECOND_S = 30;
    const THIRD_S = 40;
    const JUST = 0.1;
    const deaths = timed([death(PLAYER_ID, FIRST_S), death(OTHER_PLAYER_ID, SECOND_S), death(THIRD_PLAYER_ID, THIRD_S)]);
    expect(deathTimeline.firstDeadAtOnceS(deaths, timed([resurrect(PLAYER_ID, THIRD_S)]), WIPE_DEATHS)).toBeNull();
    expect(deathTimeline.firstDeadAtOnceS(deaths, timed([resurrect(PLAYER_ID, THIRD_S + JUST)]), WIPE_DEATHS)).toBe(THIRD_S);
  });

  it('is null when nobody dies', () => {
    expect(deathTimeline.firstDeadAtOnceS([], [], WIPE_DEATHS)).toBeNull();
  });
});

describe('deadWithin', () => {
  const START_S = 30;
  const END_S = 35;
  const JUST = 0.1;

  it('is true for a death inside the range', () => {
    expect(deathTimeline.deadWithin([[START_S + 1, END_S + 60]], START_S, END_S)).toBe(true);
  });

  it('is true for a death before the range the player was not back from until inside it', () => {
    expect(deathTimeline.deadWithin([[START_S - 20, START_S + JUST]], START_S, END_S)).toBe(true);
  });

  it('is false for a death at the exact range end, which the range no longer counts', () => {
    expect(deathTimeline.deadWithin([[END_S, END_S + 60]], START_S, END_S)).toBe(false);
    expect(deathTimeline.deadWithin([[END_S - JUST, END_S + 60]], START_S, END_S)).toBe(true);
  });

  it('is false for a resurrect at the exact range start', () => {
    expect(deathTimeline.deadWithin([[START_S - 20, START_S]], START_S, END_S)).toBe(false);
  });

  it('is false with no deaths', () => {
    expect(deathTimeline.deadWithin([], START_S, END_S)).toBe(false);
  });
});
