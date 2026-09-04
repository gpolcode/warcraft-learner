import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { NorthernSkyPhase, NorthernSkyPhases } from '../northern-sky/northern-sky-phases';
import { Result, Results } from '../../../shared/util-http/result';
import { HttpLoadErrors } from './http-load-error';
import { LoggerService } from '../../../shared/util-logging/logger-service';

const ADDON_ROOT = 'https://raw.githubusercontent.com/Reloe/NorthernSkyRaidTools/main/NorthernSkyRaidTools';
const TOC = 'NorthernSkyRaidTools.toc';
const TIMELINE_MANIFEST = 'BossTimelines/BossTimelines.xml';
const HTTP_NOT_FOUND = 404;

const ALERT_ENTRY = /^(EncounterAlerts[\\/](?!Locales)[^\\/\s]+[\\/][^\\/\s]+\.lua)\s*$/gm;
const TIMELINE_ENTRY = /<Script\s+file="([^"]+\/[^"]+\.lua)"/g;
const ENCOUNTER_ID = /^\s*local encID\s*=\s*(\d+)/m;
const REGISTRATION = /NSI\.BossTimelines\[(\d+)\]\s*=\s*\{([\s\S]*?)\}/;
const MYTHIC_TABLE = /Mythic\s*=\s*(\w+)/;
const PHASE_ENTRY = /\[(\d+(?:\.\d+)?)\]\s*=\s*\{[^}]*start\s*=\s*(-?\d+(?:\.\d+)?)/g;

@Injectable({ providedIn: 'root' })
export class NorthernSkyPhaseDataService {
  private readonly logger = inject(LoggerService);
  private readonly http = inject(HttpClient);
  private _phases: Promise<Result<NorthernSkyPhases>> | null = null;

  // Only WCL responses are cached, so without this the addon is re-read for every spec's every bench.
  async getPhases(): Promise<Result<NorthernSkyPhases>> {
    this._phases ??= this.fetchPhases();
    const phases = await this._phases;
    // Keeping a failed read would deny phases to every later bench of the run over one blip.
    if (!phases.ok && phases.error.kind !== 'missing') this._phases = null;
    return phases;
  }

  private async fetchPhases(): Promise<Result<NorthernSkyPhases>> {
    try {
      const [toc, manifest] = await Promise.all([this.fetchFile(TOC), this.fetchFile(TIMELINE_MANIFEST)]);
      const [alerts, timelines] = await Promise.all([
        Promise.all(this.manifestPaths(toc, ALERT_ENTRY, '').map(path => this.fetchOptionalFile(path))),
        Promise.all(this.manifestPaths(manifest, TIMELINE_ENTRY, 'BossTimelines/').map(path => this.fetchOptionalFile(path))),
      ]);
      const phases = this.indexPhases(timelines, alerts);
      return Object.keys(phases).length ? Results.ok(phases) : Results.missing('No Northern Sky phase tables.');
    } catch (cause) {
      this.logger.logWarn('NorthernSkyPhaseDataService addon fetch', cause);
      return HttpLoadErrors.toLoadError(cause, 'northern-sky.phases');
    }
  }

  private fetchFile(path: string): Promise<string> {
    return firstValueFrom(this.http.get(`${ADDON_ROOT}/${path.replace(/\\/g, '/')}`, { responseType: 'text' }));
  }

  // Only a 404 is a misspelt .toc entry to drop; swallowing any other failure bakes that boss pull-relative.
  private async fetchOptionalFile(path: string): Promise<string> {
    try {
      return await this.fetchFile(path);
    } catch (cause) {
      if (cause instanceof HttpErrorResponse && cause.status === HTTP_NOT_FOUND) return '';
      throw cause;
    }
  }

  private manifestPaths(source: string, pattern: RegExp, prefix: string): string[] {
    return [...source.matchAll(pattern)].map(match => `${prefix}${match[1] ?? ''}`);
  }

  // A non-greedy match would stop at the first `}`, which closes an inner `{start = 0}` rather than the table.
  private balancedTable(source: string, openIndex: number): string {
    let depth = 0;
    for (let i = openIndex; i < source.length; i++) {
      if (source[i] === '{') depth++;
      else if (source[i] === '}' && --depth === 0) return source.slice(openIndex, i + 1);
    }
    return '';
  }

  private phaseStarts(table: string): NorthernSkyPhase[] {
    const phasesAt = table.indexOf('phases');
    if (phasesAt < 0) return [];
    return [...this.balancedTable(table, table.indexOf('{', phasesAt)).matchAll(PHASE_ENTRY)]
      .map(([, phase, start_s]) => ({ phase: Number(phase), start_s: Number(start_s) }))
      .sort((a, b) => a.start_s - b.start_s);
  }

  protected mythicPhases(timeline: string): { encounterId: number; phases: NorthernSkyPhase[] } | null {
    const registration = REGISTRATION.exec(timeline);
    const local = registration && MYTHIC_TABLE.exec(registration[2] ?? '')?.[1];
    if (!registration || !local) return null;
    const declaration = timeline.indexOf(`local ${local}`);
    if (declaration < 0) return null;
    return { encounterId: Number(registration[1]), phases: this.phaseStarts(this.balancedTable(timeline, timeline.indexOf('{', declaration))) };
  }

  // Giving phases to a boss whose module never advances one would strand its later note lines in a phase the addon never enters.
  protected rearmingEncounterIds(alerts: string[]): Set<number> {
    const ids = new Set<number>();
    for (const alert of alerts) {
      const id = ENCOUNTER_ID.exec(alert)?.[1];
      if (id && alert.includes('StartReminders')) ids.add(Number(id));
    }
    return ids;
  }

  protected indexPhases(timelines: string[], alerts: string[]): NorthernSkyPhases {
    const rearming = this.rearmingEncounterIds(alerts);
    const phases: NorthernSkyPhases = {};
    for (const timeline of timelines) {
      const parsed = this.mythicPhases(timeline);
      if (parsed?.phases.length && rearming.has(parsed.encounterId)) phases[parsed.encounterId] = parsed.phases;
    }
    return phases;
  }
}
