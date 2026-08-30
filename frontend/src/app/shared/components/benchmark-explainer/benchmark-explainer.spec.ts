import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { mountDom, MountedDom } from '../../../../testing/component-harness';
import { BenchmarkExplainer } from './benchmark-explainer';
import { BenchmarkExplainerStore } from '../../state/benchmark-explainer-store';

const CLOSE = 'button[aria-label="Close the benchmark explainer"]';

function opened(): { dom: MountedDom; store: BenchmarkExplainerStore } {
  const dom = mountDom(BenchmarkExplainer);
  const store = TestBed.inject(BenchmarkExplainerStore);
  store.show();
  dom.detectChanges();
  return { dom, store };
}

describe('BenchmarkExplainer', () => {
  it('renders nothing until a card subtitle opens it', () => {
    const dom = mountDom(BenchmarkExplainer);

    expect(dom.query('wl-flyover-panel')).toBeNull();
    expect(dom.text()).toBe('');
  });

  it('names the sample size and how often it is re-read', () => {
    const { dom } = opened();

    expect(dom.text()).toContain('10 highest ranked');
    expect(dom.text()).toContain('re-checks them every hour');
  });

  it('defines a parse and the difficulty it is taken from', () => {
    const { dom } = opened();

    expect(dom.text()).toContain('A parse is one player\'s ranked Warcraft Logs record of a single kill.');
    expect(dom.text()).toContain('Mythic only');
  });

  it('states the you-first reading order the measured cells rely on', () => {
    const { dom } = opened();

    expect(dom.text()).toContain('In a measured cell your pull comes first.');
  });

  it('closes back to nothing from the panel close button', () => {
    const { dom, store } = opened();

    dom.click(CLOSE);

    expect(store.open()).toBe(false);
    expect(dom.query('wl-flyover-panel')).toBeNull();
  });
});
