import { describe, expect, it, afterEach, vi } from 'vitest';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import { ComparisonWindow } from '../../../core/models/window-comparison.models';
import {
  CoachData, CoachFeatureService, MAX_PROMPT_FINDINGS, MAX_SUGGESTED_QUESTIONS,
  DOWNLOAD_STALL_MS, buildAnalysisContext, buildCoachDigest, canStartWith, compactDamage,
  findingLine, hasCoachContext, specLabel, suggestedQuestions, windowLine,
} from './coach.service';

function finding(over: Partial<AnalysisFinding> = {}): AnalysisFinding {
  return { severity: 'warning', category: 'cooldown_delay', message: 'Shadow Blades held.', ...over };
}

function window_(over: Partial<ComparisonWindow> = {}): ComparisonWindow {
  return {
    timeStartS: 80, timeEndS: 95, spells: [], labels: [], status: 'good', statusIcon: '',
    overview: { label: 'Damage', icon: '', playerPct: 1_240_000, topAvg: 1_800_000, topMin: 1_500_000, topMax: 2_100_000 },
    detailRows: [],
    ...over,
  };
}

const PULL_DURATION_S = 245; // renders as 04:05 in the context's pull line
const CONTEXT = { spec: 'SubtletyRogue', encounterName: 'Chrome King', kill: false, durationS: PULL_DURATION_S };

function coachData(over: Partial<CoachData> = {}): CoachData {
  return {
    context: CONTEXT,
    rotationFindings: [], defensiveFindings: [],
    burstWindows: [], defensiveWindows: [],
    gearNotes: [],
    ...over,
  };
}

describe('specLabel', () => {
  it('splits the spec folder name into words', () => {
    expect(specLabel('SubtletyRogue')).toBe('Subtlety Rogue');
  });
});

describe('compactDamage', () => {
  it('formats millions, thousands, and null', () => {
    expect(compactDamage(1_240_000)).toBe('1.2M');
    expect(compactDamage(8_500)).toBe('9K');
    expect(compactDamage(null)).toBe('unknown');
  });
});

describe('findingLine', () => {
  it('renders severity, slice, message and the remedy as the fix', () => {
    const line = findingLine('rotation', finding({
      severity: 'critical', message: 'Shadow Blades: 2 casts, expected 4. 2 lost.',
      details: { remedy: 'Press Shadow Blades 2x more - sooner off cooldown.' },
    }));
    expect(line).toBe('- [critical] rotation: Shadow Blades: 2 casts, expected 4. 2 lost.'
      + ' Fix: Press Shadow Blades 2x more - sooner off cooldown.');
  });

  it('omits the fix when the finding has no remedy', () => {
    expect(findingLine('defensives', finding())).toBe('- [warning] defensives: Shadow Blades held.');
  });
});

describe('windowLine', () => {
  it('renders the time range, status, player vs top damage, and abilities', () => {
    const line = windowLine('burst', window_({
      status: 'warn',
      spells: [{ id: 1, icon: '', name: 'Shadow Blades' }], labels: ['Flagellation'],
    }));
    expect(line).toBe('- burst 01:20-01:35 [warn]: you 1.2M vs top avg 1.8M. Abilities: Shadow Blades, Flagellation.');
  });
});

