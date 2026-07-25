import { describe, expect, it, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WclApiService } from '../../../core/services/wcl-api';
import { WclEvent } from '../../../core/models/wcl.models';
import {
  CoachFeatureService, DOWNLOAD_STALL_MS, EVIDENCE_LEAD_S, MAX_EVIDENCE_ENTRIES,
  MODEL_DISK_REQUIREMENT_GB, VERDICT_SCHEMA, buildEvidence, buildExplainPrompt, canStartWith,
  causeLabel, describeStorageQuota, evidenceDamageTaken, parseVerdict,
} from './coach.service';
import { cast, damageTaken, applyBuff } from '../../../../testing/builders/events';
import { SHADOW_BLADES, FEINT } from '../../../../testing/spell-ids';

// The shared event builders stamp fight-relative times, so the fight starts at the epoch here.
const FIGHT_START_MS = 0;
const FLAGGED_AT_MS = 60_000; // the finding's fight-relative instant, 01:00 into the pull
const BOSS_HIT = 4001;
const BOSS_HIT_DAMAGE = 820_000;
const ABSORBED = 80_000;

const ABILITIES = [
  { gameID: SHADOW_BLADES, name: 'Shadow Blades', icon: 'sb' },
  { gameID: FEINT, name: 'Feint', icon: 'ft' },
  { gameID: BOSS_HIT, name: 'Crushing Slam', icon: 'cs' },
];

/** The builders emit fight-relative seconds; the evidence window works off the fight start. */
function at(offsetS: number): number {
  return FLAGGED_AT_MS / 1000 + offsetS;
}

const ANCHOR = {
  reportCode: 'abc', fightId: 3, playerId: 10,
  timestampMs: FLAGGED_AT_MS, headline: 'Shadow Blades: held', measured: '47s avg 30s',
};

describe('buildEvidence', () => {
  it('collects casts, damage taken and buffs around the instant, offset from it', () => {
    const evidence = buildEvidence({
      casts: [cast(SHADOW_BLADES, at(-2))],
      damageTaken: [damageTaken(BOSS_HIT, at(-1), BOSS_HIT_DAMAGE, { absorbed: ABSORBED })],
      buffs: [applyBuff(FEINT, at(-1.5))],
    }, ABILITIES, FIGHT_START_MS, FLAGGED_AT_MS);

    expect(evidence).toEqual([
      { offsetS: -2, kind: 'cast', label: 'Shadow Blades' },
      { offsetS: -1.5, kind: 'buff', label: 'Feint' },
      { offsetS: -1, kind: 'damage-taken', label: 'Crushing Slam', amount: BOSS_HIT_DAMAGE + ABSORBED },
    ]);
  });

  it('excludes events outside the window and keeps the boundary', () => {
    const evidence = buildEvidence({
      casts: [cast(SHADOW_BLADES, at(-EVIDENCE_LEAD_S)), cast(SHADOW_BLADES, at(-EVIDENCE_LEAD_S - 0.1))],
      damageTaken: [], buffs: [],
    }, ABILITIES, FIGHT_START_MS, FLAGGED_AT_MS);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].offsetS).toBe(-EVIDENCE_LEAD_S);
  });

  it('caps a busy window at MAX_EVIDENCE_ENTRIES so the on-device context holds', () => {
    const casts: WclEvent[] = Array.from({ length: MAX_EVIDENCE_ENTRIES + 5 },
      (_, i) => cast(SHADOW_BLADES, at(-EVIDENCE_LEAD_S + i * 0.1)));
    expect(buildEvidence({ casts, damageTaken: [], buffs: [] }, ABILITIES, FIGHT_START_MS, FLAGGED_AT_MS))
      .toHaveLength(MAX_EVIDENCE_ENTRIES);
  });

  it('names an ability the report does not describe by its id', () => {
    const evidence = buildEvidence({ casts: [cast(SHADOW_BLADES, at(-1))], damageTaken: [], buffs: [] },
      [], FIGHT_START_MS, FLAGGED_AT_MS);
    expect(evidence[0].label).toBe(`Spell ${SHADOW_BLADES}`);
  });
});

