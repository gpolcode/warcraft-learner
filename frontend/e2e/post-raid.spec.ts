import { test } from '@playwright/test';

const REPORT_URL = 'https://www.warcraftlogs.com/reports/YkVMTyfmFLtXZ1NQ?fight=last';
const PLAYER_NAME = 'Elsahr';
const STICKY_PLAYER_KEY = 'wl.sel.postRaid';

test('DUMP render for re-pin', async ({ page }) => {
  test.setTimeout(150_000);
  await page.addInitScript(
    ([key, name]) => localStorage.setItem(key, JSON.stringify({ playerName: name })),
    [STICKY_PLAYER_KEY, PLAYER_NAME],
  );
  await page.goto('/');
  await page.getByLabel('Warcraft Logs Report URL or Code').fill(REPORT_URL);
  await page.keyboard.press('Enter');
  await page.getByText('Pull overview').waitFor({ timeout: 120_000 });

  const tables = await page.locator('wl-finding-table').all();
  for (const t of tables) {
    console.log(`\n=== wl-finding-table ===\n${await t.innerText()}\n`);
  }

  for (const tag of ['wl-pull-overview', 'wl-burst-windows', 'wl-defensive', 'wl-gear']) {
    console.log(`\n=== ${tag} ===\n${await page.locator(tag).first().innerText()}\n`);
  }

  const openMap = page.getByRole('button', { name: 'Open positioning map' }).first();
  await openMap.click();
  await page.waitForTimeout(2000);
  const mapText = await page.locator('body').innerText();
  console.log(`\n=== map anchor ===\n${mapText.match(/anchor \S+/)?.[0]}\n`);
});
