import { expect, Locator, Page } from '@playwright/test';
import { baseEnvironment } from '../src/environments/base-environment';

export async function shows(scope: Page | Locator, text: string | RegExp): Promise<void> {
  const match = typeof text === 'string' ? scope.getByText(text, { exact: true }) : scope.getByText(text);
  await expect(match.first()).toBeVisible();
}

// Figure shapes, not values: both the player's log and the bench move with the data, never the format.
export const CLOCK = /-?\d+:\d{2}/;
export const PERCENT = /[+-]?\d+(\.\d+)?%/;
const CLOCK_RANGE = /^-?\d+:\d{2} - -?\d+:\d{2}$/;
/** formatDamage leaves a figure under a thousand bare, so a cell holding one amount reads as a plain number as often as a K or M figure. */
export const AMOUNT = /^\d+(\.\d+)?[KMB]?$/;
const GAP = /^[+-]\d+(\.\d+)?[KMB]?$|^Not used$/;
const CASTS = /^\d+ \/ (\d+|-)$|^Passive$/;

/** Mirrors CAT_LABEL in src/app/domains/raid-analysis/data/analysis/analysis.models.ts. */
export const CD_CHIP = /\b(lost cast|late|Bloodlust|downtime|hold until)\b/;

/** A label sits directly above its value, so a field reads as the label's next sibling. */
export function valueOf(scope: Locator, label: string): Locator {
  return scope.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]');
}

/** Taiga opens a select's options in its portal, so they are read from its list rather than from the page, whose cards carry option strips of their own. */
function options(page: Page): Locator {
  return page.locator('tui-data-list').getByRole('option');
}

async function textOf(option: Locator): Promise<string> {
  return (await option.innerText()).replace(/\s+/g, ' ').trim();
}

/** Picks a select's first option and checks it landed, so a suite never names a fight, player, class, spec or encounter. */
export async function picksFirst(page: Page, label: string): Promise<void> {
  const select = page.getByRole('combobox', { name: label });
  await select.click();
  const first = options(page).first();
  const picked = await textOf(first);
  await first.click();
  await expect(select).toHaveValue(picked);
}

/** A select the page filled on its own holds its first option. */
export async function showsFirstOption(page: Page, label: string): Promise<void> {
  const select = page.getByRole('combobox', { name: label });
  await select.click();
  const first = await textOf(options(page).first());
  await page.keyboard.press('Escape');
  await expect(page.locator('tui-data-list')).toBeHidden();
  await expect(select).toHaveValue(first);
}

/** Entering a report resolves its last pull at once; holding that resolve until the first pull is picked keeps the run at one analysis, as the page drops a superseded resolve when it lands. */
export async function holdsPullResolve(page: Page, wclApiUrl: string): Promise<() => void> {
  let release!: () => void;
  const released = new Promise<void>(resolve => { release = resolve; });
  await page.route(wclApiUrl, async route => {
    if (route.request().postData()?.includes('query PlayerDetails')) await released;
    await route.continue();
  });
  return release;
}

/** A bare `div.border-t` also matches the on-plan strip, the empty state, and the Fix cell itself, so a row is narrowed to a top-level band of the card that carries a Fix label. */
function findingRows(table: Locator): Locator {
  return table.locator(':scope > section > div > div.border-t').filter({ has: table.page().getByText('Fix', { exact: true }) });
}

/** Which findings a pull produces moves with every re-ingest of the bench, so a table is pinned by its first row's fields when it drew any, by its on-plan chips, or by its empty state. */
export async function showsFindingTable(table: Locator, chip: RegExp): Promise<void> {
  await shows(table, 'Measured');
  await shows(table, 'Fix');
  const rows = findingRows(table);
  const onPlan = table.locator('[tuiChip]');
  const flagged = await rows.count();
  const planned = await onPlan.count();
  if (flagged) await showsFindingRow(rows.first(), chip);
  if (planned) {
    await shows(table, 'On plan');
    await expect(onPlan.first().locator('wl-game-icon')).toHaveText(/\S/);
  }
  if (!flagged && !planned) await shows(table, 'Nothing flagged.');
}

async function showsFindingRow(row: Locator, chip: RegExp): Promise<void> {
  await expect(row.locator('tui-icon').first()).toBeVisible();
  await expect(row.locator('span.text-name').first()).toHaveText(/\S/);
  // A finding on the whole pull, like downtime, has no moment of its own.
  const moment = row.locator('span.text-accent');
  if (await moment.count()) await expect(moment).toHaveText(CLOCK);
  await expect(row.locator('[tuiBadge]')).toHaveText(chip);
  await expect(row.locator('div.text-value')).toHaveText(/\S/);
  await expect(row.getByText('Fix', { exact: true }).locator('..')).toHaveText(/Fix\s*\S/);
}

