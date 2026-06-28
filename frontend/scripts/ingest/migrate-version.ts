#!/usr/bin/env node
/**
 * One-time migration: backfill `ingest_version` onto every tailored file under
 * `data/specs/**`.
 *
 * The skip signature switched from an auto source-file code-hash to the manual
 * `INGEST_VERSION` (see ingest-version.ts), and the work-ordering now reads a bare
 * `ingest_version` integer off each file. Pre-existing files have neither, so this script
 * stamps one: an encounter is v1 when its gear file already carries `source_id` (the
 * source_id change is baked in), else v0. The same version is written to all of that
 * encounter's slice files (burst / rotation / defensive / gear / positions) so the field is
 * present everywhere and ordering never sees an absent value.
 *
 * Idempotent: re-running re-derives the same version and rewrites the same value. Run via
 *   tsx --tsconfig tsconfig.scripts.json scripts/ingest/migrate-version.ts
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname_ = path.dirname(fileURLToPath(import.meta.url));
/** frontend/public/data/specs - two levels above scripts/ingest. */
const SPECS_ROOT = path.resolve(__dirname_, '..', '..', 'public', 'data', 'specs');

const SLICES = ['burst', 'rotation', 'defensive', 'gear', 'positions'] as const;

/**
 * The version a migrated encounter gets, derived from its gear file: v1 once the gear
 * output carries `source_id` (the source_id change is incorporated), else v0. Pure so the
 * decision is unit-testable; `gear` is the parsed gear JSON (or null when there is none).
 */
export function versionFromGear(gear: unknown): number {
  return gear != null && JSON.stringify(gear).includes('"source_id"') ? 1 : 0;
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Write JSON in the same shape FsDataFileTransport uses (2-space indent + trailing newline). */
function writeJson(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function listJsonIds(dir: string): number[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => parseInt(file, 10))
    .filter(id => Number.isFinite(id));
}

function migrate(): void {
  if (!fs.existsSync(SPECS_ROOT)) {
    console.error(`No data dir at ${SPECS_ROOT}`);
    process.exit(1);
  }
  const specs = fs.readdirSync(SPECS_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  let stamped = 0;
  const tally: Record<number, number> = { 0: 0, 1: 0 };
  for (const spec of specs) {
    const specDir = path.join(SPECS_ROOT, spec);
    // Encounter ids = the union across every slice dir (some have positions but no gear, etc).
    const ids = new Set<number>();
    for (const slice of SLICES) listJsonIds(path.join(specDir, slice)).forEach(id => ids.add(id));

    for (const id of ids) {
      const gearFile = path.join(specDir, 'gear', `${id}.json`);
      const gear = fs.existsSync(gearFile) ? readJson(gearFile) : null;
      const version = versionFromGear(gear);
      tally[version]++;

      for (const slice of SLICES) {
        const file = path.join(specDir, slice, `${id}.json`);
        if (!fs.existsSync(file)) continue;
        const data = readJson(file) as Record<string, unknown>;
        data['ingest_version'] = version;
        writeJson(file, data);
        stamped++;
      }
    }
  }
  console.log(`Migrated ${stamped} files across ${specs.length} specs (v1 encounters: ${tally[1]}, v0: ${tally[0]}).`);
}

// Run only when invoked directly (tsx scripts/ingest/migrate-version.ts), not when the spec
// imports `versionFromGear` - importing must have no filesystem side effect.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) migrate();
