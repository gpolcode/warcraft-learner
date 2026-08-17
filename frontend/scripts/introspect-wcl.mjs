// Refreshes the committed WCL SDL (schema/wcl.graphql) so codegen and CI never need WCL credentials.

import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { writeFile, readFile } from 'node:fs/promises';

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
  JSON.stringify({ query: getIntrospectionQuery({ descriptions: true }) }));
if (errors) throw new Error(`introspection failed: ${JSON.stringify(errors)}`);

await writeFile(SDL_TARGET, `${printSchema(buildClientSchema(data))}\n`);
console.log(`Wrote ${SDL_TARGET.pathname}`);
