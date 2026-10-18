import { describe, it, expect } from 'vitest';
import { NotGraded } from './not-graded';
import { NOT_GRADED } from '../data/verdict/calibration/arming-service';
import { LATE_OPENER_FAMILY, COOLDOWN_GAP_FAMILY } from '../data/rotation/cadence-judge-service';
import { mountDom } from '../../../../testing/component-harness';

const TOO_FEW = { label: LATE_OPENER_FAMILY.label, reason: NOT_GRADED.tooFew };
const TOO_OFTEN = { label: COOLDOWN_GAP_FAMILY.label, reason: NOT_GRADED.tooOften };

describe('NotGraded', () => {
  it('names each check above the reason it shows no color', () => {
    const dom = mountDom(NotGraded, { notes: [TOO_FEW, TOO_OFTEN] });

    expect(dom.textAll('div > span')).toEqual([TOO_FEW.label, TOO_FEW.reason, TOO_OFTEN.label, TOO_OFTEN.reason]);
  });
});
