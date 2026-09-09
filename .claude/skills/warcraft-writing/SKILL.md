---
name: warcraft-writing
description: warcraft-learner writing and branding - the plain-spoken coaching voice for every string a user sees, plus the product naming and the logo source of truth. Load this before writing or editing any user-visible string, or before touching the logo or favicon.
---

# warcraft-learner writing and branding

**What good looks like:** a raider reads any string once and knows what to change, and the product name is exactly `warcraft-learner`.

## Branding & naming

- **The product name is always `warcraft-learner`** - lowercase, hyphenated, exactly that casing. Never "Warcraft Learner", "WarcraftLearner", or any other variant. This applies to the page `<title>`, nav wordmark, CLI banners, READMEs, and any new user-facing copy.
- **Do not confuse it with "Warcraft Logs"** (a.k.a. WCL) - that is the external data provider, a separate product. Leave "Warcraft Logs" / "WCL" strings as-is; only our own app name is normalized to `warcraft-learner`.
- **Logo / favicon** - gold shield with an ascending bar chart. `frontend/public/favicon.svg` is the single source of truth; the `.ico` and the nav-bar mark derive from it, never hand-edited. The nav mark (`src/app/page-nav`) inlines the same artwork as SVG so it themes, with fills set through the `fill-gold` / `fill-surface` classes, **not** `fill="var(--...)"` attributes, which browsers do not reliably honor. Its literal gold hex tracks `--color-gold` in `frontend/src/styles.scss`.
- **Share card** - `frontend/public/og-image.png` is a logo derivative regenerated with it, backing `og:image` in `frontend/src/index.html` and `.github/pages-root/index.html`.

## UI copy voice (plain-spoken coach)

All user-facing copy - finding messages, remedies, card subtitles, empty states, microcopy - is written so a raider reads it once and knows what to change. Plain words over jargon, and never a number whose meaning the reader has to infer. The reference implementations, under `frontend/src/app/domains/raid-analysis/`, are the finding messages in the rotation rule kinds and `data/rotation/rotation-feature-service.ts` / `data/defensive/defensive-feature-service.ts`, and the gear notes in `data/gear/gear-comparison-service.ts`.

- **Count first, target second, in one sentence each.** A finding reads `<what happened>. <what to hit>.` `"4 of 12 Black Powders hit fewer than 3 targets. Wait for 3 or more."` Never staple two fragments together with a colon or a trailing label.
- **Name the comparison group `top raiders` in prose, `top logs` in data labels.** `"Top raiders average 12s."`, `"of top logs"`. `parse` names a Warcraft Logs ranking, so it appears only where the benchmark itself is defined.
- **A page's first benchmarked card names the group in full, later cards use the terse form.** `"vs the top Mythic logs for your spec."`, then `"X vs top logs."`
- **A coined term gets rewritten into words a first-time reader already knows, or names itself.** Where an invented word has to stay, the label or the card's own intro carries its meaning (`Hold until`, `top raiders average`, a flyover's intro line). Never a tooltip: hover text is invisible to exactly the reader who needs it, and absent on touch.
- **Show the one number the player should hit, never the internal range.** A band has two edges but only the judged one is actionable, so print that edge as a target: `"Aim for 90% or more."`, `"Wait for 3 or more."`, `"Cast it within 1.2s."` Never `"90-97%"` - a range makes the reader guess which end matters.
- **A flagged finding never prints its measured value and its target as the same string.** Round only as far as keeps the two apart: a 97.8% uptime under a 98.4% floor reads `97.8 / 98.4`, never `98 / 98`, which tells the reader they hit the mark the row flags them for missing.
- **A rate reads better as odds than as a percent.** `"Top raiders waste at most 1 in 10."`, not `"Top: 0-10%."`
- **No hedging or false optionality.** Never `Consider ...`, `you might want to`, `try to`, `~` before a benchmark, or `should`. Give the call: `"Hold Vanish to 3:20."`, not `"Consider holding Vanish until ~3:20."`
- **No statistics clutter in prose.** Never put `±stddev`, `avg`, or parenthetical variance into a sentence. Round the number and name the target plainly. The exact thresholds still live in the bench math; the copy just reports the outcome.
- **The compact `measured` cell keeps the short form, not a private code.** `{ value, unit }` renders in a narrow table column, so `+4s` / `top 0:08` stay. Two limits keep it readable: the unit is real words (`% uptime`, `cast(s)`, `in Bloodlust`), never an abbreviation the reader cannot expand (`in BL`); and the value reads your pull first, what it was judged against second, the order every `Measured` cell keeps. The prose rules above still govern `message`, `remedy` and `occurrenceTarget`.
- **`message` states the target, `remedy` says how to get it.** The two must not repeat each other: `"Rupture was up 78% of the fight. Aim for 90% or more."` pairs with `"Refresh Rupture inside its last 30%."`, never with `"Get Rupture to 90%."`
- **State facts, not praise.** A clean result is `"Standard build."` / `"On plan"`, never `"Matches top parsers"` / `"On a top-parse build"` / a celebratory tone. Empty states are neutral (`"Nothing flagged."`, `"No talent data."`) - never `"No issues detected!"` and never the optimistic `"... yet."` that implies the system is still filling in.
- **No decorative glyphs or emoji in copy.** No `✓`/`✗`/`⚠`/emoji as inline text; use words (`Kill` / `Wipe #3`) or a themed `mat-icon` where a glyph is genuinely needed.
- **Plain verbs, and address the player as `you` where it reads naturally.** `"You refreshed Rupture early 4 of 9 times."` Avoid filler verbs like `Deploy`, `leverage`, `utilize` - prefer `Use`, `Press`, `Hold`, `Spend`, `Wait for`, `Aim for`.
- **Sentence case everywhere a human reads it.** Card titles, section headings, nav items, buttons, form labels and options capitalize only the first word and proper nouns: `Burst windows`, `Pre-fight`, `Warcraft Logs report URL or code`. Strings rendered uppercase through `text-label` are still written in sentence case (`Top raiders average`, `Your build`) so a screen reader reads them the same.
- **A status word is a tag, never lowercase running text.** `Passive`, `Not used`, `Waiting`, `Your build`, `Bloodlust` render through `text-label` or as a sentence-cased value; no all-lowercase words and no italics.
- **"On plan" success states are quiet.** Use the neutral `.chip-onplan` tag (defined in `styles.scss`), not a green pill with a `check_circle`. A correct result should read as calm, not celebrated.
