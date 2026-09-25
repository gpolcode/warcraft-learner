import { Injectable, inject } from '@angular/core';
import type jsep from 'jsep';
import { group } from 'd3-array';
import type { RuleCondition } from '../plan/plan.models';
import { AplLine, AplNode, SimcAplService } from './simc-apl-service';
import type { SpellRecord } from './spell-dump-service';

/** Spell ids stay 0 and spell names hold SimC tokens until a top log resolves them. */
const UNRESOLVED = 0;
const COMPARISONS = new Set(['=', '==', '!=', '<', '<=', '>', '>=']);
const AT_LEAST = new Set(['>', '>=']);
const AT_MOST = new Set(['<', '<=']);
const TARGETS = /^(active_enemies|spell_targets(\.\w+)?)$/;

/** WCL's `classResources` type for each SimC resource token. */
const RESOURCES: Record<string, { type: number; name: string } | undefined> = {
  mana: { type: 0, name: 'mana' },
  rage: { type: 1, name: 'rage' },
  focus: { type: 2, name: 'focus' },
  energy: { type: 3, name: 'energy' },
  combo_points: { type: 4, name: 'combo points' },
  runic_power: { type: 6, name: 'runic power' },
  soul_shard: { type: 7, name: 'soul shards' },
  astral_power: { type: 8, name: 'astral power' },
  holy_power: { type: 9, name: 'holy power' },
  maelstrom: { type: 11, name: 'maelstrom' },
  chi: { type: 12, name: 'chi' },
  insanity: { type: 13, name: 'insanity' },
  arcane_charges: { type: 16, name: 'arcane charges' },
  fury: { type: 17, name: 'fury' },
  essence: { type: 19, name: 'essence' },
};

interface Comparison {
  name: string;
  op: string;
  value: number | null;
}

interface Button {
  action: string;
  spells: ReadonlyMap<string, SpellRecord[]>;
  /** Buttons with an unconditional line and no cooldown: what the spec presses when nothing else is up. */
  fillers: string[];
}

/** Turns an APL into rule conditions: each requirement shape is one rule kind, and a rule every line of a button implies is a requirement of pressing it. */
@Injectable({ providedIn: 'root' })
export class AplRuleService {
  private readonly apl = inject(SimcAplService);

  derive(lines: AplLine[], spells: ReadonlyMap<string, SpellRecord[]>): RuleCondition[] {
    const byAction = group(lines, line => line.action);
    const fillers = [...byAction]
      .filter(([action, lines]) => this.cooldown(spells, action) === 0 && spells.has(action)
        && lines.some(line => line.readable && !line.terms.length))
      .map(([action]) => action);
    const rules: RuleCondition[] = [];
    for (const [action, lines] of byAction) {
      const button: Button = { action, spells, fillers };
      rules.push(...this.sharedRules(button, lines));
      for (const term of lines.flatMap(line => line.terms)) rules.push(...this.stateRules(action, term));
    }
    rules.push(...this.procRules(lines, new Set(byAction.keys())));
    return [...new Map(rules.map(rule => [JSON.stringify(rule), rule])).values()];
  }

  /** A rule carries no threshold, so `spell_targets>=2` on one line and `spell_targets>=3` on another imply the same one. */
  private sharedRules(button: Button, lines: AplLine[]): RuleCondition[] {
    if (lines.some(line => !line.readable)) return [];
    const [first, ...rest] = lines.map(line => line.terms.flatMap(term => this.termRules(button, term)));
    const others = rest.map(implied => new Set(implied.map(rule => JSON.stringify(rule))));
    return (first ?? []).filter(rule => others.every(keys => keys.has(JSON.stringify(rule))));
  }

  /** Base seconds from SimC's spell data; 0 for a button that has none. */
  private cooldown(spells: ReadonlyMap<string, SpellRecord[]>, token: string): number {
    return Math.max(0, ...(spells.get(token) ?? []).map(record => record.cooldown));
  }

  private termRules(button: Button, term: AplNode): RuleCondition[] {
    const compared = this.comparison(term);
    return [
      ...this.buffGate(button, term),
      this.priorGate(button.action, term),
      this.pairingGate(button.action, term),
      compared && this.targetGate(button.action, compared),
      compared && this.resourceGate(button.action, compared),
      compared && this.stackGate(button, compared),
      compared && this.healthGate(button, compared),
    ].filter((rule): rule is RuleCondition => !!rule);
  }

