import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CdHoldTargets } from '../encounter/encounter.models';
import { READY_TIME_FAMILY, ReadyCooldown, ReadyTimeJudgeService } from './ready-time-judge-service';

const judges = TestBed.inject(ReadyTimeJudgeService);

const NAME = 'Shadow Blades';
const FIGHT_S = 300;
const WHOLE_PULL: [number, number][] = [[0, FIGHT_S]];
const COOLDOWN_S = 90;
const SHADOW_BLADES: ReadyCooldown = { rechargeS: COOLDOWN_S, charges: 1 };
/** On cooldown from a 5s opener: ready only for the 5s before it, and the last use's cooldown outlasts the pull. */
const ON_CADENCE = [5, 95, 185, 275];
const TOP_N = 5;
const TOP_LOGS = Array.from({ length: TOP_N }, () => ({ [NAME]: ON_CADENCE }));
const KILLS = TOP_LOGS.map(() => FIGHT_S);
const VOICE = { remedy: (name: string) => `Press ${name} as soon as it is ready.` };
const readyShareOf = (castTimesS: number[], cooldown = SHADOW_BLADES) => judges.measure(castTimesS, WHOLE_PULL, cooldown, {});

describe('ReadyTimeJudgeService.readyCooldown', () => {
  it('keeps the stored cooldown when no top log presses it faster', () => {
    expect(judges.readyCooldown({ cooldown: COOLDOWN_S }, TOP_LOGS, NAME)).toEqual({ rechargeS: COOLDOWN_S, charges: 1 });
  });

  it('takes the median top log\'s fastest proven recharge when it beats the stored cooldown', () => {
    const SIXTY_APART = [5, 65, 125];
    const faster = [...Array.from({ length: 3 }, () => ({ [NAME]: SIXTY_APART })), ...TOP_LOGS.slice(0, 2)];

    expect(judges.readyCooldown({ cooldown: COOLDOWN_S }, faster, NAME).rechargeS).toBe(60);
  });

  it('lets uses spent from stored charges prove nothing, only the recharge after them', () => {
    const TWO_CHARGES_THEN_ONE = [{ [NAME]: [0, 1, 61] }];

    expect(judges.readyCooldown({ cooldown: COOLDOWN_S, charges: 2 }, TWO_CHARGES_THEN_ONE, NAME)).toEqual({ rechargeS: 61, charges: 2 });
  });
});

describe('ReadyTimeJudgeService.measure', () => {
  it('counts the time before the first use and after the last cooldown runs out', () => {
    const LAST_S = 185;

    expect(readyShareOf([5, 95, LAST_S])?.readyS).toBe(5 + FIGHT_S - (LAST_S + COOLDOWN_S));
  });

  it('counts a skipped use as the whole stretch the cooldown sat ready, and names it as the longest', () => {
    expect(readyShareOf([5, 185, 275])).toMatchObject({ readyS: 5 + COOLDOWN_S, aliveS: FIGHT_S, longest: { fromS: 95, toS: 185 } });
  });

  it('counts only the time every charge was ready', () => {
    const TWO_CHARGES: ReadyCooldown = { rechargeS: 60, charges: 2 };
    /** Ready to 10s; both charges spent by 20s, back at 70s and 130s, so full from 130s to the end. */
    const READY_S = 10 + (200 - 130);

    expect(judges.measure([10, 20], [[0, 200]], TWO_CHARGES, {})?.readyS).toBe(READY_S);
  });

  it('restarts the recharge at a use the cooldown held no charge for, as a reset would', () => {
    expect(judges.measure([0, 30], [[0, 200]], SHADOW_BLADES, {})?.readyS).toBe(200 - (30 + COOLDOWN_S));
  });

  it('leaves out a wait that ends on a use a hold target explains', () => {
    const heldTo185: CdHoldTargets = { '2': { target_s: 185, delay_s: 90, band_s: 5, effective_cd_s: COOLDOWN_S, count: 4, total_samples: 5 } };

    expect(judges.measure([5, 185, 275], WHOLE_PULL, SHADOW_BLADES, heldTo185)?.readyS).toBe(5);
  });

  it('leaves out a wait that crosses a death, and keeps one wholly inside alive time', () => {
    const diedFrom100To150: [number, number][] = [[0, 100], [150, FIGHT_S]];

    expect(judges.measure([5, 185, 275], diedFrom100To150, SHADOW_BLADES, {})?.readyS).toBe(5);
    expect(judges.measure([5, 95, 250], diedFrom100To150, SHADOW_BLADES, {})?.readyS).toBe(5 + 250 - 185);
  });

  it('measures nothing without alive time', () => {
    expect(judges.measure([5], [], SHADOW_BLADES, {})).toBeNull();
  });
});

