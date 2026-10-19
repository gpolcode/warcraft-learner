import { inject, Injectable } from '@angular/core';
import { SpecRoleService } from '../../analysis/spec-role-service';
import { RotationBench, RotationParseMeasures } from '../../rotation/rotation-data-source';
import { DefensiveBench, DefensiveParseMeasures } from '../../defensive/defensive-data-source';
import { GearBench, GearParseMeasures } from '../../gear/gear-data-source';
import { BurstBench, BurstParseMeasures } from '../../burst-windows/burst-data-source';
import { TalentKeyService } from '../../gear/talent-key-service';
import type { ParseRanking } from '../../wcl/wcl.models';
import { ContrastBench, ContrastCard, HeldOutRow } from './calibration.models';
import { FoldedBurstBench, FoldedDefensiveBench, LeaveOneOutService } from './leave-one-out-service';
import { BurstHeldOut, BurstHeldOutService } from './burst-held-out-service';
import { HeldOutRowService } from './held-out-row-service';
import { RotationHeldOut, RotationHeldOutService } from './rotation-held-out-service';
import { DefensiveHeldOut, DefensiveHeldOutService } from './defensive-held-out-service';
import { GearHeldOutService } from './gear-held-out-service';

/** The benches of one spec and encounter as the harness reads them; null where none is baked. */
export interface EncounterBenches {
  rotation: RotationBench | null;
  defensive: DefensiveBench | null;
  gear: GearBench | null;
  burst: BurstBench | null;
}

export type HeldOutCase =
  | { card: 'rotation'; source: string; fold: RotationBench; log: RotationHeldOut }
  | { card: 'defensive'; source: string; fold: FoldedDefensiveBench; log: DefensiveHeldOut }
  | { card: 'gear'; source: string; fold: GearBench; picks: GearParseMeasures }
  | { card: 'burst'; source: string; fold: FoldedBurstBench; log: BurstHeldOut };

export type BenchName = keyof EncounterBenches;

/** Splits an encounter's benches into leave-one-out cases and judges each one through the card's production judges. */
@Injectable({ providedIn: 'root' })
export class HeldOutCaseService {
  private readonly folds = inject(LeaveOneOutService);
  private readonly rows = inject(HeldOutRowService);
  private readonly rotation = inject(RotationHeldOutService);
  private readonly defensive = inject(DefensiveHeldOutService);
  private readonly gear = inject(GearHeldOutService);
  private readonly burst = inject(BurstHeldOutService);
  private readonly talentKeys = inject(TalentKeyService);
  private readonly specRoles = inject(SpecRoleService);

  /** A ranking's identity across benches, which may accept different top logs. */
  sourceKey(source: ParseRanking): string {
    return `${source.report_code}:${source.fight_id}`;
  }

  /** Benches baked before per-log measures cannot be folded. */
  unfoldable(benches: EncounterBenches): BenchName[] {
    const names: BenchName[] = ['rotation', 'defensive', 'gear', 'burst'];
    return names.filter(name => benches[name] !== null && !this.hasMeasures(benches[name]));
  }

  cases(benches: EncounterBenches, spec: string): HeldOutCase[] {
    const talents = this.talentsBySource(benches.gear);
    return [
      ...this.rotationCases(benches.rotation, talents),
      ...this.defensiveCases(benches.defensive, talents, this.specRoles.role(spec) === 'tank'),
      ...this.gearCases(benches.gear),
      // A healer's top logs are ranked on healing, so the page compares none of their damage.
      ...this.specRoles.isHealer(spec) ? [] : this.burstCases(benches.burst),
    ];
  }

  judge(heldOut: HeldOutCase): HeldOutRow[] {
    if (heldOut.card === 'rotation') return this.rotation.judge(heldOut.fold, heldOut.log);
    if (heldOut.card === 'defensive') return this.defensive.judge(heldOut.fold, heldOut.log);
    if (heldOut.card === 'burst') return this.burst.judge(heldOut.fold, heldOut.log);
    return this.gear.judge(heldOut.fold, heldOut.picks);
  }

  /** Each contrast log on every card it was read for, judged against the full bench as the page judges a player. */
  contrastCases(benches: EncounterBenches, contrast: ContrastBench, spec: string): HeldOutCase[] {
    const talents = this.talentsBySource(contrast.gear);
    const { rotation, defensive, gear } = benches;
    const tank = this.specRoles.role(spec) === 'tank';
    return [
      ...this.hasMeasures(rotation) && rotation ? this.each(contrast.rotation, (source, measures) => this.rotationCase(source, measures, rotation, talents)) : [],
      ...this.hasMeasures(defensive) && defensive
        ? this.each(contrast.defensive, (source, measures) => this.defensiveCase(source, measures, this.folds.wholeDefensive(defensive), { talents, tank }))
        : [],
      ...this.hasMeasures(gear) && gear ? this.each(contrast.gear, (source, picks) => this.gearCase(source, picks, gear)) : [],
      ...this.specRoles.isHealer(spec) ? [] : this.contrastBurstCases(benches.burst, contrast.burst),
    ];
  }

