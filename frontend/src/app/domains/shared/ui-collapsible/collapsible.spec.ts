import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { Collapsible } from './collapsible';

interface CollapsibleVm {
  measure: (el: HTMLElement) => void;
  overflowing: () => boolean;
  expanded: () => boolean;
  toggle: () => void;
}

// Two clamped lines of the body role: 13px at a 1.45 line height.
const LINE_H = 19;
const CLAMPED_H = 2 * LINE_H;

function box(scrollHeight: number, clientHeight: number): HTMLElement {
  return { scrollHeight, clientHeight } as HTMLElement;
}

function prose(): CollapsibleVm {
  return mountVm(Collapsible).vm as unknown as CollapsibleVm;
}

describe('Collapsible', () => {
  it('offers the toggle when the text runs past the two clamped lines', () => {
    const vm = prose();
    vm.measure(box(CLAMPED_H + LINE_H, CLAMPED_H));
    expect(vm.overflowing()).toBe(true);
  });

  it('offers no toggle when the text fits the two clamped lines', () => {
    const vm = prose();
    vm.measure(box(CLAMPED_H, CLAMPED_H));
    expect(vm.overflowing()).toBe(false);
  });

  it('offers no toggle for a 1px overhang, which is a rounding artifact rather than a hidden line', () => {
    const vm = prose();
    vm.measure(box(CLAMPED_H + 1, CLAMPED_H));
    expect(vm.overflowing()).toBe(false);
  });

  it('keeps the toggle after expanding, where the unclamped content no longer overflows', () => {
    const vm = prose();
    vm.measure(box(CLAMPED_H + LINE_H, CLAMPED_H));
    vm.toggle();
    vm.measure(box(CLAMPED_H + LINE_H, CLAMPED_H + LINE_H));

    expect(vm.expanded()).toBe(true);
    expect(vm.overflowing()).toBe(true);
  });

  it('collapses again on a second toggle', () => {
    const vm = prose();
    vm.toggle();
    vm.toggle();
    expect(vm.expanded()).toBe(false);
  });
});
