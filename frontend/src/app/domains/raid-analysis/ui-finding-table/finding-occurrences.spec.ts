import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { FindingOccurrences } from './finding-occurrences';
import type { FindingOccurrence } from '../data/analysis/analysis.models';

function occ(over: Partial<FindingOccurrence> = {}): FindingOccurrence {
  return { ok: true, label: 'x', detail: 'detail', ...over };
}

describe('FindingOccurrences', () => {
  it('activeIndex defaults to the first failing occurrence', () => {
    const occurrences = [occ({ ok: true, label: 'a' }), occ({ ok: false, label: 'b' }), occ({ ok: false, label: 'c' })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    expect(vm.activeIndex()).toBe(1);
    expect(vm.active()?.label).toBe('b');
  });

  it('activeIndex defaults to the first entry when nothing failed', () => {
    const occurrences = [occ({ label: 'a' }), occ({ label: 'b' })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    expect(vm.activeIndex()).toBe(0);
  });

  it('select overrides the default and moves the active occurrence', () => {
    const occurrences = [occ({ ok: false, label: 'a' }), occ({ label: 'b' }), occ({ label: 'c' })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    vm.select(2);
    expect(vm.activeIndex()).toBe(2);
    expect(vm.active()?.label).toBe('c');
  });

  it('activeIndex passes over a cast the log could not settle for the first failing one', () => {
    const occurrences = [occ({ ok: false, unjudged: true, label: 'a' }), occ({ ok: false, label: 'b' })];
    const { vm } = mountVm(FindingOccurrences, { occurrences });
    expect(vm.active()?.label).toBe('b');
  });

  it('drops a stale manual pick when occurrences swaps to a different finding, falling back to the new first-bad index', () => {
    const occurrences = [occ({ ok: false, label: 'a' }), occ({ label: 'b' }), occ({ ok: false, label: 'c' })];
    const { vm, setInput } = mountVm(FindingOccurrences, { occurrences });
    vm.select(2);
    expect(vm.activeIndex()).toBe(2);

    const nextOccurrences = [occ({ ok: false, label: 'd' }), occ({ label: 'e' })];
    const NEW_FIRST_BAD_INDEX = 0;
    setInput('occurrences', nextOccurrences);

    expect(vm.activeIndex()).toBe(NEW_FIRST_BAD_INDEX);
    expect(vm.active()).toEqual(nextOccurrences[NEW_FIRST_BAD_INDEX]);
  });
});
