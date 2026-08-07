# Making the skills and CLAUDE.md work with Copilot as well as Claude

Research findings and a conversion plan for running this repo's agent configuration on both
Claude Code and GitHub Copilot, with the same behaviour on both.

## 1. Findings

### 1.1 The skills need no conversion

Agent Skills is a shared open standard. Copilot discovers project skills in three directories:
`.github/skills/`, `.claude/skills/`, and `.agents/skills/`. Our existing `.claude/skills/` tree is
picked up as-is, with no copying, symlinking, or reformatting, on:

- Copilot cloud agent (coding agent)
- Copilot code review
- GitHub Copilot CLI
- Agent mode in VS Code (`chat.agentSkillsLocations` can add more locations; the three above are
  scanned by default)

Copilot requires exactly two frontmatter fields, `name` (lowercase, hyphens, max 64 chars) and
`description` (max 1024 chars). All 11 skills already satisfy both. Measured description lengths,
longest first: `warcraft-error-handling` 790, `warcraft-ingestion` 744, `warcraft-e2e` 732,
`warcraft-wcl-data` 719, `warcraft-architecture` 669, `warcraft-rulebook` 661, `warcraft-frontend`
638, `warcraft-testing` 594, `warcraft-copy` 525, `solid` 306, `angular-developer` 178. No skill
uses a Claude-only frontmatter key.

The three-stage progressive disclosure model is identical on both tools: metadata at startup, the
SKILL.md body when the description matches, `references/` and other bundled files only when the body
points at them. So `solid/references/*.md` (nine files, ~2900 lines) and
`warcraft-ingestion/rulebook.schema.json` load lazily on Copilot exactly as they do on Claude Code.

Invocation differs only cosmetically. Claude Code has an explicit `Skill` tool plus `/name`; Copilot
auto-loads by description match and exposes the same skills under `/` in chat. Both honour the
"load this before you start X" phrasing in our descriptions, which is why the descriptions are the
single most important thing to keep well written.

**Conclusion: zero work on skill bodies or frontmatter. The work is entirely in the router file and
in one skill that assumes Claude-only orchestration.**

### 1.2 CLAUDE.md is read by Copilot, but not uniformly

Copilot treats "agent instructions" as: any `AGENTS.md` in the tree, or a single root `CLAUDE.md` or
`GEMINI.md`. Coverage by surface:

| Surface | Reads root `CLAUDE.md` | Reads root `AGENTS.md` |
|---|---|---|
| Copilot cloud agent | yes | yes |
| Copilot code review | yes | yes |
| Copilot CLI | yes (also `.claude/CLAUDE.md`) | yes |
| VS Code agent mode | only when `chat.useClaudeMdFile` is on | only when `chat.useAgentsMdFile` is on |

`chat.useAgentsMdFile` is the setting people actually have on, and `AGENTS.md` is the file every
non-Claude tool looks for by name. `chat.useClaudeMdFile` is the one a Copilot-first developer is
least likely to have enabled. That is the only real gap on the instruction side, and it is closed by
having an `AGENTS.md` at the repo root.

All instruction layers merge and are sent on every request; there is no "one wins" behaviour between
`copilot-instructions.md`, `AGENTS.md`, and `CLAUDE.md`. That means duplicating the same rules across
two files sends them twice and creates a drift hazard, so the two root files must resolve to one
piece of content, not two copies.

### 1.3 What in CLAUDE.md is genuinely Claude-only

Everything in the "Always-on rules" and "Architecture at a glance" sections is tool-neutral prose and
ports unchanged. The Claude-only coupling is confined to the right-hand column of the workflow router
table:

- `the Plan agent` - a Claude Code subagent type
- `/code-review`, `/simplify`, `/verify`, `/run` - Claude Code built-in skills
- the framing "Load the matching skill before you start", which presumes an explicit load step

Copilot has near-equivalents for the first two (`.github/agents/*.agent.md` custom agents, its own
code review) but not under those names, so a Copilot session reading the table today is told to
invoke four things that do not exist. It will either ignore them or hallucinate around them. The fix
is to make the table name only project skills, and to fence the Claude built-ins into a clearly
labelled Claude-only column or section.

