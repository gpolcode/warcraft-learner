import { expect, Locator, Page } from '@playwright/test';

/** Asserts the scope displays the text: whole-element match for strings, raw-text match for patterns, first hit when repeated. */
export async function shows(scope: Page | Locator, text: string | RegExp): Promise<void> {
  const match = typeof text === 'string' ? scope.getByText(text, { exact: true }) : scope.getByText(text);
  await expect(match.first()).toBeVisible();
}

/** Asserts at least one ability or item row (wl-game-icon) rendered inside the scope. */
export async function showsAnAbility(scope: Locator): Promise<void> {
  await expect(scope.locator('wl-game-icon').first()).toBeVisible();
}

/** Asserts the window timeline rendered at least one selectable window chip. */
export async function showsAWindowChip(scope: Locator): Promise<void> {
  await expect(scope.getByRole('option').first()).toBeVisible();
}

/** Opens the positioning flyover from the first map button, asserts the canvas renders, and closes it again. */
export async function opensThePositioningMap(page: Page, buttonTimeoutMs?: number): Promise<void> {
  const openMap = page.getByRole('button', { name: 'Open positioning map' }).first();
  await expect(openMap).toBeVisible({ timeout: buttonTimeoutMs });
  await openMap.click();
  await shows(page, 'Positioning');
  await expect(page.locator('wl-map-canvas canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Close map' }).click();
}
