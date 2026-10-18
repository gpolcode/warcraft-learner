import { inject, Injectable } from '@angular/core';
import { AnalysisFinding } from '../analysis/analysis.models';
import { closestToZero, fmtApart, fmtClock } from '../analysis/analysis-math';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';
import { RotationParseMeasures } from './rotation-data-source';

const LUST_REFERENCE = { population: 'Top Mythic logs for the spec and boss whose raid used Bloodlust mid-fight', minN: VERDICT_CHOICES.minReferenceN };
const LUST_LIMITS = ['Who called Bloodlust and why', 'How long the cooldown\'s own effect overlapped the lust'];
const LUST_RAID_DECISIONS = { relative: ['Bloodlust timing'], gated: ['Bloodlust inside the top raids\' mid-fight lust band'], excluded: ['Bloodlust on the pull'] };
const { beforeS: LUST_BEFORE_S, afterS: LUST_AFTER_S } = VERDICT_CHOICES.lustWindow;

export const BLOODLUST_ALIGNMENT_FAMILY: FindingFamily = {
  id: 'rotation.bloodlust',
  label: 'Cooldowns in Bloodlust',
  version: 1,
  tier: 'amber',
  claim: 'k of n top raiders whose raid lusted mid-fight pressed a cooldown for their lust; you did not press it for your raid\'s lust.',
  construct: 'A use of one plan cooldown from the lust window\'s lead before to its trail after the raid\'s own first Bloodlust.',
  pendingRebuild: 'Overlap of the cooldown\'s aura with the raid\'s Bloodlust',
  reference: LUST_REFERENCE,
  alignment: 'The player\'s own raid lust against each top log\'s own raid lust, both mid-fight and the player\'s inside the top logs\' lust band',
  availability: ['Bloodlust on the player mid-fight', 'Pressed for their lust by at least half of the top logs that lusted mid-fight'],
  raidDecisions: LUST_RAID_DECISIONS,
  rule: 'consensus',
  costClass: 'medium',
  uncertaintyShown: 'k of n top raiders who lusted mid-fight',
  copy: { message: 'You did not press {cd} from {before} before to {after} after your raid\'s Bloodlust at {lust}. {k} of {n} top raiders who lusted mid-fight pressed it for theirs.', remedy: null },
  injectedMistakes: ['move-cooldown-out-of-lust'],
  limits: LUST_LIMITS,
};

export const BLOODLUST_TIMING_FAMILY: FindingFamily = {
  id: 'rotation.bloodlust_timing',
  label: 'Bloodlust timing',
  version: 1,
  tier: 'amber',
  claim: 'You pressed a cooldown further from your raid\'s Bloodlust than top raiders who lusted mid-fight press it from theirs.',
  construct: 'Seconds from the raid\'s own first Bloodlust to the use of one plan cooldown closest to it inside the lust window.',
  pendingRebuild: 'Overlap of the cooldown\'s aura with the raid\'s Bloodlust',
  reference: LUST_REFERENCE,
  alignment: BLOODLUST_ALIGNMENT_FAMILY.alignment,
  availability: ['Bloodlust on the player mid-fight', 'A use inside the lust window'],
  raidDecisions: LUST_RAID_DECISIONS,
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The top logs\' average offset from their lust, with their count',
  copy: { message: 'You pressed {cd} {offset} your raid\'s Bloodlust at {lust}. {n} top raiders who lusted mid-fight pressed it {avg} theirs on average.', remedy: null },
  injectedMistakes: ['move-cooldown-out-of-lust'],
  limits: LUST_LIMITS,
};

/** The top logs whose raid lusted mid-fight, and which of them pressed one cooldown for it. */
export interface LustReference {
  /** Each such log's lust, in the order of the bench's sources. */
  lustsS: number[];
  /** The offset of each such log that pressed the cooldown for its lust. */
  offsetsS: number[];
}

interface LustBand {
  inside: boolean;
  fromS: number;
  toS: number;
}

