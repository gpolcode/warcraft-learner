import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { beginCast, cast, fakeCast } from '../../../../../testing/builders/events';
import { planSpell } from '../../../../../testing/builders/spec-plan';
import { EVISCERATE, SHADOW_BLADES, STARFIRE, WRATH } from '../../../../../testing/spell-ids';
import { WclEvent } from '../wcl/wcl.models';
import { WclProjectionsService } from '../analysis/wcl-projections-service';
import { FamilyCaps } from '../verdict/tone.models';
import { DowntimeJudgeService } from './downtime-judge-service';
import type { IdleStretch, RotationParseMeasures } from './rotation-data-source';

const judges = TestBed.inject(DowntimeJudgeService);
const timed = (events: WclEvent[]) => TestBed.inject(WclProjectionsService).withRelativeS(events, 0);

const FLAT_GCD_S = 1;
const HASTED_GCD_S = 1.5;
const WRATH_CAST_S = 2;
const ROGUE = { eviscerate: planSpell('Eviscerate', [EVISCERATE], { gcd: FLAT_GCD_S }), shadow_blades: planSpell('Shadow Blades', [SHADOW_BLADES], { gcd: 0 }) };
const DRUID = {
  wrath: planSpell('Wrath', [WRATH], { gcd: HASTED_GCD_S, cast_time: WRATH_CAST_S }),
  starfire: planSpell('Starfire', [STARFIRE], { gcd: HASTED_GCD_S }),
};

const FIGHT_S = 100;
const WHOLE_PULL: [number, number][] = [[0, FIGHT_S]];
const topLog = (idle: IdleStretch[] | null): RotationParseMeasures =>
  ({ idle_s: idle, lust_s: null, phase_starts: [], cd_casts_s: {}, buttons: {} });
/** Five top logs idle 10 s of a 100 s kill, no spread: the 5 s floor over 100 s alive puts the edge at 15%. */
const TOP_LOGS = Array.from({ length: 5 }, () => topLog([[40, 50]]));
const KILLS_S = TOP_LOGS.map(() => FIGHT_S);
const REFERENCE = judges.reference(TOP_LOGS, KILLS_S);
const EDGE_IDLE_S = 15;
const COMPARISON_ONLY: FamilyCaps = { capOf: () => 'neutral' };

