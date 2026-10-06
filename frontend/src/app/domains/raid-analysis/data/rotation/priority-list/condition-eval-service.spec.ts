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
  it.each<[reads: string, condition: string, truth: Truth]>([
    ['a stated fact against the list\'s number', `time>=${CAST_AT_S}`, 'true'],
    ['a stated fact that misses the number', `time>${CAST_AT_S}`, 'false'],
    ['a fact no log records as unknown, never as false', SIM_ONLY, 'unknown'],
    ['its negation as unknown too', `!(${SIM_ONLY})`, 'unknown'],
    ['an or settled on its known branch', `time>=${CAST_AT_S}|${SIM_ONLY}`, 'true'],
    ['an and settled on its known false term', `time>${CAST_AT_S}&${SIM_ONLY}`, 'false'],
    ['an or left unknown when its known branch fails', `time>${CAST_AT_S}|${SIM_ONLY}`, 'unknown'],
    ['an and left unknown when its known term holds', `time>=${CAST_AT_S}&${SIM_ONLY}`, 'unknown'],
    ['an xor of two known terms', `(time>=${CAST_AT_S})^(time>${CAST_AT_S})`, 'true'],
    ['an xor of two true terms as false', `time^(time>=${CAST_AT_S})`, 'false'],
    ['an unknown carried through arithmetic', `time+raid_event.movement.in>${CAST_AT_S}`, 'unknown'],
    ['an unknown times zero as zero', '0*raid_event.movement.in=0', 'true'],
    ['% as division', 'time%2=15', 'true'],
    ['%% as the remainder', 'time%%7=2', 'true'],
    ['<? as the larger', '(time<?40)=40', 'true'],
    ['>? as the smaller', '(time>?40)=30', 'true'],
    ['@ as the absolute value', `@(0-time)=${CAST_AT_S}`, 'true'],
    ['floor over the value', 'floor(time%4)=7', 'true'],
    ['ceil over the value', 'ceil(time%4)=8', 'true'],
    ['floor of an unknown as unknown', 'floor(raid_event.movement.in)>0', 'unknown'],
    ['a division by a value that may be zero as settling nothing', 'time%raid_event.movement.in>0', 'unknown'],
  ])('reads %s', (_, condition, expected) => {
    expect(truth(condition)).toBe(expected);
  });

  it('reads any non-zero value as true, a negative one included', () => {
    expect(evaluator.truth([-2, -1])).toBe('true');
    expect(evaluator.truth([0, 0])).toBe('false');
    expect(evaluator.truth([0, 1])).toBe('unknown');
  });

  it('asks the log for the streams a name\'s kind reads', () => {
    expect(evaluator.streams('dot.rupture.remains')).toEqual(['enemyAuras', 'damage']);
    expect(evaluator.streams('buff.shadow_dance.up')).toEqual([]);
    expect(evaluator.streams('energy.deficit')).toEqual(['resources']);
    expect(evaluator.streams('action.rupture.in_flight')).toEqual(['damage']);
    expect(evaluator.streams('prev_gcd.1.rupture')).toEqual([]);
  });
});
