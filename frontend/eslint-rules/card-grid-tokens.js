// @ts-check
import { readFileSync } from 'node:fs';

const STYLES = new URL('../src/styles.scss', import.meta.url);
const DEFINED = new Set([...readFileSync(STYLES, 'utf8').matchAll(/^\s*(--cols-[a-z-]+):/gm)].map((m) => m[1]));

const BANNED = [
  { pattern: /\bgrid-cols-\[/g, label: 'a grid track list written inline' },
  { pattern: /\b(?:sm|md|lg|xl|2xl):border-l\b/g, label: 'a responsive column rule' },
  { pattern: /\b(?:sm|md|lg|xl|2xl):pl-/g, label: 'a responsive column inset' },
  { pattern: /\bpl-\(--gap-card\)/g, label: 'a column inset spelled by hand' },
];

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: 'card columns come only from the --cols-* lists, the column rule from card-fix and the column inset from card-inset, both in styles.scss' },
    schema: [],
    messages: {
      banned: 'Found {{label}}. Every card shares one right rail: name a --cols-* list from src/styles.scss, and use card-fix (column rule plus inset) or card-inset (inset only) for the fix column\'s left edge.',
      unknown: 'grid-cols-(--{{name}}) names no --cols-* list in src/styles.scss.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        const text = sourceCode.getText();
        for (const { pattern, label } of BANNED) {
          for (const match of text.matchAll(pattern)) {
            context.report({ loc: sourceCode.getLocFromIndex(match.index), messageId: 'banned', data: { label } });
          }
        }
        for (const match of text.matchAll(/\bgrid-cols-\(--([\w-]+)\)/g)) {
          if (!DEFINED.has(`--${match[1]}`)) {
            context.report({ loc: sourceCode.getLocFromIndex(match.index), messageId: 'unknown', data: { name: match[1] } });
          }
        }
      },
    };
  },
};
