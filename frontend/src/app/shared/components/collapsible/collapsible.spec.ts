import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { Collapsible } from './collapsible';

interface CollapsibleVm {
  measure: (el: HTMLElement) => void;
  overflowing: () => boolean;
  expanded: () => boolean;
  toggle: () => void;
}

const CLAMPED_H = 60;
const CHIP_ROW_H = 26;

// jsdom lays nothing out, so the two heights the component reads off the DOM are handed to it directly.
function box(scrollHeight: number, clientHeight: number): HTMLElement {
  return { scrollHeight, clientHeight } as HTMLElement;
}

function chips(): CollapsibleVm {
  return mountVm(Collapsible, { mode: 'chips' }).vm as unknown as CollapsibleVm;
}

describe('Collapsible', () => {
  it('offers the toggle when a hero-talent swap pushes the chips past the clamped rows', () => {
    const vm = chips();
    vm.measure(box(CLAMPED_H + CHIP_ROW_H, CLAMPED_H));
    expect(vm.overflowing()).toBe(true);
  });

  it('offers no toggle when a handful of chips fit the clamped rows', () => {
    const vm = chips();
    vm.measure(box(CLAMPED_H, CLAMPED_H));
    expect(vm.overflowing()).toBe(false);
  });

  it('offers no toggle for a 1px overhang, which is a rounding artifact rather than a hidden row', () => {
    const vm = chips();
    vm.measure(box(CLAMPED_H + 1, CLAMPED_H));
    expect(vm.overflowing()).toBe(false);
  });

  it('keeps the toggle after expanding, where the unclamped content no longer overflows', () => {
    const vm = chips();
    vm.measure(box(CLAMPED_H + CHIP_ROW_H, CLAMPED_H));
    vm.toggle();
    vm.measure(box(CLAMPED_H + CHIP_ROW_H, CLAMPED_H + CHIP_ROW_H));

    expect(vm.expanded()).toBe(true);
    expect(vm.overflowing()).toBe(true);
  });

  it('collapses again on a second toggle', () => {
    const vm = chips();
    vm.toggle();
    vm.toggle();
    expect(vm.expanded()).toBe(false);
  });
});
