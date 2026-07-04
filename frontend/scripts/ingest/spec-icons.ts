/**
 * Curated spec-icon stems (zamimg file stem per spec folder key).
 *
 * WCL `gameData.classes` supplies every class/spec name and slug but no spec icon, so this
 * is the one hand-maintained residue of the spec universe. `mapClassesToSpecMeta` merges a
 * stem in here; a spec absent from this map bakes `specIcon: ''` and renders label-only
 * (harmless) rather than being unqueryable. Add a row when Blizzard ships a new spec;
 * verify the stem at `wow.zamimg.com/images/wow/icons/small/<stem>.jpg`.
 */
export const SPEC_ICON_STEMS: Record<string, string> = {
  RetributionPaladin: 'spell_holy_auraoflight',
  HolyPaladin: 'spell_holy_holybolt',
  ProtectionPaladin: 'ability_paladin_shieldofthetemplar',
  FireMage: 'spell_fire_firebolt02',
  ArcaneMage: 'spell_holy_magicalsentry',
  FrostMage: 'spell_frost_frostbolt02',
  HavocDemonHunter: 'ability_demonhunter_specdps',
  VengeanceDemonHunter: 'ability_demonhunter_spectank',
  FuryWarrior: 'ability_warrior_innerrage',
  ArmsWarrior: 'ability_warrior_savageblow',
  ProtectionWarrior: 'ability_warrior_defensivestance',
  UnholyDeathKnight: 'spell_deathknight_unholypresence',
  FrostDeathKnight: 'spell_deathknight_frostpresence',
  BloodDeathKnight: 'spell_deathknight_bloodpresence',
  BalanceDruid: 'spell_nature_starfall',
  FeralDruid: 'ability_druid_catform',
  GuardianDruid: 'ability_racial_bearform',
  RestorationDruid: 'spell_nature_healingtouch',
  BeastMasteryHunter: 'ability_hunter_bestialdiscipline',
  MarksmanshipHunter: 'ability_hunter_focusedaim',
  SurvivalHunter: 'ability_hunter_camouflage',
  BrewmasterMonk: 'spell_monk_brewmaster_spec',
  WindwalkerMonk: 'spell_monk_windwalker_spec',
  MistweaverMonk: 'spell_monk_mistweaver_spec',
  DisciplinePriest: 'spell_holy_powerwordshield',
  HolyPriest: 'spell_holy_guardianspirit',
  ShadowPriest: 'spell_shadow_shadowwordpain',
  AssassinationRogue: 'ability_rogue_deadlybrew',
  OutlawRogue: 'inv_sword_30',
  SubtletyRogue: 'ability_stealth',
  ElementalShaman: 'spell_nature_lightning',
  EnhancementShaman: 'spell_shaman_improvedstormstrike',
  RestorationShaman: 'spell_nature_magicimmunity',
  AfflictionWarlock: 'spell_shadow_deathcoil',
  DemonologyWarlock: 'spell_shadow_metamorphosis',
  DestructionWarlock: 'spell_shadow_rainoffire',
  DevastationEvoker: 'classicon_evoker_devastation',
  PreservationEvoker: 'classicon_evoker_preservation',
  AugmentationEvoker: 'classicon_evoker_augmentation',
};
