// @ts-check

const BANNED = [
  { pattern: /\b(?:text|leading|tracking|font)-\[/g, label: 'an arbitrary text size, line-height, tracking, or font value' },
  { pattern: /\b(?:bg|border|fill|outline|accent|from|to|via|ring|shadow|decoration|stroke)-\[var\(--/g, label: 'a color reached through var() instead of its named utility' },
  { pattern: /\btext-(?:xs|sm|base|lg|xl|[2-9]xl)\b/g, label: 'a Tailwind default text size, which the theme removes' },
  { pattern: /\bfont-(?:mono|serif)\b/g, label: 'a second font family, which the theme removes' },
  { pattern: /\bleading-(?:none|tight|snug|normal|relaxed|loose)\b/g, label: 'a line-height utility; the type role sets line-height' },
  { pattern: /\btracking-(?:tighter|tight|normal|wide|wider|widest)\b/g, label: 'a tracking utility; text-label and text-tag set tracking' },
  { pattern: /\b(?:uppercase|lowercase|capitalize|normal-case|italic|not-italic)\b/g, label: 'a case or style utility; text-label and text-tag are the only uppercase roles' },
];

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: 'templates style text only through the type roles and color tokens the theme in styles.scss defines' },
    schema: [],
    messages: {
      banned: 'Found {{label}}. Use a type role (text-title, text-heading, text-label, text-tag, text-name, text-body, text-caption, text-value, text-hero) and a named color (text-muted, bg-surface, border-line).',
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
      },
    };
  },
};
