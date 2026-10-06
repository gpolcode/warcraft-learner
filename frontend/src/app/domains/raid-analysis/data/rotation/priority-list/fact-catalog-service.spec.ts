import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FactCatalogService } from './fact-catalog-service';
import type { FactKind } from './priority-list.models';

const catalog = TestBed.inject(FactCatalogService);
/** The line's own button, which a bare field is about. */
const ACTION = 'rupture';

describe('FactCatalogService paths', () => {
  it.each<[string, FactKind | null, string, string]>([
    ['buff.shadow_dance.up', 'aura', 'shadow_dance', 'up'],
    ['buff.shadow_dance', 'aura', 'shadow_dance', 'up'],
    ['dot.rupture.ticking', 'aura', 'rupture', 'ticking'],
    ['target.debuff.rupture.remains', 'aura', 'rupture', 'remains'],
    ['active_dot.rupture', 'aura', 'rupture', 'active_dots'],
    ['refreshable', 'aura', ACTION, 'refreshable'],
    ['action.rupture.pmultiplier', 'aura', 'rupture', 'pmultiplier'],
    ['cooldown.vanish.remains', 'cooldown', 'vanish', 'remains'],
    ['action.vanish.full_recharge_time', 'cooldown', 'vanish', 'full_recharge_time'],
    ['charges', 'cooldown', ACTION, 'charges'],
    ['cooldown_react', 'cooldown', ACTION, 'cooldown_react'],
    ['action.chaos_bolt.in_flight', 'press', 'chaos_bolt', 'in_flight'],
    ['prev_gcd.2.shadow_dance', 'press', 'shadow_dance', 'prev_gcd'],
    ['prev.shadow_dance', 'press', 'shadow_dance', 'prev'],
    ['pet.darkglare.active', 'press', 'darkglare', 'pet.active'],
    ['gcd.max', 'press', ACTION, 'gcd.max'],
    ['combo_strike', 'press', ACTION, 'combo_strike'],
    ['energy.deficit', 'pool', 'energy', 'deficit'],
    ['energy', 'pool', 'energy', 'amount'],
    ['cp_max_spend', 'pool', 'combo_points', 'max'],
    ['action.rupture.cost', 'pool', 'rupture', 'cost'],
    ['energize_amount', 'pool', ACTION, 'energize_amount'],
    ['talent.deathstalkers_mark', 'build', 'talent.deathstalkers_mark', 'enabled'],
    ['talent.potent_powder.rank', 'build', 'talent.potent_powder', 'rank'],
    ['hero_tree.trickster', 'build', 'hero_tree.trickster', 'enabled'],
    ['apex.3', 'build', 'apex.3', 'enabled'],
    ['variable.pool', 'variable', 'pool', 'variable'],
    ['raid_event.adds.in', 'fight', 'adds', 'raid_event.in'],
    ['fight_style.patchwerk', 'fight', 'patchwerk', 'fight_style'],
    ['spell_targets.shuriken_storm', 'fight', 'shuriken_storm', 'spell_targets'],
    ['spell_targets', 'fight', '', 'spell_targets'],
    ['target.health.pct', 'fight', '', 'health.pct'],
    ['target.time_to_die.remains', 'fight', '', 'time_to_die'],
    ['time_to_pct_20', 'fight', '', 'time_to_pct'],
    ['active_enemies', 'fight', '', 'active_enemies'],
    ['trinket.1.cooldown.remains', 'gear', '1', 'cooldown.remains'],
    ['trinket.2.is.spymasters_web', 'gear', '2', 'is'],
    ['trinket.1.has_buff.mastery', 'gear', '1', 'has_buff'],
    ['trinket.1.proc.any_dps.duration', 'gear', '1', 'proc.duration'],
    ['trinket.spymasters_web.cooldown.ready', 'gear', 'spymasters_web', 'cooldown.ready'],
    ['this_trinket.has_use_buff', 'gear', 'this', 'has_use_buff'],
    ['equipped.spymasters_web', 'gear', 'spymasters_web', 'equipped'],
    ['set_bonus.mid2_4pc', 'gear', 'mid2_4pc', 'set_bonus'],
    ['main_hand.2h', 'gear', 'main_hand', 'weapon'],
    ['potion.liquid_luster', 'gear', 'liquid_luster', 'potion'],
    ['action.reap.souls_consumed', null, 'reap', 'souls_consumed'],
    ['void_metamorphosis_base_drain_ps', null, '', 'void_metamorphosis_base_drain_ps'],
    ['stat.haste_rating', null, '', 'stat.haste_rating'],
  ])('reads %s as a %s read of %s, field %s', (name, kind, subject, field) => {
    expect(catalog.path(name, ACTION)).toMatchObject({ kind, subject, field });
  });

  it('reads a dot, a debuff and a bare dot field on the target, and a buff on the player', () => {
    expect(catalog.path('dot.rupture.remains', ACTION).target).toBe(true);
    expect(catalog.path('remains', ACTION).target).toBe(true);
    expect(catalog.path('buff.shadow_dance.remains', ACTION).target).toBe(false);
  });

  it('carries the number of a press back, an apex tier, a trinket slot and a health mark', () => {
    expect(catalog.path('prev_gcd.2.shadow_dance', ACTION).n).toBe(2);
    expect(catalog.path('apex.3', ACTION).n).toBe(3);
    expect(catalog.path('trinket.2.ilvl', ACTION).n).toBe(2);
    expect(catalog.path('time_to_pct_20', ACTION).n).toBe(20);
  });

  it('carries the item, stat and proc a trinket field compares against', () => {
    expect(catalog.path('trinket.1.is.spymasters_web', ACTION).arg).toBe('spymasters_web');
    expect(catalog.path('trinket.1.has_buff.mastery', ACTION).arg).toBe('mastery');
    expect(catalog.path('trinket.1.proc.any_dps.duration', ACTION).arg).toBe('any_dps');
    expect(catalog.path('main_hand.2h', ACTION).arg).toBe('2h');
  });
});

