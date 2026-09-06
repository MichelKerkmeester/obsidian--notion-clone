---
title: "Tasks: Rename to Obnotion"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "068 tasks"
  - "rename to obnotion tasks"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Rename to Obnotion

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

Every implementation row below names the **red** it must observe before the change and the
**green** that proves it. A row whose red was never observed is not done, it is asserted.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm the dependency has cleared: 0.0.30 is tagged and `058`, `056`'s edge-reveal,
      `057`'s month-chip and every `059`-`067` child have landed on `main`.
      **Check:** `git log --oneline origin/main | head -20` shows the `chore(release): cut 0.0.30`
      commit and no open sibling worktree branch is ahead of it
- [ ] T002 Acquire the css lane for this packet.
      **Check:** `tools/lane/css-lane.json` `holder` reads `068-rename-to-obnotion`, `baselineHash`
      matches `git hash-object styles.css | cut -c1-12`, and `node tools/lane/check-lane.mjs`
      exits 0
- [ ] T003 Re-run the census on the leg's actual base and record the numbers in `goal.md` §4.
      **Check:** all five commands in `plan.md` §"Required inventories" run, and the counts are
      written down before any edit. On `dc1d54a9` they were 3,375 / 17,099 / 3,181 / 4,314 / 134;
      re-measured on `e5830232` the `db-` count is **17,181**, `--db-` **2,330**,
      `note-database-container` **3,185** and `note-database` **4,446**, so the census is expected to
      drift upward and the leg's own base is the number that binds
- [x] T004 Get the operator's answers to `spec.md` §12 Q1-Q4.
      **Answered 2026-09-06 19:08.** Q1 no (repo keeps its name, by default and reversibly); Q2
      *"Attribute to MichelKerkmeester, credit upstream in README"*; Q3 *"obnotion- everywhere"*,
      **declining** this packet's own `obn-` recommendation; Q4 yes, fix `update-fork.sh` — T009.
      **Check:** `decision-record.md` ADR-003's Status reads `Accepted 2026-09-06 19:08` and names
      `obnotion-`, and `spec.md` §12 carries all four rulings
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage A — Identity

- [ ] T005 Change `manifest.json`: `id` → `obnotion`, `name` → `Obnotion`, reword `description` so it
      does not open with the old product name, and **settle the attribution** — `author` →
      `MichelKerkmeester`, `authorUrl` → `https://github.com/MichelKerkmeester`, `fundingUrl`
      **removed** (`manifest.json`). §12 Q2, ruled 2026-09-06 19:08.
      **Red:** `jq -r .id manifest.json` prints `note-database`, and
      `jq -r '.author, .authorUrl, .fundingUrl' manifest.json` prints pangy9's three values.
      **Green:** the id prints `obnotion`; `jq -r .author manifest.json` prints
      `MichelKerkmeester`; `jq 'has("fundingUrl")' manifest.json` prints `false`; and a
      scratch-vault install lands in `.obsidian/plugins/obnotion/`.
      **Not this task's:** the README's fork-credit prose. The ruling's second half — *"credit
      upstream in README"* — lands in the parallel README leg, and T021's release notes name it as
      the ruling's other half so it cannot be quietly dropped
- [ ] T006 [P] Change `package.json` `name` to `obsidian-obnotion` (`package.json`).
      **Red:** `jq -r .name package.json` prints `obsidian-note-database`.
      **Green:** it prints `obsidian-obnotion`, and `npm run build` still emits `main.js`
- [ ] T007 Rename the plugin class `NoteDatabasePlugin` → `ObnotionPlugin`, the hover-link display
      string, the changelog modal title, its three CSS classes and the
      `obsidian://show-plugin?id=note-database` deep link (`src/main.ts:88,117,489-497`).
      **Red:** `git grep -c 'Note Database' src/main.ts` prints 11.
      **Green:** it prints 0, and the changelog modal's link opens the plugin page under the new id
