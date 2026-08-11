import { expect, Locator, Page } from '@playwright/test';

/** Asserts the scope shows the text: whole-element match for a string, raw-text for a pattern, first hit when it repeats. */
export async function shows(scope: Page | Locator, text: string | RegExp): Promise<void> {
  const match = typeof text === 'string' ? scope.getByText(text, { exact: true }) : scope.getByText(text);
  await expect(match.first()).toBeVisible();
}

// Figure shapes, not values: both the player's log and the bench move with the data, never the format.
export const DAMAGE = /\d+(\.\d+)?[KM]/;
export const CLOCK = /-?\d+:\d{2}/;
export const PERCENT = /[+-]?\d+(\.\d+)?%/;
export const RATIO = /\d+ \/ \d+/;
export const DECIMAL = /\d+\.\d+/;
export const SECONDS = /[+-]?\d+(\.\d+)?s/;

/** Whatever a finding row's Measured cell carries: a count of instances, a share, a clock time, or a delay. */
export const MEASURE = new RegExp([RATIO, PERCENT, CLOCK, SECONDS].map(r => r.source).join('|'));

/** The chip a cooldown finding row carries - mirrors CAT_LABEL in shared/components/finding-table/finding-table.utils.ts. */
export const CD_CHIP = /\b(lost cast|held|BL miss|downtime|hold)\b/;

/** Asserts at least one named ability/gear row renders with a real icon + name, regardless of which one the bench ranks first. */
export async function showsEntity(scope: Locator): Promise<void> {
  await expect(scope.locator('wl-game-icon').first()).toBeVisible();
}

/** The finding rows of one table: a row is a top-level band of the card, and the Fix cell is what tells it from the on-plan strip and the empty state. */
export function findingRows(table: Locator): Locator {
  return table.locator(':scope > div > div.border-t').filter({ has: table.page().locator('wl-collapsible-text') });
}

/** Asserts every finding row renders its chip, its measured figure, and its authored fix - which findings a pull produces moves with each re-ingest, so no card is pinned to one named finding. */
export async function showsFindingRows(table: Locator, chip?: RegExp): Promise<void> {
  const rows = findingRows(table);
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    if (chip) await expect(row.locator('span.rounded-sm')).toHaveText(chip);
    await expect(row).toHaveText(MEASURE);
    await expect(row.locator('wl-collapsible-text')).not.toHaveText('');
  }
}

/** Asserts the table lists the findings the pull followed as chips rather than as rows. */
export async function showsOnPlan(table: Locator): Promise<void> {
  await shows(table, 'On plan');
  await expect(table.locator('.chip-onplan').first()).toBeVisible();
}
