---
name: warcraft-simc
description: warcraft-learner SimulationCraft (SimC) integration - where the action priority lists and spell data come from, what the APL grammar does and does not guarantee, the inventory that maps every token and name to a rule or a reason it is dropped, the exclusion overlay a person hides names with, how a gap surfaces from the ingest run and how to close it, and how the encounter stamp keys on what the rules read. Load this before touching data/simc or data/rulebook-build, before editing the inventory or the exclusions, and when a SimulationCraft gap issue arrives.
---

# warcraft-learner SimulationCraft integration

**What good looks like:** every token and name of every action list SimulationCraft writes is in the inventory with a support level and a note, the gap issue is closed, and a derivation change ships with a bumped `INGEST_VERSION`.

## Sources

`SimcDataService` (`data/http/simc-data-service.ts`) reads two raw files from `github.com/simulationcraft/simc`: an action priority list (APL) per spec and a dump per class, shared by its specs. An ingest run reads them for every spec it ships; the development configuration reads them for the spec on screen, through `LiveRulebookService`, which derives that analysis its own rulebook. A deployed build reads neither: its rules come baked into the benches. `SIMC_TIER` (`<branch>/<dir>`, e.g. `midnight/MID2`, a repository variable) names the branch both are read from and, through the directory's digits, the season of the worn set bonus (`midnight_season_2`); the development configuration names its own in `src/environments/live-data-sources.ts`, which `?simcTier=<branch>/<dir>` overrides. Every tier profile under `profiles/<dir>/` embeds its spec's list, but a tier ships profiles for only some specs, so the list is read where SimC writes it for every spec it has one for.

| File | What it is | How it is read |
|---|---|---|
| `ActionPriorityLists/default/<class>_<spec>.simc` | The default APL of one spec as text, named after the class module (`deathknight_frost`, `hunter_beast_mastery`). The `assisted_combat/` list beside it is the one-button simplification and is not read. | Every action line becomes a `ResolvedAction` with its gate resolved against the tier; `variable` lines are inlined. A spec with no file gets gear, positions and burst windows only, the windows attributed to no cooldown. |
| `SpellDataDump/<class>.txt` | Every spell of the class: id, cooldown, recharge, duration, talent tree and owner, effects, resource costs. | The ability index resolves APL action and aura tokens to spell ids, keeping only records the spec owns, and confirms each against the encounter's own top parses. |

Raidbots' `talents.json` is the third source, read once per run: it turns the talent tokens of a gate into trait entry ids.

## What the APL guarantees, and what it does not

| Fact | Consequence |
|---|---|
| `ActionPriorityLists/default/` is SimC's own text of each class module's default list, generated from the module and never edited by hand; every tier profile embeds the same text. | The list is the source of truth to read, and it covers specs a tier ships no profile for. |
| The expression grammar (`engine/sim/expressions.cpp`) has changed once in thirteen years. | An expression the parser cannot read is an `Unparsed expression` gap, never swallowed. |
| A list name is any run of letters, digits and underscores, capitals included (`HC_st`). | An `actions` line the reader cannot split is an `Unparsed line` gap; a call to a list with no lines is a `Missing list` gap. |
| SimC's tokenizer lower-cases, turns a space into an underscore and drops every other character. | `Anti-Magic Shell` is `antimagic_shell` and `Void-Scarred` is `voidscarred`; `SpellDataDumpService.token` follows the same rule. Class modules name a few actions and buffs on their own (`swipe_cat`, `supercharge_1`), which is what `TOKEN_ALIASES` maps, and track a periodic effect apart from its cast as `<spell>_dot`, which the aura lookup strips. |
| The vocabulary grows without notice: new aura fields, action options, class-specific heads. | Every token the resolver meets goes through the inventory; one outside it is reported as a gap and treated as `opaque` until it is inventoried. |
| The lists and the class dumps change on most days on the live branch, often in comments and records no rule reads. | Nothing is cached across runs. The encounter stamp carries a key hashed from what the rules read, so an edit outside the gates and the owned records re-benches nothing. |
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

`TOKEN_ALIASES` maps a module's own name to the spell's token, or to the spell's id where the module binds one of several spells the dump names alike (`gory_fur_ironfur` and `gory_fur_maul` are two buffs both named Gory Fur); `UNRECORDED_NAMES` lists names no dump records (a raid or racial buff, a spell shipped without cast data, a name for whichever of two spells is talented, the sim's own bookkeeping state) with why. Both are consulted only when the token itself names no record, so an entry can never hide a real one.

