import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {

  logWarn(context: string, err: unknown): void {
    console.warn(`[warcraft-learner] ${context}:`, err);
  }
}
