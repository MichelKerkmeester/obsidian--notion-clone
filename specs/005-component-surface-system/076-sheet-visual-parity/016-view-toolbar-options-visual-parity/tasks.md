---
title: "Tasks: Phase 16: View-Specific Toolbar Option Popovers Visual Parity"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 16 tasks"
  - "016 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 16: View-Specific Toolbar Option Popovers Visual Parity

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

- [ ] T001 Read all four view-toolbar renderers and confirm whether they share one popover-chrome primitive; record the finding in `spec.md` §13 (`src/views/calendar-toolbar-renderer.ts`, `calendar-timeline-toolbar-renderer.ts`, `chart-toolbar-renderer.ts`, `calendar-mini-calendar-renderer.ts`, `spec.md`)
- [ ] T002 Open the Notion and Anytype calendar references and fill the anchor surface's Ours/Target/Source columns structurally (`screenshots/notion/ios/database/**`, `screenshots/anytype/desktop/menus/**`, `spec.md`)
- [ ] T003 Record explicitly, per the coverage audit, that timeline-toolbar-options, chart-toolbar-options and their stacked dropdowns carry no reference of any kind; do not infer a target from the calendar family without marking it internally-derived (`spec.md`)
- [ ] T004 Re-read the timeline event menu's actual chrome and confirm whether it belongs here or with `009`'s owned-menu family; record the decision (`src/views/calendar-timeline-toolbar-renderer.ts`, `../009-menu-and-confirm-visual-parity/spec.md`, `spec.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T005 Write one lane clause per measurable §13 row into `tools/live/sheet-grammar.mjs`, unwired, across all four toolbars (`tools/live/sheet-grammar.mjs`)
- [ ] T006 Acquire the css-lane triplet for `styles.css`; confirm no other child holds it (`tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T007 Run every new clause RED and record the failing numbers (`tools/live/sheet-grammar.mjs`)
- [ ] T008 Apply the frame-ruling divider grammar to the shared popover chrome across all four toolbars (`src/views/calendar-toolbar-renderer.ts`, `calendar-timeline-toolbar-renderer.ts`, `chart-toolbar-renderer.ts`, `calendar-mini-calendar-renderer.ts`, `styles.css`)
- [ ] T009 Run every clause GREEN and record the numbers beside T007's (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T010 Run `npm run screenshots </dev/null`, record exit status; `npm run screenshots:verify`, record stale count. Open all four toolbars' phone captures, light and dark, and look at each one (`screenshots/notion-clone/views/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T011 Gate (a): run every lane clause and record each GREEN number beside T007's RED number (`tools/live/sheet-grammar.mjs`)
- [ ] T012 Gate (b): score the eight-row rubric on the mini-calendar/calendar anchor surface into `verification.md`; check the other three toolbars for internal consistency and note any divergence. Pass is ≥ 14/16 with no row at 0. Gate (c): record the operator's device row in `acceptance-criteria.md` as Unmet (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T013 For every rubric row scoring below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. Three consecutive fails on one row re-opens DEFINE (`verification.md`, `spec.md`)
- [ ] T014 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status. Release the css-lane triplet. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, append a dated entry to `../../handover.md` (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
