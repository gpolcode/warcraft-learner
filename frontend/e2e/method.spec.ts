import { expect, test } from '@playwright/test';
import { shows, ANY_TEXT } from './support';

const MEASURED_ON = /^Measured on \d+ top logs over \d+ spec and boss pairs\.$/;
const ROLE_LOAD = /^\d+\.\d{2} red and \d+\.\d{2} amber rows per pull over \d+ top logs\.$/;
const CHECKED = /^(Checked \d+ times on top logs\. Amber on (none|1 in \d+), red on (none|1 in \d+)\.|Not checked on any top log\.)$/;

test('the method page reports how often each check flags top raiders', async ({ page }) => {
  await page.goto('/method');
  const report = page.locator('wl-validity-report');
  await shows(report, 'Validity');
  await shows(report, 'How often each check flags top raiders when one of their logs is judged against the other top logs.');

  // The dataset carries a measurement only once an ingest has calibrated it.
  if (!await report.getByText(MEASURED_ON).count()) {
    await shows(report, 'No validity measurement is published.');
    return;
  }
  await shows(report, 'Colored rows per pull');
  await shows(report, /^What one top log draws on the page, by role\. A role may draw at most [\d.]+ red and [\d.]+ amber rows per pull\.$/);
  const role = report.locator('div.border-t').filter({ hasText: ROLE_LOAD }).first();
  await expect(role.locator('span.text-label')).toHaveText(/^(DPS|Tank|Healer)$/);

  await shows(report, 'Checks');
  await shows(report, 'Each check, how often it flags top logs, and how many planted mistakes it catches.');
  const check = report.locator('div.border-t').filter({ has: page.locator('[tuiBadge]') }).first();
  await expect(check.locator('span.text-name')).toHaveText(ANY_TEXT);
  await expect(check.locator('[tuiBadge]')).toHaveText(/^(Red|Amber|Count|Measurement|Not graded|Hidden)$/);
  await expect(check.getByText(CHECKED)).toBeVisible();
});
