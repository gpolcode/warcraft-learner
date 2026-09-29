import { describe, it, expect } from 'vitest';
import { CodePartsPipe } from './code-parts-pipe';

const pipe = new CodePartsPipe();

describe('CodePartsPipe', () => {
  it('reads a text with no term shown as SimC wrote it as one run of words', () => {
    expect(pipe.transform('At 5+ combo points')).toEqual([{ text: 'At 5+ combo points', code: false }]);
  });

  it('reads each term between marks as code and the words around it as prose', () => {
    expect(pipe.transform('Either when `a>1` holds or when `b` holds')).toEqual([
      { text: 'Either when ', code: false },
      { text: 'a>1', code: true },
      { text: ' holds or when ', code: false },
      { text: 'b', code: true },
      { text: ' holds', code: false },
    ]);
  });
});
