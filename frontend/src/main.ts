import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { logWarn } from './app/core/log';

// Warms the landing chunk beside bootstrap; the router asks for it only once the spec-meta initializer resolves, chaining two round trips. It reports a real failure, so this copy stays silent.
void import('./app/pages/post-raid/post-raid').catch(() => undefined);

bootstrapApplication(App, appConfig)
  .catch((err) => logWarn('bootstrapApplication', err));
