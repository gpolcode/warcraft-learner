// Skipping this rewrite leaves typescript-operations' Exact wrapper as the one `unknown` in the generated WCL types.

import { readFile, writeFile } from 'node:fs/promises';

const UNKNOWN_CONSTRAINT = 'type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };';
const OBJECT_CONSTRAINT = 'type Exact<T extends object> = { [K in keyof T]: T[K] };';

const target = process.argv[2];
if (!target) throw new Error('Usage: node scripts/retype-exact-constraint.mjs <generated-file>');

const content = await readFile(target, 'utf8');
if (content.includes(UNKNOWN_CONSTRAINT)) {
  await writeFile(target, content.replace(UNKNOWN_CONSTRAINT, OBJECT_CONSTRAINT));
} else if (!content.includes(OBJECT_CONSTRAINT)) {
  throw new Error(`${target} carries no Exact declaration this hook recognizes; check the typescript-operations version.`);
}
