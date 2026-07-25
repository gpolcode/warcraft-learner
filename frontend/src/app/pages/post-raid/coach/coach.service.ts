import { Injectable, inject, signal } from '@angular/core';
import { WclApiService } from '../../../core/services/wcl-api';
import { WclAbility, WclEvent } from '../../../core/models/wcl.models';
import { logInfo, logWarn } from '../../../core/log';
import { fmtClock } from '../../../shared/analysis/analysis-math';

// Chrome built-in Prompt API typings; not yet in the TS DOM lib.
type BuiltInAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface DownloadProgressEvent extends Event {
  loaded: number;
  total?: number;
}

type CreateMonitor = (monitor: EventTarget) => void;

interface PromptOptions {
  responseConstraint?: object;
  signal?: AbortSignal;
}

interface PromptSession {
  prompt(input: string, options?: PromptOptions): Promise<string>;
  destroy(): void;
}

// The Chrome team's guidance is to pass the language options to availability() AND create():
// a bare call logs a "no output language specified" warning on every request.
interface LanguageModelOptions {
  expectedInputs?: { type: 'text'; languages: string[] }[];
  expectedOutputs?: { type: 'text'; languages: string[] }[];
  outputLanguage?: string;
}

interface LanguageModelApi {
  availability(options?: LanguageModelOptions): Promise<BuiltInAvailability>;
  create(options?: LanguageModelOptions & {
    initialPrompts?: { role: 'system' | 'user' | 'assistant'; content: string }[];
    monitor?: CreateMonitor;
    signal?: AbortSignal;
  }): Promise<PromptSession>;
}

export type CoachAvailability = 'checking' | 'ready' | 'downloadable' | 'downloading' | 'unavailable';

/** Identifies the flagged moment to explain, plus the log coordinates to fetch evidence from. */
export interface ExplainAnchor {
  reportCode: string;
  fightId: number;
  playerId: number;
  timestampMs: number;
  /** The finding's own words, so the model judges the right question. */
  headline: string;
  measured: string;
}

/** One thing the player actually did, or had done to them, around the flagged moment. */
export interface EvidenceEntry {
  offsetS: number;
  kind: 'cast' | 'damage-taken' | 'buff';
  label: string;
  /** Damage entries only: the amount absorbed plus taken. */
  amount?: number;
}

export type VerdictCause =
  | 'pressured' | 'movement' | 'filler_casts' | 'saved_for_burst' | 'unable_to_act' | 'no_reason_found';

export interface CoachVerdict {
  cause: VerdictCause;
  detail: string;
  confidence: 'high' | 'medium' | 'low';
}

/** How far either side of the flagged instant the evidence window reaches. */
export const EVIDENCE_LEAD_S = 8;
export const EVIDENCE_TRAIL_S = 3;
/** Prompt budget: the busiest windows would otherwise blow the on-device context. */
export const MAX_EVIDENCE_ENTRIES = 28;

export const MAX_DIAGNOSTICS = 60;

/**
 * Chrome fetches the model only when it judges the device idle and the connection unmetered,
 * and create() then waits with no downloadprogress event and no rejection. These bound that
 * silence: a stall notice with the real requirements, and a periodic availability re-probe
 * that shows in the trace whether Chrome's own state is moving.
 */
export const DOWNLOAD_STALL_MS = 30_000;
export const DOWNLOAD_PROBE_MS = 10_000;

/** Chrome reports an origin 60% of the volume's TOTAL size and ignores free space entirely. */
export const CHROME_ORIGIN_QUOTA_FRACTION = 0.6;
export const MODEL_DISK_REQUIREMENT_GB = 22;

export const COACH_SYSTEM_PROMPT =
  'You judge World of Warcraft combat logs for a Mythic raider. You are given one flagged '
  + 'mistake and the raw event evidence around it. Decide WHY it happened from the evidence '
  + 'alone. Never invent events, abilities or numbers. If the evidence shows no reason, answer '
  + 'no_reason_found. Keep detail to one short sentence naming the specific evidence.';

