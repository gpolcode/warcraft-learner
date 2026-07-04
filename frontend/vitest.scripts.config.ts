import { defineConfig } from 'vitest/config';

// Vitest config for the ingestion scripts (scripts/**). Kept separate from the
// Angular `ng test` run (which covers src/** via tsconfig.spec.json): the scripts
// use explicit `.ts` import specifiers and run in a plain Node environment.
export default defineConfig({
  test: {
    include: ['scripts/**/*.spec.ts'],
    environment: 'node',
    // In CI, also emit GitHub workflow-command annotations so failed tests show up
    // inline on the PR diff. The reporter does not self-gate, so keep it CI-only to
    // avoid noisy `::error` lines in local runs.
    reporters: process.env['GITHUB_ACTIONS'] ? ['default', 'github-actions'] : ['default'],
    // Coverage runs only when a script passes `--coverage` (the test:coverage script);
    // it stays off for the default test / test:ci runs so the gate is not slowed.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcovonly', 'json-summary'],
      reportsDirectory: './coverage/scripts',
      include: ['scripts/**/*.ts'],
      exclude: ['scripts/**/*.spec.ts', 'scripts/ingest/models/**'],
    },
  },
});
