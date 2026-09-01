import { describe, it, expect, beforeEach } from 'vitest';
import { WclReport } from '../../../../core/wcl/wcl.models';
import { postRaidPage } from './post-raid-page';

const POST_RAID_FIRST_RUN_KEY = 'wl.firstRun.postRaid';

const SPINNER_MESSAGE = 'Fetching report from Warcraft Logs…';
const SPINNER_CAPTION = 'First analysis takes about a minute. Everything runs in your browser.';

const REPORT_CODE = 'grBQ3vTHXAtPa4JK';

// The caption renders only on the spinner.
const open = () => postRaidPage({ getReport: () => new Promise<WclReport>(() => undefined) });

describe('PostRaid first-run caption', () => {
  beforeEach(() => { localStorage.clear(); });

  it('warns a browser that has never analyzed a pull how long the first wait is', () => {
    const page = open();

    page.submitReport(REPORT_CODE);

    expect(page.text()).toContain(SPINNER_MESSAGE);
    expect(page.text()).toContain(SPINNER_CAPTION);
  });

  it('stays away once the flag is set, so a returning raider gets the spinner they know', () => {
    localStorage.setItem(POST_RAID_FIRST_RUN_KEY, 'done');
    const page = open();

    page.submitReport(REPORT_CODE);

    expect(page.text()).toContain(SPINNER_MESSAGE);
    expect(page.text()).not.toContain(SPINNER_CAPTION);
  });
});
