---
name: warcraft-simc
description: warcraft-learner SimulationCraft (SimC) integration - where the profiles and spell data come from, what the APL grammar does and does not guarantee, the inventory that maps every token and name to a rule or a reason it is dropped, the exclusion overlay a person hides names with, how a gap surfaces from the ingest run and how to close it, and how the encounter stamp keys on what the rules read. Load this before touching data/simc or data/rulebook-build, before editing the inventory or the exclusions, and when a SimulationCraft gap issue arrives.
---

# warcraft-learner SimulationCraft integration

**What good looks like:** every token and name of every shipped profile is in the inventory with a support level and a note, the gap issue is closed, and a derivation change ships with a bumped `INGEST_VERSION`.

## Sources

`SimcDataService` (`data/http/simc-data-service.ts`) reads two raw files per spec from `github.com/simulationcraft/simc` during ingest, never at runtime. `SIMC_TIER` (`<branch>/<dir>`, e.g. `midnight/MID2`, a repository variable) names both. The base profile is `<dir>_<Class>_<Spec>.simc`; the hero-tree variants beside it are not read.

| File | What it is | How it is read |
|---|---|---|
| `profiles/<dir>/<dir>_<Class>_<Spec>.simc` | The tier's profile of one spec: gear, talents and the action priority list (APL) in its authored text form. | Every action line becomes a `ResolvedAction` with its gate resolved against the tier; `variable` lines are inlined. A spec with no file gets gear, positions and phases only. |
| `SpellDataDump/<class>.txt` | Every spell of the class: id, cooldown, recharge, duration, talent tree and owner, effects, resource costs. | The ability index resolves APL action and aura tokens to spell ids, keeping only records the spec owns, and confirms each against the encounter's own top parses. |

Raidbots' `talents.json` is the third source, read once per run: it turns the talent tokens of a gate into trait entry ids.

## What the APL guarantees, and what it does not

| Fact | Consequence |
|---|---|
| The `.simc` text is the authored form; SimC compiles it into C++, never the other way round. | The profile is the source of truth to read. |
| The expression grammar (`engine/sim/expressions.cpp`) has changed once in thirteen years. | An expression the parser cannot read is an `Unparsed expression` gap, never swallowed. |
| A list name is any run of letters, digits and underscores, capitals included (`HC_st`). | An `actions` line the reader cannot split is an `Unparsed line` gap; a call to a list with no lines is a `Missing list` gap. |
| SimC's tokenizer lower-cases, turns a space into an underscore and drops every other character. | `Anti-Magic Shell` is `antimagic_shell` and `Void-Scarred` is `voidscarred`; `SpellDataDumpService.token` follows the same rule. Class modules name a few actions and buffs on their own (`swipe_cat`, `supercharge_1`), which is what `TOKEN_ALIASES` maps. |
| The vocabulary grows without notice: new aura fields, action options, class-specific heads. | Every token the resolver meets goes through the inventory; one outside it is reported as a gap and treated as `opaque` until it is inventoried. |
| Profiles change most days on the live branch, mostly gear and talent headers; the class dumps too. | Nothing is cached across runs. The encounter stamp carries a key hashed from what the rules read, so an edit outside the gates and the owned records re-benches nothing. |
| A talent name shared by several entries is numbered (`ancient_arts_3`). | The gate covers every entry carrying the name, so a build taking any of them satisfies it. |
| A `variable` gate only makes sense inlined. | `set` and `setif` definitions are inlined into the lines that read them; a running op reads as unknown, a variable no line defines is an `Undefined variable` gap. |
| Any action token can be a spell, a racial, a list call or a sim directive. | Non-spell actions are inventoried in `ACTION_WORDS`; a spell the dump does not carry under the spec is an `Unresolved action` gap. |

## The inventory (`data/simc/apl-vocabulary.ts`)

Six tables: `EXPRESSION_SHAPES`, `ACTION_OPTIONS`, `ACTION_WORDS`, `VARIABLE_OPS`, `TOKEN_ALIASES` and `UNRECORDED_NAMES`. Expression entries are keyed by shape: a spell, list, item or variable name reads as `*` (`buff.rupture.up` is `buff.*.up`, `prev_gcd.1.scorch` is `prev_gcd.*.*`), and a `subtree` entry covers every field of a family (`trinket.*`, `raid_event.*`, `pet.*`).