describe('evidenceDamageTaken', () => {
  it('totals only the damage entries', () => {
    const evidence = buildEvidence({
      casts: [cast(SHADOW_BLADES, at(-2))],
      damageTaken: [damageTaken(BOSS_HIT, at(-1), BOSS_HIT_DAMAGE, { absorbed: ABSORBED })],
      buffs: [],
    }, ABILITIES, FIGHT_START_MS, FLAGGED_AT_MS);
    expect(evidenceDamageTaken(evidence)).toBe(BOSS_HIT_DAMAGE + ABSORBED);
  });

  it('is zero when nothing hit the player', () => {
    expect(evidenceDamageTaken([])).toBe(0);
  });
});

describe('buildExplainPrompt', () => {
  it('states the finding, the instant, and the evidence as offset lines', () => {
    const evidence = buildEvidence({
      casts: [cast(SHADOW_BLADES, at(-2))],
      damageTaken: [damageTaken(BOSS_HIT, at(1), BOSS_HIT_DAMAGE)],
      buffs: [],
    }, ABILITIES, FIGHT_START_MS, FLAGGED_AT_MS);
    const prompt = buildExplainPrompt(ANCHOR, evidence);

    expect(prompt).toContain('Flagged: Shadow Blades: held');
    expect(prompt).toContain('Measured: 47s avg 30s');
    expect(prompt).toContain('01:00 into the pull');
    expect(prompt).toContain('-2.0s cast Shadow Blades');
    expect(prompt).toContain(`+1.0s took ${BOSS_HIT_DAMAGE} from Crushing Slam`);
  });

  it('says so plainly when the window recorded nothing', () => {
    expect(buildExplainPrompt(ANCHOR, [])).toContain('Evidence: none recorded in this window.');
  });
});

describe('parseVerdict', () => {
  it('accepts the constrained shape the schema asks for', () => {
    expect(parseVerdict('{"cause":"pressured","detail":"Took two hits.","confidence":"high"}'))
      .toEqual({ cause: 'pressured', detail: 'Took two hits.', confidence: 'high' });
  });

  it('rejects malformed json and unknown causes rather than rendering junk', () => {
    expect(parseVerdict('not json')).toBeNull();
    expect(parseVerdict('{"cause":"vibes","detail":"x","confidence":"high"}')).toBeNull();
  });
});

describe('causeLabel', () => {
  it('renders every schema cause, so a verdict never shows a raw enum', () => {
    for (const cause of VERDICT_SCHEMA.properties.cause.enum) {
      expect(causeLabel(cause as Parameters<typeof causeLabel>[0])).not.toBe('');
    }
  });
});

