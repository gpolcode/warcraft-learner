import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { PullModel } from '../analysis/pull-model-service';
import { fmtApart, fmtClock, round } from '../analysis/analysis-math';
import { AuraSpan } from '../defensive/defensive-data-source';
import { DefensiveUsesService } from '../defensive/defensive-uses-service';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { RotationParseMeasures } from './rotation-data-source';

const LUST_REFERENCE = { population: 'Top Mythic logs for the spec and boss whose raid used Bloodlust mid-fight and that carry their cooldown auras', minN: VERDICT_CHOICES.minReferenceN };
const MID_FIGHT_S = VERDICT_CHOICES.midFightLustS;

/** Every aura `BLOODLUST_IDS` names lasts this long; the player's own aura ends at a death, which the fold explains, so the raid's lust is read at its full length. */
export const LUST_DURATION_S = 40;

export const BLOODLUST_FAMILY: FindingFamily = {
  id: 'rotation.bloodlust',
  label: 'Cooldowns in Bloodlust',
  version: 2,
  tier: 'amber',
  claim: 'k of n top raiders whose raid lusted mid-fight had a cooldown up during their lust; you did not have it up during your raid\'s.',
  construct: 'Seconds one plan cooldown\'s effect overlaps the raid\'s first Bloodlust, over the lust\'s 40 s or to the kill; the effect is the aura the press opened on the player, else the cooldown\'s stated duration from the press.',
  pendingRebuild: null,
  reference: LUST_REFERENCE,
  alignment: 'The player\'s own raid lust against each top log\'s own raid lust, both mid-fight and the player\'s inside the top logs\' lust band',
  availability: ['Bloodlust on the player mid-fight', 'Up during their lust for at least half of the top logs that lusted mid-fight', 'Alive and before the judged end through the lust'],
  raidDecisions: { relative: ['Bloodlust timing'], gated: ['Bloodlust inside the top raids\' mid-fight lust band'], excluded: ['Bloodlust on the pull'] },
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who lusted mid-fight',
  copy: { message: '{cd} was up for 0s of your raid\'s {length} Bloodlust at {lust}. {k} of {n} top raiders who lusted mid-fight had it up for theirs.', remedy: null },
  injectedMistakes: ['move-cooldown-out-of-lust'],
  limits: ['Who called Bloodlust and why', 'A cooldown whose effect sits on the target is read for its stated duration from the press', 'A top log that died during its lust'],
};

export interface LustSpan {
  fromS: number;
  toS: number;
}

export interface LustOverlap {
  upS: number;
  /** A use with no length counts once it falls inside the lust, so a zero-duration press is still up. */
  up: boolean;
}

/** The top logs whose raid lusted mid-fight and that carry their cooldown auras, each measured on its own lust. */
export interface LustReference {
  /** Each such log's lust, in the order of the bench's sources. */
  lustsS: number[];
  overlaps: LustOverlap[];
}

interface LustBand {
  inside: boolean;
  fromS: number;
  toS: number;
}

