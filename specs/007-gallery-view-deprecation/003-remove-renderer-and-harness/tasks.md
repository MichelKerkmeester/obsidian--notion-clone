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

- [ ] T001 [B] Confirm `002` SHIPPED in a release and record the version number here. A merge does not satisfy parent D8
- [ ] T002 [B] Read `001`'s capture classification: which of the 24 entries are board-shared (`../001-usage-and-migration-audit/implementation-summary.md`)
- [ ] T003 [P] Record the pre-change baseline: the gate's lane list BY NAME, the board capture hashes, and `renderer-coverage.json`'s current numbers (`scratch/baseline.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Split the four board-shared capture scenarios so each still asserts its board half with no gallery mount (`tools/screenshots/scenarios/shared.mjs`, `tools/screenshots/constructed-scenarios.mjs`)
- [ ] T005 Remove the two gallery-only scenarios and their manifest entries (`tools/screenshots/scenarios/core.mjs`, `constructed-scenarios.mjs:237`, `screenshots/manifest.json`)
- [ ] T006 Delete the renderer (`src/views/gallery-renderer.ts`) and its two render branches (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`)
- [ ] T007 [P] Delete the bench and its driver (`tools/bench/gallery-render-bench.ts`, `tools/bench/run-gallery.mjs`)
- [ ] T008 Remove both `renderer-coverage.json` `inputs` pins and lower the floor WITH the reason beside the number, in `006`'s idiom (`tools/live/renderer-coverage.json`)
- [ ] T009 [P] Remove the gallery paths from the render-assertion harness and the placement checks (`tools/live/render-assertion-harness.ts`, `tools/storybook/verify-placement.mjs`)
- [ ] T010 [P] Sweep the 81 `db-gallery-*` selectors, SPLITTING comma-joined lists rather than deleting the line (`styles.css`)
- [ ] T011 Take ADR-001: does `gallery` leave `DatabaseViewType`, and what happens to the six `gallery*` config fields (`plan.md`, `src/data/types.ts`)
- [ ] T012 Remove the i18n keys whose surfaces are gone, keeping the migration and undo strings the surviving migration needs (`src/i18n.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T013 `npm run gate`, exit status read from `$?`; compare the lane list BY NAME against T003's baseline and explain the delta rather than reporting a count
- [ ] T014 Run the FULL capture (`npm run screenshots` then `npm run screenshots:verify`), not only the gate's `render-assertions` lane — that lane is what missed `006`'s harness regression
- [ ] T015 Compare board capture hashes against T003's baseline; any move is a failure, not a rebaseline
- [ ] T016 Read two board captures by hand at both themes, because a hash match is not a look
- [ ] T017 `npm run replay` and confirm no claim references a removed file
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

- [ ] CHK-001 [P0] `002` has SHIPPED in a release, and the version number is recorded — merged does not satisfy this
- [ ] CHK-002 [P0] `001`'s capture classification read, so board-shared scenarios are known before anything is deleted
- [ ] CHK-003 [P1] `006`'s `007` implementation summary read, including the harness regression it caused itself
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` clean; `npm run lint:tools` green
- [ ] CHK-011 [P0] No dangling import of a deleted module
- [ ] CHK-012 [P1] Comma-joined CSS selector lists are SPLIT, not deleted whole (`styles.css:1188`, `:1411`)
- [ ] CHK-013 [P1] `card-field-renderer.ts` untouched — parent D5
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] The FULL capture run passed, not only the gate's `render-assertions` lane
- [ ] CHK-022 [P1] Board capture hashes compared against the pre-change baseline, not merely re-run
- [ ] CHK-023 [P1] The gate's lane list compared BY NAME before and after, not by count
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each removal classed: the renderer is `instance-only`, the shared capture scenarios are `cross-consumer`, the coverage ratchet is `matrix/evidence`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory: `rg -ril gallery src tools styles.css` before and after; the delta IS the change.
- [ ] CHK-FIX-003 [P0] Consumer inventory for `GalleryRenderer`, `gallery-render-bench` and `constructed-gallery`.
- [ ] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction surface changes. Recorded rather than silently skipped.
- [ ] CHK-FIX-005 [P1] Matrix axes listed: capture id x theme x device, 24 rows, four ids that must survive.
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the removal sha.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Not applicable — no input validation changes
- [ ] CHK-032 [P1] Not applicable — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] ADR-001 recorded with its status and its rejected alternative
- [ ] CHK-042 [P2] `004` is handed the exact list of what was removed, for the CHANGELOG
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
