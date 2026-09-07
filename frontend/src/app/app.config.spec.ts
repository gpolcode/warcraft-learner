import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { appConfig } from './app.config';

describe('appConfig snack bar defaults', () => {
  it('gives every snack bar a duration, since Material would otherwise leave it up with no way to dismiss it', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: appConfig.providers });

    expect(TestBed.inject(MAT_SNACK_BAR_DEFAULT_OPTIONS).duration).toBeGreaterThan(0);
  });
});
