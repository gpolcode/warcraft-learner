import { describe, it, expect } from 'vitest';
import { mountVm } from '../../../../testing/component-harness';
import { GearSectionComponent } from './gear-section';
import { EncounterGearStats } from '../../../core/models/encounter.models';
import { CharacterGear } from '../../../core/models/wcl.models';
import { GearCategory } from '../../../shared/gear/gear-comparison';

function stats(partial: Partial<EncounterGearStats> = {}): EncounterGearStats {
  return { talent_builds: [], trinkets: {}, enchants: {}, ...partial };
}

function gear(partial: Partial<CharacterGear> = {}): CharacterGear {
  return { found: true, ...partial };
}

function categories(vm: Record<string, unknown>): GearCategory[] {
  return (vm['categories'] as () => GearCategory[])();
}

function byKey(vm: Record<string, unknown>, key: GearCategory['key']): GearCategory {
  return categories(vm).find(c => c.key === key)!;
}

describe('GearSectionComponent - bench-only mode (playerGear null)', () => {
  it('lists consensus enchants as informational rows with usage %', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }] } }),
      playerGear: null,
    });

    const enchants = byKey(vm, 'enchants');
    expect(enchants.benchMode).toBe(true);
    expect(enchants.rows).toHaveLength(1);
    expect(enchants.rows[0]).toMatchObject({ name: 'Sophic Devotion', pct: 90 });
    expect(enchants.onPlan).toBeNull();
  });

  it('lists consensus trinkets per slot', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({
        trinkets: {
          12: [{ id: 193701, name: "Algeth'ar Puzzle Box", pct: 50 }],
          13: [{ id: 249343, name: 'Gaze of the Alnseer', pct: 80 }],
        },
      }),
      playerGear: null,
    });

    const trinkets = byKey(vm, 'trinkets');
    expect(trinkets.rows.map(r => r.name)).toEqual(["Algeth'ar Puzzle Box", 'Gaze of the Alnseer']);
  });

  it('falls back to an empty hint when a section has no data', () => {
    const { vm } = mountVm(GearSectionComponent, { topGear: stats(), playerGear: null });
    expect(byKey(vm, 'enchants').emptyHint).toBe('No enchant data yet.');
    expect(byKey(vm, 'trinkets').rows).toEqual([]);
  });
});

describe('GearSectionComponent - comparison mode (playerGear loaded)', () => {
  it('collapses a matching enchant into the "On plan" chip', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }] } }),
      playerGear: gear({ enchants: [{ slot: 15, id: 8041, name: 'Sophic Devotion' }] }),
    });

    const enchants = byKey(vm, 'enchants');
    expect(enchants.rows).toEqual([]);
    expect(enchants.onPlan).toBe('All optimal');
  });

  it('shows a missing high-consensus enchant as a row naming the correct enchant', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ enchants: { 15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }] } }),
      playerGear: gear({ enchants: [] }),
    });

    const enchants = byKey(vm, 'enchants');
    expect(enchants.rows).toHaveLength(1);
    expect(enchants.rows[0]).toMatchObject({ status: 'warn', name: 'Not enchanted', fix: 'Apply Sophic Devotion' });
    expect(enchants.onPlan).toBeNull();
  });

  it('summarises the passing enchants as an "N optimal" chip alongside the issue rows', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ enchants: {
        9: [{ id: 1, name: 'Hands Rune', pct: 90 }],
        15: [{ id: 8041, name: 'Sophic Devotion', pct: 90 }],
      } }),
      playerGear: gear({ enchants: [{ slot: 9, id: 1, name: 'Hands Rune' }] }),
    });

    const enchants = byKey(vm, 'enchants');
    expect(enchants.rows).toHaveLength(1);
    expect(enchants.rows[0].slotLabel).toBe('Main Hand');
    expect(enchants.onPlan).toBe('1 optimal');
  });

  it('collapses both trinkets into the "On plan" chip when they match', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ trinkets: { 12: [{ id: 1, name: 'A', pct: 60 }], 13: [{ id: 2, name: 'B', pct: 60 }] } }),
      playerGear: gear({ trinkets: [{ slot: 12, id: 1, name: 'A' }, { slot: 13, id: 2, name: 'B' }] }),
    });
    expect(byKey(vm, 'trinkets').onPlan).toBe('Both optimal');
    expect(byKey(vm, 'trinkets').rows).toEqual([]);
  });

  it('shows slot rows with a switch fix when a trinket is off-meta', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ trinkets: { 12: [{ id: 1, name: 'A', pct: 60 }], 13: [{ id: 2, name: 'B', pct: 60 }] } }),
      playerGear: gear({ trinkets: [{ slot: 12, id: 1, name: 'A' }, { slot: 13, id: 9, name: 'Wrong' }] }),
    });
    const trinkets = byKey(vm, 'trinkets');
    expect(trinkets.onPlan).toBeNull();
    expect(trinkets.rows).toHaveLength(2);
    expect(trinkets.rows[1]).toMatchObject({ status: 'info', name: 'Wrong', fix: 'Switch to B' });
  });

  it('shows the talent success chip when on a top build', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ talent_builds: [{ key: 'v2:a', pct: 70 }] }),
      playerGear: gear({ talent_key: 'v2:a' }),
    });
    expect(byKey(vm, 'talents').onPlan).toBe('Optimal build');
  });

  it('shows a link-fix row when the talent build is off-meta, without build specifics', () => {
    const { vm } = mountVm(GearSectionComponent, {
      topGear: stats({ talent_builds: [{ key: 'v2:a', pct: 70, report_code: 'ABC', fight_id: 2 }] }),
      playerGear: gear({ talent_key: 'v2:offmeta' }),
    });
    const talents = byKey(vm, 'talents');
    expect(talents.onPlan).toBeNull();
    expect(talents.rows).toHaveLength(1);
    expect(talents.rows[0].name).toBe('Build differs from top parses');
    expect(talents.rows[0].link).toBe('https://www.warcraftlogs.com/reports/ABC#fight=2');
  });
});
