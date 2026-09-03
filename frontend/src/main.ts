import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { LoggerService } from './app/domains/shared/util-logging/logger-service';

bootstrapApplication(App, appConfig)
  .catch((err: unknown) => { new LoggerService().logWarn('bootstrapApplication', err); });
