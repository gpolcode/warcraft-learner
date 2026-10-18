import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { AliveSpan, benchExpectedUses, fmtClock, spansS } from '../analysis/analysis-math';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { PullModel, PullModelService, UnjudgedCause } from '../analysis/pull-model-service';
import { CadenceBenchmark } from '../encounter/encounter.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { CastsByName } from './cadence-judge-service';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const COOLDOWN_LIMITS = ['Why a cooldown was held', 'Cooldown resets and charges the log does not show'];

export const NEVER_USED_FAMILY: FindingFamily = {
  id: 'rotation.never_used',
  label: 'Unused cooldowns',
  version: 2,
  tier: 'red',
  claim: 'You never pressed a major cooldown that k of n top logs pressed.',
  construct: 'Zero uses of one plan cooldown inside the judged span, its talent taken, judged only once the alive time runs one cooldown past every top log\'s first use.',
  pendingRebuild: null,
  reference: TOP_LOG_REFERENCE,
  alignment: 'Alive time before the judged end',
  availability: ['Talent taken, where the cooldown is a talent', 'Used by at least half of the top logs', 'At least one expected use over the alive time', 'Alive time running one cooldown past every top log\'s first use'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing'] },
  rule: 'consensus',
  costClass: 'high',
  uncertaintyShown: 'k of n top logs that pressed it',
  copy: { message: 'You never pressed {cd} {over}. {k} of {n} top logs did.', remedy: 'Press {cd} {expected}x.' },
  injectedMistakes: ['drop-major-cooldown-cast'],
  limits: COOLDOWN_LIMITS,
};

const UNJUDGED_VALUE: Record<UnjudgedCause, string> = { dead: 'Dead', after_wipe: 'After the wipe', not_reached: 'Not reached' };
const UNJUDGED_MESSAGE: Record<UnjudgedCause, (name: string) => string> = {
  dead: name => `You were dead before ${name} was due, so it is not judged.`,
  after_wipe: name => `The pull wiped before ${name} was due, so it is not judged.`,
  not_reached: name => `The boss died before ${name} was due, so it is not judged.`,
};

export interface CooldownUses {
  uses: number;
  expected: number;
}

/** The never-used check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class CooldownUseJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);
  private readonly pullModel = inject(PullModelService);

  /** Ascending; a use before the pull logs no cast, only its aura still up when the pull starts, which counts as a use at 0. */
  castTimesS(castEvents: readonly TimedEvent[], spellId: number, upAtPull: ReadonlySet<number>, endS: number): number[] {
    const pressed = castEvents
      .filter(event => event.type === 'cast' && event.abilityGameID === spellId && event.atS >= 0 && event.atS <= endS)
      .map(event => event.atS);
    return [...(upAtPull.has(spellId) ? [0] : []), ...pressed].sort((a, b) => a - b);
  }

  measure(castTimesS: readonly number[], spans: readonly AliveSpan[], bench: CadenceBenchmark): CooldownUses {
    return { uses: castTimesS.length, expected: benchExpectedUses(spans, bench).expected };
  }

  /** Each top log's first use, null for a log that never pressed it, in the order of the bench's sources. */
  referenceFirstUses(perParse: readonly CastsByName[], name: string): (number | null)[] {
    return perParse.map(casts => casts[name]?.[0] ?? null);
  }

  /** Null when the pull used it, so its use is judged on ready time, or when the alive time ends before one cooldown past a top log's first use, so a late first use is never read as none. */
  judge(uses: CooldownUses, firstUses: readonly (number | null)[], spans: readonly AliveSpan[], due: { taken: boolean; cooldownS: number }): Evidence | null {
    const lastAliveS = spans.at(-1)?.[1] ?? 0;
    if (uses.uses > 0 || firstUses.some(firstS => firstS !== null && firstS + due.cooldownS > lastAliveS)) return null;
    const k = firstUses.filter(firstS => firstS !== null).length;
    return this.rules.consensus({ differs: true, k, n: firstUses.length, paired: due.taken && uses.expected >= 2 });
  }

  /** The pull's never-used finding for one cooldown: judged on alive time, or muted when death or the wipe came before it was due. */
  finding(
    cooldown: { name: string; cooldown: number }, castTimesS: readonly number[], bench: CadenceBenchmark, model: PullModel,
    perParse: readonly CastsByName[], taken: boolean, caps?: FamilyCaps,
  ): AnalysisFinding | null {
    const { name } = cooldown;
    if (castTimesS.length) return null;
    const uses = this.measure(castTimesS, model.aliveSpans, bench);
    const firstUses = this.referenceFirstUses(perParse, name);
    const evidence = uses.expected === 0 ? null : this.judge(uses, firstUses, model.aliveSpans, { taken, cooldownS: cooldown.cooldown });
    if (!evidence) return this.unjudged(name, bench, model);
    const severity = this.tones.tone(NEVER_USED_FAMILY, evidence, caps);
    const aliveS = spansS(model.aliveSpans);
    const over = aliveS < model.fightDurationS ? `in ${fmtClock(aliveS)} of alive time` : `on a ${fmtClock(model.fightDurationS)} fight`;
    const n = firstUses.length;
    const others = n ? `${evidence.observed} of ${n} top logs did.` : `Top raiders press it ${uses.expected} times in that time.`;
    return {
      family: NEVER_USED_FAMILY.id, severity, category: 'never_used', cd_name: name,
      measured: { value: `0 / ${uses.expected}`, unit: n ? `cast(s), ${n} top logs` : 'cast(s)' },
      message: `You never pressed ${name} ${over}. ${others}`,
      ...this.tones.graded(severity) ? { details: { remedy: `Press ${name} ${uses.expected}x.` } } : {}, occurrences: [],
    };
  }

  private unjudged(name: string, bench: CadenceBenchmark, model: PullModel): AnalysisFinding | null {
    if (benchExpectedUses([[0, model.fightDurationS]], bench).expected === 0) return null;
    const cause = this.pullModel.causeOf(model, 0, model.fightDurationS);
    if (!cause) return null;
    return {
      family: NEVER_USED_FAMILY.id, severity: this.tones.muted(), unjudged: cause, category: 'never_used', cd_name: name,
      measured: { value: UNJUDGED_VALUE[cause] }, message: UNJUDGED_MESSAGE[cause](name), occurrences: [],
    };
  }
}
