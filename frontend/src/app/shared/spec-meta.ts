/**
 * Presentation metadata for every WCL spec folder: the class/spec the folder maps to,
 * human display labels, and the zamimg icon stems for the class and the spec.
 *
 * This is the UI-side counterpart to the query-internal `SPEC_TO_WCL` in
 * `core/services/wcl-api.ts`: same folder keys and class/spec split, but enriched with
 * display labels and icon stems that the dropdowns need. A unit test pins the key set so
 * the two cannot drift. Class icons are formulaic (`class_<lowercase-class>`); spec icons
 * have no formula, so each verified stem is baked here.
 */
export interface SpecMeta {
  /** Folder key, e.g. 'SubtletyRogue'. */
  spec: string;
  /** No-space class form (matches `SPEC_TO_WCL[0]`), e.g. 'DeathKnight'. */
  className: string;
  /** Display label, e.g. 'Death Knight'. */
  classLabel: string;
  /** Display label, e.g. 'Subtlety'. */
  specLabel: string;
  /** zamimg class-icon file stem (no extension), e.g. 'class_rogue'. */
  classIcon: string;
  /** zamimg spec spell-icon file stem (no extension), e.g. 'ability_stealth'. */
  specIcon: string;
}

const ZAM = 'https://wow.zamimg.com/images/wow/icons/small';

/** Split a camel-case identifier into spaced words: 'DeathKnight' -> 'Death Knight'. */
function splitWords(camel: string): string {
  return camel.replace(/([A-Z])/g, ' $1').trim();
}

/** Source table: folder -> [className, specName, verified spec-icon stem]. */
const SOURCE: Record<string, [string, string, string]> = {
  RetributionPaladin: ['Paladin', 'Retribution', 'spell_holy_auraoflight'],
  HolyPaladin: ['Paladin', 'Holy', 'spell_holy_holybolt'],
  ProtectionPaladin: ['Paladin', 'Protection', 'ability_paladin_shieldofthetemplar'],
  FireMage: ['Mage', 'Fire', 'spell_fire_firebolt02'],
  ArcaneMage: ['Mage', 'Arcane', 'spell_holy_magicalsentry'],
  FrostMage: ['Mage', 'Frost', 'spell_frost_frostbolt02'],
  HavocDemonHunter: ['DemonHunter', 'Havoc', 'ability_demonhunter_specdps'],
  VengeanceDemonHunter: ['DemonHunter', 'Vengeance', 'ability_demonhunter_spectank'],
  FuryWarrior: ['Warrior', 'Fury', 'ability_warrior_innerrage'],
  ArmsWarrior: ['Warrior', 'Arms', 'ability_warrior_savageblow'],
  ProtectionWarrior: ['Warrior', 'Protection', 'ability_warrior_defensivestance'],
  UnholyDeathKnight: ['DeathKnight', 'Unholy', 'spell_deathknight_unholypresence'],
  FrostDeathKnight: ['DeathKnight', 'Frost', 'spell_deathknight_frostpresence'],
  BloodDeathKnight: ['DeathKnight', 'Blood', 'spell_deathknight_bloodpresence'],
  BalanceDruid: ['Druid', 'Balance', 'spell_nature_starfall'],
  FeralDruid: ['Druid', 'Feral', 'ability_druid_catform'],
  GuardianDruid: ['Druid', 'Guardian', 'ability_racial_bearform'],
  RestorationDruid: ['Druid', 'Restoration', 'spell_nature_healingtouch'],
  BeastMasteryHunter: ['Hunter', 'BeastMastery', 'ability_hunter_bestialdiscipline'],
  MarksmanshipHunter: ['Hunter', 'Marksmanship', 'ability_hunter_focusedaim'],
  SurvivalHunter: ['Hunter', 'Survival', 'ability_hunter_camouflage'],
  BrewmasterMonk: ['Monk', 'Brewmaster', 'spell_monk_brewmaster_spec'],
  WindwalkerMonk: ['Monk', 'Windwalker', 'spell_monk_windwalker_spec'],
  MistweaverMonk: ['Monk', 'Mistweaver', 'spell_monk_mistweaver_spec'],
  DisciplinePriest: ['Priest', 'Discipline', 'spell_holy_powerwordshield'],
  HolyPriest: ['Priest', 'Holy', 'spell_holy_guardianspirit'],
  ShadowPriest: ['Priest', 'Shadow', 'spell_shadow_shadowwordpain'],
  AssassinationRogue: ['Rogue', 'Assassination', 'ability_rogue_deadlybrew'],
  OutlawRogue: ['Rogue', 'Outlaw', 'inv_sword_30'],
  SubtletyRogue: ['Rogue', 'Subtlety', 'ability_stealth'],
  ElementalShaman: ['Shaman', 'Elemental', 'spell_nature_lightning'],
  EnhancementShaman: ['Shaman', 'Enhancement', 'spell_shaman_improvedstormstrike'],
  RestorationShaman: ['Shaman', 'Restoration', 'spell_nature_magicimmunity'],
  AfflictionWarlock: ['Warlock', 'Affliction', 'spell_shadow_deathcoil'],
  DemonologyWarlock: ['Warlock', 'Demonology', 'spell_shadow_metamorphosis'],
  DestructionWarlock: ['Warlock', 'Destruction', 'spell_shadow_rainoffire'],
  DevastationEvoker: ['Evoker', 'Devastation', 'classicon_evoker_devastation'],
  PreservationEvoker: ['Evoker', 'Preservation', 'classicon_evoker_preservation'],
  AugmentationEvoker: ['Evoker', 'Augmentation', 'classicon_evoker_augmentation'],
};

export const SPEC_META: Record<string, SpecMeta> = Object.fromEntries(
  Object.entries(SOURCE).map(([spec, [className, specName, specIcon]]) => [
    spec,
    {
      spec,
      className,
      classLabel: splitWords(className),
      specLabel: splitWords(specName),
      classIcon: `class_${className.toLowerCase()}`,
      specIcon,
    },
  ]),
);

/** One entry per class, in stable display order, for the Class dropdown. */
export function classList(): { className: string; classLabel: string; classIcon: string }[] {
  const byClass = new Map<string, { className: string; classLabel: string; classIcon: string }>();
  for (const meta of Object.values(SPEC_META)) {
    if (!byClass.has(meta.className)) {
      byClass.set(meta.className, { className: meta.className, classLabel: meta.classLabel, classIcon: meta.classIcon });
    }
  }
  return [...byClass.values()].sort((first, second) => first.classLabel.localeCompare(second.classLabel));
}

/** Spec metas for `className`, restricted to the `available` folder keys (those with data), sorted by spec label. */
export function specsForClass(className: string, available: string[]): SpecMeta[] {
  return available
    .map(spec => SPEC_META[spec])
    .filter((meta): meta is SpecMeta => !!meta && meta.className === className)
    .sort((first, second) => first.specLabel.localeCompare(second.specLabel));
}

/** Lookup a spec folder's metadata, or `undefined` for an unknown spec. */
export function specMetaOf(spec: string | null | undefined): SpecMeta | undefined {
  return spec ? SPEC_META[spec] : undefined;
}

/** zamimg class-icon URL for a no-space class name, or '' when unknown. */
export function classIconUrl(className: string): string {
  return className ? `${ZAM}/class_${className.toLowerCase()}.jpg` : '';
}

/** zamimg spec-icon URL for a spec folder key, or '' when the spec is unknown. */
export function specIconUrl(spec: string): string {
  const meta = SPEC_META[spec];
  return meta ? `${ZAM}/${meta.specIcon}.jpg` : '';
}
