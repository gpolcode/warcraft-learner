# Rule engine repair plan

The rulebook rule engine carries five fields (`type`, `priority`, `description`, `condition`,
`action`) across 319 authored rules, and today most of that content reaches no user. This plan
makes every field do the job it was authored for. Nothing is removed.

## Current state

Measured across the 40 rulebooks deployed on `gh-pages`:

| | Count | Share |
|---|---|---|
| Total rules | 319 | |
| `condition: null` | 293 | 91.8% |
| `cast_without_prior` | 18 | 5.6% |
| `hold_cooldown_for_anchor` | 8 | 2.5% |
| Rules using `exception` | 0 | 0% |
| Specs with at least one evaluable rule | 18 of 40 | |
| Specs showing no rules card at all | 22 of 40 | |

Six concrete defects:

1. **Display-only rules render nowhere.** `evaluateRules` and `rulesFollowed` both `continue` on
   a null condition (`rotation.service.ts:150`, `:174`), and nothing else reads the array. The
   schema tells authors that such rules "surface as display-only text"; that is not true today.
   This is 293 of 319 rules and the entire rule contribution of 22 specs.
2. **`type` is read by no code.** A six-value enum the schema marks required, used only to shape
   authoring.
3. **`priority` collapses to one bit.** `critical` renders red, `high`/`medium`/`low` all render
   identically amber (`rotation.service.ts:151`, `:175`).
4. **`cast_without_prior` ignores ordering.** The check is `Math.abs(time - rt) <= win`
   (`rotation.service.ts:97`), so a required spell cast *after* the primary satisfies a rule
   whose name and intent say "prior".
5. **Two `hold_cooldown_for_anchor` rules are inverted** and flag the play their own `action`
   text prescribes: BloodDeathKnight's Reaper's Mark before Dancing Rune Weapon, and
   FuryWarrior's Avatar before Recklessness (at `critical`). Both describe a *pairing*, not a
   hold.
6. **One rule targets a filler spell.** RestorationDruid requires Rejuvenation within 3s of
   Swiftmend. Rejuvenation is a spam-cast HoT, so a real log reports something like 47 of 52
   casts as violations.

A likely root cause of 4 and 5: the schema's own `cast_without_prior` example is backwards
relative to the correctly authored rule. The example asks for "Shadow Dance without prior Secret
Technique"; the shipped SubtletyRogue rule is the reverse, and is the correct direction. Authors
copying the example get the operands the wrong way round.

## Target

- Every authored rule reaches the user when it has something to say about the pull in front of
  them: evaluated when it has a condition, surfaced as a hint against a real finding when it
  does not.
- `type` categorises the rule, `priority` weights it.
- A rule can only be authored in a way that produces a correct check, because a validation step
  rejects the rest.

## Phase 1 - surface display-only rules as issue hints on post-raid

The largest value unlock, and it needs no rulebook regeneration and no `INGEST_VERSION` bump:
the text is already baked into every rotation bench file.

- **Post-raid only. Not pre-fight.** A flat list of how a spec is played is noise for this
  audience: a Mythic raider already knows their spec, and pre-fight would render the same wall of
  text for every encounter. The value is on post-raid, where a rule can explain an issue the pull
  actually shows.
- **Gate each display-only rule on the pull.** A rule surfaces only when this pull produced a
  finding for a cooldown the rule names. Match the rule's `description` and `action` against the
  spec's cooldown and defensive names; both come from the same rulebook, so the mentions are
  exact strings, and the match is deterministic and testable.
- Render as advisory rows inside the existing "Rotation Rules" card, below the evaluated rows:
  `description` as the title, `action` through `wl-collapsible-text`. No measured value and no
  timestamp, because a hint is not a measurement - it must not enter `bucketFindings` or claim a
  row in the "Measured" column.
- A rule that names no cooldown of the spec has nothing in the pull to attach to and does not
  surface. In practice that is most `positioning` and `aoe_switch` rules. This is a deliberate
  trade: the alternative is the reminder list this phase rejects.
- Keep authored order within the card; no re-sorting (see Phase 2).
- The comment at `post-raid.ts:239` claiming rules "render regardless" of a bench is wrong -
  `rotation.html:2` hides the whole card when the bench is unavailable, and the rules arrive in
  the bench file anyway. Correct it.

Acceptance: a pull with a Dancing Rune Weapon finding shows the BloodDeathKnight rules that name
Dancing Rune Weapon; a pull with no findings shows no hints; no finding counts change.

## Phase 2 - make `priority` and `type` carry weight

- Map priority to four visual tiers rather than two: `critical` -> critical, `high` -> warning,
  `medium` -> info, `low` -> muted/info. Apply in both `evaluateRules` (`:151`) and
  `rulesFollowed` (`:175`).
