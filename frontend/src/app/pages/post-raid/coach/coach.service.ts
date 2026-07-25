import { Injectable, computed, signal } from '@angular/core';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { ComparisonWindow } from '../../../core/models/window-comparison.models';
import { logInfo, logWarn } from '../../../core/log';
import { fmtClock } from '../../../shared/analysis/analysis-math';

// Chrome built-in AI typings (Prompt + Summarizer APIs); not yet in the TS DOM lib.
type BuiltInAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

interface DownloadProgressEvent extends Event {
  loaded: number;
  total?: number;
}

type CreateMonitor = (monitor: EventTarget) => void;

interface PromptSession {
  promptStreaming(input: string): AsyncIterable<string>;
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

interface SummarizerSession {
  summarizeStreaming(input: string, options?: { context?: string }): AsyncIterable<string>;
  destroy(): void;
}

interface SummarizerOptions {
  type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  outputLanguage?: string;
}

interface SummarizerApi {
  availability(options?: SummarizerOptions): Promise<BuiltInAvailability>;
  create(options?: SummarizerOptions & {
    sharedContext?: string;
    monitor?: CreateMonitor;
  }): Promise<SummarizerSession>;
}

interface BuiltInAiGlobals {
  LanguageModel?: LanguageModelApi;
  Summarizer?: SummarizerApi;
}

export type CoachEngine = 'prompt' | 'summarizer';
export type CoachAvailability = 'checking' | 'ready' | 'downloadable' | 'downloading' | 'unavailable';

export interface CoachContext {
  spec: string;
  encounterName: string;
  kill: boolean;
  durationS: number;
}

/** Everything the page's cards contribute to the coach's grounding context. */
export interface CoachData {
  context: CoachContext;
  rotationFindings: AnalysisFinding[];
  defensiveFindings: AnalysisFinding[];
  burstWindows: ComparisonWindow[];
  defensiveWindows: ComparisonWindow[];
  gearNotes: string[];
}

export interface CoachTurn {
  role: 'user' | 'coach';
  text: string;
}

/** Newest-last trace of the built-in AI handshake, surfaced in the card and the console. */
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

/** On-device models have small context windows, so the digest is hard-capped. */
export const MAX_PROMPT_FINDINGS = 24;
export const MAX_PROMPT_WINDOWS = 6;
export const MAX_SUGGESTED_QUESTIONS = 3;

export const COACH_SYSTEM_PROMPT =
  'You are a World of Warcraft raid coach in a post-pull debrief chat with a Mythic raider. '
  + 'Ground every answer in the pull data below. Never invent numbers, abilities, or events; if the '
  + 'data does not cover a question, say so. Plain text only, short answers, imperative fixes. '
  + 'No praise, no filler.';

export const DEBRIEF_REQUEST =
  'Write the debrief: one short paragraph on the overall pull, then a numbered list of the top 3 '
  + 'fixes in priority order, each a single imperative sentence.';

export const SUMMARIZER_CONTEXT =
  'Post-pull World of Warcraft log analysis findings for a Mythic raider, benchmarked against '
  + 'top parses. Keep ability names and numbers exact. Critical findings matter most.';

const OUTPUT_LANGUAGE = 'en';

const LANGUAGE_MODEL_OPTIONS: LanguageModelOptions = {
  expectedInputs: [{ type: 'text', languages: [OUTPUT_LANGUAGE] }],
  expectedOutputs: [{ type: 'text', languages: [OUTPUT_LANGUAGE] }],
  outputLanguage: OUTPUT_LANGUAGE,
};

const SUMMARIZER_OPTIONS: SummarizerOptions = {
  type: 'key-points', format: 'plain-text', length: 'short', outputLanguage: OUTPUT_LANGUAGE,
};

const SEVERITY_LABEL: Record<AnalysisFinding['severity'], string> = {
  critical: 'critical', warning: 'warning', info: 'info', hold_suggestion: 'timing suggestion', success: 'on plan',
};

const SEVERITY_RANK: Record<AnalysisFinding['severity'], number> = {
  critical: 0, warning: 1, info: 2, hold_suggestion: 3, success: 4,
};

/** 'SubtletyRogue' -> 'Subtlety Rogue'. */
export function specLabel(spec: string): string {
  return spec.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** 1_240_000 -> '1.2M'; prompts reuse the UI's compact damage notation so numbers stay readable. */
export function compactDamage(value: number | null): string {
  if (value == null) return 'unknown';
  if (value >= 1e6 || Math.round(value / 1e3) >= 1000) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}K`;
  return String(Math.round(value));
}

export function findingLine(slice: string, finding: AnalysisFinding): string {
  const fix = finding.details?.remedy ? ` Fix: ${finding.details.remedy}` : '';
  return `- [${SEVERITY_LABEL[finding.severity]}] ${slice}: ${finding.message}${fix}`;
}

export function windowLine(kind: string, window: ComparisonWindow): string {
  const range = `${fmtClock(window.timeStartS)}-${fmtClock(window.timeEndS)}`;
  const player = compactDamage(window.overview.playerPct);
  const top = compactDamage(window.overview.topAvg);
  const spells = [...window.spells.map(spell => spell.name), ...window.labels];
  const withSpells = spells.length ? ` Abilities: ${spells.join(', ')}.` : '';
  return `- ${kind} ${range} [${window.status}]: you ${player} vs top avg ${top}.${withSpells}`;
}

export interface CoachDigest {
  issueLines: string[];
  onPlan: string[];
}

/** Successes collapse into an on-plan list so the model does not invent problems where there are none. */
export function buildCoachDigest(
  rotation: AnalysisFinding[], defensive: AnalysisFinding[],
): CoachDigest {
  const tagged = [
    ...rotation.map(finding => ({ slice: 'rotation', finding })),
    ...defensive.map(finding => ({ slice: 'defensives', finding })),
  ];
  const issues = tagged
    .filter(entry => entry.finding.severity !== 'success')
    .sort((a, b) => SEVERITY_RANK[a.finding.severity] - SEVERITY_RANK[b.finding.severity])
    .slice(0, MAX_PROMPT_FINDINGS)
    .map(entry => findingLine(entry.slice, entry.finding));
  const onPlan = tagged
    .filter(entry => entry.finding.severity === 'success')
    .map(entry => entry.finding.cd_name ?? entry.finding.message);
  return { issueLines: issues, onPlan };
}

/** The full grounding context: pull line, findings, both window comparisons, gear notes. */
export function buildAnalysisContext(data: CoachData): string {
  const digest = buildCoachDigest(data.rotationFindings, data.defensiveFindings);
  const outcome = data.context.kill ? 'Kill' : 'Wipe';
  const lines = [
    `Pull: ${specLabel(data.context.spec)} on ${data.context.encounterName}, ${outcome}, ${fmtClock(data.context.durationS)}.`,
    'Flagged findings vs top parses:',
    ...(digest.issueLines.length ? digest.issueLines : ['- Nothing flagged.']),
  ];
  if (digest.onPlan.length) lines.push(`On plan: ${digest.onPlan.join(', ')}.`);
  if (data.burstWindows.length) {
    lines.push('Burst windows (your damage done vs top parses):');
    lines.push(...data.burstWindows.slice(0, MAX_PROMPT_WINDOWS).map(window => windowLine('burst', window)));
  }
  if (data.defensiveWindows.length) {
    lines.push('Defensive windows (your damage taken vs top parses; lower is better):');
    lines.push(...data.defensiveWindows.slice(0, MAX_PROMPT_WINDOWS).map(window => windowLine('defensive', window)));
  }
  if (data.gearNotes.length) {
    lines.push('Gear vs top parses:');
    lines.push(...data.gearNotes.map(note => `- ${note}`));
  }
  return lines.join('\n');
}

/** Follow-up starters grounded in what the analysis actually flagged. */
export function suggestedQuestions(data: CoachData): string[] {
  const questions = ['What do I fix first next pull?'];
  const hold = [...data.rotationFindings, ...data.defensiveFindings]
    .find(finding => finding.severity === 'hold_suggestion' && finding.details?.cd_name);
  if (hold) questions.push(`Why hold ${hold.details!.cd_name} instead of casting it on cooldown?`);
  const overkill = data.defensiveWindows.find(window => window.status === 'bad');
  if (overkill) questions.push(`How do I survive the hit at ${fmtClock(overkill.timeStartS)}?`);
  const softBurst = data.burstWindows.find(window => window.status === 'bad' || window.status === 'warn');
  if (softBurst) questions.push(`How do I get more damage into the ${fmtClock(softBurst.timeStartS)} burst window?`);
  if (data.gearNotes.length) questions.push('Which gear change matters most?');
  return questions.slice(0, MAX_SUGGESTED_QUESTIONS);
}

/** True when any card contributed something the coach can talk about. */
export function hasCoachContext(data: CoachData): boolean {
  return data.rotationFindings.length > 0 || data.defensiveFindings.length > 0
    || data.burstWindows.length > 0 || data.defensiveWindows.length > 0 || data.gearNotes.length > 0;
}

function builtInAi(): BuiltInAiGlobals {
  return globalThis as unknown as BuiltInAiGlobals;
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

/** Shell around the browser's built-in on-device AI; model, context and chat never leave the browser. */
@Injectable({ providedIn: 'root' })
export class CoachFeatureService {
  private readonly _availability = signal<CoachAvailability>('checking');
  private readonly _engine = signal<CoachEngine | null>(null);
  private readonly _downloadPct = signal(0);
  private readonly _transcript = signal<CoachTurn[]>([]);
  private readonly _generating = signal(false);
  private readonly _failed = signal(false);
  private readonly _sessionActive = signal(false);
  private readonly _diagnostics = signal<string[]>([]);
  private readonly _stalled = signal(false);

  private _session: PromptSession | null = null;
  private _abort: AbortController | null = null;
  private _stallTimer: ReturnType<typeof setTimeout> | null = null;
  private _probeTimer: ReturnType<typeof setInterval> | null = null;

  readonly availability = this._availability.asReadonly();
  readonly engine = this._engine.asReadonly();
  readonly downloadPct = this._downloadPct.asReadonly();
  readonly transcript = this._transcript.asReadonly();
  readonly generating = this._generating.asReadonly();
  readonly failed = this._failed.asReadonly();
  readonly diagnostics = this._diagnostics.asReadonly();
  /** The model fetch has produced no progress for DOWNLOAD_STALL_MS; Chrome is sitting on it. */
  readonly stalled = this._stalled.asReadonly();
  /** Follow-up questions need a live Prompt API session; the Summarizer is one-shot. */
  readonly chatReady = computed(() => this._engine() === 'prompt' && this._sessionActive());

  private _trace(message: string): void {
    logInfo('coach', message);
    const stamped = `${new Date().toLocaleTimeString()}  ${message}`;
    this._diagnostics.update(entries => [...entries, stamped].slice(-MAX_DIAGNOSTICS));
  }

  /** Detect which built-in engine this browser offers; Prompt API wins over Summarizer. */
  async refresh(): Promise<void> {
    this._availability.set('checking');
    this._engine.set(null);
    const ai = builtInAi();
    this._trace(`probing: LanguageModel ${ai.LanguageModel ? 'present' : 'absent'}, `
      + `Summarizer ${ai.Summarizer ? 'present' : 'absent'}`);
    await this._traceStorage();
    try {
      if (ai.LanguageModel) {
        const availability = await ai.LanguageModel.availability(LANGUAGE_MODEL_OPTIONS);
        this._trace(`LanguageModel.availability -> ${availability}`);
        if (availability !== 'unavailable') {
          this._engine.set('prompt');
          this._availability.set(toCoachAvailability(availability));
          return;
        }
      }
      if (ai.Summarizer) {
        const availability = await ai.Summarizer.availability(SUMMARIZER_OPTIONS);
        this._trace(`Summarizer.availability -> ${availability}`);
        if (availability !== 'unavailable') {
          this._engine.set('summarizer');
          this._availability.set(toCoachAvailability(availability));
          return;
        }
      }
      this._trace('no usable engine; coach unavailable');
      this._availability.set('unavailable');
    } catch (err) {
      logWarn('CoachFeatureService.refresh', err);
      this._trace(`availability probe threw ${describeError(err)}`);
      this._availability.set('unavailable');
    }
  }

  /** Drop the session and transcript; called when the selection (and thus the findings) changes. */
  reset(): void {
    if (this._session) this._trace('session destroyed');
    this._session?.destroy();
    this._session = null;
    this._stopWatchdog();
    this._sessionActive.set(false);
    this._transcript.set([]);
    this._failed.set(false);
    this._generating.set(false);
    this._stalled.set(false);
  }

  /** Open a fresh debrief: seed the session with the full analysis context, stream the debrief. */
  async start(data: CoachData): Promise<void> {
    if (this._generating()) return;
    this.reset();
    this._generating.set(true);
    this._abort = new AbortController();
    const context = buildAnalysisContext(data);
    this._trace(`start: engine ${this._engine() ?? 'none'}, context ${context.length} chars / `
      + `${context.split('\n').length} lines, ${describeActivation()}`);
    this._armStall();
    this._probeTimer = setInterval(() => void this._probeWhileWaiting(), DOWNLOAD_PROBE_MS);
    try {
      if (this._engine() === 'prompt') await this._startPromptSession(context);
      else await this._summarizeOnce(context);
      this._availability.set('ready');
      this._trace('start: complete');
    } catch (err) {
      if (this._abort?.signal.aborted) this._trace('start: canceled');
      else {
        logWarn('CoachFeatureService.start', err);
        this._trace(`start failed: ${describeError(err)}`);
        this._failed.set(true);
      }
    } finally {
      this._stopWatchdog();
      this._generating.set(false);
    }
  }

  /** Abandon a model fetch Chrome is not progressing, so the card stops waiting on it. */
  cancel(): void {
    if (!this._generating()) return;
    this._trace('canceling the pending create()');
    this._abort?.abort();
    this._stopWatchdog();
    this._generating.set(false);
    void this.refresh();
  }

  /** Follow-up question against the live session; the model still holds the pull context. */
  async ask(question: string): Promise<void> {
    const session = this._session;
    if (!session || this._generating()) return;
    this._failed.set(false);
    this._transcript.update(turns => [...turns, { role: 'user', text: question }]);
    this._generating.set(true);
    this._trace(`ask: ${question.length} chars`);
    try {
      await this._streamCoachTurn(session.promptStreaming(question));
    } catch (err) {
      logWarn('CoachFeatureService.ask', err);
      this._trace(`ask failed: ${describeError(err)}`);
      this._failed.set(true);
    } finally {
      this._generating.set(false);
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

  private async _startPromptSession(context: string): Promise<void> {
    const api = builtInAi().LanguageModel!;
    this._trace('LanguageModel.create: requested (downloads the model on first run)');
    const session = await api.create({
      ...LANGUAGE_MODEL_OPTIONS,
      initialPrompts: [{ role: 'system', content: `${COACH_SYSTEM_PROMPT}\n\n${context}` }],
      monitor: this._monitor,
      signal: this._abort?.signal,
    });
    this._trace('LanguageModel.create: session ready');
    this._session = session;
    this._sessionActive.set(true);
    // Flip out of the download UI the moment the session exists, not when streaming ends.
    this._availability.set('ready');
    await this._streamCoachTurn(session.promptStreaming(DEBRIEF_REQUEST));
  }

  private async _summarizeOnce(context: string): Promise<void> {
    const api = builtInAi().Summarizer!;
    this._trace('Summarizer.create: requested (downloads the model on first run)');
    const session = await api.create({
      ...SUMMARIZER_OPTIONS,
      sharedContext: SUMMARIZER_CONTEXT,
      monitor: this._monitor,
    });
    this._trace('Summarizer.create: session ready');
    this._availability.set('ready');
    try {
      await this._streamCoachTurn(session.summarizeStreaming(context));
    } finally {
      session.destroy();
    }
  }

  private async _streamCoachTurn(chunks: AsyncIterable<string>): Promise<void> {
    this._transcript.update(turns => [...turns, { role: 'coach', text: '' }]);
    let received = 0;
    for await (const chunk of chunks) {
      if (received === 0) this._trace('stream: first chunk');
      received++;
      this._transcript.update(turns => {
        const last = turns[turns.length - 1];
        return [...turns.slice(0, -1), { ...last, text: last.text + chunk }];
      });
    }
    // A zero-chunk stream is the silent failure mode this trace exists to expose.
    this._trace(`stream: ended after ${received} chunk(s)`);
  }
}
