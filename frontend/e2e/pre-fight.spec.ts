import { expect, test, Page } from '@playwright/test';
import { opensThePositioningMap, shows, showsAnAbility, showsAWindowChip } from './support';

// formatDuration output: "0:12", "7:34".
const CLOCK_VALUE = /^\d+:\d{2}$/;
// formatDamage output at bench-window scale, so the suffix is mandatory: "875K", "2.4M".
const DAMAGE_VALUE = /^\d+(\.\d+)?[KM]$/;
// Bench consensus share: "57%".
const CONSENSUS_PCT = /^\d+%$/;

// The pre-fight page is bench-only, so this spec file spends zero WCL budget.
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
  await pick('Class', 'Rogue');
  await pick('Spec', 'Subtlety');
  await pick('Encounter', 'Crown of the Cosmos');
});

test.afterAll(async () => {
  await page?.close();
});

test('selecting class, spec, and encounter reveals the plan cards', async () => {
  await expect(page.getByRole('combobox', { name: 'Encounter' })).toContainText('Crown of the Cosmos');
  await expect(page.locator('wl-gear')).toBeVisible();
  await expect(page.locator('wl-burst-windows')).toBeVisible();
});

test('gear shows the top-parse talent, trinket, and enchant consensus', async () => {
  const gear = page.locator('wl-gear');
  await shows(gear, 'Top-parse gear consensus.');
  await shows(gear, 'Talents');
  await shows(gear, 'Trinkets');
  await shows(gear, 'Enchants');
  await shows(gear, CONSENSUS_PCT);
  await shows(gear, 'of top parsers');
});

test('the cooldown plan lists first use and average uses per cooldown', async () => {
  const cooldownPlan = page.locator('wl-rotation-cd-plan');
  await shows(cooldownPlan, 'Cooldown plan');
  await showsAnAbility(cooldownPlan);
  await shows(cooldownPlan, 'First use');
  await shows(cooldownPlan, CLOCK_VALUE);
  await shows(cooldownPlan, 'Avg uses');
});

test('the defensive plan lists the consensus defensives', async () => {
  const defensivePlan = page.locator('wl-defensive-plan');
  await shows(defensivePlan, 'Defensive plan');
  await showsAnAbility(defensivePlan);
  await shows(defensivePlan, 'First use');
  await shows(defensivePlan, CLOCK_VALUE);
});

test('burst windows show the top-parse windows with their bench damage', async () => {
  const burstWindows = page.locator('wl-burst-windows');
  await shows(burstWindows, 'Damage in each burst window vs top parses.');
  await showsAWindowChip(burstWindows);
  await shows(burstWindows, 'burst');
  await shows(burstWindows, DAMAGE_VALUE);
});

test('the positioning map opens with the encounter canvas', async () => {
  await opensThePositioningMap(page);
});
