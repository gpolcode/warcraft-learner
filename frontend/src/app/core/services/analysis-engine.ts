import { Injectable, inject } from '@angular/core';
import { WclApiService } from './wcl-api';
import { EncounterService } from './encounter';
import { IconCacheService } from './icon-cache';
import { AnalysisResult } from '../models/analysis.models';
import { WclFight } from '../models/wcl.models';
import { computeAnalysis, AnalysisInput, WclEvent } from './analysis-core';

@Injectable({ providedIn: 'root' })
export class AnalysisEngineService {
  private readonly wclApi = inject(WclApiService);
  private readonly encounterSvc = inject(EncounterService);
  private readonly icons = inject(IconCacheService);

  private worker: Worker | null = null;
  private nextRequestId = 0;
  private readonly pending = new Map<number, { resolve: (r: AnalysisResult) => void; reject: (e: Error) => void }>();

  async run(
    reportCode: string,
    fightId: number,
    playerId: number,
    fights: WclFight[],
    masterAbilities: { gameID: number; name: string; icon: string }[],
  ): Promise<AnalysisResult> {
    const fight = fights.find(f => f.id === fightId);
    if (!fight) throw new Error('Fight not found');
    const { startTime: fStart, endTime: fEnd, encounterID } = fight;

    // Kick off the heavy event queries immediately — they don't depend on spec —
    // and resolve the player's spec concurrently. Only the (small, static)
    // rulebook/bench files depend on spec, so they're fetched once it's known.
    const eventsP = Promise.all([
      this.wclApi.getAllEvents(reportCode, fightId, 'Casts', fStart, fEnd, playerId),
      this.wclApi.getAllEvents(reportCode, fightId, 'Buffs', fStart, fEnd),
      this.wclApi.getAllEvents(reportCode, fightId, 'DamageDone', fStart, fEnd, playerId),
      this.wclApi.getAllEvents(reportCode, fightId, 'DamageTaken', fStart, fEnd),
    ]);

    const specMap = await this.wclApi.getPlayerDetails(reportCode, fightId);
    const spec = specMap[playerId] || 'Unknown';
    const playerName = specMap[`name_${playerId}`] || `Player ${playerId}`;

    const [rulebook, bench] = await Promise.all([
      spec !== 'Unknown' ? this.encounterSvc.getRulebook(spec) : Promise.resolve(null),
      (encounterID && spec !== 'Unknown') ? this.encounterSvc.getBench(spec, encounterID) : Promise.resolve(null),
    ]);

    const [castEvents, buffEvents, dmgEvents, dtEvents] = await eventsP;

    const input: AnalysisInput = {
      playerName, spec, fStart, fEnd,
      castEvents: castEvents as WclEvent[],
      buffEvents: buffEvents as WclEvent[],
      dmgEvents: dmgEvents as WclEvent[],
      dtEvents: dtEvents as WclEvent[],
      rulebook: rulebook as Record<string, unknown> | null,
      bench: bench as AnalysisInput['bench'],
      masterAbilities: masterAbilities || [],
    };

    const result = await this._compute(input);

    // Icon cache touches an Angular signal, so seed it on the main thread.
    this.icons.seedFromMap(result.ability_icons);
    return result;
  }

  /** Run the computation in a Web Worker, falling back to the main thread. */
  private _compute(input: AnalysisInput): Promise<AnalysisResult> {
    const worker = this._ensureWorker();
    if (!worker) return Promise.resolve(computeAnalysis(input));

    const id = this.nextRequestId++;
    return new Promise<AnalysisResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      worker.postMessage({ id, input });
    });
  }

  private _ensureWorker(): Worker | null {
    if (this.worker) return this.worker;
    if (typeof Worker === 'undefined') return null;
    try {
      this.worker = new Worker(new URL('./analysis.worker', import.meta.url), { type: 'module' });
      this.worker.addEventListener('message', ({ data }: MessageEvent<{ id: number; result?: AnalysisResult; error?: string }>) => {
        const entry = this.pending.get(data.id);
        if (!entry) return;
        this.pending.delete(data.id);
        if (data.error) entry.reject(new Error(data.error));
        else entry.resolve(data.result!);
      });
      this.worker.addEventListener('error', () => {
        // Worker crashed — reject in-flight requests; future calls fall back to the main thread.
        for (const { reject } of this.pending.values()) reject(new Error('Analysis worker error'));
        this.pending.clear();
        this.worker = null;
      });
    } catch {
      this.worker = null;
    }
    return this.worker;
  }
}
