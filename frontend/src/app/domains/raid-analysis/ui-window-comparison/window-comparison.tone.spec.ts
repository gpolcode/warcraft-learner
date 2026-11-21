import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { WindowComparison } from './window-comparison';
import type { ComparisonWindow, WindowStatus, RangeRow } from '../data/analysis/window-comparison.models';
import { ToneService } from '../data/verdict/tone-service';
import { statusColor, mountDom, MountedDom } from '../../../../testing/component-harness';

const DELTA_BADGE = 'div.flex-col.shrink-0:nth-of-type(3) > span.text-value';

const tones = TestBed.inject(ToneService);
const AMBER = tones.tone({ tier: 'amber', costClass: 'medium' }, { level: 'amber', observed: 0, n: 5, target: 0, excess: 0 });

/** A window judged through the verdict contract, at the tone it was given. */
function contractWin(overview: Partial<RangeRow>, status: WindowStatus, message = ''): ComparisonWindow {
  return {
    timeStartS: 0, timeEndS: 10, spells: [], labels: [], note: '', status, statusIcon: 'compare_arrows', benchOnly: false,
    message, family: 'burst.window', unjudged: null,
    overview: { label: '', icon: '', playerPct: null, topAvg: null, topMin: null, topMax: null, ...overview },
    detailRows: [],
  };
}

const render = (windows: ComparisonWindow[], inputs: Record<string, unknown> = {}): MountedDom =>
  mountDom(WindowComparison, { windows, metricLabel: 'probe metric', chipsLabel: 'probe chips', rangeLabel: 'probe range', ...inputs });

describe('WindowComparison on the verdict contract', () => {
  const MESSAGE = 'You dealt 949 here, less than the 5 top logs that had this window. Aim for 950 or more.';
  const ABILITY: RangeRow = { spellId: 1, label: 'Eviscerate', icon: '', playerPct: 60, topAvg: 100, topMin: 50, topMax: 150, playerCasts: 0, topCasts: 3 };

  it('prints the delta of a comparison window with no color', () => {
    expect(statusColor(render([contractWin({ playerPct: 90, topAvg: 100 }, tones.neutral())]).query(DELTA_BADGE))).toBeNull();
  });

  it('prints the delta of an amber window in the amber color', () => {
    expect(statusColor(render([contractWin({ playerPct: 90, topAvg: 100 }, AMBER)]).query(DELTA_BADGE))).toBe('warning');
  });

  it('prints the window message in the amber color on an amber window', () => {
    const dom = render([contractWin({ playerPct: 90, topAvg: 100 }, AMBER, MESSAGE)]);
    const line = dom.queryAll('p').find(el => el.textContent.includes(MESSAGE)) ?? null;

    expect(statusColor(line)).toBe('warning');
  });

  it('leaves its ability rows without color, since no rule grades one ability', () => {
    const dom = render([{ ...contractWin({ playerPct: 90, topAvg: 100 }, AMBER), detailRows: [ABILITY] }]);

    expect(statusColor(dom.query('wl-compact-ability-row span.text-value'))).toBeNull();
  });

  it('shows the empty state in place of the strip when there are no windows', () => {
    const EMPTY = 'No burst window to compare.';
    const dom = render([], { empty: EMPTY });

    expect(dom.query('wl-empty-state')?.textContent).toContain(EMPTY);
  });

  it('shows the empty state as a line above the strip when windows are drawn', () => {
    const EMPTY = 'Nothing flagged.';
    const dom = render([contractWin({ playerPct: 90, topAvg: 100 }, tones.neutral())], { empty: EMPTY });

    expect(dom.query('wl-empty-state')).toBeNull();
    expect(dom.text()).toContain(EMPTY);
  });
});
