import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { cast } from '../../../../../../testing/builders/events';
import { SimcAplService } from '../../simc/simc-apl-service';
import { ConditionEvalService } from './condition-eval-service';
import { castAt, factContext, priorityList } from './priority-list-harness';
import type { Truth } from './priority-list.models';

const CAST_AT_S = 30;
/** No reader answers it, so it stands for any fact the log does not record. */
const SIM_ONLY = 'raid_event.movement.in>20';

const evaluator = TestBed.inject(ConditionEvalService);
const apl = TestBed.inject(SimcAplService);
const ctx = factContext(priorityList(), { casts: [cast(1, CAST_AT_S)] });

/** A condition read at a cast 30 s in, where `time` is the one fact the log states. */
const truth = (condition: string): Truth => {
  const node = apl.parse(condition);
  if (!node) throw new Error(`unreadable ${condition}`);
  return evaluator.truthOf(node, castAt(ctx, CAST_AT_S), 'x', ctx);
};

describe('ConditionEvalService', () => {
  it('reads a stated fact against the list\'s number', () => {
    expect(truth(`time>=${CAST_AT_S}`)).toBe('true');
    expect(truth(`time>${CAST_AT_S}`)).toBe('false');
  });

  it('reads a fact no log records as unknown, never as false', () => {
    expect(truth(SIM_ONLY)).toBe('unknown');
    expect(truth(`!(${SIM_ONLY})`)).toBe('unknown');
  });

  it('settles an or on its known branch and an and on its known false term', () => {
    expect(truth(`time>=${CAST_AT_S}|${SIM_ONLY}`)).toBe('true');
    expect(truth(`time>${CAST_AT_S}&${SIM_ONLY}`)).toBe('false');
  });

  it('leaves an or unknown when its known branch fails, and an and when its known term holds', () => {
    expect(truth(`time>${CAST_AT_S}|${SIM_ONLY}`)).toBe('unknown');
    expect(truth(`time>=${CAST_AT_S}&${SIM_ONLY}`)).toBe('unknown');
  });

  it('carries an unknown through arithmetic, but multiplies it by zero to zero', () => {
    expect(truth(`time+raid_event.movement.in>${CAST_AT_S}`)).toBe('unknown');
    expect(truth('0*raid_event.movement.in=0')).toBe('true');
  });

  it('reads SimC\'s own operators: % divides, %% is the remainder, <? takes the larger, >? the smaller', () => {
    expect(truth('time%2=15')).toBe('true');
    expect(truth('time%%7=2')).toBe('true');
    expect(truth('(time<?40)=40')).toBe('true');
    expect(truth('(time>?40)=30')).toBe('true');
  });

  it('reads SimC\'s floor and ceil functions over the value, an unknown one staying unknown', () => {
    expect(truth('floor(time%4)=7')).toBe('true');
    expect(truth('ceil(time%4)=8')).toBe('true');
    expect(truth('floor(raid_event.movement.in)>0')).toBe('unknown');
  });

  it('settles nothing on a division by a value that may be zero', () => {
    expect(truth('time%raid_event.movement.in>0')).toBe('unknown');
  });

  it('reads any non-zero value as true, a negative one included', () => {
    expect(evaluator.truth([-2, -1])).toBe('true');
    expect(evaluator.truth([0, 0])).toBe('false');
    expect(evaluator.truth([0, 1])).toBe('unknown');
  });
});
