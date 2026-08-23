import { InjectionToken, Type, inject } from '@angular/core';
import { RuleCondition } from '../../../../../domain/rulebook/rulebook.models';
import { RuleKind } from './rule-kind';
import { CastWithoutPriorKind } from './kinds/cast-without-prior';
import { HoldCooldownForAnchorKind } from './kinds/hold-cooldown-for-anchor';
import { CastOutsideBuffKind } from './kinds/cast-outside-buff';
import { AuraUptimeBelowKind } from './kinds/aura-uptime-below';
import { OpeningSequenceKind } from './kinds/opening-sequence';
import { CastAtTargetCountKind } from './kinds/cast-at-target-count';
import { ResourceAtCastKind } from './kinds/resource-at-cast';
import { ProcWastedKind } from './kinds/proc-wasted';
import { FillerInBuffKind } from './kinds/filler-in-buff';
import { SpendAtStacksKind } from './kinds/spend-at-stacks';
import { AuraClippedKind } from './kinds/aura-clipped';
import { FillerBelowHealthKind } from './kinds/filler-below-health';

/** Keyed by kind, so a new condition cannot compile until it declares a kind class here. */
const KIND_CLASSES: { [K in RuleCondition['kind']]: Type<RuleKind<Extract<RuleCondition, { kind: K }>>> } = {
  cast_without_prior: CastWithoutPriorKind,
  hold_cooldown_for_anchor: HoldCooldownForAnchorKind,
  cast_outside_buff: CastOutsideBuffKind,
  aura_uptime_below: AuraUptimeBelowKind,
  opening_sequence: OpeningSequenceKind,
  cast_at_target_count: CastAtTargetCountKind,
  resource_at_cast: ResourceAtCastKind,
  proc_wasted: ProcWastedKind,
  filler_in_buff: FillerInBuffKind,
  spend_at_stacks: SpendAtStacksKind,
  aura_clipped: AuraClippedKind,
  filler_below_health: FillerBelowHealthKind,
};

export const RULE_KINDS = new InjectionToken<readonly RuleKind<RuleCondition>[]>('RULE_KINDS', {
  factory: () => Object.values(KIND_CLASSES).map(kindClass => inject(kindClass)),
});
