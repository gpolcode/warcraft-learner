import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { RankedRow, RowOrderService } from './row-order-service';
import { ToneService } from './tone-service';
import { CostClass, DamageEstimate, Evidence, ToneLevel } from './tone.models';

const order = TestBed.inject(RowOrderService);
const tones = TestBed.inject(ToneService);

const evidence = (level: ToneLevel, excess = 0): Evidence => ({ level, observed: 0, n: 10, target: 0, excess });
const priced = (aboutS: number): DamageEstimate => ({ aboutS, lowS: aboutS, highS: aboutS });

/** A row of a family at its tier's tone, as the rules gave it. */
function row(subject: string, costClass: CostClass, judged: Evidence, damage: DamageEstimate | null = null): RankedRow {
  const family = { tier: 'red' as const, costClass };
  return { card: 'Offensives', check: 'Check', subject, tone: tones.tone(family, judged), rank: tones.rank(family, judged), damage, message: '' };
}

const subjects = (rows: readonly RankedRow[]): string[] => rows.map(entry => entry.subject);

describe('RowOrderService', () => {
  it('puts a colored row before a comparison of a costlier class', () => {
    const comparison = { ...row('comparison', 'high', evidence('red')), tone: tones.neutral() };

    expect(subjects(order.order([comparison, row('amber', 'medium', evidence('amber'))], entry => entry))).toEqual(['amber', 'comparison']);
  });

  it('orders rows of one tone by cost class, then evidence', () => {
    const rows = [row('medium-amber', 'medium', evidence('amber')), row('high-amber', 'high', evidence('amber')), row('medium-red', 'medium', evidence('red'))];

    expect(subjects(order.order(rows, entry => entry))).toEqual(['high-amber', 'medium-red', 'medium-amber']);
  });

  it('orders rows a class and evidence tie by their damage, a priced row before an unpriced one', () => {
    const rows = [row('unpriced', 'medium', evidence('amber'), null), row('small', 'medium', evidence('amber'), priced(4)), row('large', 'medium', evidence('amber'), priced(9))];

    expect(subjects(order.order(rows, entry => entry))).toEqual(['large', 'small', 'unpriced']);
  });

  it('orders rows that tie on all else by their shortfall', () => {
    const rows = [row('short', 'medium', evidence('amber', 1)), row('long', 'medium', evidence('amber', 5))];

    expect(subjects(order.order(rows, entry => entry))).toEqual(['long', 'short']);
  });

  it('keeps the card\'s own order for rows that tie on every key', () => {
    const rows = [row('first', 'medium', evidence('amber')), row('second', 'medium', evidence('amber'))];

    expect(subjects(order.order(rows, entry => entry))).toEqual(['first', 'second']);
  });

  it('puts a muted row after a comparison', () => {
    const muted = { ...row('muted', 'high', evidence('red')), tone: tones.muted() };
    const comparison = { ...row('comparison', 'low', evidence('neutral')), tone: tones.neutral() };

    expect(subjects(order.order([muted, comparison], entry => entry))).toEqual(['comparison', 'muted']);
  });
});

describe('RowOrderService.fixFirst', () => {
  it('lists the three costliest colored rows', () => {
    const rows = [
      row('low', 'low', evidence('red')), row('high', 'high', evidence('red')),
      row('medium', 'medium', evidence('amber')), row('second-high', 'high', evidence('amber')),
    ];

    expect(subjects(order.fixFirst(rows))).toEqual(['high', 'second-high', 'medium']);
  });

  it('leaves out every row that is not colored', () => {
    const blue = row('blue', 'low', evidence('blue'));

    expect(order.fixFirst([blue])).toEqual([]);
  });
});
