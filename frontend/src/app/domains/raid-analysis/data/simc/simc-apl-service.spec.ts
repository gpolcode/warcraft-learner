import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AplLine, SimcAplService } from './simc-apl-service';

const apl = TestBed.inject(SimcAplService);

/** A line's terms as the SimC source reads, so a case states its expectation in APL syntax. */
const source = (line: AplLine | undefined): string[] => (line?.terms ?? []).map(term => apl.identifiers(term).join(' '));
const lines = (...entries: string[]): AplLine[] => apl.readProfile(entries.join('\n'));
const keys = (line: AplLine | undefined): string[] => (line?.terms ?? []).map(term => apl.termKey(term));

describe('SimcAplService.readProfile', () => {
  it('reads each button line of the default list with its top-level & terms', () => {
    const [line] = lines('actions=rampage,if=buff.enrage.down&rage>=80');
    expect(line?.action).toBe('rampage');
    expect(source(line)).toEqual(['buff.enrage.down', 'rage']);
  });

  it('carries the terms of a called list onto every line inside it', () => {
    const [line] = lines(
      'actions=call_action_list,name=cooldowns,if=active_enemies>=2',
      'actions.cooldowns=bladestorm,if=buff.recklessness.up',
    );
    expect(line?.action).toBe('bladestorm');
    expect(source(line)).toEqual(['active_enemies', 'buff.recklessness.up']);
  });

  it('reads && as & and leaves a | term whole', () => {
    const [line] = lines('actions=pistol_shot,if=buff.opportunity.up&&(energy<50|combo_points<3)');
    expect(source(line)).toEqual(['buff.opportunity.up', 'energy combo_points']);
  });

  it('drops the sim-only branch of an | term, so the log-readable branch stands alone', () => {
    const [line] = lines('actions=bladestorm,if=buff.recklessness.up|fight_remains<10');
    expect(source(line)).toEqual(['buff.recklessness.up']);
  });

  it('keeps an | term whole when every branch is sim-only, since nothing readable would stand in for it', () => {
    const [line] = lines('actions=bladestorm,if=fight_remains<10|raid_event.adds.in>60');
    expect(source(line)).toEqual(['fight_remains raid_event.adds.in']);
  });

  it('inlines a variable set once, unconditionally', () => {
    const [line] = lines('actions=variable,name=st,value=active_enemies=1', 'actions+=/rampage,if=variable.st');
    expect(source(line)).toEqual(['active_enemies']);
  });

  it('inlines a 1/0 setif as its condition and a 0/1 setif as its negation', () => {
    const [one, zero] = lines(
      'actions=variable,name=st,op=setif,value=1,value_else=0,condition=active_enemies=1',
      'actions+=/variable,name=aoe,op=setif,value=0,value_else=1,condition=active_enemies=1',
      'actions+=/rampage,if=variable.st',
      'actions+=/whirlwind,if=variable.aoe',
    );
    const [condition, negation] = lines('actions=rampage,if=active_enemies=1', 'actions+=/whirlwind,if=!(active_enemies=1)');
    expect(keys(one)).toEqual(keys(condition));
    expect(keys(zero)).toEqual(keys(negation));
  });

  it('leaves a variable assigned more than once as sim state', () => {
    const [line] = lines(
      'actions=variable,name=pool,value=1,if=energy<50',
      'actions+=/variable,name=pool,value=0,if=energy>=50',
      'actions+=/rampage,if=variable.pool',
    );
    expect(source(line)).toEqual(['variable.pool']);
  });

  it('skips actions that press no spell of the spec', () => {
    expect(lines('actions=auto_attack', 'actions+=/potion', 'actions+=/use_item,name=trinket').map(line => line.action)).toEqual([]);
  });

  it('keeps a line under a condition jsep cannot read, with its terms marked unknown', () => {
    expect(lines('actions=rampage,if=rage>=(80')).toEqual([{ action: 'rampage', terms: [], readable: false }]);
  });
});

describe('SimcAplService.sharedTerms', () => {
  it('keeps the terms every line of a button agrees on', () => {
    const rampage = lines(
      'actions=rampage,if=buff.enrage.down&rage>=80',
      'actions+=/rampage,if=rage>=80&active_enemies>=3',
    );
    expect(apl.sharedTerms(rampage).flatMap(term => apl.identifiers(term))).toEqual(['rage']);
  });

  it('agrees on nothing when a line of the button is unreadable', () => {
    const rampage = lines('actions=rampage,if=rage>=80', 'actions+=/rampage,if=rage>=(80');
    expect(apl.sharedTerms(rampage)).toEqual([]);
  });
});