describe('buildCoachDigest', () => {
  it('orders critical findings before warnings across both slices', () => {
    const digest = buildCoachDigest(
      [finding({ severity: 'warning', message: 'rotation warning' })],
      [finding({ severity: 'critical', message: 'defensive critical' })],
    );
    expect(digest.issueLines).toEqual([
      '- [critical] defensives: defensive critical',
      '- [warning] rotation: rotation warning',
    ]);
  });

  it('collapses success findings into the on-plan list instead of issue lines', () => {
    const digest = buildCoachDigest(
      [finding({ severity: 'success', cd_name: 'Shadow Blades' })],
      [finding({ severity: 'success', cd_name: undefined, message: 'Feint on plan.' })],
    );
    expect(digest.issueLines).toEqual([]);
    expect(digest.onPlan).toEqual(['Shadow Blades', 'Feint on plan.']);
  });

  it('keeps exactly MAX_PROMPT_FINDINGS issues and drops the overflow', () => {
    const atCap = Array.from({ length: MAX_PROMPT_FINDINGS }, () => finding());
    expect(buildCoachDigest(atCap, []).issueLines).toHaveLength(MAX_PROMPT_FINDINGS);
    expect(buildCoachDigest([...atCap, finding()], []).issueLines).toHaveLength(MAX_PROMPT_FINDINGS);
  });
});

describe('buildAnalysisContext', () => {
  it('leads with the pull line and includes every contributed section', () => {
    const context = buildAnalysisContext(coachData({
      rotationFindings: [finding({ severity: 'critical', message: 'Late opener.' })],
      burstWindows: [window_()],
      defensiveWindows: [window_({ timeStartS: 200, timeEndS: 210, status: 'bad' })],
      gearNotes: ['Enchant (Chest): Not enchanted. Top: 91%.'],
    }));
    expect(context).toContain('Pull: Subtlety Rogue on Chrome King, Wipe, 04:05.');
    expect(context).toContain('- [critical] rotation: Late opener.');
    expect(context).toContain('Burst windows');
    expect(context).toContain('- defensive 03:20-03:30 [bad]');
    expect(context).toContain('- Enchant (Chest): Not enchanted. Top: 91%.');
  });

  it('marks a clean pull and appends the on-plan list', () => {
    const context = buildAnalysisContext(coachData({
      context: { ...CONTEXT, kill: true },
      rotationFindings: [finding({ severity: 'success', cd_name: 'Shadow Blades' })],
    }));
    expect(context).toContain('Kill');
    expect(context).toContain('- Nothing flagged.');
    expect(context).toContain('On plan: Shadow Blades.');
  });
});

describe('suggestedQuestions', () => {
  it('grounds follow-ups in what was actually flagged, capped at MAX_SUGGESTED_QUESTIONS', () => {
    const questions = suggestedQuestions(coachData({
      rotationFindings: [finding({ severity: 'hold_suggestion', details: { cd_name: 'Vanish' } })],
      defensiveWindows: [window_({ timeStartS: 200, status: 'bad' })],
      gearNotes: ['Enchant missing.'],
    }));
    expect(questions).toEqual([
      'What do I fix first next pull?',
      'Why hold Vanish instead of casting it on cooldown?',
      'How do I survive the hit at 03:20?',
    ]);
    expect(questions).toHaveLength(MAX_SUGGESTED_QUESTIONS);
  });

  it('offers only the generic starter when nothing specific was flagged', () => {
    expect(suggestedQuestions(coachData())).toEqual(['What do I fix first next pull?']);
  });
});

describe('hasCoachContext', () => {
  it('is true once any card contributed data and false when all are empty', () => {
    expect(hasCoachContext(coachData())).toBe(false);
    expect(hasCoachContext(coachData({ gearNotes: ['note'] }))).toBe(true);
    expect(hasCoachContext(coachData({ burstWindows: [window_()] }))).toBe(true);
  });
});

describe('canStartWith', () => {
  it('keeps an already-running download actionable, since progress needs a monitor from create()', () => {
    expect(canStartWith('downloading')).toBe(true);
  });

  it('allows a ready or downloadable model and blocks the states with nothing to attach to', () => {
    expect(canStartWith('ready')).toBe(true);
    expect(canStartWith('downloadable')).toBe(true);
    expect(canStartWith('checking')).toBe(false);
    expect(canStartWith('unavailable')).toBe(false);
  });
});

interface CreateCall { options: Record<string, unknown> }

