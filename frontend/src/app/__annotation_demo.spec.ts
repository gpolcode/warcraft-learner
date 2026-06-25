// TEMPORARY: deliberately failing test to demonstrate inline PR annotations.
// Remove this file once the annotation has been observed on the PR.
import { describe, it, expect } from 'vitest';

describe('annotation demo (temporary - delete me)', () => {
  it('fails on purpose to show inline PR annotations', () => {
    expect(1 + 1).toBe(3);
  });
});