/** The Bloodlust check, split so ingest and the harness measure a top log through the same functions as the player. */
@Injectable({ providedIn: 'root' })
export class BloodlustJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);
  private readonly uses = inject(DefensiveUsesService);

  /** Ingest bakes these into `per_parse[].cd_up_s`; the page reads the player's through the same call. */
  effectSpans(auraSpans: readonly (readonly [number, number | null])[], castTimesS: readonly number[], durationS: number, fightEndS: number): AuraSpan[] {
    const spans = this.uses.uses(auraSpans, castTimesS, fightEndS)
      .map((use): AuraSpan => [use.start_s, use.end_s > use.start_s ? use.end_s : Math.min(fightEndS, use.start_s + durationS)])
      .sort((a, b) => a[0] - b[0]);
    const merged: AuraSpan[] = [];
    for (const [fromS, toS] of spans) {
      const last = merged.at(-1);
      if (last && fromS <= last[1]) last[1] = Math.max(last[1], toS);
      else merged.push([fromS, toS]);
    }
    return merged.map(([fromS, toS]): AuraSpan => [round(fromS), round(toS)]);
  }

  /** A pull lust overlaps the opener, which the opener's own checks judge, so only a later lust says the cooldown waits for it. */
  isMidFight(lustS: number | null | undefined): lustS is number {
    return lustS != null && lustS > MID_FIGHT_S;
  }

  lustSpan(lustS: number, killS: number | null): LustSpan {
    return { fromS: lustS, toS: killS === null ? lustS + LUST_DURATION_S : Math.min(lustS + LUST_DURATION_S, killS) };
  }

  /** A kill inside the lust cuts it short; a wipe or a death inside it is the fold's to explain. */
  lustOf(lustS: number | null, model: Pick<PullModel, 'judgedEndS' | 'judgedEndCause'>): LustSpan | null {
    return lustS === null ? null : this.lustSpan(lustS, model.judgedEndCause === 'kill' ? model.judgedEndS : null);
  }

  measureOverlap(spans: readonly AuraSpan[], lust: LustSpan): LustOverlap {
    const touching = spans.filter(([fromS, toS]) => fromS <= lust.toS && toS >= lust.fromS);
    const upS = touching.reduce((sum, [fromS, toS]) => sum + Math.max(0, Math.min(toS, lust.toS) - Math.max(fromS, lust.fromS)), 0);
    return { upS, up: touching.length > 0 };
  }

  /** A bench before the aura spans were baked gives no reference, so its rows stay unjudged. */
  reference(perParse: readonly RotationParseMeasures[], killsS: readonly (number | null)[], name: string): LustReference {
    const logs = perParse.flatMap((parse, index) => {
      if (!this.isMidFight(parse.lust_s) || !parse.cd_up_s) return [];
      const lust = this.lustSpan(parse.lust_s, killsS[index] ?? null);
      return [{ lustS: parse.lust_s, overlap: this.measureOverlap(parse.cd_up_s[name] ?? [], lust) }];
    });
    return { lustsS: logs.map(log => log.lustS), overlaps: logs.map(log => log.overlap) };
  }

  /** Learned only from top logs that lusted mid-fight, so a raid that lusts on the pull never teaches it. */
  wantsLust(reference: LustReference): boolean {
    const n = reference.lustsS.length;
    return n >= VERDICT_CHOICES.minReferenceN && this.upCount(reference) / n >= VERDICT_CHOICES.lustWantShare;
  }

  /** The player's lust is comparable only when it is mid-fight and no further from the top logs' lusts than one more top log would be. */
  judgeBand(lustS: number, reference: LustReference): LustBand {
    const floor = VERDICT_CHOICES.effectFloors.timingS;
    const late = this.rules.interval({ observed: lustS, reference: reference.lustsS, side: 'above', floor });
    const early = this.rules.interval({ observed: lustS, reference: reference.lustsS, side: 'below', floor });
    return {
      inside: this.isMidFight(lustS) && late.level === 'neutral' && early.level === 'neutral',
      fromS: early.target ?? lustS, toS: late.target ?? lustS,
    };
  }

  judge(overlap: LustOverlap, reference: LustReference, band: LustBand): Evidence {
    return this.rules.consensus({ differs: !overlap.up, k: this.upCount(reference), n: reference.lustsS.length, paired: band.inside });
  }

  /** A raid decision reads as what happened and what top raids did, so no row carries a remedy. */
  findings(
    name: string, spans: readonly AuraSpan[], lust: LustSpan | null,
    top: { perParse: readonly RotationParseMeasures[]; killsS: readonly (number | null)[] }, caps?: FamilyCaps,
  ): AnalysisFinding[] {
    const reference = this.reference(top.perParse, top.killsS, name);
    if (lust === null || !this.wantsLust(reference)) return [];
    const overlap = this.measureOverlap(spans, lust);
    const band = this.judgeBand(lust.fromS, reference);
    if (overlap.up) return [];
    return [band.inside ? this.missed(name, lust, reference, band, caps) : this.outsideBand(name, lust.fromS, reference, band)];
  }

  private upCount(reference: LustReference): number {
    return reference.overlaps.filter(overlap => overlap.up).length;
  }

  private missed(name: string, lust: LustSpan, reference: LustReference, band: LustBand, caps?: FamilyCaps): AnalysisFinding {
    const evidence = this.judge({ upS: 0, up: false }, reference, band);
    const k = this.upCount(reference);
    const lengthS = Math.round(lust.toS - lust.fromS);
    return {
      family: BLOODLUST_FAMILY.id, severity: this.tones.tone(BLOODLUST_FAMILY, evidence, caps),
      category: 'cooldown_alignment', cd_name: name, timestamp_s: lust.fromS,
      span: { fromS: lust.fromS, toS: lust.toS },
      measured: { value: `0s of ${lengthS}s`, unit: `in Bloodlust, ${k} of ${evidence.n} top logs had it up` },
      message: `${name} was up for 0s of your raid's ${lengthS}s Bloodlust at ${fmtClock(lust.fromS)}. `
        + `${k} of ${evidence.n} top raiders who lusted mid-fight had it up for theirs.`,
      occurrences: [],
    };
  }

  /** Context, never a flag: the top logs' lusts say nothing about a lust this far from theirs. */
  private outsideBand(name: string, lustS: number, reference: LustReference, band: LustBand): AnalysisFinding {
    const n = reference.lustsS.length;
    const [lust, from, to] = this.bandText(lustS, Math.max(band.fromS, MID_FIGHT_S), band.toS);
    return {
      family: BLOODLUST_FAMILY.id, severity: this.tones.neutral(),
      category: 'cooldown_alignment', cd_name: name, timestamp_s: lustS,
      measured: { value: lust, unit: `top logs ${from} to ${to}` },
      message: `Your raid's Bloodlust came at ${lust}. The ${n} top raiders who lusted mid-fight had theirs from ${from} to ${to}, `
        + `so ${name} is not judged against yours.`,
      occurrences: [],
    };
  }

  /** A lust a moment past the band shares the edge's clock string, so all three fall back to seconds then. */
  private bandText(lustS: number, fromS: number, toS: number): [string, string, string] {
    const nearS = lustS > toS ? toS : fromS;
    if (fmtClock(lustS) !== fmtClock(nearS)) return [fmtClock(lustS), fmtClock(fromS), fmtClock(toS)];
    const [lust] = fmtApart(lustS, nearS);
    const decimals = lust.split('.')[1]?.length ?? 0;
    return [`${lust}s`, `${fromS.toFixed(decimals)}s`, `${toS.toFixed(decimals)}s`];
  }
}
