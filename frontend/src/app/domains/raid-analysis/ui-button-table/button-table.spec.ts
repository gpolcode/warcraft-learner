import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { mountVm } from '../../../../testing/component-harness';
import { EVISCERATE, BACKSTAB } from '../../../../testing/spell-ids';
import type { ButtonRow } from '../data/rotation/priority-list/list-finding-service';
import { ButtonTable } from './button-table';
import { ToneService } from '../data/verdict/tone-service';

const tones = TestBed.inject(ToneService);
TestBed.resetTestingModule();

const row = (name: string, spellId: number): ButtonRow => ({
  family: 'rotation.button', name, spellId, icon: '', you: 1, right: 1, moments: 1, n: 10, top: { lo: 1, avg: 1, hi: 1 },
  status: tones.tone({ tier: 'amber', costClass: 'low' }, { level: 'neutral', n: 10, observed: 0, target: null, excess: 0 }),
  unjudged: null, message: 'You got 1 of 1 moments right.', occurrences: [],
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

  it('keeps a comparison row\'s bar grey and colors a graded one', () => {
    const { vm } = mountVm(ButtonTable, { heading: 'Rotation rules', rows });
    const graded = { ...row('Eviscerate', EVISCERATE), status: tones.tone({ tier: 'amber', costClass: 'low' }, { level: 'red', n: 10, observed: 5, target: 3, excess: 2 }) };
    expect(vm.barStatus(row('Eviscerate', EVISCERATE))).toBe('muted');
    expect(vm.barStatus(graded)).toBe('warning');
  });
});
