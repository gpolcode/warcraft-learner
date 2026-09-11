---
name: warcraft-simc
description: warcraft-learner SimulationCraft (SimC) integration - where the profiles and spell data come from, what the APL grammar does and does not guarantee, the vocabulary inventory that maps every token to a rule or a reason it is dropped, how a gap surfaces from the ingest run and how to close it, and which version stamp a derivation change bumps. Load this before touching data/simc or data/rulebook-build, before editing the inventory, and when an APL vocabulary gap issue arrives.
---

# warcraft-learner SimulationCraft integration

**What good looks like:** every token of every shipped profile is in the inventory with a support level and a note, the gap issue is closed, and a derivation change ships with a bumped `RULEBOOK_BUILDER_VERSION`.

## Sources

`SimcDataService` (`data/http/simc-data-service.ts`) reads two raw files per spec from `github.com/simulationcraft/simc` during ingest, never at runtime. `SIMC_TIER` (`<branch>/<dir>`, e.g. `midnight/MID2`, a repository variable) names both.

| File | What it is | How it is read |
|---|---|---|
| `profiles/<dir>/<dir>_<Class>_<Spec>.simc` | The tier's profile of one spec: gear, talents and the action priority list (APL) in its authored text form. | Every action line becomes a `ResolvedAction` with its gate resolved against the tier; `variable` lines are inlined. A spec with no file gets gear, positions and phases only. |
| `SpellDataDump/<class>.txt` | Every spell of the class: id, cooldown, recharge, duration, talent tree and owner, effects, resource costs. | The ability index resolves APL action and aura tokens to spell ids, keeping only records the spec owns, and confirms each against the encounter's own top parses. |

## What the APL guarantees, and what it does not

| Fact | Consequence |
|---|---|
| The `.simc` text is the authored form; SimC compiles it into C++, never the other way round. | The profile is the source of truth to read. |
| The expression grammar (`engine/sim/expressions.cpp`) has changed once in thirteen years. | A line the parser cannot read is reported as an `Unparsed expression` gap, never swallowed. |
| The vocabulary grows without notice: new aura fields, action options, class-specific heads. | Every token the resolver meets goes through the inventory; one outside it is reported as a gap and treated as `opaque` until it is inventoried. |
| Profiles change most days on the live branch. | Nothing is cached across runs; the profile and dump hashes sit in the encounter stamp, so a changed profile re-benches its encounters on the next run. |
| A `variable` gate only makes sense inlined. | `set` and `setif` definitions are inlined into the lines that read them; the other ops are ignored. |
| Any action token can be a spell, a racial, a list call or a sim directive. | Non-spell actions are inventoried in `ACTION_WORDS`; a spell the dump does not carry under the spec is an `unresolvedActions` entry in the run log, a data problem rather than a grammar one. |

## The inventory (`data/simc/apl-vocabulary.ts`)

Four tables: `EXPRESSION_SHAPES`, `ACTION_OPTIONS`, `ACTION_WORDS`, `VARIABLE_OPS`. Expression entries are keyed by shape: a spell, list, item or variable name reads as `*` (`buff.rupture.up` is `buff.*.up`, `prev_gcd.1.scorch` is `prev_gcd.*.*`), and a `subtree` entry covers every field of a family (`trinket.*`, `raid_event.*`, `pet.*`).

| Support | Meaning | Where the literal ends up |
|---|---|---|
| `rule` | Shapes a rule. | The `RuleCondition` kind named in the note. |
| `read` | A fact the resolver reads that no kind consumes yet. | Dropped; the note records the kind that would carry it. |
| `gate` | A talent, hero tree, tier set or an inlined variable. | `requires_talents` / `excludes_talents` on the rule, or the tier's set-bonus token. |
| `erased` | Sim-only arithmetic (regen, fight length, gcd). | The operand becomes its operator's identity, so the rest of the line keeps its meaning. |
| `opaque` | A literal no kind reads. | Stays symbolic and gates nothing. |
| `ignored` | Parsed and skipped (sim options). | Nothing. |

`apl-vocabulary.spec.ts` cross-checks the tables against the resolver: every `rule` and `read` shape reads into a fact family, every `erased` shape resolves to no gate, every `opaque` shape stays `other`. Add a row and the spec tells you whether the resolver agrees with the level.

## Gaps

Each ingest run scans every profile the tier ships, not only the specs it benches, and reports the tokens outside the inventory three ways: `::warning` annotations on the run, an `APL vocabulary gaps` section in the step summary, and one open issue titled `APL vocabulary gaps: SimulationCraft tokens outside the inventory`, created on the first gap and edited plus commented only when the set changes, so GitHub mails the creation and each change and stays quiet in between. Kinds: `Expression`, `Action option`, `Variable op`, `Unparsed expression`.

Closing a gap is one inventory row per token, with the level it deserves and a note that says what it maps to or why it is dropped. A token the builder should read but no kind consumes yet is `read`, so the gap closes and the note records the missing kind. A token that should shape a rule is a new rule-engine kind (warcraft-change).

## Derivation in one pass

`RulebookBuildService.build` (`data/rulebook-build/`) runs per encounter inside ingest, on the encounter's own top parses: `SimcAplService` parses and resolves the lines, `AbilityIndexService` maps tokens to spell ids and records what the parses cast and kept up, `CooldownDerivationService` picks the major cooldowns (opener order from the first-cast order of the top parse) and the defensives, `RuleDerivationService` turns gated literals and observed states into `RuleCondition`s, `RulebookCopyService` writes the card copy from each condition, and `TalentDataService` turns talent tokens into trait entry ids for the gates. The raid-wide enemy aura stream is fetched only when the resolved APL reads `dot`, `debuff` or `active_dot`.

## Version stamps

- `RULEBOOK_BUILDER_VERSION` (`data/rulebook-build/rulebook-build-service.ts`) sits in the encounter stamp beside the profile and dump hashes. Bump it exactly when the same sources derive a different rulebook: a kind added or changed, an inventory row moved to or from `rule`, a threshold.
- `INGEST_VERSION` keeps the rule in warcraft-change: a bench shape or a measured value.
