import { describe, it, expect } from 'vitest';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../testing/builders/events';
import { ConditionEvalService } from './condition-eval-service';
import { AuraFacts } from './facts/aura-facts';
import { BuildFacts } from './facts/build-facts';
import { CooldownFacts } from './facts/cooldown-facts';
import { FightFacts } from './facts/fight-facts';
import { GearFacts } from './facts/gear-facts';
import { PoolFacts } from './facts/pool-facts';
import { PressFacts } from './facts/press-facts';
import { castAt, factContext, priorityList } from './priority-list-harness';
import { UNKNOWN, FactKind, FactReader, Range } from './priority-list.models';

const CAST_S = 10;
const NEVER: Range = [Infinity, Infinity];
/** The primitives each row's SimC text is evaluated over, by `kind.field`. */
const given = new Map<string, Range>();
const fake = (kind: FactKind): FactReader => ({ kind, streams: () => [], read: path => given.get(`${kind}.${path.field}`) ?? UNKNOWN });
const FAKES: [Type<FactReader>, FactKind][] = [[AuraFacts, 'aura'], [CooldownFacts, 'cooldown'], [PoolFacts, 'pool'], [PressFacts, 'press'], [FightFacts, 'fight'], [BuildFacts, 'build'], [GearFacts, 'gear']];
TestBed.configureTestingModule({ providers: FAKES.map(([token, kind]) => ({ provide: token, useValue: fake(kind) })) });
const evaluator = TestBed.inject(ConditionEvalService);
const ctx = factContext(priorityList(), { casts: [cast(1, CAST_S)] });

interface Row {
  name: string;
  primitives: Record<string, number | Range>;
  expected: Range;
}

const read = ({ name, primitives }: Row): Range => {
  given.clear();
  for (const [key, value] of Object.entries(primitives)) given.set(key, typeof value === 'number' ? [value, value] : value);
  return evaluator.read(name, castAt(ctx, CAST_S), 'x', ctx);
};

