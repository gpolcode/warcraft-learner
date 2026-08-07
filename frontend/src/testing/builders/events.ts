/**
 * Plain factory functions for WCL combat-log event fixtures.
 *
 * Each factory returns a single `WclEvent` and hides the one WCL wire quirk every
 * spec would otherwise repeat: event kinds are lowercase wire strings (`'cast'`,
 * `'applybuff'`, `'removebuff'`, `'damage'`). Factory times are fight-relative
 * milliseconds, matching `WclEvent.timestamp` exactly - no conversion at the call
 * site. Optional actor and absorb fields exist on the event only when the caller
 * provides them; an omitted opt leaves the field absent, not `undefined`.
 *
 * ```ts
 * const events = [cast(SHADOW_BLADES, 1_000), ...buffWindow(FEINT, 10_000, 16_000)];
 * ```
 */
import { WclEvent } from '../../app/core/models/wcl.models';

/** A player ability cast (`type: 'cast'`). `resources` mirrors what `includeResources: true` flattens onto the event. */
export function cast(
  spellId: number, atMs: number,
  opts?: { source?: number; target?: number; resources?: { amount: number; max?: number; type: number }[] },
): WclEvent {
  return {
    type: 'cast',
    timestamp: atMs,
    abilityGameID: spellId,
    ...(opts?.source !== undefined && { sourceID: opts.source }),
    ...(opts?.target !== undefined && { targetID: opts.target }),
    ...(opts?.resources !== undefined && { resourceActor: 1, classResources: opts.resources }),
  };
}

/** A buff gained (`type: 'applybuff'`). A self-buff lands on its target, so `target` sets both actor fields. */
export function applyBuff(spellId: number, atMs: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'applybuff',
    timestamp: atMs,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { sourceID: opts.target, targetID: opts.target }),
  };
}

/** A buff lost (`type: 'removebuff'`). Same actor handling as {@link applyBuff}. */
export function removeBuff(spellId: number, atMs: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'removebuff',
    timestamp: atMs,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { sourceID: opts.target, targetID: opts.target }),
  };
}

/** A debuff applied to an enemy (`type: 'applydebuff'`). */
export function applyDebuff(spellId: number, atMs: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'applydebuff',
    timestamp: atMs,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { targetID: opts.target }),
  };
}

/** A debuff re-applied to an enemy before it expired (`type: 'refreshdebuff'`). */
export function refreshDebuff(spellId: number, atMs: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'refreshdebuff',
    timestamp: atMs,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { targetID: opts.target }),
  };
}

/** A buff climbing to `stack` (`type: 'applybuffstack'`), which carries the new total rather than the increment. */
export function applyBuffStack(spellId: number, atMs: number, stack: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'applybuffstack',
    timestamp: atMs,
    abilityGameID: spellId,
    stack,
    ...(opts?.target !== undefined && { sourceID: opts.target, targetID: opts.target }),
  };
}

/** A debuff dropping off an enemy (`type: 'removedebuff'`). */
export function removeDebuff(spellId: number, atMs: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'removedebuff',
    timestamp: atMs,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { targetID: opts.target }),
  };
}

/** A buff active from `fromMs` until `toMs`: the applybuff / removebuff pair. */
export function buffWindow(spellId: number, fromMs: number, toMs: number, opts?: { target?: number }): WclEvent[] {
  return [applyBuff(spellId, fromMs, opts), removeBuff(spellId, toMs, opts)];
}

/** A player dying (`type: 'death'`): `target` is who died, so a spec filters these by target and not by source. */
export function death(atMs: number, opts?: { target?: number; killingAbility?: number }): WclEvent {
  return {
    type: 'death',
    timestamp: atMs,
    abilityGameID: 0,
    ...(opts?.target !== undefined && { targetID: opts.target }),
    ...(opts?.killingAbility !== undefined && { killingAbilityGameID: opts.killingAbility }),
  };
}

/** Damage the player deals (`type: 'damage'`). */
export function damage(
  spellId: number,
  atMs: number,
  amount: number,
  opts?: { source?: number; target?: number; absorbed?: number; targetHealthPct?: number },
): WclEvent {
  const MAX_HP = 1_000_000;
  return {
    type: 'damage',
    timestamp: atMs,
    abilityGameID: spellId,
    amount,
    ...(opts?.absorbed !== undefined && { absorbed: opts.absorbed }),
    ...(opts?.source !== undefined && { sourceID: opts.source }),
    ...(opts?.target !== undefined && { targetID: opts.target }),
    // What `includeResources: true` flattens on for the struck actor, which is where target health lives.
    ...(opts?.targetHealthPct !== undefined && {
      resourceActor: 2, maxHitPoints: MAX_HP, hitPoints: Math.round(MAX_HP * opts.targetHealthPct / 100),
    }),
  };
}

/** Damage dealt TO the player (`type: 'damage'`): `source` is the attacker, and no target actor is set. */
export function damageTaken(
  spellId: number,
  atMs: number,
  amount: number,
  opts?: { source?: number; absorbed?: number },
): WclEvent {
  return {
    type: 'damage',
    timestamp: atMs,
    abilityGameID: spellId,
    amount,
    ...(opts?.absorbed !== undefined && { absorbed: opts.absorbed }),
    ...(opts?.source !== undefined && { sourceID: opts.source }),
  };
}
