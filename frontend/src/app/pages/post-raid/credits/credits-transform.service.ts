/**
 * Credits slice transform + its pure functions, colocated.
 *
 * `CreditsTransformService` is the live/ingest half of the `CREDITS_DATA_SOURCE`: it
 * builds the encounter's attribution from the two pass-through API services - the WCL
 * rankings (the top parses the benchmarks drew from) and the spec's scraped guides (the
 * sources its rulebook was built from). Ingestion runs this very service headlessly to
 * write `data/specs/{spec}/credits/{enc}.json`; the browser runs it under the dev
 * `useLiveTransform` flag. Self-contained: it imports only the two API services + models.
 */
import { Injectable, inject } from '@angular/core';
import { WclApiService } from '../../../core/services/wcl-api';
import { DataFileApiService } from '../../../core/services/data-file-api';
import { WclRawRanking } from '../../../core/models/wcl.models';
import { GuideRef } from '../../../core/models/guides.models';
import { TopParseCredit, RulebookSource } from '../../../core/models/credits.models';
import { DataSource } from '../../../core/data-source/data-source';
import { CreditsBench } from './credits-data-source';

/**
 * WCL surfaces a privacy-hidden parse with an anonymized "Character <id>-<id>" name (real
 * names are letters only), so it can never open a real log - drop it. Keep in lockstep
 * with the same filter in `scripts/ingest/signature.ts` and the slice transforms.
 */
const ANONYMIZED_NAME = /^Character \d+-\d+$/;

/** How many top parses to credit - the same depth the benchmarks are built from. */
export const CREDIT_PARSE_COUNT = 10;

/* ----------------------------- pure functions ----------------------------- */

/** WCL report deep-link that opens the log on the credited fight. */
export function wclParseLink(reportCode: string, fightId: number): string {
  return `https://www.warcraftlogs.com/reports/${reportCode}?fight=${fightId}`;
}

/**
 * The top parses to credit: drop anonymized + code-less rows, de-dupe by report+fight
 * (one raider can hold several nearby ranks with the same pull), rank them 1..n and bake
 * a WCL deep-link. Total: returns [] for empty input, never throws.
 */
export function buildTopParseCredits(raw: WclRawRanking[], count: number): TopParseCredit[] {
  const credits: TopParseCredit[] = [];
  const seen = new Set<string>();
  for (const ranking of raw) {
    const code = ranking.report?.code;
    const fightId = ranking.report?.fightID;
    const player = ranking.name ?? '';
    if (!code || !fightId || !player || ANONYMIZED_NAME.test(player)) continue;
    const key = `${code}:${fightId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    credits.push({ rank: credits.length + 1, player, report_code: code, fight_id: fightId, link: wclParseLink(code, fightId) });
    if (credits.length >= count) break;
  }
  return credits;
}

/**
 * A cheap, no-network label for a guide source: SimulationCraft for an APL, the host +
 * video id for YouTube, the bare domain (no `www.`) for a web guide. Falls back to the
 * raw URL when it cannot be parsed, so a source is never dropped for a malformed URL.
 */
export function deriveSourceLabel(url: string, guideType: string): string {
  if (guideType === 'simc') return 'SimulationCraft APL';
  let host: string;
  let videoId: string;
  try {
    const parsed = new URL(url);
    host = parsed.hostname.replace(/^www\./, '');
    videoId = parsed.searchParams.get('v') ?? (host.includes('youtu.be') ? parsed.pathname.replace(/^\//, '') : '');
  } catch {
    return url;
  }
  if (guideType === 'youtube') return videoId ? `YouTube (${videoId})` : 'YouTube';
  return host || url;
}

/**
 * The guides a rulebook was actually built from: the scraped ones (the same set
 * `build-rulebook` feeds the LLM), each with a derived label and its URL to open.
 */
export function buildRulebookSources(guides: GuideRef[]): RulebookSource[] {
  return guides
    .filter(guide => guide.status === 'scraped' && !!guide.url)
    .map(guide => ({ url: guide.url, guide_type: guide.guide_type, label: deriveSourceLabel(guide.url, guide.guide_type) }));
}

/* ----------------------------- transform service ---------------------------- */

@Injectable({ providedIn: 'root' })
export class CreditsTransformService implements DataSource<CreditsBench> {
  private readonly wclApi = inject(WclApiService);
  private readonly dataFile = inject(DataFileApiService);

  async getBench(spec: string, encounterId: number): Promise<CreditsBench | null> {
    const [rankings, guides] = await Promise.all([
      this.wclApi.getRankings(spec, encounterId),
      this.dataFile.getGuides(spec),
    ]);
    const parses = buildTopParseCredits(rankings, CREDIT_PARSE_COUNT);
    const sources = buildRulebookSources(guides);
    if (!parses.length && !sources.length) return null;
    return { spec, encounter_id: encounterId, parses, sources };
  }
}
