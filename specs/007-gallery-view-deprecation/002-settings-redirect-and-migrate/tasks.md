---
title: "Tasks: Gallery Settings Redirect and Migration"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "gallery redirect tasks"
  - "007 phase 2 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Gallery Settings Redirect and Migration

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

- [x] T001 Read `001`'s surface list (`../001-usage-and-migration-audit/implementation-summary.md`); REQ set confirmed accurate against it — REQ-001/REQ-002 unchanged, REQ-004's embedded-host question is this phase's ADR-001
- [x] T002 Read `001`'s declared-loss list; carried per `decision-record.md`'s framing — `galleryImageAspectRatio`/`galleryImageFit` now carry to their board equivalents (`gallery-migration.ts`), `galleryCardSize`/`galleryCardSizePreset` stay declared losses with no board field, the preset carries its resolved number
- [x] T003 [P] Read `046-linked-views-notion-parity/decision-record.md` ADR-001 — cited as the embed-write precedent in `decision-record.md` ADR-001
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Closed the `gallery` exemption from the settings-load sanitizer, observed red first — but not by deletion: `001`'s audit showed deleting it the way `006` did would strand the cover, so both sites (`src/main.ts:146`, `:182`) now route a loaded gallery through `planGalleryMigration`/`applyGalleryMigration` in place. Recorded as ADR-002 in `decision-record.md`. Red: `gallery-hide-and-migrate.test.ts` failed on "no longer leaves a loaded gallery view as a gallery" and "converts a loaded gallery to a board through the real migration" against the pre-edit source; green after the edit (`npx vitest run src/views/gallery-hide-and-migrate.test.ts` — 11/11 passing)
- [x] T005 Verified the `.base` importer still lands a `cards` view on `board` (`src/main.ts:1577`, unchanged) and pinned it with two regression tests in `gallery-hide-and-migrate.test.ts` ("still maps a .base cards view to board", "still carries the imported image field")
- [x] T006 [P] Added the closed-surface tests in `src/views/gallery-hide-and-migrate.test.ts`: the pickers (pinned), the sanitizer closure (red-first), the `.base` importer (pinned), the second accepting surface staying open on purpose, and the migration hooks present in both hosts
- [x] T007 Applied `001`'s loss list to the migration (`src/data/gallery-migration.ts`): `galleryImageAspectRatio`/`galleryImageFit` now carry to `boardImageAspectRatio`/`boardImageFit`, a preset resolves to its numeric ratio before carrying (the preset label itself stays a declared loss), `galleryCardSize`/`galleryCardSizePreset` are left as declared losses with no board field. Two new tests in `gallery-migration.test.ts` (happy path + preset-resolution edge case)
- [x] T008 Took ADR-001: the embedded codeblock host migrates. Added `migrateGalleryViewOnOpen(config)` to `src/views/embedded-database-renderer.ts`, copying `migrateListViewOnOpen`'s exact shape (persisted `galleryMigrationNotices`, session-set guard, try/catch rollback). Recorded in `decision-record.md` ADR-001
- [x] T009 Migrate-twice-is-a-no-op already asserted at the pure-function level ("refuses to apply a second time" in `gallery-migration.test.ts`, pre-existing); the on-open persisted-notice guard now mirrors `migrateListViewOnOpen`'s own shape in both hosts, which is the same mechanism `006` relies on for the identical claim about the list
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T010 `npm run gate`: exit 0, read from `$?` directly (`cmd >/tmp/out.log 2>&1; echo $?`), 25/25 lanes green
- [x] T011 Confirmed `notice.galleryMigrated` renders in all three locales — it existed in `en` only; added to `zh-CN` and `zh-TW` in this phase (`src/i18n.ts`), verified by `npx vitest run src/i18n-key-coverage.test.ts src/i18n-plural.test.ts` (7/7 passing)
- [x] T012 Confirmed the in-app undo restores `viewType` and the cover field together: `applyGalleryMigration` leaves the gallery's own fields on the view rather than deleting them (unchanged behavior, asserted in `gallery-migration.test.ts`'s "keeps the gallery's own fields on the view"), and `undo.galleryMigration` (`i18n.ts:392`) names the step the plugin's undo stack restores
- [ ] T013 [B] Hand off to the orchestrator for a release cut — blocked on the orchestrator; `003` cannot start until a released version number exists (parent D8)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../001-usage-and-migration-audit/`
- **Precedent**: See `../../006-list-view-deprecation/006-hide-and-migrate/`
- **Embed-write precedent**: See `../../005-component-surface-system/046-linked-views-notion-parity/decision-record.md`
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

- [x] CHK-001 [P0] Requirements documented in spec.md, written from `001`'s surface list rather than from a guess — confirmed against `001/implementation-summary.md`
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] `001`'s declared-loss list read, so the migration knows what it must carry — §4 of `implementation-summary.md`, applied per `decision-record.md`
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` clean (exit 0) and `npm run lint:tools` green (exit 0)
- [x] CHK-011 [P0] No console errors from the migration path on open — the only `console.error` calls added are inside the existing `catch` rollback branches, matching `migrateListViewOnOpen`'s shape; they fire on a thrown write, not on the normal path
- [x] CHK-012 [P1] The migration stays pure: `planGalleryMigration`/`applyGalleryMigration` still take a view and a plan; no `App`, vault or DOM access added
- [x] CHK-013 [P1] The `.base` importer's schema guard survives the move to the board path — unchanged, pinned by a new regression test
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met — AC-001 through AC-006 are `Met`; AC-007 (a released version) is `Unmet` and not this dispatch's to close (T013)
- [x] CHK-021 [P0] Every closed surface observed RED before green, with the failing value recorded — `gallery-hide-and-migrate.test.ts` ran against the pre-edit source first (4 failures matching the exact assertions), then green after the edit (11/11)
- [x] CHK-022 [P1] Migrate-twice-is-a-no-op asserted at the pure-function level (`gallery-migration.test.ts`); both hosts' on-open guard now mirrors `migrateListViewOnOpen`'s already-tested persisted-notice shape
- [x] CHK-023 [P1] A gallery with no cover field migrates without error — pre-existing test "plans nothing for a gallery with no cover field, rather than nothing at all" still passes unchanged
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each finding classed: the sanitizer is closed via the real migration (`decision-record.md` ADR-002), the importer needed no change (already correct, pinned), the embedded-host gap is closed by adding the call (ADR-001)
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `001`'s surface list (sanitizer, `parseViewType`, `DEFAULT_VIEW_TYPES`) confirmed current against the tree during implementation
- [x] CHK-FIX-003 [P0] Consumer inventory for `applyGalleryMigration`/`planGalleryMigration`: `main.ts` (new), `database-view.ts` (existing, upgraded), `embedded-database-renderer.ts` (new) — `rg -n "applyGalleryMigration\|planGalleryMigration" src` confirms all three
- [x] CHK-FIX-004 [P0] The importer path's schema guard (`main.ts:1580`) is unchanged; pinned by a regression test rather than re-derived
- [x] CHK-FIX-005 [P1] Matrix axes: host (standalone, embedded) × entry (sanitizer, frontmatter parse, existing view) × cover (present, absent) — the four cells with an existing view are covered by the migration tests; the sanitizer's own two entry points are covered by the source-pin tests
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [x] CHK-FIX-007 [P1] Evidence pinned to this dispatch's own commits in this worktree, not to a moving branch range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] The `.base` importer validates its input as it does today — unchanged, pinned
- [x] CHK-032 [P1] The migration writes only the view it migrates — `applyGalleryMigration` mutates the single `ViewConfig` object passed to it, same as before
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] The embedded-host decision is recorded either way, per REQ-004 — `decision-record.md` ADR-001
- [x] CHK-042 [P2] `004` is told which losses actually occurred — `001/implementation-summary.md` §4 plus this phase's `gallery-migration.ts` header carry the per-field disposition; `004` inherits both
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — none created; this phase produced only the packet docs and source files listed in `implementation-summary.md`
- [x] CHK-051 [P1] scratch/ cleaned before completion — not applicable, none created
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 11/12 (CHK-020: AC-007's release is not this dispatch's to close) |
| P1 Items | 15 | 14/15 (CHK-FIX-006 not applicable) |
| P2 Items | 6 | 1/6 (remainder are template-level items not evaluated by this dispatch: architecture/perf/deploy/compliance/docs verification sections, sign-off) |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions recorded in this phase's `plan.md` ADR section
- [ ] CHK-101 [P1] Every ADR carries a status
- [ ] CHK-102 [P1] Rejected alternatives named with their rejection reason
- [ ] CHK-103 [P2] Migration path documented where one applies
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] No measurable regression in view-open time, or the absence of a target recorded
- [ ] CHK-111 [P1] Throughput not applicable to a view-open path; recorded rather than skipped
- [ ] CHK-112 [P2] Load testing not applicable
- [ ] CHK-113 [P2] Benchmarks recorded where one exists
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented in `plan.md` §7 and its limits stated
- [ ] CHK-121 [P0] Feature flag not used; the reason recorded
- [ ] CHK-122 [P1] Not applicable — the plugin has no server-side monitoring
- [ ] CHK-123 [P1] The rollback steps are the runbook
- [ ] CHK-124 [P2] Release notes drafted where this phase changes user-visible behaviour
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] No security-relevant surface changed, or the change reviewed
- [ ] CHK-131 [P1] No dependency added
- [ ] CHK-132 [P2] Not applicable
- [ ] CHK-133 [P2] Vault data handled per the plugin's existing write model
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `goal.md` agree
- [ ] CHK-141 [P1] Not applicable — no public API
- [ ] CHK-142 [P2] User-facing docs are `004`'s
- [ ] CHK-143 [P2] Findings carried into the parent where they contradict it
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product Owner | [ ] Approved | |
| Fresh in-runtime reviewer | QA | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
