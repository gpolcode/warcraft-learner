import { InjectionToken } from '@angular/core';
import { Environment, withEnvironment } from './base-environment';

export type { Environment };

// The factory serves the defaults to a TestBed that provides nothing; app.config provides the build's environment over it.
export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT', { factory: () => withEnvironment({}) });
