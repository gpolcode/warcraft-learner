import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';
import { writeFile } from 'node:fs/promises';
import { WCL_PUBLIC_CLIENT_ID, WCL_PUBLIC_CLIENT_SECRET } from '../src/environments/wcl-public-client.ts';
import { nameJsonFieldScalars } from './wcl-json-scalars.mjs';

async function post(url, headers, body) {
  const response = await fetch(url, { method: 'POST', headers, body });
  if (!response.ok) throw new Error(`${url} responded ${response.status}: ${await response.text()}`);
  return response.json();
}

const { access_token } = await post('https://www.warcraftlogs.com/oauth/token', {},
  new URLSearchParams({ grant_type: 'client_credentials', client_id: WCL_PUBLIC_CLIENT_ID, client_secret: WCL_PUBLIC_CLIENT_SECRET }));
const { data, errors } = await post('https://www.warcraftlogs.com/api/v2/client', { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
  JSON.stringify({ query: getIntrospectionQuery({ descriptions: false }) }));
if (errors) throw new Error(`introspection responded 200 with errors: ${JSON.stringify(errors)}`);

await writeFile(new URL('../schema/wcl.graphql', import.meta.url), `${printSchema(buildClientSchema(nameJsonFieldScalars(data)))}\n`);