- [ ] T008 [P] Replace the **15** `Note Database` strings in `src/i18n.ts` across `en`, `zhCN` and
      `zhTW`, including `app.name` (3), `settings.title` (3) and the sentences that name the
      product (`src/i18n.ts`).
      **Red:** `grep -c 'Note Database' src/i18n.ts` prints 15.
      **Green:** it prints 0; the settings tab heading and the ribbon tooltip both read Obnotion in
      all three locales
- [ ] T009 [P] Point `update-fork.sh`'s `REPO` at the real origin
      (`MichelKerkmeester/obsidian--notion-clone`) and update its release-note text
      (`update-fork.sh:12,43`).
      **Red:** `grep -n 'obsidian-note-database' update-fork.sh` prints two lines, neither of which
      matches `git remote get-url origin`.
      **Green:** the constant equals the origin path

### Stage B — Compatibility (lands before the sweep)

- [ ] T010 Add the first-load data migration to `onload()`: when
      `.obsidian/plugins/obnotion/data.json` is absent and `.obsidian/plugins/note-database/data.json`
      exists, **copy** it into the new folder through the vault adapter, log once, and never move,
      rename or delete the source. Wrap it so a throw is non-fatal (`src/main.ts`, before the
      `loadData()` call at `:125`).
      **Red:** a test that seeds only the old folder and asserts the new folder has no `data.json`
      after load — it passes today, which is the defect.
      **Green:** the same test asserts the file is present in the new folder, byte-identical to the
      source, the source still exists, and a second load logs nothing
- [ ] T011 Register the compatibility aliases, all five, as permanent:
      (a) `registerMarkdownCodeBlockProcessor` for `note-database` **and** the new language, both
      mapping to `EmbeddedDatabaseRenderer` (`src/main.ts:453,467` — `database-view` already exists
      and stays);
      (b) `DATABASE_VIEW_TYPE` and `DATABASE_FILE_VIEW_TYPE` take new values while the old strings
      `note-database-view` and `note-database-file-view` stay registered so a stored
      `workspace.json` still resolves (`src/views/database-view.ts:244`,
      `src/views/database-file-view.ts:25`);
      (c) `buildLinkedViewFence` emits the new language and the fence matcher at
      `linked-view-block.ts:82,121` accepts old and new;
      (d) the CSV/markdown importer accepts `note-database-csv-markdown` as well as the new marker
      (`src/data/csv-markdown-zip-export.ts:68`, `src/main.ts:1296`).
      **Red:** four tests, one per alias, each failing on a fixture that holds only the old string.
      **Green:** all four pass, and each old string is listed in `acceptance-criteria.md` AC-006 as
      an intentional survivor of REQ-002

### Stage C — The prefix sweep

- [ ] T012 Write the rewrite script and commit it (`tools/naming/rename-prefixes.mjs`, new).
      It rewrites `note-database-container` → `obnotion-container`, the other 39 `note-database*`
      identifiers to their `obnotion*` forms, `db-` → `obnotion-` and `--db-` → `--obnotion-`
      (§12 Q3, ruled 2026-09-06 19:08 — **not** the `obn-` this packet recommended), across
      `styles.css`, `src/`, `tools/`, `.storybook/`, `README.md`, `manifest.json`, `package.json`
      and `screenshots/manifest.json`. It carries an **explicit exclusion list**: `db_view`,
      `specs/`, `node_modules/`, `main.js`, and every alias string T011 introduced.
      **Red:** run it with `--check` on the pre-sweep tree; it reports the 4,314 lines it would
      change and exits non-zero.
      **Green:** a second `--check` run after the sweep reports 0 lines and exits 0, and re-running
      the script is a no-op
- [ ] T013 Run the sweep and read its diff (`styles.css`, `src/**`, `tools/**`, `.storybook/**`,
      `README.md`, `screenshots/manifest.json`).
      **Red:** `git grep -c -E 'note-database|\bdb-[a-zA-Z0-9_-]' -- styles.css src tools .storybook README.md manifest.json package.json screenshots/manifest.json`
      sums to 4,314.
      **Green:** it sums to the alias count and nothing else; `git diff --stat -- specs` is empty;
      `rg -n '\bdb_view\b' src tools | wc -l` is unchanged at 57
