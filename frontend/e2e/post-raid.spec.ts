import { expect, test, Page } from '@playwright/test';
import { shows, showsAbility } from './support';

// Every asserted number below is the value this pull actually renders. The report is a finished
// log, so the player's own figures are fixed; the ones that compare against the top-parse bench
// are re-pinned from a fresh render when the ingested dataset moves (see the warcraft-e2e skill).
const REPORT_URL = 'https://www.warcraftlogs.com/reports/YkVMTyfmFLtXZ1NQ?fight=last';
const PLAYER_NAME = 'Elsahr';
// Mirrors POST_RAID_KEY in core/services/selection-store.ts; the sticky name makes the one analysis target Elsahr instead of the roster's first player.
const STICKY_PLAYER_KEY = 'wl.sel.postRaid';

// The analysis spans the report fetch, playerDetails, and every card's WCL event queries.
const ANALYZE_TIMEOUT_MS = 120_000;
// The map's top-parse trails and the player's own trail load unawaited after the cards reveal.
const MAP_READY_TIMEOUT_MS = 60_000;
// Navigation and form entry that surround the long waits above.
const SLACK_MS = 30_000;

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
  // The label carries the derived kill/wipe result and the 454.4s pull rounded to 7:34.
  await expect(page.getByRole('combobox', { name: 'Fight' })).toContainText('Crown of the Cosmos - Kill - 7:34');
  const player = page.getByRole('combobox', { name: 'Player' });
  await expect(player).toContainText(PLAYER_NAME);
  // Spec is resolved from playerDetails, not from the class-only actor subType.
  await expect(player.getByAltText('Subtlety Rogue')).toBeVisible();
});

test('pull overview reports the DPS, the death, and the kill', async () => {
  const pullOverview = page.locator('wl-pull-overview');
  await shows(pullOverview, 'Pull 2 - kill.');
  await shows(pullOverview, 'Your DPS');
  // 29,487,085 damage done over the 454.4s pull: 64,892 DPS renders as 65K.
  await shows(pullOverview, '65K');
  await shows(pullOverview, '7:34');
  await shows(pullOverview, 'Death 1');
  // The killing blow, resolved from the report's ability names, and its unmitigated hit.
  await shows(pullOverview, 'Bursting Emptiness - 356K');
  await shows(pullOverview, '7:33');
  await shows(pullOverview, 'Boss defeated');
});

test('rotation flags the broken rule and the lost cooldown casts', async () => {
  const rotation = page.locator('wl-rotation');
  await shows(rotation, 'Rotation Rules');
  // 1 of Elsahr's 20 Secret Technique casts landed outside a Shadow Dance window.
  await shows(rotation, 'Secret Technique without Shadow Dance');
  await shows(rotation, '1 / 20');
  await shows(rotation, 'Offensive cooldowns vs top parses.');
  // Shadow Blades went out 4 times against the 5 the top parses fit into a pull this long.
  await shows(rotation, 'Shadow Blades');
  await shows(rotation, '4 / 5');
  // Vanish opened at 3:19, 166s past the top-parse average opener.
  await shows(rotation, '3:19');
  await shows(rotation, '+166s');
});

test('burst windows compare the player damage against the top-parse windows', async () => {
  const burstWindows = page.locator('wl-burst-windows');
  await shows(burstWindows, 'Damage in each burst window vs top parses.');
  // The card opens on the player's worst window - the 6:37 burst they nearly missed.
  await shows(burstWindows, 'window');
  await shows(burstWindows, '6:37 - 6:41');
  await shows(burstWindows, 'burst');
  await shows(burstWindows, '14K');
  await shows(burstWindows, '-99%');
  // Secret Technique carries that window for the top parses at 487K; Elsahr never cast it.
  await showsAbility(burstWindows, 'Secret Technique', '487K');
  await shows(burstWindows, 'missed');
  await shows(burstWindows, '0 / 1');
});

test('defensives flag the held cooldown and benchmark the damage taken', async () => {
  const defensives = page.locator('wl-defensive');
  await shows(defensives, 'Defensive cooldowns vs top parses.');
  // Feint sat 121s between casts, against a 32s top-parse average.
  await shows(defensives, 'Feint');
  await shows(defensives, '3:37');
  await shows(defensives, '121s');
  await shows(defensives, 'avg 32s');
  // Cloak of Shadows drew no finding, so it lands in the on-plan row.
  await shows(defensives, 'Cloak of Shadows');
  await shows(defensives, 'Damage taken in top-parse defensive windows vs top parses.');
  // Elsahr took 507K through the 0:58 window, 135% over the top-parse average.
  await shows(defensives, '0:58 - 1:04');
  await shows(defensives, '507K');
  await shows(defensives, '+135%');
});

test('gear compares the talents, trinkets, and enchants against the consensus', async () => {
  const gear = page.locator('wl-gear');
  await shows(gear, 'Gear vs top parses.');
  await shows(gear, 'Talents');
  // Elsahr's build is not the one 60% of the top parsers run.
  await shows(gear, 'Off-meta build');
  await shows(gear, '60% run the standard build');
  await shows(gear, 'Trinkets');
  // Both trinkets are read off Elsahr's own combatant info for this pull.
  await shows(gear, 'Light Company Guidon');
  await shows(gear, 'Gaze of the Alnseer');
  await shows(gear, 'Enchants');
  await shows(gear, 'All enchants');
});

test('the positioning map opens anchored on the death', async () => {
  test.setTimeout(MAP_READY_TIMEOUT_MS + SLACK_MS);
  const openMap = page.getByRole('button', { name: 'Open positioning map' }).first();
  await expect(openMap).toBeVisible({ timeout: MAP_READY_TIMEOUT_MS });
  await openMap.click();
  await shows(page, 'Positioning');
  await expect(page.locator('wl-map-canvas canvas')).toBeVisible();
  // The first map button belongs to the pull overview's death row, so the scrub window centres on 7:33.
  await shows(page, 'anchor 7:33');
  await shows(page, '● top parses');
  // The gold marker renders only once the player's own position trail has loaded.
  await expect(page.getByText('◆ you')).toBeVisible({ timeout: MAP_READY_TIMEOUT_MS });
  await page.getByRole('button', { name: 'Close map' }).click();
});
