import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FightStyleFacts } from './fight-style-facts';

const styles = TestBed.inject(FightStyleFacts);

describe('FightStyleFacts', () => {
  it('reads the dungeon fight styles as never the one played, the app reading raid bosses only', () => {
    expect(styles.matches('fight_style.dungeonroute')).toBe(true);
    expect(styles.read('fight_style.dungeonroute')).toEqual([0, 0]);
  });

  it('reads the Patchwerk styles, which stand for a raid boss, as the one played', () => {
    expect(styles.read('fight_style.patchwerk')).toEqual([1, 1]);
    expect(styles.read('fight_style.castingpatchwerk')).toEqual([1, 1]);
  });

  it('leaves every other fight style to read as unknown', () => {
    expect(styles.matches('fight_style.helterskelter')).toBe(false);
  });
});