  private contrastBurstCases(bench: BurstBench | null, card: ContrastCard<BurstParseMeasures> | null): HeldOutCase[] {
    if (!bench?.per_parse || !this.hasMeasures(bench)) return [];
    const whole = this.folds.wholeBurst({ ...bench, per_parse: bench.per_parse });
    return this.each(card, (source, measures) => this.burstCase(source, measures, whole));
  }

  private each<T>(card: ContrastCard<T> | null, make: (source: ParseRanking, measures: T) => HeldOutCase): HeldOutCase[] {
    if (!card) return [];
    return card.per_parse.flatMap((measures, i) => {
      const source = card.sources[i];
      return source ? [make(source, measures)] : [];
    });
  }

  private rotationCases(bench: RotationBench | null, talents: ReadonlyMap<string, ReadonlyMap<number, number>>): HeldOutCase[] {
    if (!bench || !this.hasMeasures(bench)) return [];
    return bench.per_parse.flatMap((measures, i) => {
      const source = bench.sources[i];
      return source ? [this.rotationCase(source, measures, this.folds.foldRotation(bench, i), talents)] : [];
    });
  }

  private defensiveCases(
    bench: DefensiveBench | null, talents: ReadonlyMap<string, ReadonlyMap<number, number>>, tank: boolean,
  ): HeldOutCase[] {
    if (!bench || !this.hasMeasures(bench)) return [];
    return bench.per_parse.flatMap((measures, i) => {
      const source = bench.sources[i];
      return source ? [this.defensiveCase(source, measures, this.folds.foldDefensive(bench, i), { talents, tank })] : [];
    });
  }

  private burstCases(bench: BurstBench | null): HeldOutCase[] {
    if (!bench?.per_parse || !this.hasMeasures(bench)) return [];
    const measured = { ...bench, per_parse: bench.per_parse };
    return measured.per_parse.flatMap((parse, i) => {
      const source = bench.sources[i];
      return source ? [this.burstCase(source, parse, this.folds.foldBurst(measured, i))] : [];
    });
  }

  private gearCases(bench: GearBench | null): HeldOutCase[] {
    if (!bench || !this.hasMeasures(bench)) return [];
    return bench.per_parse.flatMap((picks, i) => {
      const source = bench.sources[i];
      return source ? [this.gearCase(source, picks, this.folds.foldGear(bench, i))] : [];
    });
  }

  private rotationCase(
    source: ParseRanking, measures: RotationParseMeasures, fold: RotationBench, talents: ReadonlyMap<string, ReadonlyMap<number, number>>,
  ): HeldOutCase {
    const key = this.sourceKey(source);
    const log = { measures, model: this.rows.wholePull(source.duration_s ?? 0), talents: talents.get(key) ?? null };
    return { card: 'rotation', source: key, fold, log };
  }

  private defensiveCase(
    source: ParseRanking, measures: DefensiveParseMeasures, fold: FoldedDefensiveBench,
    pull: { talents: ReadonlyMap<string, ReadonlyMap<number, number>>; tank: boolean },
  ): HeldOutCase {
    const key = this.sourceKey(source);
    const durationS = source.duration_s ?? 0;
    const log = {
      casts: measures.def_casts_s, model: this.rows.withDeaths(durationS, durationS, measures.dead_s ?? []), talents: pull.talents.get(key) ?? null,
      up: measures.def_up_s ?? null, takenPerS: measures.taken_per_s ?? null, tank: pull.tank,
    };
    return { card: 'defensive', source: key, fold, log };
  }

  private burstCase(source: ParseRanking, parse: BurstParseMeasures, fold: FoldedBurstBench): HeldOutCase {
    const log = { damagePerS: parse.damage_per_s, model: this.rows.wholePull(source.duration_s ?? parse.damage_per_s.length) };
    return { card: 'burst', source: this.sourceKey(source), fold, log };
  }

  private gearCase(source: ParseRanking, picks: GearParseMeasures, fold: GearBench): HeldOutCase {
    return { card: 'gear', source: this.sourceKey(source), fold, picks };
  }

  /** The gear bench carries each top log's talents, which the cooldown checks need to know whether a talent button was taken. */
  private talentsBySource(gear: Pick<GearBench, 'per_parse' | 'sources'> | null): Map<string, ReadonlyMap<number, number>> {
    const bySource = new Map<string, ReadonlyMap<number, number>>();
    if (!gear || !this.hasMeasures(gear)) return bySource;
    gear.per_parse.forEach((picks, i) => {
      const source = gear.sources[i];
      if (!source || !picks.talent_key) return;
      bySource.set(this.sourceKey(source), new Map(this.talentKeys.parseTalentKey(picks.talent_key).map(pick => [pick.entryId, pick.rank])));
    });
    return bySource;
  }

  private hasMeasures(bench: { per_parse?: unknown[]; sources?: unknown[] } | null): boolean {
    return Array.isArray(bench?.per_parse) && Array.isArray(bench.sources) && bench.per_parse.length === bench.sources.length;
  }
}
