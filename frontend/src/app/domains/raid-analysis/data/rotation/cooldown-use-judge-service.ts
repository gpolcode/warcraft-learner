import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { AliveSpan, benchExpectedUses, fmtClock, spansS } from '../analysis/analysis-math';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { PullModel, PullModelService, UnjudgedCause } from '../analysis/pull-model-service';
import { CadenceBenchmark } from '../encounter/encounter.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps, Tone } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { RotationParseMeasures } from './rotation-data-source';

const TOP_LOG_REFERENCE = { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN };
const COOLDOWN_LIMITS = ['Why a cooldown was held', 'Cooldown resets and charges the log does not show'];

export const LOST_CAST_FAMILY: FindingFamily = {
  id: 'rotation.lost_cast',
  label: 'Cooldown uses',
  version: 1,
  tier: 'red',
  claim: 'You pressed a major cooldown fewer times over your alive time than top raiders press it over the same time.',
  construct: 'Uses of one plan cooldown inside the judged span, against the top logs\' uses per alive minute capped by their cadence fit.',
  pendingRebuild: 'Unused ready time of the cooldown',
  reference: TOP_LOG_REFERENCE,
  alignment: 'Alive time before the judged end',
  availability: ['Used by at least half of the top logs', 'At least one expected use over the alive time'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing'] },
  rule: 'count',
  costClass: 'high',
  uncertaintyShown: 'Uses and expected uses, with the count of top logs',
  copy: { message: 'You pressed {cd} {uses} times {over}. {n} top logs average {expected} in that time.', remedy: 'Press {cd} {missing}x more, sooner off cooldown.' },
  injectedMistakes: ['drop-major-cooldown-cast'],
  limits: COOLDOWN_LIMITS,
};

export const NEVER_USED_FAMILY: FindingFamily = {
  id: 'rotation.never_used',
  label: 'Unused cooldowns',
  version: 1,
  tier: 'red',
  claim: 'You never pressed a major cooldown that k of n top logs pressed.',
  construct: 'Zero uses of one plan cooldown inside the judged span, its talent taken.',
  pendingRebuild: 'Unused ready time of the cooldown',
  reference: TOP_LOG_REFERENCE,
  alignment: 'Alive time before the judged end',
  availability: ['Talent taken, where the cooldown is a talent', 'Used by at least half of the top logs', 'At least one expected use over the alive time'],
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

interface UseRow {
  name: string;
  uses: CooldownUses;
  reference: readonly number[];
  severity: Tone;
  graded: boolean;
  over: string;
}

export interface CooldownUseJudgement {
  family: FindingFamily;
  evidence: Evidence;
}

/** The lost and never-used cast checks, split so ingest can judge a top log as the player through the same measure. */
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

  /** Each top log's uses, in the order of the bench's sources. */
  referenceUses(perParse: readonly RotationParseMeasures[], name: string): number[] {
    return perParse.map(parse => parse.cd_casts_s[name]?.length ?? 0);
  }

  /** Null when the pull reached the expected uses. */
  judge(uses: CooldownUses, reference: readonly number[], taken: boolean): CooldownUseJudgement | null {
    if (uses.uses >= uses.expected) return null;
    const n = reference.length;
    const users = reference.filter(count => count > 0).length;
    if (uses.uses === 0) return {
      family: NEVER_USED_FAMILY,
      evidence: this.rules.consensus({ differs: true, k: users, n, paired: taken && uses.expected >= 2 }),
    };
    return { family: LOST_CAST_FAMILY, evidence: this.rules.count({ uses: uses.uses, expected: uses.expected, n, users }) };
  }

  /** The pull's finding for one cooldown: judged on alive time, or muted when death or the wipe left no time for an expected use. */
  finding(
    name: string, castTimesS: readonly number[], bench: CadenceBenchmark, model: PullModel,
    reference: readonly number[], taken: boolean, caps?: FamilyCaps,
  ): AnalysisFinding | null {
    const uses = this.measure(castTimesS, model.aliveSpans, bench);
    if (uses.expected === 0) return this.unjudged(name, bench, model);
    const judgement = this.judge(uses, reference, taken);
    if (!judgement) return null;
    const severity = this.tones.tone(judgement.family, judgement.evidence, caps);
    const aliveS = spansS(model.aliveSpans);
    const row: UseRow = {
      name, uses, reference, severity, graded: severity === 'red' || severity === 'amber',
      over: aliveS < model.fightDurationS ? `in ${fmtClock(aliveS)} of alive time` : `on a ${fmtClock(model.fightDurationS)} fight`,
    };
    return judgement.family === NEVER_USED_FAMILY ? this.neverUsed(row) : this.lostCast(row);
  }

  private measured(row: UseRow): { value: string; unit: string } {
    const n = row.reference.length;
    return { value: `${row.uses.uses} / ${row.uses.expected}`, unit: n ? `cast(s), ${n} top logs` : 'cast(s)' };
  }

  private neverUsed(row: UseRow): AnalysisFinding {
    const { name, uses, reference } = row;
    const n = reference.length;
    const others = n
      ? `${reference.filter(count => count > 0).length} of ${n} top logs did.`
      : `Top raiders press it ${uses.expected} times in that time.`;
    return {
      family: NEVER_USED_FAMILY.id, severity: row.severity, category: 'never_used', cd_name: name, measured: this.measured(row),
      message: `You never pressed ${name} ${row.over}. ${others}`,
      ...(row.graded ? { details: { remedy: `Press ${name} ${uses.expected}x.` } } : {}), occurrences: [],
    };
  }

  private lostCast(row: UseRow): AnalysisFinding {
    const { name, uses, reference } = row;
    const topLogs = reference.length ? `${reference.length} top logs` : 'Top raiders';
    return {
      family: LOST_CAST_FAMILY.id, severity: row.severity, category: 'lost_cooldown', cd_name: name, measured: this.measured(row),
      message: `You pressed ${name} ${uses.uses} times ${row.over}. ${topLogs} average ${uses.expected} in that time.`,
      ...(row.graded ? { details: { remedy: `Press ${name} ${uses.expected - uses.uses}x more, sooner off cooldown.` } } : {}), occurrences: [],
    };
  }

  private unjudged(name: string, bench: CadenceBenchmark, model: PullModel): AnalysisFinding | null {
    if (benchExpectedUses([[0, model.fightDurationS]], bench).expected === 0) return null;
    const cause = this.pullModel.causeOf(model, 0, model.fightDurationS);
    if (!cause) return null;
    return {
      family: LOST_CAST_FAMILY.id, severity: this.tones.muted(), unjudged: cause, category: 'lost_cooldown', cd_name: name,
      measured: { value: UNJUDGED_VALUE[cause] }, message: UNJUDGED_MESSAGE[cause](name), occurrences: [],
    };
  }
}
