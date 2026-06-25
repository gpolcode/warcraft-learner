/**
 * warcraft-learner - Load layer (filesystem storage)
 *
 * All reads from and writes to data/specs/** live here: parse samples, position
 * timelines, the aggregated encounter bench files, the per-spec encounter index,
 * and the top-level spec index. Rulebook reads (which drive analysis) also live
 * here. The Transform layer (analyzer.ts) is invoked from syncEncounterFile to
 * compute the bench payload; this layer only persists the result.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJson, writeJson, getKnownSpecs as listSpecs } from './lib.ts';
import { buildEncounterBench, POSITIONS_INTERVAL_S } from './analyzer.ts';
import { batchResolveEnchants, type WCLClient, type IngestEncounter } from './wcl-client.ts';
import type { Rulebook, RulebookCooldown, RulebookDefensive } from '../src/app/core/models/rulebook.models.ts';
import type { ParsePositions, EncounterPositions } from '../src/app/core/models/positioning.models.ts';
import type { ParseCooldownData, ParseSample } from './parse-sample.models.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_ROOT = path.resolve(__dirname, '..');
// WL_DATA_DIR lets a test/dry run write elsewhere instead of the committed data dir.
export const DATA_DIR = process.env['WL_DATA_DIR'] ?? path.join(FRONTEND_ROOT, 'public', 'data', 'specs');
// Ingest only manages specs that already have a rulebook to drive analysis.
export const getKnownSpecs = (): string[] => listSpecs(DATA_DIR, { requireRulebook: true });

// Hash of the ingestion source - used as a cache key so any change to the ETL
// logic automatically invalidates existing parse samples and forces re-analysis.
// Covers every module that affects sample output (not just ingest.ts), so editing
// the analyzer or client still busts the cache.
const ETL_FILES = ['ingest.ts', 'wcl-client.ts', 'analyzer.ts', 'storage.ts', 'parse-sample.models.ts'];
export const INGEST_HASH = crypto.createHash('sha256')
  .update(ETL_FILES.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n'))
  .digest('hex')
  .slice(0, 12);

// ── Path helpers ────────────────────────────────────────────────────────────

function nowUtc(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function getSamplesPath(spec: string, encounterId: number): string {
  return path.join(DATA_DIR, spec, 'parse_samples', `${encounterId}.json`);
}

export function parseKey(reportCode: string, fightId: number, hash = INGEST_HASH): string {
  return `${reportCode}:${fightId}:${hash}`;
}

function getEncounterPath(spec: string, encounterId: number): string {
  return path.join(DATA_DIR, spec, 'encounters', `${encounterId}.json`);
}

function getPositionsPath(spec: string, encounterId: number): string {
  return path.join(DATA_DIR, spec, 'positions', `${encounterId}.json`);
}

// ── Rulebook reads ────────────────────────────────────────────────────────────

export async function loadRulebook(spec: string): Promise<Rulebook | null> {
  const rbPath = path.join(DATA_DIR, spec, 'rulebook.json');
  return readJson<Rulebook>(rbPath);
}

export async function getSpecCooldowns(spec: string): Promise<RulebookCooldown[] | null> {
  const rb = await loadRulebook(spec);
  if (rb?.major_cooldowns?.length) return rb.major_cooldowns;
  return null;
}

export async function getSpecDefensives(spec: string): Promise<RulebookDefensive[]> {
  const rb = await loadRulebook(spec);
  if (rb?.defensives?.length) return rb.defensives;
  return [];
}

// ── Sample / position reads + writes ─────────────────────────────────────────

/** Read the raw parse samples for an encounter (empty array when none exist). */
export async function readSamples(spec: string, encounterId: number): Promise<ParseSample[]> {
  return await readJson<ParseSample[]>(getSamplesPath(spec, encounterId)) ?? [];
}

/** Append a parse's position timelines (deduped by report+fight) to the positions file. */
export async function savePositions(spec: string, encounterId: number, encounterName: string, positions: ParsePositions | null): Promise<void> {
  if (!positions) return;
  const file = getPositionsPath(spec, encounterId);
  const existing = await readJson<EncounterPositions>(file) ?? {};
  let parses = Array.isArray((existing as EncounterPositions).parses) ? (existing as EncounterPositions).parses : [];
  parses = parses.filter(p => !(p.report_code === positions.report_code && p.fight_id === positions.fight_id));
  parses.push(positions);
  await writeJson(file, {
    spec, encounter_id: encounterId, encounter_name: encounterName,
    interval_s: POSITIONS_INTERVAL_S, sample_count: parses.length, parses,
  }, true);
}

export async function saveParseSample(spec: string, encounterId: number, encounterName: string, reportCode: string, fightId: number, playerName: string, cooldownData: ParseCooldownData): Promise<void> {
  const samplesPath = getSamplesPath(spec, encounterId);
  let samples = await readJson<ParseSample[]>(samplesPath) ?? [];
  // Remove duplicate
  samples = samples.filter(s => !(s.report_code === reportCode && s.fight_id === fightId));
  samples.push({
    spec, encounter_id: encounterId, encounter_name: encounterName,
    report_code: reportCode, fight_id: fightId, player_name: playerName,
    sampled_at: nowUtc(), ingest_hash: INGEST_HASH, cooldown_data: cooldownData,
  });
  await writeJson(samplesPath, samples);
}

