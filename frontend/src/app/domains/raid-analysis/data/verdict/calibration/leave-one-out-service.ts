import { inject, Injectable } from '@angular/core';
import { BurstWindow } from '../../analysis/analysis.models';
import { CastCadenceService } from '../../analysis/cast-cadence-service';
import { CadenceBenchmark } from '../../encounter/encounter.models';
import { RotationBench } from '../../rotation/rotation-data-source';
import { DefensiveBench } from '../../defensive/defensive-data-source';
import { GearBench } from '../../gear/gear-data-source';
import { GearJudgeService } from '../../gear/gear-judge-service';
import { BurstBench, BurstParseMeasures } from '../../burst-windows/burst-data-source';
import { CLUSTER_MIN_FRAC } from '../../burst-windows/burst-transform-service';
import { avgOr, medianOr } from '../../analysis/analysis-math';
import type { ParseRanking } from '../../wcl/wcl.models';

/** Share of the remaining top logs a defensive window needs to form, as the defensive transform clusters it. */
const DEFENSIVE_WINDOW_SHARE = 0.5;
const MIN_WINDOW_PARSES = 2;

interface Folded<P> {
  sources: ParseRanking[];
  per_parse: P[];
  sample_count: number;
}

/** A window kept by a fold, with its index in the full bench. */
export type FoldedWindow = BurstWindow & { index: number };

/** A burst bench rebuilt without one top log; every window keeps its index in the full bench. */
export type FoldedBurstBench = Omit<BurstBench, 'windows' | 'per_parse'> & { windows: FoldedWindow[]; per_parse: BurstParseMeasures[] };

export type FoldedDefensiveBench = Omit<DefensiveBench, 'defensive_windows'> & { defensive_windows: FoldedWindow[] };

/** A plan button with the cooldown its cadence bench is built on. */
interface CadenceButton {
  name: string;
  cooldown: number;
}

/** Rebuilds a bench from every top log but one, so a held-out log is judged against a bench it did not shape. */
@Injectable({ providedIn: 'root' })
export class LeaveOneOutService {
  private readonly castCadence = inject(CastCadenceService);
  private readonly gearJudge = inject(GearJudgeService);

  /** Drops index `i` from `sources` and `per_parse`; every later index moves down by one. */
  fold<P, B extends Folded<P>>(bench: B, i: number): B {
    return {
      ...bench,
      sources: bench.sources.filter((_, index) => index !== i),
      per_parse: bench.per_parse.filter((_, index) => index !== i),
      sample_count: bench.per_parse.length - 1,
    };
  }

  /** The plan gate keeps a cooldown some remaining top log cast; its cadence bench is rebuilt from those logs alone. */
  foldRotation(bench: RotationBench, i: number): RotationBench {
    const folded = this.fold(bench, i);
    const cooldowns = bench.major_cooldowns.filter(cooldown => this.castByAny(folded.per_parse.map(parse => parse.cd_casts_s), cooldown.name));
    const castsOf = (name: string) => folded.per_parse.map(parse => parse.cd_casts_s[name] ?? []);
    return {
      ...folded,
      major_cooldowns: cooldowns,
      per_cd_benchmarks: Object.fromEntries(cooldowns.map(cooldown => [cooldown.name, this.cadenceBenchmark(cooldown, castsOf(cooldown.name), folded.sources)])),
    };
  }

  foldDefensive(bench: DefensiveBench, i: number): FoldedDefensiveBench {
    const folded = this.fold(bench, i);
    const castsOf = (name: string) => folded.per_parse.map(parse => parse.def_casts_s[name] ?? []);
    const defensives = bench.defensives.filter(defensive => this.castByAny(folded.per_parse.map(parse => parse.def_casts_s), defensive.name));
    return {
      ...folded,
      defensives,
      per_defensive_benchmarks: Object.fromEntries(defensives.map(defensive => [
        defensive.name, this.cadenceBenchmark(defensive, castsOf(defensive.name), folded.sources),
      ])),
      defensive_windows: this.foldWindows(bench.defensive_windows, i, folded.per_parse.length, DEFENSIVE_WINDOW_SHARE),
    };
  }

  /** A window spans its remaining members, as the transform spans a cluster: the median start and the mean length. */
  foldBurst(bench: BurstBench & { per_parse: BurstParseMeasures[] }, i: number): FoldedBurstBench {
    const folded = this.fold(bench, i);
    const windows = this.foldWindows(bench.windows, i, folded.per_parse.length, CLUSTER_MIN_FRAC)
      .map(window => ({ ...window, window_length_s: avgOr(window.members.map(member => member.window_length_s), window.window_length_s) }));
    return { ...folded, windows };
  }

  /** The node counts are recounted the way ingest bakes them, since the baked ones count the held-out log too. */
  foldGear(bench: GearBench, i: number): GearBench {
    const folded = this.fold(bench, i);
    const keys = folded.per_parse.map(parse => parse.talent_key);
    return { ...folded, talent_nodes: this.gearJudge.talentNodes(keys), talent_sample_count: this.gearJudge.readableTrees(keys) };
  }

  /** The full bench in the folded shape, for a log that is not one of its top logs. */
  wholeDefensive(bench: DefensiveBench): FoldedDefensiveBench {
    return { ...bench, defensive_windows: bench.defensive_windows.map((window, index) => ({ ...window, index })) };
  }

  wholeBurst(bench: BurstBench & { per_parse: BurstParseMeasures[] }): FoldedBurstBench {
    return { ...bench, windows: bench.windows.map((window, index) => ({ ...window, index })) };
  }

  /** Drops the held-out log's members; a window the rest no longer form is gone, the rest centre on their own members. Original indices are kept in `index`. */
  foldWindows(windows: readonly BurstWindow[], i: number, remaining: number, share: number): FoldedWindow[] {
    return windows.flatMap((window, index) => {
      const members = window.members
        .filter(member => member.parse !== i)
        .map(member => ({ ...member, parse: member.parse > i ? member.parse - 1 : member.parse }));
      if (new Set(members.map(member => member.parse)).size < Math.max(MIN_WINDOW_PARSES, remaining * share)) return [];
      return [{ ...window, members, time_s: medianOr(members.map(member => member.time_s), window.time_s), index }];
    });
  }

  private castByAny(perParse: readonly Readonly<Record<string, readonly number[]>>[], name: string): boolean {
    return perParse.some(casts => (casts[name]?.length ?? 0) > 0);
  }

  /** A log's fight length is its ranking's; a log without one is left out of the use rate, as the transform leaves out a zero-length fight. */
  private cadenceBenchmark(button: CadenceButton, casts: number[][], sources: readonly ParseRanking[]): CadenceBenchmark {
    const users = casts.flatMap((castTimesS, index) => castTimesS.length
      ? [this.castCadence.entry(castTimesS, sources[index]?.duration_s ?? 0, button.cooldown)]
      : []);
    return this.castCadence.buildCadenceBenchmark(users, button.cooldown, casts.length);
  }
}
