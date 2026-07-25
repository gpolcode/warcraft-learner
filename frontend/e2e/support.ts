import { expect, Locator, Page } from '@playwright/test';

/**
 * Asserts the scope displays the text: whole-element match for strings (Playwright
 * normalizes the element's whitespace first), raw-text match for patterns, first hit when
 * a value repeats across rows.
 */
export async function shows(scope: Page | Locator, text: string | RegExp): Promise<void> {
  const match = typeof text === 'string' ? scope.getByText(text, { exact: true }) : scope.getByText(text);
  await expect(match.first()).toBeVisible();
}

/**
 * Asserts the window's ability breakdown lists `ability` carrying `topAverage`. Scoped to the
 * row because its top-average cell also holds a mobile-only label, so the figure is never an
 * element's whole text.
 */
export async function showsAbility(scope: Locator, ability: string, topAverage: string): Promise<void> {
  const row = scope.locator('wl-compact-ability-row').filter({ hasText: ability }).first();
  await expect(row).toContainText(topAverage);
}
