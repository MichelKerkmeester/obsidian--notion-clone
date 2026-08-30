---
title: "Tasks: Select Column Affordance Fit"
description: "Task breakdown for the select column's two controls, separating what landed under another phase's lane hold from the verification that was never run."
trigger_phrases:
  - "018 tasks"
  - "select column tasks"
importance_tier: "normal"
contextType: "planning"
---
# Tasks: Select Column Affordance Fit

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[x]` done, with evidence in the same row.
- `[ ]` outstanding.
- **Landed** means the edit is in the working tree. It does not mean verified, and it does not mean
  the operator has seen it.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] **T-001** Identify the report as unowned. Evidence: no criterion in `004-checkbox-ownership`
  measures column geometry; `017-touch-row-range-selection/acceptance-criteria.md` records the two
  overlap checks as "not this phase's".
- [x] **T-002** Recover the measured before-numbers. Evidence: `tools/lane/css-lane.json`, history
  entry 64 — phone −14px in a 49px cell, desktop −17px.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] **T-003** Remove `display` from the touch-floor block, keeping the floor. Evidence: lane entry
  64. Landed under `004`'s lane hold, not this phase's.
- [x] **T-004** Re-derive the select column: `4 + 28 + 4 + 28 = 64`, matched in the touch branch.
  Evidence: lane entry 64; `styles.css` declares `width/min-width/max-width: 64px`.
- [x] **T-005** Take the phone checkbox pin from 6px to 4px and declare the phone button at 28px.
  Evidence: lane entry 64.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] **T-006** Re-run `npm run storybook:placement` and record both after-numbers in
  `acceptance-criteria.md`. Until this runs, AC-1 through AC-3 rest on a journal entry.
- [ ] **T-007** Negative control: restore the `display` declaration, observe the desktop arm red,
  restore.
- [ ] **T-008** Negative control: restore the 48px column, observe the phone arm red, restore.
- [ ] **T-009** Recapture once the lane frees, and have a person open the changed PNGs.
  `screenshots:verify` proves a capture was regenerated, never that it looks right.
- [ ] **T-010** Ask the operator to confirm on device.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

This phase closes when T-006 through T-010 are done and every coverage cell in
`acceptance-criteria.md` is filled. It may not close on the landed edits alone.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) — the report and its two faults
- [`acceptance-criteria.md`](acceptance-criteria.md) — thresholds and recorded numbers
- [`../roadmap.md`](../roadmap.md) — the traceability table this phase answers a row of
<!-- /ANCHOR:cross-refs -->
