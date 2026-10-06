import { describe, it, expect } from 'vitest';
import { FactPaths } from './fact-path';
import type { FactPath } from './priority-list.models';

const path = (name: string, action = 'x'): FactPath => FactPaths.path(name, action);

describe('FactPaths', () => {
  it.each<[name: string, path: Partial<FactPath>]>([
    ['buff.shadow_dance.up', { kind: 'aura', subject: 'shadow_dance', field: 'up', target: false }],
    ['target.debuff.rupture.remains', { kind: 'aura', subject: 'rupture', field: 'remains', target: true }],
    ['dot.rupture.ticking', { kind: 'aura', subject: 'rupture', field: 'ticking', target: true }],
    ['active_dot.rupture', { kind: 'aura', subject: 'rupture', field: 'active_dots', target: true }],
    ['remains', { kind: 'aura', subject: 'x', field: 'remains', target: true }],
    ['cooldown.shadow_dance.charges_fractional', { kind: 'cooldown', subject: 'shadow_dance', field: 'charges_fractional' }],
    ['target.cooldown.shadow_dance.remains', { kind: 'cooldown', subject: 'shadow_dance', field: 'remains' }],
    ['charges', { kind: 'cooldown', subject: 'x', field: 'charges' }],
    ['action.rupture.cost', { kind: 'pool', subject: 'rupture', field: 'cost' }],
    ['action.rupture.in_flight', { kind: 'press', subject: 'rupture', field: 'in_flight' }],
    ['action.rupture.remains', { kind: 'aura', subject: 'rupture', field: 'remains', target: true }],
    ['action.berserking.duration', { kind: 'aura', subject: 'berserking', field: 'duration', target: true }],
    ['action.rupture.charges', { kind: 'cooldown', subject: 'rupture', field: 'charges' }],
    ['action.rupture.souls_consumed', { kind: 'unread', subject: 'rupture', field: 'souls_consumed' }],
    ['cast_time', { kind: 'press', subject: 'x', field: 'cast_time' }],
    ['gcd.max', { kind: 'press', subject: 'x', field: 'gcd.max' }],
    ['combo_strike', { kind: 'press', subject: 'x', field: 'combo_strike' }],
    ['prev_gcd.2.shadow_dance', { kind: 'press', subject: 'shadow_dance', field: 'prev_gcd', n: 2 }],
    ['prev_off_gcd.vanish', { kind: 'press', subject: 'vanish', field: 'prev_off_gcd' }],
    ['pet.darkglare.active', { kind: 'press', subject: 'darkglare', field: 'pet.active' }],
    ['energy.deficit', { kind: 'pool', subject: 'energy', field: 'deficit' }],
    ['combo_points', { kind: 'pool', subject: 'combo_points', field: 'amount' }],
    ['cp_max_spend', { kind: 'pool', subject: 'x', field: 'cp_max_spend' }],
    ['talent.deathstalkers_mark', { kind: 'build', subject: 'talent.deathstalkers_mark', field: 'enabled' }],
    ['talent.deathstalkers_mark.rank', { kind: 'build', subject: 'talent.deathstalkers_mark', field: 'rank' }],
    ['hero_tree.trickster', { kind: 'build', subject: 'hero_tree.trickster', field: 'enabled' }],
    ['apex.2', { kind: 'build', subject: 'apex.2', field: 'enabled', n: 2 }],
    ['variable.pool', { kind: 'build', subject: 'pool', field: 'variable' }],
    ['spell_targets.shuriken_storm', { kind: 'fight', subject: '', field: 'spell_targets' }],
    ['raid_event.adds.in', { kind: 'fight', subject: '', field: 'raid_event.adds.in' }],
    ['target.health.pct', { kind: 'fight', subject: '', field: 'target.health.pct' }],
    ['health.pct', { kind: 'fight', subject: '', field: 'health.pct' }],
    ['fight_style.patchwerk', { kind: 'fight', subject: '', field: 'fight_style.patchwerk' }],
    ['trinket.1.has_use_buff', { kind: 'gear', subject: '', field: 'has_use_buff', n: 1 }],
    ['trinket.2.cooldown.remains', { kind: 'gear', subject: '', field: 'cooldown.remains', n: 2 }],
    ['trinket.1.is.spymasters_web', { kind: 'gear', subject: 'spymasters_web', field: 'is', n: 1 }],
    ['trinket.1.has_buff.haste', { kind: 'gear', subject: 'haste', field: 'has_buff', n: 1 }],
    ['trinket.1.proc.any_dps.duration', { kind: 'gear', subject: 'any_dps', field: 'proc.duration', n: 1 }],
    ['trinket.spymasters_web.cooldown.ready', { kind: 'gear', subject: 'spymasters_web', field: 'cooldown.ready', n: 0 }],
    ['this_trinket.has_use_buff', { kind: 'gear', subject: 'this_trinket', field: 'has_use_buff', n: 0 }],
    ['equipped.spymasters_web', { kind: 'gear', subject: 'spymasters_web', field: 'equipped', n: 0 }],
    ['set_bonus.mid2_4pc', { kind: 'gear', subject: 'mid2_4pc', field: 'set_bonus' }],
    ['main_hand.2h', { kind: 'gear', subject: '2h', field: 'main_hand' }],
    ['druid.no_cds', { kind: 'fight', subject: '', field: 'druid.no_cds' }],
    ['stat.haste_rating', { kind: 'unread', subject: '', field: 'stat.haste_rating' }],
  ])('takes %s apart as %o', (name, expected) => {
    expect(path(name)).toMatchObject(expected);
  });

  it('reads a bare field inside a derived row as the row\'s own subject', () => {
    expect(FactPaths.path('remains', 'x', path('dot.rupture.refreshable'))).toMatchObject({ kind: 'aura', subject: 'rupture', field: 'remains', target: true });
    expect(FactPaths.path('pet.remains', 'x', path('pet.darkglare.active'))).toMatchObject({ kind: 'press', subject: 'darkglare', field: 'pet.remains' });
  });

  it.each<[name: string, tokens: string[]]>([
    ['buff.shadow_dance.up', ['shadow_dance']],
    ['prev_gcd.2.shadow_dance', ['shadow_dance']],
    ['action.rupture.cost', ['rupture']],
    ['pet.darkglare.active', ['darkglare', 'summon_darkglare', 'invoke_darkglare']],
    ['energy.deficit', []],
    ['talent.shadow_dance', []],
    ['refreshable', []],
    ['active_enemies', []],
    ['trinket.1.is.spymasters_web', []],
  ])('reads the spell tokens %s names as %o', (name, tokens) => {
    expect(FactPaths.spellTokens(name)).toEqual(tokens);
  });

  it.each<[name: string, build: boolean, situation: boolean]>([
    ['talent.shadow_dance', true, false],
    ['hero_tree.trickster', true, false],
    ['apex.2', true, false],
    ['variable.pool', false, false],
    ['buff.shadow_dance.up', false, false],
    ['active_enemies', false, true],
    ['target.health.pct', false, true],
    ['health.pct', false, false],
    ['raid_event.adds.in', false, true],
    ['time', false, true],
    ['stealthed.rogue', false, false],
  ])('tells whether %s speaks of the build (%s) or the situation (%s)', (name, build, situation) => {
    expect(FactPaths.build(path(name))).toBe(build);
    expect(FactPaths.situation(path(name))).toBe(situation);
  });
});
