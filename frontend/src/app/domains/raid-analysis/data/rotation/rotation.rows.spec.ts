import { assert, describe, it, expect } from 'vitest';
import { AnalysisFinding } from '../analysis/analysis.models';
import { SHADOW_BLADES, SECRET_TECHNIQUE, VANISH } from '../../../../../testing/spell-ids';
import { RotationFeatureService } from './rotation-feature-service';
import { TestBed } from '@angular/core/testing';
import { tone } from '../../../../../testing/builders/tone';
import { FindingRowsService } from '../analysis/finding-rows-service';
import { WCL_TRANSPORT } from '../wcl/wcl-transport';
import { DATA_FILE_TRANSPORT } from '../data-files/data-file-transport';
import { ROTATION_DATA_SOURCE } from './rotation-data-source';

TestBed.configureTestingModule({ providers: [
  { provide: WCL_TRANSPORT, useValue: {} },
  { provide: DATA_FILE_TRANSPORT, useValue: { readJson: () => new Promise(() => undefined) } },
  { provide: ROTATION_DATA_SOURCE, useValue: {} },
] });
const svc = TestBed.inject(RotationFeatureService);
const vanishOnPlan = TestBed.inject(FindingRowsService).onPlanFinding('Vanish');
TestBed.resetTestingModule();

describe('bucketRotationFindings', () => {
  const abilities = { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' }, [VANISH]: { icon: 'vanish', name: 'Vanish' } };
  it('splits downtime rows, cd issue rows and on-plan chips', () => {
    const findings: AnalysisFinding[] = [
      { severity: tone('amber'), category: 'cast_efficiency', label: 'Low cast efficiency', message: '', measured: { value: '80.0%' }, details: { remedy: 'fix' }, occurrences: [] },
      { severity: tone('amber'), category: 'cooldown_delay', cd_name: 'Shadow Blades', message: '', measured: { value: '+3s' }, timestamp_s: 4, occurrences: [] },
      vanishOnPlan,
    ];
    const out = svc['bucketRotationFindings'](findings, { 'Shadow Blades': SHADOW_BLADES, 'Vanish': VANISH }, abilities);
    expect(out.downtimeRows).toHaveLength(1);
    assert.exists(out.downtimeRows[0]);
    expect(out.downtimeRows[0].what).toBe('Low cast efficiency');
    expect(out.offensiveRows).toHaveLength(1);
    expect(out.offensiveRows[0]).toMatchObject({ name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: 'sb', chip: 'late' });
    expect(out.onPlan).toEqual([{ name: 'Vanish', spellId: VANISH, icon: 'vanish' }]);
  });
});

describe('rotation finding partition and row builders', () => {
  const abilities = { [SHADOW_BLADES]: { icon: 'sb', name: 'Shadow Blades' }, [VANISH]: { icon: 'vanish', name: 'Vanish' } };
  const downtimeFinding: AnalysisFinding = { severity: tone('amber'), category: 'cast_efficiency', label: 'Low cast efficiency', message: 'You were casting 80.0% of the fight.', measured: { value: '80.0%' }, details: { remedy: 'fix' }, occurrences: [] };
  const issueFinding: AnalysisFinding = { severity: tone('amber'), category: 'cooldown_delay', cd_name: 'Shadow Blades', message: 'Shadow Blades was first used at 0:04.', measured: { value: '+3s' }, timestamp_s: 4, occurrences: [] };
  const holdFinding: AnalysisFinding = { severity: tone('blue'), category: 'cooldown_hold', message: '', measured: { value: '1:00' }, details: { cd_name: 'Shadow Blades', remedy: 'hold' }, occurrences: [] };
  const onPlanFinding = vanishOnPlan;

  it('partitions downtime findings, per-cd buckets, and on-plan names', () => {
    const partition = svc['partitionRotationFindings']([downtimeFinding, issueFinding, holdFinding, onPlanFinding]);
    expect(partition.downtimeFindings).toEqual([downtimeFinding]);
    assert.exists(partition.byName['Shadow Blades']);
    expect(partition.byName['Shadow Blades'].issues).toEqual([issueFinding]);
    assert.exists(partition.byName['Shadow Blades']);
    expect(partition.byName['Shadow Blades'].holds).toEqual([holdFinding]);
    expect([...partition.onPlanNames]).toEqual(['Vanish']);
  });

  it('builds a downtime row carrying the finding label, sentence, remedy and category chip', () => {
    const rows = svc['buildDowntimeRows']([downtimeFinding]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ what: 'Low cast efficiency', message: downtimeFinding.message, fix: 'fix', chip: 'downtime' });
  });

  it('keeps the blue tone on a downtime row', () => {
    expect(svc['buildDowntimeRows']([{ ...downtimeFinding, severity: tone('blue') }])[0]).toMatchObject({ severity: 'blue' });
  });

  it('builds offensive rows with resolved icon + chip per finding', () => {
    const rows = svc['buildOffensiveRows']({ 'Shadow Blades': { issues: [issueFinding], holds: [] } }, { 'Shadow Blades': SHADOW_BLADES }, abilities);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Shadow Blades', spellId: SHADOW_BLADES, icon: 'sb', chip: 'late', severity: 'amber' });
  });

  it('carries the finding sentence on an offensive row', () => {
    const rows = svc['buildOffensiveRows']({ 'Shadow Blades': { issues: [issueFinding], holds: [] } }, { 'Shadow Blades': SHADOW_BLADES }, abilities);
    expect(rows[0]?.message).toBe(issueFinding.message);
  });

  it('keeps a red issue finding red in the offensive row', () => {
    const redFinding: AnalysisFinding = { ...issueFinding, severity: tone('red'), category: 'lost_cooldown' };
    const rows = svc['buildOffensiveRows']({ 'Shadow Blades': { issues: [redFinding], holds: [] } }, { 'Shadow Blades': SHADOW_BLADES }, abilities);
    expect(rows[0]).toMatchObject({ severity: 'red', chip: 'lost cast' });
  });

  it('keeps a blue hold blue in the offensive row', () => {
    const rows = svc['buildOffensiveRows']({ 'Shadow Blades': { issues: [], holds: [holdFinding] } }, { 'Shadow Blades': SHADOW_BLADES }, abilities);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ severity: 'blue', chip: 'hold until' });
  });

  it('builds an offensive row with an empty icon and the raw cd name when its spell id is missing from the ability map', () => {
    // SECRET_TECHNIQUE is deliberately absent from `abilities`, so the guarded lookup must not throw.
    const missingIdFinding: AnalysisFinding = { ...issueFinding, cd_name: 'Secret Move' };
    const rows = svc['buildOffensiveRows']({ 'Secret Move': { issues: [missingIdFinding], holds: [] } }, { 'Secret Move': SECRET_TECHNIQUE }, abilities);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: 'Secret Move', spellId: SECRET_TECHNIQUE, icon: '' });
  });

  it('builds on-plan chips only for cooldowns with nothing flagged', () => {
    const clean = svc['partitionRotationFindings']([onPlanFinding]);
    expect(svc['buildOnPlanChips'](clean, { 'Vanish': VANISH }, abilities)).toEqual([{ name: 'Vanish', spellId: VANISH, icon: 'vanish' }]);
    const dirty = svc['partitionRotationFindings']([onPlanFinding, { ...issueFinding, cd_name: 'Vanish' }]);
    expect(svc['buildOnPlanChips'](dirty, { 'Vanish': VANISH }, abilities)).toEqual([]);
  });
});
