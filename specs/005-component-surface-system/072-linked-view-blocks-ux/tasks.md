---
title: "Tasks: Linked/embedded database views and mobile drag parity with Notion"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Linked/embedded database views and mobile drag parity with Notion

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
## Phase 1: Determine

- [x] T001 Resolve the report into a named surface against the shipped build, evidence first (spec.md §2)
- [x] T002 Inventory every "doesn't work on mobile" reading with file:line; record the ones not fixed (spec.md §2, plan.md §3)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Prove, then fix

- [x] T003 RED: four gesture tests on the handle — lift→release→move, short tap→picker, mouse→untouched, wander→cancel — watched 2 failed / 28 passed against the unfixed tree (src/views/embedded-database-renderer.test.ts)
- [x] T004 The touch gesture: pointerType-"touch"-only, 450 ms / 10 px / vibrate(20), lifted class, release through the shared drop sequence (src/views/embedded-database-renderer.ts)
- [x] T005 Extract `completeLinkedViewDropAt` so the HTML5 drop and the touch release share one resolution+notice+move path (src/views/embedded-database-renderer.ts)
- [x] T006 The `is-touch-lifted` stylesheet rule, through the css-lane acquire/edit/release (styles.css, tools/lane/css-lane.json)
- [x] T007 GREEN: 30/30; mutation proof — four 1-diff mutations, each failing exactly one test
- [x] T008 [P] The live lane: gesture parity across both action bags + phone chrome across all three mounts (tools/live/embedded-linked-view-ux.mjs)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verify and record

- [x] T009 Full battery: tsc 0, vitest 0 (1676/1676), build 0, the standing live proofs 0, screenshots ×2 + decoded pixel-delta, evidence re-measured, the gate exit 0 (27 green)
- [x] T010 Docs: this checklist, acceptance-criteria, decision-record, implementation-summary, plan; the track handover; the landing commit
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [ ] Manual verification passed — the operator's device pass (AC-004) is the one check only their phone can make, recorded unticked by design
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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available — 069's gesture grammar, its proof machinery, and the established move picker, all shipped (plan.md §7)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks — the gate's `lint:tools` lane (the one unexpected failure on the first gate run was this lane, in the new lane script; fixed, re-run green) and `scan-comments` 0
- [x] CHK-011 [P0] No console errors or warnings — the headless lane collects `pageerror` and fails the run on any; none fired
- [x] CHK-012 [P1] Error handling implemented — the touch release routes through the same failure notice the desktop drop gives when no note sits under the finger
- [x] CHK-013 [P1] Code follows project patterns — the gesture constants, the lifted-class treatment and the fake-harness extension precedent all come from the packet's own ancestors, cited in the decision record
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria Met, except AC-004, which is the operator's device row and stays unticked by design
- [ ] CHK-021 [P0] Manual testing complete — pending the operator's device pass; every headless number is in implementation-summary.md, the phone feel is theirs to judge
- [x] CHK-022 [P1] Edge cases tested — the wander-cancel, the read-only lift that never fires, the release with no note under the finger, the same-column keep-in-place silence, and the bag that lacks the primary cross-group method
- [x] CHK-023 [P1] Error scenarios validated — four 1-diff mutations, each failing exactly one test, plus the lane's own first-run corrections (the keep-in-place expectation, the harness border-box reset) recorded, not papered over
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class: `class-of-bug` — HTML5-`draggable`-only controls are dead under a coarse pointer; the class is named, its producers inventoried, one of five fixed
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed — the handle, the table row handle, the view-tab rows, the database-switcher rows, and the absent column-drag: `plan.md` §3, rows 1–6, each with file:line
- [x] CHK-FIX-003 [P0] Consumer inventory completed — the changed symbols are private to the embedded renderer; the shared seam (`completeLinkedViewDropAt`) is consumed by the existing desktop-drop tests, which pass unchanged
- [x] CHK-FIX-004 [P0] Security/path/parser/redaction adversarial tests — N/A: the change is a gesture on an existing write path; no parser, path or redaction surface moves
- [x] CHK-FIX-005 [P1] Matrix axes listed before completion — pointer × gesture × target × host × read-only, in plan.md §3, each column covered by a unit test or a lane assertion
- [x] CHK-FIX-006 [P1] Hostile env/global-state variant — N/A: the change reads no process-wide state beyond the pointer events it listens to
- [x] CHK-FIX-007 [P1] Evidence pinned to a fix SHA — the landing commit's SHA is recorded in the session report; every number in this packet was read from `$?` and the referenced artefacts, not from a moving range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — none; the change adds listeners and one CSS rule
- [x] CHK-031 [P0] Input validation implemented — the gesture guards its inputs: pointerType, the 10 px wander window, the existing-note resolution, the read-only bag
- [x] CHK-032 [P1] Auth/authz working correctly — N/A: an Obsidian plugin, no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized — the determination, the defect table, this checklist and the acceptance criteria all tell the same story from the same numbers
- [x] CHK-041 [P1] Code comments adequate — `scan-comments` 0, artifact-id violations 0; the harness carries its one durability note where the next fidelity question will find it
- [x] CHK-042 [P2] README updated (if applicable) — the screenshots index regenerated itself in the recapture (616 entries)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — the battery's scratch logs ran in the system temp; the worktree root's gate logs and pixel-delta checkpoints were removed after their final read
- [x] CHK-051 [P1] scratch/ cleaned before completion — nothing task-created left untracked in the tree
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 11/12 (CHK-021 manual — the operator's device pass, by design) |
| P1 Items | 9 | 9/9 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-08
<!-- /ANCHOR:summary -->

---