interface WindowFields {
  metric: string;
  chips: string;
  /** The You vs top bar's label; a bench-only window has no player to bar, so it carries neither the bar nor the gap column. */
  range?: string;
  casts?: boolean;
}

/** The panel renders the active window alone, so once the first chip is picked every field on it belongs to the first window. */
export async function showsFirstWindow(card: Locator, fields: WindowFields): Promise<void> {
  const first = card.getByRole('option').first();
  await first.click();
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(first).toHaveAccessibleName(CLOCK);
  await expect(valueOf(card, 'Window')).toHaveText(CLOCK_RANGE);
  await expect(valueOf(card, fields.metric)).toHaveText(AMOUNT);
  if (fields.range) {
    await expect(valueOf(card, 'Vs top raiders average')).toHaveText(PERCENT);
    await expect(valueOf(card, fields.range)).toBeVisible();
    await shows(card, 'You');
    await shows(card, 'Top raiders, lowest to highest');
    await shows(card, 'Top raiders average');
  }
  // A window in which top logs press no cooldown names none.
  if (await card.getByText(fields.chips, { exact: true }).count()) {
    await expect(valueOf(card, fields.chips).locator('[tuiChip]').first()).toHaveText(/\S/);
  }
  await shows(card, 'Ability');
  const ability = card.locator('wl-compact-ability-row').first();
  await expect(ability.locator('wl-game-icon')).toHaveText(/\S/);
  await expect(ability.locator('span.text-body')).toHaveText(AMOUNT);
  if (fields.range) {
    await shows(card, 'Gap');
    await expect(ability.locator('span.text-value')).toHaveText(GAP);
  }
  if (fields.casts) {
    await shows(card, 'Casts');
    await expect(ability.locator('[tuiBadge]')).toHaveText(CASTS);
  }
}

/** The rows put the cooldowns top logs used first, so the first row carries a measured plan rather than dashes. */
export async function showsFirstPlanRow(card: Locator): Promise<void> {
  await shows(card, 'First use');
  await shows(card, 'Typical uses');
  await shows(card, 'Hold until');
  const row = card.locator('div.grid.border-t').first();
  await expect(row.locator('wl-game-icon')).toHaveText(/\S/);
  await expect(row.locator('span.text-accent').first()).toHaveText(CLOCK);
  await expect(row.getByText(/^\d+(\.\d+)?x$/)).toBeVisible();
  await expect(row.getByText(/^Used in \d+ of \d+ logs$/)).toBeVisible();
  const holds = row.locator('[tuiChip]');
  if (await holds.count()) await expect(holds.first()).toHaveText(CLOCK);
  else await expect(row.getByText('None', { exact: true })).toBeVisible();
}

export function gearSection(gear: Locator, heading: string): Locator {
  return gear.locator('div.card-section').filter({ has: gear.page().getByRole('heading', { name: heading, exact: true }) });
}

/** The bench orders builds and pairs most common first, so the first rows carry the top-log consensus whatever the sample. */
export async function showsGearConsensus(gear: Locator): Promise<void> {
  const talents = gearSection(gear, 'Talents');
  const build = talents.locator('div.grid').first();
  await expect(build.locator('span.text-name')).toHaveText('Most common build');
  await expect(build.locator('div.text-value')).toHaveText(PERCENT);
  await shows(build, 'of top logs');
  // The code links the example parse: its report, its pull and the player's actor id.
  await expect(build.getByRole('link', { name: 'Get talent code' })).toHaveAttribute('href', /\?fight=\d+&type=summary&source=\d+$/);
  // How many builds the bench carries moves with every refresh; a thin sample can leave only the most common one.
  const diff = talents.getByText('The talents this build changes from the most common build.');
  if (await diff.count()) {
    await expect(diff.first()).toBeVisible();
    await shows(talents, /^(Added|Dropped|Points)$/);
    await expect(talents.locator('[tuiChip] wl-game-icon').first()).toHaveText(/\S/);
  }
  const trinkets = gearSection(gear, 'Trinkets');
  const pair = trinkets.locator('div.grid').first();
  await expect(pair.locator('span.text-name')).toHaveText('Most common pair');
  await expect(pair.locator('div.text-value')).toHaveText(PERCENT);
  await shows(pair, 'of top logs');
  await expect(trinkets.locator(`a[href^="${baseEnvironment.wowheadUrl}/item="]`).first()).toBeVisible();
}
