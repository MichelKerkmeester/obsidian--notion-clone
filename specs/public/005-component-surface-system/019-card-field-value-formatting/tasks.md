---
title: "Tasks: Card Field Value Formatting"
description: "Task breakdown separating the landed renderer change from the tests and parity check that do not exist."
trigger_phrases:
  - "019 tasks"
  - "card field formatting tasks"
importance_tier: "normal"
contextType: "planning"
---
# Tasks: Card Field Value Formatting

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[x]` done, with evidence in the same row.
- `[ ]` outstanding.
- **Landed** means the edit is in the working tree, and nothing more.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] **T-001** Establish that the formatter existed and the card renderer was the exception.
  Evidence: `src/data/euro-format.ts` exports three functions; `cell-renderer.ts`,
  `table-footer-renderer.ts`, `summary-renderer.ts` and `reports-display.ts` already called them.
- [x] **T-002** Establish that no spec owned this report. Evidence: no document under the program
  mentions currency, decimals or the renderer's value branch.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] **T-003** Route the finite-numeric branch through the shared formatters, after the bar and
  ring returns. Evidence: eleven added lines in `src/views/card-field-renderer.ts`.
- [ ] **T-004** Create `src/data/euro-format.test.ts` covering all three exports: a grouped value, a
  decimal value, a non-finite value.
- [ ] **T-005** Add the card-versus-cell parity check to `tools/storybook/verify-placement.mjs`.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] **T-006** Observe the parity check red with T-003 reverted, then restore. A check never seen
  red is not evidence.
- [ ] **T-007** Re-run `010-sheet-reading-and-keyboard`'s phone criteria; a longer formatted string
  can move a text rectangle its thresholds measure.
- [ ] **T-008** Take the scope-exclusion question in `spec.md` §7 to the operator.
- [ ] **T-009** Ask the operator to confirm on device that the sheet's figures match the table's.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

Closes when T-004 through T-009 are done. The landed renderer change is one of nine tasks and closes
nothing on its own.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) — the report, and the scope conflict it crosses
- [`acceptance-criteria.md`](acceptance-criteria.md) — six criteria, all unmet
- [`../roadmap.md`](../roadmap.md) — the traceability table this phase answers a row of
<!-- /ANCHOR:cross-refs -->
