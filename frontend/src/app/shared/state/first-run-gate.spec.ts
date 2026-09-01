import { describe, it, expect, vi } from 'vitest';
import { FirstRunPage, FirstRunStore } from '../../core/state/first-run-store';
import { FirstRunGate } from './first-run-gate';

function storeStub(done: boolean) {
  return {
    isDone: () => done,
    markDone: vi.fn<(page: FirstRunPage) => void>(),
  };
}

function gate(done: boolean) {
  const store = storeStub(done);
  return { store, gate: new FirstRunGate(store as unknown as FirstRunStore, 'postRaid') };
}

describe('FirstRunGate', () => {
  it('opens on a browser that has not finished this page yet', () => {
    expect(gate(false).gate.visible()).toBe(true);
  });

  it('stays shut on a browser that already finished this page', () => {
    expect(gate(true).gate.visible()).toBe(false);
  });

  it('keeps the caption up while the page has no result on screen', () => {
    const { store, gate: subject } = gate(false);

    subject.settleWhen(false);

    expect(subject.visible()).toBe(true);
    expect(store.markDone).not.toHaveBeenCalled();
  });

  it('retires the caption and writes the flag the first time a result lands', () => {
    const { store, gate: subject } = gate(false);

    subject.settleWhen(true);

    expect(subject.visible()).toBe(false);
    expect(store.markDone).toHaveBeenCalledWith('postRaid');
  });

  it('writes the flag once, however many later results land', () => {
    const { store, gate: subject } = gate(false);

    subject.settleWhen(true);
    subject.settleWhen(true);

    expect(store.markDone).toHaveBeenCalledTimes(1);
  });

  it('never writes the flag for a browser that already had it set', () => {
    const { store, gate: subject } = gate(true);

    subject.settleWhen(true);

    expect(subject.visible()).toBe(false);
    expect(store.markDone).not.toHaveBeenCalled();
  });
});