/** Structured output: the model fills these fields, so the UI renders typed data, never prose. */
export const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    cause: {
      type: 'string',
      enum: ['pressured', 'movement', 'filler_casts', 'saved_for_burst', 'unable_to_act', 'no_reason_found'],
    },
    detail: { type: 'string', maxLength: 160 },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['cause', 'detail', 'confidence'],
  additionalProperties: false,
};

const CAUSE_LABEL: Record<VerdictCause, string> = {
  pressured: 'under pressure',
  movement: 'moving',
  filler_casts: 'filler casts',
  saved_for_burst: 'saved for burst',
  unable_to_act: 'unable to act',
  no_reason_found: 'no reason found',
};

export function causeLabel(cause: VerdictCause): string {
  return CAUSE_LABEL[cause];
}

const OUTPUT_LANGUAGE = 'en';

const LANGUAGE_MODEL_OPTIONS: LanguageModelOptions = {
  expectedInputs: [{ type: 'text', languages: [OUTPUT_LANGUAGE] }],
  expectedOutputs: [{ type: 'text', languages: [OUTPUT_LANGUAGE] }],
  outputLanguage: OUTPUT_LANGUAGE,
};

/**
 * Read the profile volume's size back out of the origin quota. A quota far under the model
 * requirement means Chrome's profile sits on a small volume, which is invisible from the free
 * space on whatever disk the user is looking at.
 */
export function describeStorageQuota(quotaBytes: number): string {
  const quotaGb = quotaBytes / 1e9;
  const volumeGb = quotaGb / CHROME_ORIGIN_QUOTA_FRACTION;
  const verdict = volumeGb < MODEL_DISK_REQUIREMENT_GB
    ? `under the ${MODEL_DISK_REQUIREMENT_GB} GB the model needs; check chrome://version for the profile path`
    : `at or above the ${MODEL_DISK_REQUIREMENT_GB} GB the model needs`;
  return `storage quota ${quotaGb.toFixed(1)} GB, so the Chrome profile volume is about `
    + `${volumeGb.toFixed(0)} GB total (quota is 60% of total size, not free space) - ${verdict}`;
}

function abilityName(abilities: WclAbility[], gameId: number): string {
  return abilities.find(ability => ability.gameID === gameId)?.name ?? `Spell ${gameId}`;
}

/**
 * The evidence timeline around a flagged instant: what the player cast, what hit them, and
 * which buffs landed. The app fetches these event streams for its own math but never shows
 * this slice of them, so it is the new information the panel puts on screen.
 */
export function buildEvidence(
  events: { casts: WclEvent[]; damageTaken: WclEvent[]; buffs: WclEvent[] },
  abilities: WclAbility[], fightStartMs: number, atMs: number,
): EvidenceEntry[] {
  const from = atMs - EVIDENCE_LEAD_S * 1000;
  const to = atMs + EVIDENCE_TRAIL_S * 1000;
  const within = (event: WclEvent): boolean => {
    const offset = event.timestamp - fightStartMs;
    return offset >= from && offset <= to;
  };
  const offsetOf = (event: WclEvent): number =>
    Math.round(((event.timestamp - fightStartMs) - atMs) / 100) / 10;

  const entries: EvidenceEntry[] = [
    ...events.casts.filter(event => event.type === 'cast' && within(event)).map(event => ({
      offsetS: offsetOf(event), kind: 'cast' as const, label: abilityName(abilities, event.abilityGameID),
    })),
    ...events.damageTaken.filter(within).map(event => ({
      offsetS: offsetOf(event), kind: 'damage-taken' as const,
      label: abilityName(abilities, event.abilityGameID),
      amount: (event.amount ?? 0) + (event.absorbed ?? 0),
    })),
    ...events.buffs.filter(event => event.type === 'applybuff' && within(event)).map(event => ({
      offsetS: offsetOf(event), kind: 'buff' as const, label: abilityName(abilities, event.abilityGameID),
    })),
  ];
  return entries.sort((a, b) => a.offsetS - b.offsetS).slice(0, MAX_EVIDENCE_ENTRIES);
}

