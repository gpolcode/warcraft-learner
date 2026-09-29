import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { SHADOW_DANCE, SECRET_TECHNIQUE, RUPTURE } from '../../../../../../testing/spell-ids';
import { SimcAplService } from '../../simc/simc-apl-service';
import { ListTextService } from './list-text-service';
import { priorityList } from './priority-list-harness';
import { UNKNOWN, Range } from './priority-list.models';

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
/** The value of a term that tests `name` for truth alone, as `name` or `!name` does. */
const tested = (name: string, range: Range): string => value(name, range, true);

const ON: Range = [1, 1];
const OFF: Range = [0, 0];
/** The log bounds the flag but cannot say which way it went. */
const ON_OR_OFF: Range = [0, 1];
/** Every count in the span holds, so the log settles the flag though not the count. */
const ONE_TO_THREE_STACKS: Range = [1, 3];
const THREE: Range = [3, 3];
const FOUR_S_LEFT: Range = [4, 4];

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

  it('reads a shot in the air, a sigil about to go off and what a button costs', () => {
    expect(phrase('action.rupture.in_flight')).toBe('while Rupture is in the air');
    expect(phrase('!in_flight', true, 'rupture')).toBe('while Rupture is not in the air');
    expect(phrase('action.rupture.placed', false)).toBe('while Rupture is not about to go off');
    expect(phrase('action.rupture.in_flight_remains<0.3')).toBe('with under 0.3 s until Rupture lands');
    expect(phrase('action.rupture.cost>1')).toBe('when Rupture costs over 1');
  });

  it('reads the fight style as a raid boss or a dungeon', () => {
    expect(phrase('fight_style.patchwerk')).toBe('against a raid boss');
    expect(phrase('fight_style.dungeonslice', false)).toBe('outside a dungeon');
  });

  it('shows a term no phrase covers as SimC wrote it, and its negation with unless', () => {
    expect(phrase('movement.distance>20')).toBe('when `movement.distance>20` holds');
    expect(phrase('movement.distance>20', false)).toBe('unless `movement.distance>20` holds');
    expect(phrase('!set_bonus.midnight_season_2_4pc')).toBe('unless `set_bonus.midnight_season_2_4pc` holds');
  });

  it('shows only the operand no phrase covers as SimC wrote it inside a compound', () => {
    expect(phrase('buff.shadow_dance.up|movement.distance>20')).toBe('either while Shadow Dance is up or when `movement.distance>20` holds');
  });

  it('reads a flag the list takes off a number as one less, showing one no phrase covers as SimC wrote it', () => {
    expect(phrase('combo_points>=cp_max_spend-!buff.darkest_night.up')).toBe('at full combo points (one less while Darkest Night is down)');
    expect(phrase('active_enemies<=2-set_bonus.midnight_season_2_2pc')).toBe('on 2 or fewer enemies (one less when `set_bonus.midnight_season_2_2pc` holds)');
  });

  it('shows a term that takes an amount off a number as SimC wrote it, never as one less', () => {
    expect(phrase('cooldown.secret_technique.remains<=12-gcd.max')).toBe('when `cooldown.secret_technique.remains<=12-gcd.max` holds');
  });
});

describe('ListTextService values', () => {
  it('reads a count in its own units, one of them singular', () => {
    expect(value('combo_points', [5, 5])).toBe('5 combo points');
    expect(value('active_enemies', [1, 1])).toBe('1 enemy');
  });

  it('reads a buff flag as up or down, whichever field names it', () => {
    expect(tested('buff.shadow_dance.up', ON)).toBe('Up');
    expect(tested('buff.shadow_dance.up', OFF)).toBe('Down');
    expect(tested('buff.shadow_dance.down', ON)).toBe('Down');
    expect(tested('buff.shadow_dance.down', OFF)).toBe('Up');
  });

  it('reads a negated flag by the state of what it negates, so a missed cast never shows a value that agrees with its phrase', () => {
    expect(phrase('!cooldown.shadow_dance.ready')).toBe('while Shadow Dance is on cooldown');
    expect(tested('cooldown.shadow_dance.ready', ON)).toBe('Ready');
    expect(tested('cooldown.shadow_dance.ready', OFF)).toBe('On cooldown');
  });

  it('reads a dot as on or off the target, and its pandemic window by what is left', () => {
    expect(tested('dot.rupture.ticking', ON)).toBe('On the target');
    expect(tested('dot.rupture.ticking', OFF)).toBe('Not on the target');
    expect(tested('dot.rupture.down', ON)).toBe('Not on the target');
    expect(tested('dot.rupture.refreshable', ON)).toBe('Under 30% left');
    expect(tested('dot.rupture.refreshable', OFF)).toBe('Over 30% left');
  });

  it('reads a talent and a hero tree as picked or not', () => {
    expect(tested('talent.deathstalkers_mark', ON)).toBe('Picked');
    expect(tested('hero_tree.trickster', OFF)).toBe('Not picked');
  });

  it('reads the last presses and a repeat as states, never as counts', () => {
    expect(tested('prev_gcd.1.shadow_dance', ON)).toBe('Last press');
    expect(tested('prev.shadow_dance', OFF)).toBe('Not last press');
    expect(tested('prev_gcd.2.shadow_dance', ON)).toBe('2 presses back');
    expect(tested('prev_gcd.2.shadow_dance', OFF)).toBe('Not 2 presses back');
    expect(tested('combo_strike', ON)).toBe('Not a repeat');
    expect(tested('combo_strike', OFF)).toBe('Repeats last press');
  });

  it('reads a variable tested alone as holding or not, and one compared as its number', () => {
    expect(tested('variable.pool', ON)).toBe('Holds');
    expect(tested('variable.pool', OFF)).toBe('Does not hold');
    expect(value('variable.pool', THREE)).toBe('3');
  });

  it('reads the fight style and the pulls a fight brings as a raid boss or a dungeon', () => {
    expect(tested('fight_style.patchwerk', ON)).toBe('Raid boss');
    expect(tested('fight_style.dungeonslice', OFF)).toBe('Raid');
    expect(tested('raid_event.pull.exists', OFF)).toBe('Raid');
    expect(tested('raid_event.adds.exists', OFF)).toBe('No adds');
  });

  it('reads a name no flag phrase covers as holding or not, and one with a unit as its count', () => {
    expect(tested('cooldown.shadow_dance.usable', ON)).toBe('Holds');
    expect(tested('buff.shadow_dance.remains', FOUR_S_LEFT)).toBe('4 s left');
  });

  it('reads a stack count tested alone as up once every count in its span holds, and as could be either while it may be none', () => {
    expect(tested('buff.shadow_dance.react', ONE_TO_THREE_STACKS)).toBe('Up');
    expect(tested('buff.shadow_dance.react', ON_OR_OFF)).toBe('Could be either');
    expect(value('buff.shadow_dance.react', THREE)).toBe('3 stacks');
  });

  it('reads a flag the log cannot settle as could be either', () => {
    expect(tested('cooldown.shadow_dance.ready', ON_OR_OFF)).toBe('Could be either');
  });

  it('reads a bounded value as its span, one the log cannot settle as such, and one no fact reads as unsupported', () => {
    expect(value('cooldown.shadow_dance.remains', [2, 6])).toBe('2 to 6 s away');
    expect(value('cooldown.shadow_dance.remains', UNKNOWN)).toBe('not in the log');
    expect(value('raid_event.movement.in', UNKNOWN)).toBe('not supported by warcraft-learner');
  });
});
