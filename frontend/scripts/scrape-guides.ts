#!/usr/bin/env node
/**
 * warcraft-learner - Standalone Guide Scraper CLI
 *
 * Re-scrapes every existing guide across all specs, writing fresh content to
 * data/specs/{spec}/guides.json. Pass --spec/--url to add a new guide instead.
 *
 * Usage:
 *   npm run scrape                                            # re-scrape all existing guides
 *   npm run scrape -- --spec SubtletyRogue --url <url>        # add and scrape one guide
 *
 * Supported guide types:
 *   web      - HTML page scraped with fetch + text extraction
 *   youtube  - YouTube transcript via the InnerTube player API
 *   simc     - Raw text file (GitHub raw URLs auto-converted)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { JSDOM } from 'jsdom';
import { Innertube } from 'youtubei.js';
import { BG, type BgConfig } from 'bgutils-js';
import { MAX_GUIDE_CHARS as MAX_CONTENT_CHARS, readJson, writeJson, getKnownSpecs as listSpecs } from './lib.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(FRONTEND_ROOT, 'public', 'data', 'specs');

// ── CLI argument parsing ───────────────────────────────────────────────────────

const program = new Command()
  .name('scrape')
  .description('Re-scrape every existing guide; or add one with --spec/--url.')
  .option('--spec <spec>', 'spec name for add-and-scrape mode')
  .option('--url <url>', 'guide URL to add (requires --spec)')
  .option('--type <type>', 'guide type: web | youtube | simc (default: web)', 'web')
  .addHelpText('after', '\nExamples:\n  npm run scrape\n  npm run scrape -- --spec SubtletyRogue --url https://example.com --type web')
  .parse(process.argv);

const opts = program.opts<{ spec?: string; url?: string; type: string }>();

if (opts.url && !opts.spec) {
  program.error('--url requires --spec');
}
if (!['web', 'youtube', 'simc'].includes(opts.type)) {
  program.error(`invalid --type: "${opts.type}". Must be web, youtube, or simc.`);
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Guide {
  id: number;
  spec: string;
  url: string;
  guide_type: 'web' | 'youtube' | 'simc';
  content: string;
  status: 'pending' | 'scraped' | 'error';
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const getKnownSpecs = (): string[] => listSpecs(DATA_DIR);

// ── Guides storage ──────────────────────────────────────────────────────────

function guidesPath(spec: string): string {
  return path.join(DATA_DIR, spec, 'guides.json');
}

async function loadGuides(spec: string): Promise<Guide[]> {
  return await readJson<Guide[]>(guidesPath(spec)) ?? [];
}

async function saveGuides(spec: string, guides: Guide[]): Promise<void> {
  await writeJson(guidesPath(spec), guides);
}

// ── Scraping ──────────────────────────────────────────────────────────────────

// Block-level tags whose boundaries should become line breaks in the extracted text,
// so adjacent blocks don't run their words together once tags are gone.
const BLOCK_SELECTOR = 'br, p, div, h1, h2, h3, h4, h5, h6, li, tr, section, article';

function htmlToText(html: string): string {
  const doc = new JSDOM(html).window.document;

  // Drop non-content chrome.
  doc.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());

  // Mark block boundaries with newlines before flattening to text.
  doc.querySelectorAll(BLOCK_SELECTOR).forEach(el => el.after(doc.createTextNode('\n')));

  // textContent strips tags and decodes entities natively.
  const text = doc.body?.textContent ?? '';

  // Collapse whitespace (not tag/entity work, so plain string handling is fine).
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

async function scrapeWeb(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; warcraft-learner/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const html = await res.text();
  return htmlToText(html).slice(0, MAX_CONTENT_CHARS);
}

async function scrapeSimC(url: string): Promise<string> {
  // Convert GitHub blob URLs to raw
  const rawUrl = url
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/');
  const res = await fetch(rawUrl, {
    headers: { 'User-Agent': 'warcraft-learner/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${rawUrl}`);
  const text = await res.text();
  return text.slice(0, MAX_CONTENT_CHARS);
}

// YouTube serves caption data to datacenter IPs (which is what GitHub Actions runs on) only
// when the request carries a proof-of-origin (poToken): without it the player response has
// no captions object, for every InnerTube client. We mint a token with bgutils-js (the
// BotGuard challenge runs in a jsdom global) and build an attested Innertube session. Minting
// is expensive and the token is reused for every video in a run, so it is memoized.
interface YoutubeSession {
  youtube: Innertube;
  poToken: string;
}
let youtubeSessionPromise: Promise<YoutubeSession> | null = null;

// YouTube's web BotGuard request key - a public constant, the same one youtubei.js documents.
const BOTGUARD_REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';

async function getYoutubeSession(): Promise<YoutubeSession> {
  youtubeSessionPromise ??= (async () => {
    // A throwaway session just to obtain visitor data, which the poToken is bound to.
    const bootstrap = await Innertube.create({ retrieve_player: false });
    const visitorData = bootstrap.session.context.client.visitorData;
    if (!visitorData) throw new Error('Could not obtain visitor data for poToken minting');

    // BotGuard expects a browser-like global; jsdom supplies window/document.
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'https://www.youtube.com/' });
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });

    const bgConfig: BgConfig = {
      fetch: (input, init) => fetch(input, init),
      globalObj: globalThis,
      identifier: visitorData,
      requestKey: BOTGUARD_REQUEST_KEY,
    };

    const challenge = await BG.Challenge.create(bgConfig);
    if (!challenge) throw new Error('Could not create BotGuard challenge');

    const interpreterJavascript = challenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (!interpreterJavascript) throw new Error('Could not load BotGuard interpreter');
    new Function(interpreterJavascript)();

    const { poToken } = await BG.PoToken.generate({
      program: challenge.program,
      globalName: challenge.globalName,
      bgConfig,
    });

    const youtube = await Innertube.create({ po_token: poToken, visitor_data: visitorData });
    return { youtube, poToken };
  })();
  return youtubeSessionPromise;
}

// Structural subset of youtubei.js's CaptionTrackData (not re-exported from the package root).
interface CaptionTrack {
  base_url: string;
  language_code?: string;
  kind?: string; // 'asr' for auto-generated
}

// Pick an English caption track, preferring a manually-authored one over auto-generated
// ('asr'); fall back to whatever the video offers.
function pickCaptionTrack(tracks: CaptionTrack[]): CaptionTrack {
  const englishTracks = tracks.filter(track => (track.language_code ?? '').startsWith('en'));
  const pool = englishTracks.length ? englishTracks : tracks;
  return pool.find(track => track.kind !== 'asr') ?? pool[0];
}

// A json3 caption track is `{ events: [{ segs: [{ utf8 }] }] }`; its strings are already
// decoded, avoiding the double-encoded-entity hack the old watch-page XML path needed.
interface Json3Captions {
  events?: Array<{ segs?: Array<{ utf8?: string }> }>;
}

// Scraping the watch-page HTML for "captionTracks" stopped working: YouTube serves a stripped
// page (consent wall / bot detection) to non-browser clients. youtubei.js talks to the same
// InnerTube API the official apps use; with the attested session above, the player response
// carries the caption track list. We fetch the chosen track's timedtext URL as json3 directly
// (the engagement-panel get_transcript endpoint youtubei.js drives still 400s). The WEB
// timedtext URL needs the poToken appended to be served, so we try that first and fall back
// to the bare URL, recording each attempt's outcome so failures stay diagnosable.
async function scrapeYouTube(url: string): Promise<string> {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (!match) throw new Error(`Could not extract YouTube video ID from: ${url}`);
  const videoId = match[1];

  const { youtube, poToken } = await getYoutubeSession();
  const info = await youtube.getInfo(videoId);

  const tracks = info.captions?.caption_tracks ?? [];
  if (!tracks.length) {
    throw new Error('No caption tracks found for this video. Auto-captions may be disabled.');
  }

  const baseUrl = pickCaptionTrack(tracks).base_url;
  const candidateUrls = [
    `${baseUrl}&fmt=json3&c=WEB&pot=${encodeURIComponent(poToken)}`,
    `${baseUrl}&fmt=json3`,
  ];

  const attempts: string[] = [];
  for (const transcriptUrl of candidateUrls) {
    const res = await fetch(transcriptUrl);
    const body = await res.text();
    if (res.ok && body.trim()) {
      const captions = JSON.parse(body) as Json3Captions;
      const text = (captions.events ?? [])
        .flatMap(event => event.segs ?? [])
        .map(seg => seg.utf8 ?? '')
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) return text.slice(0, MAX_CONTENT_CHARS);
      attempts.push(`pot=${transcriptUrl.includes('pot=')}: empty transcript`);
    } else {
      attempts.push(`pot=${transcriptUrl.includes('pot=')}: HTTP ${res.status}, ${body.length} bytes`);
    }
  }

  throw new Error(`Could not fetch transcript [${attempts.join('; ')}]. Auto-captions may be disabled.`);
}

async function scrapeGuide(guide: Guide): Promise<string> {
  const { guide_type, url } = guide;
  if (guide_type === 'web') return scrapeWeb(url);
  if (guide_type === 'simc') return scrapeSimC(url);
  if (guide_type === 'youtube') return scrapeYouTube(url);
  throw new Error(`Unknown guide_type: ${guide_type}`);
}

// ── Guide management ──────────────────────────────────────────────────────────

function nextId(guides: Guide[]): number {
  return guides.length === 0 ? 1 : Math.max(...guides.map(g => g.id || 0)) + 1;
}

async function scrapeGuideById(spec: string, guideId: number): Promise<void> {
  const guides = await loadGuides(spec);
  const idx = guides.findIndex(g => g.id === guideId);
  if (idx === -1) { console.log(`Guide #${guideId} not found`); return; }

  const guide = guides[idx];
  process.stdout.write(`  Scraping [${guide.guide_type}] ${guide.url.slice(0, 70)}...`);
  try {
    const content = await scrapeGuide(guide);
    guides[idx] = { ...guide, content, status: 'scraped' };
    await saveGuides(spec, guides);
    console.log(` OK (${content.length} chars)`);
  } catch (err) {
    guides[idx] = { ...guide, content: '', status: 'error' };
    await saveGuides(spec, guides);
    console.log(` ERROR: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ── Bulk refresh ──────────────────────────────────────────────────────────────

// Re-scrape every existing guide across all known specs. This is the default action
// (used by the hourly ingest workflow to keep guide content fresh). Reuses
// scrapeGuideById, which records per-guide errors as status 'error' rather than
// throwing, so one dead URL never fails the run.
async function refreshAllGuides(): Promise<void> {
  const specs = getKnownSpecs();
  for (const spec of specs) {
    const guides = await loadGuides(spec);
    if (!guides.length) continue;
    console.log(`\n-- Refreshing ${spec} (${guides.length} guides) --`);
    for (const guide of guides) await scrapeGuideById(spec, guide.id);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('warcraft-learner - Guide Scraper CLI');

  const cliSpec = opts.spec;
  const cliUrl = opts.url;
  const cliType = opts.type as 'web' | 'youtube' | 'simc';

  // ── Add mode: append and scrape a single new guide ──────────────────────────
  if (cliSpec && cliUrl) {
    const guides = await loadGuides(cliSpec);
    const newGuide: Guide = { id: nextId(guides), spec: cliSpec, url: cliUrl, guide_type: cliType, content: '', status: 'pending' };
    guides.push(newGuide);
    await saveGuides(cliSpec, guides);
    console.log(`Added guide #${newGuide.id} for ${cliSpec}. Scraping...`);
    await scrapeGuideById(cliSpec, newGuide.id);
    return;
  }

  // ── Default: re-scrape every existing guide ─────────────────────────────────
  await refreshAllGuides();
}

main().catch(err => {
  console.error('\nFatal error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
