import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DefensiveUsesService } from './defensive-uses-service';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { WclEvent } from '../wcl/wcl.models';
import { cast } from '../../../../../testing/builders/events';
import { ALTER_TIME, ALTER_TIME_RETURN } from '../../../../../testing/spell-ids';

const defensiveUses = TestBed.inject(DefensiveUsesService);
const wclProjections = TestBed.inject(WclProjectionsService);
const timed = (events: WclEvent[]) => wclProjections.withRelativeS(events, 0);

const FIGHT_END_S = 300;
const PRESS_S = 20;
const AURA_LENGTH_S = 10;
const AURA_END_S = PRESS_S + AURA_LENGTH_S;

/** A self aura of the button's name, as `AuraWindowsService.spansNamed` reads it; a null end outlived the fight. */
const aura = (startS: number, endS: number | null): [number, number | null] => [startS, endS];
const usesOf = (auras: [number, number | null][], pressesS: number[]) => defensiveUses.uses(auras, pressesS, FIGHT_END_S);
const pointUse = (atS: number) => ({ start_s: atS, end_s: atS });

describe('uses', () => {
  it('reads a press that puts no aura on the caster as a point use, an external on another raider', () => {
    expect(usesOf([], [PRESS_S])).toEqual([pointUse(PRESS_S)]);
  });

  it('reads no use from a self aura no press opened, granted by another spell or another raider', () => {
    expect(usesOf([aura(PRESS_S, AURA_END_S)], [])).toEqual([]);
  });

  it('reads the self aura a press opens as the window of that use', () => {
    expect(usesOf([aura(PRESS_S, AURA_END_S)], [PRESS_S])).toEqual([{ start_s: PRESS_S, end_s: AURA_END_S }]);
  });

  it('runs a self aura still up when the fight ends to the fight end', () => {
    expect(usesOf([aura(PRESS_S, null)], [PRESS_S])).toEqual([{ start_s: PRESS_S, end_s: FIGHT_END_S }]);
  });

  describe('an aura opening near the press', () => {
    const OPENS_WITHIN_S = 1;
    const JUST_OUTSIDE_S = 1.1;

    it('reads an aura opening 1 s after the press as its window', () => {
      expect(usesOf([aura(PRESS_S + OPENS_WITHIN_S, AURA_END_S)], [PRESS_S])).toEqual([{ start_s: PRESS_S, end_s: AURA_END_S }]);
    });

    it('reads a press whose aura opens 1.1 s after it as a point use, and that aura as no use', () => {
      expect(usesOf([aura(PRESS_S + JUST_OUTSIDE_S, AURA_END_S)], [PRESS_S])).toEqual([pointUse(PRESS_S)]);
    });

    it('reads an aura the log opens 1 s before the press as its window', () => {
      expect(usesOf([aura(PRESS_S - OPENS_WITHIN_S, AURA_END_S)], [PRESS_S])).toEqual([{ start_s: PRESS_S, end_s: AURA_END_S }]);
    });

    it('reads a press 1.1 s into an aura from elsewhere as a point use, and that aura as no use', () => {
      expect(usesOf([aura(PRESS_S - JUST_OUTSIDE_S, AURA_END_S)], [PRESS_S])).toEqual([pointUse(PRESS_S)]);
    });
  });

  describe('a second press', () => {
    const windowed = { start_s: PRESS_S, end_s: AURA_END_S };

    it('reads a press inside the aura an earlier press opened as no new use, like a return that closes it', () => {
      const RETURN_S = AURA_END_S;
      expect(usesOf([aura(PRESS_S, AURA_END_S)], [PRESS_S, RETURN_S])).toEqual([windowed]);
    });

    it('reads a press just after that aura closes as a new use', () => {
      const AFTER_S = AURA_END_S + 0.1;
      expect(usesOf([aura(PRESS_S, AURA_END_S)], [PRESS_S, AFTER_S])).toEqual([windowed, pointUse(AFTER_S)]);
    });
  });

  describe('an aura up at the pull', () => {
    it('reads an aura starting at 0:00 with no press as a use at 0:00', () => {
      expect(usesOf([aura(0, AURA_LENGTH_S)], [])).toEqual([{ start_s: 0, end_s: AURA_LENGTH_S }]);
    });

    it('reads no use from an aura starting just after 0:00 with no press', () => {
      const JUST_AFTER_PULL_S = 0.1;
      expect(usesOf([aura(JUST_AFTER_PULL_S, AURA_LENGTH_S)], [])).toEqual([]);
    });

    it('reads a press at 0:00 that opens its aura as one use, not a second one from the pull', () => {
      expect(usesOf([aura(0, AURA_LENGTH_S)], [0])).toEqual([{ start_s: 0, end_s: AURA_LENGTH_S }]);
    });

    it('lists the use from the pull before the presses, the presses in time order', () => {
      const LATER_S = PRESS_S + AURA_LENGTH_S * 2;
      expect(usesOf([aura(0, AURA_LENGTH_S)], [LATER_S, PRESS_S])).toEqual([
        { start_s: 0, end_s: AURA_LENGTH_S }, pointUse(PRESS_S), pointUse(LATER_S),
      ]);
    });
  });

  it('reads a press at the fight end as a use, and one past it as none', () => {
    const PAST_END_S = FIGHT_END_S + 1;
    expect(usesOf([], [FIGHT_END_S])).toEqual([pointUse(FIGHT_END_S)]);
    expect(usesOf([], [PAST_END_S])).toEqual([]);
  });
});

describe('castTimesS', () => {
  it('reads the casts of the button\'s own id as its presses, not a return logged under another id of its name', () => {
    const RETURN_S = PRESS_S + AURA_LENGTH_S;
    expect(defensiveUses.castTimesS(timed([cast(ALTER_TIME, PRESS_S), cast(ALTER_TIME_RETURN, RETURN_S)]), ALTER_TIME)).toEqual([PRESS_S]);
  });
});
