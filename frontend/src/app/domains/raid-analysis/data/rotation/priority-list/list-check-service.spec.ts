import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../testing/builders/events';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { BACKSTAB, EVISCERATE, SHADOW_DANCE } from '../../../../../../testing/spell-ids';
import type { PlanLine } from '../../plan/plan.models';
import type { WclEvent } from '../../wcl/wcl.models';
import { ListCheckService, LogReading } from './list-check-service';
import { LogEvents, factContext, priorityList } from './priority-list-harness';

const ENERGY = 3;
const COMBO_POINTS = 4;
const EVISCERATE_COST = 35;
const UNSEEN_BLADE_ENTRY = 117100;
const SHADOWSTRIKE = 185438;
const checks = TestBed.inject(ListCheckService);

const list = (lines: PlanLine[], over: { eviscerateCooldown?: number } = {}) => priorityList({
  lines,
  spells: {
    eviscerate: planSpell('Eviscerate', [EVISCERATE], { gcd: 1, costs: [{ type: ENERGY, amount: EVISCERATE_COST }], cooldown: over.eviscerateCooldown ?? 0 }),
    backstab: planSpell('Backstab', [BACKSTAB], { gcd: 1 }),
    shadowstrike: planSpell('Shadowstrike', [SHADOWSTRIKE], { gcd: 1 }),
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE], { gcd: 0 }),
  },
  talents: { 'talent.unseen_blade': { name: 'Unseen Blade', entries: [UNSEEN_BLADE_ENTRY] } },
});
const pooled = (spellId: number, atS: number, cp: number, energy = 50) =>
  cast(spellId, atS, { resources: [{ type: ENERGY, amount: energy, max: 100 }, { type: COMBO_POINTS, amount: cp, max: 7 }] });
const read = (lines: PlanLine[], casts: WclEvent[], log: LogEvents = {}, over = {}): LogReading =>
  checks.read(factContext(list(lines, over), { casts, talents: [], ...log }));

describe('ListCheckService cast check', () => {
  const EVISCERATE_LINES: PlanLine[] = [
    { action: 'eviscerate', terms: ['combo_points>=5'] },
    { action: 'eviscerate', terms: ['time>100', 'combo_points>=6'] },
  ];

  it('puts a cast on the list under the first line that holds', () => {
    const [check] = read(EVISCERATE_LINES, [pooled(EVISCERATE, 10, 5)]).casts.get('eviscerate') ?? [];
    expect(check).toMatchObject({ verdict: 'on', line: 0 });
  });

  it('puts a cast off the list when every line fails, closest to the line that fails the fewest terms', () => {
    const [check] = read(EVISCERATE_LINES, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check).toMatchObject({ verdict: 'off', line: 0 });
  });

  it('ranks a line of another build behind every line of the player\'s own', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['talent.unseen_blade'] }, { action: 'eviscerate', terms: ['combo_points>=5', 'time>100'] }];
    const [check] = read(lines, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check).toMatchObject({ verdict: 'off', line: 1 });
  });

  it('leaves a cast not judged when no line holds and one may', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['combo_points>=5|raid_event.adds.in>20'] }];
    const [check] = read(lines, [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check?.verdict).toBe('unjudged');
  });

  it('leaves a cast not judged under a line no parser reads', () => {
    const [check] = read([{ action: 'eviscerate', terms: null }], [pooled(EVISCERATE, 10, 3)]).casts.get('eviscerate') ?? [];
    expect(check?.verdict).toBe('unjudged');
  });

  it('reads whose build each line is from the log\'s talents', () => {
    const lines: PlanLine[] = [{ action: 'eviscerate', terms: ['talent.unseen_blade', 'combo_points>=5'] }, { action: 'eviscerate', terms: ['combo_points>=6'] }];
    expect(read(lines, [pooled(EVISCERATE, 10, 3)], { talents: [[UNSEEN_BLADE_ENTRY, 1]] }).builds.get('eviscerate')).toEqual(['true', 'true']);
    expect(read(lines, [pooled(EVISCERATE, 10, 3)]).builds.get('eviscerate')).toEqual(['false', 'true']);
  });
});

describe('ListCheckService order check', () => {
  const ORDER: PlanLine[] = [{ action: 'eviscerate', terms: ['combo_points>=5'] }, { action: 'backstab', terms: [] }];
  const EVISCERATE_PRESSED = pooled(EVISCERATE, 30, 5);
  const orderAt = (reading: LogReading, atS: number) => reading.order.find(check => check.atS === atS);

  it('names the higher button whose line held while it was ready as skipped for the one pressed', () => {
    expect(orderAt(read(ORDER, [pooled(BACKSTAB, 10, 5), EVISCERATE_PRESSED]), 10)).toMatchObject({ expected: 'eviscerate', pressed: 'backstab', line: 0 });
  });

  it('reads the pressed button as kept when its line led the list', () => {
    expect(orderAt(read(ORDER, [pooled(BACKSTAB, 10, 3), EVISCERATE_PRESSED]), 30)).toMatchObject({ expected: 'eviscerate', pressed: 'eviscerate' });
  });

  it('passes over a button still on cooldown', () => {
    const casts = [pooled(EVISCERATE, 5, 5), pooled(BACKSTAB, 10, 5), EVISCERATE_PRESSED];
    expect(orderAt(read(ORDER, casts, {}, { eviscerateCooldown: 30 }), 10)).toMatchObject({ expected: 'backstab', pressed: 'backstab' });
  });

  it('decides nothing while a line above may or may not hold', () => {
    const lines: PlanLine[] = [{ action: 'shadowstrike', terms: ['raid_event.adds.in>20'] }, ...ORDER];
    const casts = [cast(SHADOWSTRIKE, 1), pooled(BACKSTAB, 10, 5), EVISCERATE_PRESSED];
    expect(orderAt(read(lines, casts), 10)).toBeUndefined();
  });

  it('decides nothing when the pool may not cover the higher button\'s cost', () => {
    expect(orderAt(read(ORDER, [pooled(BACKSTAB, 10, 5, EVISCERATE_COST - 1), EVISCERATE_PRESSED]), 10)).toBeUndefined();
  });

  it('passes over a button the player never pressed this pull', () => {
    expect(orderAt(read(ORDER, [pooled(BACKSTAB, 10, 5)]), 10)).toMatchObject({ expected: 'backstab' });
  });

  it('reads no order at a cast off the global cooldown', () => {
    const lines: PlanLine[] = [{ action: 'shadow_dance', terms: [] }, ...ORDER];
    expect(orderAt(read(lines, [cast(SHADOW_DANCE, 10), EVISCERATE_PRESSED]), 10)).toBeUndefined();
  });
});

describe('ListCheckService.streams', () => {
  it('asks for the streams the list\'s facts read and no others', () => {
    const streams = (terms: string[]) => [...checks.streams(list([{ action: 'eviscerate', terms }]))];
    expect(streams(['active_enemies>=2'])).toEqual(['damage']);
    expect(streams(['buff.shadow_dance.up'])).toEqual([]);
  });
});
