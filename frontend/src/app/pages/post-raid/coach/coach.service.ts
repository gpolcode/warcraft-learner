import { Injectable, signal } from '@angular/core';
import { AnalysisFinding } from '../../../core/models/analysis.models';
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

interface LanguageModelApi {
  availability(): Promise<BuiltInAvailability>;
  create(options?: {
    initialPrompts?: { role: 'system' | 'user' | 'assistant'; content: string }[];
    expectedInputs?: { type: 'text'; languages: string[] }[];
    expectedOutputs?: { type: 'text'; languages: string[] }[];
    outputLanguage?: string;
    monitor?: CreateMonitor;
  }): Promise<PromptSession>;
}

interface SummarizerSession {
  summarizeStreaming(input: string, options?: { context?: string }): AsyncIterable<string>;
  destroy(): void;
}

interface SummarizerApi {
  availability(): Promise<BuiltInAvailability>;
  create(options?: {
    type?: 'key-points' | 'tldr' | 'teaser' | 'headline';
    format?: 'plain-text' | 'markdown';
    length?: 'short' | 'medium' | 'long';
    sharedContext?: string;
    outputLanguage?: string;
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

/** On-device models have small context windows, so the digest is hard-capped. */
export const MAX_PROMPT_FINDINGS = 24;

export const COACH_SYSTEM_PROMPT =
  'You are a World of Warcraft raid coach debriefing a Mythic raider after one pull. '
  + 'Write plain text only: one short paragraph on the overall pull, then a numbered list of the '
  + 'top 3 fixes in priority order, each a single imperative sentence. Use only the findings '
  + 'provided. Never invent numbers, abilities, or events. No praise, no filler.';

export const SUMMARIZER_CONTEXT =
  'Post-pull World of Warcraft log analysis findings for a Mythic raider, benchmarked against '
  + 'top parses. Keep ability names and numbers exact. Critical findings matter most.';

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

export function findingLine(slice: string, finding: AnalysisFinding): string {
  const fix = finding.details?.remedy ? ` Fix: ${finding.details.remedy}` : '';
  return `- [${SEVERITY_LABEL[finding.severity]}] ${slice}: ${finding.message}${fix}`;
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

export function buildCoachPrompt(
  context: CoachContext, rotation: AnalysisFinding[], defensive: AnalysisFinding[],
): string {
  const digest = buildCoachDigest(rotation, defensive);
  const outcome = context.kill ? 'Kill' : 'Wipe';
  const lines = [
    `Pull: ${specLabel(context.spec)} on ${context.encounterName}, ${outcome}, ${fmtClock(context.durationS)}.`,
    'Findings from log analysis vs top parses:',
    ...(digest.issueLines.length ? digest.issueLines : ['- Nothing flagged.']),
  ];
  if (digest.onPlan.length) lines.push(`On plan: ${digest.onPlan.join(', ')}.`);
  return lines.join('\n');
}

/** Total number of issue (non-success) findings across both slices. */
export function countIssues(rotation: AnalysisFinding[], defensive: AnalysisFinding[]): number {
  return [...rotation, ...defensive].filter(finding => finding.severity !== 'success').length;
}

function builtInAi(): BuiltInAiGlobals {
  return globalThis as unknown as BuiltInAiGlobals;
}

function toCoachAvailability(availability: BuiltInAvailability): CoachAvailability {
  return availability === 'available' ? 'ready' : availability;
}

/** Shell around the browser's built-in on-device AI; model, prompt and output never leave the browser. */
@Injectable({ providedIn: 'root' })
export class CoachFeatureService {
  private readonly _availability = signal<CoachAvailability>('checking');
  private readonly _engine = signal<CoachEngine | null>(null);
  private readonly _downloadPct = signal(0);
  private readonly _output = signal('');
  private readonly _generating = signal(false);
  private readonly _failed = signal(false);

  readonly availability = this._availability.asReadonly();
  readonly engine = this._engine.asReadonly();
  readonly downloadPct = this._downloadPct.asReadonly();
  readonly output = this._output.asReadonly();
  readonly generating = this._generating.asReadonly();
  readonly failed = this._failed.asReadonly();

  /** Detect which built-in engine this browser offers; Prompt API wins over Summarizer. */
  async refresh(): Promise<void> {
    this._availability.set('checking');
    this._engine.set(null);
    try {
      const ai = builtInAi();
      for (const [engine, api] of [['prompt', ai.LanguageModel], ['summarizer', ai.Summarizer]] as const) {
        if (!api) continue;
        const availability = await api.availability();
        if (availability === 'unavailable') continue;
        this._engine.set(engine);
        this._availability.set(toCoachAvailability(availability));
        return;
      }
      this._availability.set('unavailable');
    } catch (err) {
      logWarn('CoachFeatureService.refresh', err);
      this._availability.set('unavailable');
    }
  }

  /** Clear any generated debrief; called when the selection (and thus the findings) changes. */
  reset(): void {
    this._output.set('');
    this._failed.set(false);
    this._generating.set(false);
  }

  async generate(context: CoachContext, rotation: AnalysisFinding[], defensive: AnalysisFinding[]): Promise<void> {
    if (this._generating()) return;
    this._failed.set(false);
    this._output.set('');
    this._generating.set(true);
    try {
      const stream = this._engine() === 'prompt'
        ? await this._promptStream(context, rotation, defensive)
        : await this._summaryStream(context, rotation, defensive);
      try {
        for await (const chunk of stream.chunks) this._output.update(text => text + chunk);
      } finally {
        stream.destroy();
      }
      this._availability.set('ready');
    } catch (err) {
      logWarn('CoachFeatureService.generate', err);
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

  private async _promptStream(
    context: CoachContext, rotation: AnalysisFinding[], defensive: AnalysisFinding[],
  ): Promise<{ chunks: AsyncIterable<string>; destroy: () => void }> {
    const api = builtInAi().LanguageModel!;
    const session = await api.create({
      initialPrompts: [{ role: 'system', content: COACH_SYSTEM_PROMPT }],
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      // Chromium attests output safety on this option; without it every request logs a console warning.
      outputLanguage: 'en',
      monitor: this._monitor,
    });
    return { chunks: session.promptStreaming(buildCoachPrompt(context, rotation, defensive)), destroy: () => session.destroy() };
  }

  private async _summaryStream(
    context: CoachContext, rotation: AnalysisFinding[], defensive: AnalysisFinding[],
  ): Promise<{ chunks: AsyncIterable<string>; destroy: () => void }> {
    const api = builtInAi().Summarizer!;
    const session = await api.create({
      type: 'key-points', format: 'plain-text', length: 'short',
      sharedContext: SUMMARIZER_CONTEXT,
      outputLanguage: 'en',
      monitor: this._monitor,
    });
    return { chunks: session.summarizeStreaming(buildCoachPrompt(context, rotation, defensive)), destroy: () => session.destroy() };
  }
}
