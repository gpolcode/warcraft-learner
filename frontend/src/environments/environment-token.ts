import { InjectionToken } from '@angular/core';
import { Environment, withEnvironment } from './base-environment';

export type { Environment };

// The factory default is for a TestBed that provides nothing; a build provides its own environment over it.
export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT', { factory: () => withEnvironment({}) });
