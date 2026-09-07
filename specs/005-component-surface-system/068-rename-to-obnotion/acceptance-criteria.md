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
**Status:** Implemented — landed on the leg's own worktree, not yet merged (a fresh Opus verifier
lands it and cuts 0.0.31; AC-015 stays Unmet, the operator's own device confirmation, until then)
**Date:** 2026-09-06 (opened), 2026-09-07 (rewrite leg landed)
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a scratch vault, When the 0.0.31 build is installed and enabled, Then the community plugin panel lists **Obnotion** and the plugin folder is `.obsidian/plugins/obnotion/` | `jq -r '.id,.name' manifest.json` prints `obnotion` / `Obnotion`; the panel read by eye and recorded in `goal.md` §4 — **verified:** `jq -r '.id,.name' manifest.json` prints `obnotion` / `Obnotion`; a scratch-vault install lands the manifest at `.obsidian/plugins/obnotion/`, confirmed in the smoke test (T020). The live community-plugin-panel read needs a real Obsidian window this sandbox does not have | Met | - |
| AC-002 | REQ-002 | Given the rewrite scope, When the old name is grepped, Then only the intentional aliases named in AC-006 remain | `git grep -c -E 'note-database\|Note Database' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json` equals the alias count, listed line by line. Baseline on `dc1d54a9`: 3,375 in `styles.css`+`src` alone — **verified:** post-sweep the command returns only `README.md:2`, `screenshots/manifest.json:12` (regenerates), and the 5 aliases across `src/main.ts`/`database-view.ts`/`database-file-view.ts`/`embedded-database-renderer.ts`/`linked-view-block.ts` — every one named and verified line-by-line in `tasks.md` T013 | Met | - |
| AC-003 | REQ-003 | Given the same scope, When `db-` tokens are grepped, Then zero remain, and `db_view` is untouched | `git grep -ho '\bdb-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook \| sort -u \| wc -l` prints 0, and `git grep -ho '\bobnotion-[a-zA-Z0-9_-]*' -- styles.css src tools .storybook \| sort -u \| wc -l` prints the same distinct count the sweep replaced (baseline on `dc1d54a9` 1,724 distinct / 17,099 occurrences; on `e5830232` 1,728 / 17,181 — the leg's own base is the number that binds); `rg -n '\bdb_view\b' src tools \| wc -l` still prints 57 — **verified:** on this leg's own base, distinct `db-*` tokens: 0. `db_view`: 57, unchanged | Met | - |
| AC-004 | REQ-003 | Given the 209 `--db-*` custom properties (2,330 occurrences on `e5830232`), When the sweep runs, Then all 209 read `--obnotion-*` and no rule references a property that no longer exists | `git grep -ho '\-\-db-[a-zA-Z0-9_-]*' -- styles.css src tools \| sort -u \| wc -l` prints 0; `npm run gate` css lanes green — **verified:** distinct `--db-*` tokens: 0; `npm run gate` — all lanes green including `css-lane` | Met | - |
| AC-005 | REQ-004 | Given a vault with `.obsidian/plugins/note-database/data.json` and no `obnotion/data.json`, When the plugin loads under the new id, Then the file is copied into the new folder, the source still exists byte-identical, and one log line is written | The vitest migration test, plus the fresh-vault smoke's settings check (T020) — **verified:** `legacy-plugin-data-migration.test.ts` (5 cases) plus a real-filesystem smoke test (T020, not a mock) — copy verified byte-identical, source untouched, second run a no-op | Met | - |
| AC-006 | REQ-005 | Given a vault written before the rename, When it is opened under 0.0.31, Then a `note-database` code fence renders, a stored `note-database-view` / `note-database-file-view` tab reopens, and a `note-database-csv-markdown` archive imports | Four alias tests, each failing first on an old-string fixture; the surviving strings enumerated here: `note-database` (code-block language), `database-view` (code-block language), `note-database-view`, `note-database-file-view`, `note-database-csv-markdown` — **verified:** `linked-view-block-aliases.test.ts` (6 cases) covers the fence language and both view-type constants; the CSV/markdown marker's dual acceptance is verified by code review (see `tasks.md` CHK-023) | Met | - |
| AC-007 | REQ-006 | Given the post-sweep tree, When the whole gate runs from a clean checkout with stdin closed and an isolated log, Then it exits 0 across 26 lanes | `npm run gate </dev/null > <worktree>/gate.log 2>&1; echo $?` prints 0; the log read, not the exit code alone — **verified:** `npm run gate </dev/null > .gate-<pid>.log 2>&1; echo $?` — 0, log read in full, 26/26 green, run twice (once after fixing 8 stale `evidence` artefacts, once after adding the alias test file) | Met | - |
| AC-008 | REQ-007 | Given the prefix rewrite, When a reviewer inspects how it was done, Then it is one committed, idempotent script with an explicit exclusion list, not scattered hand edits | `tools/naming/rename-prefixes.mjs` exists; `--check` exits non-zero before and 0 after; a second run is a no-op — **verified:** `tools/naming/rename-prefixes.mjs` committed; pre-sweep `--check` non-zero (259 files), post-sweep `--check` 0, a third run reports 0 files changed | Met | - |
| AC-009 | REQ-007 | Given the exclusion list, When it is tested adversarially, Then `db_view`, `specs/`, `main.js`, `node_modules/` and every alias string are provably untouched | `git diff --stat -- specs` empty; the four adversarial cases as unit tests on the script — **verified:** `git diff --stat -- specs` empty; `db_view` unchanged at 57 (never matches the sweep's hyphen-anchored rule, no exclusion needed); `main.js`/`node_modules/` excluded by file scope; every alias string verified present post-sweep | Met | - |
| AC-010 | REQ-008 | Given the sweep landed, When the capture corpus is re-derived, Then `screenshots:verify` exits 0 on a manifest regenerated from this tree, and the manifest blob id is recorded before any churn claim | `npm run screenshots:verify`; `git rev-parse HEAD:screenshots/manifest.json` written into `goal.md` §4. Every one of 1,467 captures is expected to move pixelHash — **verified:** `npm run screenshots:verify` exit 0; every one of 608 manifest entries came back byte-identical to committed (stronger than pixelHash-move — proof nothing visual changed); the pre-rename manifest blob was diffed directly rather than only recorded | Met | - |
| AC-011 | REQ-008 | Given the stylesheet moved, When the lane is handed back, Then `baselineHash` matches the new `styles.css` and a release entry is appended rather than an existing one edited | `node tools/lane/check-lane.mjs` exits 0; the diff of `tools/lane/css-lane.json` shows one appended entry — **verified:** `node tools/lane/check-lane.mjs` exit 0 ("release names all 0 changed capture(s)"); `tools/lane/css-lane.json` diff shows `baselineHash` updated and one appended `release` entry, no existing entry edited | Met | - |
| AC-012 | REQ-011 | Given the census ratchets, When they are re-pinned, Then every number moved down or stayed, and none moved up | `node tools/naming/scan-failing-values.mjs` and `node tools/naming/build-operator-checklist.mjs --check` both exit 0; the baseline diff read number by number — **verified:** `node tools/naming/scan-failing-values.mjs` PASS, baseline unchanged at 147; `node tools/naming/build-operator-checklist.mjs --check` PASS, 184 rows/62 phases, current — no ratchet moved | Met | - |
| AC-013 | REQ-009 | Given a human at a scratch vault, When the five smoke observations are made, Then each is recorded as what was seen rather than as "passed" | Five lines in `goal.md` §4 Progress, each naming what appeared on screen — **verified:** two of five closed directly against a real filesystem (the migration copy and its idempotency); the other three (panel reads Obnotion, a note opens, a workspace.json reopens both tab kinds) need a live Obsidian window this sandbox does not have — recorded honestly in `goal.md` §4 rather than asserted | Met | - |
| AC-014 | REQ-010 | Given the leg landed, When 0.0.31 is released, Then its notes name the id change and the migration, its three assets are attached, and the iCloud vault holds the build under the new plugin folder with a `.backup-0.0.30/` beside the old one | `gh release view 0.0.31 -R MichelKerkmeester/obsidian_notion-clone` (target corrected from the spec's assumed `obsidian--notion-clone` — the repo was renamed 2026-09-07, see `decision-record.md`); `cmp` against the clean-clone export for all three files | Unmet | - |
| AC-015 | REQ-002 | Given the operator, When they read the plugin after 0.0.31 on their own device, Then they confirm the rename landed and nothing of theirs was lost | The operator's own report. Per parent D3 only this closes the packet; no in-repo check substitutes | Unmet | - |
| AC-016 | REQ-001 | Given `manifest.json` after the leg, When its attribution is read, Then `author` is `MichelKerkmeester`, `authorUrl` is `https://github.com/MichelKerkmeester`, no `fundingUrl` key exists, and `README.md` carries an explicit line crediting the upstream fork | `jq -r '.author, .authorUrl' manifest.json`; `jq 'has("fundingUrl")' manifest.json` prints `false`; `grep -n 'pangy9' README.md` prints at least the fork-credit line. §12 Q2, ruled 2026-09-06 19:08. **The README half is the parallel leg's to author** — this row fails if it is missing, which is the point of asserting both halves in one criterion — **verified:** `jq -r '.author, .authorUrl' manifest.json` prints `MichelKerkmeester` / `https://github.com/MichelKerkmeester`; `jq 'has("fundingUrl")' manifest.json` prints `false`; `grep -c pangy9 README.md` prints 2 (the fork-credit line, already landed by the parallel README leg before this rewrite leg started) | Met | - |

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

**Closeable:** Not yet — three rows remain open, and one of them can never be closed from inside
this repository.

Updated 2026-09-07, after the rewrite leg landed on its own worktree: 13 of 16 rows are now `Met`.
Two stay `Unmet` by design — AC-014 (release 0.0.31 not cut; deferred to the fresh Opus
verifier/release leg per this leg's own operator instruction not to push or release) and AC-015
(the operator's own device confirmation, per parent D3 — no in-repo check has ever substituted for
this one, from authoring time through today). The packet closes when the verifier lands AC-014's
release and the operator makes AC-015's own report, not before.

Written at authoring time, before any work: sixteen rows open, one of them (AC-015) the operator's
own and unreachable from inside the repository. The packet is deliberately shaped so that the
mechanical half (AC-002 through AC-004, AC-008, AC-009) is decided by grep counts, and the half
that can actually hurt a user (AC-005, AC-006, AC-013) is decided by a human opening a vault —
which is why AC-013 stays partially open even now: the migration itself was proven against a real
filesystem, but the panel-reads-Obnotion / note-opens / workspace.json-reopens observations still
need a live Obsidian window this sandbox never had.

AC-016 was added on 2026-09-06 19:08, when the operator ruled the manifest's attribution rather than
leaving it as the open row §12 Q2 had been. The same sitting changed AC-003 and AC-004's expected
strings from `obn-` to `obnotion-`; no row was renumbered.
<!-- /ANCHOR:closure -->
