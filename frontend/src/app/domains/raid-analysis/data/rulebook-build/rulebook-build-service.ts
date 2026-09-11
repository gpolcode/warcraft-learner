import { Injectable, inject } from '@angular/core';
import type { Rulebook, RulebookCooldown, RulebookDefensive, RulebookRule, RuleSeverity } from '../rulebook/rulebook.models';
import type { SpecMeta } from '../data-files/spec-meta.models';
import type { SpecTalents } from '../gear/talent.models';
import type { SimcTier } from '../http/simc-data-service';
import type { AplUnknownToken, ResolvedApl } from '../simc/simc.models';
import { SimcAplService } from '../simc/simc-apl-service';
import { SpellDataDumpService } from '../simc/spell-data-dump-service';
import { AbilityIndexService } from './ability-index-service';
import { CooldownDerivationService, type DefensiveEntry, type MajorCooldownEntry } from './cooldown-derivation-service';
import { RuleDerivationService } from './rule-derivation-service';
import { RulebookCopyService } from './rulebook-copy-service';
import type { AbilityIndex, ParseSample, RuleDraft, RulebookBuildReport } from './rulebook-build.models';

/** Part of the encounter stamp, so a changed derivation re-benches sources that did not move. */
export const RULEBOOK_BUILDER_VERSION = 1;

export interface RulebookBuildInputs {
  spec: SpecMeta;
  tier: SimcTier;
  profile: { text: string; sha256: string };
  spellData: { text: string; sha256: string };
  samples: ParseSample[];
  talents: SpecTalents;
}

export interface RulebookBuild {
  rulebook: Rulebook;
  report: RulebookBuildReport;
}

@Injectable({ providedIn: 'root' })
export class RulebookBuildService {
  private readonly apl = inject(SimcAplService);
  private readonly dump = inject(SpellDataDumpService);
  private readonly abilities = inject(AbilityIndexService);
  private readonly cooldowns = inject(CooldownDerivationService);
  private readonly rules = inject(RuleDerivationService);
  private readonly copy = inject(RulebookCopyService);

  /** The profile's gates resolved against the tier, the step every read of a profile starts from. */
  resolveProfile(profileText: string, tier: SimcTier): ResolvedApl {
    return this.apl.resolve(this.apl.parseLines(profileText), this.setBonusToken(tier));
  }

  /** Whether the rules can need the raid-wide enemy aura stream, so a spec without dots never pays for it. */
  readsEnemyAuras(resolved: ResolvedApl): boolean {
    return resolved.referencedHeads.some(head => head === 'dot' || head === 'debuff' || head === 'active_dot');
  }

  unknownTokens(profileText: string, tier: SimcTier): AplUnknownToken[] {
    return this.resolveProfile(profileText, tier).unknownTokens;
  }

  build(inputs: RulebookBuildInputs): RulebookBuild {
    const resolved = this.resolveProfile(inputs.profile.text, inputs.tier);
    const index = this.abilities.build(this.dump.parse(inputs.spellData.text), inputs.samples, inputs.spec.classLabel, inputs.spec.specLabel);
    const majors = this.cooldowns.majorCooldowns(resolved.actions, index);
    const derivation = this.rules.derive(resolved.actions, index, inputs.samples);
    const unresolvedTalents = new Set<string>();
    const talentIds = (tokens: Set<string>): number[] => [...tokens].flatMap(token => {
      const id = this.talentEntryId(inputs.talents, token);
      if (id === null) unresolvedTalents.add(token);
      return id === null ? [] : [id];
    });
    const lineCount = Math.max(1, resolved.actions.length);
    const rules: RulebookRule[] = derivation.drafts.map(draft => this.rule(draft, lineCount, talentIds));
    const opener = this.cooldowns.openingSequence(majors);
    if (opener) {
      rules.unshift({ type: 'opener', severity: 'warning', description: this.copy.description(opener), condition: opener, action: this.copy.action(opener) });
    }
    const aplTokens = new Set(resolved.actions.map(action => action.action));
    const rulebook: Rulebook = {
      spec: inputs.spec.spec,
      major_cooldowns: majors.map(entry => this.cooldown(entry, index)),
      defensives: this.cooldowns.defensives(index, aplTokens).map(entry => this.defensive(entry)),
      rules,
    };
    const report: RulebookBuildReport = {
      unresolvedActions: derivation.unresolvedActions,
      unresolvedAuras: derivation.unresolvedAuras,
      unresolvedTalents: [...unresolvedTalents].sort(),
      unresolvedVariables: resolved.unresolvedVariables,
      unknownTokens: resolved.unknownTokens,
    };
    return { rulebook, report };
  }

  /** `midnight/MID2` wears `midnight_season_2`: the branch names the expansion, the directory's digits the season. */
  setBonusToken(tier: SimcTier): string {
    const season = /\d+$/.exec(tier.dir)?.[0] ?? '';
    return `${tier.branch.toLowerCase()}_season_${season}`;
  }

  private rule(draft: RuleDraft, lineCount: number, talentIds: (tokens: Set<string>) => number[]): RulebookRule {
    const requires = talentIds(draft.requires);
    const excludes = talentIds(draft.excludes);
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
      cooldown: this.abilities.effectiveCooldownS(entry.record) ?? 0,
      usage_rule: this.copy.usageRule(entry.lines, index),
      apl_condition: this.copy.aplCondition(entry.lines),
    };
    if (entry.openerPriority !== null) cooldown.opener_priority = entry.openerPriority;
    if (entry.talentGated) cooldown.talent_gated = true;
    return cooldown;
  }

  private defensive(entry: DefensiveEntry): RulebookDefensive {
    const defensive: RulebookDefensive = {
      name: entry.record.name,
      spell_id: entry.record.id,
      cooldown: this.abilities.effectiveCooldownS(entry.record) ?? 0,
      usage_rule: this.copy.defensiveUsage(entry),
    };
    if (entry.record.durationS !== null) defensive.duration = entry.record.durationS;
    if (entry.record.talent !== null) defensive.talent_gated = true;
    return defensive;
  }

  /** A SimC talent token names the trait; the lowest matching entry id stands for a name shared by a choice node's siblings. */
  private talentEntryId(talents: SpecTalents, token: string): number | null {
    const wanted = token.startsWith('hero:') ? token.slice('hero:'.length) : token;
    const matches = Object.entries(talents)
      .filter(([, talent]) => this.dump.token(talent.name) === wanted)
      .map(([id]) => Number(id))
      .sort((a, b) => a - b);
    return matches[0] ?? null;
  }
}
