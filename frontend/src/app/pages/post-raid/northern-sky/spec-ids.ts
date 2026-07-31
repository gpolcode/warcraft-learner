/**
 * Blizzard specialization ids keyed by the spec folder key (`{specSlug}{classSlug}`, e.g.
 * `FeralDruid`). The Northern Sky note tags each line with this id so only that spec sees the
 * reminder in-game. Kept as a curated table of canonical, stable game constants: `SpecMeta`
 * carries no numeric id, and WCL's own `gameData` spec id is not guaranteed to equal Blizzard's.
 */
export const SPEC_ID_BY_KEY: Record<string, number> = {
  BloodDeathKnight: 250, FrostDeathKnight: 251, UnholyDeathKnight: 252,
  HavocDemonHunter: 577, VengeanceDemonHunter: 581,
  BalanceDruid: 102, FeralDruid: 103, GuardianDruid: 104, RestorationDruid: 105,
  DevastationEvoker: 1467, PreservationEvoker: 1468, AugmentationEvoker: 1473,
  BeastMasteryHunter: 253, MarksmanshipHunter: 254, SurvivalHunter: 255,
  ArcaneMage: 62, FireMage: 63, FrostMage: 64,
  BrewmasterMonk: 268, WindwalkerMonk: 269, MistweaverMonk: 270,
  HolyPaladin: 65, ProtectionPaladin: 66, RetributionPaladin: 70,
  DisciplinePriest: 256, HolyPriest: 257, ShadowPriest: 258,
  AssassinationRogue: 259, OutlawRogue: 260, SubtletyRogue: 261,
  ElementalShaman: 262, EnhancementShaman: 263, RestorationShaman: 264,
  AfflictionWarlock: 265, DemonologyWarlock: 266, DestructionWarlock: 267,
  ArmsWarrior: 71, FuryWarrior: 72, ProtectionWarrior: 73,
};

/** The spec's Blizzard specialization id, or 0 when the key is unknown (tag still emits). */
export function blizzardSpecId(specKey: string): number {
  return SPEC_ID_BY_KEY[specKey] ?? 0;
}