describe('FactCatalogService lookups', () => {
  it('names the spell tokens a name reads, a pet by the buttons that may summon it, and none for a pool or a talent', () => {
    expect(catalog.spellTokens('cooldown.vanish.remains')).toEqual(['vanish']);
    expect(catalog.spellTokens('prev_gcd.2.shadow_dance')).toEqual(['shadow_dance']);
    expect(catalog.spellTokens('action.rupture.cost')).toEqual(['rupture']);
    expect(catalog.spellTokens('pet.darkglare.active')).toEqual(['darkglare', 'summon_darkglare', 'invoke_darkglare']);
    expect(catalog.spellTokens('energy.deficit')).toEqual([]);
    expect(catalog.spellTokens('talent.deathstalkers_mark')).toEqual([]);
  });

  it('tells a build term from one that reads the moment', () => {
    expect(catalog.isBuild('talent.deathstalkers_mark')).toBe(true);
    expect(catalog.isBuild('apex.3')).toBe(true);
    expect(catalog.isBuild('variable.pool')).toBe(false);
  });

  it('reads the enemy count, target health, the clock, a raid event and the fight style as the situation, but not the player\'s own health', () => {
    for (const name of ['active_enemies', 'spell_targets.shuriken_storm', 'target.health.pct', 'time', 'fight_remains', 'target.time_to_die', 'raid_event.adds.in', 'fight_style.patchwerk']) {
      expect(catalog.isSituation(name)).toBe(true);
    }
    expect(catalog.isSituation('health.pct')).toBe(false);
    expect(catalog.isSituation('combo_points')).toBe(false);
  });

  it('asks for the streams a name\'s reader needs', () => {
    expect(catalog.streams('active_enemies')).toEqual(['damage']);
    expect(catalog.streams('dot.rupture.remains')).toEqual(['enemyAuras', 'damage']);
    expect(catalog.streams('buff.shadow_dance.up')).toEqual([]);
    expect(catalog.streams('equipped.spymasters_web')).toEqual(['gear']);
  });

  it('gives a field its words by whose aura it is, and none to a name outside the catalog', () => {
    expect(catalog.words(catalog.path('buff.shadow_dance.up', ACTION))?.states).toEqual(['Up', 'Down']);
    expect(catalog.words(catalog.path('dot.rupture.up', ACTION))?.states).toEqual(['On the target', 'Not on the target']);
    expect(catalog.words(catalog.path('dot.rupture.pmultiplier', ACTION))?.frame).toBe('amount');
    expect(catalog.words(catalog.path('stat.haste_rating', ACTION))).toBeUndefined();
  });
});
