---
title: "Tasks: Notion Calendar Refinement"
description: "Ordered legs for the two surviving Notion calendar refinements, each with its red-first proof, its negative control and its verification row."
trigger_phrases:
  - "060 tasks"
  - "calendar refinement tasks"
  - "red first calendar"
  - "calendar device checklist"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Calendar Refinement

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

- [ ] T001 **Prove both criteria red on the tree the work starts from** (`src/views/calendar-pinned-values.test.ts`).
      Two assertions, written before either fix, that must fail on today's tree:
      (a) a constructed week-scale render carrying one all-day event with `endDateKey > startDateKey`
      counts `.db-calendar-month-dates` inside `.db-calendar-week-allday-cols` and asserts **0**;
      it reads **1** today, emitted at `calendar-renderer.ts:862-864`.
      (b) the computed `min-height` of `.db-calendar-mini-day` in the phone profile asserts **>= 44px**;
      it reads **34px** today (`styles.css:15938`), and the date-edit variant reads **28px**
      (`styles.css:6942`) inside a `(hover: hover)` block a touch device never enters.
      Record both observed red values in this file before touching either producer.
- [ ] T002 [P] **Inventory the shared class before editing it** (`src/views/calendar-renderer.ts`, `styles.css`).
      `rg -n 'db-calendar-month-dates' src styles.css` returns four emitters in `src`
      (`:628` day popover, `:862` all-day strip, `:930` overflow popover, `:1498` drag ghost, plus the
      live-update read at `:1310` and `:1483`) and three selectors in `styles.css`
      (`:17361` base, `:17381` the `:has()` flex bound, `:17452` the day-popover variant).
      Only `:862` is in-grid. Write the list into `implementation-summary.md` so the CSS retirement in
      T004 has a checked inventory rather than a memory.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Remove the inline range string from the all-day strip** (`src/views/calendar-renderer.ts:862-864`).
      Delete the guarded `content.createSpan({ cls: "db-calendar-month-dates", ... })` call and its
      `endDateKey > startDateKey` guard. Leave `getSegmentTitle` alone: the chip's `title` keeps the full
      range, which is where Notion's own frames leave it and where assistive technology reads it.
      Leave both popovers and the drag ghost alone - they are not in-grid surfaces.
      **Green:** T001(a) reads 0 on both profiles. **Negative control:** restoring the call turns it red.
- [ ] T004 **Retire the CSS the removal makes inert** (`styles.css:17361-17383`).
      The `:has()` flex bound at `:17381-17383` exists because a spanning bar's grid-column could fill a
      whole week and the title's own `flex-grow` pushed the range to the far edge. With no in-grid
      producer left, verify by **rendering the day popover and the overflow popover** - both use
      `.db-calendar-month-segment` and still carry the child - before deleting either rule. Keep whatever
      the popovers still need; delete only what nothing reaches.
- [ ] T005 **Lift the picker's day-cell touch floors** (`styles.css:15932-15945`, `:6941-6945`).
      Add profile-scoped floors following the precedents already in the file
      (`.is-phone .db-calendar-nav-button` at `:18628-18630` for the phone profile; the coarse-pointer
      region at `:20733-20856`): `.db-calendar-mini-day` reads **>= 44px** in the phone profile and
      **>= 28px** under `(pointer: coarse)`, in the toolbar mini calendar and the date-edit variant alike.
      Do not touch the hover-scoped 28px desktop density at `:6942` - a touch device never enters that
      block, which is the defect, not the value.
      **Blocked on device check D1** for the *selector*: the value is 44px either way, but whether a phone
      date-edit presents as a popover or as an `044` sheet decides which selector carries the lift.
- [ ] T006 **Pin both values with negative controls** (`src/views/calendar-pinned-values.test.ts`).
      Promote T001's two assertions to permanent pins, each with the negative control that produced its
      red. A regression must fail a test, not a capture review.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T007 **Run the three gates and read each one's output and exit status.**
      `npx tsc --noEmit`, `npm run build`, `npx vitest run`. A green run that exercised nothing is not
      evidence; say which of the three actually touched the change.
- [ ] T008 **Recapture and look at the images** (`npm run screenshots:verify`, then `npm run screenshots`).
      The week and day all-day strip in both themes, desktop and phone. Open every changed PNG. A capture
      that succeeded and photographed an empty box is green and uninformative.
- [ ] T009 **Record the four rows the rebuild closed** (`acceptance-criteria.md` section 3).
      `+N more` band (`057` G5/G8), the toolbar's segmented control (`057` G13), the unscheduled chip's
      44px floor, and the Monday week start (`057` G7) - each with the `main`-side evidence, as
      verification rather than as work.
- [ ] T010 **Hand the device checklist to the operator** (`acceptance-criteria.md` section 4).
      D1-D4. **Never ticked here.** An operator row is ticked by the operator, on the device.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` or `[B]` with a named blocker
- [ ] Every acceptance row `Met`, `Waived` or `Superseded`, each waiver naming an ADR that exists
- [ ] `057/acceptance-criteria.md` still reads 13 `Met` of 15
- [ ] Both negative controls observed red before the fix and green after
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Evidence**: `../057-calendar-anytype-parity/research/research.md` and the committed registries beside it (`findings-registry.json`, `deep-research-state.jsonl`, `orchestration-summary.json`). The lineage tree with the five iteration narratives is untracked under the repo's `specs/**/research/**/lineages/` ignore rule
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

- [ ] CHK-001 [P0] Both red-first values re-measured on the starting tree, not carried from the research
- [ ] CHK-002 [P0] The shared-class inventory run and written down before any CSS is retired
- [ ] CHK-003 [P1] Device check D1 answered, or T005 scoped to the profile that does not depend on it
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` passes, output and exit status read
- [ ] CHK-011 [P0] No console errors or warnings in the constructed renders
- [ ] CHK-012 [P1] No ephemeral artifact labels in any code comment
- [ ] CHK-013 [P1] The removal is a deletion, not a `display: none` - no phone-only patch that leaves the desktop red
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Both negative controls exercised in both directions
- [ ] CHK-022 [P1] The six-row matrix for REQ-002 ({toolbar mini, date-edit} x {phone, coarse, hover}) executed
- [ ] CHK-023 [P1] Same-day, timed and week-edge-continuation multi-day cases rendered
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each finding carries a class: the range string is `cross-consumer` (one class, four producers); the touch floor is `class-of-bug` (one metric, two variants)
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed by grep, or instance-only status proven
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for the changed CSS class and the changed emitter
- [ ] CHK-FIX-005 [P1] The REQ-002 matrix axes and row count listed before completion is claimed
- [ ] CHK-FIX-007 [P1] Evidence pinned to a SHA, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] No user input reaches a new sink; both legs are presentational
- [ ] CHK-032 [P1] N/A - no auth surface touched
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` synchronized
- [ ] CHK-041 [P1] Every ADR that a waiver names exists in `decision-record.md`
- [ ] CHK-042 [P2] `057/tasks.md`'s pointer to this child still resolves
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in `scratch/` only
- [ ] CHK-051 [P1] `scratch/` cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 11 | 0/11 |
| P2 Items | 1 | 0/1 |

**Verification Date**: pending
<!-- /ANCHOR:summary -->

---
