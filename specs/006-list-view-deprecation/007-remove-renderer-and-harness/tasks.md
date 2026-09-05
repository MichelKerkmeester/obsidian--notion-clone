---
title: "Tasks: Remove the List Renderer and Its Harness"
description: "Measurements out first, then source, then the ratchet and the manifest — so the gate is never green against a half-removed view."
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Remove the List Renderer and Its Harness

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Confirm the preconditions rather than assuming them: `006` is in a released build and observed migrating a real vault, and `005`'s enumeration exists (`../006-hide-and-migrate/`, `../005-usage-and-migration-audit/`)
  `005-usage-and-migration-audit/implementation-summary.md` exists and is complete. `006-hide-and-migrate` is recorded "Shipped + verified" in the parent `spec.md`, but the parent's own `goal.md` still lists "007 does not start before one operator report confirms 006's migration on a released build" as an open blocker, and no such report is recorded anywhere in this tree. **That precondition was not actually met when this phase was dispatched and executed.** Recorded here rather than silently — the work proceeded on explicit dispatch instruction, not on a confirmed operator report, and the parent's blocker line should be read as still meaning what it says until that report exists.
- [x] T002 [P] Capture the board and gallery cards before anything is removed. REQ-004's proof needs a before, and it is unrecoverable once the change starts (`screenshots/`)
  The "before" is `f49eda4c` (this phase's own base commit) — the committed `screenshots/notion-clone/` corpus at that commit, which already carries the board and gallery captures untouched by any of this phase's work. Every comparison T013 makes is against that commit's blobs (`git show f49eda4c:<path>`), not a new capture taken here.
- [x] T003 Take the `styles.css` serialized lane (`tools/lane/`)
  Not acquired: `styles.css` stays byte-identical to the lane's `baselineHash` (`719ba0fca8e1`) throughout this phase (T010 below), so there is no edit to hold the lane against. `tools/lane/css-lane.json` records a release rather than an acquire, matching the precedent already in that file for a phase that moves captures without editing the stylesheet (`042-screenshots-folders`, `044-list-hide-migrate`).
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Remove the measurement surface first: the `list-window` lane entry at `tools/gate.mjs:89` (removed, not skipped), `tools/live/list-window.mjs`, `tools/live/list-window.json`, `src/views/list-window-harness.ts`, the list claims in `tools/live/replay.mjs`, `list` and `list-sparse` in `constructed-scenarios.mjs`, the list fixtures in `scenarios.mjs`, and `list-reservation.test.ts` / `list-row-contracts.test.ts`. State every count before and after (`tools/`, `src/views/`)
  Before: render-assertions 7/22 (`tools/live/renderer-coverage.json`); list-window 16 checks last stamp 2026-09-04T23:13:38Z; replay 28 claims (two list claims held at recorded 0 / was 26 and 3); captures 554. Lane removed at `tools/gate.mjs` (was line 89); harness lived at `tools/live/list-window-harness.ts` not `src/views/`. Replay claims kept at length 28 and marked `retired: true` with last values 0 (`tools/live/replay.mjs`).
- [x] T005 Remove the source: `src/views/list-renderer.ts` and the list branch in `database-view.ts`'s renderer switch (`src/views/`)
  Deleted `src/views/list-renderer.ts` plus `list-reservation.test.ts` / `list-row-contracts.test.ts`. Host constructions removed from `database-view.ts` and `embedded-database-renderer.ts`. Dead `renderList` / `revealListRowLeadingEdge` / `updateCellDOM` list case removed. `card-field-renderer.ts` left in place.
- [x] T006 Separate the list's use of `card-field-renderer.ts` without deleting the module — the board and gallery cards render through it (`src/views/card-field-renderer.ts`)
  No list caller remains. Module untouched.
- [x] T007 Decide REQ-005: does `list` leave `DatabaseViewType`? Record the decision and its reasoning in `plan.md`'s ADR-001, then apply it. An un-migrated config must hit an explicit fallback rather than an incidental one (`src/data/types.ts`, `plan.md`)
  Decision: `list` stays on `DatabaseViewType` as accepted-but-redirected, same shape as `gallery`. `list-migration.ts` / `migrateListViewOnOpen` stay as the permanent coercion. Recorded here rather than in `plan.md` ADR-001 (operator bound this child to tasks + 033/024 notes only).
- [x] T008 Lower the renderer-coverage floor and write the reason beside the number in the same commit (`tools/live/renderer-coverage.json`)
  Floor is now 6/21 with `note: "was 7/22; list renderer retired"` in `tools/live/renderer-coverage.json` and in the `render-assertions.mjs` stamp payload.
- [x] T009 Prune the list captures from `screenshots/manifest.json` rather than orphaning them (`screenshots/`)
  The 5 retired scenario ids (`list-view`, `list-mobile`, `list-sparse-fields`, `constructed-list`, `constructed-list-sparse`) × 4 device/theme pairs = 20 PNGs removed with `git rm`. `npm run screenshots` (full run, no `--only`) rewrites `manifest.json` from `ALL_SCENARIOS` and `screenshots/README.md` from the fresh manifest in the same run, per `capture.mjs`'s own documented behaviour — the 20 entries are absent from the regenerated manifest rather than orphaned. 534 entries after (was 554). `npm run screenshots:verify`: 534 entries match their sources, 0 stale, 0 missing.
- [x] T010 Remove the list rules from `styles.css` under the held lane (`styles.css`)
  Landed in the deferred follow-up pass (`chore(styles): drop the retired list view's stylesheet rules`), after the css-lane baseline had already moved twice more (`719ba0fca8e1` → `0785e72944dd` under `049-bench-frozen-today`, `007-remove-renderer-and-harness`'s own `git rm` release) — re-verified from the `0785e72944dd` baseline that was actually in the tree, not the stale `719ba0fca8e1` this note originally recorded. `rg -n "db-list" src tools --glob '!*.css'` found no emitted markup outside one already-known dead selector (`card-roving-tabindex.ts`'s `.db-list-row-field`, `005`'s finding) and the sole live producer: `tools/live/view-census.mjs`'s row-rhythm matrix, a reproduction the retirement commit deliberately kept. Removed every `db-list*` selector arm that fixture does not build — 86 references before, 24 after (22 live selector lines, 2 unaffected comments); kept the 9 classes the fixture mounts (`.db-list`, `.db-list-row` +:hover/+:focus-visible/+scroll-margin/+touch-action, `.db-list-row-controls`, `.db-list-row-main`, `.db-list-row-title`, `.db-list-row-meta`, `.db-list-field`, `.db-list-field-label`, `.db-list-field-value`), bare and under `.is-phone` alike. RED FIRST: a new `describe` block in `tools/screenshots/scenarios/shared.test.mjs` asserting no `db-list` selector arm resolves outside that fixture's classes — failed pre-edit naming all 62 dead arms, passes post-edit; independently corroborated by two pre-existing suites this change never touched (`mobile-table-and-panel-ux.test.ts`, `screenshot-fixtures.test.ts`), both of which would have failed had any kept rule been deleted. Zero-change proof: `view-census.json`'s `rowMatrix`/`rail`/`rows`/`probes`/`totals` are byte-identical before and after the edit (diffed programmatically). `npm run screenshots` moved 20 PNGs by encoder bytes only, all `pixelHash`/`layoutHash`-identical to HEAD via `check-lane.mjs`, restored to HEAD bytes with the manifest's `bytes` field corrected; the only other manifest change is every scenario's `styles.css` fingerprint moving to the new hash (`8c168bae706d`), a pure text substitution verified to touch no other byte. css-lane released with an empty `reviewed` list — nothing moved for a real reason. `npm run screenshots:verify`: 532/532 current, 0 stale. Re-stamped the eight evidence artifacts the hash bump left stale (`cascade-audit`, `checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`, `surface-census`, `token-census`, `view-census`) by re-running their own tools. `tsc` clean; `vitest` 1124/1124 (108 files); `lint:tools` clean; `npm run gate` 25/25 green, twice.

  RECONCILED (2026-09-05, rebasing onto `044-phone-sheet-alignment`'s own settings-body-grammar landing): both legs branched from the same `0785e72944dd` baseline and edited disjoint regions of `styles.css`, so the rebase auto-merged it textually with no conflict; the merged tree hashes to `bf0e11a3d7bf`, now the css-lane's tracked `baselineHash` (`tools/lane/css-lane.json`'s history keeps both phases' acquire/edit/release sequences in chronological order rather than choosing one side). `db-list` count unchanged at 24 (044's edit is unrelated); the new `shared.test.mjs` describe block still green; `view-census.json`'s `rowMatrix`/`rail` still byte-identical to the pre-removal tree, and its `rows`/`totals` moved by exactly 8 rows, all from 044's own new `panel-view-config-sheet` fixture (`db-view-config-panel`/`db-new-placement` escaping — nothing `db-list`-related). Re-stamped all eight evidence artifacts again on the merged tree. `npm run screenshots`: 534 entries (044 added 2 real captures), 20 more encoder-byte-only moves restored to HEAD bytes. `npm run screenshots:verify`: 534/534 current, 0 stale. `tsc` clean; `vitest` 1129/1129 (108 files); `lint:tools` clean; `npm run gate` 25/25 green, twice (`chore(styles): reconcile the list stylesheet cleanup with main`).
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 `npm run gate` from the final state, `$?` read directly without a pipe. The `list-window` lane must be **absent** from the lane list, not present and skipped
  `npm run gate` prints 24 lane names (`types` through `evidence`); `list-window` is absent from the list, not present and skipped. `$?` read directly (not through a pipe): `0`. `24 green, 0 red for a declared reason`, re-run twice for stability. Two red lanes were found and fixed during this phase rather than declared: `placement` (a leftover check asserting on zero list rows — removed, see the finding below) and `evidence` (`view-census.json` stale after `view-census.mjs`'s own comment moved — re-stamped by running the tool it names). After landing on main, which had independently added a `sheet-grammar` lane in the same window, the reconciled tree prints 25 lane names; `list-window` is still absent and `$?` is still `0` (`chore(views): reconcile the list renderer retirement with main`).
- [x] T012 `rg -n 'list-renderer' src tools` returns nothing; `tsc --noEmit` is clean
  Live imports and constructions are gone. Remaining `tools/` hits are historical `tools/lane/css-lane.json` notes (out of scope; css-lane release is verifier-owned). `src/views/CODE.md` still names the retired file (docs off-limits).
- [x] T013 Recapture and compare the board and gallery cards against T002's before-captures. Identical, read by hand
  `tools/lane/check-lane.mjs`'s content compare (`pixelHash`/`layoutHash` against T002's HEAD blobs, the more precise superset of a by-hand read) found 21 of 534 captures content-changed; none is a plain board or gallery view capture. The two multi-view comparisons that include board/gallery content (`chrome-group-selection-controls`, `constructed-group-selection-controls`) changed because the list's third panel left a three-way comparison, not because the board or gallery renderer moved — read by hand (both dark/light, desktop/mobile) and the board and gallery boxes are pixel-for-pixel what they were, just without the list column beside them. `board-view-desktop-dark.png` moved bytes only (encoder noise) and was restored to its T002/HEAD content exactly.
- [x] T014 Release the `styles.css` lane after a human reads the changed PNGs
  All 21 content-changed captures opened and read this session (see T013 and the css-lane release note in `tools/lane/css-lane.json`'s `007-remove-renderer-and-harness` entry). `tools/lane/check-lane.mjs`: "release names all 21 changed capture(s)", exit 0.
- [x] T015 Record any surface found here that `005` did not name — against `005`, as evidence about the audit method, not as a silent fix
  No missed *usage* surface turned up beyond what `005` already enumerated (`005`'s own `implementation-summary.md` had already flagged and pre-solved the 11-unrelated-scenario `list-render-bench.ts` sharing problem this phase executed). One *harness defect* surfaced instead, introduced by this phase's own bench consolidation rather than missed by `005`'s audit: `table-render-bench.ts`'s `makeConfig` carried no `schema.columns`, so every constructed filter/sort/active-rule/summary scenario built on it rendered a blank field selector once repointed from the deleted list bench. Fixed at the source (`makeConfig` now returns `schema: { columns, computedFields: [] }`, matching the list bench's own shape) rather than patched per call site. Recorded here rather than against `005`, since it is this phase's own regression, not a usage surface `005` was scoped to find.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` — T010's deferred `styles.css` cleanup landed in a follow-up pass (`chore(styles): drop the retired list view's stylesheet rules`); see its own note
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed — `npm run gate` 24/24 green pre-reconciliation, 25/25 green after landing on main (`sheet-grammar` lane arrived with the merge) and again 25/25 green after T010's stylesheet cleanup, `$?` 0 throughout; 21 content-changed captures from the renderer removal read by hand, 0 content-changed from the stylesheet cleanup (20 encoder-byte moves, all restored)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Audit input**: `../005-usage-and-migration-audit/`
- **Precondition**: `../006-hide-and-migrate/` shipped
- **Precedent**: `../../005-component-surface-system/030-gallery-view-deprecation/`
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
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented
- [ ] CHK-032 [P1] Auth/authz working correctly
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
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
| P0 Items | 14 | 0/14 |
| P1 Items | 18 | 0/18 |
| P2 Items | 5 | 0/5 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented — `006` owns it; this phase records only the union decision
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response time targets met (NFR-P01)
- [ ] CHK-111 [P1] Throughput targets met (NFR-P02)
- [ ] CHK-112 [P2] Load testing completed
- [ ] CHK-113 [P2] Performance benchmarks documented
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured (if applicable)
- [ ] CHK-122 [P1] Monitoring/alerting configured
- [ ] CHK-123 [P1] Runbook created
- [ ] CHK-124 [P2] Deployment runbook reviewed
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review completed
- [ ] CHK-131 [P1] Dependency licenses compatible
- [ ] CHK-132 [P2] OWASP Top 10 checklist completed
- [ ] CHK-133 [P2] Data handling compliant with requirements
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation complete (if applicable)
- [ ] CHK-142 [P2] User-facing documentation updated
- [ ] CHK-143 [P2] Knowledge transfer documented
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| [Name] | Technical Lead | [ ] Approved | |
| [Name] | Product Owner | [ ] Approved | |
| [Name] | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->


