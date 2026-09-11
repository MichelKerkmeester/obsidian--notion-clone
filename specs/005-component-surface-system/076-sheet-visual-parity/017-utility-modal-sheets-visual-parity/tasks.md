---
title: "Tasks: Phase 17: Utility DbModal Sheets Visual Parity"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 17 tasks"
  - "017 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 17: Utility DbModal Sheets Visual Parity

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

Fourteen tasks, each sized for one Sonnet leg and stating a number to record.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Read all 18 producer files listed in `spec.md` §3 and confirm each extends `DbModal` with no bespoke chrome override; record any divergence (`src/views/modals/*.ts`, `src/settings.ts`, `spec.md`)
- [ ] T002 Confirm whether `ChartDrilldownModal` (`archive/deprecated-views/chart/chart-renderer.ts:1009`) is still constructed anywhere live, or is dead code; record the finding and exclude it from the producer edit if archived (`archive/deprecated-views/chart/chart-renderer.ts`, `spec.md`)
- [ ] T003 Confirm `ConfirmModal`/`confirm-sheet.ts` (`009`'s scope) is not the same producer as this child's DbModal subclasses — read both files side by side (`src/views/confirm-sheet.ts`, `src/views/modals/base-import-confirm-modal.ts`, `spec.md`)
- [ ] T004 Read `toast.ts` and `bulk-edit-field-menu.ts` and confirm their current chrome; fill the Ours/Target columns of §13 for all rows, recording every reference cell as `none` per the audit (`src/views/toast.ts`, `src/views/bulk-edit-field-menu.ts`, `spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T005 Write one lane clause per measurable §13 row into `tools/live/sheet-grammar.mjs`, unwired, targeting the shared base chrome (`tools/live/sheet-grammar.mjs`)
- [ ] T006 Acquire the css-lane triplet for `styles.css`; confirm no other child holds it (`tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T007 Run every new clause RED and record the failing numbers (`tools/live/sheet-grammar.mjs`)
- [ ] T008 Apply the frame-ruling divider grammar to `DbModal`'s shared base chrome once, plus `toast.ts` and `bulk-edit-field-menu.ts` individually (`DbModal`'s base file, `src/views/toast.ts`, `src/views/bulk-edit-field-menu.ts`, `styles.css`)
- [ ] T009 Run every clause GREEN across the representative sample and record the numbers beside T007's (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T010 Run `npm run screenshots </dev/null`, record exit status; `npm run screenshots:verify`, record stale count. Open the representative sample's phone captures (import confirm, formula modal, status options), light and dark, and look at each one (`screenshots/notion-clone/views/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T011 Gate (a): run every lane clause and record each GREEN number beside T007's RED number (`tools/live/sheet-grammar.mjs`)
- [ ] T012 Gate (b): score the eight-row rubric on the representative sample into `verification.md`, judged for internal consistency (no external reference exists). Pass is ≥ 14/16 with no row at 0. Gate (c): record the operator's device row in `acceptance-criteria.md` as Unmet (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T013 For every rubric row scoring below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. Three consecutive fails on one row re-opens DEFINE (`verification.md`, `spec.md`)
- [ ] T014 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status. Release the css-lane triplet. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, append a dated entry to `../../handover.md` (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
