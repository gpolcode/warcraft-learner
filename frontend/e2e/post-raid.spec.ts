import { expect, test, Locator, Page } from '@playwright/test';
import { baseEnvironment } from '../src/environments/base-environment';
import {
  shows, showsFindingTable, showsFirstOption, showsFirstWindow, showsGearConsensus, picksFirst, holdsPullResolve, gearSection, valueOf,
  AMOUNT, ANY_TEXT, CD_CHIP, CLOCK, OPENED_AT, PERCENT,
} from './support';

const { e2eReportCode: REPORT_CODE, wclApiUrl: WCL_API_URL } = baseEnvironment;

const ANALYZE_TIMEOUT_MS = 120_000;
// The map trails load unawaited after the cards reveal.
const MAP_READY_TIMEOUT_MS = 60_000;
const LIVE_TIMEOUT_MS = 15_000;
const SLACK_MS = 30_000;
/** Mirrors MAX_OCCURRENCES in src/app/domains/raid-analysis/data/rotation/priority-list/list-finding-service.ts. */
const MAX_INSTANCES = 24;
const FIGHT_LABEL = new RegExp(` - (Kill|Wipe #\\d+) - ${CLOCK.source}$`);
const JUDGED_CAST = new RegExp(`is only right when these conditions hold\\. At ${CLOCK.source} ${ANY_TEXT.source}`);
const STATE_AT = new RegExp(`State at ${CLOCK.source}`);
const VERDICT = /Right time|Wrong time|Not judged|Skipped when due/;
const CONDITION_STATE = /^(Met|Not met|Not in the log)$/;

// One shared page: the report is analyzed once, so a run costs one WCL analysis.
test.describe.configure({ mode: 'serial' });

let page: Page;

test.beforeAll(async ({ browser }) => {
  test.setTimeout(ANALYZE_TIMEOUT_MS + SLACK_MS);
  page = await browser.newPage();
  const releasePullResolve = await holdsPullResolve(page, WCL_API_URL);
  await page.goto('/');
  await page.getByLabel('Warcraft Logs report URL or code').fill(REPORT_CODE);
  await page.keyboard.press('Enter');
  await picksFirst(page, 'Fight');
  releasePullResolve();
  // The cards stay hidden until every feature settles, so this one wait covers the whole analysis.
  await expect(page.getByText('Pull overview')).toBeVisible({ timeout: ANALYZE_TIMEOUT_MS });
});

test.afterAll(async () => {
  await page.close();
});

test('entering the report picks its first pull and lands on its first raider', async () => {
  await shows(page, 'Paste a Warcraft Logs report to see how your Mythic pulls compare with the top logs for your spec.');
  await showsFirstOption(page, 'Fight');
  await expect(page.getByRole('combobox', { name: 'Fight' })).toHaveValue(FIGHT_LABEL);
  await showsFirstOption(page, 'Player');
  // The spec icon sits in the field's shown value, beside the input rather than inside it.
  const player = page.getByRole('combobox', { name: 'Player' });
  await expect(page.locator('tui-textfield', { has: player }).locator('img').first()).toHaveAttribute('alt', ANY_TEXT);
});

test('following the latest pull hands the fight selection to the live poll', async () => {
  const controls = page.locator('wl-live-controls');
  const follow = controls.getByRole('switch', { name: 'Follow latest pull' });
  const fight = page.getByRole('combobox', { name: 'Fight' });
  await shows(controls, 'Re-analyzes as new pulls upload during a live log.');

  await follow.click();
  await expect(follow).toBeChecked();
  await expect(fight).toBeDisabled();
  // The countdown ticks every second, so only its shape is pinned.
  const settled = /Next update in \d+s/;
  await expect(controls.getByText(settled)).toBeVisible({ timeout: LIVE_TIMEOUT_MS });

  // Left on, the poll keeps hitting Warcraft Logs under every later test.
  await follow.click();
  await expect(fight).toBeEnabled();
  await expect(controls.getByText(settled)).toHaveCount(0);
});

test('recording the game client captures a named display source', async () => {
  const controls = page.locator('wl-live-controls');
  const record = controls.getByRole('switch', { name: 'Record game client' });

  await record.click();
  await expect(record).toBeChecked();
  // The picked display source names itself, so only the copy around the name is pinned.
  await expect(controls.getByText(/^Recording ".+" in the background$/)).toBeVisible({ timeout: LIVE_TIMEOUT_MS });

  await record.click();
  await expect(record).not.toBeChecked();
  await shows(controls, 'Stays in this browser session, nothing is uploaded');
});

