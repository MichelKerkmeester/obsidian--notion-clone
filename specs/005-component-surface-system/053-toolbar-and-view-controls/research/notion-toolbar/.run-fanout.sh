#!/bin/zsh
set -uo pipefail
cd "/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/.worktrees/180-notion-toolbar"

SPEC="specs/005-component-surface-system/053-toolbar-and-view-controls"
ART="$SPEC/research"
TOPIC="$(cat "$ART/.topic.txt")"
FANOUT_JSON="$(node -e 'const fs=require("node:fs");const c=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));process.stdout.write(JSON.stringify(c.fanout));' "$ART/deep-research-config.json")"

node .opencode/skills/system-deep-loop/runtime/scripts/fanout-run.cjs \
  --spec-folder "$SPEC" \
  --loop-type research \
  --research-topic "$TOPIC" \
  --fanout-config-json "$FANOUT_JSON" \
  --base-artifact-dir "$ART" \
  --convergence-threshold 0.05 \
  --stop-policy max-iterations
echo "FANOUT_EXIT=$?"
