import { inject, Injectable } from '@angular/core';
import { PullModel } from '../../analysis/pull-model-service';
import { BURST_WINDOW_FAMILY, BurstJudgeService } from '../../burst-windows/burst-judge-service';
import { HeldOutRow } from './calibration.models';
import { HeldOutRowService } from './held-out-row-service';
import { FoldedBurstBench } from './leave-one-out-service';

/** A top log judged as the player on the Burst windows card. */
export interface BurstHeldOut {
  damagePerS: number[];
  model: PullModel;
}

/** The Burst windows check on a held-out top log, through the measure, reference and gate the page uses. */
@Injectable({ providedIn: 'root' })
export class BurstHeldOutService {
  private readonly rows = inject(HeldOutRowService);
  private readonly judges = inject(BurstJudgeService);

  /** `fold` is the bench rebuilt without the held-out log, its windows respanned on the remaining members. */
  judge(fold: FoldedBurstBench, log: BurstHeldOut): HeldOutRow[] {
    return fold.windows.flatMap(window => {
      const measured = this.judges.measure(log.damagePerS, window, log.model.aliveSpans);
      if (!measured) return [];
      const evidence = this.judges.judge(measured.amplification, this.judges.reference(window, fold.per_parse, fold.sources), window);
      return this.rows.row(BURST_WINDOW_FAMILY, evidence, log.model, { fromS: window.time_s, toS: window.time_s + window.window_length_s });
    });
  }
}
