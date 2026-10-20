import { inject, Injectable } from '@angular/core';
import { AliveSpan, spansS } from '../analysis/analysis-math';
import { BurstWindow } from '../analysis/analysis.models';
import { TimedEvent } from '../analysis/wcl-projections-service';
import type { ParseRanking } from '../wcl/wcl.models';
import { BurstParseMeasures } from './burst-data-source';
import { mean } from 'd3-array';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps, RowRank, Tone } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

export const BURST_WINDOW_FAMILY: FindingFamily = {
  id: 'burst.window',
  label: 'Burst windows',
  version: 2,
  tier: 'amber',
  claim: 'You raised your damage less in a burst window than the top raiders did, by more than they differ from each other.',
  construct: 'Damage on the window\'s span, at the best offset within the timing floor, over the log\'s own damage per alive second; the same span and search for the player and every top log.',
  pendingRebuild: null,
  reference: { population: 'Every accepted top Mythic log for the spec and boss, ranked on damage, whose kill reaches the window', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Pull clock, the same span and offset search on both sides; the window wholly inside alive time before the judged end',
  availability: ['A damage spec', 'The window lies wholly inside alive time before the judged end', 'A bench that bakes each top log\'s damage per second'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing', 'Phase pushes that move the window'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The count of top logs measured on the window',
  copy: { message: 'You dealt {damage} here, {multiple} your pull average, less than the {n} top logs. Aim for {target} or more.', remedy: null },
  injectedMistakes: ['shift-burst-15s'],
  limits: ['A burst moved by more than the timing floor reads as a weak one', 'Targets and boss movement inside the window', 'Damage another player\'s buff or a raid cooldown adds'],
};

const VERDICT_ICON: Record<string, string> = { amber: 'warning_amber', neutral: 'compare_arrows' };
const BENCH_ICON = 'insights';

/** What one burst window says about the pull; `family` marks a check made through the verdict contract. */
export interface BurstVerdict {
  family: string;
  status: Tone;
  /** Absent where no rule judged it. */
  rank?: RowRank;
  icon: string;
  message: string;
  n: number;
}

/** A window's span on the pull clock in whole seconds, the unit the damage series is baked in. */
interface WholeSpan {
  startS: number;
  lengthS: number;
}

/** One log's damage on the best span the search found and how far it rises above the log's own damage per alive second. */
export interface BurstMeasure extends WholeSpan {
  damage: number;
  amplification: number;
}

const COMPACT = [1, 2, 3].map(digits => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: digits }));
const MULTIPLE = [1, 2, 3].map(digits => new Intl.NumberFormat('en', { minimumFractionDigits: 1, maximumFractionDigits: digits }));

