---
name: verify
description: Drive the warcraft-learner app end to end in a headless environment - dev server plus Playwright over a pre-installed Chromium with the WCL endpoints mocked via route interception. Load before manually verifying a change against the running app (request patterns, live sync, UI flows).
---

# Verifying warcraft-learner end to end

## Launch

- `cd frontend && npm start` (in the background) serves http://localhost:4200; wait for `Local:` in the log. `ng serve` hot-rebuilds on source edits, so re-drives pick up changes without a restart.
- Drive with `playwright-core` (npm install it in a scratch dir) against the pre-installed browser: `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`.

## Mock WCL (no real network, no quota spend)

- `page.route('**/oauth/token', ...)` -> fulfill `{ access_token: 'tok', expires_in: 3600 }`.
- `page.route('**/api/v2/client', ...)` -> dispatch on the POST body's GraphQL query string and fulfill `{ data: ... }`. Distinguish queries by substring: `playerDetails`, `masterData` (full report), `fights(killType:All)` (fights-only probe), `characterRankings`, `table(`, `events(`, `gameData`. Check `playerDetails` before `masterData` and `masterData` before the fights probe - the probe match is a substring of the full report query.
- Fulfilled responses need CORS headers (`access-control-allow-origin: *`, allow `authorization, content-type`) and the OPTIONS preflight must be answered 204: HttpClient's JSON POST triggers a preflight.
- Log each request in the route handler (kind + timestamp) to assert request patterns, e.g. how many WCL calls one live-sync poll tick makes.

## Drive

- Report input: `getByLabel('Warcraft Logs Report URL or Code')`, fill a 16-character alphanumeric code, press Enter.
- Fight / player dropdowns: `getByRole('combobox', { name: 'Fight' })` (visible once a report loads).
- Live sync: `getByRole('switch', { name: 'Follow latest pull' })`. The poll interval is `POLL_INTERVAL_MS` (12s) and the first tick fires immediately on toggle-on. Mutate the mock's fight list mid-run to simulate a new pull appearing.
- Live status strip: `page.locator('wl-live-controls').innerText()`.

## Gotchas

- `frontend/public/data/specs/**` is absent without `npm run data:pull`, so the bench-driven cards render load errors / the bench-empty banner in a fresh clone. Expected in this harness, not a defect - the WCL request pattern and shell behavior are still fully observable.
- Headless Chromium has no screen capture, so the "Record game client" toggle cannot be exercised this way; only the live-sync half of the live slice is drivable headlessly.
