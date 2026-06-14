#!/usr/bin/env node
/**
 * warcraft-learner - Standalone Guide Scraper CLI
 *
 * Manages guides for specs: add URLs, scrape content, view, delete.
 * Writes directly to data/specs/{spec}/guides.json
 *
 * Usage:
 *   npm run scrape
 *
 * Supported guide types:
 *   web      - HTML page scraped with fetch + text extraction
 *   youtube  - YouTube transcript via timedtext API
 *   simc     - Raw text file (GitHub raw URLs auto-converted)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(FRONTEND_ROOT, 'public', 'data', 'specs');

const MAX_CONTENT_CHARS = 60_000;

// ── File I/O ──────────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function guidesPath(spec) {
  return path.join(DATA_DIR, spec, 'guides.json');
}

function loadGuides(spec) {
  return readJson(guidesPath(spec)) || [];
}

function saveGuides(spec, guides) {
  writeJson(guidesPath(spec), guides);
}

function getKnownSpecs() {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs.readdirSync(DATA_DIR).filter(d => {
    try { return fs.statSync(path.join(DATA_DIR, d)).isDirectory(); } catch { return false; }
  }).sort();
}

// ── Scraping ──────────────────────────────────────────────────────────────────

function htmlToText(html) {
  // Remove scripts, styles, nav, footer
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ');

  // Turn block elements into newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/?(p|div|h[1-6]|li|tr|section|article)[^>]*>/gi, '\n');

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/g, ' ');

  // Collapse whitespace
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

async function scrapeWeb(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; warcraft-learner/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const html = await res.text();
  return htmlToText(html).slice(0, MAX_CONTENT_CHARS);
}

async function scrapeSimC(url) {
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

async function scrapeYouTube(url) {
  // Extract video ID from URL
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (!match) throw new Error(`Could not extract YouTube video ID from: ${url}`);
  const videoId = match[1];

  // Fetch timedtext (auto-generated captions)
  const captionsUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(captionsUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; warcraft-learner/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching YouTube page`);
  const html = await res.text();

  // Extract timedtext URL from page
  const ttMatch = html.match(/"captionTracks":\s*\[.*?"baseUrl":"(https:\/\/www\.youtube\.com\/api\/timedtext[^"]+)"/);
  if (!ttMatch) {
    throw new Error('No caption tracks found for this video. Auto-captions may be disabled.');
  }
  const ttUrl = ttMatch[1].replace(/\\u0026/g, '&');

  const ttRes = await fetch(ttUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; warcraft-learner/1.0)' },
  });
  if (!ttRes.ok) throw new Error(`HTTP ${ttRes.status} fetching timedtext`);
  const xml = await ttRes.text();

  // Parse <text> elements from XML
  const segments = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m =>
    m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#\d+;/g, '')
      .trim()
  );

  return segments.join(' ').slice(0, MAX_CONTENT_CHARS);
}

async function scrapeGuide(guide) {
  const { guide_type, url } = guide;
  if (guide_type === 'web') return scrapeWeb(url);
  if (guide_type === 'simc') return scrapeSimC(url);
  if (guide_type === 'youtube') return scrapeYouTube(url);
  throw new Error(`Unknown guide_type: ${guide_type}`);
}

// ── Guide management ──────────────────────────────────────────────────────────

async function scrapeGuideById(spec, guideId) {
  const guides = loadGuides(spec);
  const idx = guides.findIndex(g => g.id === guideId);
  if (idx === -1) { console.log(`Guide #${guideId} not found`); return; }

  const guide = guides[idx];
  process.stdout.write(`  Scraping [${guide.guide_type}] ${guide.url.slice(0, 70)}...`);
  try {
    const content = await scrapeGuide(guide);
    guides[idx] = { ...guide, content, status: 'scraped' };
    saveGuides(spec, guides);
    console.log(` OK (${content.length} chars)`);
  } catch (err) {
    guides[idx] = { ...guide, content: '', status: 'error' };
    saveGuides(spec, guides);
    console.log(` ERROR: ${err.message}`);
  }
}

async function scrapeAllGuides(wclSpecs) {
  console.log(`\nScraping all guides for ${wclSpecs.length} specs...`);
  for (const spec of wclSpecs) {
    const guides = loadGuides(spec);
    if (guides.length > 0) {
      console.log(`\n[${spec}] Scraping ${guides.length} guides...`);
      for (const g of guides) {
        await scrapeGuideById(spec, g.id);
      }
    }
  }
  console.log('\nBulk scraping complete.');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('warcraft-learner - Guide Scraper CLI');

  const specs = getKnownSpecs();
  if (!specs.length) {
    console.error('No specs found in data directory.');
    process.exit(1);
  }
  await scrapeAllGuides(specs);
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