/** The Burst windows card's check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class BurstJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** A window closing the fight keeps the hit stamped on its last instant, as ingest's last bin does. */
  spanDamage(damage: readonly TimedEvent[], startS: number, endS: number, closesFight: boolean): number {
    return damage
      .filter(event => event.type === 'damage' && event.atS >= startS && (closesFight ? event.atS <= endS : event.atS < endS))
      .reduce((sum, event) => sum + this.hitDamage(event), 0);
  }

  /** Whole seconds, so ingest bakes and the runtime reads the same integers; a hit outside the fight clamps into its first or last second. */
  series(damage: readonly TimedEvent[], fightLenS: number): number[] {
    const seconds = Math.max(1, Math.ceil(fightLenS));
    const perS = new Array<number>(seconds).fill(0);
    for (const event of damage) {
      if (event.type !== 'damage') continue;
      const second = Math.min(Math.max(Math.floor(event.atS), 0), seconds - 1);
      perS[second] = (perS[second] ?? 0) + this.hitDamage(event);
    }
    return perS.map(Math.round);
  }

  /** The best span within the timing floor of the window's own, so a burst a few seconds off the top logs' clock still counts; null when no span fits the pull or no damage was dealt while alive. */
  measure(perS: readonly number[], window: Pick<BurstWindow, 'time_s' | 'window_length_s'>, spans: readonly AliveSpan[]): BurstMeasure | null {
    const rate = this.aliveRate(perS, spans);
    const { startS, lengthS } = this.wholeSpan(window);
    const searchS = VERDICT_CHOICES.effectFloors.timingS;
    let best: { damage: number; startS: number } | null = null;
    for (let offsetS = -searchS; offsetS <= searchS; offsetS++) {
      const fromS = startS + offsetS;
      if (fromS < 0 || fromS + lengthS > perS.length) continue;
      const damage = perS.slice(fromS, fromS + lengthS).reduce((sum, value) => sum + value, 0);
      if (!best || damage > best.damage) best = { damage, startS: fromS };
    }
    if (!best || rate <= 0) return null;
    return { ...best, lengthS, amplification: best.damage / (lengthS * rate) };
  }

  /** Every top log whose kill reaches the window's end, its average read over the player's own alive time, so both sides share the span; a pre-fight view passes no spans and reads each whole kill. */
  reference(window: BurstWindow, perParse: readonly BurstParseMeasures[], sources: readonly ParseRanking[], spans?: readonly AliveSpan[]): number[] {
    const { startS, lengthS } = this.wholeSpan(window);
    return perParse.flatMap((parse, index) => {
      const fightS = sources[index]?.duration_s ?? parse.damage_per_s.length;
      if (startS + lengthS > fightS) return [];
      const clipped = (spans ?? [[0, fightS]]).flatMap(([fromS, toS]): AliveSpan[] => fromS < fightS ? [[fromS, Math.min(toS, fightS)]] : []);
      const measured = this.measure(parse.damage_per_s, window, clipped);
      return measured ? [measured.amplification] : [];
    });
  }

  /** The effect floor is the timing floor's seconds of the log's own average damage, spread over the window. */
  judge(amplification: number, reference: readonly number[], window: Pick<BurstWindow, 'time_s' | 'window_length_s'>): Evidence {
    const floor = VERDICT_CHOICES.effectFloors.timingS / this.wholeSpan(window).lengthS;
    return this.rules.interval({ observed: amplification, reference, side: 'below', floor });
  }

  verdict(window: BurstWindow, measured: BurstMeasure | null, reference: readonly number[], caps?: FamilyCaps): BurstVerdict {
    if (!measured) {
      return this.comparison(reference.length, 'You dealt no damage while alive, so this window is not judged.');
    }
    const evidence = this.judge(measured.amplification, reference, window);
    const status = this.tones.tone(BURST_WINDOW_FAMILY, evidence, caps);
    const n = evidence.n;
    const base = { family: BURST_WINDOW_FAMILY.id, status, rank: this.tones.rank(BURST_WINDOW_FAMILY, evidence), icon: VERDICT_ICON[status] ?? VERDICT_ICON['neutral'] ?? '', n };
    const dealt = this.damageText(measured.damage);
    if (this.tones.graded(status) && evidence.target !== null) {
      const [multiple, target] = this.multiplesApart(measured.amplification, evidence.target);
      return { ...base, message: `You dealt ${dealt} here, ${multiple} your pull average, less than the ${n} top logs. Aim for ${target} or more.` };
    }
    const [multiple] = this.multiplesApart(measured.amplification, measured.amplification);
    const [average] = this.multiplesApart(mean(reference) ?? 0, mean(reference) ?? 0);
    const against = this.tooFew(n) ?? `The ${n} top logs average ${average} here.`;
    return { ...base, message: `You dealt ${dealt} here, ${multiple} your pull average. ${against}` };
  }

  /** A pre-fight window judges no pull: it names how many top logs formed it. */
  benchVerdict(window: BurstWindow): BurstVerdict {
    const n = window.members.length;
    const message = n ? `${n} top ${n === 1 ? 'log' : 'logs'} had this window.` : '';
    return { family: BURST_WINDOW_FAMILY.id, status: this.tones.neutral(), icon: BENCH_ICON, message, n };
  }

  private comparison(n: number, message: string): BurstVerdict {
    return { family: BURST_WINDOW_FAMILY.id, status: this.tones.neutral(), icon: VERDICT_ICON['neutral'] ?? '', n, message };
  }

  /** Damage over alive time, read from the seconds that start inside an alive span. */
  private aliveRate(perS: readonly number[], spans: readonly AliveSpan[]): number {
    const aliveS = spansS(spans);
    if (aliveS <= 0) return 0;
    const alive = perS.reduce((sum, value, second) => spans.some(([startS, endS]) => second >= startS && second < endS) ? sum + value : sum, 0);
    return alive / aliveS;
  }

  private wholeSpan(window: Pick<BurstWindow, 'time_s' | 'window_length_s'>): WholeSpan {
    return { startS: Math.round(window.time_s), lengthS: Math.max(1, Math.round(window.window_length_s)) };
  }

  private tooFew(n: number): string | null {
    if (n === 0) return 'No top log carries its own damage for this window, so it is not judged.';
    if (n >= VERDICT_CHOICES.minReferenceN) return null;
    return `Only ${n} top ${n === 1 ? 'log reaches' : 'logs reach'} this window, too few to judge.`;
  }

  private hitDamage(event: TimedEvent): number {
    return Math.max(0, (event.amount ?? 0) + (event.absorbed ?? 0));
  }

  private damageText(value: number): string {
    return (COMPACT[0] ?? new Intl.NumberFormat('en')).format(value);
  }

  /** A flagged multiple never prints as its own target: one more digit while the two read the same. */
  private multiplesApart(value: number, edge: number): [string, string] {
    const pair = (format: Intl.NumberFormat): [string, string] => [`${format.format(value)}x`, `${format.format(edge)}x`];
    return MULTIPLE.map(pair).find(([a, b]) => a !== b) ?? pair(MULTIPLE[0] ?? new Intl.NumberFormat('en'));
  }
}