### 1.4 `warcraft-rulebook` is the one non-portable skill

It orchestrates a fan-out: the main agent preps sources, then dispatches one isolated authoring
subagent per spec, each reading only prepped scratchpad files. That depends on Claude Code's Task
tool. Copilot's closest primitives are custom agents in `.github/agents/*.agent.md` (max 30,000
character prompt) and VS Code's experimental `context: fork` frontmatter, neither of which gives a
skill the ability to fan out N isolated workers from inside its own procedure.

The skill's actual content splits cleanly, though: the source URLs, tier and branch discovery, WCL
grounding queries, the schema contract, the authoring brief, the output path, and the publish recipe
are all mechanical and portable. Only the "dispatch N subagents" step is not. So the portable
fallback is the same procedure run sequentially, one spec at a time.

### 1.5 Path-scoped instructions: deliberately not adopted

Copilot supports `.github/instructions/NAME.instructions.md` with an `applyTo` glob, which auto-injects
rules when a matching file is touched. Claude Code has no equivalent. It is tempting, but it would
duplicate rules that already reach the model by two other paths: the always-on rules ship on every
request via the root instruction file, and the domain rules already auto-load via skill descriptions
that name their file globs in prose. Adding a third copy buys determinism on one tool at the cost of a
second source of truth that only one tool reads and only one tool can drift against.

**Recommendation: skip `.github/instructions/` entirely.** Revisit only if Copilot is observed
ignoring a skill it should have loaded, and then add a single narrow file for that case.

Prompt files (`.github/prompts/*.prompt.md`) are likewise unnecessary: skills are already user-invocable
by `/name` on both tools, which is what prompt files would give us.

## 2. Target shape

```
AGENTS.md                  # symlink -> CLAUDE.md  (new)
CLAUDE.md                  # unchanged content, router table rewritten tool-neutral
.claude/skills/**          # unchanged; read natively by both tools
  warcraft-rulebook/
    SKILL.md               # portable procedure + one fenced "parallel fan-out" section
.github/agents/
  rulebook-author.agent.md # new; Copilot equivalent of the authoring subagent
scripts/
  check-agent-config.mjs   # new; CI guard on the contract above
docs/
  copilot-compatibility-plan.md
```

`AGENTS.md` as a symlink rather than a copy is what keeps one source of truth. Git stores it as a
symlink, Linux and macOS checkouts materialise it, and both tools resolve it through the filesystem
without knowing it is a link. On a Windows checkout without `core.symlinks=true` it lands as a text
file containing the path `CLAUDE.md`, which degrades to a broken pointer rather than to stale content.
If that ever matters, the fallback is a real duplicate plus a CI equality check, which
`check-agent-config.mjs` is already the natural home for.

## 3. Plan

### Phase 1 - root instruction file reaches every surface

1. Create `AGENTS.md` at the repo root as a symlink to `CLAUDE.md`
   (`ln -s CLAUDE.md AGENTS.md`), and confirm git records mode `120000`.
2. Add one line to the "How this file works" section of `CLAUDE.md` stating that the file is also
   published as `AGENTS.md` and is read by Claude Code and Copilot alike, so that a reader landing on
   either name knows it is the same file.

Acceptance: `git ls-files -s AGENTS.md` shows mode `120000`; `cat AGENTS.md` prints the CLAUDE.md
content.

### Phase 2 - make the router table tool-neutral

Rewrite the "Development workflow router" table so the "Load before you start" column names **only**
skills that exist in `.claude/skills/`. Move the Claude Code built-ins out of that column into either
a third column or a short paragraph under the table, labelled as Claude Code only, for example:

- Planning / scoping: **warcraft-architecture** plus the domain skill. On Claude Code, also use the
  `Plan` agent.
- Refactor / cleanup: **solid**. On Claude Code, also `/simplify`.
- Review: **solid** plus the domain skills. On Claude Code, also `/code-review`; on Copilot this is
  Copilot code review, which reads the same skills.
- Verify / run: on Claude Code, `/verify` or `/run`; otherwise run the commands from the Commands
  table directly.