describe('describeStorageQuota', () => {
  const SMALL_VOLUME_QUOTA_BYTES = 10.7e9; // 60% of a ~18 GB volume, under the model requirement
  const LARGE_VOLUME_QUOTA_BYTES = 300e9; // 60% of a ~500 GB volume

  it('reads the profile volume size back out of the quota and flags it as too small', () => {
    const described = describeStorageQuota(SMALL_VOLUME_QUOTA_BYTES);
    expect(described).toContain('about 18 GB total');
    expect(described).toContain(`under the ${MODEL_DISK_REQUIREMENT_GB} GB`);
  });

  it('clears a volume with room for the model', () => {
    expect(describeStorageQuota(LARGE_VOLUME_QUOTA_BYTES)).toContain('about 500 GB total');
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

describe('CoachFeatureService (fake built-in AI)', () => {
  const globals = globalThis as Record<string, unknown>;
  afterEach(() => {
    delete globals['LanguageModel'];
    vi.useRealTimers();
  });

  function configure(): CoachFeatureService {
    const wclFake = {
      getReport: () => Promise.resolve({
        fights: [{ id: ANCHOR.fightId, startTime: FIGHT_START_MS, endTime: 300_000 }],
        masterData: { abilities: ABILITIES },
      }),
      getAllEvents: (_code: string, _fight: number, dataType: string) => Promise.resolve(
        dataType === 'Casts' ? [cast(SHADOW_BLADES, at(-2))]
          : dataType === 'DamageTaken' ? [damageTaken(BOSS_HIT, at(-1), BOSS_HIT_DAMAGE)]
            : [],
      ),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: WclApiService, useValue: wclFake as unknown as WclApiService }],
    });
    return TestBed.inject(CoachFeatureService);
  }

  function fakeLanguageModel(reply: string) {
    const calls = { availabilityOptions: [] as Record<string, unknown>[], prompts: [] as string[], options: [] as Record<string, unknown>[], destroyed: 0 };
    globals['LanguageModel'] = {
      availability: (options: Record<string, unknown>) => {
        calls.availabilityOptions.push(options);
        return Promise.resolve('available');
      },
      create: () => Promise.resolve({
        prompt: (input: string, options: Record<string, unknown>) => {
          calls.prompts.push(input);
          calls.options.push(options);
          return Promise.resolve(reply);
        },
        destroy: () => { calls.destroyed++; },
      }),
    };
    return calls;
  }

  it('shows the log evidence and a typed verdict, constraining the model to the schema', async () => {
    const calls = fakeLanguageModel('{"cause":"pressured","detail":"Took Crushing Slam 1s earlier.","confidence":"high"}');
    const service = configure();
    await service.refresh();
    await service.explain(ANCHOR);

    expect(service.open()).toBe(true);
    expect(service.evidence().map(entry => entry.label)).toEqual(['Shadow Blades', 'Crushing Slam']);
    expect(service.verdict()).toEqual({
      cause: 'pressured', detail: 'Took Crushing Slam 1s earlier.', confidence: 'high',
    });
    expect(calls.options[0]['responseConstraint']).toBe(VERDICT_SCHEMA);
    expect(calls.prompts[0]).toContain('cast Shadow Blades');
    expect(calls.destroyed).toBe(1);
  });

  it('passes the output language to BOTH availability() and create() - Chromium warns without it', async () => {
    const calls = fakeLanguageModel('{"cause":"movement","detail":"x","confidence":"low"}');
    const service = configure();
    await service.refresh();
    expect(calls.availabilityOptions[0]['outputLanguage']).toBe('en');
    expect(calls.availabilityOptions[0]['expectedOutputs']).toEqual([{ type: 'text', languages: ['en'] }]);
  });

  it('still shows the evidence when the browser has no model at all', async () => {
    const service = configure();
    await service.refresh();
    expect(service.availability()).toBe('unavailable');

    await service.explain(ANCHOR);
    expect(service.evidence()).toHaveLength(2);
    expect(service.verdict()).toBeNull();
    expect(service.failed()).toBe(false);
  });

  it('marks a verdict the model returned malformed as failed, keeping the evidence', async () => {
    fakeLanguageModel('not json at all');
    const service = configure();
    await service.refresh();
    await service.explain(ANCHOR);
    expect(service.verdict()).toBeNull();
    expect(service.failed()).toBe(true);
    expect(service.evidence()).toHaveLength(2);
  });

  it('flags the download as stalled once Chrome sends no progress for DOWNLOAD_STALL_MS', async () => {
    vi.useFakeTimers();
    globals['LanguageModel'] = {
      availability: () => Promise.resolve('downloading'),
      create: () => new Promise<never>(() => undefined),
    };
    const service = configure();
    await service.refresh();
    void service.explain(ANCHOR);
    await vi.advanceTimersByTimeAsync(DOWNLOAD_STALL_MS);
    expect(service.stalled()).toBe(true);
  });
});