// ── Encounter bench / index aggregation ──────────────────────────────────────

// Read samples -> compute bench (pure, in analyzer) -> write the encounter file
// and refresh the per-spec encounter index.
export async function syncEncounterFile(spec: string, encounterId: number): Promise<void> {
  const samples = await readSamples(spec, encounterId);
  if (!samples.length) return;

  const specDefensives = await getSpecDefensives(spec);
  const out = buildEncounterBench(samples, specDefensives, spec, encounterId);

  await writeJson(getEncounterPath(spec, encounterId), out);
  await syncEncountersIndex(spec);
}

async function syncEncountersIndex(spec: string): Promise<void> {
  const encDir = path.join(DATA_DIR, spec, 'encounters');
  if (!fs.existsSync(encDir)) return;
  const entries: Array<{ id: number; name: string; sample_count: number }> = [];
  for (const f of fs.readdirSync(encDir).sort()) {
    if (!f.endsWith('.json')) continue;
    try {
      const d = await readJson<{ encounter_id?: number; encounter_name?: string; sample_count?: number }>(path.join(encDir, f)) ?? {};
      entries.push({
        id: d.encounter_id ?? parseInt(f),
        name: d.encounter_name ?? f,
        sample_count: d.sample_count ?? 0,
      });
    } catch {}
  }
  await writeJson(path.join(DATA_DIR, spec, 'encounters.json'), entries);
}

/** Rebuild data/specs/index.json by scanning all spec folders on disk. */
export async function writeSpecIndex(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) return;
  const entries: Array<{ spec: string; encounter_count: number }> = [];
  for (const spec of fs.readdirSync(DATA_DIR).sort()) {
    const encFile = path.join(DATA_DIR, spec, 'encounters.json');
    if (!fs.existsSync(encFile)) continue;
    try {
      const enc = await readJson<Array<{ sample_count?: number }>>(encFile) ?? [];
      const count = enc.filter(e => e.sample_count && e.sample_count > 0).length;
      if (count > 0) entries.push({ spec, encounter_count: count });
    } catch {}
  }
  await writeJson(path.join(DATA_DIR, 'index.json'), entries);
}

// ── Enchant name resolution ───────────────────────────────────────────────────

// Patches missing enchant names in an already-written encounter bench file by
// batch-querying WCL for each unique ID whose name is empty. The network lookup
// lives in wcl-client (batchResolveEnchants); this only reads/patches/writes the
// file. Silently no-ops if nothing resolved.
export async function resolveEnchantNames(wcl: WCLClient, spec: string, encounterId: number): Promise<void> {
  const encPath = getEncounterPath(spec, encounterId);
  type EncFile = { gear: { enchants: Record<string, Array<{ id: number | string; name: string }>> } };
  const data = await readJson<EncFile>(encPath);
  if (!data?.gear?.enchants) return;

  const enchantsMap = data.gear.enchants;
  const toResolve = new Map<number | string, Array<{ slot: string; idx: number }>>();
  for (const [slot, items] of Object.entries(enchantsMap)) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id && !item.name) {
        if (!toResolve.has(item.id)) toResolve.set(item.id, []);
        toResolve.get(item.id)!.push({ slot, idx: i });
      }
    }
  }
  if (!toResolve.size) return;

  const names = await batchResolveEnchants(wcl, [...toResolve.keys()]);
  let patched = false;
  for (const [id, locations] of toResolve.entries()) {
    const name = names.get(id);
    if (!name) continue;
    for (const { slot, idx } of locations) {
      enchantsMap[slot][idx].name = name;
      patched = true;
    }
  }
  if (patched) await writeJson(encPath, data);
}

// ── Spec selection ────────────────────────────────────────────────────────────

// Returns known specs (those with a rulebook.json) sorted most-stale-first.
export async function specsByStaleness(encounters: IngestEncounter[]): Promise<string[]> {
  const now = Date.now();
  const known = getKnownSpecs();
  // Precompute staleness per spec (async I/O) before the synchronous sort.
  const scores = new Map<string, number>(
    await Promise.all(known.map(async spec => [spec, await staleness(spec, encounters, now)] as const)),
  );
  return known.slice().sort((a, b) => (scores.get(a) ?? 0) - (scores.get(b) ?? 0));
}

async function staleness(spec: string, encounters: IngestEncounter[], now: number): Promise<number> {
  let worst = 0;
  for (const enc of encounters) {
    const samples = await readSamples(spec, enc.id);
    if (!samples.length) return Infinity; // never ingested
    const newestMs = Math.max(...samples.map(s => new Date(s.sampled_at ?? 0).getTime()));
    const ageMs = now - newestMs;
    if (ageMs > worst) worst = ageMs;
  }
  return worst;
}
