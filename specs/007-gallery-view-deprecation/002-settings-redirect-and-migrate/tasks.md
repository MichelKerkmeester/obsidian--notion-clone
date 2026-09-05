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

- [ ] T001 [B] Read `001`'s surface list and rewrite this phase's REQ set from it (`../001-usage-and-migration-audit/implementation-summary.md`)
- [ ] T002 [B] Read `001`'s declared-loss list and decide what the migration must carry
- [ ] T003 [P] Read `046-linked-views-notion-parity/decision-record.md` ADR-001 — the operator's ruling on embeds writing to a source database is the nearest precedent for T008
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Remove the `gallery` exemption from the settings-load sanitizer, observed red first (`src/main.ts:144`, `:180`)
- [ ] T005 Land an imported `.base` `cards` view on `board` directly, carrying the `:1557` schema guard with it (`src/main.ts:1548-1616`)
- [ ] T006 [P] Add the closed-surface tests: a loaded gallery coerces, an imported `cards` view is a board (`src/views/gallery-hide-and-migrate.test.ts`)
- [ ] T007 Apply whatever `001`'s loss list says the migration is missing (`src/data/gallery-migration.ts`)
- [ ] T008 Take ADR-001: does the embedded codeblock host migrate? Add the call, or record the decision not to (`src/views/embedded-database-renderer.ts`, `decision-record.md`)
- [ ] T009 Assert migrate-twice-is-a-no-op so the notice cannot fire on every refresh (`src/data/gallery-migration.test.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T010 `npm run gate`, exit status read from `$?` and not through a pipe
- [ ] T011 Confirm `notice.galleryMigrated` renders in all three locales
- [ ] T012 Confirm the in-app undo restores `viewType` and the cover field together
- [ ] T013 Hand off to the orchestrator for a release cut, and record the version number here — `003` is blocked until it exists (parent D8)
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

- [ ] CHK-001 [P0] Requirements documented in spec.md, written from `001`'s surface list rather than from a guess
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] `001`'s declared-loss list read, so the migration knows what it must carry
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` clean and `npm run lint:tools` green
- [ ] CHK-011 [P0] No console errors from the migration path on open
- [ ] CHK-012 [P1] The migration stays pure: it takes a view and returns what to write
- [ ] CHK-013 [P1] The `.base` importer's schema guard survives the move to the board path
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Every closed surface observed RED before green, with the failing value recorded
- [ ] CHK-022 [P1] Migrate-twice-is-a-no-op asserted, so the notice cannot fire on every refresh
- [ ] CHK-023 [P1] A gallery with no cover field migrates without error
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each finding classed: the sanitizer and importer are `class-of-bug` (both re-admit a withdrawn value), the embedded-host gap is `cross-consumer`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory: every site assigning `viewType`, from `001`.
- [ ] CHK-FIX-003 [P0] Consumer inventory for `applyGalleryMigration` and `planGalleryMigration`.
- [ ] CHK-FIX-004 [P0] The importer path parses external `.base` input; its schema guard is asserted for the absent-column and mismatched-type cases.
- [ ] CHK-FIX-005 [P1] Matrix axes listed: host x entry point x cover-field state.
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the fix sha, not to a moving branch range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] The `.base` importer validates its input as it does today
- [ ] CHK-032 [P1] The migration writes only the view it migrates
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] The embedded-host decision is recorded either way, per REQ-004
- [ ] CHK-042 [P2] `004` is told which losses actually occurred
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
| P0 Items | 12 | 0/12 |
| P1 Items | 15 | 0/15 |
| P2 Items | 6 | 0/6 |

**Verification Date**: not yet run
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
