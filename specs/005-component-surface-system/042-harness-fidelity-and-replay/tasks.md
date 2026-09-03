---
title: "Tasks: Harness Fidelity and Replay"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "042 tasks"
  - "harness fidelity tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Harness Fidelity and Replay

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

- [ ] T001 Read `tools/live/render-assertion-harness.ts` in full and confirm the existing bag/scenario contract before extending it (`tools/live/render-assertion-harness.ts`)
- [ ] T002 Read `src/views/chart-renderer.ts`'s constructor and public surface to determine whether it fits the existing bag pattern (`src/views/chart-renderer.ts`)
- [ ] T003 [P] Confirm each replay-entry SHA (`98da630`, `0c92f4d`, `85ff504`, `037`-`041`'s landing commits) still exists in `git log` (repo)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Measure and record the chart view's current renderer-coverage state (uncovered) before writing any scenario (`tools/live/renderer-coverage.json`)
- [ ] T005 Add a chart-renderer render-assertion scenario with an owned negative control, observed red before green (`tools/live/render-assertion-harness.ts`, `tools/live/render-assertions.mjs`)
- [ ] T006 Measure and record the calendar lane's current scale coverage (month-only) before writing the week/day scenarios (`tools/live/render-assertion-harness.ts`)
- [ ] T007 Add calendar `scale: "week"` and `scale: "day"` scenarios, each with an owned negative control and bounds set from measured reads (`tools/live/render-assertion-harness.ts`, `tools/live/render-assertions.mjs`)
- [ ] T008 Re-stamp `renderer-coverage.json` and confirm the ratchet does not decrease (`tools/live/renderer-coverage.json`)
- [ ] T009 [P] Add replay claim entries for report 29 (`98da630`, `0c92f4d`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
- [ ] T010 [P] Add replay claim entries for reports 34-36 (`85ff504`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
- [ ] T011 [P] Add replay claim entries for phases `037`-`041`'s landings, each with its recorded pre-fix number; skip `040` until 1.4.7 ships if it has not by the time this task runs (`tools/live/replay.mjs`)
- [ ] T012 Confirm the replay lane reds when a required entry is deliberately removed, then restore it (`tools/live/replay.mjs`)
- [ ] T013 [P] Remove or declare the pinned `--db-calendar-day-min-height` / `--db-calendar-month-week-min-height` formula in `runtime-vars.css`, citing `getCellMinHeight()`'s real default (`tools/screenshots/runtime-vars.css`)
- [ ] T014 [P] Route `touch-targets.mjs` to the constructed renderer where the calendar/chart scenarios now cover it, or declare the remaining fixture dependency with its criterion (`tools/live/touch-targets.mjs`)
- [ ] T015 [P] Route `unstyled-links.mjs` the same way (`tools/live/unstyled-links.mjs`)
- [ ] T016 [P] Declare or add Obsidian's `.mod-cta` rule to `theme.css` (`tools/screenshots/theme.css`)
- [ ] T017 Correct `check-lane.mjs`'s `changedCaptures()` to compare by content/layout hash or a declared tolerance instead of raw git byte-diff (`tools/lane/check-lane.mjs`)
- [ ] T018 A/B the manifest-compare fix against a clean HEAD clone; confirm it still catches a deliberately mutated capture (repo, per parent D12)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T019 `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate`, `$?` read directly, no stray Chrome process before the run (`pgrep` empty)
- [ ] T020 `npm run replay`, `$?` read directly, confirm the new claim count and every `held: true`
- [ ] T021 External lane per D14: devin initial pass, then codex/luna, then in-runtime verification with Chrome
- [ ] T022 Update `goal.md`'s completion criteria with the observed red/green pair for each ticked row
- [ ] T023 Backfill graph metadata, run `validate.sh --strict` on this child, `build-operator-checklist`, `scan-failing-values`
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `npm run gate` exits 0
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available (T001-T003 confirm before implementation starts)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns (mirrors `026`'s scenario/bag structure)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] `npm run gate` and `npm run replay` both exit 0
- [ ] CHK-022 [P1] Every new negative control observed red before its fix
- [ ] CHK-023 [P1] Manifest-compare fix A/B'd against a clean HEAD clone
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each row-6 dependency has a finding class: removed (`class-of-bug`) or declared (`instance-only`, bounded).
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed for the two fixture-reading lanes (`touch-targets.mjs`, `unstyled-links.mjs`).
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for `changedCaptures()` — every caller of `check-lane.mjs`'s comparison logic.
- [ ] CHK-FIX-004 [P0] N/A — no security/path/parser/redaction surface in this phase's scope.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count listed before completion is claimed (per-scenario red/green pairs).
- [ ] CHK-FIX-006 [P1] N/A — no process-wide global state read by these checks.
- [ ] CHK-FIX-007 [P1] Every replay-entry evidence pinned to its exact fix SHA, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] N/A — no secrets, auth or authz surface in this phase's scope.
- [ ] CHK-031 [P0] N/A
- [ ] CHK-032 [P1] N/A
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/goal synchronized
- [ ] CHK-041 [P1] Code comments carry durable WHY only, no spec paths or phase labels
- [ ] CHK-042 [P2] N/A — no README surface in scope
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
| P0 Items | 10 | 0/10 |
| P1 Items | 8 | 0/8 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Not started
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] N/A unless an ADR is opened (see `plan.md` §"Architecture Decision Record")
- [ ] CHK-101 [P1] N/A
- [ ] CHK-102 [P1] N/A
- [ ] CHK-103 [P2] N/A
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] N/A — no NFR-P performance target in this phase's scope
- [ ] CHK-111 [P1] N/A
- [ ] CHK-112 [P2] N/A
- [ ] CHK-113 [P2] N/A
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented (`plan.md` §7)
- [ ] CHK-121 [P0] N/A — no feature flag
- [ ] CHK-122 [P1] N/A — no runtime monitoring surface
- [ ] CHK-123 [P1] N/A
- [ ] CHK-124 [P2] N/A
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] N/A
- [ ] CHK-131 [P1] N/A
- [ ] CHK-132 [P2] N/A
- [ ] CHK-133 [P2] N/A
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] N/A — no external API
- [ ] CHK-142 [P2] N/A — no user-facing documentation
- [ ] CHK-143 [P2] N/A
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Owner | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
