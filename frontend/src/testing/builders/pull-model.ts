import { PullModel } from '../../app/domains/raid-analysis/data/analysis/pull-model-service';
import { AliveSpan } from '../../app/domains/raid-analysis/data/analysis/analysis-math';

const DEFAULT_FIGHT_S = 300;

/** A killed pull the player lived through, unless `over` says otherwise; alive spans follow from `deadSpans` and the judged end when not given. */
export function pullModel(over: Partial<PullModel> = {}): PullModel {
  const fightDurationS = over.fightDurationS ?? DEFAULT_FIGHT_S;
  const judgedEndS = over.judgedEndS ?? fightDurationS;
  const deadSpans = over.deadSpans ?? [];
  const aliveSpans: AliveSpan[] = [];
  let fromS = 0;
  for (const [diedS, backS] of deadSpans) {
    if (diedS > fromS) aliveSpans.push([fromS, diedS]);
    fromS = backS;
  }
  if (judgedEndS > fromS) aliveSpans.push([fromS, judgedEndS]);
  return {
    fightDurationS, judgedEndS, judgedEndCause: 'kill', deadSpans, aliveSpans,
    lust: null, phases: [], role: 'dps',
    ...over,
  };
}
