/**
 * One-shot backfill for the vertical-slice rollout: generate every per-use-case
 * tailored slice file (burst / rotation / defensive / gear) for each already-ingested
 * encounter bench. Pure reshape - reads the committed bench + rulebook, writes the
 * slice files. No WCL access (icon/name baking is empty, matching syncEncounterFile).
 *
 * Going forward `syncEncounterFile` writes these on each ingest, so this only needs
 * to run once over pre-existing data:
 *   tsx --tsconfig tsconfig.scripts.json scripts/migrate-slices.ts
 */
import fs from 'fs';
import path from 'path';
import { readJson, writeJson } from './lib.ts';
import { DATA_DIR, loadRulebook } from './ingest/storage.ts';
import { buildBurstSlice } from './ingest/analysis/burst-slice.ts';
import { buildRotationSlice } from './ingest/analysis/rotation-slice.ts';
import { buildDefensiveSlice } from './ingest/analysis/defensive-slice.ts';
import { buildGearSlice } from './ingest/analysis/gear-slice.ts';
import type { EncounterBench } from './ingest/models/bench.models.ts';

async function main(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('No data dir; nothing to migrate.');
    return;
  }

  let written = 0;
  for (const spec of fs.readdirSync(DATA_DIR).sort()) {
    const encDir = path.join(DATA_DIR, spec, 'encounters');
    if (!fs.existsSync(encDir)) continue;

    const rulebook = await loadRulebook(spec);
    const cooldowns = rulebook?.major_cooldowns ?? [];
    const defensives = rulebook?.defensives ?? [];
    const rules = rulebook?.rules ?? [];

    for (const file of fs.readdirSync(encDir).sort()) {
      if (!file.endsWith('.json')) continue;
      const bench = await readJson<EncounterBench>(path.join(encDir, file));
      if (!bench) continue;
      await writeJson(path.join(DATA_DIR, spec, 'burst', file), buildBurstSlice(bench, cooldowns, defensives));
      await writeJson(path.join(DATA_DIR, spec, 'rotation', file), buildRotationSlice(bench, cooldowns, rules, defensives, {}));
      await writeJson(path.join(DATA_DIR, spec, 'defensive', file), buildDefensiveSlice(bench, defensives, []));
      await writeJson(path.join(DATA_DIR, spec, 'gear', file), buildGearSlice(bench));
      written += 1;
    }
  }

  console.log(`Slice file sets written: ${written}`);
}

void main();
