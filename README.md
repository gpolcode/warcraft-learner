# warcraft-learner

A web-based diagnostic tool for Mythic WoW raiders. It fetches your combat data from Warcraft Logs, evaluates it against spec-specific rulebooks, and delivers coaching-style feedback benchmarked against the top raiders on your spec.

Live site: https://warcraft-learner.com/

## What it does

Before the pull, pick a class, spec and boss to see the plan top raiders run there: when they press each offensive and defensive cooldown, the talent builds, trinket pairs and enchants they bring, and the burst windows they hold for. Those timings export as a note for the Northern Sky raid addon.

After the pull, paste a Warcraft Logs report and pick a fight and a player. A rulebook drives the grading instead of hardcoded spec logic, covering aura uptime, clipped refreshes, wasted procs, capped resources, opener order, target counts, buff windows and filler choice. On top of that it finds lost casts, poor Bloodlust alignment and slow openers, and flags the cooldowns you spend early where top raiders hold them.

Your damage in each burst window and the damage you took in each defensive window go against the range top raiders manage there, and your talents, trinkets and enchants against their consensus for that boss. The pull itself gets read back to you as well: every death and the ability that landed it, your DPS, the duration, and the boss health you ended on.

Any finding, death or window opens a scrubbable map of where you and the top raiders stood at that moment. During a live raid the page re-analyzes as new pulls upload, and an opt-in screen recording cuts a clip of each window without ever leaving the browser.

Every threshold is derived from the top 10 Mythic parses for the same encounter and spec, not from arbitrary constants.

## Run locally

```bash
cd frontend
npm install
npm run data:pull   # fetch the generated bench data from the `gh-pages` branch (see below)
npm start           # Angular dev server on http://localhost:4200
npm run schema:pull # refresh the WCL GraphQL schema and regenerate the typed operations
```

The ~100 MB of generated bench data (minified JSON) under `frontend/public/data/specs/**` is not tracked on `main`; it lives once on the `gh-pages` branch at the site root under `data/specs/`, the single shared copy the deployed site serves. `npm run data:pull` fetches `origin/gh-pages` and extracts those files into your working tree, where they remain gitignored. Re-run it whenever you want the latest parse data.

The app is a fully static Angular SPA. It talks directly to the Warcraft Logs API from the browser using an OAuth2 client-credentials token (no user login); there is no backend.

## Documentation

See [`CLAUDE.md`](./CLAUDE.md) for the development entry point: architecture at a glance, commands, and the router into the on-demand skills under [`.claude/skills/`](./.claude/skills/) that hold the detailed conventions (change contract, writing, WCL/data, rulebook generation).

## License

AGPLv3, see [`LICENSE`](./LICENSE).
