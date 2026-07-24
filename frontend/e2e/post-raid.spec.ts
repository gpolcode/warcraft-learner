import { expect, test, Page } from '@playwright/test';
import { opensThePositioningMap, shows, showsAnAbility, showsAWindowChip } from './support';

// A finished WCL report is immutable, so every stat derived from the player's own log is pinned exactly.
const REPORT_URL = 'https://www.warcraftlogs.com/reports/YkVMTyfmFLtXZ1NQ?fight=last';
const PLAYER_NAME = 'Elsahr';
// Mirrors POST_RAID_KEY in core/services/selection-store.ts; the sticky name makes the one analysis target Elsahr instead of the roster's first player.
const STICKY_PLAYER_KEY = 'wl.sel.postRaid';

// The analysis spans the report fetch, playerDetails, and every card's WCL event queries.
const ANALYZE_TIMEOUT_MS = 120_000;
// The map's top-parse trails and player positions load unawaited after the cards reveal.
const MAP_READY_TIMEOUT_MS = 60_000;
// Navigation and form entry that surround the long waits above.
const SLACK_MS = 30_000;

// formatDuration range in the window detail header ("0:05 - 0:21"); unanchored because the span's raw text keeps template newlines.
const WINDOW_RANGE = /\d+:\d{2} - \d+:\d{2}/;

// Serial on one shared page: the report is analyzed exactly once and every use case asserts against that single load, so a run costs one WCL analysis.
test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  test.setTimeout(ANALYZE_TIMEOUT_MS + SLACK_MS);
  page = await browser.newPage();
  await page.addInitScript(
    ([key, name]) => localStorage.setItem(key, JSON.stringify({ playerName: name })),
    [STICKY_PLAYER_KEY, PLAYER_NAME],
  );
  await page.goto('/');
  await page.getByLabel('Warcraft Logs Report URL or Code').fill(REPORT_URL);
  await page.keyboard.press('Enter');
  // The cards stay hidden until every feature settles, so this one wait covers the whole analysis.
  await expect(page.getByText('Pull overview')).toBeVisible({ timeout: ANALYZE_TIMEOUT_MS });
});

test.afterAll(async () => {
  await page?.close();
});

test('analyzing the report selects the last pull and the sticky player', async () => {
  await expect(page.getByRole('combobox', { name: 'Fight' })).toContainText('Crown of the Cosmos - Kill - 7:34');
  const player = page.getByRole('combobox', { name: 'Player' });
  await expect(player).toContainText(PLAYER_NAME);
  await expect(player.getByAltText('Subtlety Rogue')).toBeVisible();
});

test('pull overview reports the DPS, duration, and outcome of the pull', async () => {
  const pullOverview = page.locator('wl-pull-overview');
  await shows(pullOverview, 'Your DPS');
  // 29,487,085 damage done over the 454.4s pull: 64,892 DPS renders as 65K.
  await shows(pullOverview, '65K');
  await shows(pullOverview, '7:34');
  await shows(pullOverview, 'Boss defeated');
});

test('rotation benchmarks the offensive cooldowns against top parses', async () => {
  const rotation = page.locator('wl-rotation');
  await shows(rotation, 'Offensive cooldowns vs top parses.');
  await showsAnAbility(rotation);
});

test('burst windows compare the player damage against the top-parse windows', async () => {
  const burstWindows = page.locator('wl-burst-windows');
  await shows(burstWindows, 'Damage in each burst window vs top parses.');
  await showsAWindowChip(burstWindows);
  await shows(burstWindows, WINDOW_RANGE);
  await shows(burstWindows, 'burst');
});

test('defensives benchmark the damage taken in top-parse defensive windows', async () => {
  const defensives = page.locator('wl-defensive');
  await shows(defensives, 'Damage taken in top-parse defensive windows vs top parses.');
  await showsAWindowChip(defensives);
});

test('gear compares talents, trinkets, and enchants against the consensus', async () => {
  const gear = page.locator('wl-gear');
  await shows(gear, 'Gear vs top parses.');
  await shows(gear, 'Talents');
  await shows(gear, 'Trinkets');
  await shows(gear, 'Enchants');
});

test('the positioning map opens with the fight canvas', async () => {
  test.setTimeout(MAP_READY_TIMEOUT_MS + SLACK_MS);
  await opensThePositioningMap(page, MAP_READY_TIMEOUT_MS);
});
