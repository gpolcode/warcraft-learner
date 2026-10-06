import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { APL_NAMES } from '../../../../../../testing/apl-names';
import { planSpell } from '../../../../../../testing/builders/spec-plan';
import { SHADOW_DANCE, SECRET_TECHNIQUE, RUPTURE } from '../../../../../../testing/spell-ids';
import { SimcAplService } from '../../simc/simc-apl-service';
import { FactPaths } from './fact-path';
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

const ON: Range = [1, 1];
const OFF: Range = [0, 0];
/** The log bounds the flag but cannot say which way it went. */
const ON_OR_OFF: Range = [0, 1];
/** Every count in the span holds, so the log settles the flag though not the count. */
const ONE_TO_THREE_STACKS: Range = [1, 3];
const THREE: Range = [3, 3];
const FOUR_S_LEFT: Range = [4, 4];
/** Gear names read once the log's gear is read; until then they are the one gap besides SimC's own class code. */
const GEAR = /^(trinket|this_trinket|other_trinket|equipped|set_bonus|potion|consumable|main_hand|off_hand)\./;
/** The names the current lists use that no row answers: SimC's own class code and sim settings, each phrased by its words. */
const UNREAD_NAMES = [
  'action.shadow_dance.damage', 'action.shadow_dance.demonsurge_available', 'action.shadow_dance.enabled', 'action.shadow_dance.souls_consumed',
  'consecration.up', 'death_knight.first_ams_cast', 'demonic_art', 'dot_refreshable_count.immolate', 'dot_refreshable_count.wither', 'druid.no_cds',
  'druid.time_spend_healing', 'eclipse.lunar', 'eclipse.solar', 'evoker.allied_cds_up', 'evoker.shifting_buffs', 'firestarter.active', 'holy_bulwark',
  'hot_streak_spells_in_flight', 'howl_summon.ready', 'lightning_rod', 'max_prio_damage', 'movement.distance', 'next_armament', 'priest.force_devour_matter',
  'priority_rotation', 'rtb_buffs', 'scorch_execute.active', 'soul_fragments', 'soul_fragments.inactive', 'soul_fragments.total', 'spell_haste',
  'stat.crit_rating', 'stat.haste_rating', 'stat.versatility_rating', 'stealthed.rogue', 'target.distance', 'target.has_absorb', 'target.role.attack',
  'target.role.dps', 'target.role.heal', 'target.role.spell', 'target.role.tank', 'target.spec.arcane', 'target.spec.augmentation', 'target.spec.marksmanship',
  'target.spec.subtlety', 'target_cd_remains', 'ti_chain_lightning', 'ti_lightning_bolt', 'void_metamorphosis_base_drain_ps',
];