describe('ReadyTimeJudgeService.reference', () => {
  it('reads each top log that used it over the player\'s spans, cut at its own kill', () => {
    const SHORT_KILL_S = 150;
    const shares = judges.reference([{ [NAME]: ON_CADENCE }, {}, { [NAME]: [5, 95] }], [FIGHT_S, FIGHT_S, SHORT_KILL_S], NAME, SHADOW_BLADES, {}, WHOLE_PULL);

    expect(shares).toEqual([5 / FIGHT_S, 5 / SHORT_KILL_S]);
  });
});

describe('ReadyTimeJudgeService.judge', () => {
  const reference = judges.reference(TOP_LOGS, KILLS, NAME, SHADOW_BLADES, {}, WHOLE_PULL);
  const judge = (castTimesS: number[]) => {
    const ready = readyShareOf(castTimesS);
    return ready && judges.judge(ready, reference, SHADOW_BLADES);
  };

  it('flags ready time of one whole cooldown beyond the top logs\' spread, and not a second less', () => {
    expect(judge([0, 180, 270])?.level).toBe('red');
    expect(judge([0, 179, 269])?.level).toBe('neutral');
  });

  it('does not flag ready time at the edge of the top logs\' spread, even past the game amount', () => {
    const ONE_SECOND: ReadyCooldown = { rechargeS: 1, charges: 1 };
    /** Identical top logs leave no spread, so the edge is their 5s plus the 5s timing floor. */
    const EDGE_S = 10;
    const atEdge = { readyS: EDGE_S, aliveS: FIGHT_S, share: EDGE_S / FIGHT_S, longest: null };

    expect(judges.judge(atEdge, reference, ONE_SECOND).level).toBe('neutral');
    expect(judges.judge({ ...atEdge, readyS: EDGE_S + 1, share: (EDGE_S + 1) / FIGHT_S }, reference, ONE_SECOND).level).toBe('red');
  });
});

describe('ReadyTimeJudgeService.finding', () => {
  const reference = judges.reference(TOP_LOGS, KILLS, NAME, SHADOW_BLADES, {}, WHOLE_PULL);
  const findingFor = (castTimesS: number[], fightDurationS = FIGHT_S) => {
    const ready = readyShareOf(castTimesS);
    return ready && judges.finding(READY_TIME_FAMILY, VOICE, NAME, { ready, reference, cooldown: SHADOW_BLADES, fightDurationS });
  };

  it('names the ready time, the longest stretch, the top logs and the target on a flagged row', () => {
    expect(findingFor([5, 185, 275])).toMatchObject({
      family: 'rotation.ready_time', severity: 'red', category: 'lost_cooldown', cd_name: NAME, timestamp_s: 95,
      measured: { value: '01:35', unit: 'ready, top 00:05, 5 top logs' },
      message: 'Shadow Blades sat ready and unpressed for 01:35 of the 05:00 fight, the longest from 01:35 to 03:05. '
        + '5 top logs leave it ready 00:05 on average in that time. Aim for 00:10 or less.',
      details: { remedy: 'Press Shadow Blades as soon as it is ready.' },
    });
  });

  it('says nothing of ready time inside the top logs\' spread', () => {
    expect(findingFor(ON_CADENCE)).toBeNull();
  });
});