/** The Bloodlust checks, split so ingest can judge a top log as the player through the same measures. */
@Injectable({ providedIn: 'root' })
export class BloodlustJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** Seconds from the lust to the use closest to it inside the lust window; null without a lust or a use in the window. */
  measureOffset(castTimesS: readonly number[], lustS: number | null): number | null {
    if (lustS === null) return null;
    const offsets = castTimesS
      .filter(castS => lustS - LUST_BEFORE_S <= castS && castS <= lustS + LUST_AFTER_S)
      .map(castS => castS - lustS);
    return offsets.length ? closestToZero(offsets) : null;
  }

  /** A pull lust's window holds the opener, so only a lust whose window starts after the pull says the cooldown waits for it. */
  isMidFight(lustS: number | null): lustS is number {
    return lustS !== null && lustS > LUST_BEFORE_S;
  }

  reference(perParse: readonly RotationParseMeasures[], name: string): LustReference {
    const lusting = perParse.filter(parse => this.isMidFight(parse.lust_s));
    return {
      lustsS: lusting.flatMap(parse => parse.lust_s === null ? [] : [parse.lust_s]),
      offsetsS: lusting.flatMap(parse => {
        const offsetS = this.measureOffset(parse.cd_casts_s[name] ?? [], parse.lust_s);
        return offsetS === null ? [] : [offsetS];
      }),
    };
  }

  /** Learned only from top logs that lusted mid-fight, so a raid that lusts on the pull never teaches it. */
  wantsLust(reference: LustReference): boolean {
    const n = reference.lustsS.length;
    return n >= VERDICT_CHOICES.minReferenceN && reference.offsetsS.length / n >= VERDICT_CHOICES.lustWantShare;
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

  judgeAlignment(offsetS: number | null, reference: LustReference, band: LustBand): Evidence {
    return this.rules.consensus({ differs: offsetS === null, k: reference.offsetsS.length, n: reference.lustsS.length, paired: band.inside });
  }

  /** Too early leaves the lust before the cooldown ends, too late misses its start, so both sides are a difference. */
  judgeTiming(offsetS: number, reference: LustReference): Evidence {
    const floor = VERDICT_CHOICES.effectFloors.timingS;
    const late = this.rules.interval({ observed: offsetS, reference: reference.offsetsS, side: 'above', floor });
    return late.level === 'neutral' ? this.rules.interval({ observed: offsetS, reference: reference.offsetsS, side: 'below', floor }) : late;
  }

  /** A raid decision reads as what happened and what top raids did, so no row carries a remedy. */
  findings(
    name: string, castTimesS: readonly number[], lustS: number | null, perParse: readonly RotationParseMeasures[], caps?: FamilyCaps,
  ): AnalysisFinding[] {
    const reference = this.reference(perParse, name);
    if (lustS === null || !this.wantsLust(reference)) return [];
    const offsetS = this.measureOffset(castTimesS, lustS);
    const band = this.judgeBand(lustS, reference);
    if (!band.inside) return offsetS === null ? [this.outsideBand(name, lustS, reference, band)] : [];
    if (offsetS === null) return [this.missed(name, lustS, reference, band, caps)];
    const timing = this.timing(name, castTimesS, { lustS, offsetS, caps }, reference);
    return timing ? [timing] : [];
  }

  private missed(name: string, lustS: number, reference: LustReference, band: LustBand, caps?: FamilyCaps): AnalysisFinding {
    const evidence = this.judgeAlignment(null, reference, band);
    const k = reference.offsetsS.length;
    return {
      family: BLOODLUST_ALIGNMENT_FAMILY.id, severity: this.tones.tone(BLOODLUST_ALIGNMENT_FAMILY, evidence, caps),
      category: 'cooldown_alignment', cd_name: name, timestamp_s: lustS,
      span: { fromS: lustS - LUST_BEFORE_S, toS: lustS + LUST_AFTER_S },
      measured: { value: 'not pressed', unit: `${k} of ${evidence.n} top logs pressed it` },
      message: `You did not press ${name} from ${LUST_BEFORE_S}s before to ${LUST_AFTER_S}s after your raid's Bloodlust at ${fmtClock(lustS)}. `
        + `${k} of ${evidence.n} top raiders who lusted mid-fight pressed it for theirs.`,
      occurrences: [],
    };
  }

  /** Context, never a flag: the top logs' lusts say nothing about a lust this far from theirs. */
  private outsideBand(name: string, lustS: number, reference: LustReference, band: LustBand): AnalysisFinding {
    const n = reference.lustsS.length;
    const [lust, from, to] = this.bandText(lustS, Math.max(band.fromS, LUST_BEFORE_S), band.toS);
    return {
      family: BLOODLUST_ALIGNMENT_FAMILY.id, severity: this.tones.neutral(),
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

  private timing(
    name: string, castTimesS: readonly number[], judged: { lustS: number; offsetS: number; caps?: FamilyCaps }, reference: LustReference,
  ): AnalysisFinding | null {
    const { lustS, offsetS, caps } = judged;
    const evidence = this.judgeTiming(offsetS, reference);
    const severity = this.tones.tone(BLOODLUST_TIMING_FAMILY, evidence, caps);
    if (!this.tones.graded(severity)) return null;
    const castS = castTimesS.find(timeS => timeS - lustS === offsetS) ?? lustS + offsetS;
    const avgS = reference.offsetsS.reduce((sum, value) => sum + value, 0) / reference.offsetsS.length;
    return {
      family: BLOODLUST_TIMING_FAMILY.id, severity,
      category: 'cooldown_alignment', cd_name: name, timestamp_s: castS,
      span: { fromS: Math.min(lustS, castS), toS: Math.max(lustS, castS) },
      measured: { value: this.signed(offsetS), unit: `top ${this.signed(avgS)}, ${evidence.n} top logs` },
      message: `You pressed ${name} ${this.relative(offsetS)} your raid's Bloodlust at ${fmtClock(lustS)}. `
        + `${evidence.n} top raiders who lusted mid-fight pressed it ${this.relative(avgS)} theirs on average.`,
      occurrences: [],
    };
  }

  private signed(offsetS: number): string {
    const rounded = Math.round(offsetS);
    return `${rounded < 0 ? '-' : '+'}${Math.abs(rounded)}s`;
  }

  private relative(offsetS: number): string {
    return `${Math.abs(Math.round(offsetS))}s ${offsetS < 0 ? 'before' : 'after'}`;
  }
}
