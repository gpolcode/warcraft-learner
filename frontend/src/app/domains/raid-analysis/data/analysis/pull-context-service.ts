import { inject, Injectable } from '@angular/core';
import { WclApiService } from '../wcl/wcl-api-service';
import { WclFight, WclReport } from '../wcl/wcl.models';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from '../http/http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';
import { WclProjectionsService } from './wcl-projections-service';
import { PullModel, PullModelService } from './pull-model-service';

@Injectable({ providedIn: 'root' })
export class PullContextService {
  private readonly logger = inject(LoggerService);
  private readonly projections = inject(WclProjectionsService);
  private readonly pullModel = inject(PullModelService);

  async analyzePull<TView>(
    wclApi: WclApiService, pull: PullRef, analysis: PullAnalysis<TView>,
  ): Promise<Result<TView>> {
    const { reportCode, fightId } = pull;
    try {
      const report = await wclApi.getReport(reportCode);
      const fight = report.fights.find(entry => entry.id === fightId);
      // A selected fight may legitimately not be in the report yet during a live sync: not a failure.
      if (!fight) return Results.ok(analysis.emptyView());
      const fightDurationS = this.projections.relativeS(fight.endTime, fight.startTime);
      const model = await this.pullModel.load(wclApi, pull, fight, fightDurationS);
      return Results.ok(await analysis.analyze({ report, fight, fightDurationS, model }));
    } catch (cause) {
      this.logger.logWarn(`${analysis.logSource} ${reportCode}:${fightId}`, cause);
      return HttpLoadErrors.toLoadError(cause, analysis.errorId);
    }
  }
}

export interface PullContext {
  report: WclReport;
  fight: WclFight;
  fightDurationS: number;
  model: PullModel;
}

export interface PullRef {
  reportCode: string;
  fightId: number;
  playerId: number;
}

interface PullAnalysis<TView> {
  logSource: string;
  errorId: string;
  emptyView: () => TView;
  analyze: (context: PullContext) => Promise<TView>;
}