describe('The field table', () => {
  it.each<Row>([
    { name: 'buff.x.down', primitives: { 'aura.up': 1 }, expected: [0, 0] },
    { name: 'buff.x.down', primitives: { 'aura.up': 0 }, expected: [1, 1] },
    { name: 'dot.x.ticking', primitives: { 'aura.up': 1 }, expected: [1, 1] },
    { name: 'buff.x.react', primitives: { 'aura.stack': 2 }, expected: [2, 2] },
    { name: 'buff.x.at_max_stacks', primitives: { 'aura.stack': 3, 'aura.max_stack': 3 }, expected: [1, 1] },
    { name: 'buff.x.at_max_stacks', primitives: { 'aura.stack': 2, 'aura.max_stack': 3 }, expected: [0, 0] },
    { name: 'dot.x.refreshable', primitives: { 'aura.up': 1, 'aura.remains': 4, 'aura.duration': 10 }, expected: [0, 0] },
    { name: 'dot.x.refreshable', primitives: { 'aura.up': 1, 'aura.remains': 2, 'aura.duration': 10 }, expected: [1, 1] },
    { name: 'dot.x.refreshable', primitives: { 'aura.up': 0, 'aura.remains': 0, 'aura.duration': 10 }, expected: [1, 1] },
    { name: 'dot.x.ticks_remain', primitives: { 'aura.remains': 4 }, expected: UNKNOWN },
    { name: 'dot.x.pmultiplier', primitives: { 'aura.up': 1 }, expected: UNKNOWN },
    { name: 'cooldown.x.ready', primitives: { 'cooldown.remains': 0 }, expected: [1, 1] },
    { name: 'cooldown.x.ready', primitives: { 'cooldown.remains': 5 }, expected: [0, 0] },
    { name: 'cooldown.x.ready', primitives: { 'cooldown.remains': [0, 5] }, expected: [0, 1] },
    { name: 'cooldown.x.up', primitives: { 'cooldown.remains': 0 }, expected: [1, 1] },
    { name: 'cooldown_react', primitives: { 'cooldown.remains': 0 }, expected: [1, 1] },
    { name: 'cooldown.x.cooldown', primitives: { 'cooldown.duration': 30 }, expected: [30, 30] },
    { name: 'cooldown.x.remains_expected', primitives: { 'cooldown.remains': 5 }, expected: [5, 5] },
    { name: 'energy.deficit', primitives: { 'pool.amount': 40, 'pool.max': 100 }, expected: [60, 60] },
    { name: 'energy.deficit', primitives: { 'pool.amount': [30, 50], 'pool.max': 100 }, expected: [50, 70] },
    { name: 'energy.pct', primitives: { 'pool.amount': 40, 'pool.max': 100 }, expected: [40, 40] },
    { name: 'energy.time_to_max', primitives: { 'pool.amount': 40, 'pool.max': 100, 'pool.regen': 10 }, expected: [6, 6] },
    { name: 'energy.time_to_max', primitives: { 'pool.amount': 40, 'pool.max': 100, 'pool.regen': 0 }, expected: UNKNOWN },
    { name: 'energy.base_deficit', primitives: { 'pool.amount': 40, 'pool.max': 100 }, expected: [60, 60] },
    { name: 'cp_max_spend', primitives: { 'pool.max': 7 }, expected: [7, 7] },
    { name: 'execute_time', primitives: { 'press.cast_time': 2, 'press.gcd': 1 }, expected: [2, 2] },
    { name: 'execute_time', primitives: { 'press.cast_time': 0.5, 'press.gcd': 1 }, expected: [1, 1] },
    { name: 'combo_strike', primitives: { 'press.prev_gcd': 0 }, expected: [1, 1] },
    { name: 'combo_strike', primitives: { 'press.prev_gcd': 1 }, expected: [0, 0] },
    { name: 'pet.x.active', primitives: { 'press.pet.remains': 5 }, expected: [1, 1] },
    { name: 'pet.x.active', primitives: { 'press.pet.remains': 0 }, expected: [0, 0] },
    { name: 'action.x.placed', primitives: { 'press.in_flight': 1 }, expected: [1, 1] },
    { name: 'gcd.max', primitives: { 'press.gcd': 1.5 }, expected: [1.5, 1.5] },
    { name: 'spell_targets.x', primitives: { 'fight.active_enemies': 3 }, expected: [3, 3] },
    { name: 'enemies', primitives: { 'fight.active_enemies': 3 }, expected: [3, 3] },
    { name: 'target.time_to_die', primitives: { 'fight.time_to_die': 20 }, expected: [20, 20] },
    { name: 'time_to_die.remains', primitives: { 'fight.time_to_die': 20 }, expected: [20, 20] },
    { name: 'in_combat', primitives: {}, expected: [1, 1] },
    { name: 'raid_event.pull.exists', primitives: {}, expected: [0, 0] },
    { name: 'raid_event.pull.in', primitives: {}, expected: NEVER },
    { name: 'raid_event.adds.has_boss', primitives: {}, expected: [0, 0] },
    { name: 'fight_style.patchwerk', primitives: {}, expected: [1, 1] },
    { name: 'fight_style.dungeonslice', primitives: {}, expected: [0, 0] },
    { name: 'raid_event.movement.in', primitives: {}, expected: UNKNOWN },
    { name: 'trinket.1.cooldown.ready', primitives: { 'gear.cooldown.remains': 0 }, expected: [1, 1] },
    { name: 'trinket.1.cooldown.up', primitives: { 'gear.cooldown.remains': 5 }, expected: [0, 0] },
    { name: 'consumable.x', primitives: { 'gear.potion': 1 }, expected: [1, 1] },
    { name: 'priority_rotation', primitives: {}, expected: [0, 0] },
    { name: 'death_knight.first_ams_cast', primitives: {}, expected: [20, 20] },
    { name: 'stat.haste_rating', primitives: {}, expected: UNKNOWN },
  ])('derives $name from $primitives', row => {
    expect(read(row)).toEqual(row.expected);
  });
});