- [ ] T014 Re-anchor the harness by hand where the script cannot reach: any selector built by string
      concatenation, any regex with an embedded prefix, any JSON pin whose key is a class name
      (`tools/live/*.json`, `tools/live/render-assertions.mjs`, `tools/live/sheet-grammar.mjs`,
      `tools/screenshots/scenarios/*.mjs`, `tools/storybook/verify-placement.mjs`).
      **Red:** deliberately leave one pin un-rewritten and confirm its lane fails; that is the
      negative control proving the lanes actually read the pins.
      **Green:** the control restored, every touched lane green

### Stage D — Evidence

- [ ] T015 Recapture the whole corpus and regenerate `screenshots/manifest.json` in the same commit
      as T013 (`screenshots/**`).
      **Red:** `npm run screenshots:verify` fails on source-fingerprint drift immediately after the
      sweep.
      **Green:** it exits 0; every capture's `pixelHash` is expected to have moved and the manifest
      blob id is recorded in `goal.md` §4 so later churn claims can be checked against it
- [ ] T016 Re-pin the css lane: set `baselineHash` to the post-sweep `styles.css` hash and **append**
      a release entry — never edit another release's `reviewed` list (`tools/lane/css-lane.json`).
      **Green:** `node tools/lane/check-lane.mjs` exits 0
- [ ] T017 Re-pin the census ratchets **downward** to the post-rename truth
      (`tools/naming/failing-values-baseline.json`, `tools/naming/build-operator-checklist.mjs`).
      **Green:** `node tools/naming/scan-failing-values.mjs` and
      `node tools/naming/build-operator-checklist.mjs --check` both exit 0, and no ratchet number is
      higher than it was before the leg
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T018 Run the three repo gates individually and read each exit status
      (`repo-rules/verification-gates.md`).
      **Green:** `npx tsc --noEmit`, `npm run build` and `npx vitest run` each exit 0
- [ ] T019 Run the whole gate from a clean tree, logged inside this worktree, stdin closed.
      **Green:** `npm run gate </dev/null > .worktrees/<this>/gate.log 2>&1; echo $?` prints 0 and
      the log shows 26 lanes
- [ ] T020 Fresh-vault smoke, observed by a human rather than asserted. Create a scratch vault,
      copy an old-id plugin folder with a real `data.json` into it, install the 0.0.31 build under
      `obnotion`, enable it, and confirm: the community plugin panel reads **Obnotion**; the
      settings survive the copy; one database note opens; one note holding a pre-rename
      `note-database` code fence renders its view; a `workspace.json` with the old view types
      reopens both tab kinds.
      **Green:** five observations recorded in `goal.md` §4 with what was seen, not with "passed"
- [ ] T021 Cut release 0.0.31 as the rename release from a clean clone of HEAD, with notes naming
      the id change and the migration, and the rebuilt `main.js` in the release commit
      (`manifest.json`, `package.json`, `versions.json`).
      **Green:** `gh release view 0.0.31 -R MichelKerkmeester/obsidian--notion-clone` lists
      `main.js`, `manifest.json`, `styles.css`
- [ ] T022 Copy the release build to the iCloud vault under the **new** plugin folder, after
      backing the current three files into `.backup-0.0.30/` in the old folder. Leave both
      `data.json` files alone.
      **Green:** `cmp` against the clean-clone export passes for all three files, and the installed
      `manifest.json` reads version 0.0.31 under `.obsidian/plugins/obnotion/`
