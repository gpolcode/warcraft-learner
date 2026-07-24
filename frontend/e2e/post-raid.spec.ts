import { expect, test, Page } from '@playwright/test';

// A finished WCL report is immutable, so every stat derived from the player's own log is pinned exactly.
const REPORT_URL = 'https://www.warcraftlogs.com/reports/YkVMTyfmFLtXZ1NQ?fight=last';
const PLAYER_NAME = 'Elsahr';
// Mirrors POST_RAID_KEY in core/services/selection-store.ts; the sticky name makes the one analysis target Elsahr instead of the roster's first player.
const STICKY_PLAYER_KEY = 'wl.sel.postRaid';

// The auto-selected last boss pull of the report: fight 27, a kill at 454.4s.
const LAST_FIGHT_LABEL = 'Crown of the Cosmos - Kill - 7:34';
const PLAYER_SPEC_LABEL = 'Subtlety Rogue';
const PULL_DURATION = '7:34';
// 29,487,085 damage done over the 454.4s pull, through formatDamage: 64,892 DPS renders as 65K.
const PLAYER_DPS = '65K';

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
  await expect(page.getByRole('combobox', { name: 'Fight' })).toContainText(LAST_FIGHT_LABEL);
  const player = page.getByRole('combobox', { name: 'Player' });
  await expect(player).toContainText(PLAYER_NAME);
  await expect(player.getByAltText(PLAYER_SPEC_LABEL)).toBeVisible();
});

test('pull overview reports the DPS, duration, and outcome of the pull', async () => {
  const card = page.locator('wl-pull-overview');
  await expect(card.getByText('Your DPS')).toBeVisible();
  await expect(card.getByText(PLAYER_DPS, { exact: true }).first()).toBeVisible();
  await expect(card.getByText(PULL_DURATION).first()).toBeVisible();
  await expect(card.getByText('Boss defeated')).toBeVisible();
});

test('rotation benchmarks the offensive cooldowns against top parses', async () => {
  const card = page.locator('wl-rotation');
  await expect(card.getByText('Offensive cooldowns vs top parses.')).toBeVisible();
  await expect(card.locator('wl-game-icon').first()).toBeVisible();
});

test('burst windows compare the player damage against the top-parse windows', async () => {
  const card = page.locator('wl-burst-windows');
  await expect(card.getByText('Damage in each burst window vs top parses.')).toBeVisible();
  await expect(card.getByRole('option').first()).toBeVisible();
  await expect(card.getByText(WINDOW_RANGE).first()).toBeVisible();
  await expect(card.getByText('burst', { exact: true })).toBeVisible();
});

test('defensives benchmark the damage taken in top-parse defensive windows', async () => {
  const card = page.locator('wl-defensive');
  await expect(card.getByText('Damage taken in top-parse defensive windows vs top parses.')).toBeVisible();
  await expect(card.getByRole('option').first()).toBeVisible();
});

test('gear compares talents, trinkets, and enchants against the consensus', async () => {
  const card = page.locator('wl-gear');
  await expect(card.getByText('Gear vs top parses.')).toBeVisible();
  await expect(card.getByText('Talents')).toBeVisible();
  await expect(card.getByText('Trinkets')).toBeVisible();
  await expect(card.getByText('Enchants')).toBeVisible();
});

test('the positioning map opens with the fight canvas', async () => {
  test.setTimeout(MAP_READY_TIMEOUT_MS + SLACK_MS);
  const openMap = page.getByRole('button', { name: 'Open positioning map' }).first();
  await expect(openMap).toBeVisible({ timeout: MAP_READY_TIMEOUT_MS });
  await openMap.click();
  await expect(page.getByText('Positioning')).toBeVisible();
  await expect(page.locator('wl-map-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Close map' }).click();
});
