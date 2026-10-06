# APL conditions: one grammar, few readers

Scope: every condition a SimulationCraft action list puts in an `if`, a `target_if`, a variable or a list call, read from a log and shown to the player in words. The code lives under `frontend/src/app/domains/raid-analysis/data/rotation/priority-list/`.

## The catalog

The parser and the evaluator are generic: jsep parses every SimC operator and function, the evaluator folds a term over ranges so an unread name reads as unknown rather than wrong, and variables replay in list order. The names go through a catalog:

**1. One path grammar.** `FactCatalogService` turns a name into `{ kind, subject, field }` the way SimC's own factories read it: `target.dot.rip.remains` is an aura read of `rip`, field `remains`, on the target; a bare `refreshable` or `charges` is the line's own button; `trinket.1`, `this_trinket` and `trinket.<name>` are one kind with a slot; `prev_gcd.2.X`, `apex.3` and `time_to_pct_20` carry their number. A name outside the grammar still gets a subject and a field, so it phrases.

**2. Few state readers.** Each kind maps a subject and a moment to one typed state, the only hand-written log logic:

| Reader | Serves | Holds |
|---|---|---|
| aura | `buff.`, `debuff.`, `dot.`, `active_dot.`, bare dot fields | applied, due and actual end, stacks, spread, last trigger |
| cooldown | `cooldown.`, `action.`, bare charge fields | charges, remains, full recharge, duration, at the data's recharge and the fastest the log shows |
| pool | every resource, `cost`, `energize_amount` | amount as a range, max, regen |
| fight | `time`, `fight_remains`, `time_to_die`, `time_to_pct_N`, `active_enemies`, `health.pct`, `raid_event.`, `fight_style.`, `is_boss` | the clock, who was hit when, add waves, the target's health |
| press | `prev*`, `last_used`, `in_flight*`, `placed`, `executing`, `gcd`, `cast_time`, `pet.` | the casts around the moment |
| gear | `equipped.`, `trinket.N.is`, `ilvl`, `potion.` | the combatant info, with the item names the report fills in |
| build | `talent.`, `hero_tree.`, `apex.N`, `variable.` | picked entries, replayed variables |

**3. Field rows as data.** Per reader, one row per field: `field -> { value(state), words }`. The aura table is written once and serves buffs, debuffs and dots alike; the cooldown table serves cooldowns, actions and trinkets. A field SimC has but no log answers (`pmultiplier`, `tick_time`, `buff.X.value`, a trinket's use effect) is a declared row with words and no value: it phrases, and the value column says `Not in the log`.

**4. Words from the same rows.** Seven frames keyed by the row's kind of value, filled with the subject's noun, phrase every row: flag (`while Rip is on the target`), seconds left (`with at most 4 s of Rip left`), seconds away (`when Vanish is at most one GCD away`), count (`at 3+ Envenom stacks`), percent, seconds, amount. A row names a sentence of its own only where the frame reads badly.

**5. Nothing reads as syntax.** A name outside the catalog phrases by its own words (`with Reap's souls consumed at least 3`, `when void metamorphosis base drain ps holds`), and its value column says `Not read by warcraft-learner`.

**6. Class-code names stay a table.** `EXPRESSIONS` in `spec-plan-service.ts` turns a name SimC computes in class code, such as `scorch_execute.active`, into SimC text over names a log answers, with thresholds from the spell data. One row per name.

## Why a catalog: what SimC's history says

Counting the name shapes over the last tier of each expansion branch of SimulationCraft:

| Expansion | Shapes | Uses | Generic grammar | Class-code shapes |
|---|---|---|---|---|
| Legion | 221 | 6,732 | 95% | 68 |
| Battle for Azeroth | 313 | 7,297 | 96% | 59 |
| Shadowlands | 449 | 21,054 | 96% | 90 |
| Dragonflight | 299 | 13,861 | 95% | 78 |
| The War Within | 326 | 16,146 | 97% | 72 |
| Midnight | 274 | 7,902 | 98% | 33 |

- **The grammar is stable.** `[target.] kind . name . field` carries 95 to 98% of uses every time, and 93 shapes appear in all six expansions.
- **Names churn, shapes do not.** Trinket, item and set names change every tier. Whole kinds come and go with an expansion's systems: Shadowlands added `covenant.`, `soulbind.` and `runeforge.`, Dragonflight dropped 251 shapes with them, The War Within added `hero_tree.` and Midnight `apex.N`, both reading exactly like `talent.`.
- **Fields arrive slowly**, a handful per expansion, always on an existing kind: `at_max_stacks`, `remains_expected`, `last_trigger`, `ticks_remain`, `usable_in`.
- **Class-code names are a long tail** of 33 to 90 shapes and 2 to 5% of uses, each living in one spec's C++. Most are a SimC phrase over names a log can answer.
- **Operators are frozen.** The engine knows `^`, `@` and `~` beside the usual ones; no list uses them, and the parser reads them anyway.

So the cost model: a new field is one row, a new item or talent name is no code, a new class-code name is one `EXPRESSIONS` row, and a new kind is one reader, about once per expansion.

## What stays outside

`list-text-service.spec.ts` pins, over every name shape of the current lists (`src/testing/apl-names.ts`), the names no row answers: SimC's class code (`action.X.souls_consumed`, `howl_summon.ready`, `next_armament`), its sim settings (`druid.no_cds`, `priority_rotation`), the player's stats (`stat.haste_rating`, `spell_haste`) and the target's role, spec and distance. Each phrases by its words and reads as unknown.

A trinket's use effect (`trinket.N.cooldown.remains`, `has_use_buff`, `has_cooldown`, `cast_time`, `proc.*`) and a set bonus are declared rows: the log shows the item, not what it does. Reading them takes SimC's item effect table and its non-class spell dump at ingest, baked into the bench for the trinkets the top logs wear.

Out of scope by design: `interrupt_if`, `early_chain_if` and `cancel_if` gate stopping a channel, not pressing; `cycle_targets`, `target_if=min|max`, `sync`, `moving` and `use_off_gcd` pick a target or a time slot, which the list reader already handles.