function evidenceLine(entry: EvidenceEntry): string {
  const at = `${entry.offsetS >= 0 ? '+' : ''}${entry.offsetS.toFixed(1)}s`;
  if (entry.kind === 'damage-taken') return `${at} took ${entry.amount} from ${entry.label}`;
  if (entry.kind === 'buff') return `${at} gained ${entry.label}`;
  return `${at} cast ${entry.label}`;
}

export function buildExplainPrompt(anchor: ExplainAnchor, evidence: EvidenceEntry[]): string {
  return [
    `Flagged: ${anchor.headline}`,
    `Measured: ${anchor.measured}`,
    `Moment: ${fmtClock(anchor.timestampMs / 1000)} into the pull. Offsets below are relative to it.`,
    evidence.length ? 'Evidence:' : 'Evidence: none recorded in this window.',
    ...evidence.map(evidenceLine),
  ].join('\n');
}

/** Total damage taken across the evidence window; the panel headlines it as a measured fact. */
export function evidenceDamageTaken(evidence: EvidenceEntry[]): number {
  return evidence.filter(entry => entry.kind === 'damage-taken')
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
}

export function parseVerdict(raw: string): CoachVerdict | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CoachVerdict>;
    if (!parsed.cause || !(parsed.cause in CAUSE_LABEL)) return null;
    return {
      cause: parsed.cause,
      detail: parsed.detail ?? '',
      confidence: parsed.confidence ?? 'low',
    };
  } catch {
    return null;
  }
}

function builtInAi(): { LanguageModel?: LanguageModelApi } {
  return globalThis as unknown as { LanguageModel?: LanguageModelApi };
}

function toCoachAvailability(availability: BuiltInAvailability): CoachAvailability {
  return availability === 'available' ? 'ready' : availability;
}

function describeError(err: unknown): string {
  return err instanceof Error ? `${err.name}: ${err.message}` : String(err);
}

/** Chrome refuses to start the model fetch without user activation, so record it at create() time. */
function describeActivation(): string {
  const activation = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
  return activation ? `userActivation.isActive=${activation.isActive}` : 'userActivation unsupported';
}

/**
 * Chrome reports 'downloading' when the model fetch is already running from an earlier
 * session, but download progress only reaches a page through a monitor passed to create().
 * So 'downloading' has to stay actionable: create() attaches the monitor and resolves once
 * the fetch completes.
 */
export function canStartWith(availability: CoachAvailability): boolean {
  return availability === 'ready' || availability === 'downloadable' || availability === 'downloading';
}

/**
 * Explains a single flagged finding from the log evidence around it. The model never writes
 * the card: it returns a typed verdict the panel renders as a cause chip plus one line, beside
 * the evidence timeline the app fetches for its math but shows nowhere else. Everything -
 * model, evidence and verdict - stays in this browser.
 */
@Injectable({ providedIn: 'root' })
export class CoachFeatureService {
  private readonly wclApi = inject(WclApiService);

  private readonly _availability = signal<CoachAvailability>('checking');
  private readonly _downloadPct = signal(0);
  private readonly _diagnostics = signal<string[]>([]);
  private readonly _stalled = signal(false);
  private readonly _open = signal(false);
  private readonly _busy = signal(false);
  private readonly _failed = signal(false);
  private readonly _anchor = signal<ExplainAnchor | null>(null);
  private readonly _evidence = signal<EvidenceEntry[]>([]);
  private readonly _verdict = signal<CoachVerdict | null>(null);

  private _abort: AbortController | null = null;
  private _stallTimer: ReturnType<typeof setTimeout> | null = null;
  private _probeTimer: ReturnType<typeof setInterval> | null = null;
  private _seq = 0;

