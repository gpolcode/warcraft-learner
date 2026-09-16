import { Injectable, inject } from '@angular/core';
import type { Rulebook, RulebookCooldown, RulebookDefensive, RulebookRule, RuleSeverity } from '../rulebook/rulebook.models';
import type { SpecMeta } from '../data-files/spec-meta.models';
import type { SpecTalents } from '../gear/talent.models';
import type { ResolvedApl, SimcTier, SpellRecord } from '../simc/simc.models';
import { SimcAplService } from '../simc/simc-apl-service';
import { SimcExpressionService } from '../simc/simc-expression-service';
import { SpellDataDumpService } from '../simc/spell-data-dump-service';
import { HashService } from '../../../shared/util-hash/hash-service';
import { AbilityIndexService } from './ability-index-service';
import { CooldownDerivationService, type DefensiveEntry, type MajorCooldownEntry } from './cooldown-derivation-service';
import { RuleDerivationService } from './rule-derivation-service';
import { HERO_PREFIX, RuleGateService } from './rule-gate-service';
import { RulebookCopyService } from './rulebook-copy-service';
import { RULEBOOK_EXCLUSIONS } from './rulebook-exclusions';
import type { AbilityIndex, ParseSample, RuleDraft, RulebookGap, RulebookSources } from './rulebook-build.models';

/** The raw texts one spec's sources are read from. */
export interface RulebookSourceTexts {
  spec: SpecMeta;
  tier: SimcTier;
  profile: string;
  spellData: string;
  talents: SpecTalents;
}

export interface RulebookBuild {
  rulebook: Rulebook;
  /** What the sources and the parses left unread or unresolved. */
  gaps: RulebookGap[];
}

/** SimulationCraft numbers a talent name shared by several entries: `ancient_arts_3`. */
const ORDINAL = /_(\d+)$/;

@Injectable({ providedIn: 'root' })
export class RulebookBuildService {
  private readonly apl = inject(SimcAplService);
  private readonly expressions = inject(SimcExpressionService);
  private readonly dump = inject(SpellDataDumpService);
  private readonly hash = inject(HashService);
  private readonly abilities = inject(AbilityIndexService);
  private readonly cooldowns = inject(CooldownDerivationService);
  private readonly rules = inject(RuleDerivationService);
  private readonly gates = inject(RuleGateService);
  private readonly copy = inject(RulebookCopyService);

  /** `midnight/MID2` as the run receives it, or null for anything but `<branch>/<dir>`. */
  parseTier(raw: string | null | undefined): SimcTier | null {
    const [branch, dir, ...rest] = (raw ?? '').split('/');
    if (!branch || !dir || rest.length) return null;
    return { branch, dir };
  }

  /** `midnight/MID2` wears `midnight_season_2`: the branch names the expansion, the directory's digits the season. */
  protected setBonusToken(tier: SimcTier): string {
    const season = /\d+$/.exec(tier.dir)?.[0] ?? '';
    return `${tier.branch.toLowerCase()}_season_${season}`;
  }

  /** One spec's sources read once per run: the exclusions applied, the key hashed from what the rules read, and the gaps the sources alone leave. */
  async prepare(texts: RulebookSourceTexts): Promise<RulebookSources> {
    const excluded = new Set(RULEBOOK_EXCLUSIONS[texts.spec.spec] ?? []);
    const resolved = this.apl.resolve(this.apl.parse(texts.profile), this.setBonusToken(texts.tier));
    const actions = resolved.actions.filter(action => !excluded.has(action.action)).map((action, priority) => ({ ...action, priority }));
    const records = this.abilities.ownedRecords(this.dump.parse(texts.spellData), texts.spec.classLabel, texts.spec.specLabel)
      .filter(record => !excluded.has(this.dump.token(record.name)));
    const apl: ResolvedApl = { ...resolved, actions };
    const key = await this.hash.shortHash(this.readable(apl, records));
    const sources: RulebookSources = { spec: texts.spec, apl, records, talents: texts.talents, key, gaps: [] };
    return { ...sources, gaps: this.build(sources, []).gaps };
  }

  /** Each line's action and printed gates, then every owned record: a change to either is one the rules can see, and nothing else is. */
  private readable(apl: ResolvedApl, records: SpellRecord[]): string {
    const lines = apl.actions.map(action =>
      [action.action, ...action.context.map(gate => this.expressions.print(gate)), action.own ? this.expressions.print(action.own) : ''].join('|'));
    return `${lines.join('\n')}\n${JSON.stringify(records)}`;
  }

