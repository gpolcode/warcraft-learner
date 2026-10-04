// Runs before npm ci, so it may import only modules that import nothing.
import { appendFile } from 'node:fs/promises';
import { baseEnvironment } from '../src/environments/base-environment.ts';
import { WCL_CLIENT_ID, WCL_CLIENT_SECRET } from '../src/environments/wcl-client.ts';
import { INGEST_POINTS_MARGIN } from '../src/app/domains/raid-analysis/data/ingest/ingest-points-margin.ts';
import { E2E_POINTS_NEEDED } from '../e2e/wcl-points-needed.ts';

const REQUEST_TIMEOUT_MS = 15_000;
const RATE_LIMIT_QUERY = 'query RateLimit { rateLimitData { limitPerHour pointsSpentThisHour pointsResetIn } }';

const CALLERS = {
  // An ingest run below its margin benches nothing yet still republishes gh-pages, so it is skipped.
  ingest: { needed: INGEST_POINTS_MARGIN, failWhenLow: false },
  // A skipped check would let a PR merge untested, so a low budget fails it before the setup is paid for.
  e2e: { needed: E2E_POINTS_NEEDED, failWhenLow: true },
};

async function post(url, headers, body) {
  const response = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
}

async function readBudget() {
  const { wclTokenUrl, wclApiUrl } = baseEnvironment;
  const { access_token } = await post(wclTokenUrl, {},
    new URLSearchParams({ grant_type: 'client_credentials', client_id: WCL_CLIENT_ID, client_secret: WCL_CLIENT_SECRET }));
  const { data } = await post(wclApiUrl, { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
    JSON.stringify({ query: RATE_LIMIT_QUERY }));
  return data?.rateLimitData ?? null;
}

const callerName = process.argv[2];
const caller = CALLERS[callerName];
if (!caller) {
  console.error(`Usage: node scripts/wcl-budget.mjs <${Object.keys(CALLERS).join('|')}>`);
  process.exit(2);
}

// The check only ever stops a run early; when it cannot read the budget, the run goes ahead as if it had never asked.
let proceed = true;
try {
  const budget = await readBudget();
  if (budget) {
    const remaining = Math.floor(budget.limitPerHour - budget.pointsSpentThisHour);
    proceed = remaining >= caller.needed;
    const resetMin = Math.ceil(budget.pointsResetIn / 60);
    const status = `WCL budget: ${remaining} of ${budget.limitPerHour} points left, ${callerName} needs ${caller.needed}, resets in ${resetMin} min`;
    if (proceed) console.log(status);
    else if (caller.failWhenLow) console.log(`::error::${status}. Re-run this job after the reset.`);
    else console.log(`::notice::${status}. Skipping this run.`);
  } else {
    console.log('::warning::WCL returned no rate limit data; going ahead.');
  }
} catch (err) {
  console.log(`::warning::Could not read the WCL budget (${err instanceof Error ? err.message : String(err)}); going ahead.`);
}

if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `proceed=${proceed}\n`);
if (!proceed && caller.failWhenLow) process.exit(1);
