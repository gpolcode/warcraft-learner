/**
 * Spec-metadata helpers over a runtime-hydrated cache. The spec universe (class/spec names,
 * slugs, icons) is derived from WCL `gameData.classes` at ingest and baked to `spec-meta.json`;
 * the browser hydrates the cache once at startup (an app initializer) and the headless ingest
 * runtime hydrates it explicitly. These helpers read that cache; both the rankings query
 * (`wcl-api.ts`) and the selection dropdowns use them.
 */
import type { SpecMeta } from './models/spec-meta.models';

export type { SpecMeta };

const ZAM = 'https://wow.zamimg.com/images/wow/icons/small';

/**
 * Canonical zamimg spell-icon stem per spec folder key, the built-in source for the dropdown
 * spec art. A spec's `rulebook.json` may carry a `spec_icon`; when present it overrides this
 * table (see `specIconUrl`), so a rulebook can retune the art without a code change. Stems are
 * verified against zamimg; a folder key absent here degrades to the class icon.
 */
const SPEC_ICON_STEMS: Record<string, string> = {
  BloodDeathKnight: 'spell_deathknight_bloodpresence',
  FrostDeathKnight: 'spell_deathknight_frostpresence',
  UnholyDeathKnight: 'spell_deathknight_unholypresence',
  BalanceDruid: 'spell_nature_starfall',
  FeralDruid: 'ability_druid_catform',
  GuardianDruid: 'ability_racial_bearform',
  RestorationDruid: 'spell_nature_healingtouch',
  BeastMasteryHunter: 'ability_hunter_bestialdiscipline',
  MarksmanshipHunter: 'ability_hunter_focusedaim',
  SurvivalHunter: 'ability_hunter_camouflage',
  ArcaneMage: 'spell_holy_magicalsentry',
  FireMage: 'spell_fire_firebolt02',
  FrostMage: 'spell_frost_frostbolt02',
  BrewmasterMonk: 'spell_monk_brewmaster_spec',
  MistweaverMonk: 'spell_monk_mistweaver_spec',
  WindwalkerMonk: 'spell_monk_windwalker_spec',
  HolyPaladin: 'spell_holy_holybolt',
  ProtectionPaladin: 'ability_paladin_shieldofthetemplar',
  RetributionPaladin: 'spell_holy_auraoflight',
  DisciplinePriest: 'spell_holy_powerwordshield',
  HolyPriest: 'spell_holy_guardianspirit',
  ShadowPriest: 'spell_shadow_shadowwordpain',
  AssassinationRogue: 'ability_rogue_deadlybrew',
  SubtletyRogue: 'ability_stealth',
  OutlawRogue: 'inv_sword_30',
  ElementalShaman: 'spell_nature_lightning',
  EnhancementShaman: 'spell_shaman_improvedstormstrike',
  RestorationShaman: 'spell_nature_magicimmunity',
  AfflictionWarlock: 'spell_shadow_deathcoil',
  DemonologyWarlock: 'spell_shadow_metamorphosis',
  DestructionWarlock: 'spell_shadow_rainoffire',
  ArmsWarrior: 'ability_warrior_savageblow',
  FuryWarrior: 'ability_warrior_innerrage',
  ProtectionWarrior: 'ability_warrior_defensivestance',
  HavocDemonHunter: 'ability_demonhunter_specdps',
  VengeanceDemonHunter: 'ability_demonhunter_spectank',
  DevourerDemonHunter: 'classicon_demonhunter_void',
  DevastationEvoker: 'classicon_evoker_devastation',
  PreservationEvoker: 'classicon_evoker_preservation',
  AugmentationEvoker: 'classicon_evoker_augmentation',
};

/** Class-icon stem for a class name (space-tolerant): 'Death Knight' -> 'class_deathknight'. */
function classIconStem(className: string): string {
  return `class_${className.toLowerCase().replace(/ /g, '')}`;
}

/** The hydrated spec universe (folder key -> meta) and the set of real class-icon stems. */
let META: Record<string, SpecMeta> = {};
let KNOWN_CLASS_ICONS = new Set<string>();

/**
 * Populate the spec-meta cache from the baked `spec-meta.json` (browser: app initializer;
 * ingest: the runtime). Idempotent - a later call replaces the cache.
 */
export function hydrateSpecMeta(metas: SpecMeta[] | Record<string, SpecMeta>): void {
  const list = Array.isArray(metas) ? metas : Object.values(metas);
  META = Object.fromEntries(list.map(meta => [meta.spec, meta]));
  KNOWN_CLASS_ICONS = new Set(list.map(meta => meta.classIcon));
}

/** One entry per class, in stable display order, for the Class dropdown. */
export function classList(): { className: string; classLabel: string; classIcon: string }[] {
  const byClass = new Map<string, { className: string; classLabel: string; classIcon: string }>();
  for (const meta of Object.values(META)) {
    if (!byClass.has(meta.className)) {
      byClass.set(meta.className, { className: meta.className, classLabel: meta.classLabel, classIcon: meta.classIcon });
    }
  }
  return [...byClass.values()].sort((first, second) => first.classLabel.localeCompare(second.classLabel));
}

/** Spec metas for `className`, restricted to the `available` folder keys (those with data), sorted by spec label. */
export function specsForClass(className: string, available: string[]): SpecMeta[] {
  return available
    .map(spec => META[spec])
    .filter((meta): meta is SpecMeta => !!meta && meta.className === className)
    .sort((first, second) => first.specLabel.localeCompare(second.specLabel));
}

/** Lookup a spec folder's metadata, or `undefined` for an unknown spec. */
export function specMetaOf(spec: string | null | undefined): SpecMeta | undefined {
  return spec ? META[spec] : undefined;
}

/**
 * zamimg class-icon URL for a class name (space-tolerant: accepts 'Death Knight' or 'DeathKnight').
 * Returns '' for an unknown class, so a name-only fallback never shows a broken image.
 */
export function classIconUrl(className: string): string {
  const stem = classIconStem(className);
  return KNOWN_CLASS_ICONS.has(stem) ? `${ZAM}/${stem}.jpg` : '';
}

/**
 * zamimg spec-icon URL for a spec folder key. Prefers the spec's rulebook-baked `specIcon`
 * stem and falls back to the built-in `SPEC_ICON_STEMS` table; '' when the spec is unknown or
 * no stem is known for it.
 */
export function specIconUrl(spec: string): string {
  const stem = META[spec]?.specIcon || SPEC_ICON_STEMS[spec];
  return stem ? `${ZAM}/${stem}.jpg` : '';
}