  readonly availability = this._availability.asReadonly();
  readonly downloadPct = this._downloadPct.asReadonly();
  readonly diagnostics = this._diagnostics.asReadonly();
  /** The model fetch has produced no progress for DOWNLOAD_STALL_MS; Chrome is sitting on it. */
  readonly stalled = this._stalled.asReadonly();
  readonly open = this._open.asReadonly();
  readonly busy = this._busy.asReadonly();
  readonly failed = this._failed.asReadonly();
  readonly anchor = this._anchor.asReadonly();
  readonly evidence = this._evidence.asReadonly();
  readonly verdict = this._verdict.asReadonly();

  private _trace(message: string): void {
    logInfo('coach', message);
    const stamped = `${new Date().toLocaleTimeString()}  ${message}`;
    this._diagnostics.update(entries => [...entries, stamped].slice(-MAX_DIAGNOSTICS));
  }

  /** Detect whether this browser can run the Prompt API at all. */
  async refresh(): Promise<void> {
    this._availability.set('checking');
    const api = builtInAi().LanguageModel;
    this._trace(`probing: LanguageModel ${api ? 'present' : 'absent'}`);
    await this._traceStorage();
    if (!api) { this._availability.set('unavailable'); return; }
    try {
      const availability = await api.availability(LANGUAGE_MODEL_OPTIONS);
      this._trace(`LanguageModel.availability -> ${availability}`);
      this._availability.set(toCoachAvailability(availability));
    } catch (err) {
      logWarn('CoachFeatureService.refresh', err);
      this._trace(`availability probe threw ${describeError(err)}`);
      this._availability.set('unavailable');
    }
  }

  close(): void {
    this._open.set(false);
  }

  /**
   * Open the panel on a flagged moment: fetch the surrounding events, show them, then ask the
   * on-device model for a typed verdict on the cause.
   */
  async explain(anchor: ExplainAnchor): Promise<void> {
    const seq = ++this._seq;
    this._open.set(true);
    this._anchor.set(anchor);
    this._evidence.set([]);
    this._verdict.set(null);
    this._failed.set(false);
    this._busy.set(true);
    this._abort = new AbortController();
    try {
      const evidence = await this._loadEvidence(anchor);
      if (seq !== this._seq) return;
      this._evidence.set(evidence);
      this._trace(`evidence: ${evidence.length} entries around ${fmtClock(anchor.timestampMs / 1000)}`);
      if (!canStartWith(this._availability())) return;

      const verdict = await this._askVerdict(anchor, evidence);
      if (seq !== this._seq) return;
      if (verdict) this._verdict.set(verdict);
      else this._failed.set(true);
    } catch (err) {
      if (seq !== this._seq) return;
      if (this._abort?.signal.aborted) this._trace('explain: canceled');
      else {
        logWarn('CoachFeatureService.explain', err);
        this._trace(`explain failed: ${describeError(err)}`);
        this._failed.set(true);
      }
    } finally {
      if (seq === this._seq) {
        this._stopWatchdog();
        this._busy.set(false);
      }
    }
  }

  /** Abandon a model fetch Chrome is not progressing, so the panel stops waiting on it. */
  cancel(): void {
    if (!this._busy()) return;
    this._trace('canceling the pending create()');
    this._abort?.abort();
    this._stopWatchdog();
    this._busy.set(false);
    void this.refresh();
  }

