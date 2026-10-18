import { inject, Injectable } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { PlayerDetailGroups, WclFight } from '../wcl/wcl.models';
import { AnalysisFinding } from './analysis.models';
import { AliveSpan, spansS } from './analysis-math';
import { DeadSpan, DeathTimelineService } from './death-timeline-service';
import { PhaseStart, TimedEvent, WclProjectionsService } from './wcl-projections-service';
import { RotationBloodlustService } from '../rotation/rotation-bloodlust-service';

export type PlayerRole = 'tank' | 'healer' | 'dps' | 'unknown';

/** `wipe` is an uncalled wipe the half-raid rule never cut, so it runs to the log's end. */
export type JudgedEndCause = 'kill' | 'wipe_called' | 'raid_collapse' | 'wipe';

/** Listed in attribution precedence: a death outranks the wipe, which outranks a kill that ended the pull first. */
export type UnjudgedCause = 'dead' | 'after_wipe' | 'not_reached';

export type FoldCounts = Record<UnjudgedCause, number>;

export interface PullModel {
  fightDurationS: number;
  judgedEndS: number;
  judgedEndCause: JudgedEndCause;
  /** The player's own, cut at the judged end: a death after the collapse is part of the wipe, not a mistake of its own. */
  deadSpans: DeadSpan[];
  aliveSpans: AliveSpan[];
  lust: { startS: number; endS: number } | null;
  /** Pull-relative; empty where WCL reports none for the boss. */
  phases: PhaseStart[];
  role: PlayerRole;
}

export interface PullModelInput {
  fight: WclFight;
  fightDurationS: number;
  playerId: number;
  deaths: TimedEvent[];
  resurrects: TimedEvent[];
  buffs: TimedEvent[];
  role: PlayerRole;
}

export interface JudgedSpan {
  endS: number;
  aliveS: number;
  endCause: JudgedEndCause;
  deadSpans: { fromS: number; toS: number }[];
  folded: FoldCounts;
}

const ROLE_GROUPS: Record<string, PlayerRole> = { tanks: 'tank', healers: 'healer', dps: 'dps' };

@Injectable({ providedIn: 'root' })
export class PullModelService {
  private readonly deathTimeline = inject(DeathTimelineService);
  private readonly projections = inject(WclProjectionsService);
  private readonly bloodlust = inject(RotationBloodlustService);

  /** Every read is one another card or the page already makes, so the response cache serves it. */
  async load(
    wclApi: WclApiService, pull: { reportCode: string; playerId: number }, fight: WclFight, fightDurationS: number,
  ): Promise<PullModel> {
    const { reportCode, playerId } = pull;
    const [deaths, buffs, groups] = await Promise.all([
      wclApi.getAllEvents(reportCode, fight.id, 'Deaths', fight.startTime, fight.endTime),
      wclApi.getAllEvents(reportCode, fight.id, 'Buffs', fight.startTime, fight.endTime, playerId),
      wclApi.getPlayerDetails(reportCode, fight.id),
    ]);
    const deathsTimed = this.projections.withRelativeS(deaths, fight.startTime);
    const resurrects = this.needsResurrects(fight, playerId, deathsTimed)
      ? await wclApi.getResurrects(reportCode, fight.id, fight.startTime, fight.endTime)
      : [];
    return this.build({
      fight, fightDurationS, playerId, deaths: deathsTimed,
      resurrects: this.projections.withRelativeS(resurrects, fight.startTime),
      buffs: this.projections.withRelativeS(buffs, fight.startTime),
      role: this.roleOf(groups, playerId),
    });
  }

  build({ fight, fightDurationS, playerId, deaths, resurrects, buffs, role }: PullModelInput): PullModel {
    const { endS, cause } = this.judgedEnd(fight, fightDurationS, deaths, resurrects);
    const deadSpans = this.clipDeadSpans(
      this.deathTimeline.deadSpans(deaths, resurrects, fightDurationS).get(playerId) ?? [], endS);
    return {
      fightDurationS,
      judgedEndS: endS,
      judgedEndCause: cause,
      deadSpans,
      aliveSpans: this.aliveSpans(deadSpans, endS),
      lust: this.bloodlust.lustSpan(buffs, fightDurationS),
      phases: this.projections.phaseStarts(fight),
      role,
    };
  }

