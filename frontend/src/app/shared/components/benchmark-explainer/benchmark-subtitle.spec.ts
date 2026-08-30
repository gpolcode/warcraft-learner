import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { mountDom } from '../../../../testing/component-harness';
import { BenchmarkSubtitle } from './benchmark-subtitle';
import { BenchmarkExplainerStore } from '../../state/benchmark-explainer-store';

const TRIGGER = 'button';

describe('BenchmarkSubtitle', () => {
  it('renders the subtitle word for word, with the benchmark noun as the trigger', () => {
    const dom = mountDom(BenchmarkSubtitle, { text: 'Rotation rules vs top parses.' });

    expect(dom.text()).toBe('Rotation rules vs top parses.');
    expect(dom.query(TRIGGER)?.textContent).toBe('top parses');
  });

  it('triggers on the hyphenated spelling the gear and plan cards use', () => {
    const dom = mountDom(BenchmarkSubtitle, { text: 'Top-parse gear consensus.' });

    expect(dom.text()).toBe('Top-parse gear consensus.');
    expect(dom.query(TRIGGER)?.textContent).toBe('Top-parse');
  });

  it('triggers on every noun the app names the benchmark by, not just "top parses"', () => {
    const subtitles = [
      { text: 'Damage in each burst window vs top logs.', term: 'top logs' },
      { text: 'Rotation rules vs the top Mythic logs for your spec.', term: 'top Mythic logs' },
      { text: 'How your defensives compare with top raiders.', term: 'top raiders' },
    ];

    for (const { text, term } of subtitles) {
      expect(mountDom(BenchmarkSubtitle, { text }).query(TRIGGER)?.textContent).toBe(term);
    }
  });

  it('takes the first benchmark noun when a subtitle names it twice', () => {
    const dom = mountDom(BenchmarkSubtitle, { text: 'Damage taken in top-parse defensive windows vs top parses.' });

    expect(dom.query(TRIGGER)?.textContent).toBe('top-parse');
  });

  it('leaves a subtitle that never names the benchmark with no trigger', () => {
    const dom = mountDom(BenchmarkSubtitle, { text: 'Pull 3 of this session.' });

    expect(dom.text()).toBe('Pull 3 of this session.');
    expect(dom.query(TRIGGER)).toBeNull();
  });

  it('leaves "top parsers" alone, so a measured unit never becomes a trigger', () => {
    const dom = mountDom(BenchmarkSubtitle, { text: '60% of top parsers ran it.' });

    expect(dom.query(TRIGGER)).toBeNull();
  });

  it('opens the shared explainer when the trigger is pressed', () => {
    const dom = mountDom(BenchmarkSubtitle, { text: 'Gear vs top parses.' });
    const store = TestBed.inject(BenchmarkExplainerStore);
    expect(store.open()).toBe(false);

    dom.click(TRIGGER);

    expect(store.open()).toBe(true);
  });
});
