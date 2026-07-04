/**
 * warcraft-learner - shared CLI helper.
 *
 * The ingestion orchestrator uses `validateRulebook` to schema-check a spec's rulebook
 * before consuming it. ajv is the only dependency.
 */

import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

// ── Rulebook schema validation ─────────────────────────────────────────────────
//
// One shared validator for .claude/skills/warcraft-ingestion/rulebook.schema.json, used by
// the ingest orchestrator's pre-flight before consuming a rulebook. ajv draft-07; strict:false
// silences warnings about the draft-2019 $defs/examples annotation keywords, which ajv still
// resolves correctly.

const SCHEMA_PATH = path.resolve(
  fileURLToPath(import.meta.url),
  '..', '..', '..', '.claude', 'skills', 'warcraft-ingestion', 'rulebook.schema.json',
);

let _validator: ReturnType<Ajv['compile']> | null = null;

/** Read the raw rulebook schema text (used to compile the validator). */
async function readRulebookSchemaText(): Promise<string> {
  return fsp.readFile(SCHEMA_PATH, 'utf8');
}

/**
 * Validate a value against the rulebook schema. Returns an array of human-readable,
 * property-level error strings (empty array = valid). The compiled validator is
 * cached after first use.
 */
export async function validateRulebook(value: unknown): Promise<string[]> {
  if (!_validator) {
    const schema = JSON.parse(await readRulebookSchemaText()) as Record<string, unknown>;
    _validator = new Ajv({ allErrors: true, strict: false }).compile(schema);
  }
  if (_validator(value)) return [];
  return (_validator.errors ?? []).map(e => `${e.instancePath || '(root)'} ${e.message}`);
}