  /** A called wipe ends the judged span; without one, the first instant half the raid is dead at once, so only almost certainly lost time is cut. */
  judgedEnd(
    fight: WclFight, fightDurationS: number, deaths: TimedEvent[], resurrects: TimedEvent[],
  ): { endS: number; cause: JudgedEndCause } {
    if (fight.kill) return { endS: fightDurationS, cause: 'kill' };
    if (fight.wipeCalledTime != null) {
      const calledS = this.projections.relativeS(fight.wipeCalledTime, fight.startTime);
      if (calledS >= 0 && calledS < fightDurationS) return { endS: calledS, cause: 'wipe_called' };
    }
    const halfRaid = this.halfRaid(fight);
    const collapseS = halfRaid ? this.deathTimeline.firstDeadAtOnceS(deaths, resurrects, halfRaid) : null;
    if (collapseS != null && collapseS < fightDurationS) return { endS: collapseS, cause: 'raid_collapse' };
    return { endS: fightDurationS, cause: 'wipe' };
  }

  roleOf(groups: PlayerDetailGroups, playerId: number): PlayerRole {
    const group = Object.keys(groups).find(key => ROLE_GROUPS[key] && groups[key]?.some(entry => entry.id === playerId));
    return (group === undefined ? undefined : ROLE_GROUPS[group]) ?? 'unknown';
  }

  /** The highest-precedence cause that keeps `[fromS, toS]` from being judged, or null when it lies wholly in alive, pre-wipe time. */
  causeOf(model: PullModel, fromS: number, toS: number): UnjudgedCause | null {
    if (this.deathTimeline.deadWithin(model.deadSpans, fromS, toS)) return 'dead';
    if (toS > model.judgedEndS) return model.judgedEndCause === 'kill' ? 'not_reached' : 'after_wipe';
    return null;
  }

  /** A finding whose span a death or the wipe explains folds under that cause, so one root cause renders once. */
  foldFindings(model: PullModel, findings: AnalysisFinding[]): { kept: AnalysisFinding[]; folded: FoldCounts } {
    const folded = this.noFolds();
    const kept = findings.filter(finding => {
      const cause = finding.span ? this.causeOf(model, finding.span.fromS, finding.span.toS) : null;
      if (cause) folded[cause] += 1;
      return !cause;
    });
    return { kept, folded };
  }

  noFolds(): FoldCounts {
    return { dead: 0, after_wipe: 0, not_reached: 0 };
  }

  addFolds(a: FoldCounts, b: FoldCounts): FoldCounts {
    return { dead: a.dead + b.dead, after_wipe: a.after_wipe + b.after_wipe, not_reached: a.not_reached + b.not_reached };
  }

  judgedSpan(model: PullModel, folded: FoldCounts = this.noFolds()): JudgedSpan {
    return {
      endS: model.judgedEndS,
      aliveS: spansS(model.aliveSpans),
      endCause: model.judgedEndCause,
      deadSpans: model.deadSpans.map(([fromS, toS]) => ({ fromS, toS })),
      folded,
    };
  }

  /** The judged span needs resurrects only to close the player's own deaths or to find the instant half the raid is down. */
  private needsResurrects(fight: WclFight, playerId: number, deaths: TimedEvent[]): boolean {
    if (deaths.some(event => event.targetID === playerId)) return true;
    const halfRaid = this.halfRaid(fight);
    if (fight.kill || fight.wipeCalledTime != null || !halfRaid) return false;
    return new Set(deaths.map(event => event.targetID)).size >= halfRaid;
  }

  private halfRaid(fight: WclFight): number {
    return Math.ceil(fight.friendlyPlayers.length / 2);
  }

  private clipDeadSpans(spans: DeadSpan[], judgedEndS: number): DeadSpan[] {
    return spans
      .filter(([diedS]) => diedS < judgedEndS)
      .map(([diedS, backS]): DeadSpan => [diedS, Math.min(backS, judgedEndS)]);
  }

  private aliveSpans(deadSpans: DeadSpan[], judgedEndS: number): AliveSpan[] {
    const spans: AliveSpan[] = [];
    let fromS = 0;
    for (const [diedS, backS] of [...deadSpans].sort((a, b) => a[0] - b[0])) {
      if (diedS > fromS) spans.push([fromS, diedS]);
      fromS = Math.max(fromS, backS);
    }
    if (judgedEndS > fromS) spans.push([fromS, judgedEndS]);
    return spans;
  }
}
