import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ToneService } from './tone-service';
import { Evidence, ToneLevel } from './tone.models';

const tones = TestBed.inject(ToneService);

const evidence = (level: ToneLevel): Evidence => ({ level, n: 10, observed: 0, target: 0, excess: 0 });

describe('ToneService', () => {
  it('keeps red evidence red on a red, high-cost family', () => {
    expect(tones.tone({ tier: 'red', costClass: 'high' }, evidence('red'))).toBe('red');
  });

  it('caps red evidence at the family tier', () => {
    expect(tones.tone({ tier: 'amber', costClass: 'high' }, evidence('red'))).toBe('amber');
  });

  it('never raises weak evidence to the family tier', () => {
    expect(tones.tone({ tier: 'red', costClass: 'high' }, evidence('neutral'))).toBe('neutral');
  });

  it('caps a medium-cost family at amber', () => {
    expect(tones.tone({ tier: 'red', costClass: 'medium' }, evidence('red'))).toBe('amber');
  });

  it('turns a low-cost row amber on red-level evidence', () => {
    expect(tones.tone({ tier: 'red', costClass: 'low' }, evidence('red'))).toBe('amber');
  });

  it('leaves a low-cost row neutral on amber-level evidence', () => {
    expect(tones.tone({ tier: 'red', costClass: 'low' }, evidence('amber'))).toBe('neutral');
  });

  it('keeps a consensus count blue at any cost', () => {
    expect(tones.tone({ tier: 'blue', costClass: 'low' }, evidence('blue'))).toBe('blue');
  });

  it('marks an unjudged check muted', () => {
    expect(tones.muted()).toBe('muted');
  });
});
