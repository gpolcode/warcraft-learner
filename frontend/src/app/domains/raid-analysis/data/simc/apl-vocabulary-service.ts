import { Injectable } from '@angular/core';
import { ACTION_OPTIONS, ACTION_WORDS, EXPRESSION_SHAPES, VARIABLE_OPS, type AplVocabularyEntry } from './apl-vocabulary';

/** Heads whose second segment names a spell, list, item, event or variable rather than a field. */
const NAMED_HEADS = new Set([
  'buff', 'debuff', 'dot', 'cooldown', 'talent', 'hero_tree', 'variable', 'set_bonus', 'action', 'pet', 'active_dot', 'trinket',
  'equipped', 'raid_event', 'prev', 'prev_gcd', 'prev_off_gcd', 'this_trinket', 'other_trinket', 'potion', 'spell_targets', 'dot_refreshable_count', 'apex',
]);
const NUMBER = /^\d+$/;

@Injectable({ providedIn: 'root' })
export class AplVocabularyService {

  /** `buff.rupture.up` reads `buff.*.up`, `prev_gcd.1.scorch` reads `prev_gcd.*.*`, so one entry covers every spell. */
  shape(path: readonly string[]): string {
    const head = path[0] ?? '';
    return path.map((segment, index) => {
      const named = (index === 1 && NAMED_HEADS.has(head)) || (index === 2 && head === 'prev_gcd');
      return named || NUMBER.test(segment) ? '*' : segment;
    }).join('.');
  }

  expression(path: readonly string[]): AplVocabularyEntry | null {
    const shape = this.shape(path);
    const exact = EXPRESSION_SHAPES[shape];
    if (exact) return exact;
    const segments = shape.split('.');
    for (let length = segments.length - 1; length >= 1; length -= 1) {
      const entry = EXPRESSION_SHAPES[segments.slice(0, length).join('.')];
      if (entry?.subtree) return entry;
    }
    return null;
  }

  option(key: string): AplVocabularyEntry | null {
    return ACTION_OPTIONS[key] ?? null;
  }

  actionWord(name: string): AplVocabularyEntry | null {
    return ACTION_WORDS[name] ?? null;
  }

  variableOp(op: string): AplVocabularyEntry | null {
    return VARIABLE_OPS[op] ?? null;
  }
}
