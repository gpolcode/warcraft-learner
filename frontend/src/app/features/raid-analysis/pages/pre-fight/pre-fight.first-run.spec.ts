import { describe, it, expect, beforeEach } from 'vitest';
import { EncounterEntry, SpecEntry } from '../../../../domain/encounter/encounter.models';
import { Result, Results } from '../../../../core/http/result';
import { CLASS_SELECT, ENCOUNTER_SELECT, SPEC_SELECT, SPEC_INDEX, preFightPage } from './pre-fight-harness';

// Mirrors KEYS.preFight in core/state/first-run-store.ts; a returning raider is identified by nothing else.
const PRE_FIGHT_FIRST_RUN_KEY = 'wl.firstRun.preFight';

const STRIP_HEADLINE = 'What the pre-fight plan gives you';

const ENCOUNTERS: EncounterEntry[] = [{ id: 3144, name: 'Boss A', sample_count: 12 }];

const open = () => preFightPage({
  getSpecs: (): Promise<Result<SpecEntry[]>> => Promise.resolve(Results.ok(SPEC_INDEX)),
  getEncounters: (): Promise<Result<EncounterEntry[]>> => Promise.resolve(Results.ok(ENCOUNTERS)),
});

describe('PreFight first-run strip', () => {
  beforeEach(() => { localStorage.clear(); });

  it('greets a browser that has never opened a plan', async () => {
    const page = open();
    await page.settled();
    page.render();

    expect(page.text()).toContain(STRIP_HEADLINE);
  });

  it('retires the strip for good once the first plan is on screen', async () => {
    const page = open();
    await page.settled();
    page.render();
    page.choose(CLASS_SELECT, 'Rogue');
    await page.settled();
    page.choose(SPEC_SELECT, 'Subtlety');
    await page.settled();
    page.render();

    page.choose(ENCOUNTER_SELECT, ENCOUNTERS[0]?.name ?? '');
    await page.settled();
    page.render();

    expect(page.text()).not.toContain(STRIP_HEADLINE);
    expect(localStorage.getItem(PRE_FIGHT_FIRST_RUN_KEY)).not.toBeNull();
  });

  it('stays away once the flag is set, so a returning raider gets the page they know', async () => {
    localStorage.setItem(PRE_FIGHT_FIRST_RUN_KEY, 'done');

    const page = open();
    await page.settled();
    page.render();

    expect(page.text()).not.toContain(STRIP_HEADLINE);
  });
});
