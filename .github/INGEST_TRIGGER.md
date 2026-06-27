# Hourly ingest trigger (external)

The `Ingest Parse Samples` workflow (`.github/workflows/ingest-parses.yml`) is run **hourly by
an external scheduler**, not by GitHub's `schedule:` cron. GitHub's scheduled cron proved
unreliable for this repo: it dropped most fires under load (observed 3 fires in 7 hours even at
3x/hour) and ignores the configured minute. A `workflow_dispatch` triggered through GitHub's
REST API is never dropped, so an external scheduler calls it once an hour instead.

The scheduler used is [cron-job.org](https://cron-job.org) (free). Anything that can make an
authenticated hourly HTTPS POST works the same way.

## What it calls

```
POST https://api.github.com/repos/gpolcode/warcraft-learner/actions/workflows/ingest-parses.yml/dispatches
```

Headers:

| Header | Value |
|---|---|
| `Authorization` | `Bearer <FINE_GRAINED_PAT>` |
| `Accept` | `application/vnd.github+json` |
| `X-GitHub-Api-Version` | `2022-11-28` |
| `User-Agent` | `warcraft-learner-ingest-trigger` (GitHub rejects requests with no User-Agent) |

Body:

```json
{"ref":"main"}
```

A successful dispatch returns **HTTP 204 No Content** (no body). cron-job.org treats any 2xx as
success.

## 1. Create the GitHub token (one-time, only the repo owner can do this)

Create a **fine-grained personal access token**
(GitHub -> Settings -> Developer settings -> Personal access tokens -> Fine-grained tokens):

- **Resource owner**: `gpolcode`
- **Repository access**: Only select repositories -> `gpolcode/warcraft-learner`
- **Repository permissions**: **Actions -> Read and write** (this is the only one needed; GitHub
  adds Metadata -> Read-only automatically)
- **Expiration**: fine-grained PATs expire (max 1 year). Pick the longest allowed and set a
  calendar reminder to rotate it; when it expires the hourly trigger silently stops (the workflow
  itself keeps working via manual dispatch).

Copy the token once - it is only shown at creation.

This token only *triggers* the workflow. The workflow still commits and deploys with its own
in-workflow GitHub App token (`INGEST_APP_ID` / `INGEST_APP_PRIVATE_KEY`), so the PAT needs no
contents/commit permission.

## 2. Create the cron-job.org job

Sign up at cron-job.org (free), then **Create cronjob**:

- **Title**: `warcraft-learner hourly ingest`
- **URL**: `https://api.github.com/repos/gpolcode/warcraft-learner/actions/workflows/ingest-parses.yml/dispatches`
- **Schedule**: every hour (e.g. minute 0). The exact minute does not matter - the dispatch API
  is not subject to GitHub's scheduled-cron drops.
- **Advanced / Request method**: `POST`
- **Advanced / Headers**: add the four headers from the table above (Authorization with your PAT,
  Accept, X-GitHub-Api-Version, User-Agent)
- **Advanced / Request body**: `{"ref":"main"}`
- Enable failure notifications so a dead token or API change is visible.

Save, then use **Run now** / **Test run** to fire it once.

## 3. Verify

- The cron-job.org execution history shows **HTTP 204** for the test run.
- The repo **Actions** tab shows a new run of `Ingest Parse Samples` with **Event =
  `workflow_dispatch`**.
- Over the next few hours, confirm a `workflow_dispatch` run lands every hour.

## Rotating / disabling

- **Rotate the token**: create a new fine-grained PAT, update the `Authorization` header in the
  cron-job.org job, delete the old PAT.
- **Pause hourly ingestion**: disable the cron-job.org job. Manual `workflow_dispatch` runs (and
  the existing data-commit -> deploy chain) are unaffected.
