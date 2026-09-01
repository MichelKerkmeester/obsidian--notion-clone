---
title: "Rule: Spec tree layout"
description: "Where spec packets live in this repository after the 2026-09-01 flattening, which directories are gitignored and why a path-anchored ignore goes silent when they move, and the one place a stale path is correct rather than stale."
trigger_phrases:
  - "spec folder"
  - "which spec packet"
  - "specs/public"
  - "packet path"
  - "packet_pointer"
  - "spec tree"
  - "where do specs live"
  - "move a spec folder"
  - "rename a packet"
  - "gate 3"
  - "documentation scope question"
  - "is this gitignored"
  - "personal packet"
  - "regenerate spec metadata"
importance_tier: important
contextType: reference
version: 1.0.0.0
---

# Rule: Spec tree layout

> Routed from [`REPO RULES.md`](../REPO%20RULES.md). Load it before writing into a spec folder, citing a
> spec path, or answering the documentation-scope question.
> Expands `AGENTS.md`, never overrides it. Where they appear to disagree, `AGENTS.md` wins and this file is wrong. Say so.

## Fires when

- Answering the documentation-scope question, or writing into any spec folder.
- Citing, constructing or following a `specs/` path.
- Moving, renaming or creating a top-level packet.
- Deciding whether something under `specs/` is tracked.

## The rule

**Packets sit directly under `specs/`. There is no `public/` level, and any path that still has one is
stale everywhere except inside a run record, where it is history and must be left alone.**

---

## 1. THE LAYOUT

```
specs/
  000-personal/                 ← GITIGNORED, never tracked, never read into a public artifact
  001-note-db-notion-parity-build/
  002-ui-improvement-research/
  003-ui-improvement-build/
  004-component-screenshot-system/
  005-component-surface-system/ ← the active program
  006-list-view-clickup/
  context/                      ← GITIGNORED, vendored third-party source for reference
```

Each top-level entry is a program; its numbered children are the phase packets, and those are what
`validate.sh` is normally pointed at.

**This changed on 2026-09-01.** Every packet used to live one level deeper, under `specs/public/`.
The flattening was deliberate. What it cost is documented below, because none of it was visible at
the time and all of it will be invisible again the next time a directory moves.

---

## 2. WHAT A MOVE SILENTLY BREAKS

Four things broke, and only one of them announced itself.

**A path-anchored ignore stops matching and says nothing.** `.gitignore` read
`specs/public/000-personal/`. After the move the personal packet was no longer ignored, and the only
symptom was its absence from a list nobody was reading. It stayed untracked purely because no
`git add -A` ran in between. The entry is now anchored at `/specs/000-personal/`, and the pre-move
path is kept beside it so a stale checkout or a partial revert cannot re-expose it. **Whenever a
directory named in `.gitignore` moves, re-run `git check-ignore -v` against a real file inside it.**
Checking the directory alone is weaker than checking a file, and both are cheap.

**A tool that hardcodes the tree scans nothing and can report clean.** `tools/naming/scan-failing-values.mjs`
holds the program root in a `PROGRAM` constant. After the move it walked an absent directory. It
failed loudly only because it carries an explicit guard — *no ticked criteria found, which is not the
same as clean* — and exits non-zero on an empty scan. A lane without that guard passes on zero files.
**When adding a lane that walks a fixed path, make an empty result an error, not a pass.**

**Generated metadata drifts from disk.** Every packet's `graph-metadata.json`, `description.json` and
each doc's `packet_pointer` carried the old prefix, and `METADATA_DISK_PATH_CONSISTENCY` fails on all
of them. The fix is one command, not a hand edit:

```bash
NODE_PRESERVE_SYMLINKS=1 npx tsx \
  "$(realpath .opencode)/skills/system-spec-kit/scripts/graph/backfill-graph-metadata.ts" \
  --all --root specs
```

Re-run it after any spec-doc edit, not only after a move.

**Files that were tracked before an ignore rule existed stay tracked.** The move dropped 73 files from
the index — lineage ledgers, `_archive/`, `dispatch-receipts/`, `.tmp/`. Every one was already matched
by an existing `.gitignore` rule and had only survived because ignores do not apply retroactively.
They remain on disk. That is a cleanup, not a loss, but it is worth reading the dropped list rather
than assuming.

---

## 3. THE ONE PLACE `specs/public/` IS CORRECT

`.jsonl`, `.log` and `.lock` files under `research/`, `review/lineages/` and `scratch/` are append-only
records of runs that happened while the old path was real. Roughly 46 tracked files still contain it.

**Do not rewrite them.** A run record saying `specs/public/005-component-surface-system` is reporting
what was true when it was written. Editing it produces a document that agrees with today's tree and
lies about the past, which is worse than a path that no longer resolves. A stale path in a log is
readable as history; a corrected one is not readable as anything.

Everything else — `.md` prose, `packet_pointer`, and the `packet_id`, `parent_id`, `specFolder`,
`spec_folder` and `last_active_child_id` keys — was migrated and carries no prefix.

---

## 4. THE OPEN CONFLICT WITH THE SPEC-KIT CONTRACT

**Six roots fail validation and the failure is real, not stale metadata.**

`validate.sh` requires `packet_pointer` to match `^[a-z0-9._-]+(?:\/[a-z0-9._-]+)+\/?$` — at least two
segments, because the kit models every packet as `specs/<track>/<packet>`. The rule is
`SPECDOC_FRONTMATTER_004` in
`system-spec-kit/mcp-server/lib/validation/spec-doc-structure.ts`. The field is required, so it cannot
be dropped to satisfy the check.

Flattening put the six programs at track position, so each root's pointer is a single segment and each
root fails. Their children are unaffected: `005-component-surface-system/017-touch-row-range-selection`
is two segments and passes.

**This is the operator's call and has not been taken.** Do not invent a track segment to quiet the
rule — a pointer naming a folder that does not exist is worse than a failing check, because it stops
failing. The three dispositions:

1. Amend the rule to accept a single-segment pointer. One regex. But the kit is symlinked from the
   Public monorepo and shared with every other repository, so the change is not local.
2. Reintroduce one level under a track name of the operator's choosing, which undoes the flattening.
3. Accept the six root failures as a known, recorded divergence and validate packets rather than roots.

Until it is decided: **`npm run gate` is this repository's authority and it is green.** Validating a
child packet passes. Validating a program root reports `SPECDOC_FRONTMATTER_004` and that is expected,
not a regression to chase.

---

## 5. WHAT TO UPDATE IF THE TREE MOVES AGAIN

In this order, because each one is silent on its own:

1. `.gitignore` — every path-anchored entry, then `git check-ignore -v` a real file inside each.
2. `tools/naming/scan-failing-values.mjs` — the `PROGRAM` constant.
3. `tools/naming/scan-spec-references.mjs`, `tools/bench/README.md`, `tools/storybook/README.md` — path examples.
4. `packet_pointer` in every doc, and `packet_id` / `parent_id` / `specFolder` / `spec_folder` /
   `last_active_child_id` in every `graph-metadata.json` and `description.json`.
5. Prose cross-references in `.md`. Never the run records in §3.
6. `backfill-graph-metadata.ts --all --root specs`.
7. `npm run gate`, reading `$?` directly, then `validate.sh` on a child packet.
