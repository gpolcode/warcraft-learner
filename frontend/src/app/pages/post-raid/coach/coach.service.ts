import { Injectable, computed, signal } from '@angular/core';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { ComparisonWindow } from '../../../core/models/window-comparison.models';
import { logWarn } from '../../../core/log';
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

  private _session: PromptSession | null = null;

  readonly availability = this._availability.asReadonly();
  readonly engine = this._engine.asReadonly();
  readonly downloadPct = this._downloadPct.asReadonly();
  readonly transcript = this._transcript.asReadonly();
  readonly generating = this._generating.asReadonly();
  readonly failed = this._failed.asReadonly();
  /** Follow-up questions need a live Prompt API session; the Summarizer is one-shot. */
  readonly chatReady = computed(() => this._engine() === 'prompt' && this._sessionActive());

  /** Detect which built-in engine this browser offers; Prompt API wins over Summarizer. */
  async refresh(): Promise<void> {
    this._availability.set('checking');
    this._engine.set(null);
    try {
      const ai = builtInAi();
      if (ai.LanguageModel) {
        const availability = await ai.LanguageModel.availability(LANGUAGE_MODEL_OPTIONS);
        if (availability !== 'unavailable') {
          this._engine.set('prompt');
          this._availability.set(toCoachAvailability(availability));
          return;
        }
      }
      if (ai.Summarizer) {
        const availability = await ai.Summarizer.availability(SUMMARIZER_OPTIONS);
        if (availability !== 'unavailable') {
          this._engine.set('summarizer');
          this._availability.set(toCoachAvailability(availability));
          return;
        }
      }
      this._availability.set('unavailable');
    } catch (err) {
      logWarn('CoachFeatureService.refresh', err);
      this._availability.set('unavailable');
    }
  }

  /** Drop the session and transcript; called when the selection (and thus the findings) changes. */
  reset(): void {
    this._session?.destroy();
    this._session = null;
    this._sessionActive.set(false);
    this._transcript.set([]);
    this._failed.set(false);
    this._generating.set(false);
  }

  /** Open a fresh debrief: seed the session with the full analysis context, stream the debrief. */
  async start(data: CoachData): Promise<void> {
    if (this._generating()) return;
    this.reset();
    this._generating.set(true);
    try {
      if (this._engine() === 'prompt') await this._startPromptSession(data);
      else await this._summarizeOnce(data);
      this._availability.set('ready');
    } catch (err) {
      logWarn('CoachFeatureService.start', err);
      this._failed.set(true);
    } finally {
      this._generating.set(false);
    }
  }

  /** Follow-up question against the live session; the model still holds the pull context. */
  async ask(question: string): Promise<void> {
    const session = this._session;
    if (!session || this._generating()) return;
    this._failed.set(false);
    this._transcript.update(turns => [...turns, { role: 'user', text: question }]);
    this._generating.set(true);
    try {
      await this._streamCoachTurn(session.promptStreaming(question));
    } catch (err) {
      logWarn('CoachFeatureService.ask', err);
      this._failed.set(true);
    } finally {
      this._generating.set(false);
    }
  }

  /** Session creation triggers the one-time model download when needed; surface its progress. */
  private readonly _monitor: CreateMonitor = monitor => {
    monitor.addEventListener('downloadprogress', event => {
      const progress = event as DownloadProgressEvent;
      const fraction = progress.total ? progress.loaded / progress.total : progress.loaded;
      this._availability.set('downloading');
      this._downloadPct.set(Math.round(fraction * 100));
    });
  };

  private async _startPromptSession(data: CoachData): Promise<void> {
    const api = builtInAi().LanguageModel!;
    const session = await api.create({
      ...LANGUAGE_MODEL_OPTIONS,
      initialPrompts: [{ role: 'system', content: `${COACH_SYSTEM_PROMPT}\n\n${buildAnalysisContext(data)}` }],
      monitor: this._monitor,
    });
    this._session = session;
    this._sessionActive.set(true);
    // Flip out of the download UI the moment the session exists, not when streaming ends.
    this._availability.set('ready');
    await this._streamCoachTurn(session.promptStreaming(DEBRIEF_REQUEST));
  }

  private async _summarizeOnce(data: CoachData): Promise<void> {
    const api = builtInAi().Summarizer!;
    const session = await api.create({
      ...SUMMARIZER_OPTIONS,
      sharedContext: SUMMARIZER_CONTEXT,
      monitor: this._monitor,
    });
    this._availability.set('ready');
    try {
      await this._streamCoachTurn(session.summarizeStreaming(buildAnalysisContext(data)));
    } finally {
      session.destroy();
    }
  }

  private async _streamCoachTurn(chunks: AsyncIterable<string>): Promise<void> {
    this._transcript.update(turns => [...turns, { role: 'coach', text: '' }]);
    for await (const chunk of chunks) {
      this._transcript.update(turns => {
        const last = turns[turns.length - 1];
        return [...turns.slice(0, -1), { ...last, text: last.text + chunk }];
      });
    }
  }
}