| Support | Meaning | Where the literal ends up |
|---|---|---|
| `rule` | Shapes a rule. | The `RuleCondition` kind named in the note. |
| `read` | A fact the resolver reads that no kind consumes yet. | Dropped; the note records the kind that would carry it. |
| `gate` | A talent, hero tree, tier set or an inlined variable. | `requires_talents` / `excludes_talents` on the rule, or the tier's set-bonus token. |
| `erased` | Sim-only arithmetic (regen, fight length, gcd). | The operand becomes its operator's identity, so the rest of the line keeps its meaning. |
| `opaque` | A literal no kind reads. | Stays symbolic and gates nothing. |
| `ignored` | Parsed and skipped (sim options). | Nothing. |

`TOKEN_ALIASES` maps a module's own name to the spell's token; `UNRECORDED_NAMES` lists names no dump records (a raid or racial buff, a spell shipped without cast data, the sim's own bookkeeping state) with why. Both are consulted only when the token itself names no record, so an entry can never hide a real one.

`apl-vocabulary.spec.ts` cross-checks the tables against the resolver: every `rule` and `read` shape reads into a fact family, every `erased` shape resolves to no gate, every `opaque` shape stays `other`. Add a row and the spec tells you whether the resolver agrees with the level.

## The exclusion overlay (`data/rulebook-build/rulebook-exclusions.ts`)

`RULEBOOK_EXCLUSIONS` lists, per spec folder, the SimC tokens a person took out of the derivation: pet-family buttons the dump lists under the hunter, another spec's barrier. An excluded name is dropped from the resolved lines and from the owned records before anything derives, so no cooldown, defensive or rule carries it, and it is never reported as unresolved. Removal only: an entry naming nothing hides nothing, so a stale one is harmless. The exclusions are part of what the key hashes, so an edit re-benches the spec. The overlay lives in the repository, not on `gh-pages`, which is why ingest's sweep of stray files at a spec root cannot touch it.

## Gaps

Each ingest run prepares every profile the tier ships, not only the specs it benches, derives it once without parses, and reports what the builder could not read three ways: `::warning` annotations on the run, a `SimulationCraft gaps` section in the step summary, and one open issue titled `SimulationCraft gaps: what the rulebook builder cannot read`, created on the first gap and edited plus commented only when the set changes, so GitHub mails the creation and each change and stays quiet in between. The run log also prints each benched spec's cooldowns, defensives, rule count and gaps once, which is where a name to exclude shows up.

| Kind | Closes with |
|---|---|
| `Expression`, `Action option`, `Variable op` | An inventory row with the level it deserves and a note that says what it maps to or why it is dropped. A token the builder should read but no kind consumes yet is `read`; one that should shape a rule is a new rule-engine kind (warcraft-change). |
| `Unparsed expression`, `Unparsed line`, `Missing list` | Extending the parser or the reader; the profile is right, the reader is behind. |
| `Unresolved action`, `Unresolved aura` | A `TOKEN_ALIASES` row when the dump carries the spell under its own name, else an `UNRECORDED_NAMES` row with why. |
| `Unresolved talent` | The Raidbots name differs from the token: an alias row. |
| `Undefined variable` | A profile typo; nothing to do but wait for upstream. |

## Derivation in one pass

`RulebookBuildService.prepare` runs once per spec per run: it resolves the profile against the tier, applies the exclusions, keeps the records the spec owns, hashes the key and collects the gaps. `build` then runs per encounter inside ingest, on the encounter's own top parses: `AbilityIndexService` maps tokens to spell ids and records what the parses cast and kept up, `CooldownDerivationService` picks the major cooldowns (opener order from the first-cast order of the top parse) and the defensives, `RuleDerivationService` turns gated literals and observed states into `RuleCondition`s, `RulebookCopyService` writes the card copy from each condition, and the talent tokens of each gate become groups of trait entry ids. The raid-wide enemy aura stream is fetched only when the resolved APL reads `dot`, `debuff` or `active_dot`.

The engine reads the gates: the rotation bench measures a gated rule only on the parses whose build fits it, and the runtime judges a player only by the rules their build fits, reading the log's talents only when a rule carries a gate. A log with no combatant info fits ungated rules alone.

## Version stamps

The encounter stamp is `<INGEST_VERSION>:<key>`, the key being SHA-256 over each resolved line's action and printed gates plus the spec's owned records after exclusions. A SimulationCraft change the rules can see re-benches the spec's encounters when its turn in the run order comes, which spreads the work evenly; one they cannot see re-benches nothing. A derivation change is a code change and bumps `INGEST_VERSION` (warcraft-change), the one knob the run order reads.