  /** `buff.x.up` and `buff.x.react` read as up; `!buff.x.up` and `buff.x.down` as down. */
  private buffGate({ action, spells, fillers }: Button, term: AplNode): RuleCondition[] {
    const flag = this.flag(term);
    const match = flag && /^buff\.(\w+)\.(up|react|down)$/.exec(flag.name);
    const buff = match?.[1];
    if (!flag || !buff || buff === action) return [];
    const inside = (match[2] === 'down') === flag.negated;
    const rules: RuleCondition[] = [{
      kind: 'cast_outside_buff', spell_id: UNRESOLVED, spell_name: action,
      buff_spell_id: UNRESOLVED, buff_spell_name: buff, require: inside ? 'inside' : 'outside',
    }];
    const alternatives = fillers.filter(filler => filler !== action);
    if (inside && alternatives.length && this.cooldown(spells, action) === 0) {
      rules.push({
        kind: 'filler_in_buff', spell_id: UNRESOLVED, spell_name: action,
        alternative_spell_ids: alternatives.map(() => UNRESOLVED), alternative_spell_names: alternatives,
        buff_spell_id: UNRESOLVED, buff_spell_name: buff,
      });
    }
    return rules;
  }

  private priorGate(action: string, term: AplNode): RuleCondition | null {
    const flag = this.flag(term);
    const required = flag && !flag.negated ? /^prev_gcd\.1\.(\w+)$/.exec(flag.name)?.[1] : undefined;
    if (!required || required === action) return null;
    return {
      kind: 'cast_without_prior', spell_id: UNRESOLVED, spell_name: action,
      required_spell_id: UNRESOLVED, required_spell_name: required,
    };
  }

  /** `cooldown.y.remains>N`, alone or as one branch of an `|`: the button waits while y is about to come back. */
  private pairingGate(action: string, term: AplNode): RuleCondition | null {
    const anchor = this.apl.operands(term, '|')
      .map(branch => this.comparison(branch))
      .map(compared => compared && AT_LEAST.has(compared.op) ? /^cooldown\.(\w+)\.remains$/.exec(compared.name)?.[1] : undefined)
      .find(token => token && token !== action);
    if (!anchor) return null;
    return {
      kind: 'hold_cooldown_for_anchor', spell_ids: [UNRESOLVED], spell_names: [action],
      anchor_spell_id: UNRESOLVED, anchor_spell_name: anchor,
    };
  }

  private targetGate(action: string, { name, op, value }: Comparison): RuleCondition | null {
    if (!TARGETS.test(name)) return null;
    const exact = op === '=' && value !== null ? (value > 1 ? 'min' : 'max') : null;
    const bound = AT_LEAST.has(op) ? 'min' : AT_MOST.has(op) ? 'max' : exact;
    return bound && { kind: 'cast_at_target_count', spell_id: UNRESOLVED, spell_name: action, bound };
  }

  /** A floor on the pool spends it full and a ceiling spends it low; on the deficit, each reads the other way round. */
  private resourceGate(action: string, { name, op }: Comparison): RuleCondition | null {
    const [pool = '', field] = name.split('.');
    const resource = RESOURCES[pool];
    if (!resource || !(AT_LEAST.has(op) || AT_MOST.has(op)) || (field !== undefined && field !== 'deficit')) return null;
    const low = AT_MOST.has(op) !== (field === 'deficit');
    return {
      kind: 'resource_at_cast', spell_id: UNRESOLVED, spell_name: action,
      resource_type: resource.type, resource_name: resource.name, bound: low ? 'max' : 'min',
    };
  }

  private stackGate({ action, spells }: Button, { name, op }: Comparison): RuleCondition | null {
    const buff = /^buff\.(\w+)\.stack$/.exec(name)?.[1];
    const maxStacks = buff ? Math.max(0, ...(spells.get(buff) ?? []).map(record => record.maxStacks)) : 0;
    if (!buff || buff === action || maxStacks < 2 || !(AT_LEAST.has(op) || op === '=')) return null;
    return {
      kind: 'spend_at_stacks', spell_id: UNRESOLVED, spell_name: action,
      buff_spell_id: UNRESOLVED, buff_spell_name: buff, bound: 'min', max_stacks: maxStacks,
    };
  }

