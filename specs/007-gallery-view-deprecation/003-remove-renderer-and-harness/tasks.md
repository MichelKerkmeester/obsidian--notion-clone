---
title: "Tasks: Remove the Gallery Renderer and Its Harness"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "gallery removal tasks"
  - "007 phase 3 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Remove the Gallery Renderer and Its Harness

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

- [x] T001 Confirmed `002` SHIPPED: `git merge-base --is-ancestor ceaa49ee a7e3db83` — the redirect/migration commit is an ancestor of `a7e3db83` (`chore(release): cut 0.0.27`); `manifest.json`/`versions.json` both read `0.0.27`
- [x] T002 Read `001`'s classification: `gallery-view`/`constructed-gallery` gallery-only; `card-cover-states`, `constructed-card-covers`, `chrome-group-selection-controls`, `constructed-group-selection-controls` board-shared
- [x] T003 Baseline recorded (in this document and the landing commit, not `scratch/`, which is gitignored and not a durable record): 25 gate lanes by name, `renderer-coverage.json` at `constructed: 6, total: 21`, board capture `pixelHash`/`layoutHash` read from `HEAD`'s `screenshots/manifest.json` before the recapture
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Split the board-shared capture scenarios so each still asserts its board half with no gallery mount: `card-cover-states` and `chrome-group-selection-controls` edited (gallery card/box removed from the fixture markup); `constructed-card-covers`/`constructed-group-selection-controls` edited in `render-assertion-harness.ts` (gallery construction removed) (`tools/screenshots/scenarios/core.mjs`, `chrome.mjs`, `shared.mjs`, `tools/live/render-assertion-harness.ts`)
- [x] T005 Removed the two gallery-only scenarios, their 8 manifest entries and their 8 tracked PNGs (`git rm`) (`tools/screenshots/scenarios/core.mjs`, `constructed-scenarios.mjs`, `screenshots/manifest.json`)
- [x] T006 Deleted the renderer (`src/views/gallery-renderer.ts`) and its two render branches, plus the now-dead creation-time defaults (`initializeViewTypeDefaults`, the new-view object literal, `getDefaultGalleryImageField`, `updateGalleryCardSize` in both hosts) (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`)
- [x] T007 Deleted the bench and its driver (`tools/bench/gallery-render-bench.ts`, `tools/bench/run-gallery.mjs`)
- [x] T008 Removed both `renderer-coverage.json` `inputs` pins; floor lowered to `constructed: 5, total: 20` with `note: "was 6/21; gallery renderer retired"`, re-stamped by `render-assertions.mjs` during the gate run (`tools/live/renderer-coverage.json`)
- [x] T009 Removed the gallery renderer construction, bag builders, tag functions and assertions from the render-assertion harness, and re-pointed `verify-placement.mjs`'s `SELECT_FIXTURE` off the deleted `gallery-view` scenario onto `chrome-board-extensions-selection` (`tools/live/render-assertion-harness.ts`, `tools/storybook/verify-placement.mjs`)
- [x] T010 Swept every `db-gallery-*` selector: one full section (18. GALLERY VIEW) deleted whole, its one shared rule kept in place; 15 comma-joined lists split rather than deleted (`styles.css`)
- [x] T011 Took ADR-001: `gallery` stays on `DatabaseViewType`, accepted-but-redirected; all six `gallery*` config fields stay. No diff to `src/data/types.ts` results, confirmed by `git diff --name-only` (`plan.md`)
- [x] T012 Removed 14 orphaned i18n keys (`undo.galleryCoverFieldConfig/ImageFitConfig/CoverRatioConfig`, `undo.cardSizeConfig`, `viewConfig.cardSize`, and 9 gallery-preset keys) across the locales that carried them; kept `common.galleryView`, `undo.galleryMigration`, `notice.galleryMigrated`, which the surviving migration still calls (`src/i18n.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T013 `npm run gate`: 25/25 green, `$?` = 0 read directly. Lane list BY NAME unchanged (25 names, same names) — the delta is explained in `acceptance-criteria.md` AC-003: gallery never owned a dedicated lane, unlike list's `list-window`
- [x] T014 Ran the FULL capture: `npm run screenshots` (546 entries, down from 554 — the 8 gallery-only entries), then `npm run screenshots:verify` (546/546 current, 0 stale)
- [x] T015 Compared board capture hashes against the `HEAD` baseline: `constructed-card-covers` identical in all 4 arms; the other 3 board-shared ids moved for reasons named in AC-004, not silently rebaselined — the 16 unrelated re-encode-only captures the full run also touched were restored to their `HEAD` bytes rather than committed as unrelated diffs
- [x] T016 Read all 12 changed captures by hand, both themes and both devices sampled — not just two — because a hash match is not a look
- [x] T017 `node tools/live/replay.mjs`: PASS, 28/28 results held, none referencing a removed file
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded` (all eight `Met`)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../002-settings-redirect-and-migrate/`
- **Precedent, including its own regression**: See `../../006-list-view-deprecation/007-remove-renderer-and-harness/implementation-summary.md`
- **Audit**: See `../001-usage-and-migration-audit/`
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

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] `002` has SHIPPED in a release (0.0.27), and the version number is recorded — merged does not satisfy this
- [x] CHK-002 [P0] `001`'s capture classification read, so board-shared scenarios are known before anything is deleted
- [x] CHK-003 [P1] `006`'s `007` implementation summary read, including the harness regression it caused itself
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` clean; `npm run lint:tools` green
- [x] CHK-011 [P0] No dangling import of a deleted module — confirmed by `npx tsc --noEmit` (0 errors) and `rg -l 'gallery-renderer|GalleryRenderer'` returning nothing outside spec documents
- [x] CHK-012 [P1] Comma-joined CSS selector lists are SPLIT, not deleted whole (the two the spec named moved line numbers after the rebase; both located and split, along with 13 more found by the full sweep)
- [x] CHK-013 [P1] `card-field-renderer.ts` untouched — parent D5, confirmed by `git diff --name-only`
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met
- [x] CHK-021 [P0] The FULL capture run passed (546/546 fresh), not only the gate's `render-assertions` lane
- [x] CHK-022 [P1] Board capture hashes compared against the pre-change baseline (`HEAD`'s manifest), not merely re-run
- [x] CHK-023 [P1] The gate's lane list compared BY NAME before and after, not by count — unchanged, 25 names both sides
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each removal classed: the renderer is `instance-only`, the shared capture scenarios are `cross-consumer`, the coverage ratchet is `matrix/evidence`.
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `rg -ril gallery src tools styles.css` before and after; the delta IS the change — 0 `db-gallery` selectors, 0 `GalleryRenderer` references outside spec documents.
- [x] CHK-FIX-003 [P0] Consumer inventory for `GalleryRenderer`, `gallery-render-bench` and `constructed-gallery`: every import site edited or deleted in this change (`database-view.ts`, `embedded-database-renderer.ts`, `render-assertion-harness.ts`, `render-assertion-bundle.mjs`, `constructed-scenarios.mjs`).
- [x] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction surface changes. Recorded rather than silently skipped.
- [x] CHK-FIX-005 [P1] Matrix axes listed: capture id x theme x device, 24 rows pre-change, 2 gallery-only ids (8 rows) deleted, 4 board-shared ids (16 rows) survive and were compared.
- [x] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [x] CHK-FIX-007 [P1] Evidence pinned to the removal commit's own sha (recorded below in the implementation summary).
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Not applicable — no input validation changes
- [x] CHK-032 [P1] Not applicable — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] ADR-001 recorded with its status (Accepted) and its two rejected alternatives
- [x] CHK-042 [P2] `004` is handed the exact list of what was removed, for the CHANGELOG (this document's Files Changed table, and the implementation summary)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — none created; evidence gathered by direct commands and recorded in this document instead
- [x] CHK-051 [P1] scratch/ cleaned before completion — nothing to clean
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 12/12 |
| P1 Items | 15 | 15/15 |
| P2 Items | 6 | 6/6 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions recorded in this phase's `plan.md` ADR section
- [x] CHK-101 [P1] Every ADR carries a status (ADR-001: Accepted)
- [x] CHK-102 [P1] Rejected alternatives named with their rejection reason
- [x] CHK-103 [P2] Migration path documented where one applies — `gallery-migration.ts` survives unchanged, per D6
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [x] CHK-110 [P1] No measurable regression in view-open time — a deletion removes a code path, it does not slow the surviving ones; no target was set for this phase
- [x] CHK-111 [P1] Throughput not applicable to a view-open path; recorded rather than skipped
- [x] CHK-112 [P2] Load testing not applicable
- [x] CHK-113 [P2] Benchmarks recorded where one exists — the gallery bench is deleted with the renderer, not benchmarked
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback procedure documented in `plan.md` §7 and its limits stated
- [x] CHK-121 [P0] Feature flag not used; the reason recorded — a deletion cannot hide behind one
- [x] CHK-122 [P1] Not applicable — the plugin has no server-side monitoring
- [x] CHK-123 [P1] The rollback steps are the runbook
- [x] CHK-124 [P2] Release notes drafted where this phase changes user-visible behaviour — `004`'s, per parent D and this phase's own scope boundary
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [x] CHK-130 [P1] No security-relevant surface changed, or the change reviewed
- [x] CHK-131 [P1] No dependency added
- [x] CHK-132 [P2] Not applicable
- [x] CHK-133 [P2] Vault data handled per the plugin's existing write model — `gallery-migration.ts`'s write path is unchanged by this phase
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `goal.md` agree
- [x] CHK-141 [P1] Not applicable — no public API
- [x] CHK-142 [P2] User-facing docs are `004`'s
- [x] CHK-143 [P2] Findings carried into the parent where they contradict it — AC-003's gallery-owns-no-lane finding and AC-004's mechanical-crop finding recorded here; nothing here contradicts the parent `goal.md`/`spec.md`
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product Owner | [ ] Approved | |
| Fresh in-runtime reviewer | QA | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
