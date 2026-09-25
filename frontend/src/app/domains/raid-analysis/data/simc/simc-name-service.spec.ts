import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SimcNameService } from './simc-name-service';

const names = TestBed.inject(SimcNameService);

const VOIDFALL_SPENDING = 1256302;
const REND_DOT = 388539;
const SHADOWMELD = 58984;
const BONEGRINDER_FROST = 377103;

/** Excerpts shaped like SimC's class modules. */
const CODE = [
  'buffs.shadowmeld = make_buff_fallback( race == RACE_NIGHT_ELF, this, "shadowmeld", find_spell( 58984 ) );',
  'voidfall_spending_buff_t( demon_hunter_t* p ) : base_t( *p, "voidfall_spending", p->hero_spec.voidfall_spending_buff )',
  'hero_spec.voidfall_spending_buff       = talent_spell_lookup( talent.annihilator.voidfall, 1256302 );',
  'rend_dot_t( warrior_t* p ) : warrior_attack_t( "rend_dot", p, p->spell.rend_dot ),',
  'spell.rend_dot                = find_spell( 388539 );',
  'make_fallback( talent.frost.bonegrinder.ok(), this, "bonegrinder_frost", spell.bonegrinder_frost_buff )',
  'spell.bonegrinder_frost_buff      = conditional_spell_lookup( talent.frost.bonegrinder.ok(), 377103 );',
  'buff.avatar = make_buff( this, "avatar", talents.avatar );',
  'talents.avatar = find_talent_spell( talent_tree::SPECIALIZATION, "Avatar" );',
  'if ( splits.size() >= 2 && util::str_compare_ci( splits[ 1 ], "ca_inc" ) )',
  '{',
  '  splits[ 1 ] = talent.incarnation_moonkin.ok() ? "incarnation_chosen_of_elune" : "celestial_alignment";',
  '  return druid_t::create_expression( util::string_join( splits, "." ) );',
  '}',
].join('\n');

describe('SimcNameService.resolve', () => {
  it('reads the spell id a declaration names outright', () => {
    expect(names.resolve('shadowmeld', CODE)).toEqual({ ids: [SHADOWMELD], tokens: [] });
  });

  it('follows a declaration\'s spell member to the id it is assigned', () => {
    expect(names.resolve('voidfall_spending', CODE)).toEqual({ ids: [VOIDFALL_SPENDING], tokens: [] });
    expect(names.resolve('rend_dot', CODE)).toEqual({ ids: [REND_DOT], tokens: [] });
    expect(names.resolve('bonegrinder_frost', CODE)).toEqual({ ids: [BONEGRINDER_FROST], tokens: [] });
  });

  it('reads a member looked up by its in-game name as that name', () => {
    expect(names.resolve('avatar', CODE)).toEqual({ ids: [], tokens: ['Avatar'] });
  });

  it('reads an alias as every name it may stand for', () => {
    expect(names.resolve('ca_inc', CODE)?.tokens.sort()).toEqual(['celestial_alignment', 'incarnation_chosen_of_elune']);
  });

  it('resolves no name the code never declares', () => {
    expect(names.resolve('supercharge_1', CODE)).toBeNull();
  });
});
