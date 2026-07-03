// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';

export default defineConfig([
  {
    // Base TypeScript rules shared by the Angular app (src/**) and the Node CLI
    // scripts (scripts/**). Angular-specific rules live in the src-only block below.
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended, tseslint.configs.stylistic],
    rules: {
      // Style-guide enforcement (mapped from the former frontend/.claude/CLAUDE.md).
      '@typescript-eslint/no-explicit-any': 'error', // ban `any`, use `unknown`
      // Allow the underscore-prefix convention for deliberately-unused args/vars.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Empty private constructors are the idiomatic "force the static factory" guard.
      '@typescript-eslint/no-empty-function': ['error', { allow: ['private-constructors'] }],
    },
  },
  {
    // Angular-specific rules + the inline-template processor apply to the app only.
    // The Node CLI scripts under scripts/** are plain tsx, so they never see these.
    files: ['src/**/*.ts'],
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'wl',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'wl',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-standalone': 'error', // standalone is the default; no standalone:true
      '@angular-eslint/prefer-host-metadata-property': 'error', // no @HostBinding/@HostListener; use `host`
      '@angular-eslint/prefer-inject': 'error', // inject() over constructor injection
    },
  },
  {
    // Node CLI scripts under scripts/** are plain tsx entrypoints, not Angular.
    // console.log/console.error are their user-facing output, so keep it allowed.
    // Node globals (process, etc) need no globals block: typescript-eslint disables
    // core `no-undef` for .ts, so TypeScript itself owns undefined-symbol checks.
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Machine enforcement of the "no hardcoded colors anywhere" house rule
    // (warcraft-frontend skill). There is one source of color truth - the design
    // tokens in styles.scss - so a hex literal (`#3fb950`, `#fff`, `#rrggbbaa`)
    // in any src TS file is a violation, whether in a component, service, or the
    // canvas draw code (range-chart / map-canvas read tokens via getComputedStyle
    // and carry no hardcoded hex, not even as a fallback). Specs are excluded: they
    // assert on data strings that can legitimately contain a `#` run (e.g. an enchant
    // name like "Enchant #8041"), which is not a color.
    files: ['src/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
          message:
            'No hardcoded hex colors. Use a design token from styles.scss (e.g. text-[var(--success)]) - see the no-hardcoded-colors rule in the warcraft-frontend skill.',
        },
        {
          selector: 'TemplateElement[value.cooked=/#[0-9a-fA-F]{3,8}\\b/]',
          message:
            'No hardcoded hex colors. Use a design token from styles.scss (e.g. text-[var(--success)]) - see the no-hardcoded-colors rule in the warcraft-frontend skill.',
        },
      ],
    },
  },
  {
    // Machine enforcement of the "all formatting goes through Angular pipes" house
    // rule (warcraft-frontend skill): component/view-model TS exposes raw numeric
    // values and the template formats them via pipes, so `.toFixed(...)` (ad-hoc
    // number formatting) must not appear in component TS. `no-restricted-properties`
    // (a different rule name than the hex block's `no-restricted-syntax`, so the two
    // blocks compose instead of overriding on files matched by both).
    // Sanctioned exclusions - kept out of scope, not weakened:
    //   - **/*.service.ts: finding-text `.toFixed` in feature services is a
    //     documented gray area (services are not view-models formatted by pipes).
    //   - shared/pipes/**: pipes ARE the sanctioned formatting layer.
    //   - range-chart.ts / map-canvas.ts: canvas components legitimately build
    //     number strings imperatively (canvas cannot consume Angular pipes).
    files: ['src/app/**/*.ts'],
    ignores: [
      '**/*.spec.ts',
      '**/*.service.ts',
      'src/app/shared/pipes/**/*.ts',
      'src/app/shared/components/range-chart/range-chart.ts',
      'src/app/pages/post-raid/map/map-canvas.ts',
    ],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          property: 'toFixed',
          message:
            'No ad-hoc number formatting in component TS. Expose the raw number from the view-model and format in the template via a pipe (DecimalPipe, FormatDamagePipe, ...) - see the all-formatting-through-pipes rule in the warcraft-frontend skill.',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error', // native @if/@for/@switch over *ngIf/*ngFor
      // Keep strict equality, but allow the deliberate `x != null` / `x == null`
      // idiom (matches both null and undefined) the templates use for optional fields.
      '@angular-eslint/template/eqeqeq': ['error', { allowNullOrUndefined: true }],
    },
  },
]);