`apl-vocabulary.spec.ts` cross-checks the tables against the resolver: every `rule` and `read` shape reads into a fact family, every `erased` shape resolves to no gate, every `opaque` shape stays `other`. Add a row and the spec tells you whether the resolver agrees with the level.

## The exclusion overlay (`data/rulebook-build/rulebook-exclusions.ts`)

`RULEBOOK_EXCLUSIONS` lists, per spec folder, the SimC tokens a person took out of the derivation: pet-family buttons the dump lists under the hunter, another spec's barrier. An excluded name is dropped from the resolved lines and from the owned records before anything derives, so no cooldown, defensive or rule carries it, and it is never reported as unresolved. Removal only: an entry naming nothing hides nothing, so a stale one is harmless. The exclusions are part of what the key hashes, so an edit re-benches the spec. The overlay lives in the repository, not on `gh-pages`, which is why ingest's sweep of stray files at a spec root cannot touch it.

## Gaps

Each ingest run prepares every action list SimulationCraft writes, not only the specs it benches, derives it once without parses, and reports what the builder could not read three ways: `::warning` annotations on the run, a `SimulationCraft gaps` section in the step summary, and one open issue titled `SimulationCraft gaps: what the rulebook builder cannot read`, created on the first gap and edited plus commented only when the set changes, so GitHub mails the creation and each change and stays quiet in between. The run log also prints each benched spec's cooldowns, defensives, rule count and gaps once, which is where a name to exclude shows up.

| Kind | Closes with |
|---|---|
| `Expression`, `Action option`, `Variable op` | An inventory row with the level it deserves and a note that says what it maps to or why it is dropped. A token the builder should read but no kind consumes yet is `read`; one that should shape a rule is a new rule-engine kind (warcraft-change). |
| `Unparsed expression`, `Unparsed line`, `Missing list` | Extending the parser or the reader; the list is right, the reader is behind. A list cycle is walked once and is no gap. |
| `Unresolved action`, `Unresolved aura` | A `TOKEN_ALIASES` row when the dump carries the spell under its own name, mapped to the id when other spells share that name, else an `UNRECORDED_NAMES` row with why. |
| `Unresolved talent` | No Raidbots entry name tokenizes to the token, and no numbered form covers it: the trees are the source, so it waits for upstream data; a name that differs only in form is a reader change in `talentEntryIds`. |
| `Undefined variable` | A typo in SimulationCraft's list; nothing to do but wait for upstream. |

## Derivation in one pass

`RulebookBuildService.prepare` runs once per spec per run: it resolves the action list against the tier, applies the exclusions, keeps the records the spec owns and collects the gaps. `build` then runs per encounter inside ingest, on the encounter's own top parses, walked by the benches' own pipeline: `AbilityIndexService` maps tokens to spell ids and records what the parses cast and kept up, `CooldownDerivationService` picks the major cooldowns (the opener ordered by median first cast, for cooldowns pressed inside the opener window in most sampled parses) and the defensives, `RuleDerivationService` turns gated literals into `RuleCondition`s and `RuleStateDerivationService` the observed states, `RulebookCopyService` writes the card copy from each condition, and the talent tokens of each gate become groups of trait entry ids. The raid-wide enemy aura stream is fetched only when the resolved APL reads `dot`, `debuff` or `active_dot`.

The engine reads the gates: the rotation bench measures a gated rule only on the parses whose build fits it, and the runtime judges a player only by the rules their build fits, reading the log's talents only when a rule carries a gate. A log with no combatant info fits ungated rules alone.

## Version stamps

The encounter stamp is `<INGEST_VERSION>:<key>`, the key being `RulebookBuildService.sourceKey` over the prepared sources: the first 16 hex digits of the SHA-256 over each resolved line's action and printed gates plus the spec's owned records after exclusions. A spec with no action list stamps on the version alone, and only a run that stamps hashes at all. A SimulationCraft change the rules can see re-benches the spec's encounters when its turn in the run order comes, which spreads the work evenly; one they cannot see re-benches nothing. A derivation change is a code change and bumps `INGEST_VERSION` (warcraft-change), the one knob the run order reads.
