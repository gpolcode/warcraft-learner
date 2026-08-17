import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { writeFile, readFile } from 'node:fs/promises';
import { nameJsonFieldScalars } from './wcl-json-scalars.mjs';

const SDL_HEADER = `# Introspected from the WCL v2 API by npm run schema:pull, then post-processed by scripts/wcl-json-scalars.mjs:
# the JSON fields the app selects each carry their own scalar here so scripts/codegen.mjs can type them as app models.
`;

const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token';
const API_URL = 'https://www.warcraftlogs.com/api/v2/client';
const CLIENT_SOURCE = new URL('../src/environments/wcl-public-client.ts', import.meta.url);
const SDL_TARGET = new URL('../schema/wcl.graphql', import.meta.url);

function readCredential(source, name) {
  const match = new RegExp(`${name} = '([^']+)'`).exec(source);
  if (!match) throw new Error(`${name} not found in wcl-public-client.ts`);
  return match[1];
}

async function post(url, headers, body) {
  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
}

const clientSource = await readFile(CLIENT_SOURCE, 'utf8');
const { access_token: token } = await post(TOKEN_URL, { 'Content-Type': 'application/x-www-form-urlencoded' }, new URLSearchParams({
  grant_type: 'client_credentials',
  client_id: readCredential(clientSource, 'WCL_PUBLIC_CLIENT_ID'),
  client_secret: readCredential(clientSource, 'WCL_PUBLIC_CLIENT_SECRET'),
}).toString());

const { data, errors } = await post(API_URL, { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  JSON.stringify({ query: getIntrospectionQuery({ descriptions: false }) }));
if (errors) throw new Error(`introspection failed: ${JSON.stringify(errors)}`);

await writeFile(SDL_TARGET, `${SDL_HEADER}${printSchema(buildClientSchema(nameJsonFieldScalars(data)))}\n`);
console.log(`Wrote ${SDL_TARGET.pathname}`);
