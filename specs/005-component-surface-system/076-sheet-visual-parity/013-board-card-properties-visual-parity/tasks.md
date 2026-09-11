---
title: "Tasks: Phase 13: Board Card Properties Sheet Visual Parity"
description: "The six-step loop as ordered tasks. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 13 tasks"
  - "013 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 13: Board Card Properties Sheet Visual Parity

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

Thirteen tasks, each sized for one Sonnet leg and stating a number to record, not a judgement to make.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: DEFINE — the reference and the target table

- [ ] T001 Read `record-surface/property-row.ts` and `board-card-properties-panel.ts` and confirm whether `buildCheckboxPropertyRow` is shared between this panel, `002`'s column manager and the board-groups panel; record the finding in `spec.md` §13 (`src/views/record-surface/property-row.ts`, `src/views/board-card-properties-panel.ts`, `spec.md`)
- [ ] T002 Open the Notion, Anytype and ClickUp references named in `spec.md` §13 and fill the Ours/Target/Source columns; record any cell that cannot be read as `TBD — needs operator capture` (`screenshots/notion/ios/database/**`, `screenshots/clickup/ios/views/**`, `spec.md`)
- [ ] T003 Confirm the existing `constructed-board-card-properties` / `panel-board-card-properties` captures mount the production path; no scenario work is owed unless this finds a gap (`tools/screenshots/constructed-scenarios.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: PLAN — files, scenario, mount function, clauses

- [ ] T004 Write one lane clause per measurable §13 row into `tools/live/sheet-grammar.mjs`, unwired, and confirm each can fail before it is asked to pass (`tools/live/sheet-grammar.mjs`)
- [ ] T005 Acquire the css-lane triplet for `styles.css`; confirm no other child holds it (`tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T006 Run every new clause RED and record the failing numbers (`tools/live/sheet-grammar.mjs`)
- [ ] T007 Remove any card-container styling and apply the frame-ruling divider grammar; align row anatomy per §13's Target column (`src/views/board-card-properties-panel.ts`, `styles.css`)
- [ ] T008 Run every clause GREEN and record the numbers beside T006's (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T009 Run `npm run screenshots </dev/null`, record exit status; `npm run screenshots:verify`, record stale count. Open the phone light and dark captures and look at each one; run `board-card-properties-panel.test.ts` and confirm unmodified and green (`screenshots/notion-clone/views/**`, `src/views/board-card-properties-panel.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T010 Gate (a): run every lane clause and record each GREEN number beside T006's RED number (`tools/live/sheet-grammar.mjs`)
- [ ] T011 Gate (b): give a Sonnet or Opus reviewer the phone capture and the DEFINE table's chosen references; score the eight-row rubric from `../spec.md` §5 into `verification.md`. Pass is ≥ 14/16 with no row at 0. Gate (c): record the operator's device row in `acceptance-criteria.md` as Unmet — no agent ticks it (`verification.md`, `acceptance-criteria.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase F: REMEDIATE — iterate until two clean passes

- [ ] T012 For every rubric row scoring below 2, open a remediation cycle: RED, fix, GREEN, recapture, re-judge. The child is not done until the judge passes twice in a row on an unchanged tree. Three consecutive fails on one row re-opens DEFINE (`verification.md`, `spec.md`)
- [ ] T013 Close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status. Release the css-lane triplet. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, append a dated entry to `../../handover.md` (`recent_action` ≤ 96 characters) (`../goal.md`, `../checklist.md`, `../../handover.md`)
<!-- /ANCHOR:phase-6 -->
