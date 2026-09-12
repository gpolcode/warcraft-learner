/** Pet-family abilities the class dump lists under the hunter: the pet presses them, never the player. */
const HUNTER_PET_ABILITIES: readonly string[] = [
  'harden_carapace', 'solid_shell', 'scale_shield', 'obsidian_skin', 'defense_matrix', 'bristle', 'bulwark', 'agile_reflexes',
  'primal_agility', 'dragons_guile', 'catlike_reflexes', 'serpents_swiftness', 'feather_flurry', 'winged_agility', 'swarm_of_flies',
];

/** Names a person took out of a spec's derivation, as SimulationCraft tokens keyed by the spec folder; removal only, so an entry naming nothing hides nothing and a stale one is harmless. */
export const RULEBOOK_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {
  BeastMasteryHunter: HUNTER_PET_ABILITIES,
  MarksmanshipHunter: HUNTER_PET_ABILITIES,
  SurvivalHunter: HUNTER_PET_ABILITIES,
  // Each mage spec owns one barrier; the dump lists all three as class-wide.
  ArcaneMage: ['ice_barrier', 'blazing_barrier'],
  FireMage: ['ice_barrier', 'prismatic_barrier'],
  FrostMage: ['blazing_barrier', 'prismatic_barrier'],
};
