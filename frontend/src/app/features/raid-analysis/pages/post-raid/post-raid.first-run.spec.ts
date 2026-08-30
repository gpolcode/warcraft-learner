import { describe, it, expect, beforeEach } from 'vitest';
import { wclReport } from '../../../../../testing/builders/wcl-fixtures';
import { postRaidPage } from './post-raid-page';

// Mirrors KEYS.postRaid in core/state/first-run-store.ts; a returning raider is identified by nothing else.
const POST_RAID_FIRST_RUN_KEY = 'wl.firstRun.postRaid';

const STRIP_HEADLINE = 'What pasting a report gets you';
const SPINNER_CAPTION = 'First analysis takes about a minute. Everything runs in your browser.';

const open = () => postRaidPage({
  getReport: () => Promise.resolve(wclReport({ fights: [], actors: [] })),
  getReportFights: () => Promise.resolve([]),
  getPlayerDetails: () => Promise.resolve({}),
});

describe('PostRaid first-run strip', () => {
  beforeEach(() => { localStorage.clear(); });

  it('greets a browser that has never analyzed a pull', () => {
    expect(open().text()).toContain(STRIP_HEADLINE);
  });

  it('stays away once the flag is set, so a returning raider gets the page they know', () => {
    localStorage.setItem(POST_RAID_FIRST_RUN_KEY, 'done');

    const page = open();

    expect(page.text()).not.toContain(STRIP_HEADLINE);
    expect(page.text()).not.toContain(SPINNER_CAPTION);
  });
});