- [ ] T023 Update the packet's own evidence: tick `acceptance-criteria.md` rows with the commands
      that proved them, write `implementation-summary.md`, and refresh `../changelog/`.
      **Green:** `node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" specs/005-component-surface-system/068-rename-to-obnotion --strict`
      first `RESULT:` line reads `PASSED`
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every `acceptance-criteria.md` row `Met`, `Waived` or `Superseded`
- [ ] Manual verification passed and written down as observations
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Durable Directive**: See `goal.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P0] 0.0.30 cut and every in-flight leg landed before the first edit
- [ ] CHK-004 [P1] The css lane acquired by this packet
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` and `npm run lint` clean
- [ ] CHK-011 [P0] No console errors on load in a scratch vault
- [ ] CHK-012 [P1] The migration's failure path is caught and logged once, never fatal
- [ ] CHK-013 [P1] The rewrite is a committed script, re-runnable and idempotent
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] Every acceptance-criteria row Met, Waived or Superseded
- [ ] CHK-021 [P0] Fresh-vault smoke observed by a human
- [ ] CHK-022 [P1] Both-folders-present, old-folder-empty and unparseable-`data.json` edge cases tested
- [ ] CHK-023 [P1] Each of the five aliases has its own failing-first test
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Finding class recorded per surface: the rename is `cross-consumer`, not `instance-only`
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed — the 40 `note-database*` identifiers and the 209 `--db-*` properties
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for every renamed symbol: harness pins, capture selectors, stories, docs, tests
- [ ] CHK-FIX-004 [P0] The rewrite script's exclusion list tested adversarially: `db_view`, a word containing `db-`, an alias string, a `specs/` path
- [ ] CHK-FIX-005 [P1] Matrix axes listed: {old id, new id} x {data.json present, absent} x {old fence, new fence} x {old view type, new view type}
- [ ] CHK-FIX-006 [P1] Gate run with an isolated log path inside this worktree, `$?` read from its own invocation
- [ ] CHK-FIX-007 [P1] Evidence pinned to the leg's SHA, not to a moving branch range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] The migration reads and writes only inside `.obsidian/plugins/`
- [ ] CHK-032 [P1] The migration never deletes, moves or renames the source file
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] spec/plan/tasks/acceptance-criteria/decision-record synchronized
- [ ] CHK-041 [P1] Release notes name the id change and the migration
- [ ] CHK-042 [P1] The README's upstream-credit line lands with the GLM rewrite leg, not here
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 0/13 |
| P1 Items | 15 | 0/15 |
| P2 Items | 0 | 0/0 |

**Verification Date**: pending
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All six ADRs have status; ADR-003 reads `Accepted 2026-09-06 19:08` and names `obnotion-`, not `obn-`, before the sweep
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P0] Migration path documented and tested
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Startup unchanged: the migration reads at most one file and copies at most one (NFR-P01)
- [ ] CHK-111 [P2] Bench lane unchanged after the sweep — a class rename must not move a number
- [ ] CHK-112 [P2] Capture count unchanged at 1,467; only pixelHash moves
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback documented: revert the leg's commits, re-release, restore `.backup-0.0.30/`
- [ ] CHK-121 [P0] The rebuilt `main.js` is in the release commit, or the Gates workflow fails
- [ ] CHK-122 [P1] The iCloud copy done from the clean-clone export, never from the working tree
- [ ] CHK-123 [P1] Release notes tell users the plugin id changed
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] `spec.md` §12 Q2 landed, not merely answered: `manifest.json` credits MichelKerkmeester, carries no `fundingUrl`, and the README's fork line exists before release
- [ ] CHK-131 [P1] The fork's LICENSE and upstream credit unchanged or improved, never removed
- [ ] CHK-132 [P2] `fundingUrl` points somewhere the operator intends
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All packet documents synchronized and validated `--strict`
- [ ] CHK-141 [P1] Parent `goal.md` reserved-children table and `roadmap.md` §4/§6A/§7 carry this packet
- [ ] CHK-142 [P1] `../changelog/` refreshed at close
- [ ] CHK-143 [P2] The GLM README rewrite referenced rather than duplicated
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product | [ ] Approved | |
| Operator | Device verification (D3) | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
