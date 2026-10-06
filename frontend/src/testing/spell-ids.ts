// Bloodlust - must match the real ID the engine detects.
export const BLOODLUST = 2825;

export const SHADOW_BLADES = 121471;
export const SHADOW_DANCE = 185313;
export const SECRET_TECHNIQUE = 280719;
export const VANISH = 1856;

export const CLOAK_OF_SHADOWS = 31224;
export const EVASION = 5277;

// WCL quirk: Blur casts as 198589 but its buff is 212800 - the name is the only bridge between the two.
export const BLUR = 198589;
export const BLUR_BUFF = 212800;

export const EVISCERATE = 196819;
export const BACKSTAB = 53;
export const BLACK_POWDER = 319175;

export const RUPTURE = 1943;
export const DEATHMARK = 360194;
export const DARKEST_NIGHT = 457280;

// Logged once on its target and once on the priest, a few ms apart, for one press.
export const POWER_INFUSION = 10060;

// Returning to the marked spot logs a second cast under ALTER_TIME_RETURN, named Alter Time too, as the aura closes.
export const ALTER_TIME = 342245;
export const ALTER_TIME_RETURN = 342247;

export const WRATH = 190984;
export const STARFIRE = 194153;

export const MAELSTROM_WEAPON = 344179;

// WCL quirk: Shadow Blades casts as 121471 but its damage rows show up as 279043 - the name is the only bridge between the two.
export const SHADOW_BLADES_DAMAGE = 279043;

// These mirror the ids `normalizeAbilityId` folds onto, so changing one here without changing it there silently stops asserting its behavior.
export const WCL_MELEE_EVENT_ABILITY_ID = 1;
export const WOW_AUTO_ATTACK_SPELL_ID = 6603;
export const WCL_SYNTHETIC_SOURCE_FALLBACK_ID = 291807;

// Bladestorm: SimC's spell data holds both records under the button's name, and a log casts only one of them.
export const BLADESTORM = 227847;
export const BLADESTORM_HERO = 446035;

// WCL quirk: a Divine Hymn channel logs one cast under the press and a fake cast per tick under the tick record of the same name.
export const DIVINE_HYMN = 64843;
export const DIVINE_HYMN_TICK = 64844;

// WCL quirk: The Hunt begins and casts under the press, then logs its landing as a fake cast under another record of the name.
export const THE_HUNT = 370965;
export const THE_HUNT_LANDING = 370966;

// Its merged spell data reads a longer duration than its own aura.
export const ANTI_MAGIC_SHELL = 48707;

// WCL quirk: one use of Devastation's Deep Breath logs a second cast under the same id seconds later, after the first one's short aura closes.
export const DEEP_BREATH = 433874;

// Trinkets: the item, then the spells its rows in SimC's item effects cast; a row's comment names the spell, which Signet of the Priory's use does not share.
export const SPYMASTERS_WEB = 220202;
export const SPYMASTERS_WEB_USE = 444959;
export const SPYMASTERS_WEB_EQUIP = 444958;
export const SIGNET_OF_THE_PRIORY = 219308;
export const BOLSTERING_LIGHT = 443531;
export const SIGNET_EQUIP = 450877;
export const ALGETHAR_PUZZLE_BOX = 193701;
export const ALGETHAR_PUZZLE = 383781;
export const ARAKARA_SACBROOD = 219314;
export const ARAKARA_SACBROOD_EQUIP = 443541;
