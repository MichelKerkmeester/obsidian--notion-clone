---
title: "Acceptance Criteria: Rename to Obnotion"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "068 acceptance"
  - "rename closure gate"
  - "obnotion criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/068-rename-to-obnotion"
    last_updated_at: "2026-09-06T17:08:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Re-cut AC-003 and AC-004 on the 19:08 obnotion- prefix ruling"
    next_safe_action: "Run the leg after 0.0.30 and every in-flight sibling"
    blockers:
      - "Runs after 0.0.30 and after every in-flight leg; one rebase window"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "068-rename-to-obnotion"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Scope is everything including CSS class prefixes; the surface is the community plugin panel"
      - "The prefix is obnotion-, ruled 2026-09-06 19:08 against this packet's obn- recommendation"
      - "The manifest credits MichelKerkmeester and carries no fundingUrl (operator 19:08)"
---
# Acceptance Criteria: Rename to Obnotion

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/068-rename-to-obnotion
**Level:** 3
**Status:** Draft
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a scratch vault, When the 0.0.31 build is installed and enabled, Then the community plugin panel lists **Obnotion** and the plugin folder is `.obsidian/plugins/obnotion/` | `jq -r '.id,.name' manifest.json` prints `obnotion` / `Obnotion`; the panel read by eye and recorded in `goal.md` §4 | Unmet | - |
| AC-002 | REQ-002 | Given the rewrite scope, When the old name is grepped, Then only the intentional aliases named in AC-006 remain | `git grep -c -E 'note-database\|Note Database' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json` equals the alias count, listed line by line. Baseline on `dc1d54a9`: 3,375 in `styles.css`+`src` alone | Unmet | - |
| AC-003 | REQ-003 | Given the same scope, When `db-` tokens are grepped, Then zero remain, and `db_view` is untouched | `git grep -ho '\bdb-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook \| sort -u \| wc -l` prints 0, and `git grep -ho '\bobnotion-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook \| sort -u \| wc -l` prints the same distinct count the sweep replaced (baseline on `dc1d54a9` 1,724 distinct / 17,099 occurrences; on `e5830232` 1,728 / 17,181 — the leg's own base is the number that binds); `rg -n '\bdb_view\b' src tools \| wc -l` still prints 57 | Unmet | - |
| AC-004 | REQ-003 | Given the 209 `--db-*` custom properties (2,330 occurrences on `e5830232`), When the sweep runs, Then all 209 read `--obnotion-*` and no rule references a property that no longer exists | `git grep -ho '\-\-db-[a-zA-Z0-9_-]*' -- styles.css src tools \| sort -u \| wc -l` prints 0; `npm run gate` css lanes green | Unmet | - |
| AC-005 | REQ-004 | Given a vault with `.obsidian/plugins/note-database/data.json` and no `obnotion/data.json`, When the plugin loads under the new id, Then the file is copied into the new folder, the source still exists byte-identical, and one log line is written | The vitest migration test, plus the fresh-vault smoke's settings check (T020) | Unmet | - |
| AC-006 | REQ-005 | Given a vault written before the rename, When it is opened under 0.0.31, Then a `note-database` code fence renders, a stored `note-database-view` / `note-database-file-view` tab reopens, and a `note-database-csv-markdown` archive imports | Four alias tests, each failing first on an old-string fixture; the surviving strings enumerated here: `note-database` (code-block language), `database-view` (code-block language), `note-database-view`, `note-database-file-view`, `note-database-csv-markdown` | Unmet | - |
| AC-007 | REQ-006 | Given the post-sweep tree, When the whole gate runs from a clean checkout with stdin closed and an isolated log, Then it exits 0 across 26 lanes | `npm run gate </dev/null > <worktree>/gate.log 2>&1; echo $?` prints 0; the log read, not the exit code alone | Unmet | - |
| AC-008 | REQ-007 | Given the prefix rewrite, When a reviewer inspects how it was done, Then it is one committed, idempotent script with an explicit exclusion list, not scattered hand edits | `tools/naming/rename-prefixes.mjs` exists; `--check` exits non-zero before and 0 after; a second run is a no-op | Unmet | - |
| AC-009 | REQ-007 | Given the exclusion list, When it is tested adversarially, Then `db_view`, `specs/`, `main.js`, `node_modules/` and every alias string are provably untouched | `git diff --stat -- specs` empty; the four adversarial cases as unit tests on the script | Unmet | - |
| AC-010 | REQ-008 | Given the sweep landed, When the capture corpus is re-derived, Then `screenshots:verify` exits 0 on a manifest regenerated from this tree, and the manifest blob id is recorded before any churn claim | `npm run screenshots:verify`; `git rev-parse HEAD:screenshots/manifest.json` written into `goal.md` §4. Every one of 1,467 captures is expected to move pixelHash | Unmet | - |
| AC-011 | REQ-008 | Given the stylesheet moved, When the lane is handed back, Then `baselineHash` matches the new `styles.css` and a release entry is appended rather than an existing one edited | `node tools/lane/check-lane.mjs` exits 0; the diff of `tools/lane/css-lane.json` shows one appended entry | Unmet | - |
| AC-012 | REQ-011 | Given the census ratchets, When they are re-pinned, Then every number moved down or stayed, and none moved up | `node tools/naming/scan-failing-values.mjs` and `node tools/naming/build-operator-checklist.mjs --check` both exit 0; the baseline diff read number by number | Unmet | - |
| AC-013 | REQ-009 | Given a human at a scratch vault, When the five smoke observations are made, Then each is recorded as what was seen rather than as "passed" | Five lines in `goal.md` §4 Progress, each naming what appeared on screen | Unmet | - |
| AC-014 | REQ-010 | Given the leg landed, When 0.0.31 is released, Then its notes name the id change and the migration, its three assets are attached, and the iCloud vault holds the build under the new plugin folder with a `.backup-0.0.30/` beside the old one | `gh release view 0.0.31 -R MichelKerkmeester/obsidian--notion-clone`; `cmp` against the clean-clone export for all three files | Unmet | - |
| AC-015 | REQ-002 | Given the operator, When they read the plugin after 0.0.31 on their own device, Then they confirm the rename landed and nothing of theirs was lost | The operator's own report. Per parent D3 only this closes the packet; no in-repo check substitutes | Unmet | - |
| AC-016 | REQ-001 | Given `manifest.json` after the leg, When its attribution is read, Then `author` is `MichelKerkmeester`, `authorUrl` is `https://github.com/MichelKerkmeester`, no `fundingUrl` key exists, and `README.md` carries an explicit line crediting the upstream fork | `jq -r '.author, .authorUrl' manifest.json`; `jq 'has("fundingUrl")' manifest.json` prints `false`; `grep -n 'pangy9' README.md` prints at least the fork-credit line. §12 Q2, ruled 2026-09-06 19:08. **The README half is the parallel leg's to author** — this row fails if it is missing, which is the point of asserting both halves in one criterion | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Written at authoring time, before any work: sixteen rows open, one of them (AC-015) the operator's
own and unreachable from inside the repository. The packet is deliberately shaped so that the
mechanical half (AC-002 through AC-004, AC-008, AC-009) is decided by grep counts, and the half
that can actually hurt a user (AC-005, AC-006, AC-013) is decided by a human opening a vault.

AC-016 was added on 2026-09-06 19:08, when the operator ruled the manifest's attribution rather than
leaving it as the open row §12 Q2 had been. The same sitting changed AC-003 and AC-004's expected
strings from `obn-` to `obnotion-`; no row was renumbered.
<!-- /ANCHOR:closure -->
