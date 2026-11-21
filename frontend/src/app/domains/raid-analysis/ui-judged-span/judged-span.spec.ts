import { describe, it, expect } from 'vitest';
import { JudgedSpanCaption } from './judged-span';
import type { JudgedSpan } from '../data/analysis/pull-model-service';
import { mountDom } from '../../../../testing/component-harness';

// A wipe the raid called at 4:12, with the player dead from 2:10 to 2:45 and again from 3:30 to the call: 252 - 35 - 42 = 175s alive.
const CALLED_WIPE: JudgedSpan = {
  endS: 252, aliveS: 175, endCause: 'wipe_called',
  deadSpans: [{ fromS: 130, toS: 165 }, { fromS: 210, toS: 252 }],
  folded: { dead: 2, after_wipe: 1, not_reached: 0 },
};

function sentences(span: JudgedSpan, noun?: string): string[] {
  return mountDom(JudgedSpanCaption, { span, ...(noun ? { noun } : {}) }).textAll(':scope > span');
}

describe('JudgedSpanCaption', () => {
  it('states the judged span and the alive time in it, then names each cause once with what it silenced', () => {
    expect(sentences(CALLED_WIPE)).toEqual([
      'Judged 0:00 to 4:12, alive 2:55.',
      'You were dead from 2:10 to 2:45 and from 3:30 to 4:12, so 2 checks there are not judged.',
      'The raid called the wipe at 4:12, so 1 check after it is not judged.',
    ]);
  });

  it('states only the span when nothing was silenced', () => {
    const clean: JudgedSpan = { endS: 340, aliveS: 340, endCause: 'kill', deadSpans: [], folded: { dead: 0, after_wipe: 0, not_reached: 0 } };
    expect(sentences(clean)).toEqual(['Judged 0:00 to 5:40, alive 5:40.']);
  });

  it('names the collapse of half the raid as the end when no wipe was called', () => {
    const collapse: JudgedSpan = { ...CALLED_WIPE, endCause: 'raid_collapse', deadSpans: [], folded: { dead: 0, after_wipe: 2, not_reached: 0 } };
    expect(sentences(collapse, 'window')).toContain('Half the raid was dead at 4:12, so 2 windows after it are not judged.');
  });

  it('names the kill for the windows the pull never reached', () => {
    const kill: JudgedSpan = { endS: 300, aliveS: 300, endCause: 'kill', deadSpans: [], folded: { dead: 0, after_wipe: 0, not_reached: 1 } };
    expect(sentences(kill, 'window')).toContain('The boss died at 5:00, so 1 window after it is not judged.');
  });
});
