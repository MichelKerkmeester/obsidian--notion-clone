---
title: "Tasks: Phase 15: Inline Cell-Editor Popovers Visual Parity"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 15 tasks"
  - "015 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 15: Inline Cell-Editor Popovers Visual Parity

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

Twelve tasks, each sized for one Sonnet leg and stating a number to record.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Read `cell-renderer.ts:601` for both editor kinds and confirm the current popover chrome; cross-check `008`'s property-row target for the same property types to avoid divergence (`src/views/cell-renderer.ts`, `../008-record-sheet-visual-parity/spec.md`)
- [ ] T002 Open the Anytype cell-sheet references and fill the Ours/Target/Source columns structurally; record the form-factor mismatch explicitly rather than resolving it by inference (`screenshots/anytype/mobile/sheets/**`, `spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T003 Confirm each editor kind has a current capture through the production mount path; register any missing scenario before implementation (`tools/screenshots/constructed-scenarios.mjs`)
- [ ] T004 Write one lane clause per measurable §13 row into `tools/live/sheet-grammar.mjs`, unwired (`tools/live/sheet-grammar.mjs`)
- [ ] T005 Acquire the css-lane triplet for `styles.css`; confirm no other child holds it (`tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T006 Run every new clause RED and record the failing numbers (`tools/live/sheet-grammar.mjs`)
- [ ] T007 Remove any card-container styling and apply the frame-ruling grammar at the popover's own scale (`src/views/cell-renderer.ts`, `styles.css`)
- [ ] T008 Run every clause GREEN and record the numbers beside T006's (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T009 Run `npm run screenshots </dev/null`, record exit status; `npm run screenshots:verify`, record stale count. Open both editor kinds' phone captures, light and dark, and look at each one (`screenshots/notion-clone/views/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T010 Gate (a): run every lane clause and record each GREEN number beside T006's RED number (`tools/live/sheet-grammar.mjs`)
- [ ] T011 Gate (b): score the eight-row rubric into `verification.md`. Pass is ≥ 14/16 with no row at 0. Gate (c): record the operator's device row in `acceptance-criteria.md` as Unmet (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T012 For every rubric row scoring below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. Close out with `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate`, release the css-lane triplet, validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, append a dated entry to `../../handover.md` (`verification.md`, `../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
