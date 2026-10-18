import { assert, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DowntimeJudgeService } from './downtime-judge-service';
import type { RotationParseMeasures } from './rotation-data-source';

const judges = TestBed.inject(DowntimeJudgeService);

const FIGHT_S = 100;
const THRESHOLD_S = 1.5;
const WHOLE_PULL: [number, number][] = [[0, FIGHT_S]];
/** A press every second, then one idle stretch from `idleFromS` to the pull's end. */
const idleFrom = (idleFromS: number): number[] => [...Array.from({ length: idleFromS + 1 }, (_unused, i) => i), FIGHT_S];
const topLog = (efficiencyPct: number | null): RotationParseMeasures =>
  ({ efficiency_pct: efficiencyPct, lust_s: null, phase_starts: [], cd_casts_s: {}, buttons: {} });
/** Five top logs casting 90%, no spread: the 5s floor over 100s alive puts the edge at 85%. */
const TOP_LOGS = Array.from({ length: 5 }, () => topLog(90));
const REFERENCE = judges.reference(TOP_LOGS);
const EDGE_IDLE_S = 15;

describe('DowntimeJudgeService', () => {
  it('measures idle time and the share of alive time spent casting', () => {
    expect(judges.measure(idleFrom(FIGHT_S - EDGE_IDLE_S), THRESHOLD_S, WHOLE_PULL)).toEqual({ idleS: EDGE_IDLE_S, aliveS: FIGHT_S, pct: 85 });
  });

  it('measures nothing under two casts', () => {
    expect(judges.measure([3], THRESHOLD_S, WHOLE_PULL)).toBeNull();
  });

  it('reads the top logs that carry a share, skipping one with too few casts', () => {
    expect(judges.reference([topLog(90), topLog(null), topLog(80)])).toEqual([90, 80]);
  });

  it('flags amber one second of idle past the edge, quoting only the idle time past the top average', () => {
    const casting = judges.measure(idleFrom(FIGHT_S - EDGE_IDLE_S - 1), THRESHOLD_S, WHOLE_PULL);
    assert.exists(casting);

    expect(judges.finding(casting, REFERENCE, FIGHT_S)).toMatchObject({
      family: 'rotation.downtime', severity: 'amber', category: 'cast_efficiency',
      measured: { value: '84%', unit: 'top 90%, 5 top logs' },
      message: 'You were casting 84% of the fight, idle 6s more than the average of 5 top logs. Aim for 85% or more.',
      details: { remedy: 'Fill 6s of gaps.' },
    });
  });

  it('does not flag casting exactly at the edge', () => {
    const casting = judges.measure(idleFrom(FIGHT_S - EDGE_IDLE_S), THRESHOLD_S, WHOLE_PULL);
    assert.exists(casting);

    expect(judges.finding(casting, REFERENCE, FIGHT_S)).toBeNull();
  });

  it('flags nothing against fewer top logs than the minimum', () => {
    const casting = judges.measure([0, FIGHT_S], THRESHOLD_S, WHOLE_PULL);
    assert.exists(casting);

    expect(judges.finding(casting, REFERENCE.slice(1), FIGHT_S)).toBeNull();
  });
});
