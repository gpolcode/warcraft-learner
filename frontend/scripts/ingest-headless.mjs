/**
 * Headless ingest harness (npm run ingest): the unattended CI/local entry for the
 * browser ingestion. Zero ingestion logic - it only wires processes together:
 *
 *   1. starts the ingest file server (scripts/ingest-server.js),
 *   2. starts `ng serve --configuration ingest`,
 *   3. opens the app in headless Chromium (Playwright), piping its console to stdout,
 *   4. waits for the orchestrator's completion flag (`globalThis.__INGEST_DONE__`),
 *   5. exits 0 on a completed run, 1 on a fatal one.
 *
 * `WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` in the process environment are injected into the
 * page as a process-env global before the app loads, so CI ingests on its dedicated WCL
 * client's budget without that secret ever entering the bundle (see wcl-auth.ts).
 *
 * Browser resolution: `INGEST_CHROMIUM_PATH` (an explicit executable) when set, else a
 * Playwright-managed Chromium when one is installed, else the system Chrome channel
 * (preinstalled on GitHub Actions ubuntu runners). If none is available, run
 * `npx playwright install chromium` once.
 */
import { spawn } from 'child_process';
import { chromium } from 'playwright';

const APP_URL = 'http://localhost:4200';
const SERVER_PROBE_URL = 'http://localhost:3000/api/list?dir=specs';
const READY_TIMEOUT_MS = 5 * 60_000;
const READY_POLL_MS = 500;
const DONE_POLL_MS = 1_000;

const children = [];

function startChild(name, command, args) {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const forward = chunk => {
    for (const line of chunk.toString().split('\n')) {
      if (line.trim()) console.log(`[${name}] ${line}`);
    }
  };
  child.stdout.on('data', forward);
  child.stderr.on('data', forward);
  child.on('exit', code => {
    // A child dying before the run completes is fatal: without the file server or the
    // dev server the ingestion cannot finish, so fail loudly instead of hanging.
    if (!shuttingDown) {
      console.error(`[harness] ${name} exited early (code ${code})`);
      shutdown(1);
    }
  });
  children.push(child);
  return child;
}

let shuttingDown = false;
let browser = null;

async function shutdown(exitCode) {
  shuttingDown = true;
  if (browser) await browser.close().catch(() => undefined);
  for (const child of children) child.kill('SIGTERM');
  // Give the children a moment to die before the process exit reaps them hard.
  await new Promise(resolve => setTimeout(resolve, 500));
  process.exit(exitCode);
}

async function waitForHttp(url, name) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  for (;;) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not up yet - keep polling until the deadline.
    }
    if (Date.now() > deadline) throw new Error(`${name} did not become ready at ${url}`);
    await new Promise(resolve => setTimeout(resolve, READY_POLL_MS));
  }
}

async function launchBrowser() {
  const executablePath = process.env.INGEST_CHROMIUM_PATH;
  if (executablePath) return await chromium.launch({ executablePath });
  try {
    return await chromium.launch();
  } catch {
    console.log('[harness] no Playwright-managed Chromium; falling back to the system Chrome channel');
    return await chromium.launch({ channel: 'chrome' });
  }
}

async function main() {
  startChild('server', 'node', ['scripts/ingest-server.js']);
  startChild('serve', 'npx', ['ng', 'serve', '--configuration', 'ingest']);
  await waitForHttp(SERVER_PROBE_URL, 'ingest file server');
  await waitForHttp(APP_URL, 'ng serve');

  browser = await launchBrowser();
  const context = await browser.newContext();

  const { WCL_CLIENT_ID, WCL_CLIENT_SECRET } = process.env;
  if (WCL_CLIENT_ID && WCL_CLIENT_SECRET) {
    await context.addInitScript(([id, secret]) => {
      globalThis.process = { env: { WCL_CLIENT_ID: id, WCL_CLIENT_SECRET: secret } };
    }, [WCL_CLIENT_ID, WCL_CLIENT_SECRET]);
    console.log('[harness] injected WCL credentials from the environment');
  }

  const page = await context.newPage();
  page.on('console', message => console.log(`[app] ${message.text()}`));
  page.on('pageerror', err => console.error(`[app] pageerror: ${err.message}`));
  await page.goto(APP_URL);

  // The orchestrator publishes its summary when the run ends; ingestion is bounded by
  // the WCL point budget, so no harness-side timeout is needed.
  await page.waitForFunction(() => globalThis.__INGEST_DONE__, undefined, { timeout: 0, polling: DONE_POLL_MS });
  const summary = await page.evaluate(() => globalThis.__INGEST_DONE__);

  if (summary.fatal) {
    console.error(`[harness] ingestion failed: ${summary.fatal}`);
    await shutdown(1);
  }
  console.log(`[harness] ingestion complete: ${summary.succeeded.length} spec(s) processed, ${summary.failed.length} failed${summary.budgetStopped ? ', stopped on WCL budget' : ''}`);
  await shutdown(0);
}

main().catch(async err => {
  console.error('[harness] fatal:', err instanceof Error ? err.message : String(err));
  await shutdown(1);
});