test('pull overview reports the result, the deaths, the DPS and the duration', async () => {
  const pullOverview = page.locator('wl-pull-overview');
  await shows(pullOverview, 'Pull overview');
  const subtitle = pullOverview.getByText(/Pull \d+ (- kill|of this session)\./);
  await expect(subtitle).toBeVisible();
  const kill = (await subtitle.innerText()).includes('kill');

  await shows(pullOverview, 'Deaths & result');
  const deaths = pullOverview.locator('div.grid').filter({ has: page.getByText(/Death \d+/) });
  if (await deaths.count()) {
    await expect(deaths.first().locator('tui-icon').first()).toBeVisible();
    await expect(deaths.first().locator('span.text-accent')).toHaveText(CLOCK);
  } else {
    await shows(pullOverview, kill ? 'No deaths - clean pull' : 'No deaths - you survived');
  }
  const outcome = pullOverview.locator('div.grid').filter({ has: page.getByText(kill ? 'Boss defeated' : /Boss reached \d+% - raid ended/) });
  await expect(outcome.getByText(kill ? 'Kill' : 'Wipe', { exact: true })).toBeVisible();
  await expect(outcome.locator('span.text-accent')).toHaveText(CLOCK);

  await expect(valueOf(pullOverview, 'Your DPS')).toHaveText(AMOUNT);
  await expect(valueOf(pullOverview, 'Duration')).toHaveText(CLOCK);
  if (kill) await expect(valueOf(pullOverview, 'Result')).toHaveText('Kill');
  else await expect(valueOf(pullOverview, 'Boss health')).toHaveText(PERCENT);
});

test('rotation rules bar the first button against the top logs and open its moments into a judged cast with its conditions', async () => {
  const rotationRules = page.locator('wl-rotation').locator('wl-button-table');
  await shows(rotationRules, 'Rotation rules');
  await shows(rotationRules, 'How often you pressed each button at the right time, compared with the top Mythic logs for your spec. A press at the wrong time and a skip when it was due both count as a miss.');
  await shows(rotationRules, 'You');
  await shows(rotationRules, 'Top raiders, lowest to highest');
  await shows(rotationRules, 'Top raiders average');

  const button = rotationRules.locator('div[tuiCardLarge]').first();
  await expect(button.locator('wl-game-icon')).toHaveText(ANY_TEXT);
  await expect(button.locator('wl-range-bar')).toBeVisible();
  await expect(button.locator('span.sr-only')).toHaveText(/You \d+%\.\s+Top raiders \d+% to \d+%, \d+% on average\./);

  await button.getByRole('button', { name: 'Show instances' }).click();
  const strip = button.locator('wl-finding-occurrences');
  await shows(strip, 'Instances');
  const moments = strip.getByRole('option');
  const count = await moments.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(MAX_INSTANCES);
  await expect(moments.first()).toHaveText(CLOCK);
  await expect(strip.locator('[aria-selected="true"]')).toHaveText(CLOCK);
  await expect(strip.getByText(JUDGED_CAST)).toBeVisible();

  const checklist = strip.locator('wl-condition-checklist');
  await shows(checklist, 'Condition');
  await shows(checklist, STATE_AT);
  await expect(checklist.getByText(VERDICT)).toBeVisible();
  await shows(checklist, 'All of');
  const rows = checklist.getByRole('img', { name: CONDITION_STATE }).locator('..');
  // The verdict heads the tree, so the cast's own conditions start at the second row.
  expect(await rows.count()).toBeGreaterThan(1);
  const condition = rows.filter({ has: page.locator('span.tabular-nums', { hasText: ANY_TEXT }) }).first();
  await expect(condition.locator('span.flex-col > span').first()).toHaveText(ANY_TEXT);
  await expect(condition.getByRole('img', { name: CONDITION_STATE })).toBeVisible();
  await expect(condition.locator('span.tabular-nums')).toHaveText(ANY_TEXT);

  await button.getByRole('button', { name: 'Hide instances' }).click();
  await expect(strip).not.toBeVisible();
});

test('offensives flag the cooldown casts that missed the top-parse plan, and downtime the idle stretches', async () => {
  const rotation = page.locator('wl-rotation');
  const offensives = rotation.locator('wl-finding-table').filter({ hasText: 'How you used your damage cooldowns compared with the top logs.' });
  await shows(offensives, 'Offensives');
  await showsFindingTable(offensives, CD_CHIP);
  // A pull that never idles past the bench's threshold draws no downtime table at all.
  const downtime = rotation.locator('wl-finding-table').filter({ hasText: 'Time you spent not casting, compared with the top logs.' });
  if (await downtime.count()) {
    await shows(downtime, 'Downtime');
    await showsFindingTable(downtime, /downtime/);
  }
});