  /** Whether the rules can need the raid-wide enemy aura stream, so a spec without dots never pays for it. */
  readsEnemyAuras(apl: ResolvedApl): boolean {
    return apl.referencedHeads.some(head => head === 'dot' || head === 'debuff' || head === 'active_dot');
  }

  build(sources: RulebookSources, samples: ParseSample[]): RulebookBuild {
    const { apl, spec } = sources;
    const index = this.abilities.build(sources.records, samples, spec.classLabel, spec.specLabel);
    const majors = this.cooldowns.majorCooldowns(apl.actions, index);
    const derivation = this.rules.derive(apl.actions, index, samples);
    const unresolvedTalents = new Set<string>();
    const talentGroups = (tokens: Set<string>): number[][] => [...tokens].flatMap(token => {
      const ids = this.talentEntryIds(sources.talents, token);
      if (!ids.length) unresolvedTalents.add(token);
      return ids.length ? [ids] : [];
    });
    const lineCount = Math.max(1, apl.actions.length);
    const rules: RulebookRule[] = derivation.drafts.map(draft => this.rule(draft, lineCount, talentGroups));
    const opener = this.cooldowns.openingSequence(majors);
    // The opener is read from the parses, not from a line, so no priority grades it; it sits in the middle.
    if (opener) {
      rules.unshift({ type: this.gates.typeOf(opener), severity: 'warning', description: this.copy.description(opener), condition: opener, action: this.copy.action(opener) });
    }
    const aplTokens = new Set(apl.actions.map(action => action.action));
    const rulebook: Rulebook = {
      spec: spec.spec,
      major_cooldowns: majors.map(entry => this.cooldown(entry, index)),
      defensives: this.cooldowns.defensives(index, aplTokens).map(entry => this.defensive(entry)),
      rules,
    };
    const talentGaps = [...unresolvedTalents].sort().map((token): RulebookGap => ({ kind: 'talent', token }));
    return { rulebook, gaps: [...apl.gaps, ...derivation.gaps, ...talentGaps] };
  }

  private rule(draft: RuleDraft, lineCount: number, talentGroups: (tokens: Set<string>) => number[][]): RulebookRule {
    const requires = talentGroups(draft.requires);
    const excludes = talentGroups(draft.excludes);
    return {
      type: draft.type,
      severity: this.severity(draft.priority, lineCount),
      description: this.copy.description(draft.condition),
      condition: draft.condition,
      action: this.copy.action(draft.condition),
      ...(requires.length ? { requires_talents: requires } : {}),
      ...(excludes.length ? { excludes_talents: excludes } : {}),
    };
  }

  /** The APL's own priority order is the one importance signal the source carries: the top third is critical, the bottom third information. */
  private severity(priority: number, lineCount: number): RuleSeverity {
    const share = priority / lineCount;
    if (share < 1 / 3) return 'critical';
    if (share < 2 / 3) return 'warning';
    return 'info';
  }

  private cooldown(entry: MajorCooldownEntry, index: AbilityIndex): RulebookCooldown {
    const cooldown: RulebookCooldown = {
      name: entry.record.name,
      spell_id: entry.record.id,
      cooldown: entry.cooldownS,
      usage_rule: this.copy.usageRule(entry.lines, index),
    };
    if (entry.openerPriority !== null) cooldown.opener_priority = entry.openerPriority;
    if (entry.talentGated) cooldown.talent_gated = true;
    return cooldown;
  }

  private defensive(entry: DefensiveEntry): RulebookDefensive {
    const defensive: RulebookDefensive = {
      name: entry.record.name,
      spell_id: entry.record.id,
      cooldown: entry.cooldownS,
      usage_rule: this.copy.defensiveUsage(entry),
    };
    if (entry.record.durationS !== null) defensive.duration = entry.record.durationS;
    if (entry.record.talent !== null) defensive.talent_gated = true;
    return defensive;
  }

  /** Every trait entry carrying the talent's name, so a build taking any of them satisfies the gate; a numbered token covers the name it numbers. */
  private talentEntryIds(talents: SpecTalents, token: string): number[] {
    const wanted = token.startsWith(HERO_PREFIX) ? token.slice(HERO_PREFIX.length) : token;
    const exact = this.entriesNamed(talents, wanted);
    if (exact.length) return exact;
    const ordinal = ORDINAL.exec(wanted);
    if (!ordinal) return [];
    const shared = this.entriesNamed(talents, wanted.slice(0, -ordinal[0].length));
    return shared.length >= Number(ordinal[1]) ? shared : [];
  }

  private entriesNamed(talents: SpecTalents, token: string): number[] {
    return Object.entries(talents)
      .filter(([, talent]) => this.dump.token(talent.name) === token)
      .map(([id]) => Number(id))
      .sort((a, b) => a - b);
  }
}
