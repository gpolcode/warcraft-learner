import { expect, test, Page } from '@playwright/test';
import { shows, showsFirstOption, showsFirstPlanRow, showsFirstWindow, showsGearConsensus, picksFirst, gearSection, CLOCK } from './support';

// Bench-only page (no WCL budget spent): one shared page, the first class, spec and encounter picked once, every card asserts against them.
test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await page.goto('/pre');
  await picksFirst(page, 'Class');
  await picksFirst(page, 'Spec');
  await picksFirst(page, 'Encounter');
});

test.afterAll(async () => {
  await page.close();
});

test('picking the first class, spec and encounter loads that spec\'s plan', async () => {
  await shows(page, 'Pick a spec and a boss to see the plan top raiders run there.');
  for (const label of ['Class', 'Spec', 'Encounter']) await showsFirstOption(page, label);
  const cooldownPlan = page.locator('wl-rotation-cd-plan');
  await expect(cooldownPlan.locator('wl-game-icon').first()).toHaveText(/\S/);
  await shows(cooldownPlan, CLOCK);
});

test('the northern sky export offers the top log\'s cooldown timings as a note', async () => {
  const card = page.locator('wl-northern-sky-export');
  await shows(card, 'Northern Sky export');
  await shows(card, 'Cooldown timings from the top Mythic logs for your spec, as a note for the Northern Sky raid addon.');

  await card.getByRole('button', { name: 'Export note' }).click();
  // The panel opens in Taiga's portal layer, outside the card, so it is found by its dialog role.
  const panel = page.getByRole('dialog', { name: 'Northern Sky export' });
  await shows(panel, 'Pick the abilities you want timings for, copy the note, and paste it into your Northern Sky addon.');
  await expect(panel.getByRole('button', { name: 'Deselect all' })).toBeVisible();
  await expect(panel.getByText('Cooldowns', { exact: true }).or(panel.getByText('Defensives', { exact: true })).first()).toBeVisible();
  const abilities = panel.locator('label', { has: page.getByRole('checkbox') });
  expect(await abilities.count()).toBeGreaterThan(0);
  const ability = abilities.first();
  await expect(ability.getByRole('checkbox')).toBeChecked();
  await expect(ability.locator('wl-game-icon')).toHaveText(/\S/);
  await expect(ability.getByText(/×\d+/)).toBeVisible();

  await panel.getByRole('button', { name: 'Copy note' }).click();
  await expect(panel.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();

  await panel.getByRole('button', { name: 'Close export' }).click();
  await expect(panel).toHaveCount(0);
});

test('gear shows the top-parse talent, trinket, and enchant consensus', async () => {
  const gear = page.locator('wl-gear');
  await shows(gear, 'Gear');
  await shows(gear, 'Gear consensus across top logs.');
  await shows(gearSection(gear, 'Talents'), 'The builds top raiders use, most common first.');
  await shows(gearSection(gear, 'Trinkets'), 'The pairs top raiders use, most common first.');
  await showsGearConsensus(gear);

  const enchants = gearSection(gear, 'Enchants');
  const slots = enchants.locator('div.border-t').filter({ has: page.locator('wl-game-icon') });
  // A slot lists an enchant only once most top logs agree on one.
  if (await slots.count()) {
    await shows(enchants, 'What most top raiders use. Copy a name to find it in the auction house.');
    const slot = slots.first();
    await expect(slot.locator('span.text-label')).toHaveText(/\S/);
    await expect(slot.locator('wl-game-icon')).toHaveText(/\S/);
    await expect(slot.getByRole('button', { name: 'Copy name' })).toBeVisible();
  } else {
    await shows(enchants, 'No enchant data.');
  }
});

test('the cooldown plan lists the first cooldown\'s first use, typical uses, and holds', async () => {
  const cooldownPlan = page.locator('wl-rotation-cd-plan');
  await shows(cooldownPlan, 'Cooldown plan');
  await shows(cooldownPlan, 'Offensive cooldown usage across top logs.');
  await showsFirstPlanRow(cooldownPlan);
});

test('the defensive plan lists the first defensive\'s first use, typical uses, and holds', async () => {
  const defensivePlan = page.locator('wl-defensive-plan');
  await shows(defensivePlan, 'Defensive plan');
  await shows(defensivePlan, 'Defensive usage across top logs.');
  await showsFirstPlanRow(defensivePlan);
});

test('burst windows show the first top-parse window with its bench damage and abilities', async () => {
  const burstWindows = page.locator('wl-burst-windows');
  await shows(burstWindows, 'Burst windows');
  await shows(burstWindows, 'The short stretches where top logs deal their biggest damage, compared with your log.');
  await showsFirstWindow(burstWindows, { metric: 'Damage', chips: 'Cooldowns top raiders use here' });
});

test('the positioning map opens anchored on the selected burst window', async () => {
  const openMap = page.getByRole('button', { name: 'Show map', exact: true }).first();
  await expect(openMap).toBeVisible();
  await openMap.click();
  const panel = page.getByRole('dialog', { name: 'Positioning' });
  await expect(panel.locator('wl-map-canvas canvas')).toBeVisible();
  await shows(panel, /Opened at -?\d+:\d{2}/);
  await shows(panel, '● Top logs');
  await panel.getByRole('button', { name: 'Close map' }).click();
  await expect(panel).toHaveCount(0);
});
