---
title: "Tasks: iOS view data regression"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "070 tasks"
  - "ios property read tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: iOS View Data Regression

<!-- SPECKIT_LEVEL: 2 -->

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

- [ ] T001 Build a fixture vault mirroring the operator's real shapes (synthetic values): a Finance-shaped table (currency/text/date-sort columns) and a Testbed-shaped board (checkbox/number columns) (`tools/live/fixtures/`)
- [ ] T002 [P] Add a cold-cache harness scenario that boots the headless renderer against a fresh `data.json` before the metadata cache has resolved every file
- [ ] T003 [P] Add a warm-cache harness scenario as the comparison case
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Reproduce the empty-property read against both fixtures, cold cache first; confirm red before any fix (`tools/live/`)
- [ ] T005 Trace the read path in `src/data/data-source.ts` (`parseViewConfig`, `toViewPayload`) against the reproduction; confirm or exclude as root cause
- [ ] T006 Trace `src/data/title-field-display.ts` for any shadowing of the general property-read path introduced by 058
- [ ] T007 Trace `src/data/legacy-plugin-data-migration.ts`'s data.json bridge for a race or clear on iOS load
- [ ] T008 Fix the confirmed root cause, scoped to the read path only
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T009 Add a test proven to fail against the pre-fix code (mutation-proven) and pass after, in the nearest existing suite for the fixed file
- [ ] T010 Rerun the cold- and warm-cache harness scenarios; confirm green on both
- [ ] T011 Recapture the Finance Reports table and Database Testbed board screenshots
- [ ] T012 Record the operator device row in `acceptance-criteria.md`, left unticked
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` except the operator device row, which stays theirs
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed (cold-cache repro, recapture)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
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
- [ ] CHK-003 [P1] Dependencies identified and available (cold-cache timing)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented (cache-not-ready path fails safe, not silently empty)
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete (cold-cache repro reproduced and fixed)
- [ ] CHK-022 [P1] Edge cases tested (empty database, cache warm vs cold)
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Finding class recorded once root cause is confirmed: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed (`rg -n "MetadataCache|getFileCache|frontmatter" src/data/*.ts`)
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for the changed read-path symbol once known
- [ ] CHK-FIX-004 [P0] N/A — not a security/path/parser/redaction fix
- [ ] CHK-FIX-005 [P1] Matrix axes listed: cache state × view type × property type
- [ ] CHK-FIX-006 [P1] Cold-cache (process-wide metadata state) variant executed
- [ ] CHK-FIX-007 [P1] Evidence pinned to the fix SHA, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] N/A — no secrets involved
- [ ] CHK-031 [P0] N/A — no external input validation surface
- [ ] CHK-032 [P1] N/A — no auth/authz surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/acceptance-criteria synchronized after root cause is confirmed
- [ ] CHK-041 [P1] Code comments adequate; no spec paths or packet numbers embedded in code comments
- [ ] CHK-042 [P2] N/A — no README surface for this fix
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
| P0 Items | 9 | 0/9 |
| P1 Items | 8 | 0/8 |
| P2 Items | 1 | 0/1 |

**Verification Date**: Not yet run
<!-- /ANCHOR:summary -->

---