Also generalise the loading verb: "Load the matching skill before you start" becomes wording that
covers both an explicit load and description-triggered auto-load, without naming a tool.

The paragraph under the table that resolves conflicts ("project skill / this file wins") stays as is;
it is already tool-neutral.

Acceptance: no occurrence of `Plan agent`, `/code-review`, `/simplify`, `/verify`, or `/run` in
`CLAUDE.md` outside a section explicitly marked Claude Code only.

### Phase 3 - split `warcraft-rulebook` into portable procedure plus Claude-only fan-out

1. Restructure `SKILL.md` so Steps 1 and 2 (spec selection, token, source prep, grounding) and Steps
   4 onward (validation, output path, gh-pages publish) are written as a plain sequential procedure
   with no mention of subagents.
2. Confine the dispatch mechanics to a single section, for example "Step 3 - author the rulebooks",
   which states the sequential default first and then, under a clearly labelled Claude Code
   subsection, the parallel fan-out with the Task tool. A Copilot session that ignores the fenced
   subsection still completes the job correctly, just serially.
3. Update the skill `description` so it no longer promises a fan-out as the only mode. Keep it under
   1024 characters.
4. `authoring-brief.md` is already source-agnostic; its two `subagent` references become
   "authoring agent". Its `.claude/` path reference to the schema stays, since that path is correct
   on both tools.
5. Add `.github/agents/rulebook-author.agent.md` carrying the authoring brief verbatim in its body,
   so Copilot users get a first-class single-spec authoring agent. Keep the brief itself as the one
   source of truth and have the agent file point at it rather than restating it, unless Copilot's
   agent loader needs the text inline, in which case the CI check in Phase 4 covers the duplication.

Acceptance: reading `SKILL.md` top to bottom while ignoring every section marked Claude Code only
still yields a complete, runnable procedure.

### Phase 4 - CI guard so the contract cannot silently rot

Add `scripts/check-agent-config.mjs`, run as a step in `.github/workflows/test.yml` (a plain
`node scripts/check-agent-config.mjs` step before the frontend jobs; it needs no dependencies). It
asserts:

1. Every `.claude/skills/*/SKILL.md` parses, has `name` and `description`.
2. `name` matches its directory, is `^[a-z0-9-]+$`, and is at most 64 characters.
3. `description` is at most 1024 characters and non-empty.
4. `AGENTS.md` resolves to `CLAUDE.md` (or, under the duplicate fallback, is byte-identical to it).
5. Every skill named in the CLAUDE.md router table exists as a directory under `.claude/skills/`.
6. No file under `.claude/skills/` or in `CLAUDE.md` contains an em-dash, en-dash, or Unicode minus,
   which folds the repo's existing always-on typography rule into the same check.

Acceptance: the check fails on a deliberately broken frontmatter and on a stray em-dash, and passes
on `main`.

### Phase 5 - verify on both tools

There is no automated way to assert agent behaviour, so verify by hand once, and record the result in
the PR:

1. Copilot CLI or VS Code agent mode in this repo: `/` lists all 11 skills by name.
2. Ask a scoped question that should trigger auto-load ("add a finding to the rotation slice") and
   confirm `warcraft-architecture` loads without being named.
3. Open a throwaway PR touching `frontend/src/**` and confirm Copilot code review's comments reflect
   the project rules (no hardcoded colours, no em-dashes, comment discipline).
4. The same three checks on Claude Code, to confirm Phase 2 and 3 rewrites did not regress it.

## 4. Effort and risk

| Phase | Size | Risk |
|---|---|---|
| 1 root file | one symlink plus one line | low; symlink degrades visibly on Windows checkouts |
| 2 router table | one table rewrite | low; prose only |
| 3 rulebook split | one skill restructure plus one new agent file | medium; the only behaviour change, and it makes the Claude path optional rather than removing it |
| 4 CI guard | one script plus one workflow step | low |
| 5 verification | manual, one session per tool | low |

The dominant finding is that the expensive-sounding part of this work, converting eleven skills, does
not exist: Copilot reads `.claude/skills/` natively and our frontmatter already conforms. The real
work is three files.
