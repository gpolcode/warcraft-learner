import { inject, Injectable } from '@angular/core';
import { mode } from 'd3-array';
import { AnalysisFinding } from '../analysis/analysis.models';
import { AliveSpan, fmtApart, overlapS, round, spansS } from '../analysis/analysis-math';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { PlanSpell } from '../plan/plan.models';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { IdleStretch, RotationParseMeasures } from './rotation-data-source';

/** The game never hastes a global cooldown below this. */
const GCD_FLOOR_S = 0.75;
/** A class whose global cooldown is a flat second never has it hasted. */
const FLAT_GCD_S = 1;
/** The game's base global cooldown, for a spec whose list names none. */
const BASE_GCD_S = 1.5;
/** Haste can at most halve a cast, so a shorter hardcast is a logging artifact. */
const HASTE_FACTOR_MIN = 0.5;
/** Stretch edges are baked to a tenth of a second; rounding both edges keeps the summed length unbiased. */
const STRETCH_DECIMALS = 1;

export const DOWNTIME_FAMILY: FindingFamily = {
  id: 'rotation.downtime',
  label: 'Idle time',
  version: 2,
  tier: 'amber',
  claim: 'You spent a larger share of your alive time idle, past the global cooldown and cast time of each cast, than top raiders spend of theirs.',
  construct: 'Share of alive time before the judged end between two casts that no cast time or global cooldown covers, the global cooldown hasted as the log\'s nearest hardcast reads it.',
  pendingRebuild: null,
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on its metric', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'The player\'s alive spans before the judged end, each top log over its own kill',
  availability: ['At least two casts in the pull'],
  raidDecisions: { relative: [], gated: [], excluded: ['Movement and intermissions the boss forces'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average share, with their count',
  copy: { message: 'You were idle {pct} of {over}, {excess} more than the average of {n} top logs. Aim for {target} or less.', remedy: 'Fill {excess} of idle time with casts.' },
  injectedMistakes: ['idle-5-gcds'],
  limits: [
    'Movement and target loss the log does not show',
    'Channel time past the global cooldown',
    'Haste on a log with no hardcast, read as the base global cooldown',
    'Deaths of top logs, which are not baked, so each top log is alive for its whole kill',
  ],
};

export interface CastingTime {
  idleS: number;
  aliveS: number;
  pct: number;
}

/** The Downtime card's check, split so ingest can bake and judge a top log through the same measure. */
@Injectable({ providedIn: 'root' })
export class DowntimeJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** Null under two casts. Time before the first cast and after the last never counts; ingest bakes the result as `per_parse[].idle_s`. */
  idleStretches(events: readonly TimedEvent[], spells: Readonly<Record<string, PlanSpell>>): IdleStretch[] | null {
    const ordered = events.filter(event => !event.fake && (event.type === 'cast' || event.type === 'begincast')).sort((a, b) => a.atS - b.atS);
    if (ordered.filter(event => event.type === 'cast').length < 2) return null;
    const byId = new Map(Object.values(spells).flatMap(spell => spell.ids.map(id => [id, spell] as const)));
    const listed = Object.values(spells).map(spell => spell.gcd).filter(gcd => gcd > 0);
    const baseGcdS = listed.length ? mode(listed) : BASE_GCD_S;
    const casts = this.castsWithStarts(ordered, byId);
    const factors = casts.flatMap(({ startS, endS, spell }) =>
      spell?.cast_time && endS > startS ? [[endS, Math.min(1, Math.max(HASTE_FACTOR_MIN, (endS - startS) / spell.cast_time))] as const] : []);
    const blocks = casts.map(({ startS, endS, spell }) => {
      const gcdS = this.hastedGcdS(spell ? spell.gcd : baseGcdS, this.nearestFactor(factors, startS));
      return [startS, Math.max(endS, startS + gcdS)] as const;
    }).filter(([startS, endS]) => endS > startS).sort((a, b) => a[0] - b[0]);
    return this.gaps(blocks);
  }

  /** Null with no stretches measured or no alive time. */
  measure(stretches: readonly IdleStretch[] | null, spans: readonly AliveSpan[]): CastingTime | null {
    const aliveS = spansS(spans);
    if (!stretches || aliveS <= 0) return null;
    const idleS = stretches.reduce((sum, [fromS, toS]) => sum + overlapS(spans, fromS, toS), 0);
    return { idleS, aliveS, pct: 100 * idleS / aliveS };
  }

  /** Each top log over its own kill, aligned with `killsS`; a log with under two casts or no kill length carries none. */
  reference(perParse: readonly RotationParseMeasures[], killsS: readonly (number | null | undefined)[]): number[] {
    return perParse.flatMap((parse, index) => this.measure(parse.idle_s ?? null, [[0, killsS[index] ?? 0]])?.pct ?? []);
  }

  /** The effect floor is seconds of idle time, read in the player's own alive time. */
  judge(casting: CastingTime, reference: readonly number[]): Evidence {
    const floor = 100 * VERDICT_CHOICES.effectFloors.timingS / casting.aliveS;
    return this.rules.interval({ observed: casting.pct, reference, side: 'above', floor });
  }

  /** Null unless the rule flags; the tone comes from calibration, so an ungraded row is a comparison with no target or fix. */
  finding(casting: CastingTime, reference: readonly number[], fightDurationS: number, caps?: FamilyCaps): AnalysisFinding | null {
    const evidence = this.judge(casting, reference);
    if (evidence.level !== 'red' && evidence.level !== 'amber') return null;
    const severity = this.tones.tone(DOWNTIME_FAMILY, evidence, caps);
    const graded = this.tones.graded(severity) && evidence.target !== null;
    const topPct = reference.reduce((sum, value) => sum + value, 0) / reference.length;
    const excessS = Math.max(0, casting.idleS - topPct / 100 * casting.aliveS).toFixed(0);
    const over = casting.aliveS < fightDurationS ? 'your alive time' : 'the fight';
    const [pct, target] = fmtApart(casting.pct, evidence.target ?? casting.pct);
    return {
      family: DOWNTIME_FAMILY.id, severity, category: 'cast_efficiency',
      label: 'Idle time',
      measured: { value: `${pct}%`, unit: `idle, top ${topPct.toFixed(0)}%, ${evidence.n} top logs` },
      message: `You were idle ${pct}% of ${over} past each cast's global cooldown and cast time, ${excessS}s more than the average of ${evidence.n} top logs.`
        + (graded ? ` Aim for ${target}% or less.` : ''),
      ...graded ? { details: { remedy: `Fill ${excessS}s of idle time with casts.` } } : {}, occurrences: [],
    };
  }

  /** A hardcast's global cooldown starts at its begincast; a press on the global cooldown ends any cast still pending, so an interrupted one never pairs with a later instant press. */
  private castsWithStarts(ordered: readonly TimedEvent[], byId: ReadonlyMap<number, PlanSpell>): { startS: number; endS: number; spell: PlanSpell | undefined }[] {
    const begun = new Map<number, number>();
    return ordered.flatMap(event => {
      if (event.type === 'begincast') {
        begun.clear();
        begun.set(event.abilityGameID, event.atS);
        return [];
      }
      const spell = byId.get(event.abilityGameID);
      const startS = begun.get(event.abilityGameID) ?? event.atS;
      if (spell?.gcd !== 0) begun.clear();
      else begun.delete(event.abilityGameID);
      return [{ startS, endS: event.atS, spell }];
    });
  }

  private nearestFactor(factors: readonly (readonly [number, number])[], atS: number): number {
    let best: readonly [number, number] | undefined;
    for (const entry of factors) if (!best || Math.abs(entry[0] - atS) < Math.abs(best[0] - atS)) best = entry;
    return best?.[1] ?? 1;
  }

  private hastedGcdS(baseS: number, factor: number): number {
    if (baseS <= 0) return 0;
    if (baseS <= FLAT_GCD_S) return baseS;
    return Math.max(GCD_FLOOR_S, baseS * factor);
  }

  private gaps(blocks: readonly (readonly [number, number])[]): IdleStretch[] {
    const stretches: IdleStretch[] = [];
    let busyUntilS = blocks[0]?.[1] ?? 0;
    for (const [startS, endS] of blocks.slice(1)) {
      const [fromS, toS] = [round(busyUntilS, STRETCH_DECIMALS), round(startS, STRETCH_DECIMALS)];
      if (startS > busyUntilS && toS > fromS) stretches.push([fromS, toS]);
      busyUntilS = Math.max(busyUntilS, endS);
    }
    return stretches;
  }
}