describe('ListTextService phrases', () => {
  it.each<[term: string, words: string, holds?: boolean, action?: string]>([
    ['buff.shadow_dance.up', 'while Shadow Dance is up'],
    ['!buff.shadow_dance.up', 'while Shadow Dance is down'],
    ['buff.shadow_dance.react', 'while Shadow Dance is up'],
    ['!buff.shadow_dance.remains', 'while Shadow Dance is down'],
    ['combo_points>=6', 'with 6+ combo points'],
    ['combo_points>=6', 'with under 6 combo points', false],
    ['combo_points>=cp_max_spend', 'with full combo points'],
    ['combo_points>=cp_max_spend-!buff.darkest_night.up', 'with full combo points (one less while Shadow Dance is up)'.replace('Shadow Dance is up', 'Darkest Night is down')],
    ['energy.deficit>=40', 'with 40+ energy missing'],
    ['energy.pct<50', 'with under 50% energy'],
    ['active_enemies>=3', 'on 3+ enemies'],
    ['active_enemies>2', 'on 3+ enemies'],
    ['active_enemies=1', 'on a single enemy'],
    ['active_enemies>=2', 'on a single enemy', false],
    ['spell_targets.shuriken_storm>=3', 'on 3+ enemies'],
    ['cooldown.secret_technique.remains>=3', 'when Secret Technique is at least 3 s away'],
    ['cooldown.shadow_dance.ready', 'while Shadow Dance is ready'],
    ['!cooldown.shadow_dance.ready', 'while Shadow Dance is on cooldown'],
    ['cooldown.shadow_dance.remains', 'while Shadow Dance is on cooldown'],
    ['cooldown.shadow_dance.remains<=gcd.max', 'when Shadow Dance is at most one GCD away'],
    ['cooldown.shadow_dance.charges>=1', 'with 1+ Shadow Dance charges'],
    ['fight_remains<20', 'in the last 20 s of the fight'],
    ['time<20', 'in the first 20 s of the fight'],
    ['target.time_to_die<10', 'when the target has under 10 s to live'],
    ['target.health.pct<20', 'with under 20% target health'],
    ['dot.rupture.refreshable', 'while Rupture is in its last 30%'],
    ['refreshable', 'while Rupture is in its last 30%', true, 'rupture'],
    ['!refreshable', 'while Rupture is not yet in its last 30%', true, 'rupture'],
    ['dot.rupture.ticking', 'while Rupture is on the target'],
    ['dot.rupture.ticks_remain<=2', 'with at most 2 Rupture ticks left'],
    ['buff.shadow_dance.remains<gcd.max*2', 'with under 2 GCDs of Shadow Dance left'],
    ['buff.shadow_dance.duration>8', "with over 8 s of Shadow Dance's duration"],
    ['buff.shadow_dance.last_trigger>3', 'with over 3 s since Shadow Dance last triggered'],
    ['buff.shadow_dance.up|combo_points>=6', 'either while Shadow Dance is up or with 6+ combo points'],
    ['!(buff.shadow_dance.up|combo_points>=6)', 'neither while Shadow Dance is up nor with 6+ combo points'],
    ['prev_gcd.1.shadow_dance', 'while Shadow Dance is the last press'],
    ['prev_gcd.2.shadow_dance', 'while Shadow Dance is 2 presses back'],
    ['combo_strike', 'while Black Powder is not a repeat'],
    ['!hero_tree.trickster', 'while the Trickster hero tree is not picked'],
    ['talent.deathstalkers_mark.rank>=2', "with 2+ Deathstalker's Mark ranks"],
    ['!apex.2', 'while apex tier 2 is not picked'],
    ['raid_event.adds.in>20', 'when adds are over 20 s away'],
    ['raid_event.adds.in<10', 'when adds come within 10 s'],
    ['!raid_event.adds.exists', 'while in a fight without adds'],
    ['raid_event.adds.remains<5', 'with under 5 s of adds left'],
    ['raid_event.movement.in<3', 'when your next move is under 3 s away'],
    ['variable.pool_energy', 'while pool energy holds'],
    ['variable.targets>2', 'with targets over 2'],
    ['action.rupture.in_flight', 'while Rupture is in the air'],
    ['!in_flight', 'while Rupture is not in the air', true, 'rupture'],
    ['action.rupture.placed', 'while Rupture is not placed', false],
    ['action.rupture.in_flight_remains<0.3', 'with under 0.3 s until Rupture lands'],
    ['action.rupture.cost>1', "with Rupture's cost over 1"],
    ['cast_time>1', 'with over 1 s to cast Rupture', true, 'rupture'],
    ['gcd.remains>0.5', 'with over 0.5 s left on the GCD'],
    ['fight_style.patchwerk', 'while against a raid boss'],
    ['fight_style.dungeonslice', 'while in a raid', false],
    ['action.rupture.souls_consumed>=3', "with Rupture's souls consumed at least 3"],
    ['movement.distance>20', 'with movement distance over 20'],
    ['movement.distance>20', 'with movement distance at most 20', false],
    ['void_metamorphosis_base_drain_ps', 'while void metamorphosis base drain ps holds'],
    ['trinket.1.has_use_buff', 'while trinket 1 has use buff holds'],
  ])('reads %s as "%s"', (term, words, holds = true, action = 'black_powder') => {
    expect(phrase(term, holds, action)).toBe(words);
  });

  it('reads every name shape the current lists use in words, with no SimC syntax left in them', () => {
    const syntax = /[_.]/;
    for (const name of APL_NAMES) {
      for (const sentence of [phrase(name), phrase(name, false), phrase(`${name}>=1`)]) expect(sentence, `${name} reads as "${sentence}"`).not.toMatch(syntax);
    }
  });

  it('leaves exactly the gear names and SimC\'s class code outside the catalog', () => {
    const unread = APL_NAMES.filter(name => !FactPaths.row(FactPaths.path(name, 'black_powder')));
    expect(unread.filter(name => !GEAR.test(name))).toEqual(UNREAD_NAMES);
  });
});