test('burst windows compare the first window\'s damage and abilities against the top logs', async () => {
  const burstWindows = page.locator('wl-burst-windows');
  await shows(burstWindows, 'Burst windows');
  await shows(burstWindows, 'The short stretches where top logs deal their biggest damage, compared with your log.');
  await showsFirstWindow(burstWindows, { metric: 'Damage', chips: 'Cooldowns top raiders use here', range: 'Damage vs top range', casts: true });
});

test('defensives flag the mistimed cooldowns and benchmark the damage taken in the first window', async () => {
  const defensives = page.locator('wl-defensive');
  const table = defensives.locator('wl-finding-table');
  await shows(table, 'Defensives');
  await shows(table, 'How you used your survival cooldowns compared with the top logs.');
  await showsFindingTable(table, CD_CHIP);
  // A bench keeps only the windows its top logs share, so a re-ingest can leave an encounter with none and the section hidden.
  const windows = defensives.locator('wl-window-comparison');
  if (await windows.count()) {
    await shows(windows, 'Defensive windows');
    await shows(windows, 'Damage taken in each defensive window vs top logs.');
    await showsFirstWindow(windows, { metric: 'Damage taken', chips: 'Defensives top raiders use here', range: 'Damage taken vs top range' });
    await expect(valueOf(windows, 'What you did')).toHaveText(ANY_TEXT);
  }
});

/** 'Your build' and 'Your pair' name both the verdict's label and the badge on the matching row, so the verdict is read off the label, which renders first. */
function verdictOf(section: Locator, label: string): Locator {
  return section.getByText(label, { exact: true }).first().locator('xpath=following-sibling::*[1]');
}

test('gear sets the build, the trinkets and the enchants against the top logs', async () => {
  const gear = page.locator('wl-gear');
  await shows(gear, 'Gear');
  await shows(gear, 'Gear vs top logs.');
  const talents = gearSection(gear, 'Talents');
  await shows(talents, 'Your build against the builds top raiders use.');
  await expect(verdictOf(talents, 'Your build')).toHaveText(ANY_TEXT);
  const trinkets = gearSection(gear, 'Trinkets');
  await shows(trinkets, 'Your pair against the pairs top raiders use.');
  await expect(verdictOf(trinkets, 'Your pair')).toHaveText(ANY_TEXT);
  await showsGearConsensus(gear);

  const enchants = gearSection(gear, 'Enchants');
  const issues = enchants.locator('div.grid');
  // The enchant verdict moves with the log: issue rows, every slot on plan, or no data at all.
  if (await issues.count()) {
    await shows(enchants, 'Only the slots where your enchant is missing or differs.');
    const issue = issues.first();
    await expect(issue.locator('span.text-label').first()).toHaveText(ANY_TEXT);
    await expect(issue.locator('tui-icon').first()).toBeVisible();
    await expect(issue.locator('span.text-name').first()).toHaveText(ANY_TEXT);
    await expect(issue.locator('wl-game-icon')).toHaveText(ANY_TEXT);
    await expect(issue.getByRole('button', { name: 'Copy name' })).toBeVisible();
    await expect(issue.getByText(/Most top raiders use it\./)).toBeVisible();
    if (await enchants.getByText(/\d+ enchants/).count()) await shows(enchants, 'On plan');
  } else {
    await expect(enchants.getByText('All enchants').or(enchants.getByText('No enchant data.'))).toBeVisible();
  }
});

test('the positioning map opens anchored on the pull overview\'s first moment', async () => {
  test.setTimeout(MAP_READY_TIMEOUT_MS + SLACK_MS);
  // The first map button belongs to the pull overview's first death, or to its outcome on a deathless pull.
  const openMap = page.getByRole('button', { name: 'Show map', exact: true }).first();
  await expect(openMap).toBeVisible({ timeout: MAP_READY_TIMEOUT_MS });
  await openMap.click();
  const panel = page.getByRole('dialog', { name: 'Positioning' });
  await expect(panel.locator('wl-map-canvas canvas')).toBeVisible();
  await shows(panel, OPENED_AT);
  await shows(panel, '● Top logs');
  // The gold marker renders only once the player's own trail has loaded.
  await expect(panel.getByText('◆ You')).toBeVisible({ timeout: MAP_READY_TIMEOUT_MS });
  await panel.getByRole('button', { name: 'Close map' }).click();
  await expect(panel).toHaveCount(0);
});