- Use `type` for the violation rows too, as the row's category chip, so a rule row states its
  category the way every other finding row does.
- Row order is unchanged. Findings stay in their current order and rule rows stay in authored
  order; priority drives severity and colour, not position.

Acceptance: a `medium` violation is visually distinguishable from a `critical` one; rule rows
carry a category chip; row order is byte-identical to today.

## Phase 3 - fix condition semantics

- **Add an explicit `position` to `cast_without_prior`**: `"before" | "after" | "either"`,
  defaulting to `"before"`. Honour it in `evaluateCastWithoutPrior` instead of the current
  unconditional `Math.abs`. `before` means the required spell must precede the primary within
  `window_s`; `either` preserves today's behavior for rules that genuinely mean "paired within N
  seconds in either direction". The `exception` block already carries a `position` field, so the
  vocabulary exists.
- **Fix the schema example** to match the correct operand order, and state the direction in the
  `spell_id` / `required_spell_id` field descriptions ("`spell_id` is the ability being judged;
  `required_spell_id` is the one that must already have been cast").
- **Unify labelling**: a rule renders its `description` in both states. Today a violation shows a
  synthesized "X without Y" while the same rule followed shows its `description`, so the same
  rule reads as two different rules.
- **Remove the dead plumbing**: `RotationScanInput.rules` is threaded through the scan but always
  passed an empty array, making `rotation.service.ts:402` unreachable. Rules are evaluated
  separately at `:573`.

Acceptance: a rule marked `before` no longer passes when the required spell comes second; the
same rule reads with one name whether followed or violated.

## Phase 4 - validate rulebooks at ingest

There is deliberately no code-side rulebook validation today; the schema is the contract and the
generating agent is trusted. That is what let defect 5 ship. Add a validation pass in the
orchestrator that reports bad rules rather than baking them silently:

- **Inverted holds**: a `hold_cooldown_for_anchor` whose `action` text describes casting the held
  spell *before* the anchor is a pairing rule, not a hold. Flag any hold rule whose held spell is
  also the subject of "before"/"immediately before" phrasing in its own action, for author
  review. This catches BloodDeathKnight and FuryWarrior.
- **Self-referential conditions**: a `cast_without_prior` whose `required_spell_id` equals its
  `spell_id`, or a `hold_cooldown_for_anchor` listing its own anchor in `spell_ids`, can never
  read as the author intended. This is a structural check with no judgement in it.
- Emit the report in the ingest console summary so a bad rulebook is visible on the hourly run.

Two checks are deliberately **not** part of this pass:

- **Unknown spell ids** (requiring every id to appear in the observed ability ids) would reject
  valid rules. A spec legitimately skips a cooldown entirely on some encounters for strategic
  reasons, so absence from one encounter's events says nothing about the rule.
- **Filler targets** (rejecting a `cast_without_prior` whose subject is cast more often than a
  cooldown would be) would tie a rule's validity to its subject's cooldown length. A rule is
  worth checking regardless of how often the ability comes up, so cast frequency is not grounds
  for rejection. The Rejuvenation rule is re-authored by hand in Phase 5 instead.

Acceptance: running validation over the 40 deployed rulebooks reports the two inverted hold rules
and nothing else.

## Phase 5 - re-author the broken rules, and use `exception`

- Re-author the two inverted hold rules as `cast_without_prior` with `position: "before"` (for
  BloodDeathKnight: Dancing Rune Weapon without a prior Reaper's Mark inside 6s), which states
  the intent correctly and makes the check agree with the action text.
- Re-author or drop the Rejuvenation rule; if the intent is "consume the Soul of the Forest proc",
  the subject is the proc window, not every Rejuvenation cast.
- **`exception` has never executed against real data.** Before relying on it, add a unit test
  covering both `position` values with realistic cast timings. The Rejuvenation case is exactly
  what it was designed for, so Phase 5 is where it either earns its place or is proven working.
- Bump `INGEST_VERSION` when re-authored rulebooks land, since the baked bench content changes.

Acceptance: no deployed rule flags correct play; `exception` has coverage.

## Sequencing and cost

Phases 1 and 2 are pure runtime work with no data change and deliver most of the user value
(display-only rules start reaching the player where they explain a real issue, and priority
starts meaning something). Phase 3 is a schema addition with a backward-compatible default.
Phase 4 is ingest-side reporting that stops the class of defect recurring; it changes no baked
data. Phase 5 is the only one needing an `INGEST_VERSION` bump and a rulebook regeneration.

Doing nothing keeps 92% of authored rulebook content invisible and leaves two rules actively
telling correct players they are wrong.
