#!/usr/bin/env bash
# Publish locally-generated rulebook.json files to the gh-pages data tree.
#
# Rulebooks are gitignored on main (they live only on gh-pages, the single shared dataset).
# The warcraft-rulebook skill writes them into public/data/specs/{spec}/rulebook.json; this
# helper copies just those files onto gh-pages under data/specs/, leaving the bench data and
# the site shells untouched. Re-benching a changed rulebook is a separate manual step: bump
# INGEST_VERSION (scripts/ingest/ingest-version.ts) or dispatch the ingest workflow.
#
# Caveat: gh-pages is force-pushed as a single commit by the CI writers (ingest/deploy/preview).
# Run this when no ingest is mid-flight; if the push is rejected as non-fast-forward, a CI run
# raced you - just re-run this script.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$REPO_ROOT/frontend/public/data/specs"

mapfile -t RULEBOOKS < <(cd "$SRC" 2>/dev/null && find . -name rulebook.json | sort)
if [ "${#RULEBOOKS[@]}" -eq 0 ]; then
  echo "No rulebook.json files under $SRC - nothing to publish."
  exit 0
fi

git -C "$REPO_ROOT" fetch origin gh-pages
WORKTREE="$(mktemp -d)"
trap 'git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true' EXIT
git -C "$REPO_ROOT" worktree add --detach "$WORKTREE" origin/gh-pages

for rel in "${RULEBOOKS[@]}"; do
  dest="$WORKTREE/data/specs/${rel#./}"
  mkdir -p "$(dirname "$dest")"
  cp "$SRC/${rel#./}" "$dest"
done

git -C "$WORKTREE" add data/specs
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "gh-pages rulebooks already match local - nothing to publish."
  exit 0
fi
git -C "$WORKTREE" commit -m "Publish ${#RULEBOOKS[@]} rulebook(s) from the warcraft-rulebook skill"
git -C "$WORKTREE" push origin HEAD:gh-pages
echo "Published ${#RULEBOOKS[@]} rulebook(s) to gh-pages. Bump INGEST_VERSION or dispatch ingest to re-bench."