describe('DowntimeJudgeService', () => {
  describe('idleStretches', () => {
    it('counts the time past an instant cast\'s global cooldown as idle', () => {
      expect(judges.idleStretches(timed([cast(EVISCERATE, 0), cast(EVISCERATE, 1), cast(EVISCERATE, 4)]), ROGUE)).toEqual([[2, 4]]);
    });

    it('counts nothing between casts exactly one global cooldown apart', () => {
      expect(judges.idleStretches(timed([cast(EVISCERATE, 0), cast(EVISCERATE, FLAT_GCD_S)]), ROGUE)).toEqual([]);
    });

    it('counts a hardcast busy from its begincast to its cast', () => {
      // Starfire's GCD covers 8.5 to 10, Wrath casts from 10 to 12, so only 12 to 13 is idle.
      const events = [cast(STARFIRE, 8.5), beginCast(WRATH, 10), cast(WRATH, 10 + WRATH_CAST_S), cast(STARFIRE, 13)];

      expect(judges.idleStretches(timed(events), DRUID)).toEqual([[12, 13]]);
    });

    it('hastes the global cooldown as the nearest hardcast reads it', () => {
      // Wrath cast in 1.2 s of its 2 s: haste 0.6, so Starfire's GCD runs 0.9 s.
      const events = [beginCast(WRATH, 10), cast(WRATH, 11.2), cast(STARFIRE, 20), cast(STARFIRE, 22)];

      expect(judges.idleStretches(timed(events), DRUID)).toEqual([[11.2, 20], [20.9, 22]]);
    });

    it('lets an off-GCD cast cover no idle time', () => {
      expect(judges.idleStretches(timed([cast(EVISCERATE, 0), cast(SHADOW_BLADES, 3), cast(EVISCERATE, 5)]), ROGUE)).toEqual([[1, 5]]);
    });

    it('never pairs an interrupted begincast with a later instant press', () => {
      const events = [cast(STARFIRE, 0), beginCast(WRATH, 1.5), cast(STARFIRE, 2), cast(WRATH, 6)];

      expect(judges.idleStretches(timed(events), DRUID)).toEqual([[1.5, 2], [3.5, 6]]);
    });

    it('leaves out casts WCL derives rather than the player presses', () => {
      expect(judges.idleStretches(timed([cast(EVISCERATE, 0), fakeCast(EVISCERATE, 2), cast(EVISCERATE, 4)]), ROGUE)).toEqual([[1, 4]]);
    });

    it('measures nothing under two casts', () => {
      expect(judges.idleStretches(timed([cast(EVISCERATE, 3)]), ROGUE)).toBeNull();
    });
  });

  describe('measure', () => {
    it('reads idle time as a share of alive time', () => {
      expect(judges.measure([[10, 25]], WHOLE_PULL)).toEqual({ idleS: 15, aliveS: FIGHT_S, pct: 15 });
    });

    it('counts only the alive part of a stretch that crosses a death', () => {
      // Alive 0 to 20 and 50 to 100: 18 to 20 and 50 to 52 of the stretch.
      expect(judges.measure([[18, 52]], [[0, 20], [50, FIGHT_S]])).toEqual({ idleS: 4, aliveS: 70, pct: 400 / 70 });
    });

    it('measures nothing without stretches or alive time', () => {
      expect(judges.measure(null, WHOLE_PULL)).toBeNull();
      expect(judges.measure([[10, 25]], [])).toBeNull();
    });
  });

  it('reads each top log over its own kill, skipping one with too few casts', () => {
    expect(judges.reference([topLog([[0, 10]]), topLog(null), topLog([[0, 10]])], [FIGHT_S, FIGHT_S, 2 * FIGHT_S])).toEqual([10, 5]);
  });

  it('flags amber one second of idle past the edge, quoting only the idle time past the top average', () => {
    const casting = judges.measure([[0, EDGE_IDLE_S + 1]], WHOLE_PULL);
    assert.exists(casting);

    expect(judges.finding(casting, REFERENCE, FIGHT_S)).toMatchObject({
      family: 'rotation.downtime', severity: 'amber', category: 'cast_efficiency',
      measured: { value: '16%', unit: 'idle, top 10%, 5 top logs' },
      message: 'You were idle 16% of the fight past each cast\'s global cooldown and cast time, 6s more than the average of 5 top logs. Aim for 15% or less.',
      details: { remedy: 'Fill 6s of idle time with casts.' },
    });
  });

  it('does not flag idle time exactly at the edge', () => {
    const casting = judges.measure([[0, EDGE_IDLE_S]], WHOLE_PULL);
    assert.exists(casting);

    expect(judges.finding(casting, REFERENCE, FIGHT_S)).toBeNull();
  });

  it('prints an ungraded flag as a comparison with no target or fix', () => {
    const casting = judges.measure([[0, EDGE_IDLE_S + 1]], WHOLE_PULL);
    assert.exists(casting);
    const finding = judges.finding(casting, REFERENCE, FIGHT_S, COMPARISON_ONLY);

    expect(finding?.message).toBe('You were idle 16% of the fight past each cast\'s global cooldown and cast time, 6s more than the average of 5 top logs.');
    expect(finding?.details).toBeUndefined();
  });

  it('flags nothing against fewer top logs than the minimum', () => {
    const casting = judges.measure([[0, FIGHT_S]], WHOLE_PULL);
    assert.exists(casting);

    expect(judges.finding(casting, REFERENCE.slice(1), FIGHT_S)).toBeNull();
  });
});
