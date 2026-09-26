import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { SHADOW_DANCE, SECRET_TECHNIQUE, RUPTURE } from '../../../../../../testing/spell-ids';
import { SimcAplService } from '../../simc/simc-apl-service';
import { ListCheckService } from './list-check-service';
import { ListTextService } from './list-text-service';
import { priorityList } from './priority-list-harness';
import type { Range } from './priority-list.models';

const list = priorityList({
  lines: [
    { action: 'black_powder', terms: ['talent.deathstalkers_mark', 'combo_points>=cp_max_spend-!buff.darkest_night.up', 'active_enemies>=2'] },
    { action: 'backstab', terms: [] },
  ],
  spells: {
    shadow_dance: planSpell('Shadow Dance', [SHADOW_DANCE]),
    secret_technique: planSpell('Secret Technique', [SECRET_TECHNIQUE]),
    darkest_night: planSpell('Darkest Night', [457058]),
    black_powder: planSpell('Black Powder', [319175]),
    rupture: planSpell('Rupture', [RUPTURE]),
  },
  talents: { 'talent.deathstalkers_mark': { name: "Deathstalker's Mark", entries: [1] }, 'hero_tree.trickster': { name: 'Trickster', entries: [2] } },
});
const text = TestBed.inject(ListTextService);
const apl = TestBed.inject(SimcAplService);
const lines = TestBed.inject(ListCheckService).buttons(list);

const phrase = (term: string, holds = true, action = 'black_powder'): string => {
  const node = apl.parse(term);
  if (!node) throw new Error(`unreadable ${term}`);
  return text.phrase(list, node, holds, action);
};
const value = (term: string, range: Range, flag = false): string => {
  const node = apl.parse(term);
  if (!node) throw new Error(`unreadable ${term}`);
  return text.value(node, range, flag);
};
const lineOf = (action: string) => {
  const [line] = lines.get(action) ?? [];
  if (!line) throw new Error(`no ${action} line`);
  return line;
};

describe('ListTextService sentences', () => {
  it('reads a line with its talent up front and its moment terms joined', () => {
    expect(text.sentence(list, lineOf('black_powder'))).toBe(
      "With Deathstalker's Mark: at full combo points (one less while Darkest Night is down) and on 2+ enemies");
  });

  it('leaves the talent out where the player has it', () => {
    expect(text.sentence(list, lineOf('black_powder'), true)).toBe(
      'at full combo points (one less while Darkest Night is down) and on 2+ enemies');
  });

  it('reads a line with no condition as press when ready', () => {
    expect(text.sentence(list, lineOf('backstab'))).toBe('whenever it is ready');
  });
});

describe('ListTextService phrases', () => {
  it('reads a buff flag and its negation', () => {
    expect(phrase('buff.shadow_dance.up')).toBe('while Shadow Dance is up');
    expect(phrase('!buff.shadow_dance.up')).toBe('while Shadow Dance is down');
  });

  it('reads a pool against the list\'s number, and flips it to name a miss', () => {
    expect(phrase('combo_points>=6')).toBe('at 6+ combo points');
    expect(phrase('combo_points>=6', false)).toBe('at under 6 combo points');
    expect(phrase('energy.deficit>=40')).toBe('with 40+ energy missing');
  });

  it('reads an enemy count, a single enemy included', () => {
    expect(phrase('active_enemies>=3')).toBe('on 3+ enemies');
    expect(phrase('active_enemies>2')).toBe('on 3+ enemies');
    expect(phrase('active_enemies=1')).toBe('on a single enemy');
    expect(phrase('active_enemies>=2', false)).toBe('on a single enemy');
  });

  it('reads cooldowns, the fight clock and target health', () => {
    expect(phrase('cooldown.secret_technique.remains>=3')).toBe('when Secret Technique is at least 3 s away');
    expect(phrase('cooldown.shadow_dance.ready')).toBe('when Shadow Dance is ready');
    expect(phrase('fight_remains<20')).toBe('in the last 20 s of the fight');
    expect(phrase('target.health.pct<20')).toBe('below 20% target health');
  });

  it('reads a dot\'s pandemic window and a bare name as the line\'s own button\'s', () => {
    expect(phrase('dot.rupture.refreshable')).toBe('once Rupture is in its last 30%');
    expect(phrase('refreshable', true, 'rupture')).toBe('once Rupture is in its last 30%');
  });

  it('reads a list number in GCDs', () => {
    expect(phrase('buff.shadow_dance.remains<gcd.max*2')).toBe('with under 2 GCDs of Shadow Dance left');
  });

  it('reads an or as either one, and its negation as neither', () => {
    expect(phrase('buff.shadow_dance.up|combo_points>=6')).toBe('either while Shadow Dance is up or at 6+ combo points');
    expect(phrase('!(buff.shadow_dance.up|combo_points>=6)')).toBe('neither while Shadow Dance is up nor at 6+ combo points');
  });

  it('reads the previous cast and a hero tree', () => {
    expect(phrase('prev_gcd.1.shadow_dance')).toBe('right after Shadow Dance');
    expect(phrase('!hero_tree.trickster')).toBe('without the Trickster hero tree');
  });

  it('reads the adds a fight brings, a move to come and whether the target is casting', () => {
    expect(phrase('raid_event.adds.in>20')).toBe('when adds are over 20 s away');
    expect(phrase('raid_event.adds.in<10')).toBe('when adds come within 10 s');
    expect(phrase('!raid_event.adds.exists')).toBe('in a fight without adds');
    expect(phrase('raid_event.adds.remains<5')).toBe('with under 5 s of adds left');
    expect(phrase('raid_event.movement.in<3')).toBe('when you must move within 3 s');
    expect(phrase('target.debuff.casting.react')).toBe('while the target is casting');
  });

  it('reads a variable the list keeps by its own name', () => {
    expect(phrase('variable.pool_energy')).toBe('when pool energy holds');
    expect(phrase('variable.targets>2')).toBe('with targets over 2');
  });

  it('reads a term no phrase covers as another condition, never as SimC wrote it', () => {
    expect(phrase('movement.distance>20')).toBe('when another condition holds');
    expect(phrase('movement.distance>20', false)).toBe('unless another condition holds');
  });
});

describe('ListTextService values', () => {
  it('reads a count in its own units, one of them singular', () => {
    expect(value('combo_points', [5, 5])).toBe('5 combo points');
    expect(value('active_enemies', [1, 1])).toBe('1 enemy');
  });

  it('reads a flag and a talent in words', () => {
    expect(value('buff.shadow_dance.up', [0, 0])).toBe('no');
    expect(value('variable.pool', [1, 1], true)).toBe('yes');
    expect(value('talent.deathstalkers_mark', [1, 1])).toBe('picked');
  });

  it('reads a bounded value as its span and an unknown one as such', () => {
    expect(value('cooldown.shadow_dance.remains', [2, 6])).toBe('2 to 6 s away');
    expect(value('raid_event.movement.in', [-Infinity, Infinity])).toBe('not in the log');
  });
});
