// The one reader of the WCL client pair outside the browser: `frontend/.env` on a developer machine, the environment itself in CI.
import { existsSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url));
const CLIENTS_URL = 'https://www.warcraftlogs.com/api/clients/';

const MISSING_MESSAGE = [
  'No Warcraft Logs client credentials found.',
  `  1. Create a client at ${CLIENTS_URL} (any WCL account; no redirect URL needed).`,
  '  2. Put its id and secret in frontend/.env (copy frontend/.env.example), or export WCL_CLIENT_ID and WCL_CLIENT_SECRET.',
].join('\n');

function fromEnvironment() {
  const clientId = process.env.WCL_CLIENT_ID?.trim() ?? '';
  const clientSecret = process.env.WCL_CLIENT_SECRET?.trim() ?? '';
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

async function askForPair() {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  // Ctrl-D closes the input with the question still pending, which would otherwise end the process silently with exit code 0.
  const closed = new Promise(resolve => prompt.once('close', () => resolve(null)));
  const answers = async () => {
    const clientId = (await prompt.question('WCL_CLIENT_ID: ')).trim();
    const clientSecret = clientId ? (await prompt.question('WCL_CLIENT_SECRET: ')).trim() : '';
    return clientId && clientSecret ? { clientId, clientSecret } : null;
  };
  try {
    console.log(`${MISSING_MESSAGE}\nEnter the pair now to write frontend/.env, or press Enter to stop.`);
    return await Promise.race([answers(), closed]);
  } finally {
    prompt.close();
  }
}

/** The environment wins over `.env`, so a CI secret is never shadowed by a checked-out file; only a terminal with no `.env` is asked. */
export async function requireWclCredentials() {
  const envFileExists = existsSync(ENV_FILE);
  if (envFileExists) process.loadEnvFile(ENV_FILE);
  const known = fromEnvironment();
  if (known) return known;

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY) && !envFileExists;
  const entered = interactive ? await askForPair() : null;
  if (!entered) {
    console.error(MISSING_MESSAGE);
    process.exit(1);
  }
  writeFileSync(ENV_FILE, `WCL_CLIENT_ID=${entered.clientId}\nWCL_CLIENT_SECRET=${entered.clientSecret}\n`);
  // Child processes (ng, the ingest file server) inherit the environment, not the file read.
  process.env.WCL_CLIENT_ID = entered.clientId;
  process.env.WCL_CLIENT_SECRET = entered.clientSecret;
  console.log(`Wrote ${ENV_FILE}.`);
  return entered;
}
