import { InjectionToken } from '@angular/core';
import { Environment, baseEnvironment } from './base-environment';

export type { Environment };

// The factory default is for a TestBed that provides nothing, not for a build.
export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT', { factory: () => baseEnvironment });
