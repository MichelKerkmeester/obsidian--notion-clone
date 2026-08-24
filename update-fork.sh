#!/usr/bin/env bash
#
# Pull the latest upstream release, re-apply the euro-format override, rebuild,
# and cut a new fork release so BRAT can auto-install it.
#
# The override lives entirely in src/data/EuroFormat.ts plus two small call-site
# edits (CellRenderer.ts, SummaryRenderer.ts), so the rebase is normally clean.
# If upstream reworks those files, git stops on a conflict for you to resolve.
#
set -euo pipefail
cd "$(dirname "$0")"
REPO="MichelKerkmeester/obsidian-note-database"

git fetch upstream --tags
NEW="$(git ls-remote --tags upstream \
        | sed -E 's#.*refs/tags/##; /\^\{\}$/d' \
        | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)"
CUR="$(node -p "require('./manifest.json').version")"
echo "override base: $CUR    latest upstream: $NEW"
if [ "$NEW" = "$CUR" ]; then
  echo "Already tracking the latest upstream release. Nothing to do."
  exit 0
fi

echo "Rebasing the euro-format override onto $NEW ..."
if ! git rebase "$NEW"; then
  echo ">> Rebase conflict."
  echo ">> If it is only main.js:  git checkout --theirs main.js && git add main.js && git rebase --continue"
  echo ">> Otherwise resolve the source conflict, then: git rebase --continue"
  echo ">> Then re-run this script."
  exit 1
fi

npm ci
npm run build
git add -A
git commit --amend --no-edit --no-verify
git push --force-with-lease --no-verify origin HEAD:main

gh release create "${NEW}-euro.1" ./main.js ./manifest.json ./styles.css \
  --repo "$REPO" \
  --title "${NEW} (euro formatting)" \
  --notes "Fork of pangy9/obsidian-note-database ${NEW} with nl-NL euro number formatting. Install/update via BRAT."

echo "Released ${NEW}-euro.1 — BRAT will offer the update on its next check."