  private async _loadEvidence(anchor: ExplainAnchor): Promise<EvidenceEntry[]> {
    const report = await this.wclApi.getReport(anchor.reportCode);
    const fight = report.fights.find(entry => entry.id === anchor.fightId);
    if (!fight) return [];
    const from = fight.startTime + anchor.timestampMs - EVIDENCE_LEAD_S * 1000;
    const to = fight.startTime + anchor.timestampMs + EVIDENCE_TRAIL_S * 1000;
    const [casts, damageTaken, buffs] = await Promise.all([
      this.wclApi.getAllEvents(anchor.reportCode, anchor.fightId, 'Casts', from, to, anchor.playerId),
      this.wclApi.getAllEvents(anchor.reportCode, anchor.fightId, 'DamageTaken', from, to, anchor.playerId),
      this.wclApi.getAllEvents(anchor.reportCode, anchor.fightId, 'Buffs', from, to, anchor.playerId),
    ]);
    return buildEvidence({ casts, damageTaken, buffs }, report.masterData?.abilities ?? [],
      fight.startTime, anchor.timestampMs);
  }

  private async _askVerdict(anchor: ExplainAnchor, evidence: EvidenceEntry[]): Promise<CoachVerdict | null> {
    const api = builtInAi().LanguageModel;
    if (!api) return null;
    this._armStall();
    this._probeTimer = setInterval(() => void this._probeWhileWaiting(), DOWNLOAD_PROBE_MS);
    this._trace(`LanguageModel.create: requested, ${describeActivation()}`);
    const session = await api.create({
      ...LANGUAGE_MODEL_OPTIONS,
      initialPrompts: [{ role: 'system', content: COACH_SYSTEM_PROMPT }],
      monitor: this._monitor,
      signal: this._abort?.signal,
    });
    this._trace('LanguageModel.create: session ready');
    this._availability.set('ready');
    this._stopWatchdog();
    try {
      const raw = await session.prompt(buildExplainPrompt(anchor, evidence), {
        responseConstraint: VERDICT_SCHEMA,
        signal: this._abort?.signal,
      });
      this._trace(`verdict json ${raw.length} chars`);
      return parseVerdict(raw);
    } finally {
      session.destroy();
    }
  }

  /** Session creation triggers the one-time model download when needed; surface its progress. */
  private readonly _monitor: CreateMonitor = monitor => {
    this._trace('monitor attached; waiting for downloadprogress');
    monitor.addEventListener('downloadprogress', event => {
      const progress = event as DownloadProgressEvent;
      const fraction = progress.total ? progress.loaded / progress.total : progress.loaded;
      const pct = Math.round(fraction * 100);
      this._trace(`downloadprogress loaded=${progress.loaded} total=${progress.total ?? 'n/a'} -> ${pct}%`);
      this._availability.set('downloading');
      this._downloadPct.set(pct);
      // Bytes are moving, so restart the silence clock rather than leaving a stale stall notice.
      this._stalled.set(false);
      this._armStall();
    });
  };

  private _armStall(): void {
    if (this._stallTimer) clearTimeout(this._stallTimer);
    this._stallTimer = setTimeout(() => {
      this._trace(`no downloadprogress for ${DOWNLOAD_STALL_MS / 1000}s; Chrome has not started sending the model`);
      this._stalled.set(true);
    }, DOWNLOAD_STALL_MS);
  }

  private _stopWatchdog(): void {
    if (this._stallTimer) clearTimeout(this._stallTimer);
    if (this._probeTimer) clearInterval(this._probeTimer);
    this._stallTimer = null;
    this._probeTimer = null;
  }

  /** Chrome's own view of the model while create() waits; the trace shows whether it moves. */
  private async _probeWhileWaiting(): Promise<void> {
    const api = builtInAi().LanguageModel;
    if (!api) return;
    try {
      this._trace(`still waiting; availability -> ${await api.availability(LANGUAGE_MODEL_OPTIONS)}`);
    } catch (err) {
      this._trace(`re-probe threw ${describeError(err)}`);
    }
  }

  /** Chrome deletes or refuses the model without room to spare, so record what the origin sees. */
  private async _traceStorage(): Promise<void> {
    const storage = navigator.storage;
    if (!storage?.estimate) return;
    try {
      const { quota } = await storage.estimate();
      if (quota != null) this._trace(describeStorageQuota(quota));
    } catch (err) {
      this._trace(`storage estimate threw ${describeError(err)}`);
    }
  }
}
