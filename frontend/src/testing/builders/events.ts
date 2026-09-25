/** Factories for `WclEvent` fixtures; an omitted opt leaves the field absent on the event, not `undefined`. */
import { WclEvent } from '../../app/domains/raid-analysis/data/wcl/wcl.models';

/** WCL timestamps are milliseconds; factory times are fight-relative seconds. */
const MS_PER_SECOND = 1000;

export function cast(
  spellId: number, atS: number,
  opts?: { source?: number; target?: number; resources?: { amount: number; max?: number; type: number; cost?: number }[]; healthPct?: number },
): WclEvent {
  const MAX_HP = 1_000_000;
  return {
    type: 'cast',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    ...(opts?.source !== undefined && { sourceID: opts.source }),
    ...(opts?.target !== undefined && { targetID: opts.target }),
    ...(opts?.resources !== undefined && { resourceActor: 1, classResources: opts.resources }),
    // The caster's own health, which `includeResources: true` flattens onto a cast.
    ...(opts?.healthPct !== undefined && { resourceActor: 1, maxHitPoints: MAX_HP, hitPoints: Math.round(MAX_HP * opts.healthPct / 100) }),
  };
}

export function beginCast(spellId: number, atS: number): WclEvent {
  return { type: 'begincast', timestamp: atS * MS_PER_SECOND, abilityGameID: spellId };
}

/** A `Resources` event: a gain carries its overflow in `waste`, a drain a negative change. */
export function resourceChange(type: number, atS: number, change: number, opts: { max: number; waste?: number }): WclEvent {
  return {
    type: change < 0 ? 'drain' : 'resourcechange',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: 0,
    resourceChange: change,
    resourceChangeType: type,
    maxResourceAmount: opts.max,
    ...(opts.waste !== undefined && { waste: opts.waste }),
  };
}

/** A self-buff lands on its target, so `target` sets both actor fields. */
export function applyBuff(spellId: number, atS: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'applybuff',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { sourceID: opts.target, targetID: opts.target }),
  };
}

export function removeBuff(spellId: number, atS: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'removebuff',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { sourceID: opts.target, targetID: opts.target }),
  };
}

export function applyDebuff(spellId: number, atS: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'applydebuff',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { targetID: opts.target }),
  };
}

export function refreshDebuff(spellId: number, atS: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'refreshdebuff',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { targetID: opts.target }),
  };
}

/** A buff climbing to `stack` (`type: 'applybuffstack'`), which carries the new total rather than the increment. */
export function applyBuffStack(spellId: number, atS: number, stack: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'applybuffstack',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    stack,
    ...(opts?.target !== undefined && { sourceID: opts.target, targetID: opts.target }),
  };
}

export function removeDebuff(spellId: number, atS: number, opts?: { target?: number }): WclEvent {
  return {
    type: 'removedebuff',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    ...(opts?.target !== undefined && { targetID: opts.target }),
  };
}

export function damage(
  spellId: number,
  atS: number,
  amount: number,
  opts?: { source?: number; target?: number; absorbed?: number; targetHealthPct?: number },
): WclEvent {
  const MAX_HP = 1_000_000;
  return {
    type: 'damage',
    timestamp: atS * MS_PER_SECOND,
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
  atS: number,
  amount: number,
  opts?: { source?: number; absorbed?: number },
): WclEvent {
  return {
    type: 'damage',
    timestamp: atS * MS_PER_SECOND,
    abilityGameID: spellId,
    amount,
    ...(opts?.absorbed !== undefined && { absorbed: opts.absorbed }),
    ...(opts?.source !== undefined && { sourceID: opts.source }),
  };
}
