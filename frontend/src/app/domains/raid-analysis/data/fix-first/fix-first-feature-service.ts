import { inject, Injectable } from '@angular/core';
import { Result, Results } from '../../../shared/util-http/result';
import { WclApiService } from '../wcl/wcl-api-service';
import { PullContextService, PullRef } from '../analysis/pull-context-service';
import { FoldCounts, PullModelService } from '../analysis/pull-model-service';
import { SpecRoleService } from '../analysis/spec-role-service';
import { BURST_DATA_SOURCE } from '../burst-windows/burst-data-source';
import { CALIBRATION_SOURCE } from '../verdict/calibration/calibration-source';
import { CalibrationIndex } from '../verdict/calibration/calibration.models';
import { RegistryHashService } from '../verdict/calibration/registry-hash-service';
import { CLOSED_GATE, DamageEstimateService, DamageGate } from '../verdict/damage-estimate-service';
import { CardRanking, RankedRow, RowOrderService } from '../verdict/row-order-service';
import { DamageEstimate } from '../verdict/tone.models';

export interface DeathLoss {
  diedS: number;
  /** Null when the player stayed dead to the judged end. */
  backS: number | null;
  damage: DamageEstimate;
}

export interface FixFirstView {
  rows: RankedRow[];
  /** Checks the cards folded under a death, the wipe or the pull's end. */
  notJudged: number;
  /** The damage gate passed on the contrast logs, so estimates print. */
  damageShown: boolean;
  empty: string;
}

export interface DamagePricing {
  gate: DamageGate;
  deaths: DeathLoss[];
}

/** Null when the gate is closed or nothing cost damage; deaths always lead. */
export interface DamageView {
  deaths: DeathLoss[];
  /** Checks the cards folded under the player's deaths, named once under them. */
  foldedUnderDeaths: number;
  rows: RankedRow[];
}

@Injectable({ providedIn: 'root' })
export class FixFirstFeatureService {
  private readonly order = inject(RowOrderService);
  private readonly estimates = inject(DamageEstimateService);
  private readonly calibration = inject(CALIBRATION_SOURCE);
  private readonly hashes = inject(RegistryHashService);
  private readonly specRoles = inject(SpecRoleService);
  private readonly burst = inject(BURST_DATA_SOURCE);
  private readonly pullContext = inject(PullContextService);
  private readonly pullModel = inject(PullModelService);
  private readonly wclApi = inject(WclApiService);

  /** A healer's estimates are in damage it is not ranked on, so they never print; a missing or foreign index keeps the gate closed. */
  async loadGate(spec: string): Promise<Result<DamageGate>> {
    if (this.specRoles.isHealer(spec)) return Results.ok(CLOSED_GATE);
    const loaded = await this.calibration.load();
    const index = loaded.ok ? loaded.value : null;
    return Results.ok(this.gateOf(index));
  }

  gateOf(index: CalibrationIndex | null): DamageGate {
    const stored: Partial<CalibrationIndex> | null = index;
    if (index?.registry_hash !== this.hashes.registryHash() || !stored?.damage) return CLOSED_GATE;
    return stored.damage;
  }

  async loadPricing(spec: string, encounterId: number, pull: PullRef): Promise<Result<DamagePricing>> {
    const gate = await this.loadGate(spec);
    if (!gate.ok) return gate;
    // A closed gate prints no estimate, so the deaths are not read.
    if (!gate.value.open) return Results.ok({ gate: gate.value, deaths: [] });
    const deaths = await this.loadDeaths(spec, encounterId, pull);
    return deaths.ok ? Results.ok({ gate: gate.value, deaths: deaths.value }) : deaths;
  }

  /** Every death before the judged end, read on the top logs' damage; the burst bench's per-second damage is what reads it, so a bench without it reads each span's length. */
  private async loadDeaths(spec: string, encounterId: number, pull: PullRef): Promise<Result<DeathLoss[]>> {
    if (this.specRoles.isHealer(spec)) return Results.ok([]);
    const bench = await this.burst.getBench(spec, encounterId);
    const topPerS = bench.ok ? (bench.value.per_parse ?? []).map(parse => parse.damage_per_s) : [];
    return this.pullContext.analyzePull(this.wclApi, pull, {
      logSource: 'FixFirstFeatureService.loadDeaths',
      errorId: 'fix-first.deaths',
      emptyView: () => [],
      analyze: ({ model }) => Promise.resolve(model.deadSpans.map(([diedS, backS]) => ({
        diedS,
        backS: backS < model.judgedEndS ? backS : null,
        damage: this.estimates.dead(diedS, Math.min(backS, model.judgedEndS), topPerS),
      }))),
    });
  }

  view(rankings: readonly CardRanking[], gate: DamageGate): FixFirstView {
    const folded = this.folded(rankings);
    const notJudged = folded.dead + folded.after_wipe + folded.not_reached;
    return {
      rows: this.order.fixFirst(rankings.flatMap(ranking => ranking.rows)),
      notJudged,
      damageShown: gate.open,
      empty: `Nothing flagged on any card.${notJudged ? ` ${notJudged} ${notJudged === 1 ? 'check' : 'checks'} not judged.` : ''}`,
    };
  }

  /** Deaths first, longest loss first, then every row one pull prices, largest first, whatever its tone: the estimate is a measure, not a verdict. */
  damageView(rankings: readonly CardRanking[], deaths: readonly DeathLoss[], gate: DamageGate): DamageView | null {
    if (!gate.open) return null;
    const rows = rankings.flatMap(ranking => ranking.rows).filter(row => row.damage)
      .sort((a, b) => (b.damage?.aboutS ?? 0) - (a.damage?.aboutS ?? 0));
    if (!deaths.length && !rows.length) return null;
    return {
      deaths: [...deaths].sort((a, b) => b.damage.aboutS - a.damage.aboutS),
      foldedUnderDeaths: deaths.length ? this.folded(rankings).dead : 0,
      rows,
    };
  }

  private folded(rankings: readonly CardRanking[]): FoldCounts {
    return rankings.reduce((sum, ranking) => this.pullModel.addFolds(sum, ranking.folded), this.pullModel.noFolds());
  }
}
