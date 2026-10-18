import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LeaveOneOutService } from './leave-one-out-service';
import { bench } from '../../rotation/rotation-harness';
import { benchWith, CLOAK_META, defBench } from '../../defensive/defensive-harness';
import { benchSources } from '../../../../../../testing/builders/bench-sources';
import { CLOAK, defensiveLog, defensiveWindow, ON_CADENCE, rotationLog, SB } from './calibration-harness';

const folds = TestBed.inject(LeaveOneOutService);

const TOP_N = 6;
const HELD_OUT = 2;
const rotationBench = (logs = Array.from({ length: TOP_N }, () => rotationLog())) =>
  bench({ sources: benchSources(logs.length), sample_count: logs.length, per_parse: logs });

describe('LeaveOneOutService fold', () => {
  it('drops the held-out log from the sources and every per-log array', () => {
    const folded = folds.fold(rotationBench(), HELD_OUT);

    expect(folded.sources.map(source => source.rank)).toEqual([1, 2, 4, 5, 6]);
    expect(folded.per_parse).toHaveLength(TOP_N - 1);
    expect(folded.sample_count).toBe(TOP_N - 1);
  });
});

describe('LeaveOneOutService foldRotation', () => {
  it('rebuilds the cadence bench from the other top logs alone', () => {
    const logs = Array.from({ length: TOP_N }, (_unused, index) => rotationLog({ cd_casts_s: { [SB]: index === HELD_OUT ? [] : ON_CADENCE } }));

    const cdBench = folds.foldRotation(rotationBench(logs), HELD_OUT).per_cd_benchmarks[SB];

    expect(cdBench?.sample_count).toBe(TOP_N - 1);
    expect(cdBench?.used_sample_count).toBe(TOP_N - 1);
    expect(cdBench?.median_uses).toBe(ON_CADENCE.length);
  });

  it('drops a cooldown only the held-out log cast, as the plan gate would', () => {
    const logs = Array.from({ length: TOP_N }, (_unused, index) => rotationLog({ cd_casts_s: { [SB]: index === HELD_OUT ? ON_CADENCE : [] } }));

    expect(folds.foldRotation(rotationBench(logs), HELD_OUT).major_cooldowns).toEqual([]);
  });

  it('keeps a cooldown one other top log cast', () => {
    const logs = Array.from({ length: TOP_N }, (_unused, index) => rotationLog({ cd_casts_s: { [SB]: index <= 1 ? ON_CADENCE : [] } }));

    expect(folds.foldRotation(rotationBench(logs), 0).major_cooldowns.map(cooldown => cooldown.name)).toEqual([SB]);
  });
});

describe('LeaveOneOutService foldDefensive', () => {
  const defensiveBench = (windowParses: number[]) => benchWith({
    sources: benchSources(TOP_N), sample_count: TOP_N, per_parse: Array.from({ length: TOP_N }, () => defensiveLog()),
    defensives: [CLOAK_META], per_defensive_benchmarks: { [CLOAK]: defBench() }, defensive_windows: [defensiveWindow(windowParses)],
  });

  it('drops the held-out log\'s members and renumbers the later ones', () => {
    const [window] = folds.foldDefensive(defensiveBench([0, 2, 3, 5]), HELD_OUT).defensive_windows;

    expect(window?.members.map(member => member.parse)).toEqual([0, 2, 4]);
    expect(window?.index).toBe(0);
  });

  it('keeps a window half of the other top logs still form', () => {
    const remaining = TOP_N - 1;
    const half = Math.ceil(remaining / 2);
    const parses = [HELD_OUT, ...[0, 1, 3, 4, 5].slice(0, half)];

    expect(folds.foldDefensive(defensiveBench(parses), HELD_OUT).defensive_windows).toHaveLength(1);
  });

  it('drops a window under half of the other top logs form without the held-out log', () => {
    const remaining = TOP_N - 1;
    const underHalf = Math.ceil(remaining / 2) - 1;
    const parses = [HELD_OUT, ...[0, 1, 3, 4, 5].slice(0, underHalf)];

    expect(folds.foldDefensive(defensiveBench(parses), HELD_OUT).defensive_windows).toEqual([]);
  });

  it('rebuilds the defensive cadence from the other top logs', () => {
    expect(folds.foldDefensive(defensiveBench([0, 1, 3]), HELD_OUT).per_defensive_benchmarks[CLOAK]?.sample_count).toBe(TOP_N - 1);
  });
});
