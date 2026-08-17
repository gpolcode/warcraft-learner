import { codegen } from '@graphql-codegen/core';
import * as typescriptOperations from '@graphql-codegen/typescript-operations';
import { gqlPluckFromCodeString } from '@graphql-tools/graphql-tag-pluck';
import { buildSchema, lexicographicSortSchema, parse, printSchema } from 'graphql';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SDL = fileURLToPath(new URL('../schema/wcl.graphql', import.meta.url));
const DOCUMENTS = fileURLToPath(new URL('../src/app/core/services/wcl-queries.ts', import.meta.url));
const TARGET = fileURLToPath(new URL('../src/app/core/services/wcl-operations.generated.ts', import.meta.url));

const CONFIG = {
  skipTypename: true,
  enumsAsTypes: true,
  strictScalars: true,
  scalars: {
    // strictScalars fails on every schema scalar missing from this map, JSON included, and `never` makes selecting a still-shared JSON field a compile error at the read site.
    JSON: 'never',
    PlayerDetailsJson: '../models/wcl.models#PlayerDetailsBlob',
    TableJson: '../models/wcl.models#WclTableBlob',
    RankingsJson: '../models/wcl.models#WclRankingsBlob',
    EventDataJson: '../models/wcl.models#WclEventData',
  },
};

const plucked = await gqlPluckFromCodeString(DOCUMENTS, await readFile(DOCUMENTS, 'utf8'));

const output = await codegen({
  filename: TARGET,
  // Sorted, so a re-introspection that only reshuffles the SDL leaves this file byte-identical.
  schema: parse(printSchema(lexicographicSortSchema(buildSchema(await readFile(SDL, 'utf8'))))),
  documents: [{ location: DOCUMENTS, document: parse(plucked.map(source => source.body).join('\n')) }],
  config: CONFIG,
  // Adding the `typescript` plugin alongside re-declares every enum `typescript-operations` already emits.
  plugins: [{ 'typescript-operations': {} }],
  pluginMap: { 'typescript-operations': typescriptOperations },
});

await writeFile(TARGET, output);
console.log(`Wrote ${TARGET}`);
