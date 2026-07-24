import { expect, test, Page } from '@playwright/test';

// The pre-fight page is bench-only, so this spec file spends zero WCL budget.
const CLASS_LABEL = 'Rogue';
const SPEC_LABEL = 'Subtlety';
const ENCOUNTER_NAME = 'Crown of the Cosmos';

// formatDuration output: "0:12", "7:34".
const CLOCK_VALUE = /^\d+:\d{2}$/;
// formatDamage output at bench-window scale, so the suffix is mandatory: "875K", "2.4M".
const DAMAGE_VALUE = /^\d+(\.\d+)?[KM]$/;
// Bench consensus share: "57%".
const CONSENSUS_PCT = /^\d+%$/;

// Serial on one shared page: the spec and encounter are selected once and every card asserts against that single selection.
test.describe.configure({ mode: 'serial' });

let page: Page;

async function pick(label: string, option: string): Promise<void> {
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: option }).click();
}

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('/pre');
  await pick('Class', CLASS_LABEL);
  await pick('Spec', SPEC_LABEL);
  await pick('Encounter', ENCOUNTER_NAME);
});

test.afterAll(async () => {
  await page?.close();
});

test('selecting class, spec, and encounter reveals the plan cards', async () => {
  await expect(page.getByRole('combobox', { name: 'Encounter' })).toContainText(ENCOUNTER_NAME);
  await expect(page.locator('wl-gear')).toBeVisible();
  await expect(page.locator('wl-burst-windows')).toBeVisible();
});

test('gear shows the top-parse talent, trinket, and enchant consensus', async () => {
  const card = page.locator('wl-gear');
  await expect(card.getByText('Top-parse gear consensus.')).toBeVisible();
  await expect(card.getByText('Talents')).toBeVisible();
  await expect(card.getByText('Trinkets')).toBeVisible();
  await expect(card.getByText('Enchants')).toBeVisible();
  await expect(card.getByText(CONSENSUS_PCT).first()).toBeVisible();
  await expect(card.getByText('of top parsers').first()).toBeVisible();
});

test('the cooldown plan lists first use and average uses per cooldown', async () => {
  const card = page.locator('wl-rotation-cd-plan');
  await expect(card.getByText('Cooldown plan')).toBeVisible();
  await expect(card.locator('wl-game-icon').first()).toBeVisible();
  await expect(card.getByText('First use').first()).toBeVisible();
  await expect(card.getByText(CLOCK_VALUE).first()).toBeVisible();
  await expect(card.getByText('Avg uses').first()).toBeVisible();
});

test('the defensive plan lists the consensus defensives', async () => {
  const card = page.locator('wl-defensive-plan');
  await expect(card.getByText('Defensive plan')).toBeVisible();
  await expect(card.locator('wl-game-icon').first()).toBeVisible();
  await expect(card.getByText('First use').first()).toBeVisible();
  await expect(card.getByText(CLOCK_VALUE).first()).toBeVisible();
});

test('burst windows show the top-parse windows with their bench damage', async () => {
  const card = page.locator('wl-burst-windows');
  await expect(card.getByText('Damage in each burst window vs top parses.')).toBeVisible();
  await expect(card.getByRole('option').first()).toBeVisible();
  await expect(card.getByText('burst', { exact: true })).toBeVisible();
  await expect(card.getByText(DAMAGE_VALUE).first()).toBeVisible();
});

test('the positioning map opens with the encounter canvas', async () => {
  const openMap = page.getByRole('button', { name: 'Open positioning map' }).first();
  await expect(openMap).toBeVisible();
  await openMap.click();
  await expect(page.getByText('Positioning')).toBeVisible();
  await expect(page.locator('wl-map-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Close map' }).click();
});
