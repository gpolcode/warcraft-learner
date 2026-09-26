import { Injectable, inject } from '@angular/core';
import type { PlanVariable, PriorityList } from '../../plan/plan.models';
import { AplNode, SimcAplService } from '../../simc/simc-apl-service';
import { ConditionEvalService } from './condition-eval-service';
import { UNKNOWN, CastMoment, FactContext, Range, Truth } from './priority-list.models';

interface ReadVariable {
  name: string;
  op: string;
  value: AplNode | null;
  valueElse: AplNode | null;
  condition: AplNode | null;
  terms: AplNode[] | null;
  start: Range;
  precombat: boolean;
}

type Read = (node: AplNode | null) => Range;
type Holds = (node: AplNode | null) => Truth;

const hull = (a: Range, b: Range): Range => [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
const either = (holds: Truth, then: () => Range, otherwise: () => Range): Range => {
  if (holds === 'true') return then();
  return holds === 'false' ? otherwise() : hull(then(), otherwise());
};

/** SimC's own variable ops (`engine/action/variable.cpp`); the arithmetic ones apply the matching expression operator to the current value. */
const STEPS: Record<string, ((variable: ReadVariable, current: Range, read: Read, holds: Holds) => Range) | undefined> = {
  set: (variable, _, read) => read(variable.value),
  setif: (variable, _, read, holds) => either(holds(variable.condition), () => read(variable.value), () => read(variable.valueElse)),
  reset: variable => variable.start,
  floor: (_, [lo, hi]) => [Math.floor(lo), Math.floor(hi)],
  ceil: (_, [lo, hi]) => [Math.ceil(lo), Math.ceil(hi)],
};
/** `>?` is SimC's min and `<?` its max, and `%` divides. */
const OPERATORS: Record<string, string | undefined> = { add: '+', sub: '-', mul: '*', div: '%', mod: '%%', min: '>?', max: '<?' };

@Injectable({ providedIn: 'root' })
export class VariableReplayService {
  private readonly apl = inject(SimcAplService);
  private readonly evaluator = inject(ConditionEvalService);

  /** SimC runs the variable actions it walks past on every decision, so each cast runs them all in list order, the state carried from cast to cast. */
  withVariables(list: PriorityList, moments: CastMoment[], ctx: FactContext): CastMoment[] {
    if (!list.variables.length) return moments;
    const variables = list.variables.map(variable => this.parsed(variable));
    const state = new Map(variables.map(variable => [variable.name, variable.start]));
    const [first] = moments;
    if (first) this.runAll(variables.filter(variable => variable.precombat), first, state, ctx);
    const combat = variables.filter(variable => !variable.precombat);
    return moments.map(moment => {
      this.runAll(combat, moment, state, ctx);
      return { ...moment, variables: new Map(state) };
    });
  }

  private parsed(variable: PlanVariable): ReadVariable {
    const parse = (text: string | undefined): AplNode | null => (text === undefined ? null : this.apl.parse(text));
    const start = variable.default ?? 0;
    const terms = variable.terms?.map(term => this.apl.parse(term));
    return {
      name: variable.name, op: variable.op, value: parse(variable.value), valueElse: parse(variable.value_else), condition: parse(variable.condition),
      terms: terms?.every((term): term is AplNode => term !== null) ? terms : null,
      start: [start, start], precombat: !!variable.precombat,
    };
  }

  private runAll(variables: ReadVariable[], moment: CastMoment, state: Map<string, Range>, ctx: FactContext): void {
    const live: CastMoment = { ...moment, variables: state };
    const read: Read = node => (node ? this.evaluator.value(node, live, '', ctx) : UNKNOWN);
    const holds: Holds = node => (node ? this.evaluator.truth(read(node)) : 'unknown');
    for (const variable of variables) {
      const gate = variable.terms ? this.evaluator.and(...variable.terms.map(term => holds(term))) : 'unknown';
      if (gate === 'false') continue;
      const current = state.get(variable.name) ?? variable.start;
      const next = this.step(variable, current, read, holds);
      state.set(variable.name, gate === 'true' ? next : hull(current, next));
    }
  }

  private step(variable: ReadVariable, current: Range, read: Read, holds: Holds): Range {
    const step = STEPS[variable.op];
    if (step) return step(variable, current, read, holds);
    const operator = OPERATORS[variable.op];
    return operator ? this.evaluator.arithmetic(operator, current, read(variable.value)) : UNKNOWN;
  }
}
