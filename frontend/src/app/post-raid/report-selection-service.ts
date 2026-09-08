import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WclApiService } from '../domains/raid-analysis/data/wcl/wcl-api-service';
import { LiveReportSyncService } from '../domains/raid-analysis/data/wcl/live-report-sync-service';
import { MYTHIC_DIFFICULTY, PlayerDetailGroups, WclFight, WclPlayer, WclReport } from '../domains/raid-analysis/data/wcl/wcl.models';
import { HttpLoadErrors } from '../domains/raid-analysis/data/http/http-load-error';
import { Result, Results } from '../domains/shared/util-http/result';
import { LoggerService } from '../domains/shared/util-logging/logger-service';

const MYTHIC_PLUS_DIFFICULTY = 10;
const RAID_DIFFICULTY_NAMES: Record<number, string> = { 3: 'Normal', 4: 'Heroic' };

export type LivePollAction = 'none' | 'skip' | 'analyze';

export interface LoadedReport {
  fights: WclFight[];
  players: WclPlayer[];
  /** Report clock (unix epoch ms), the shared timebase for correlating clips to fights. */
  startTime: number;
  enemies: { id: number; name: string; gameID: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportSelectionService {
  private readonly logger = inject(LoggerService);
  private readonly wclApi = inject(WclApiService);
  private readonly liveSync = inject(LiveReportSyncService);

  async loadReport(code: string): Promise<Result<LoadedReport>> {
    try {
      const report = await this.wclApi.getReport(code);
      return Results.ok({
        fights: this.buildFights(report.fights),
        players: this.buildPlayers(report.masterData?.actors),
        startTime: report.startTime,
        enemies: report.masterData?.enemies ?? [],
      });
    } catch (err) {
      this.logger.logWarn('ReportSelectionService.loadReport', err);
      return HttpLoadErrors.toLoadError(err, 'post-raid.load-report');
    }
  }

  async probeFights(code: string): Promise<Result<WclFight[]>> {
    try {
      return Results.ok(this.buildFights(await this.wclApi.getReportFights(code)));
    } catch (err) {
      this.logger.logWarn('ReportSelectionService.probeFights', err);
      return HttpLoadErrors.toLoadError(err, 'post-raid.poll');
    }
  }

  async playerDetails(code: string, fightId: number): Promise<Result<PlayerDetailGroups>> {
    try {
      return Results.ok(await this.wclApi.getPlayerDetails(code, fightId));
    } catch (err) {
      this.logger.logWarn('ReportSelectionService.playerDetails', err);
      return HttpLoadErrors.toLoadError(err, 'post-raid.resolve-selection');
    }
  }

  pollTriggers(): Observable<void> {
    return this.liveSync.pollTriggers();
  }

  extractCode(url: string): string {
    const m = /\/reports\/([a-zA-Z0-9]+)/.exec(url);
    return m?.[1] ?? url.trim();
  }

  extractFightId(url: string): number | null {
    const m = /[#?&]fight=(\d+)/.exec(url);
    const id = m ? Number(m[1]) : NaN;
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  // Validating before any network call keeps junk input (or a crawled ?report=garbage link) from wasting the shared rate-limit budget.
  isValidReportCode(code: string): boolean {
    return /^[a-zA-Z0-9]{16}$/.test(code);
  }

  // WCL omits difficulty on some fights; a missing one is not evidence of a lower difficulty.
  isUnsupportedDifficulty(difficulty: number | null | undefined): boolean {
    return difficulty != null && difficulty !== MYTHIC_DIFFICULTY;
  }

  unsupportedEncounterNotice(fightName: string, difficulty: number | null | undefined): string {
    if (difficulty === MYTHIC_PLUS_DIFFICULTY) return `${fightName} is a Mythic+ boss. Pick a Mythic raid pull.`;
    const label = RAID_DIFFICULTY_NAMES[difficulty ?? 0];
    if (label) return `${fightName} is a ${label} pull. Pick a Mythic pull.`;
    return `${fightName} was not pulled on Mythic. Pick a Mythic pull.`;
  }

  protected buildFights(fights: WclReport['fights'] = []): WclFight[] {
    const bossAttempt: Record<number, number> = {};
    return fights
      .filter(f => (f.encounterID || 0) > 0)
      .sort((a, b) => a.startTime - b.startTime)
      .map(f => {
        const eid = f.encounterID || 0;
        bossAttempt[eid] = (bossAttempt[eid] ?? 0) + 1;
        return { ...f, duration_s: Math.round((f.endTime - f.startTime) / 100) / 10, attempt: bossAttempt[eid] };
      });
  }

  protected buildPlayers(actors: NonNullable<WclReport['masterData']>['actors'] = []): WclPlayer[] {
    return actors
      .map(a => ({ id: a.id, name: a.name, spec: a.subType || 'Unknown', server: a.server || '' }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  visiblePlayersOf(
    fights: WclFight[],
    players: WclPlayer[],
    selectedFightId: number | null | undefined,
  ): WclPlayer[] {
    const fight = fights.find(f => f.id === selectedFightId);
    const fp = fight?.friendlyPlayers;
    return fp?.length ? players.filter(p => fp.includes(p.id)) : players;
  }

  targetFightId(fights: WclFight[], requestedId: number | null): number | null {
    const requested = requestedId != null ? fights.find(f => f.id === requestedId) : undefined;
    return (requested ?? fights[fights.length - 1])?.id ?? null;
  }

  /** 'analyze' also covers an unfinished selection, so a failed resolve retries on the next tick. */
  livePollActionOf(
    fights: WclFight[],
    selectedFightId: number | null | undefined,
    analyzed: boolean,
  ): LivePollAction {
    const latest = fights[fights.length - 1];
    if (!latest) return 'none';
    return latest.id === selectedFightId && analyzed ? 'skip' : 'analyze';
  }

  pickLivePlayerId(
    visiblePlayers: WclPlayer[],
    currentPlayerName: string | null,
  ): number | null {
    if (currentPlayerName) {
      const sticky = visiblePlayers.find(
        p => p.name.toLowerCase() === currentPlayerName.toLowerCase(),
      );
      if (sticky) return sticky.id;
    }
    return visiblePlayers[0]?.id ?? null;
  }

  specOf(groups: PlayerDetailGroups, playerId: number): string {
    for (const role of ['dps', 'healers', 'tanks', 'unknown']) {
      for (const player of (groups[role] ?? [])) {
        if (player.id !== playerId) continue;
        const className = player.type.replace(/ /g, '');
        const spec = ((player.specs ?? [])[0]?.spec ?? '').replace(/ /g, '');
        return spec && className ? spec + className : '';
      }
    }
    return '';
  }
}
