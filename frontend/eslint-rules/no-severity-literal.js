// @ts-check

// Every vocabulary a severity, row status or tone is spelled in under the data layer.
const SEVERITY_WORDS = new Set([
  'critical', 'warning', 'info', 'success', 'hold_suggestion', 'good', 'warn', 'bad', 'red', 'amber', 'blue',
]);

const COMPARISONS = new Set(['===', '!==', '==', '!=']);

/** @param {any} node */
function isRead(node) {
  const parent = node.parent;
  if (!parent) return false;
  if (parent.type === 'TSLiteralType' || parent.type === 'SwitchCase') return true;
  if (parent.type === 'BinaryExpression') return COMPARISONS.has(parent.operator);
  if (parent.type === 'MemberExpression') return parent.property === node;
  return parent.type === 'Property' && parent.key === node;
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: { description: 'a severity is made only by ToneService; the data layer never spells one out or casts to Tone' },
    schema: [],
    messages: {
      literal: "Severity literal '{{value}}'. Emit Evidence from DecisionRuleService and let ToneService.tone set the tone.",
      cast: 'Cast to Tone. Only ToneService constructs a Tone.',
    },
  },
  create(context) {
    /** @param {any} node */
    const checkCast = (node) => {
      const type = node.typeAnnotation;
      if (type?.type === 'TSTypeReference' && type.typeName?.type === 'Identifier' && type.typeName.name === 'Tone') {
        context.report({ node, messageId: 'cast' });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value !== 'string' || !SEVERITY_WORDS.has(node.value) || isRead(node)) return;
        context.report({ node, messageId: 'literal', data: { value: node.value } });
      },
      TSAsExpression: checkCast,
      TSTypeAssertion: checkCast,
    };
  },
};
