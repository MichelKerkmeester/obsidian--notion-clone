---
title: "Tasks: Phase 19: Board Card Drag Feel (ClickUp)"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 19 tasks"
  - "019 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 19: Board Card Drag Feel (ClickUp)

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

Thirteen tasks, each sized for one Sonnet leg and stating a number to record.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Open `clickup-board-card-drag-reference.png` and read `069`'s current drag handlers in `board-renderer.ts`; confirm the gap against §13's reading (`scratchpad/operator-references/clickup-board-card-drag-reference.png`, `src/views/board-renderer.ts`, `spec.md`)
- [ ] T002 Confirm whether Obsidian's mobile WebView exposes a haptics API; record the finding and drop REQ-009 with a reason if unavailable, rather than stubbing it (`spec.md`)
- [ ] T003 Confirm `069`'s existing lane clauses (move + persist, pointercancel) and their current baseline numbers, to be re-run unchanged after this child's producer edit (`tools/live/board-touch-drag.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T004 Design the DOM-state checkpoint mechanism (ghost mounted, mid-move, over-target) in `board-touch-drag.mjs`'s scripted drag, unwired to a capture yet, and confirm each checkpoint can be reached deterministically without a wall-clock sleep (`tools/live/board-touch-drag.mjs`)
- [ ] T005 Write one lane clause per measurable §13 row (ghost anatomy, placeholder, target highlight, auto-scroll, lift delay) into `board-touch-drag.mjs`, unwired; acquire the css-lane triplet and confirm `018` has released it (`tools/live/board-touch-drag.mjs`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T006 Run every new clause RED and record the failing numbers, alongside `069`'s existing clauses re-run as a baseline (`tools/live/board-touch-drag.mjs`)
- [ ] T007 Implement the ghost (compact anatomy, rotation, shadow), source placeholder, target-column highlight with neighbour dim, edge auto-scroll, lift delay and drop animation (`src/views/board-renderer.ts`, `styles.css`)
- [ ] T008 Run every new clause GREEN and confirm `069`'s clauses still pass unchanged in the same run (`tools/live/board-touch-drag.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T009 Run the scripted drag to its mid-drag checkpoint and capture, light and dark; run `npm run screenshots:verify` and record the stale count. Open both captures and look at each one against the ClickUp reference (`screenshots/notion-clone/views/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T010 Gate (a): run every lane clause and record each GREEN number beside T006's RED number, including `069`'s unchanged clauses (`tools/live/board-touch-drag.mjs`)
- [ ] T011 Gate (b): score the eight-row rubric on the mid-drag capture against the ClickUp reference into `verification.md`. Pass is ≥ 14/16 with no row at 0. Gate (c): record the operator's device row in `acceptance-criteria.md` as Unmet (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T012 For every rubric row scoring below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. Three consecutive fails on one row re-opens DEFINE (`verification.md`, `spec.md`)
- [ ] T013 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status. Release the css-lane triplet. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, append a dated entry to `../../handover.md` (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
