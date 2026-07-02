import { describe, it, expect } from 'vitest';
import { WclRawRanking } from '../../../core/models/wcl.models';
import { GuideRef } from '../../../core/models/guides.models';
import {
  wclParseLink, buildTopParseCredits, deriveSourceLabel, buildRulebookSources,
} from './credits-transform.service';

// A generous cap so the count limit is not what trims these fixtures - each test that
// exercises the cap passes its own small limit explicitly.
const NO_CAP = 100;

/** A raw WCL ranking row with a real (letters-only) name and its own report + fight. */
function ranking(name: string, code: string, fightID: number): WclRawRanking {
  return { name, report: { code, fightID } };
}

describe('wclParseLink', () => {
  it('deep-links to the report on the credited fight', () => {
    expect(wclParseLink('AbCdEfGhIjKlMnOp', 7)).toBe(
      'https://www.warcraftlogs.com/reports/AbCdEfGhIjKlMnOp?fight=7',
    );
  });
});

describe('buildTopParseCredits', () => {
  it('ranks the kept parses 1..n and bakes a deep-link for each', () => {
    const raw = [ranking('Alpha', 'rep1', 1), ranking('Bravo', 'rep2', 2)];
    const credits = buildTopParseCredits(raw, NO_CAP);
    expect(credits).toEqual([
      { rank: 1, player: 'Alpha', report_code: 'rep1', fight_id: 1, link: wclParseLink('rep1', 1) },
      { rank: 2, player: 'Bravo', report_code: 'rep2', fight_id: 2, link: wclParseLink('rep2', 2) },
    ]);
  });

  it('drops privacy-anonymized parses (they can never open a real log)', () => {
    const raw = [ranking('Character 12-3456', 'rep1', 1), ranking('Real', 'rep2', 2)];
    expect(buildTopParseCredits(raw, NO_CAP).map(c => c.player)).toEqual(['Real']);
  });

  it('drops rows missing a report code, fight id, or name', () => {
    const raw: WclRawRanking[] = [
      { name: 'NoReport' },
      { name: 'NoFight', report: { code: 'rep1' } },
      { report: { code: 'rep2', fightID: 2 } },
      ranking('Kept', 'rep3', 3),
    ];
    expect(buildTopParseCredits(raw, NO_CAP).map(c => c.player)).toEqual(['Kept']);
  });

  it('de-dupes by report+fight so one raider is credited once for a pull', () => {
    const raw = [ranking('Same', 'rep1', 1), ranking('Same', 'rep1', 1), ranking('Other', 'rep2', 2)];
    expect(buildTopParseCredits(raw, NO_CAP).map(c => c.player)).toEqual(['Same', 'Other']);
  });

  it('caps at the requested count', () => {
    const raw = [ranking('A', 'r1', 1), ranking('B', 'r2', 2), ranking('C', 'r3', 3)];
    const limit = 2;
    expect(buildTopParseCredits(raw, limit)).toHaveLength(limit);
  });

  it('returns [] for empty input (total function)', () => {
    expect(buildTopParseCredits([], NO_CAP)).toEqual([]);
  });
});

describe('deriveSourceLabel', () => {
  it('names a SimC APL without touching the URL', () => {
    expect(deriveSourceLabel('https://github.com/simulationcraft/simc/raw/x.simc', 'simc')).toBe('SimulationCraft APL');
  });

  it('uses the bare domain (no www.) for a web guide', () => {
    expect(deriveSourceLabel('https://www.wowhead.com/guide/classes/rogue', 'web')).toBe('wowhead.com');
  });

  it('reads the video id from a youtube watch URL', () => {
    expect(deriveSourceLabel('https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube')).toBe('YouTube (dQw4w9WgXcQ)');
  });

  it('reads the video id from a youtu.be short URL', () => {
    expect(deriveSourceLabel('https://youtu.be/dQw4w9WgXcQ', 'youtube')).toBe('YouTube (dQw4w9WgXcQ)');
  });

  it('falls back to the raw URL when it cannot be parsed', () => {
    expect(deriveSourceLabel('not a url', 'web')).toBe('not a url');
  });
});

describe('buildRulebookSources', () => {
  it('keeps only scraped guides and labels each', () => {
    const guides: GuideRef[] = [
      { url: 'https://www.wowhead.com/guide', guide_type: 'web', status: 'scraped' },
      { url: 'https://youtu.be/abc123', guide_type: 'youtube', status: 'scraped' },
      { url: 'https://example.com/failed', guide_type: 'web', status: 'error' },
    ];
    expect(buildRulebookSources(guides)).toEqual([
      { url: 'https://www.wowhead.com/guide', guide_type: 'web', label: 'wowhead.com' },
      { url: 'https://youtu.be/abc123', guide_type: 'youtube', label: 'YouTube (abc123)' },
    ]);
  });

  it('returns [] when no guides are scraped', () => {
    expect(buildRulebookSources([{ url: 'https://x.com', guide_type: 'web', status: 'pending' }])).toEqual([]);
  });
});
