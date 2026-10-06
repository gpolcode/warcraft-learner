import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { APL_NAMES } from '../../../../../../testing/apl-names';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { SHADOW_DANCE, SECRET_TECHNIQUE, RUPTURE } from '../../../../../../testing/spell-ids';
import { SimcAplService } from '../../simc/simc-apl-service';
import { FactCatalogService } from './fact-catalog-service';
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
const catalog = TestBed.inject(FactCatalogService);

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
/** The names the current lists use that no reader answers: SimC's own class code and sim settings, each phrased by its words. */
const UNREAD_NAMES = [
  'action.shadow_dance.damage', 'action.shadow_dance.demonsurge_available', 'action.shadow_dance.enabled', 'action.shadow_dance.souls_consumed',
  'consecration.up', 'death_knight.first_ams_cast', 'demonic_art', 'dot_refreshable_count.immolate', 'dot_refreshable_count.wither', 'druid.no_cds',
  'druid.time_spend_healing', 'eclipse.lunar', 'eclipse.solar', 'evoker.allied_cds_up', 'evoker.shifting_buffs', 'firestarter.active', 'holy_bulwark',
  'hot_streak_spells_in_flight', 'howl_summon.ready', 'lightning_rod', 'max_prio_damage', 'movement.distance', 'next_armament', 'priest.force_devour_matter',
  'priority_rotation', 'raid_event.movement.distance', 'rtb_buffs', 'scorch_execute.active', 'soul_fragments', 'soul_fragments.inactive', 'soul_fragments.total',
  'spell_haste', 'stat.crit_rating', 'stat.haste_rating', 'stat.versatility_rating', 'stealthed.rogue', 'target.distance', 'target.has_absorb',
  'target.role.attack', 'target.role.dps', 'target.role.heal', 'target.role.spell', 'target.role.tank', 'target.spec.arcane', 'target.spec.augmentation',
  'target.spec.marksmanship', 'target.spec.subtlety', 'target_cd_remains', 'ti_chain_lightning', 'ti_lightning_bolt', 'void_metamorphosis_base_drain_ps',
];

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
    expect(phrase('target.debuff.casting.react')).toBe('while casting is on the target');
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

  it('reads the player\'s gear by slot and by name', () => {
    expect(phrase('trinket.1.cooldown.remains<=gcd.max')).toBe('when your first trinket is at most one GCD away');
    expect(phrase('trinket.2.is.spymasters_web')).toBe('with spymasters web as your second trinket');
    expect(phrase('!equipped.spymasters_web')).toBe('without spymasters web equipped');
    expect(phrase('trinket.1.has_use_buff')).toBe('with an on-use buff on your first trinket');
    expect(phrase('set_bonus.mid2_4pc')).toBe('with the mid2 4pc set bonus');
  });

  it('reads a field the log never carries in words all the same', () => {
    expect(phrase('dot.rupture.ticks_remain<=2')).toBe('at 2 or fewer Rupture ticks left');
    expect(phrase('buff.shadow_dance.last_trigger>3')).toBe('with over 3 s since Shadow Dance last triggered');
    expect(phrase('talent.deathstalkers_mark.rank>=2')).toBe("at 2+ Deathstalker's Mark ranks");
    expect(phrase('buff.shadow_dance.duration>8')).toBe("with Shadow Dance's duration over 8 s");
  });

  it('reads a name outside the catalog by its own words, never as SimC wrote it', () => {
    expect(phrase('action.rupture.souls_consumed>=3')).toBe("with Rupture's souls consumed at least 3");
    expect(phrase('movement.distance>20')).toBe('with movement distance over 20');
    expect(phrase('movement.distance>20', false)).toBe('with movement distance at most 20');
    expect(phrase('void_metamorphosis_base_drain_ps')).toBe('when void metamorphosis base drain ps holds');
    expect(phrase('!apex.2')).toBe('without apex tier 2');
  });

  it('reads a measure tested alone as being above zero', () => {
    expect(phrase('cooldown.shadow_dance.remains')).toBe("while Shadow Dance's cooldown is above zero");
    expect(phrase('!buff.shadow_dance.remains')).toBe("while Shadow Dance's time left is zero");
  });

  it('reads every name shape the current lists use in words, with no SimC syntax left in them', () => {
    const syntax = /[_.]/;
    for (const name of APL_NAMES) {
      for (const sentence of [phrase(name), phrase(name, false), phrase(`${name}>=1`)]) expect(sentence, `${name} reads as "${sentence}"`).not.toMatch(syntax);
    }
  });

  it('leaves exactly SimC\'s class code and sim settings outside the catalog', () => {
    const unread = APL_NAMES.filter(name => !catalog.words(catalog.path(name, 'black_powder')));
    expect(unread).toEqual(UNREAD_NAMES);
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

  it('reads a flag by its own states, and a measure tested alone by its count', () => {
    expect(tested('cooldown.shadow_dance.usable', ON)).toBe('Ready');
    expect(tested('equipped.spymasters_web', ON)).toBe('Equipped');
    expect(tested('buff.shadow_dance.remains', FOUR_S_LEFT)).toBe('4 s left');
  });

  it('reads a name outside the catalog tested alone as holding or not', () => {
    expect(tested('void_metamorphosis_base_drain_ps', ON)).toBe('Holds');
    expect(tested('void_metamorphosis_base_drain_ps', OFF)).toBe('Does not hold');
  });

  it('reads a stack count tested alone as up once every count in its span holds, and as could be either while it may be none', () => {
    expect(tested('buff.shadow_dance.react', ONE_TO_THREE_STACKS)).toBe('Up');
    expect(tested('buff.shadow_dance.react', ON_OR_OFF)).toBe('Could be either');
    expect(value('buff.shadow_dance.react', THREE)).toBe('3 stacks');
  });

  it('reads a flag the log cannot settle as could be either', () => {
    expect(tested('cooldown.shadow_dance.ready', ON_OR_OFF)).toBe('Could be either');
  });

  it('reads a bounded value as its span, one the log cannot settle as such, and one no fact reads as unread', () => {
    expect(value('cooldown.shadow_dance.remains', [2, 6])).toBe('2 to 6 s away');
    expect(value('cooldown.shadow_dance.remains', UNKNOWN)).toBe('Not in the log');
    expect(value('raid_event.movement.in', UNKNOWN)).toBe('Not in the log');
    expect(value('stat.haste_rating', UNKNOWN)).toBe('Not read by warcraft-learner');
  });
});
