import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpecRoleService } from './spec-role-service';

const specRoles = TestBed.inject(SpecRoleService);

describe('SpecRoleService', () => {
  it('puts a healing spec in the healer role', () => {
    expect(specRoles.role('RestorationShaman')).toBe('healer');
  });

  it('puts a tanking spec in the tank role', () => {
    expect(specRoles.role('BloodDeathKnight')).toBe('tank');
  });

  it('puts every other spec in the damage role', () => {
    expect(specRoles.role('AssassinationRogue')).toBe('dps');
  });
});
