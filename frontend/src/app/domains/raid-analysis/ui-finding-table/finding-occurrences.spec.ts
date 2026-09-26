import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { FindingOccurrences } from './finding-occurrences';
import type { FindingOccurrence } from '../data/analysis/analysis.models';

const FIRST_S = 10;
const SECOND_S = 20;
const THIRD_S = 30;

function occ(over: Partial<FindingOccurrence> = {}): FindingOccurrence {
  return { atS: FIRST_S, ok: true, detail: 'detail', checks: [], ...over };
}

describe('FindingOccurrences', () => {
  it('activeIndex defaults to the first failing occurrence', () => {
    const occurrences = [occ({ ok: true, atS: FIRST_S }), occ({ ok: false, atS: SECOND_S }), occ({ ok: false, atS: THIRD_S })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    expect(vm.activeIndex()).toBe(1);
    expect(vm.active()?.atS).toBe(SECOND_S);
  });

  it('activeIndex defaults to the first entry when nothing failed', () => {
    const occurrences = [occ({ atS: FIRST_S }), occ({ atS: SECOND_S })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    expect(vm.activeIndex()).toBe(0);
  });

  it('select overrides the default and moves the active occurrence', () => {
    const occurrences = [occ({ ok: false, atS: FIRST_S }), occ({ atS: SECOND_S }), occ({ atS: THIRD_S })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    vm.select(2);
    expect(vm.activeIndex()).toBe(2);
    expect(vm.active()?.atS).toBe(THIRD_S);
  });

  it('activeIndex passes over a cast the log could not settle for the first failing one', () => {
    const occurrences = [occ({ ok: false, unjudged: true, atS: FIRST_S }), occ({ ok: false, atS: SECOND_S })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    expect(vm.active()?.atS).toBe(SECOND_S);
  });

  it('drops a stale manual pick when occurrences swaps to a different finding, falling back to the new first-bad index', () => {
    const occurrences = [occ({ ok: false, atS: FIRST_S }), occ({ atS: SECOND_S }), occ({ ok: false, atS: THIRD_S })];
    const { vm, setInput } = mountVm(FindingOccurrences, { occurrences });
    vm.select(2);
    expect(vm.activeIndex()).toBe(2);

    const nextOccurrences = [occ({ ok: false, atS: FIRST_S }), occ({ atS: SECOND_S })];
    const NEW_FIRST_BAD_INDEX = 0;
    setInput('occurrences', nextOccurrences);

    expect(vm.activeIndex()).toBe(NEW_FIRST_BAD_INDEX);
    expect(vm.active()).toEqual(nextOccurrences[NEW_FIRST_BAD_INDEX]);
  });
});
