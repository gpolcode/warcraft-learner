# APL conditions: one grammar, few readers

Status: concept, no code yet. Scope: every condition a SimulationCraft action list puts in an `if`, a `target_if`, a variable or a list call, read from a log and shown to the player in words.

## Where the code stands

The parser and the evaluator are generic already: jsep parses every SimC operator and function, the evaluator folds a term over ranges so an unread name reads as unknown rather than wrong, and variables replay in list order. Nothing here changes.

The names are what is specific. Fourteen `FactReader`s each match a regex and read the log their own way, and `list-text-service.ts` holds two more regex tables for the words. A name no reader matches shows as "another condition", so the player cannot tell what it was.

Measured over the 34 current APLs (7,902 identifier uses in 274 name shapes), the readers cover 86%. The rest:

| Gap | Uses | Examples |
|---|---|---|
| Trinkets and gear | 11% | `trinket.1.cooldown.remains`, `equipped.X`, `set_bonus.X` |
| Class-code names | 2% | `action.reap.souls_consumed`, `max_prio_damage` |
| Aura, dot and press fields | 1% | `ticks_remain`, `buff.X.last_trigger`, `pmultiplier` |
| Other events and stats | under 1% | `raid_event.movement.in`, `stat.haste_rating` |

## What the history says

The same count over the last tier of each expansion branch:

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
- **Operators are frozen.** The engine also knows `^`, `@` and `~`; no APL uses them.

The cost model to design for: a new field is one table row, a new item or talent name is no code, a new class-code name is one substitution row, and a new kind is one reader, about once per expansion.

## The concept: a catalog instead of readers

**1. One path grammar.** A single parser turns a name into `{ scope, kind, subject, field }`: `target.dot.rip.remains` is `{ target, aura, rip, remains }`, a bare `refreshable` or `charges` is the line's own button, `trinket.1`, `this_trinket` and `other_trinket` are one kind with a slot, `prev_gcd.2.X` and `apex.3` carry their number. It replaces every name regex in the readers, the text service, `list-check-service.ts` and `spec-plan-service.ts`.

**2. Few state readers.** Each kind maps a subject and a moment to one typed state, the only hand-written log logic:

| State | Serves | Holds |
|---|---|---|
| aura | `buff.`, `debuff.`, `dot.`, `pet.X`, `trinket.N.proc.X` | applied, due and actual end, stacks, last trigger |
| cooldown | `cooldown.`, `action.`, `trinket.N.cooldown` | charges, remains, full recharge, duration |
| pool | every resource name | amount as a range, max, regen |
| clock | `time`, `fight_remains`, `time_to_die`, `time_to_pct_N` | the fight's and the target's time left |
| enemies | `active_enemies`, `spell_targets`, `active_dot.X`, `raid_event.adds` | who was hit when, add waves |
| presses | `prev*`, `last_used`, `in_flight*`, `executing`, `gcd`, `cast_time` | the casts around the moment |
| gear | `equipped.`, `set_bonus.`, `trinket.N.is`, `has_*`, `ilvl`, `main_hand.`, `potion.` | combatant info plus the item names the gear card resolves |
| build | `talent.`, `hero_tree.`, `apex.N`, `variable.` | picked entries, replayed variables |

Aura and cooldown exist as `AuraReadingService` and `CooldownFacts`; the others are today's readers with their regexes removed.

**3. Field tables as data.** Per state, one row per field: `field -> { value(state), kind, words }`, kind being flag, seconds, count, percent or amount. The aura table serves buffs, debuffs and dots alike, the cooldown table cooldowns, actions and trinkets. A field SimC has but no log answers (`pmultiplier`, `value`, `tick_time`) is a **declared row** with an unknown value: it keeps its words, and the value column says "Not in the log".

**4. Words from the same rows.** About six phrase frames, keyed by kind and filled with the subject's noun, replace the 40 regex phrases: flag ("while Rip is on the target"), seconds left ("with at most 4 s of Rip left"), seconds away ("when Vanish is at most one GCD away"), count ("at 3+ Envenom stacks"), percent, amount. A row overrides its frame only where it reads badly (`refreshable`, `active_enemies`).

**5. Nothing reads as syntax.** A name outside the catalog still parses: the noun is the spell's name or the name's own words, the field's words come from the table when the field is known, else the generic frame applies. The value column says why no number shows: "Not in the log" for a declared field, "Not read by warcraft-learner" for an unknown one.

**6. Class-code names stay a table.** `EXPRESSIONS` in `spec-plan-service.ts` already turns `scorch_execute.active` into SimC text over readable names with thresholds from the spell data. One row per name, added by uses, fits a tail of 30 to 90. `combo_strike` and `max_prio_damage` move there from code.

| SimC | Shown |
|---|---|
| `trinket.1.cooldown.remains<=gcd.max` | "When your first trinket is at most one GCD away", value "4.2 s away" |
| `dot.rip.ticks_remain<=2` | "With 2 or fewer Rip ticks left", value "Not in the log" |
| `action.reap.souls_consumed>=3` | "With Reap's souls consumed at 3 or more", value "Not read by warcraft-learner" |

## Size and tests

About 700 lines of readers and 120 of phrase tables become one grammar (about 60), eight state readers (about 400) and data tables (about 200), reading 98% of uses instead of 86% and phrasing all of them.

About 120 `it` blocks become: one table-driven spec for the grammar, one boundary-paired spec per state reader (where the log logic lives), one `it.each` per field table over a synthetic state, one `it.each` per frame and polarity, and one guard that runs every name shape of the current APLs through the catalog and asserts that no phrase contains a dot or an underscore and that each is read or declared. Roughly half the blocks, asserting more.

## Order of work

1. Grammar, field tables and frames, re-homing the readers with their behavior kept. No `INGEST_VERSION` bump.
2. Gear state, the 11% gap: the trinket's use spell is the cast the log shows, `has_use_buff` the buff that cast applies, `is.X` and `equipped.X` the item names WCL fills in. Bump `INGEST_VERSION`.
3. The remaining aura, cooldown and press fields as rows, declared where the log is silent.
4. Class-code rows per spec, by uses.
5. The parser's `^`, `@` and `~`.

Out of scope: `interrupt_if`, `early_chain_if` and `cancel_if` gate stopping a channel, not pressing; `cycle_targets`, `target_if=min|max`, `sync`, `moving` and `use_off_gcd` pick a target or a time slot, which the list reader already handles.