  private healthGate({ action, fillers }: Button, { name, op, value }: Comparison): RuleCondition | null {
    const alternatives = fillers.filter(filler => filler !== action);
    if (name !== 'target.health.pct' || !AT_MOST.has(op) || value === null || !alternatives.length) return null;
    return {
      kind: 'filler_below_health', spell_id: UNRESOLVED, spell_name: action,
      alternative_spell_ids: alternatives.map(() => UNRESOLVED), alternative_spell_names: alternatives, health_pct: value,
    };
  }

  /** Upkeep read off any line: the line that refreshes an aura says the aura is meant to stay up. */
  private stateRules(action: string, term: AplNode): RuleCondition[] {
    const compared = this.comparison(term);
    const remains = compared && AT_MOST.has(compared.op) ? /^buff\.(\w+)\.remains$/.exec(compared.name)?.[1] : undefined;
    if (remains && remains !== action) return [this.uptime(remains, 'self')];
    const flag = this.flag(term);
    return flag ? this.flagState(action, flag.name, flag.negated) : [];
  }

  private flagState(action: string, name: string, negated: boolean): RuleCondition[] {
    // A bare `refreshable` or `ticking` names the button's own dot.
    const [scope, aura = action, field = ''] = name.includes('.') ? name.split('.') : ['dot', action, name];
    if (scope === 'buff') return field === 'refreshable' ? this.buffRefresh(action, aura) : [];
    return scope === 'dot' || scope === 'debuff' ? this.dotState(action, aura, field, negated) : [];
  }

  private buffRefresh(action: string, aura: string): RuleCondition[] {
    return aura === action ? [this.uptime(aura, 'self'), this.clipped(aura, action, 'self')] : [this.uptime(aura, 'self')];
  }

  private dotState(action: string, aura: string, field: string, negated: boolean): RuleCondition[] {
    if (field === 'refreshable' && !negated) return [this.uptime(aura, 'target'), this.clipped(aura, action, 'target')];
    const missing = negated ? field === 'ticking' || field === 'up' : field === 'down';
    return missing ? [this.uptime(aura, 'target')] : [];
  }

  private uptime(aura: string, on: 'self' | 'target'): RuleCondition {
    return { kind: 'aura_uptime_below', aura_spell_id: UNRESOLVED, aura_spell_name: aura, on };
  }

  private clipped(aura: string, cast: string, on: 'self' | 'target'): RuleCondition {
    return {
      kind: 'aura_clipped', aura_spell_id: UNRESOLVED, aura_spell_name: aura,
      cast_spell_id: UNRESOLVED, cast_spell_name: cast, on,
    };
  }

  /** A proc is a buff the APL reacts to but never presses; every button gated on it spends it. */
  private procRules(lines: AplLine[], actions: Set<string>): RuleCondition[] {
    const spends = new Map<string, Set<string>>();
    for (const { action, terms } of lines) {
      for (const term of terms) {
        const flag = this.flag(term);
        const proc = flag && !flag.negated ? /^buff\.(\w+)\.react$/.exec(flag.name)?.[1] : undefined;
        if (proc && !actions.has(proc)) spends.set(proc, (spends.get(proc) ?? new Set()).add(action));
      }
    }
    return [...spends].map(([proc, spenders]): RuleCondition => ({
      kind: 'proc_wasted', buff_spell_id: UNRESOLVED, buff_spell_name: proc,
      spend_spell_ids: [...spenders].map(() => UNRESOLVED), spend_spell_names: [...spenders],
    }));
  }

  private flag(term: AplNode): { name: string; negated: boolean } | null {
    if (term.type === 'Identifier') return { name: (term as jsep.Identifier).name, negated: false };
    const { operator, argument } = term as Partial<jsep.UnaryExpression>;
    if (term.type !== 'UnaryExpression' || operator !== '!' || argument?.type !== 'Identifier') return null;
    return { name: (argument as jsep.Identifier).name, negated: true };
  }

  private comparison(term: AplNode): Comparison | null {
    if (term.type !== 'BinaryExpression') return null;
    const { operator, left, right } = term as jsep.BinaryExpression;
    if (!COMPARISONS.has(operator) || left.type !== 'Identifier') return null;
    const literal = right.type === 'Literal' ? (right as jsep.Literal).value : null;
    return { name: (left as jsep.Identifier).name, op: operator === '==' ? '=' : operator, value: typeof literal === 'number' ? literal : null };
  }
}
