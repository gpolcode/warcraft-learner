/**
 * One-off migration for the rotation/defensive bench seconds -> milliseconds field
 * rename (see MS_SECONDS_AUDIT.md and the ingest-version bump in
 * src/app/ingest/ingest-version.ts). Ingestion itself always recomputes benches from
 * scratch from WCL, so it would already produce the new ms shape on its own - this
 * script exists purely so the NEXT scheduled ingest run does not have to re-fetch and
 * re-derive every already-ingested encounter (spending WCL budget) just to relabel
 * numbers that are already correct. It:
 *
 *   1. Rewrites each `rotation/{enc}.json` and `defensive/{enc}.json` payload's
 *      seconds-suffixed fields to their millisecond equivalents (rename + x1000).
 *   2. Re-stamps every slice file for that encounter (burst/rotation/defensive/gear/
 *      positions/northern-sky, whichever exist) with a fresh `source_signature` +
 *      `ingest_version`, computed the same way the ingest orchestrator's cheap
 *      pre-check does (INGEST_VERSION + current top-parse rankings), so the next
 *      scheduled run's skip check (which reads only the burst file's signature) sees
 *      a match and skips re-ingesting an encounter this script already brought current.
 *
 * This is NOT run automatically by ingestion or CI. Run it by hand, once, after
 * `npm run data:pull`, then push the result to the gh-pages `data/specs/` tree the
 * same way `ingest-parses.yml` does (or let the next scheduled run pick up whatever
 * this script did not finish - a stale/mismatched signature just costs that one
 * encounter a normal re-ingest, never incorrect data).
 *
 * Usage: node scripts/migrate-ms-fields.mjs [--dry-run] [--data-dir <path>]
 *   --dry-run   Report what would change without writing anything or calling WCL.
 *   --data-dir  Defaults to public/data/specs (the npm run data:pull destination).
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_SRC = path.resolve(SCRIPT_DIR, '../src');
const DEFAULT_DATA_DIR = path.resolve(SCRIPT_DIR, '../public/data/specs');

const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token';
const WCL_API_URL = 'https://www.warcraftlogs.com/api/v2/client';

// Matches ingest-orchestrator.service.ts: the skip check's pre-fetch pool depth and
// the final signed sample size.
const SIGNATURE_POOL_COUNT = 20;
const TOP_N = 10;

const SLICES_TO_RESTAMP = ['burst', 'rotation', 'defensive', 'gear', 'northern-sky'];

// The rule kinds whose benched `threshold.value`/`.band` is a time magnitude
// (milliseconds after this migration) rather than a count/fraction/percent - see
// rotation-rules.ts's RULE_KINDS table.
const TIME_BASED_RULE_KINDS = new Set([
  'cast_without_prior', 'hold_cooldown_for_anchor', 'opening_sequence', 'aura_clipped',
]);

function parseArgs(argv) {
  const args = { dryRun: false, dataDir: DEFAULT_DATA_DIR };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--data-dir') args.dataDir = path.resolve(argv[++i]);
  }
  return args;
}

/** Reads a single `export const NAME = <value>;` out of a TS source file without importing it. */
function readTsConst(filePath, name, { asNumber = false } = {}) {
  const source = fs.readFileSync(filePath, 'utf8');
  const pattern = asNumber
    ? new RegExp(`${name}\\s*=\\s*(\\d+)`)
    : new RegExp(`${name}\\s*=\\s*'([^']*)'`);
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not find ${name} in ${filePath}`);
  return asNumber ? Number(match[1]) : match[1];
}

const NEW_INGEST_VERSION = readTsConst(
  path.join(REPO_SRC, 'app/ingest/ingest-version.ts'), 'INGEST_VERSION', { asNumber: true },
);
const WCL_CLIENT_ID = readTsConst(path.join(REPO_SRC, 'environments/wcl-public-client.ts'), 'WCL_PUBLIC_CLIENT_ID');
const WCL_CLIENT_SECRET = readTsConst(path.join(REPO_SRC, 'environments/wcl-public-client.ts'), 'WCL_PUBLIC_CLIENT_SECRET');

// --- WCL client (rankings-only; the same cheap read the orchestrator's skip check uses) ---

let cachedToken = null;

async function getWclToken() {
  if (cachedToken) return cachedToken;
  const form = ['grant_type=client_credentials', `client_id=${encodeURIComponent(WCL_CLIENT_ID)}`, `client_secret=${encodeURIComponent(WCL_CLIENT_SECRET)}`].join('&');
  const response = await fetch(TOKEN_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form,
  });
  if (!response.ok) throw new Error(`WCL token request failed (${response.status})`);
  const data = await response.json();
  if (!data.access_token) throw new Error('WCL token response carried no access_token');
  cachedToken = data.access_token;
  return cachedToken;
}

const RANKINGS_Q = `
query($encounterID:Int!,$className:String!,$specName:String!){
  worldData{encounter(id:$encounterID){
    characterRankings(className:$className,specName:$specName,metric:dps)
  }}
}`;

async function queryWcl(gqlString, variables) {
  const token = await getWclToken();
  const response = await fetch(WCL_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: gqlString, variables }),
  });
  const body = await response.json();
  if (body.errors?.length) throw new Error(body.errors[0]?.message || 'WCL GraphQL error');
  if (!response.ok || body.data === undefined) throw new Error(`WCL API error (${response.status})`);
  return body.data;
}

// Mirrors shared/analysis/wcl-projections.ts.
const ANONYMIZED_NAME = /^Character \d+-\d+$/;

function unwrapRankings(blob) {
  if (!blob) return [];
  const parsed = typeof blob === 'string' ? JSON.parse(blob) : blob;
  return parsed?.rankings ?? [];
}

function toParseRankings(raw, count) {
  return raw
    .filter(ranking => ranking.report?.code && !ANONYMIZED_NAME.test(ranking.name ?? ''))
    .slice(0, count)
    .map(ranking => ({ report_code: ranking.report?.code ?? '', fight_id: ranking.report?.fightID ?? 0 }));
}

async function fetchRankingPool(className, specName, encounterId) {
  const data = await queryWcl(RANKINGS_Q, { encounterID: encounterId, className, specName });
  const raw = unwrapRankings(data?.worldData?.encounter?.characterRankings ?? null);
  return toParseRankings(raw, SIGNATURE_POOL_COUNT);
}

// --- Signature (mirrors src/app/ingest/signature.ts) ---

function rankingFingerprint(rankings) {
  return rankings.map(r => `${r.report_code}:${r.fight_id}`).sort().join('|');
}

function encounterSignature(version, rankings) {
  return crypto.createHash('sha256').update(`${version}\n${rankingFingerprint(rankings)}`, 'utf8').digest('hex').slice(0, 16);
}

/** Mirrors encounterSkipKey: excludes already-known-inaccessible rows, then takes the top N. */
function encounterSkipKey(poolRows, inaccessible, version, topN) {
  const usedRows = poolRows.filter(row => !inaccessible.has(`${row.report_code}:${row.fight_id}`)).slice(0, topN);
  return encounterSignature(version, usedRows);
}

// --- Field migration ---

function migrateHoldTargets(holdTargets) {
  if (!holdTargets) return holdTargets;
  const migrated = {};
  for (const [idx, target] of Object.entries(holdTargets)) {
    migrated[idx] = {
      target_ms: Math.round(target.target_s * 1000),
      stddev_ms: Math.round(target.stddev_s * 1000),
      delay_ms: Math.round(target.delay_s * 1000),
      delay_stddev_ms: Math.round(target.delay_stddev_s * 1000),
      band_ms: Math.round(target.band_s * 1000),
      effective_cd_ms: Math.round(target.effective_cd_s * 1000),
      count: target.count,
      total_samples: target.total_samples,
    };
  }
  return migrated;
}

function scaleOrNull(value) {
  return value == null ? null : Math.round(value * 1000);
}

/** True when a bench entry still carries the old seconds field (idempotency guard). */
function isOldShapeBenchmark(benchmark) {
  return Object.prototype.hasOwnProperty.call(benchmark, 'avg_first_cast_s');
}

function migratePerCdBenchmark(benchmark) {
  if (!isOldShapeBenchmark(benchmark)) return benchmark;
  const { avg_first_cast_s, stddev_first_cast_s, avg_gap_s, stddev_gap_s, avg_bl_offset_s, stddev_bl_offset_s, hold_targets, ...rest } = benchmark;
  return {
    ...rest,
    avg_first_cast_ms: Math.round(avg_first_cast_s * 1000),
    stddev_first_cast_ms: Math.round(stddev_first_cast_s * 1000),
    avg_gap_ms: scaleOrNull(avg_gap_s),
    stddev_gap_ms: scaleOrNull(stddev_gap_s),
    avg_bl_offset_ms: scaleOrNull(avg_bl_offset_s),
    stddev_bl_offset_ms: scaleOrNull(stddev_bl_offset_s),
    hold_targets: migrateHoldTargets(hold_targets),
  };
}

function migratePerDefensiveBenchmark(benchmark) {
  if (!isOldShapeBenchmark(benchmark)) return benchmark;
  const { avg_first_cast_s, stddev_first_cast_s, avg_gap_s, stddev_gap_s, hold_targets, ...rest } = benchmark;
  return {
    ...rest,
    avg_first_cast_ms: Math.round(avg_first_cast_s * 1000),
    stddev_first_cast_ms: Math.round(stddev_first_cast_s * 1000),
    avg_gap_ms: scaleOrNull(avg_gap_s),
    stddev_gap_ms: scaleOrNull(stddev_gap_s),
    hold_targets: migrateHoldTargets(hold_targets),
  };
}

function migrateBenchedRules(rules) {
  if (!rules) return rules;
  return rules.map(entry => {
    if (!entry.threshold || !TIME_BASED_RULE_KINDS.has(entry.rule?.condition?.kind)) return entry;
    return { ...entry, threshold: { value: entry.threshold.value * 1000, band: entry.threshold.band * 1000 } };
  });
}

function migrateRotationBench(bench) {
  if (!Object.prototype.hasOwnProperty.call(bench, 'avg_duration_s')) return { bench, changed: false };
  const { avg_duration_s, per_cd_benchmarks, rules, ...rest } = bench;
  const migrated = {
    ...rest,
    avg_duration_ms: Math.round(avg_duration_s * 1000),
    per_cd_benchmarks: Object.fromEntries(
      Object.entries(per_cd_benchmarks ?? {}).map(([name, b]) => [name, migratePerCdBenchmark(b)]),
    ),
    rules: migrateBenchedRules(rules),
  };
  return { bench: migrated, changed: true };
}

function migrateDefensiveBench(bench) {
  const entries = Object.entries(bench.per_defensive_benchmarks ?? {});
  if (!entries.some(([, b]) => isOldShapeBenchmark(b))) return { bench, changed: false };
  return {
    bench: {
      ...bench,
      per_defensive_benchmarks: Object.fromEntries(entries.map(([name, b]) => [name, migratePerDefensiveBenchmark(b)])),
    },
    changed: true,
  };
}

// --- File-tree walk ---

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data) + '\n');
}

function listEncounterIds(specDir, slice) {
  const dir = path.join(specDir, slice);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .map(name => parseInt(name, 10))
    .filter(id => Number.isFinite(id));
}

async function migrateEncounter(specDir, spec, specMeta, encounterId, { dryRun }) {
  const rotationPath = path.join(specDir, 'rotation', `${encounterId}.json`);
  const defensivePath = path.join(specDir, 'defensive', `${encounterId}.json`);
  const rotation = readJson(rotationPath);
  const defensive = readJson(defensivePath);

  let fieldsChanged = false;
  let migratedRotation = rotation;
  let migratedDefensive = defensive;
  if (rotation) {
    const result = migrateRotationBench(rotation);
    migratedRotation = result.bench;
    fieldsChanged ||= result.changed;
  }
  if (defensive) {
    const result = migrateDefensiveBench(defensive);
    migratedDefensive = result.bench;
    fieldsChanged ||= result.changed;
  }

  const burstPath = path.join(specDir, 'burst', `${encounterId}.json`);
  const burst = readJson(burstPath);
  const alreadyCurrent = burst?.ingest_version >= NEW_INGEST_VERSION;

  if (!fieldsChanged && alreadyCurrent) return 'skipped (already current)';

  let signature = null;
  if (burst && specMeta) {
    try {
      const inaccessible = new Set(burst.inaccessible_parses ?? []);
      const poolRows = await fetchRankingPool(specMeta.className, specMeta.specName, encounterId);
      if (poolRows.length) signature = encounterSkipKey(poolRows, inaccessible, String(NEW_INGEST_VERSION), TOP_N);
    } catch (err) {
      console.warn(`  [${spec}/${encounterId}] ranking fetch failed, leaving signature unstamped: ${err.message}`);
    }
  }

  if (dryRun) {
    return `would migrate (fields changed: ${fieldsChanged}, signature: ${signature ?? 'unresolved'})`;
  }

  if (migratedRotation) writeJson(rotationPath, restamp(migratedRotation, signature));
  if (migratedDefensive) writeJson(defensivePath, restamp(migratedDefensive, signature));
  if (signature) {
    for (const slice of SLICES_TO_RESTAMP) {
      if (slice === 'rotation' || slice === 'defensive') continue; // already written above
      const slicePath = path.join(specDir, slice, `${encounterId}.json`);
      const data = readJson(slicePath);
      if (data) writeJson(slicePath, restamp(data, signature));
    }
    const positionsPath = path.join(specDir, 'positions', `${encounterId}.json`);
    const positions = readJson(positionsPath);
    if (positions) writeJson(positionsPath, restamp(positions, signature));
  }
  return `migrated (fields changed: ${fieldsChanged}, signature: ${signature ?? 'left unstamped - next run will re-ingest'})`;
}

function restamp(data, signature) {
  const stamped = { ...data, ingest_version: NEW_INGEST_VERSION };
  if (signature) stamped.source_signature = signature;
  else delete stamped.source_signature; // unresolved signature must not falsely claim currency
  return stamped;
}

async function main() {
  const { dryRun, dataDir } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir} (run "npm run data:pull" first)`);
    process.exit(1);
  }
  console.log(`Migrating ms fields under ${dataDir} (target ingest_version ${NEW_INGEST_VERSION})${dryRun ? ' [dry run]' : ''}`);

  const specMetaList = readJson(path.join(dataDir, 'spec-meta.json')) ?? [];
  const specMetaBySpec = new Map(specMetaList.map(meta => [meta.spec, meta]));

  const specs = fs.readdirSync(dataDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  let migratedCount = 0, skippedCount = 0, unresolvedCount = 0;
  for (const spec of specs) {
    const specDir = path.join(dataDir, spec);
    const specMeta = specMetaBySpec.get(spec);
    if (!specMeta) console.warn(`[${spec}] no spec-meta.json entry - signatures cannot be resolved for this spec`);

    const encounterIds = [...new Set([
      ...listEncounterIds(specDir, 'rotation'), ...listEncounterIds(specDir, 'defensive'), ...listEncounterIds(specDir, 'burst'),
    ])].sort((a, b) => a - b);

    for (const encounterId of encounterIds) {
      const result = await migrateEncounter(specDir, spec, specMeta, encounterId, { dryRun });
      console.log(`[${spec}/${encounterId}] ${result}`);
      if (result.startsWith('skipped')) skippedCount++;
      else migratedCount++;
      if (result.includes('unresolved') || result.includes('unstamped')) unresolvedCount++;
    }
  }

  console.log(`\nDone. ${migratedCount} encounter(s) migrated, ${skippedCount} already current, ${unresolvedCount} left with an unresolved signature (will re-ingest normally on the next scheduled run).`);
}

main().catch(err => {
  console.error('Fatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
