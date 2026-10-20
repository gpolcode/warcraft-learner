import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { tone } from '../../../../../testing/builders/tone';
import { CardRankingService } from './card-ranking-service';
import type { FindingRow } from './finding-rows-service';
import type { ComparisonWindow } from './window-comparison.models';
import type { ButtonRow } from '../rotation/priority-list/list-finding-service';
import type { EnchantRow, GearVerdict } from '../gear/gear-judge-service';
import { READY_TIME_FAMILY } from '../rotation/ready-time-judge-service';
import { DOWNTIME_FAMILY } from '../rotation/downtime-judge-service';
import { ROTATION_BUTTON_FAMILY } from '../rotation/priority-list/button-judge-service';
import { BURST_WINDOW_FAMILY } from '../burst-windows/burst-judge-service';
import { ENCHANT_MISSING_FAMILY, TRINKET_PAIR_FAMILY } from '../gear/gear-judge-service';
import type { RowRank } from '../verdict/tone.models';

const ranking = TestBed.inject(CardRankingService);

const RANK: RowRank = { costClass: 'high', evidence: 'red', shortfall: 2 };
const IDLE = { aboutS: 6, lowS: 4, highS: 9 };
const WINDOW_START_S = 130;

const findingRow = (over: Partial<FindingRow>): FindingRow => ({ severity: tone('amber'), icon: '', measured: { value: '' }, message: 'Message.', occurrences: [], ...over });

describe('CardRankingService', () => {
  it('ranks a cooldown row under its cooldown and its family\'s label', () => {
    const row = findingRow({ family: READY_TIME_FAMILY.id, rank: RANK, name: 'Shadow Blades' });

    expect(ranking.findings('Offensives', [row])).toEqual([{
      card: 'Offensives', check: READY_TIME_FAMILY.label, subject: 'Shadow Blades', tone: tone('amber'), rank: RANK, damage: null, message: 'Message.',
    }]);
  });

  it('names a pull-wide row by what it measured and carries its damage', () => {
    const row = findingRow({ family: DOWNTIME_FAMILY.id, rank: RANK, name: '', what: 'Idle time', damage: IDLE });

    expect(ranking.findings('Downtime', [row])[0]).toMatchObject({ subject: 'Idle time', damage: IDLE });
  });

  it('leaves out a row no rule judged', () => {
    expect(ranking.findings('Offensives', [findingRow({ family: READY_TIME_FAMILY.id })])).toEqual([]);
  });

  it('ranks a button under its name', () => {
    const button = { family: ROTATION_BUTTON_FAMILY.id, name: 'Eviscerate', status: tone('amber'), rank: RANK, message: 'Message.' } as ButtonRow;

    expect(ranking.buttons('Rotation rules', [button])[0]).toMatchObject({ check: ROTATION_BUTTON_FAMILY.label, subject: 'Eviscerate' });
  });

  it('ranks a window under its start and leaves out a muted one', () => {
    const judged = { family: BURST_WINDOW_FAMILY.id, status: tone('amber'), rank: RANK, timeStartS: WINDOW_START_S, message: 'Message.' } as ComparisonWindow;
    const muted = { ...judged, status: 'muted' } as ComparisonWindow;

    expect(ranking.windows('Burst windows', [judged, muted]).map(row => row.subject)).toEqual(['02:10']);
  });

  it('ranks the gear verdicts and each flagged enchant slot', () => {
    const trinkets = { family: TRINKET_PAIR_FAMILY.id, tone: tone('blue'), rank: RANK, note: 'Note.' } as GearVerdict;
    const enchant = { family: ENCHANT_MISSING_FAMILY.id, tone: tone('amber'), rank: RANK, slotName: 'Legs', note: 'Apply it.' } as EnchantRow;
    const onPlan = { family: null, tone: tone('neutral'), slotName: 'Head', note: null } as EnchantRow;

    expect(ranking.gear('Gear', [trinkets, null], [enchant, onPlan]).map(row => [row.check, row.subject])).toEqual([
      [TRINKET_PAIR_FAMILY.label, ''], [ENCHANT_MISSING_FAMILY.label, 'Legs'],
    ]);
  });

  it('counts the muted rows a card shows by their cause', () => {
    expect(ranking.mutedFolds([{ unjudged: 'dead' }, { unjudged: 'dead' }, { unjudged: null }, { unjudged: 'after_wipe' }]))
      .toEqual({ dead: 2, after_wipe: 1, not_reached: 0 });
  });
});
