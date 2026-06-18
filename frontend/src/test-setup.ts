/**
 * Vitest global setup for the warcraft-learner test suite.
 *
 * The app is zoneless (no zone.js anywhere), so we deliberately do NOT import
 * `zone.js/testing` here. Component TestBeds opt into zoneless change detection
 * via `provideZonelessChangeDetection()` (see `src/testing/component-harness.ts`).
 *
 * The pure-logic suites under `core/analysis/**` and the fluent builders need
 * none of this - they import plain functions and run without a DOM.
 */
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