describe('ListTextService values', () => {
  /** A term tested for truth alone, as `name` or `!name` does, shows a state; one compared shows its count. */
  it.each<[term: string, range: Range, shown: string, tested?: boolean]>([
    ['combo_points', [5, 5], '5 combo points'],
    ['active_enemies', [1, 1], '1 enemy'],
    ['active_enemies', [1, Infinity], '1+ enemies'],
    ['cooldown.shadow_dance.charges', [1, 1], '1 charge'],
    ['buff.shadow_dance.up', ON, 'Up', true],
    ['buff.shadow_dance.up', OFF, 'Down', true],
    ['buff.shadow_dance.down', ON, 'Down', true],
    ['buff.shadow_dance.down', OFF, 'Up', true],
    ['cooldown.shadow_dance.ready', ON, 'Ready', true],
    ['cooldown.shadow_dance.ready', OFF, 'On cooldown', true],
    ['cooldown.shadow_dance.ready', ON_OR_OFF, 'Could be either', true],
    ['cooldown.shadow_dance.usable', ON, 'Ready', true],
    ['dot.rupture.ticking', ON, 'On the target', true],
    ['dot.rupture.ticking', OFF, 'Not on the target', true],
    ['dot.rupture.down', ON, 'Down', true],
    ['dot.rupture.refreshable', ON, 'In its last 30%', true],
    ['dot.rupture.refreshable', OFF, 'Not yet in its last 30%', true],
    ['talent.deathstalkers_mark', ON, 'Picked', true],
    ['hero_tree.trickster', OFF, 'Not picked', true],
    ['prev_gcd.1.shadow_dance', ON, 'The last press', true],
    ['prev.shadow_dance', OFF, 'Not the last press', true],
    ['prev_gcd.2.shadow_dance', ON, '2 presses back', true],
    ['prev_gcd.2.shadow_dance', OFF, 'Not 2 presses back', true],
    ['combo_strike', ON, 'Not a repeat', true],
    ['combo_strike', OFF, 'A repeat of your last press', true],
    ['variable.pool', ON, 'Holds', true],
    ['variable.pool', OFF, 'Does not hold', true],
    ['variable.pool', THREE, '3'],
    ['fight_style.patchwerk', ON, 'Against a raid boss', true],
    ['fight_style.dungeonslice', OFF, 'In a raid', true],
    ['raid_event.pull.exists', OFF, 'In a raid', true],
    ['raid_event.adds.exists', OFF, 'In a fight without adds', true],
    ['buff.shadow_dance.remains', FOUR_S_LEFT, '4 s left'],
    ['buff.shadow_dance.react', ONE_TO_THREE_STACKS, 'Up', true],
    ['buff.shadow_dance.react', ON_OR_OFF, 'Could be either', true],
    ['buff.shadow_dance.react', THREE, '3 stacks'],
    ['target.health.pct', [18, 18], '18%'],
    ['cast_time', [1.5, 1.5], '1.5 s'],
    ['cooldown.shadow_dance.remains', [2, 6], '2 to 6 s away'],
    ['void_metamorphosis_base_drain_ps', ON, 'Holds', true],
    ['cooldown.shadow_dance.remains', UNKNOWN, 'Not in the log'],
    ['raid_event.movement.in', UNKNOWN, 'Not in the log'],
    ['stat.haste_rating', UNKNOWN, 'Not read by warcraft-learner'],
  ])('shows %s at %j as "%s"', (term, range, shown, tested = false) => {
    expect(value(term, range, tested)).toBe(shown);
  });
});
