import { InjectionToken } from '@angular/core';
import { Environment, withEnvironment } from './base-environment';

export type { Environment };

// The factory hands a TestBed that provides nothing the defaults; app.config provides the build's environment over it.
export const ENVIRONMENT = new InjectionToken<Environment>('ENVIRONMENT', { factory: () => withEnvironment({}) });