describe('CoachFeatureService (fake built-in AI)', () => {
  const globals = globalThis as Record<string, unknown>;
  afterEach(() => {
    delete globals['LanguageModel'];
    delete globals['Summarizer'];
    vi.useRealTimers();
  });

  /** Chrome's real failure mode: create() resolves never, rejects never, emits no progress. */
  function hangingLanguageModel(availability = 'downloading') {
    const calls: { signal?: AbortSignal } = {};
    globals['LanguageModel'] = {
      availability: () => Promise.resolve(availability),
      create: (options: { signal?: AbortSignal }) => {
        calls.signal = options.signal;
        return new Promise<never>(() => undefined);
      },
    };
    return calls;
  }

  function fakeLanguageModel(replies: string[][], availability = 'available') {
    const calls = { availabilityOptions: [] as Record<string, unknown>[], creates: [] as CreateCall[], destroyed: 0, prompts: [] as string[] };
    let reply = 0;
    globals['LanguageModel'] = {
      availability: (options: Record<string, unknown>) => {
        calls.availabilityOptions.push(options);
        return Promise.resolve(availability);
      },
      create: (options: Record<string, unknown>) => {
        calls.creates.push({ options });
        return Promise.resolve({
          promptStreaming: (input: string) => {
            calls.prompts.push(input);
            const chunks = replies[reply++] ?? [];
            return (async function* () { yield* chunks; })();
          },
          destroy: () => { calls.destroyed++; },
        });
      },
    };
    return calls;
  }

  it('passes the output language to BOTH availability() and create() - Chromium warns without it', async () => {
    const calls = fakeLanguageModel([['debrief']]);
    const service = new CoachFeatureService();
    await service.refresh();
    await service.start(coachData({ rotationFindings: [finding()] }));

    for (const options of [calls.availabilityOptions[0], calls.creates[0].options]) {
      expect(options['outputLanguage']).toBe('en');
      expect(options['expectedOutputs']).toEqual([{ type: 'text', languages: ['en'] }]);
    }
  });

  it('streams the debrief, then answers a follow-up on the SAME session with the context intact', async () => {
    const calls = fakeLanguageModel([['The pull ', 'died at 04:05.'], ['Fix the opener first.']]);
    const service = new CoachFeatureService();
    await service.refresh();
    expect(service.engine()).toBe('prompt');
    expect(service.availability()).toBe('ready');

    await service.start(coachData({ rotationFindings: [finding()] }));
    expect(service.transcript()).toEqual([{ role: 'coach', text: 'The pull died at 04:05.' }]);
    expect(calls.creates).toHaveLength(1);
    const systemPrompt = (calls.creates[0].options['initialPrompts'] as { content: string }[])[0].content;
    expect(systemPrompt).toContain('Shadow Blades held.');
    expect(service.chatReady()).toBe(true);

    await service.ask('What do I fix first next pull?');
    expect(calls.creates).toHaveLength(1);
    expect(calls.prompts[1]).toBe('What do I fix first next pull?');
    expect(service.transcript()).toEqual([
      { role: 'coach', text: 'The pull died at 04:05.' },
      { role: 'user', text: 'What do I fix first next pull?' },
      { role: 'coach', text: 'Fix the opener first.' },
    ]);
  });

  it('reset destroys the session so a new selection starts a clean debrief', async () => {
    const calls = fakeLanguageModel([['debrief']]);
    const service = new CoachFeatureService();
    await service.refresh();
    await service.start(coachData());
    service.reset();
    expect(calls.destroyed).toBe(1);
    expect(service.transcript()).toEqual([]);
    expect(service.chatReady()).toBe(false);
  });

  it('falls back to the one-shot Summarizer with no chat when there is no Prompt API', async () => {
    const availabilityOptions: Record<string, unknown>[] = [];
    globals['Summarizer'] = {
      availability: (options: Record<string, unknown>) => {
        availabilityOptions.push(options);
        return Promise.resolve('available');
      },
      create: () => Promise.resolve({
        summarizeStreaming: () => (async function* () { yield 'key points'; })(),
        destroy: () => undefined,
      }),
    };
    const service = new CoachFeatureService();
    await service.refresh();
    expect(service.engine()).toBe('summarizer');
    expect(availabilityOptions[0]['outputLanguage']).toBe('en');

    await service.start(coachData({ rotationFindings: [finding()] }));
    expect(service.transcript()).toEqual([{ role: 'coach', text: 'key points' }]);
    expect(service.chatReady()).toBe(false);
  });

  it('starts from a download Chrome already had in flight, which reports no progress on its own', async () => {
    const calls = fakeLanguageModel([['debrief']], 'downloading');
    const service = new CoachFeatureService();
    await service.refresh();
    expect(service.availability()).toBe('downloading');

    await service.start(coachData({ rotationFindings: [finding()] }));
    expect(calls.creates).toHaveLength(1);
    expect(service.transcript()).toEqual([{ role: 'coach', text: 'debrief' }]);
    expect(service.availability()).toBe('ready');
  });

  it('traces the probe, the session handshake and the stream length for debugging', async () => {
    fakeLanguageModel([['debrief']]);
    const service = new CoachFeatureService();
    await service.refresh();
    await service.start(coachData({ rotationFindings: [finding()] }));

    const trace = service.diagnostics().join('\n');
    expect(trace).toContain('LanguageModel present');
    expect(trace).toContain('LanguageModel.availability -> available');
    expect(trace).toContain('LanguageModel.create: session ready');
    expect(trace).toContain('stream: ended after 1 chunk(s)');
  });

  it('traces a create() failure with its error name and message', async () => {
    globals['LanguageModel'] = {
      availability: () => Promise.resolve('available'),
      create: () => Promise.reject(new Error('model crashed')),
    };
    const service = new CoachFeatureService();
    await service.refresh();
    await service.start(coachData({ rotationFindings: [finding()] }));
    expect(service.diagnostics().join('\n')).toContain('start failed: Error: model crashed');
  });

  it('flags the download as stalled once Chrome sends no progress for DOWNLOAD_STALL_MS', async () => {
    vi.useFakeTimers();
    hangingLanguageModel();
    const service = new CoachFeatureService();
    await service.refresh();
    void service.start(coachData({ rotationFindings: [finding()] }));

    await vi.advanceTimersByTimeAsync(DOWNLOAD_STALL_MS - 1);
    expect(service.stalled()).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(service.stalled()).toBe(true);
    // The periodic re-probe records whether Chrome's own state is moving while create() waits.
    expect(service.diagnostics().join('\n')).toContain('still waiting; availability -> downloading');
  });

  it('cancel aborts the pending create() so the card stops waiting on a fetch Chrome is not running', async () => {
    const calls = hangingLanguageModel();
    const service = new CoachFeatureService();
    await service.refresh();
    void service.start(coachData({ rotationFindings: [finding()] }));
    expect(service.generating()).toBe(true);
    expect(calls.signal?.aborted).toBe(false);

    service.cancel();
    expect(calls.signal?.aborted).toBe(true);
    expect(service.generating()).toBe(false);
    expect(service.failed()).toBe(false);
  });

  it('reports unavailable when the browser has neither engine', async () => {
    const service = new CoachFeatureService();
    await service.refresh();
    expect(service.engine()).toBeNull();
    expect(service.availability()).toBe('unavailable');
  });

  it('flags a failed generation without throwing', async () => {
    globals['LanguageModel'] = {
      availability: () => Promise.resolve('available'),
      create: () => Promise.reject(new Error('model crashed')),
    };
    const service = new CoachFeatureService();
    await service.refresh();
    await service.start(coachData({ rotationFindings: [finding()] }));
    expect(service.failed()).toBe(true);
    expect(service.transcript()).toEqual([]);
  });
});
