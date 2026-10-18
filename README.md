# warcraft-learner

A web-based diagnostic tool for Mythic WoW raiders. It fetches your combat data from Warcraft Logs, evaluates it against a plan for your spec read from SimulationCraft's rotation and Blizzard's own spell labels, and delivers coaching-style feedback benchmarked against the top raiders on your spec.

Live site: https://warcraft-learner.com/

## What it does

Before the pull, pick a class, spec and boss to see the plan top raiders run there: when they press each offensive and defensive cooldown, the talent builds, trinket pairs and enchants they bring, and the burst windows they hold for. Those timings export as a note for the Northern Sky raid addon.

After the pull, paste a Warcraft Logs report and pick a fight and a player. Every press of a button on your spec's SimulationCraft action priority list is judged against that button's own lines, and a button skipped while its line was due counts against it too. Each button gets a bar of how often you got it right beside the top raiders' range, and opening one lists every moment with the conditions that held and the ones that did not. On top of that it finds cooldowns left ready and unpressed longer than top raiders leave them, cooldowns never pressed, idle time past each cast's global cooldown and cast time, and cooldowns you spend early where top raiders hold them. When your raid lusts mid-fight, it also shows the cooldowns you did not have up during that Bloodlust where top raiders whose raids lusted mid-fight had them up.

Your damage in each burst window goes against the range top raiders manage there, each defensive window checks whether you had any defensive up where top raiders had one, with the damage you took beside it, and your talents, trinkets and enchants against their consensus for that boss. The pull itself gets read back to you as well: every death and the ability that landed it, your DPS, the duration, and the boss health you ended on.

Any finding, death, window or judged press opens a scrubbable map of where you and the top raiders stood at that moment. During a live raid the page re-analyzes as new pulls upload, and an opt-in screen recording cuts a clip of each window without ever leaving the browser.

Every reference is measured from the top Mythic logs for the same encounter and spec, one value per log. The numbers that are chosen rather than measured, such as how often a color may flag a top raider and the smallest group worth comparing against, live in one file, `frontend/src/app/domains/raid-analysis/data/verdict/verdict-choices.ts`.

## Run locally

The app talks to the Warcraft Logs API with a client-credentials pair that is compiled into the bundle, so the first step is a pair of your own: create an API client at https://www.warcraftlogs.com/api/clients/ (any WCL account; no redirect URL needed) and put it in the gitignored client file under `frontend/src/environments/`, next to the committed example that shows its shape. Your own client spends your own hourly WCL budget, not the deployed site's.

```bash
cd frontend
npm install
cp src/environments/wcl-client.example.ts src/environments/wcl-client.ts  # then paste your WCL client id and secret
npm run data:pull   # fetch the generated bench data from the `gh-pages` branch (see below)
npm start           # Angular dev server on http://localhost:4200, plus the ingest file server
npm run schema:pull # refresh the WCL GraphQL schema and regenerate the typed operations
```

The ~100 MB of generated bench data (minified JSON) under `frontend/public/data/specs/**` is not tracked on `main`; it lives once on the `gh-pages` branch at the site root under `data/specs/`, the single shared copy the deployed site serves. `npm run data:pull` fetches `origin/gh-pages` and extracts those files into your working tree, where they remain gitignored. Re-run it whenever you want the latest parse data.

The app is a fully static Angular SPA. It talks directly to the Warcraft Logs API from the browser using an OAuth2 client-credentials token (no user login); there is no backend. Every value the app reads from outside its own code (hosts, endpoints, the dev and ingest server origins, the raids ingestion benches, the WCL pair) lives under `frontend/src/environments/`: the defaults in one schema, an override file per build configuration, and a gitignored client file for the WCL pair that CI writes from the repository secrets. GitHub holds secrets only, never configuration.

## Documentation

See [`CLAUDE.md`](./CLAUDE.md) for the development entry point: architecture at a glance, commands, and the router into the on-demand skills under [`.claude/skills/`](./.claude/skills/) that hold the detailed conventions (change contract, writing, WCL/data).

## License

AGPLv3, see [`LICENSE`](./LICENSE).
