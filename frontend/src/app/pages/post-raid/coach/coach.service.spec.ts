import { describe, expect, it, afterEach } from 'vitest';
import { AnalysisFinding } from '../../../core/models/analysis.models';
import {
  CoachFeatureService, MAX_PROMPT_FINDINGS,
  buildCoachDigest, buildCoachPrompt, countIssues, findingLine, specLabel,
} from './coach.service';

function finding(over: Partial<AnalysisFinding> = {}): AnalysisFinding {
  return { severity: 'warning', category: 'cooldown_delay', message: 'Shadow Blades held.', ...over };
}

const PULL_DURATION_S = 245; // renders as 04:05 in the prompt's context line
const CONTEXT = { spec: 'SubtletyRogue', encounterName: 'Chrome King', kill: false, durationS: PULL_DURATION_S };

describe('specLabel', () => {
  it('splits the spec folder name into words', () => {
    expect(specLabel('SubtletyRogue')).toBe('Subtlety Rogue');
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

describe('buildCoachPrompt', () => {
  it('leads with the pull context and lists the findings', () => {
    const prompt = buildCoachPrompt(CONTEXT, [finding({ severity: 'critical', message: 'Late opener.' })], []);
    expect(prompt).toBe([
      'Pull: Subtlety Rogue on Chrome King, Wipe, 04:05.',
      'Findings from log analysis vs top parses:',
      '- [critical] rotation: Late opener.',
    ].join('\n'));
  });

  it('marks a clean pull and appends the on-plan list', () => {
    const prompt = buildCoachPrompt(
      { ...CONTEXT, kill: true },
      [finding({ severity: 'success', cd_name: 'Shadow Blades' })],
      [],
    );
    expect(prompt).toContain('Kill');
    expect(prompt).toContain('- Nothing flagged.');
    expect(prompt).toContain('On plan: Shadow Blades.');
  });
});

describe('countIssues', () => {
  it('counts non-success findings from both slices and ignores successes', () => {
    expect(countIssues(
      [finding(), finding({ severity: 'success' })],
      [finding({ severity: 'critical' })],
    )).toBe(2);
  });
});

describe('CoachFeatureService (fake built-in AI)', () => {
  const globals = globalThis as Record<string, unknown>;
  afterEach(() => {
    delete globals['LanguageModel'];
    delete globals['Summarizer'];
  });

  function fakeLanguageModel(chunks: string[], destroyed: { value: boolean }) {
    return {
      availability: () => Promise.resolve('available'),
      create: () => Promise.resolve({
        promptStreaming: async function* () { yield* chunks; },
        destroy: () => { destroyed.value = true; },
      }),
    };
  }

  it('prefers the Prompt API and streams the debrief into the output signal', async () => {
    const destroyed = { value: false };
    globals['LanguageModel'] = fakeLanguageModel(['Tighten ', 'the opener.'], destroyed);
    const service = new CoachFeatureService();

    await service.refresh();
    expect(service.engine()).toBe('prompt');
    expect(service.availability()).toBe('ready');

    await service.generate(CONTEXT, [finding()], []);
    expect(service.output()).toBe('Tighten the opener.');
    expect(service.failed()).toBe(false);
    expect(destroyed.value).toBe(true);
  });

  it('falls back to the Summarizer when no Prompt API exists', async () => {
    globals['Summarizer'] = { availability: () => Promise.resolve('downloadable') };
    const service = new CoachFeatureService();

    await service.refresh();
    expect(service.engine()).toBe('summarizer');
    expect(service.availability()).toBe('downloadable');
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
    await service.generate(CONTEXT, [finding()], []);
    expect(service.failed()).toBe(true);
    expect(service.output()).toBe('');
  });
});
