import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { EVISCERATE, BACKSTAB } from '../../../../testing/spell-ids';
import type { ButtonRow } from '../data/rotation/priority-list/list-finding-service';
import { ButtonTable } from './button-table';

const row = (name: string, spellId: number): ButtonRow => ({
  name, spellId, icon: '', you: 1, top: { lo: 1, avg: 1, hi: 1 }, status: 'good', occurrences: [],
});

describe('ButtonTable', () => {
  const rows = [row('Eviscerate', EVISCERATE), row('Backstab', BACKSTAB)];

  it('opens no row by default, so the table renders collapsed', () => {
    const { vm } = mountVm(ButtonTable, { heading: 'Rotation rules', rows });
    expect(vm.openIndex()).toBeNull();
  });

  it('toggle opens the clicked row, and closes it on a second click', () => {
    const { vm } = mountVm(ButtonTable, { heading: 'Rotation rules', rows });
    vm.toggle(0);
    expect(vm.openIndex()).toBe(0);
    vm.toggle(0);
    expect(vm.openIndex()).toBeNull();
  });

  it('toggle on a different row replaces the open one, so at most one row is open at a time', () => {
    const { vm } = mountVm(ButtonTable, { heading: 'Rotation rules', rows });
    vm.toggle(0);
    vm.toggle(1);
    expect(vm.openIndex()).toBe(1);
  });

  it('closes the open row when rows swaps to a different pull or player', () => {
    const { vm, setInput } = mountVm(ButtonTable, { heading: 'Rotation rules', rows });
    vm.toggle(1);
    setInput('rows', [row('Eviscerate', EVISCERATE)]);
    expect(vm.openIndex()).toBeNull();
  });
});
