import { describe, it, expect } from 'vitest';
import { versionFromGear } from './migrate-version.ts';

describe('versionFromGear', () => {
  it('is v1 when the gear output carries source_id (the source_id change is baked in)', () => {
    const gear = { talent_builds: [{ example: { report_code: 'r', source_id: 537 } }] };
    expect(versionFromGear(gear)).toBe(1);
  });

  it('is v0 when the gear output has no source_id', () => {
    const gear = { talent_builds: [{ example: { report_code: 'r', fight_id: 3 } }] };
    expect(versionFromGear(gear)).toBe(0);
  });

  it('is v0 for a missing gear file', () => {
    expect(versionFromGear(null)).toBe(0);
  });
});
