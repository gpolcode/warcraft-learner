import { inject, Injectable } from '@angular/core';
import { AliveSpan, spansS } from '../analysis/analysis-math';
import { BurstWindow } from '../analysis/analysis.models';
import { TimedEvent } from '../analysis/wcl-projections-service';
import { DecisionRuleService } from '../verdict/decision-rule-service';
import { FindingFamily } from '../verdict/finding-family.models';
import { ToneService } from '../verdict/tone-service';
import { Evidence, FamilyCaps, Tone } from '../verdict/tone.models';
import { VERDICT_CHOICES } from '../verdict/verdict-choices';

export const BURST_WINDOW_FAMILY: FindingFamily = {
  id: 'burst.window',
  label: 'Burst windows',
  version: 1,
  tier: 'amber',
  claim: 'You dealt less damage in a burst window than the top raiders who had it, by more than they differ from each other.',
  construct: 'Damage in the window\'s span on the pull clock, against each top log\'s damage in its own densest run near that time.',
  pendingRebuild: 'Amplification on the common span: window damage over the player\'s own alive-time damage rate, the same offset search on both sides, every accepted top log as reference',
  reference: { population: 'Top Mythic logs for the spec and boss, ranked on damage, whose burst formed the window', minN: VERDICT_CHOICES.minReferenceN },
  alignment: 'Pull clock; the window wholly inside alive time before the judged end',
  availability: ['A damage spec', 'The window lies wholly inside alive time before the judged end'],
  raidDecisions: { relative: [], gated: [], excluded: ['Bloodlust timing', 'Phase pushes that move the window'] },
  rule: 'interval',
  costClass: 'medium',
  uncertaintyShown: 'The count of top logs that had the window',
  copy: { message: 'You dealt {damage} here, less than the {n} top logs that had this window. Aim for {target} or more.', remedy: null },
  injectedMistakes: ['shift-burst-15s'],
  limits: ['A burst moved by a few seconds reads as lost damage', 'Targets and boss movement inside the window', 'The damage gap the player carries all pull long'],
};

const VERDICT_ICON: Record<string, string> = { amber: 'warning_amber', neutral: 'compare_arrows' };
const BENCH_ICON = 'insights';

/** What one burst window says about the pull; `family` marks a check made through the verdict contract. */
export interface BurstVerdict {
  family: string;
  status: Tone;
  icon: string;
  message: string;
  n: number;
}

const COMPACT = [1, 2, 3].map(digits => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: digits }));

/** The Burst windows card's check, split so ingest can judge a top log as the player through the same measure. */
@Injectable({ providedIn: 'root' })
export class BurstJudgeService {
  private readonly rules = inject(DecisionRuleService);
  private readonly tones = inject(ToneService);

  /** A window closing the fight keeps the hit stamped on its last instant, as ingest's last bin does. */
  measure(damage: readonly TimedEvent[], startS: number, endS: number, closesFight: boolean): number {
    return damage
      .filter(event => event.type === 'damage' && event.atS >= startS && (closesFight ? event.atS <= endS : event.atS < endS))
      .reduce((sum, event) => sum + this.hitDamage(event), 0);
  }

  /** Damage per alive second; ingest passes a top log's whole pull as its one span. */
  aliveRate(damage: readonly TimedEvent[], spans: readonly AliveSpan[]): number {
    const aliveS = spansS(spans);
    if (aliveS <= 0) return 0;
    const inSpans = damage.filter(event => event.type === 'damage' && spans.some(([startS, endS]) => event.atS >= startS && event.atS < endS));
    return inSpans.reduce((sum, event) => sum + this.hitDamage(event), 0) / aliveS;
  }

  /** Each top log that formed the window, aligned with the bench's `sources` through `parse`. */
  reference(window: BurstWindow): number[] {
    return window.members.map(member => member.damage);
  }

  /** The effect floor is the damage of the timing floor's seconds at the player's own alive-time rate. */
  judge(damage: number, reference: readonly number[], ratePerS: number): Evidence {
    const floor = VERDICT_CHOICES.effectFloors.timingS * ratePerS;
    return this.rules.interval({ observed: damage, reference, side: 'below', floor });
  }

  verdict(window: BurstWindow, damage: number, ratePerS: number, caps?: FamilyCaps): BurstVerdict {
    const evidence = this.judge(damage, this.reference(window), ratePerS);
    const status = this.tones.tone(BURST_WINDOW_FAMILY, evidence, caps);
    const n = evidence.n;
    const base = { family: BURST_WINDOW_FAMILY.id, status, icon: VERDICT_ICON[status] ?? VERDICT_ICON['neutral'] ?? '', n };
    if (this.tones.graded(status) && evidence.target !== null) {
      const [dealt, target] = this.damageApart(damage, evidence.target);
      return { ...base, message: `You dealt ${dealt} here, less than the ${n} top logs that had this window. Aim for ${target} or more.` };
    }
    return { ...base, message: `You dealt ${this.damageApart(damage, damage)[0]} here. ${this.tooFew(n) ?? `${n} top logs had this window.`}` };
  }

  /** A pre-fight window judges no pull: it names how many top logs formed it. */
  benchVerdict(window: BurstWindow): BurstVerdict {
    const n = window.members.length;
    const message = n ? `${n} top ${n === 1 ? 'log' : 'logs'} had this window.` : '';
    return { family: BURST_WINDOW_FAMILY.id, status: this.tones.neutral(), icon: BENCH_ICON, message, n };
  }

  private tooFew(n: number): string | null {
    if (n === 0) return 'No top log carries its own damage for this window, so it is not judged.';
    if (n >= VERDICT_CHOICES.minReferenceN) return null;
    return `Only ${n} top ${n === 1 ? 'log' : 'logs'} had this window, too few to judge.`;
  }

  private hitDamage(event: TimedEvent): number {
    return Math.max(0, (event.amount ?? 0) + (event.absorbed ?? 0));
  }

  /** A flagged amount never prints as its own target: one more digit while the two read the same. */
  private damageApart(value: number, edge: number): [string, string] {
    const pair = (format: Intl.NumberFormat): [string, string] => [format.format(value), format.format(edge)];
    return COMPACT.map(pair).find(([a, b]) => a !== b) ?? pair(COMPACT[0] ?? new Intl.NumberFormat('en'));
  }
}
